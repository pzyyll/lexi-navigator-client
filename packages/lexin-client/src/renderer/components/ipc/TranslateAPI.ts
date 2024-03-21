import { Channel, TranslateType } from "@src/common/const";

export interface TranslateProps {
  text: string;
  source?: string;
  target?: string;
  api_type?: string;
}

export async function translate(props: TranslateProps) {
  let {text, source, target, api_type } = props;
  api_type = api_type || TranslateType.DeepL;
  try {
    if (!target) {
      const source_detect_lang = await window.electronAPI.invoke(Channel.DetectLanguage, {
        text: text,
        api_type: api_type,
      });
      const source_detect_lang_code = source_detect_lang.code.toLowerCase();
      if (source_detect_lang_code.startsWith("zh")) {
        target = "en";
      } else {
        target = "zh";
      }
    }
    console.log("translate", text, source, target, api_type);
    const res = await window.electronAPI.invoke(Channel.Translate, {
      text: text,
      source: source,
      target: target,
      api_type: api_type,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
}
