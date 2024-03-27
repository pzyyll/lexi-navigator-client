import React from "react";
import { Box } from "@mui/system";
import AppBar from "@mui/material/AppBar";
import { ThemeProvider, styled } from "@mui/material/styles";
import { CssBaseline, Menu, MenuItem, TextField, Toolbar } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import { TextFieldProps, TextareaAutosize } from "@mui/material";
import Popper from "@mui/material/Popper";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PushPinIcon from "@mui/icons-material/PushPin";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  translate,
  detectLanguage,
  TranslateProps,
} from "@src/renderer/components/ipc/TranslateAPI";
import { textToSpeech } from "@src/renderer/components/ipc/SpeechAPI";
import { Channel, TranslateType } from "@src/common/const";
import SvgDeeplLogo from "@icons/DeeplLogo";
import SvgBaiduLogo from "@icons/BaiduLogo";

import Themes from "@themes";
import SvgGoogleTranslateLogo from "../assets/icons/GoogleTranslateLogo";

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, Provider } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import TextSelector from "@components/TextSelector";
// GlobalContextReducer

const globalInitialState = {
  source_text: "",
  target_text: "",
  progress_visible: "hidden",
  pin_status: false,
  api_type: TranslateType.DeepL,
  source_lang: "",
  target_lang: "",
  source_text_expand: 0,
  source_text_show_expand: false,
  source_text_dyn_height: "auto",
};

// redux
const reduxGlobalReducer = (state = globalInitialState, action) => {
  if (!(action.type in globalInitialState)) {
    return state;
  }
  return { ...state, [action.type]: action.payload };
};

const store = configureStore({
  reducer: reduxGlobalReducer,
});

type GlobalState = ReturnType<typeof store.getState>;
type GlobalDispatch = typeof store.dispatch;

const useGlobalStateSelector: TypedUseSelectorHook<GlobalState> = useSelector;
const useGlobalDispatch: () => GlobalDispatch = useDispatch;

function useGlobalStateDispatch(type: keyof GlobalState) {
  const dispatch = useGlobalDispatch();
  return (payload) => dispatch({ type, payload });
}

enum SourceTextExpandActionType {
  AutoOnFocus = 0x01,
  OnSelected = 0x01 << 1,
  ResetALL = AutoOnFocus | OnSelected,
}

function setSourceTextExpandBit(
  action_type: SourceTextExpandActionType,
  expand,
  state,
  setter
) {
  if (expand) {
    setter(state | action_type);
  } else {
    setter(state & ~action_type);
  }
}

// todo add search histroy
const searchHistory = [];
const apis = new Map();

const apiIcons = {
  [TranslateType.DeepL]: () => <SvgDeeplLogo fontSize="small" viewBox="0 0 300 300" />,
  [TranslateType.Baidu]: () => <SvgBaiduLogo fontSize="small" viewBox="0 0 92 92" />,
  default: () => <SvgGoogleTranslateLogo fontSize="small" viewBox="0 0 300 300" />,
};
interface RequestTranslateProps extends TranslateProps {
  updateTarget: (text: string) => void;
  showProgress: (visible: string) => void;
}

const TopAppBar = styled(AppBar)(({ theme }) => ({
  //"-webkit-app-region": "drag",
  WebkitAppRegion: "drag",
  "& button": {
    WebkitAppRegion: "no-drag",
  },
  "& input": {
    WebkitAppRegion: "no-drag",
  },
  "& textarea": {
    WebkitAppRegion: "no-drag",
  },
}));

const SearchBtn = (props) => {
  return (
    <IconButton {...props}>
      <SearchIcon />
    </IconButton>
  );
};

const FadeInOutSearchBtn = styled((props) => {
  const { focus, ...other } = props;
  return <SearchBtn {...other} />;
})(({ theme, focus }) => ({
  transition: `${theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeInOut,
  })}, ${theme.transitions.create("opacity", {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeInOut,
  })}, ${theme.transitions.create("width", {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeInOut,
  })}, ${theme.transitions.create("visibility", {
    duration: theme.transitions.duration.shortest,
    easing: theme.transitions.easing.easeInOut,
  })}`,
  transform: focus ? "translateX(-20px)" : "translateX(0)",
  opacity: focus ? 0 : 1,
  width: focus ? "0px" : theme.customSizes.icon2,
  height: theme.customSizes.icon2,
  padding: 0,
  visibility: focus ? "hidden" : "visible",
}));

