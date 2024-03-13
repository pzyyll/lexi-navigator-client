import { app, ipcMain } from "electron";
import fs from "fs";

import { Translate, TranslateDeepL } from "@src/common/translate_api/index";
import { TranslateType, Channel } from "@src/common/const";

const configPath = app.getPath("userData") + "/api_config.json";

let config;
let translates = new Map();

function loadConfig() {
  // Load the configuration from the main process
  if (config) {
    return;
  }
  const jsonString = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(jsonString);
}

class TranslateWrapper {
  _translate: Translate;
  _icon: string;
  _type: TranslateType;

  constructor(translate: Translate, type: TranslateType, icon: string) {
    this._translate = translate;
    this._type = type;
    this._icon = icon;
  }

  get translate() {
    return this._translate;
  }

  get show_info() {
    return {
      icon: this._icon,
      type: this._type,
    };
  }
}

const translate_api_info = {
  [TranslateType.DeepL]: {
    icon: "deepl-logo.png",
    translate_type: TranslateDeepL,
  },
};

function initTranslateInstance() {
  for (const [type, cfg] of Object.entries(config)) {
    if (type in translate_api_info) {
      const translate = new TranslateWrapper(
        new translate_api_info[type].translate_type(),
        type,
        translate_api_info[type].icon
      );
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
}

export function initTanslateModule() {
  try {
    loadConfig();
    initTranslateInstance();
    initEventListeners();
  } catch (error) {
    console.error("Error loading JSON file:", error);
  }
}

export function clear() {
  clearEventListeners();
}
