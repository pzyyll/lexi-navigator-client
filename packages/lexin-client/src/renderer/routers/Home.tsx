// src/renderer/components/home.tsx
import React from "react";
import TranslateIcon from "@mui/icons-material/Translate";
import SmsIcon from "@mui/icons-material/Sms";

import MiniDrawer from "../components/SidebarDrawer";
import Translate from "./Translate";
import Chat from "./Chat";

function onClick(tag) {
  console.log(tag);
}

const Items = [
  { text: "Translate", icon: <TranslateIcon />, onClick: () => onClick("Translate"), body: <Translate /> },
  { text: "Chat", icon: <SmsIcon />, onClick: () => onClick("Chat"), body: <Chat /> },
];

export default function Home() {
  return (
    <>
      <MiniDrawer items={Items} />
    </>
  );
}