const ContentField = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  height: "100%",
  padding: "10px",
  resize: "none",
  border: "none",
  "&:focus": {
    outline: "none",
  },
  backgroundColor: theme.palette.background.default,
  fontSize: theme.customSizes.body2,
  color: theme.palette.primary.fontColor,
}));

const requestTranslate = (props: RequestTranslateProps) => {
  const { text, updateTarget, showProgress, source, target, api_type } = props;
  showProgress && showProgress("visible");
  updateTarget("");
  translate({
    text: text,
    source: source,
    target: target,
    api_type: api_type,
  })
    .then((res) => {
      console.log("requestTranslate", res);
      showProgress && showProgress("hidden");
      updateTarget(res.text);
    })
    .catch((e) => {
      showProgress && showProgress("hidden");
      console.log("requestTranslate error", e);
      updateTarget("网络出小差了😩");
    });
};

const AnimateTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-inputMultiline": {
    overflow: "auto",
  },
  "& .MuiInputBase-root": {
    padding: "0px",
  },
  "& .MuiFilledInput-root": {
    borderRadius: 0,
    padding: "0px",
    "&:before, &:after": {
      borderBottom: "none",
    },
  },
  "& .MuiFilledInput-input": {
    transition: `${theme.transitions.create("width", {
      duration: theme.transitions.duration.standard,
      easing: theme.transitions.easing.easeInOut,
    })}`,
    margin: "0",
    padding: "0",
  },
}));

const StyledTextareaAutosize = styled(TextareaAutosize)(({ theme }) => ({
  overflow: "auto !important",
}));

const CTextArea = React.forwardRef((props, ref) => {
  const _ref = React.useRef(null);
  const [_lineheight, _setlineheight] = React.useState(0);

  console.log("CTextArea _lineheight", _lineheight);

  // 内部使用_ref, 同时保证外部的ref可以被正确引用
  React.useImperativeHandle(ref, () => _ref.current);

  const setShowExpand = useGlobalStateDispatch("source_text_show_expand");
  const isSourceTextExpand = useGlobalStateSelector((state) => state.source_text_expand);
  const source_text = useGlobalStateSelector((state) => state.source_text);

  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);

  const maxheight = windowHeight - 100;

  const { onChange, ...other } = props;

  const moreThanOneLine = () => {
    if (_lineheight == 0) {
      return false;
    }
    console.log("moreThanOneLine", _ref.current.scrollHeight, _lineheight);
    return _ref.current.scrollHeight > _lineheight;
  };

  const checkShowExpand = () => {
    setShowExpand(moreThanOneLine());
  };
  checkShowExpand();

  const _onChange = (e) => {
    onChange && onChange(e);
    checkShowExpand();
  };

  React.useEffect(() => {
    setTimeout(checkShowExpand, 0);
  }, [source_text]);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const checkRef = () => {
      if (_ref.current) {
        console.log("checkRef", _ref.current.clientHeight, _ref.current.scrollHeight);
        _setlineheight(_ref.current.clientHeight);
      } else {
        setTimeout(checkRef, 10);
      }
    };
    checkRef();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getMaxHeight = () => {
    if (_lineheight == 0) {
      return "auto";
    }
    return `${maxheight}px`;
  };

  const getMaxRows = () => {
    if (_lineheight == 0) {
      return 1;
    }
    return isSourceTextExpand ? 500 : 1;
  };

  return (
    <StyledTextareaAutosize
      ref={_ref}
      {...other}
      sx={{
        maxHeight: getMaxHeight(),
      }}
      minRows={1}
      maxRows={getMaxRows()}
      onChange={_onChange}
    />
  );
});

