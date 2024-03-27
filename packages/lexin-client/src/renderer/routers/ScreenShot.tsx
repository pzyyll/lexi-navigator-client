import React from "react";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Channel } from "@src/common/const";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

const transparentTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function ScreenShot() {
  const [selectionArea, setSelectionArea] = React.useState<SelectionArea | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);

  const handleMouseDown = (e: MouseEvent) => {
    setIsSelecting(true);
    setIsDone(false);
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectionArea({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !selectionArea) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectionArea({
      ...selectionArea,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsSelecting(false);
    setIsDone(true);
    if (selectionArea) {
      console.log("selected area", selectionArea);
    }
  };

  const handleDone = (e) => {
    if (selectionArea) {
      console.log("selected area", selectionArea);
      window.electronAPI?.send(Channel.ScreenShotEnd, selectionArea);
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectionArea(null);
    setIsSelecting(false);
    setIsDone(false);
    window.electronAPI?.send(Channel.CloseScreenShot);
  };

  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectionArea(null);
        setIsSelecting(false);
        window.electronAPI?.send(Channel.CloseScreenShot);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  return (
    <ThemeProvider theme={transparentTheme}>
      <CssBaseline />
      <Box
        component="div"
        sx={{
          position: "relative",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0)",
          zIndex: 9999,
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {selectionArea && (
          <Box
            sx={{
              position: "absolute",
              border: "2px solid #00BFFF",
              backgroundColor: "rgba(0, 191, 255, 0.3)",
              left: Math.min(selectionArea.startX, selectionArea.endX),
              top: Math.min(selectionArea.startY, selectionArea.endY),
              width: Math.abs(selectionArea.endX - selectionArea.startX),
              height: Math.abs(selectionArea.endY - selectionArea.startY),
            }}
          />
        )}

        {isDone && (
          <Box
            sx={{
              position: "absolute",
              left: `${selectionArea?.endX - 40}px`,
              top: `${selectionArea?.endY + 20}px`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 1)",
              borderRadius: "5px",
              flexDirection: "row",
            }}
          >
            <IconButton onClick={handleClose} onMouseDown={(e)=>e.stopPropagation()}>
              <CloseIcon sx={{ color: "#00BFFF" }} />
            </IconButton>
            <IconButton onClick={handleDone} onMouseDown={(e)=>e.stopPropagation()}>
              <DoneIcon sx={{ color: "#00BFFF" }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
