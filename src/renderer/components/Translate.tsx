import React from "react";

import { Box, Container } from "@mui/system";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import WindowSizeListener from "./WindowResizeListener";
import { CssBaseline } from "@mui/material";

import { TextareaBase as Textarea } from "./Textarea";
import * as TranslateApi from "../../common/translate_api"; // Import the TranslateApi module from the correct file path


function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

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

  const handleTranslate = debounce((value: string) => {
    console.log("handleTranslate", value);
    if (value) {
      console.log("handleTranslate empty text");
      TranslateApi.translate(value).then((res) => {
        console.log("translate respone", res);
        if (res.code === 200) {
          setTargetText(res.result.translate_text);
        }
      });
    }
  }, 500);

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
