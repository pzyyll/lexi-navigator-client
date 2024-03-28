import { ITranslate, TranslateResult, Language } from "./itranslate";
import axios from "axios";

const cld = require("cld");
export default class TranslateLexin implements ITranslate {
  _config: any;

  get token(): string {
    return this._config.token;
  }

  get url(): URL {
    return new URL(this._config.url);
  }

  get headers(): any {
    return {
      accept: "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  init(data: any): void {
    this._config = data;
  }

  async translate(
    text: string,
    source?: string,
    target?: string,
    ...props: any[]
  ): Promise<TranslateResult> {
    const options = {
      method: "POST",
      url: new URL("/api/translate/text", this.url).href,
      headers: this.headers,
      data: {
        api_type: "google",
        text: text,
        source_language: source || "",
        target_language: target || "",
      },
    };

    const response = await axios.request(options);
    return new TranslateResult(
      response.data.text[0],
      response.data.detected_source_language
    );
  }

  async batch_translate(
    texts: string[],
    source?: string,
    target?: string,
    ...props: any[]
  ): Promise<TranslateResult[]> {
    return texts.map(
      async (text) => await this.translate(text, source, target, ...props)
    );
  }

  async languages(displayLang?: string, cached?: boolean): Promise<any[]> {
    const options = {
      method: "GET",
      url: new URL("/api/translate/languages", this.url).href,
      params: { dlc: "zh", api_type: "google" },
      headers: this.headers
    };

    const response = await axios.request(options);
    return response.data.languages.map(
      (lang) => new Language(lang.language_code, lang.display_name)
    );
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
      return null;
    }
  }

  async detect(text: string): Promise<any> {
    const result = await this.localDetect(text);
    if (result) {
      return result;
    }
    const options = {
      method: "GET",
      url: new URL("/api/translate/detect", this.url).href,
      params: { text, api_type: "google" },
      headers: this.headers
    };
    const response = await axios.request(options);
    console.log("lexin detect", response.data.language_code)
    return new Language(response.data.language_code);
  }
}
