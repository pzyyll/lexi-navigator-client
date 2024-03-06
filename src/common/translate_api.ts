import { Channel, TranslateReqType } from './const';
import axios from 'axios';

let configData: any;

async function loadConfig() {
    await window.electronAPI.async_request(Channel.GetConfig).then((config) => {
        configData = config;
    });
}

async function translate(text: string, source = "", target = "", api_type = "") {
    if (!configData) {
        await loadConfig();
    }
    console.log("translate configData", configData);
    const api_data = configData.api_data;
    const user = api_data.user;
    const token = api_data.api_token;
    const api_url = api_data.url;

    console.log("translate", api_data, user, token, api_url, TranslateReqType.Translate);
    console.log("translate data", text, source, target, api_type)
    
    const baseURL = new URL(api_url);
    const url = new URL(TranslateReqType.Translate, baseURL);
    const res = await axios.post(url.toString(), {
        user: user,
        token: token,
        data: {
            text: text,
            source_lang_code: source,
            target_lang_code: target,
            api_type: api_type
        }
    });
    return res.data;
}

export { translate };