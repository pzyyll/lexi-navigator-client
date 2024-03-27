import React from "react";
import Box from "@mui/material/Box";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { IconButton, styled } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface AudioPlayerIconProps {
  src?: string;
  state: string;
  onClick?: (state: string) => string;
  props: any;
}

const StyledBox = styled(Box)(({ theme }) => ({
  WebkitAppRegion: "no-drag",
}));

export default function AudioPlayerIcon(props: AudioPlayerIconProps) {
  const { src, state, onClick } = props;
  const _audioRef = React.useRef<HTMLAudioElement>(null);
  const [_state, setState] = React.useState(state || "stop");

  const handleClick = async () => {
    onClick && onClick(_state);
  };

  function renderIcon() {
    switch (_state) {
      case "playing":
        return <StopCircleIcon sx={{ width: "100%", height: "100%" }} />;
      case "loading":
        return <CircularProgress size={16} />;
      default:
        return <VolumeUpIcon sx={{ width: "100%", height: "100%" }} />;
    }
  }

  function handleEnded() {
    setState("stop");
  }

  function handleOnPlay() {
    setState("playing");
  }

  return (
    <StyledBox
      {...props}
      sx={{
        ...props.sx,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "18px",
        width: "18px",
      }}
    >
      <IconButton
        size="small"
        disableRipple
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          margin: 0,
        }}
      >
        {renderIcon()}
      </IconButton>
      <StyledBox
        component="audio"
        ref={_audioRef}
        src={src}
        onEnded={handleEnded}
        onPlay={handleOnPlay}
      >
        Your browser does not support the
        <code>audio</code> element.
      </StyledBox>
    </StyledBox>
  );
}
