import { app } from "electron";
import fs from "fs";

const configPath = app.getPath("userData") + "/api_config.json";

let config;

function loadConfig() {
  // Load the configuration from the main process
  if (config) {
    return;
  }
  const jsonString = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(jsonString);
  console.log("get_translate_config", config);
}

loadConfig();

export function get_translate_config() {
  console.log("get_translate_config", config.translate);
  return config.translate;
}

export function get_speech_config() {
  return config.speech;
}
