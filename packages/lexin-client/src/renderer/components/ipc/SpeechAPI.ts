import { Channel } from "@src/common/const";

export async function textToSpeech(text: string, lang: string): Promise<any> {
  const blob = await window.electronAPI.invoke(Channel.TextToSpeech, { text, lang });
  return blob;
}
