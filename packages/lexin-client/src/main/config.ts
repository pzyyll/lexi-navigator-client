import { app } from "electron";
import fs from "fs";
import level from "level";

const configPath = app.getPath("userData") + "/api_config.json";
const dbPath = app.getPath("userData") + "/config.db";

const configdb = new level.Level(dbPath, { valueEncoding: "json" });

interface LexinSvrConfig {
  url: string;
  token: string;
}

interface Config {
  translate: any;
  speech: any;
  lexinsvr: LexinSvrConfig;
}


let config: Config = null;


function loadConfig() {
  // Load the configuration from the main process
  if (config) {
    return;
  }
  const jsonString = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(jsonString);
  if (!config) {
    config = { translate: {}, speech: {} };
    console.error("Failed to load config");
  }
}

loadConfig();

export function get_translate_config() {
  return config.translate;
}

export function get_speech_config() {
  return config.speech;
}

export function get_lexinsvr_config() : LexinSvrConfig {
  return config.lexinsvr;
}

export async function get_db(key) {
  return new Promise((resolve, reject) => {
    configdb.get(key, (err, value) => {
      if (err) {
        reject(err);
      }
      console.log("get_db", key, value);
      resolve(value);
    });
  });
}

export async function set_db(key, value) {
  return new Promise((resolve, reject) => {
    configdb.put(key, value, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

export async function del_db(key) {
  return new Promise((resolve, reject) => {
    configdb.del(key, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}