const SearchBar = (props) => {
  const [focus, setFocus] = React.useState(false);
  const sourceText = useGlobalStateSelector((state) => state.source_text);
  const setSourceText = useGlobalStateDispatch("source_text");
  const setTargetText = useGlobalStateDispatch("target_text");
  const setProgressVisible = useGlobalStateDispatch("progress_visible");
  const progressVisible = useGlobalStateSelector((state) => state.progress_visible);
  const api_type = useGlobalStateSelector((state) => state.api_type);
  const source_lang = useGlobalStateSelector((state) => state.source_lang);
  const target_lang = useGlobalStateSelector((state) => state.target_lang);
  const textRef = React.useRef(null);
  const textInputRef = React.useRef(null);
  const textFieldRef = React.useRef(null);
  const show_expand = useGlobalStateSelector((state) => state.source_text_show_expand);
  const sourceTextExpand = useGlobalStateSelector((state) => state.source_text_expand);
  const setSourceTextExpand = useGlobalStateDispatch("source_text_expand");
  const sourceTextDynHeight = useGlobalStateSelector(
    (state) => state.source_text_dyn_height
  );

  const CustomPopper = (props) => {
    return <Popper {...props} />;
  };

  const handleRequestTranslate = (text, source = "", target = "", force = false) => {
    if ((text && text != sourceText) || force) {
      requestTranslate({
        text,
        updateTarget: setTargetText,
        showProgress: setProgressVisible,
        source,
        target,
        api_type,
      });
    } else if (!text) {
      setTargetText("");
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      setSourceText(e.target.value);
    }
  };

  const handleBlur = (e) => {
    setFocus(false);
    setSourceText(e.target.value);
    setSourceTextExpandBit(
      SourceTextExpandActionType.AutoOnFocus,
      false,
      sourceTextExpand,
      setSourceTextExpand
    );
  };

  const handleOnFocus = (e) => {
    setFocus(true);
    setSourceTextExpandBit(
      SourceTextExpandActionType.AutoOnFocus,
      true,
      sourceTextExpand,
      setSourceTextExpand
    );
  };

  const onRecieveTranslateText = (arg) => {
    if (!arg || arg == sourceText) {
      return;
    }
    setSourceText(arg);
  };

  const onWinHide = () => {
    console.log("onWinHide");
    textInputRef.current?.blur();
    setSourceTextExpandBit(
      SourceTextExpandActionType.ResetALL,
      false,
      sourceTextExpand,
      setSourceTextExpand
    );
  };

  React.useEffect(() => {
    window.electronAPI.receive(Channel.TranslateText, onRecieveTranslateText);
    window.electronAPI.receive(Channel.OnFloatWinHide, onWinHide);
    return () => {
      window.electronAPI.removeAll(Channel.TranslateText);
      window.electronAPI.removeAll(Channel.OnFloatWinHide);
    };
  }, []);

  React.useEffect(() => {
    if (sourceText) {
      handleRequestTranslate(sourceText, source_lang, target_lang, true);
    } else {
      setTargetText("");
    }
  }, [target_lang, source_lang, sourceText]);

  return (
    <Box sx={{ width: "100%", height: "auto", display: "flex", flexDirection: "column" }}>
      <Autocomplete
        {...props}
        ref={textRef}
        PopperComponent={CustomPopper}
        sx={{
          flex: 1,
          border: "none",
          height: sourceTextDynHeight,
        }}
        freeSolo
        id="input-translate-text"
        options={searchHistory}
        value={sourceText}
        readOnly={progressVisible == "visible"}
        disableClearable
        renderInput={(params) => {
          const { endAdornment, ...InputProps } = params.InputProps;
          return (
            <AnimateTextField
              hiddenLabel
              {...params}
              sx={{ border: "none", height: "100%" }}
              ref={textFieldRef}
              inputRef={textInputRef}
              InputProps={{
                ...InputProps,
                sx: {
                  height: "100%",
                },
                inputComponent: CTextArea,
                inputProps: {
                  ...params.inputProps,
                },
                startAdornment: (
                  <FadeInOutSearchBtn
                    focus={focus || sourceText.length > 0}
                    size="small"
                  />
                ),
                // endAdornment: (
                //   <IconButton
                //     size="small"
                //     sx={{ padding: 0 }}
                //     hidden={!show_expand}
                //     onClick={() => {
                //       setSourceTextExpand(!sourceTextExpand);
                //     }}
                //   >
                //     {sourceTextExpand ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                //   </IconButton>
                // ),
              }}
              placeholder="Search ..."
              onFocus={handleOnFocus}
              onBlur={handleBlur}
              onKeyDown={handleEnter}
              onChange={(e) => {
                console.log("Auto onChange");
              }}
              multiline
              maxRows={1}
            />
          );
        }}
      />
      <IconButton
        size="small"
        disableRipple
        sx={{
          padding: 0,
          height: "10px",
        }}
        hidden={!show_expand}
        onClick={() => {
          if (sourceTextExpand) {
            setSourceTextExpandBit(
              SourceTextExpandActionType.ResetALL,
              false,
              sourceTextExpand,
              setSourceTextExpand
            );
          } else {
            setSourceTextExpandBit(
              SourceTextExpandActionType.OnSelected,
              true,
              sourceTextExpand,
              setSourceTextExpand
            );
          }
        }}
      >
        {sourceTextExpand ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </IconButton>
    </Box>
  );
};

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: "fixed",
  "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const Tips = {
  CopySuccess: "Copied to clipboard",
};

