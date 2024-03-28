import { get_lexinsvr_config } from "./config";
import axios from "axios";
import { URL } from "url";
import { ipcMain } from "electron";
import { Channel } from "@src/common/const";
import { get_screen_shot } from "./screenshot";

const config = get_lexinsvr_config();
const url = new URL(config.url);
const headers = {
  accept: "application/json",
  Authorization: `Bearer ${config.token}`,
};

export async function imgToText(imgBuffer: Buffer) {
  const formData = new FormData();
  formData.append("file", new Blob([imgBuffer], { type: "image/png" }), "img.png");
  const reqUrl = new URL("/api/translate/img-to-text", url);
  const response = await axios.post(reqUrl.href, formData, {
    headers: {
      ...headers,
      "Content-Type": "multipart/form-data",
    },
  });
  console.log("imgToText", response.data.detected_text);
  return response.data.detected_text;
}

export function init() {
  ipcMain.handle(Channel.IMG_TO_TEXT, async (event, imgbuf: Buffer) => {
    try {
      return await imgToText(imgbuf);
    } catch (error) {
      console.error("imgToText", error);
      return "";
    }
  });
}

export function clear() {
  ipcMain.removeHandler(Channel.IMG_TO_TEXT);
}
