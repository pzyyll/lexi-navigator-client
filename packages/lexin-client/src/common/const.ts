
export enum Channel {
    GetConfig = "get-config",
    CloseFloatWin = "close-float-win",
    PinFloatWin = "pin-float-win",
    TranslateText = "translate-text",
    GetPinStatus = "get-pin-status",
    OnFloatWinHide = "on-float-win-hide",

    Translate = "translate",
    LanguageList = "language-list",
    GetAllTranslateApi = "get-all-translate-api",
    DetectLanguage = "detect-language",

    TextToSpeech = "speech",

    ScreenShot = "screenShot",
    ScreenShotEnd = "screenShotEnd",
    CloseScreenShot = "closeScreenShot",

    SetApiType = "set-api-type",
    GetApiType = "get-api-type",

    IMG_TO_TEXT = "img-to-text",
    ShowFloatWin = "show-float-win",
}

export enum TranslateReqType {
    Translate = "translate"
}

export enum TranslateType {
    DeepL = "deepl",
    Google = "google",
    Lexin = "lexin",
    Baidu = "baidu",
}

