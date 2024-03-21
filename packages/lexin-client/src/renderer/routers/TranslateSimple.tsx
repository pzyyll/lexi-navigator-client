import React from "react";
import { Box, fontSize, margin, maxHeight, padding, style } from "@mui/system";
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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import { translate, TranslateProps } from "../components/ipc/TranslateAPI";
import { Channel, TranslateType } from "@src/common/const";
import SvgDeeplLogo from "@icons/DeeplLogo";
import SvgBaiduLogo from "@icons/BaiduLogo";

// GlobalContextReducer

const globalInitialState = {
  source_text: "",
  target_text: "",
  progress_visible: "hidden",
  pin_status: false,
  api_type: TranslateType.DeepL,
  source_lang: "",
  target_lang: "",
};

// redux
const reduxGlobalReducer = (state = globalInitialState, action) => {
  if (!(action.type in globalInitialState)) {
    return state;
  }
  return { ...state, [action.type]: action.payload };
};
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector, Provider } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

const GlobalStateSlice = createSlice({
  name: "globalState",
  initialState: globalInitialState,
  reducers: {
    source_text: (state, action) => {
      state.source_text = action.payload;
    },
    target_text: (state, action) => {
      state.target_text = action.payload;
    },
    progress_visible: (state, action) => {
      state.progress_visible = action.payload;
    },
    pin_status: (state, action) => {
      state.pin_status = action.payload;
    },
    api_type: (state, action) => {
      state.api_type = action.payload;
    },
    source_lang: (state, action) => {
      state.source_lang = action.payload;
    },
    target_lang: (state, action) => {
      state.target_lang = action.payload;
    },
  },
});

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

// useGlobalStateSelector((state) => state.target_text);
// function useReduxGlobalState(type) {
//   useGlobalStateSelector((state) => state[type]);
//   return useSelector((state) => state[type]);
// }

// function useReduxGlobalDispatch(type) {
//   const dispatch = useDispatch();
//   return (payload) => dispatch({ type, payload });
// }

// redux end

// todo add search histroy
const searchHistory = [];
const apis = new Map();

const apiIcons = {
  [TranslateType.DeepL]: () => <SvgDeeplLogo fontSize="small" viewBox="0 0 300 300" />,
  [TranslateType.Baidu]: () => <SvgBaiduLogo fontSize="small" viewBox="0 0 92 92" />,
  default: () => <SvgGoogleTranslateLogo fontSize="small" viewBox="0 0 300 300" />,
};

interface AnimTextFiledProps extends TextFieldProps {
  focus: boolean;
  searchIcon: any;
}

interface RequestTranslateProps extends TranslateProps {
  updateTarget: (text: string) => void;
  showProgress: (visible: string) => void;
}

import Themes from "@themes";
import SvgGoogleTranslateLogo from "../assets/icons/GoogleTranslateLogo";

