import React from "react";
import RecipeReviewCard from "./CardInfo";
import { Box } from "@mui/system";

import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import Themes from "@themes";

export default function TranslateSimple() {

    return (
      <ThemeProvider theme={Themes.trans}>
        <CssBaseline />
        <Box sx={{height:"100%",width:"100%"}}>
        <RecipeReviewCard />
        </Box>
      </ThemeProvider>
    );
}