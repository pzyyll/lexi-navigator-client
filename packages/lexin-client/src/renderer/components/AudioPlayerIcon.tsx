import React from "react";
import Box from "@mui/material/Box";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface AudioPlayerIconProps {
  src?: string;
  state: string;
  onClick?: (state:string) => string;
  props: any;
}

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
        return <StopCircleIcon />;
      case "loading":
        return <CircularProgress size={22} />;
      default:
        return <VolumeUpIcon />;
    }
  }

  function handleEnded() {
    setState("stop");
  }

  function handleOnPlay() {
    setState("playing");
  }

  return (
    <Box
      {...props}
      sx={{
        ...props.sx,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "24px",
        width: "24px",
      }}
    >
      <Box
        component="audio"
        ref={_audioRef}
        src={src}
        onEnded={handleEnded}
        onPlay={handleOnPlay}
      >
        Your browser does not support the
        <code>audio</code> element.
      </Box>
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
    </Box>
  );
}