const TopAppBar = styled(AppBar)(({ theme }) => ({
  //"-webkit-app-region": "drag",
  WebkitAppRegion: "drag",
  "& button": {
    WebkitAppRegion: "no-drag",
  },
  "& input": {
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
  // "& .MuiFilledInput-underline:hover": {
  //   borderBottom: "none",
  // },
  "& .MuiFilledInput-input": {
    transition: `${theme.transitions.create("width", {
      duration: theme.transitions.duration.standard,
      easing: theme.transitions.easing.easeInOut,
    })}`,
    margin: "0",
  },
}));

const SearchBar = (props) => {
  const [focus, setFocus] = React.useState(false);
  const sourceText = useGlobalStateSelector((state) => state.source_text);
  const setSourceText = useGlobalStateDispatch("source_text");
  const setTargetText = useGlobalStateDispatch("target_text");
  const setProgressVisible = useGlobalStateDispatch("progress_visible");
  const api_type = useGlobalStateSelector((state) => state.api_type);
  const source_lang = useGlobalStateSelector((state) => state.source_lang);
  const target_lang = useGlobalStateSelector((state) => state.target_lang);
  const set_source_lang = useGlobalStateDispatch("source_lang");
  const set_target_lang = useGlobalStateDispatch("target_lang");

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
      // handleRequestTranslate(e.target.value);
      setSourceText(e.target.value);
    }
  };

  const handleBlur = (e) => {
    setFocus(false);
    // handleRequestTranslate(e.target.value);
    setSourceText(e.target.value);
  };

  const onRecieveTranslateText = (arg) => {
    if (!arg || arg == sourceText) {
      return;
    }
    setSourceText(arg);
    // handleRequestTranslate(arg);
  };

  React.useEffect(() => {
    window.electronAPI.receive(Channel.TranslateText, onRecieveTranslateText);
    return () => {
      console.log("TranslateSimple Unmount");
      window.electronAPI.removeAll(Channel.TranslateText);
    };
  }, []);

  // React.useEffect(() => {
  //   if (sourceText) {
  //     handleRequestTranslate(sourceText, "", "", true);
  //   }
  // }, [api_type]);

  React.useEffect(() => {
    if (sourceText) {
      handleRequestTranslate(sourceText, source_lang, target_lang, true);
    } else {
      setTargetText("");
    }
  }, [target_lang, source_lang, sourceText]);

  return (
    <Autocomplete
      {...props}
      PopperComponent={CustomPopper}
      sx={{
        flex: 1,
        border: "none",
      }}
      freeSolo
      id="input-translate-text"
      options={searchHistory}
      value={sourceText}
      renderInput={(params) => (
        <AnimateTextField
          hiddenLabel
          {...params}
          InputProps={{
            ...params.InputProps,
            startAdornment: <FadeInOutSearchBtn focus={focus} size="small" />,
          }}
          sx={{ border: "none" }}
          placeholder="Search ..."
          onFocus={() => setFocus(true)}
          onBlur={handleBlur}
          onKeyDown={handleEnter}
        />
      )}
    />
  );
};

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: "fixed",
  "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  // '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
  //   '& .MuiSpeedDial-actions': {
  //     "padding-top": "32px",
  //     "margin-top": "-32px",
  //   },
  // },
}));

const Tips = {
  CopySuccess: "Copied to clipboard",
};

const MoreButton = (props) => {
  const [open, setOpen] = React.useState(false);
  const targetText = useGlobalStateSelector((state) => state.target_text);
  const [tips, setTips] = React.useState("");
  const [tipsOpen, setTipsOpen] = React.useState(false);

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

  const handleOCR = () => {
    console.log("handleOCR handleOCR");
  };

  const actions = [
    { icon: <ContentCopyIcon />, name: "Copy", onclick: handleCopy },
    { icon: <CenterFocusStrongIcon />, name: "OCR", onclick: handleOCR },
  ];

  return (
    <Box sx={{ width: "40px", height: "40px" }}>
      <Tooltip title={tips} placement="top-end" open={tipsOpen}>
        <StyledSpeedDial
          direction="down"
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
              onClick={() => {
                if (action.onclick) {
                  action.onclick();
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
  console.log("TranslateApiMenu", api_type, apiIcons[api_type] || apiIcons["default"]);

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

  const default_option = tfprops.options.find((o) => o.code == lang) || {name:"Auto", code:""};

  const [selectOption, setSelectOption] = React.useState(default_option);

  console.log("LanguageList", lang, default_option, selectOption);

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

  const onBlur = (e) => {
    console.log("LanguageList onBlur", e);
  };
  const onKeyDown = (e) => {
    console.log("LanguageList onKeyDown", e);
  };
  const onChange = (e, newOption) => {
    console.log("LanguageList onChange", newOption);
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
        return <TextF {...params} hiddenLabel size="small" variant="filled" margin="none" />;
      }}
      renderOption={(props, option) => {
        return (
          <Box component="li" {...props} sx={{ padding: "0px", cursor: "pointer", margin: "0px" }}>
            {getOptionLabel(option)}
          </Box>
        );
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
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
      <Divider sx={{ height: 28, m: 0.5, border: "0.5px solid #000000" }} orientation="vertical" />
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
        <MoreButton direction="left" />
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
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      <TopAppBar position="sticky">
        <Toolbar variant="regular">
          {/* <IconButton size="medium" aria-label="menu">
    <TranslateIcon />
  </IconButton> */}
          <SearchBar />
          {/* <Divider sx={{ height: 28, m: 0.5, border: "0.5px solid #000000" }} orientation="vertical" /> */}
          {/* <MoreButton /> */}
          <Box sx={{ width: "40px" }} />
          <CloseBtn />
        </Toolbar>
      </TopAppBar>
      <ProcessComponent />
      <Box flex={1} sx={{ overflowY: "auto", padding: "5px 5px 0px 5px", marginBottom: "10px" }}>
        <ContentComponent />
      </Box>
      <FooterToolBar />
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
