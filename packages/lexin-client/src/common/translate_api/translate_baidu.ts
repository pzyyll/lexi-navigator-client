import axios from "axios";
import { LRUCache } from "lru-cache";
import { app } from "electron";
import path from "path";
import fs from "fs-extra"

import { ITranslate, TranslateResult, Language } from "./itranslate";


import crypto from "crypto";

const cld = require("cld");

enum ReqType {
  Translate = "api/trans/vip/translate",
  Detect = "api/trans/vip/language"
}

export class TranslateBuidu implements ITranslate {
  _config: any;
  _cacheSupportedLanguages: any;
  _cacheLastTranslate: any;
  _translateURL?: string;
  _detectURL?: string;

  constructor() {
    this._config = {};
    this._cacheSupportedLanguages = {};
    this._cacheLastTranslate = new LRUCache({
      max: 100,
    });
  }

  get translateURL() {
    if (!this._translateURL) {
      const url = new URL(ReqType.Translate, this.baseUrl);
      this._translateURL = url.href;
    }
    return this._translateURL;
  }

  get detectURL() {
    if (!this._detectURL) {
      const url = new URL(ReqType.Detect, this.baseUrl);
      this._detectURL = url.href;
    }
    return this._detectURL;
  }

  get baseUrl() {
    return new URL(this._config["url"]);
  }

  get key() {
    return this._config["key"];
  }

  get appid() {
    return this._config["appid"];
  }

  get headers() {
    return {
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  get timeout() {
    return 1000 * 10;
  }

  _make_sign(text: string, salt: string) {
    return crypto.createHash("md5").update(`${this.appid}${text}${salt}${this.key}`).digest("hex");
  }

  _random_salt() {
    return (Math.floor(Math.random() * 10000000000) + 100).toString();
  }

  init(data: any): void {
    this._config = data;
  }

  checkNetworkApi() {
    if (!this.baseUrl || !this.key) {
      throw new Error(`No axios network this._config ${this._config}`);
    }
  }

  async localDetect(text: string) {
    // 本地使用cld进行检测，但是对于比较短的文本，检测结果不准确
    try {
      const res = await cld.detect(text);
      let lang = res.languages[0];
      let lang_code = lang.code;
      if (lang_code.toLowerCase().startsWith("zh")) {
        lang_code = "zh";
      }
      return new Language(lang_code, lang.name);
    } catch (error) {
      console.log("cld detect fail: ", error);
    }
  }

  async detect(text: string) {
    const result = await this.localDetect(text);
    if (result) {
      return result;
    }

    this.checkNetworkApi();
    const salt = this._random_salt();
    const options = {
      method: "POST",
      url: this.detectURL,
      headers: this.headers,
      data: {
        q: text,
        appid: this.appid,
        salt: salt,
        sign: this._make_sign(text, salt),
      },
    };
    try {
      const resp = await axios.request(options);
      if (resp.data.error_code) {
        console.log("Baidu api detect error: ", resp.data);
        throw new Error(`${resp.data}`);
      }
      return new Language(resp.data.data.src);
    } catch (error) {
      console.log("Baidu api detect error: ", error);
      throw error;
    }
  }

  async translate(text: string, source?: string, target?: string, ...props: any[]) {
    this.checkNetworkApi();

    try {
      const cachekey = `${text}-${source}-${target}`;
      const cached = this._cacheLastTranslate.get(cachekey);
      if (cached) {
        return cached;
      }

      // target = target || "en";
      if (!source && !target) {
        const source_detect = await this.detect(text);
        if (source_detect.code.startsWith("zh")) {
          target = "en";
        } else {
          target = "zh";
        }
      } else if (!source) {
        source = "auto";
      }

      const salt = this._random_salt();
      const options = {
        method: "POST",
        url: this.translateURL,
        headers: this.headers,
        data: {
          q: text,
          from: source,
          to: target,
          appid: this.appid,
          salt: salt,
          sign: this._make_sign(text, salt),
        },
      };

      const resp = await axios.request(options);
      console.log("Baidu api translate: ", resp.data);
      
      if (resp.data.error_code) {
        throw new Error(`${resp.data}`);
      }

      const tr = new TranslateResult(resp.data.trans_result.map((result) => result.dst).join("\n"), resp.data.from);
      this._cacheLastTranslate.set(cachekey, tr);
      return tr
    } catch (error) {
      console.log("Baidu api translate error: ", error);
      throw error;
    }
  }

  async batch_translate(texts: string[], source?: string, target?: string, ...props: any[]) {
    this.checkNetworkApi();
    return Promise.all(texts.map((text) => this.translate(text, source, target, ...props)));
  }

  async languages(displayLang = "en", cached = true) {
    // The garbage baidu api doesn't support getting a list of languages, 
    // and it's also buttoned up and thinned out
    if (cached && this._cacheSupportedLanguages[displayLang]) {
      return this._cacheSupportedLanguages[displayLang];
    }
    
    try {
      const languages_json = path.join(app.getAppPath(), "resources", "data", "baidu_languages.json");
      const data = await fs.readJson(languages_json);

      if (displayLang && displayLang !== "zh") {
        const names = data.map((lang: any) => lang.name);
        const query_text = names.join("\n");
        const query_result = await this.translate(query_text, "zh", displayLang);
        const displayNames = query_result.text.split("\n");
        this._cacheSupportedLanguages[displayLang] = data.map(
          (lang: any, index: number) => new Language(lang.code, displayNames[index])
        );
        return this._cacheSupportedLanguages[displayLang];
      }

      this._cacheSupportedLanguages[displayLang] = data.map(
        (lang: any) => new Language(lang.code, lang.name)
      );
      return this._cacheSupportedLanguages[displayLang];
    } catch (error) {
      console.log("read baidu_languages.json error: ", error);
    }
  }
}
