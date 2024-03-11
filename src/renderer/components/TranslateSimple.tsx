import React from "react";
import { Box } from "@mui/system";
import AppBar from "@mui/material/AppBar";
import { ThemeProvider, styled } from "@mui/material/styles";
import { CssBaseline, TextField, Toolbar } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import TranslateIcon from "@mui/icons-material/Translate";
import { TextFieldProps, TextareaAutosize } from "@mui/material";
import Popper from "@mui/material/Popper";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PushPinIcon from "@mui/icons-material/PushPin";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";

import { translate } from "./ipc/TranslateAPI";
import { Channel, TranslateType } from "@src/common/const";

const SourceTextContext = React.createContext(null);
const TargetTextContext = React.createContext(null);
const ProgressVisibleContext = React.createContext(null);
const PinStatusContext = React.createContext(null);

// todo add search histroy
const searchHistory = [];

interface AnimTextFiledProps extends TextFieldProps {
  focus: boolean;
  searchIcon: any;
}

import Themes from "@themes";

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

const requestTranslate = (text, updateTarget, showProgress?) => {
  showProgress && showProgress("visible");
  updateTarget("");
  translate(text)
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
  const [sourceText, setSourceText] = React.useState("");
  const { setTargetText } = React.useContext(TargetTextContext);
  const { setProgressVisible } = React.useContext(ProgressVisibleContext);

  const CustomPopper = (props) => {
    return <Popper {...props} />;
  };

  const handleRequestTranslate = (e) => {
    if (e.target.value && e.target.value != sourceText) {
      requestTranslate(e.target.value, setTargetText, setProgressVisible);
    } else if (!e.target.value) {
      setTargetText("");
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleRequestTranslate(e);
    }
  };

  const handleBlur = (e) => {
    setFocus(false);
    handleRequestTranslate(e);
  };

  const onRecieveTranslateText = (arg) => {
    if (!arg || arg == sourceText) {
      return;
    }
    setSourceText(arg);
    requestTranslate(arg, setTargetText, setProgressVisible);
  };

  React.useEffect(() => {
    window.electronAPI.receive(Channel.TranslateText, onRecieveTranslateText);
    return () => {
      console.log("TranslateSimple Unmount");
      window.electronAPI.removeAll(Channel.TranslateText);
    };
  }, []);

  return (
    <SourceTextContext.Provider value={{ sourceText, setSourceText }}>
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
        // renderOption={(props, option) => {
        //   return (
        //     <Box component="li" {...props} sx={{ padding: "5px 5px", cursor: "pointer", height:"10px" }}>
        //       {option}px
        //     </Box>
        //   );
        // }}
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
    </SourceTextContext.Provider>
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
  const [isPin, setIsPin] = React.useState(false);
  const { targetText } = React.useContext(TargetTextContext);
  const [tips, setTips] = React.useState("");
  const [tipsOpen, setTipsOpen] = React.useState(false);

  const handleOpen = () => {
    console.log("handleOpen handleOpen");
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handlePin = () => {
    window.electronAPI.send(Channel.PinFloatWin, !isPin);
    setIsPin(!isPin);
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
    { icon: <PushPinIcon />, name: "Pin", onclick: handlePin, sx: isPin ? { backgroundColor: "grey" } : {} },
    { icon: <ContentCopyIcon />, name: "Copy", onclick: handleCopy },
    { icon: <CenterFocusStrongIcon />, name: "OCR", onclick: handleOCR },
  ];

  return (
    <Box sx={{ width: "40px", height: "40px" }}>
      <Tooltip title={tips} placement="top-end" open={tipsOpen}>
        <StyledSpeedDial
          direction="down"
          {...props}
          icon={<AutoAwesomeIcon />}
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

const FooterToolBar = (props) => {
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

  React.useEffect(() => {
    window.electronAPI.invoke(
      Channel.LanguageList, 
      {api_type: TranslateType.DeepL, displayName: "zh"}).then((res) => {
      console.log("LanguageList", res);
    }).catch((e) => {
      console.log("LanguageList error", e);
    });
  }, []);

  return (
    <AppFooterBar position="sticky" sx={{ top: "auto", bottom: 0 }}>
      <Toolbar sx={{ height: "100%", bottom: 0, position: "absolute" }}>
        <IconButton size="small" aria-label="menu" sx={{ width: "20px", height: "20px", padding: 0 }}>
          <TranslateIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5, border: "0.5px solid #000000" }} orientation="vertical" />
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
  });

  return (
    <PinStatusContext.Provider value={{ isPin, setIsPin }}>
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
        {/* <IconButton {...props} sx={{
        width:"16px", height:"16px",
        }}
        onClick={() => {
          window.electronAPI.send(Channel.CloseFloatWin, {})
        }}
        >
        <CloseIcon fontSize="small" sx={{width:"14px", height:"14px"}}/>
      </IconButton> */}
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
    </PinStatusContext.Provider>
  );
};

export default function TranslateSimple() {
  const [targetText, setTargetText] = React.useState("");
  const [progressVisible, setProgressVisible] = React.useState("hidden");

  return (
    <TargetTextContext.Provider value={{ targetText, setTargetText }}>
      <ProgressVisibleContext.Provider value={{ progressVisible, setProgressVisible }}>
        <ThemeProvider theme={Themes.trans}>
          <CssBaseline />
          <Box sx={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            <TopAppBar position="sticky">
              <Toolbar variant="regular">
                <IconButton size="medium" aria-label="menu">
                  <TranslateIcon />
                </IconButton>
                <SearchBar />
                {/* <Divider sx={{ height: 28, m: 0.5, border: "0.5px solid #000000" }} orientation="vertical" /> */}
                {/* <MoreButton /> */}
                <Box sx={{ width: "40px" }} />
                <CloseBtn />
              </Toolbar>
            </TopAppBar>
            <LinearProgress variant="query" sx={{ visibility: progressVisible }} />
            <Box flex={1} sx={{ overflowY: "auto", padding: "5px 5px 0px 5px", marginBottom: "10px" }}>
              <ContentField value={targetText} readOnly placeholder="Translate text...." />
            </Box>
            <FooterToolBar />
          </Box>
        </ThemeProvider>
      </ProgressVisibleContext.Provider>
    </TargetTextContext.Provider>
  );
}