const MoreButton = (props) => {
  const [open, setOpen] = React.useState(false);
  const targetText = useGlobalStateSelector((state) => state.target_text);
  const targetLang = useGlobalStateSelector((state) => state.target_lang);
  const api_type = useGlobalStateSelector((state) => state.api_type);
  const sourceText = useGlobalStateSelector((state) => state.source_text);
  const sourceLang = useGlobalStateSelector((state) => state.source_lang);
  const setProgressVisible = useGlobalStateDispatch("progress_visible");
  const setTargetText = useGlobalStateDispatch("target_text");
  const [tips, setTips] = React.useState("");
  const [tipsOpen, setTipsOpen] = React.useState(false);
  const [audio] = React.useState(new Audio());

  const handleOpen = () => {
    console.log("handleOpen handleOpen");
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  let tipsTimeOut = null;
  const showTips = (tips) => {
    setTips(tips);
    setTipsOpen(true);
    clearTimeout(tipsTimeOut);
    tipsTimeOut = setTimeout(() => {
      setTipsOpen(false);
    }, 800);
  };

  const handleCopy = async () => {
    console.log("handleCopy handleCopy", targetText);
    if (!targetText) {
      showTips("No text to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(targetText);
      showTips(Tips.CopySuccess);
    } catch (e) {
      showTips(`handleCopy error $(e)`);
    }
  };

  const handleOCR = async () => {
    console.log("handleOCR handleOCR");
    window.electronAPI.send(Channel.ScreenShot);
  };

  const handleSpeech = async () => {
    console.log("handleSpeech handleSpeech");
    const selectedText = window.getSelection()?.toString();
    console.log("selectedText", selectedText);
    if (!selectedText && !targetText) {
      showTips("No text selected to speech");
      return;
    }
    let lang = "";
    const text = selectedText || targetText;
    if (selectedText || !targetLang) {
      const result = await detectLanguage(text, api_type);
      lang = result.code.toLowerCase();
    } else {
      lang = targetLang;
    }

    setProgressVisible("visible");
    const results = await textToSpeech(text, lang);
    setProgressVisible("hidden");
    audio.pause();
    audio.src = results;
    audio.volume = 1;
    audio.play();
  };

  const handleRefresh = async () => {
    requestTranslate(
      {
        text: sourceText,
        updateTarget: setTargetText,
        showProgress: setProgressVisible,
        source: sourceLang,
        target: targetLang,
        api_type: api_type,
      }
    )
  }

  const actions = [
    { icon: <ContentCopyIcon />, name: "Copy", onclick: handleCopy },
    { icon: <CenterFocusStrongIcon />, name: "OCR", onclick: handleOCR },
    { icon: <VolumeUpIcon />, name: "Speech", onclick: handleSpeech },
    { icon: <RefreshIcon />, name: "Refresh", onclick: handleRefresh },
  ];

  return (
    <Box sx={{ width: "40px", height: "40px" }}>
      <Tooltip title={tips} placement="top-end" open={tipsOpen}>
        <StyledSpeedDial
          {...props}
          icon={<AutoFixHighIcon />}
          ariaLabel="More actions"
          // FabProps={{size: "small"}}
          onOpen={handleOpen}
          onClose={handleClose}
          open={open}
        >
          {actions.map((action) => (
            <SpeedDialAction
              FabProps={{
                size: "small",
                sx: { ...action.sx },
              }}
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={async () => {
                if (action.onclick) {
                  await action.onclick();
                }
                setOpen(false);
              }}
            />
          ))}
        </StyledSpeedDial>
      </Tooltip>
    </Box>
  );
};

const TranslateApiMenu = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { apis, api_type, setApiType } = props.apis;
  const open = Boolean(anchorEl);
  const onClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const onMenuClose = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    window.electronAPI?.invoke(Channel.GetApiType).then((res) => {
      console.log("GetApiType a", res);
      if (res) setApiType(res);
    });
  }, [])

  return (
    <Box>
      <IconButton
        onClick={onClick}
        size="small"
        aria-label="menu"
        aria-controls="translate-api-menu"
        aria-haspopup="true"
      >
        {(apiIcons[api_type] || apiIcons["default"])()}
      </IconButton>
      <Menu
        id="translate-api-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={onMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {apis &&
          apis.size > 0 &&
          Array.from(apis).map(([key, value]) => {
            // const Icon = await import(value.icon);
            const Icon = apiIcons[key] || apiIcons["default"];
            return (
              <MenuItem
                key={key}
                onClick={(e) => {
                  console.log("MenuItem", key);
                  onMenuClose();
                  setApiType(key);
                  window.electronAPI?.send(Channel.SetApiType, key);
                  value.onClick && value.onClick(e);
                }}
              >
                <Icon />
              </MenuItem>
            );
          })}
        {/* <MenuItem onClick={onMenuClose}>De</MenuItem>
        <MenuItem onClick={onMenuClose}>Ba</MenuItem> */}
      </Menu>
    </Box>
  );
};

