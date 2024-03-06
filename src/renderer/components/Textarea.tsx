import React from "react";

import TextareaAutosize from "@mui/material/TextareaAutosize";
import { styled } from "@mui/system";


const TextareaBase = styled("textarea")(
  ({ theme }) => `
  && {
    box-sizing: border-box;
    width: 100%;
    padding-bottom: 20px;
    border-radius: 0;
    // border: 1px solid ${theme.palette.mode === "dark" ? "#1A2027" : "#fff"};
    background-color: ${theme.palette.mode === "dark" ? "#1A2027" : "#fff"};
    color: ${theme.palette.text.primary};
    overflow: auto !important;
    resize: none;
    min-height: 100px;
    max-height: 2000px;
    ${theme.breakpoints.up("sm")} {
      min-height: 400px;
    }
  }
  `
);


export {TextareaBase};