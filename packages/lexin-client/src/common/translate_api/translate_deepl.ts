import axios from "axios";
import { LRUCache } from "lru-cache";

import { ITranslate, TranslateResult, Language } from "./itranslate";

const cld = require("cld");

enum DeepLReqTypeV2 {
  Translate = "translate",
  Languages = "languages",
}

export class TranslateDeepL implements ITranslate {
  _config: any;
  _axios?: any;
  _cacheSupportedLanguages: any;
  _cacheLastTranslate: any;

  constructor() {
    this._config = {};
    this._cacheSupportedLanguages = {};
    this._cacheLastTranslate = new LRUCache({
      max: 100,
    });
  }

  init(data: any): void {
    this._config = data;
    if (this._config["url"] && this._config["token"]) {
      this._axios = axios.create({
        baseURL: this._config["url"],
        headers: {
          "Content-Type": "application/json",
          Authorization: `DeepL-Auth-Key ${this._config["token"]}`,
        },
        timeout: 1000*10,
      });
    }
  }

  checkNetworkApi() {
    if (!this._axios) {
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

    // DeepL API V2 不支持检测语言, 但是其翻译结果中会返回检测到的语言，尝试翻译一次获取检测到的语言
    this.checkNetworkApi();
    const res = await this.translate(text, "", "en");
    return new Language(res.detected_lang_code);
  }

  async translate(text: string, source?: string, target?: string, ...props: any[]) {
    const result = await this.batch_translate([text], source, target, ...props);
    return result[0];
  }

  async batch_translate(texts: string[], source?: string, target?: string, ...props: any[]) {
    this.checkNetworkApi();

    target = target || "EN";
    target = target.toUpperCase();

    const cached_result = [];
    const uncached_texts = [];
    for (const text of texts) {
      const key = `${text}-${source}-${target}`;
      const cached = this._cacheLastTranslate.get(key);
      console.log("batch_translate cached", key.substring(0, 10), cached);
      if (cached) {
        cached_result.push(cached);
      } else {
        uncached_texts.push(text);
      }
    }
    if (uncached_texts.length === 0) {
      return cached_result;
    }

    // console.log("batch_translate", uncached_texts, source, target);
    const res = await this._axios.post(DeepLReqTypeV2.Translate, {
      text: uncached_texts,
      target_lang: target,
      ...(source ? { source_lang: source } : {}),
    });

    if (res.status !== 200) {
      throw new Error(`Failed to translate: ${res.statusText}`);
    }

    // console.log("batch_translate res", res.data.translations);

    return res.data.translations.map((transletion: any, index: number) => {
      const tr = new TranslateResult(transletion.text, transletion.detected_source_language);
      const key = `${uncached_texts[index]}-${source}-${target}`;
      this._cacheLastTranslate.set(key, tr);
      return tr;
    });
  }

  async languages(displayLang = "en", cached = true) {
    if (cached && this._cacheSupportedLanguages[displayLang]) {
      return this._cacheSupportedLanguages[displayLang];
    }

    this.checkNetworkApi();

    console.log("get languages", displayLang);
    const res = await this._axios.get(DeepLReqTypeV2.Languages);
    if (res.status !== 200) {
      throw new Error(`Failed to get languages: ${res.statusText}`);
    }

    // console.log("get languages res", res.data);
    if (displayLang && displayLang !== "en") {
      const names = res.data.map((lang: any) => lang.name);
      const displayNames = await this.batch_translate(names, "en", displayLang);
      this._cacheSupportedLanguages[displayLang] = res.data.map(
        (lang: any, index: number) => new Language(lang.language, displayNames[index].text)
      );
      // console.log("get languages res", this._cacheSupportedLanguages[displayLang]);
      return this._cacheSupportedLanguages[displayLang];
    }
    this._cacheSupportedLanguages[displayLang] = res.data.map(
      (lang: any) => new Language(lang.language, lang.name)
    );
    // console.log("get languages res", this._cacheSupportedLanguages[displayLang]);
    return this._cacheSupportedLanguages[displayLang];
  }
}