const LanguageList = React.memo((props) => {
  const { set_lang, lang, ...tfprops } = props;

  const default_option = tfprops.options.find((o) => o.code == lang) || {
    name: "Auto",
    code: "",
  };

  const [selectOption, setSelectOption] = React.useState(default_option);

  React.useEffect(() => {
    setSelectOption(default_option);
  }, [lang]);

  const TextF = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-root": {
      padding: "0px",
      paddingLeft: "0px",
    },
    "& .MuiFilledInput-root": {
      borderRadius: 0,
      padding: "0px",
      margin: "0px",
      "&:before, &:after": {
        borderBottom: "none",
      },
    },
    "& .MuiFilledInput-input": {
      margin: "0px",
      padding: "0px",
      fontSize: "10px",
    },
  }));

  const getOptionLabel = (option) => {
    if (option.name == "Auto") {
      return option.name;
    }
    return `${option.name}(${option.code})`;
  };

  const filter = createFilterOptions<string>({
    matchFrom: "any",
    stringify: getOptionLabel,
  });

  const onChange = (e, newOption) => {
    // console.log("LanguageList onChange", newOption);
    setSelectOption(newOption);
    set_lang && set_lang(newOption.code);
  };
  return (
    <Autocomplete
      {...tfprops}
      sx={{
        width: "100%",
        minWidth: "90px",
        maxWidth: "200px",
      }}
      // disableCloseOnSelect
      // value={last_option}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      value={selectOption}
      getOptionLabel={getOptionLabel}
      filterOptions={filter}
      onChange={onChange}
      disableClearable
      ListboxProps={{
        sx: {
          border: "none",
          borderRadius: 0,
          fontSize: "10px",
          "& .MuiAutocomplete-option": {
            minHeight: "auto",
          },
        },
      }}
      renderInput={(params) => {
        // const { InputProps, ...rest } = params;
        // const { endAdornment, ...inputProps } = InputProps;
        // const p = { ...rest, InputProps: { ...inputProps } };
        return (
          <TextF {...params} hiddenLabel size="small" variant="filled" margin="none" />
        );
      }}
      renderOption={(props, option) => {
        return (
          <Box
            component="li"
            {...props}
            sx={{ padding: "0px", cursor: "pointer", margin: "0px" }}
          >
            {getOptionLabel(option)}
          </Box>
        );
      }}
    />
  );
});

const LanguageListComp = (props) => {
  const api_type = useGlobalStateSelector((state) => state.api_type);
  const setApiType = useGlobalStateDispatch("api_type");
  const [langs, setLangs] = React.useState([]);

  const source_lang = useGlobalStateSelector((state) => state.source_lang);
  const target_lang = useGlobalStateSelector((state) => state.target_lang);

  const set_source_lang = useGlobalStateDispatch("source_lang");
  const set_target_lang = useGlobalStateDispatch("target_lang");

  const set_source_text = useGlobalStateDispatch("source_text");
  const set_target_text = useGlobalStateDispatch("target_text");

  const source_text = useGlobalStateSelector((state) => state.source_text);
  const target_text = useGlobalStateSelector((state) => state.target_text);

  const refreshLangs = () => {
    window.electronAPI
      .invoke(Channel.LanguageList, { api_type: api_type, displayName: "zh" })
      .then((res) => {
        console.log("LanguageList", res);
        res.push({ name: "Auto", code: "" });
        setLangs(res);
      })
      .catch((e) => {
        console.log("LanguageList error", e);
      });
  };

  React.useEffect(() => {
    refreshLangs();

    window.electronAPI.invoke(Channel.GetAllTranslateApi).then((res) => {
      apis.clear();
      res.map((api) => {
        apis.set(api.type, api);
      });
      console.log("GetAllTranslateApi", apis);
    });
  }, []);

  React.useEffect(() => {
    // console.log("FooterToolBar api_type", api_type);
    const _old_source_lang = source_lang;
    const _old_target_lang = target_lang;
    set_source_lang("");
    set_target_lang("");
    refreshLangs();
  }, [api_type]);

  const onClickSwap = () => {
    console.log("onClickSwap", source_lang, target_lang);
    set_source_lang(target_lang);
    set_target_lang(source_lang);

    set_source_text(target_text);
    set_target_text(source_text);
  };

  return (
    <>
      <TranslateApiMenu apis={{ apis, api_type, setApiType }} />
      <Divider
        sx={{ height: 28, m: 0.5, border: "0.5px solid #000000" }}
        orientation="vertical"
      />
      <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <Box flexGrow={2} sx={{ display: "flex", flexDirection: "row" }}>
          <LanguageList options={langs} set_lang={set_source_lang} lang={source_lang} />
          <IconButton size="small" onClick={onClickSwap}>
            <SwapHorizIcon />
          </IconButton>
          <LanguageList options={langs} set_lang={set_target_lang} lang={target_lang} />
        </Box>
        <Box flexGrow={1}></Box>
      </Box>
    </>
  );
};

