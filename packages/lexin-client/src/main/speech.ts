import { GSpeech } from "@src/common/gspeech";
import { get_speech_config } from "./config";
import { ipcMain } from "electron";
import os from "os";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto";

const gspeech_api = new GSpeech(get_speech_config());

const tempFilePath = os.tmpdir();
const cache = new Map<string, string>();

async function hasht(text: string, lang: string) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        hash.update(`${text}${lang}`);
        resolve(hash.digest("hex"));
    });
}

export function initSpeech() {
  ipcMain.handle("speech", async (event, arg) => {
    const { text, lang } = arg;
    const cache_key = `${text}-${lang}`;
    let file_name = cache.get(cache_key);
    if (!file_name) {
      const cnt = await hasht(text, lang);
      file_name = `${cnt}.mp3`;
    }
    const file_path = path.join(tempFilePath, file_name);
    console.log("file_path", file_path);
    if (!(await fs.pathExists(file_path))) {
      let data;
      try {
        data = await gspeech_api.textToSpeech(text, lang);
      } catch (error) {
        console.error("textToSpeech error", error);
        return "";
      }

      // console.log("data", data);
      await new Promise((resolve, reject) => {
        try {
          const writeStream = fs.createWriteStream(file_path);
          data.pipe(writeStream);

          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        } catch (error) {
          reject(error);
        }
      });
    }
    cache.set(cache_key, file_name);
    const audioData = await fs.readFile(file_path, "base64");
    const audio = `data:audio/mpeg;base64,${audioData}`;
    // console.log("audio", audio);
    return audio;
  });
}

export function clear() {
  ipcMain.removeHandler("speech");
}
