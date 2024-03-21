import React from "react";

import { Box, Container } from "@mui/system";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import WindowSizeListener from "../components/WindowResizeListener";
import { CssBaseline } from "@mui/material";

import { TextareaBase as Textarea } from "../components/Textarea";
import * as TranslateAPI from "../components/ipc/TranslateAPI"; // Import the TranslateAPI module from the correct file path
import { Channel } from "@src/common/const"; // Import the Channel enum from the correct file path

import _ from "lodash";

export default function Translate() {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"));
  const [sourceText, setSourceText] = React.useState("");
  const [targetText, setTargetText] = React.useState("");

  const sourceTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const targetTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    console.log("smUp", smUp);
  }, [smUp]);

  const autoResize = () => {
    targetTextareaRef.current?.style.setProperty("height", "auto");
    sourceTextareaRef.current?.style.setProperty("height", "auto");

    const inputHeight = sourceTextareaRef.current?.scrollHeight || 0;
    const outputHeight = targetTextareaRef.current?.scrollHeight || 0;

    if (!smUp) {
      targetTextareaRef.current?.style.setProperty("height", `${outputHeight}px`);
      sourceTextareaRef.current?.style.setProperty("height", `${inputHeight}px`);
    } else {
      const maxHeight = Math.max(inputHeight, outputHeight);
      targetTextareaRef.current?.style.setProperty("height", `${maxHeight}px`);
      sourceTextareaRef.current?.style.setProperty("height", `${maxHeight}px`);
    }
  };

  React.useEffect(() => {
    autoResize();

    window.electronAPI.invoke(Channel.GetAllTranslateApi).then((config) => {
      console.log("GetAllTranslateApi", config);
    });
  }, []);

  React.useEffect(() => {
    if (!sourceText) {
      setTargetText("");
    }
    autoResize();
  }, [sourceText]);

  React.useEffect(() => {
    autoResize();
  }, [targetText]);

  const handleTranslate = React.useCallback(_.debounce((value: string) => {
    if (value) {
      console.log("handleTranslate", value);
      TranslateAPI.translate({
        text: value
      }).then((res) => {
        if (res) {
          setTargetText(res.text);
        }
      });
    }
  }, 500), []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(event.target.value);
    handleTranslate(event.target.value);
  }

  return (
    <Container maxWidth={"xl"} sx={{ paddingTop: "20px" }}>
      <CssBaseline />
      <WindowSizeListener>
        {({ width, height }) => {
          autoResize();
        }}
      </WindowSizeListener>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" } }}>
        <Box width={{ sm: "50%", xs: "100%" }}>
          <Textarea placeholder="Text to be translated ..." className="form-control" onChange={handleChange} ref={sourceTextareaRef} />
        </Box>
        <Box width={{ sm: "50%", xs: "100%" }}>
          <Textarea placeholder="Translation text ..." className="form-control" value={targetText} ref={targetTextareaRef} readOnly />
        </Box>
      </Box>
    </Container>
  );
}
