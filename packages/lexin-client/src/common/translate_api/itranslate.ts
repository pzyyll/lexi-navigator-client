export class Language {
  code: string;
  name: string;
  constructor(code: string, name = "") {
    this.code = code;
    this.name = name;
  }
}

export class TranslateResult {
  text: string;
  detected_lang_code: string;
  constructor(text: string, detected_lang_code: string) {
    this.text = text;
    this.detected_lang_code = detected_lang_code;
  }
}

export interface ITranslate {
  init(data: any): void;
  translate(text: string, source?: string, target?: string, ...props: any[]): Promise<TranslateResult>;
  batch_translate(texts: string[], source?: string, target?: string, ...props: any[]): Promise<TranslateResult[]>;
  languages(displayLang?: string, cached?: boolean): Promise<Language[]>;
  detect(text: string): Promise<Language>;
}
