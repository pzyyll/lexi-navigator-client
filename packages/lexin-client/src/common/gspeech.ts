import axios from "axios";

export class GSpeech {
  _config: any;
  constructor(data: any) {
    this._config = data;
  }

  get token(): string {
    return this._config.token;
  }

  get url(): URL {
    return new URL(this._config.url);
  }

  get headers(): any {
    return {
      accept: "*/*",
      Authorization: `Bearer ${this.token}`,
    };
  }

  async textToSpeech(text: string, lang: string): Promise<any> {
    const url = new URL("/api/translate/text-to-speech", this.url);
    // console.log("textToSpeech", url.href, text, lang);
    const response = await axios.get(url.href, {
      headers: this.headers,
      params: {
        text,
        language_code: lang,
      },
      responseType: "stream",
    });
    return response.data;
  }
}
