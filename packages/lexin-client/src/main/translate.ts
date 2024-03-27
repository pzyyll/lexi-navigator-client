import { app, ipcMain } from "electron";

import {
  Translate,
  TranslateDeepL,
  TranslateBuidu,
  TranslateLexin,
} from "@src/common/translate_api/index";
import { TranslateType, Channel } from "@src/common/const";
import { get_translate_config } from "./config";

let config = get_translate_config();
let translates = new Map();

interface TranslateWrapperProps {
  type: TranslateType;
}

class TranslateWrapper {
  _translate: Translate;
  _props: TranslateWrapperProps;

  constructor(translate: Translate, props: TranslateWrapperProps & { class_type: any }) {
    this._translate = translate;
    const { class_type, ..._props } = props;
    this._props = _props;
  }

  get translate() {
    return this._translate;
  }

  get show_info() {
    return this._props;
  }
}

const translate_api_info = {
  [TranslateType.DeepL]: {
    class_type: TranslateDeepL,
  },
  [TranslateType.Baidu]: {
    class_type: TranslateBuidu,
  },
  [TranslateType.Lexin]: {
    class_type: TranslateLexin,
  },
};

function initTranslateInstance() {
  for (const [type, cfg] of Object.entries(config)) {
    if (type in translate_api_info) {
      const translate = new TranslateWrapper(new translate_api_info[type].class_type(), {
        type: type,
        ...translate_api_info[type],
      });
      translate.translate.init(cfg);
      translates.set(type, translate);
    }
  }
}

async function eventOnTranslate(event, arg) {
  const { text, source, target, api_type } = arg;
  const translate = translates.get(api_type);
  if (translate) {
    const result = await translate.translate.translate(text, source, target);
    return result;
  }
}

async function eventOnLanguageList(event, arg) {
  const { api_type, displayName } = arg;
  const translate = translates.get(api_type);
  if (translate) {
    console.log("eventOnLanguageList", api_type);
    const result = await translate.translate.languages(displayName);
    return result;
  }
}

async function eventOnGetAllTranslateApi(event, arg) {
  return Array.from(translates.values()).map((t) => t.show_info);
}

async function eventOnDetectLanguage(event, arg) {
  const { text, api_type } = arg;
  const translate = translates.get(api_type);
  if (translate) {
    const result = await translate.translate.detect(text);
    return result;
  }
}

function initEventListeners() {
  ipcMain.handle(Channel.Translate, eventOnTranslate);
  ipcMain.handle(Channel.LanguageList, eventOnLanguageList);
  ipcMain.handle(Channel.GetAllTranslateApi, eventOnGetAllTranslateApi);
  ipcMain.handle(Channel.DetectLanguage, eventOnDetectLanguage);
}

function clearEventListeners() {
  ipcMain.removeHandler(Channel.Translate);
  ipcMain.removeHandler(Channel.LanguageList);
  ipcMain.removeHandler(Channel.GetAllTranslateApi);
  ipcMain.removeHandler(Channel.DetectLanguage);
}

export function initTanslateModule() {
  try {
    initTranslateInstance();
    initEventListeners();
  } catch (error) {
    console.error("Error loading JSON file:", error);
  }
}

export function clear() {
  clearEventListeners();
}
