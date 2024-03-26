import { ITranslate } from "./itranslate";
import axios from "axios";

class TranslateLexin implements ITranslate {
  _config: any;

  get token(): string {
    return this._config.token;
  }

  get url(): string {
    return this._config.url;
  }

  get headers(): any {
    return {
      accept: "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  init(data: any): void {
    self._config = data;
  }

  async translate(
    text: string,
    source?: string,
    target?: string,
    ...props: any[]
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async batch_translate(
    texts: string[],
    source?: string,
    target?: string,
    ...props: any[]
  ): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  async languages(displayLang?: string, cached?: boolean): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  async detect(text: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