const FooterToolBar = (props) => {
  console.trace("FooterToolBar");

  const AppFooterBar = styled(AppBar)(({ theme }) => ({
    WebkitAppRegion: "drag",
    "& button": {
      WebkitAppRegion: "no-drag",
    },
    "& input": {
      WebkitAppRegion: "no-drag",
    },
    height: "30px",
    padding: "0px",
  }));

  return (
    <AppFooterBar position="sticky" sx={{ top: "auto", bottom: 0 }}>
      <Toolbar sx={{ width: "100%", height: "100%", bottom: 0, position: "absolute" }}>
        <LanguageListComp />
        <MoreButton direction="up" />
      </Toolbar>
    </AppFooterBar>
  );
};

const CloseBtn = (props) => {
  const [isPin, setIsPin] = React.useState(false);

  const handlePin = () => {
    window.electronAPI.send(Channel.PinFloatWin, !isPin);
    setIsPin(!isPin);
  };

  React.useEffect(() => {
    window.electronAPI.invoke(Channel.GetPinStatus).then((res) => {
      console.log("GetPinStatus", res);
      setIsPin(res);
    });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "20px",
        height: "auto",
        position: "absolute",
        top: 4,
        right: 2,
      }}
    >
      <IconButton
        {...props}
        sx={{
          width: "16px",
          height: "16px",
        }}
        onClick={() => {
          window.electronAPI.send(Channel.CloseFloatWin, {});
        }}
      >
        <CloseIcon fontSize="small" sx={{ width: "16px", height: "16px" }} />
      </IconButton>
      <IconButton
        sx={{
          width: "16px",
          height: "16px",
          ":hover": {
            backgroundColor: "rgba(200, 200, 200, 1)",
          },
          bgcolor: isPin ? "rgba(180, 180, 180, 1)" : "transparent",
        }}
        onClick={handlePin}
      >
        <PushPinIcon fontSize="small" sx={{ width: "16px", height: "16px" }} />
      </IconButton>
    </Box>
  );
};

function ProcessComponent() {
  const progressVisible = useGlobalStateSelector((state) => state.progress_visible);
  return <LinearProgress variant="query" sx={{ visibility: progressVisible }} />;
}

function ContentComponent() {
  const targetText = useGlobalStateSelector((state) => state.target_text);
  return <ContentField value={targetText} readOnly placeholder="Translate text...." />;
}

function Root() {
  return (
    <Box
      sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}
    >
      <TopAppBar position="sticky">
        <Toolbar variant="regular">
          <SearchBar />
          <Box sx={{ width: "5px" }} />
          <CloseBtn />
        </Toolbar>
      </TopAppBar>
      <ProcessComponent />
      <Box
        flex={1}
        sx={{ overflowY: "auto", padding: "5px 5px 0px 5px", marginBottom: "10px" }}
      >
        <ContentComponent />
      </Box>
      <FooterToolBar />
      <TextSelector onSelect={(text, point) => console.log("onSelect", text, point)} />
    </Box>
  );
}

export default function TranslateSimple() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={Themes.trans}>
        <CssBaseline />
        <Root />
      </ThemeProvider>
    </Provider>
  );
}
