import { Container } from "@mui/material";
import { IconButton } from "@mui/material";
import { styled, keyframes } from "@mui/system";
import { Typography } from "@mui/material";

import SvgLnb from "@src/components/icons/Lnb";

// 创建背景颜色呼吸效果的 keyframes 动画
const breathingAnimation = keyframes`
  0%, 100% { background-color: #f8f8f8; }
  50% { background-color: #f0f0f0; }
`;

// 创建心跳效果的 keyframes 动画
const heartbeatAnimation = keyframes`
  0% { transform: scale(1); }
  14% { transform: scale(1.4); }
  28% { transform: scale(1); }
  42% { transform: scale(1.4); }
  70% { transform: scale(1); }
`;

// 使用 styled 函数创建一个具有动画的按钮
const AnimatedButton = styled(IconButton)(({ theme }) => ({
  animation: `${breathingAnimation} 3s ease-in-out infinite, ${heartbeatAnimation} 3s ease-in-out infinite`,
}));

const zIndexRotation = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const AnimTypo = styled(Typography)(({ theme }) => ({
  animation: `${zIndexRotation} 5s linear infinite`,
}));

export default function Root() {
  return (
    <Container component="main" maxWidth="sm" >
      <AnimatedButton>
        <SvgLnb viewBox="0 0 1091.6 1091.6" />
      </AnimatedButton>
      <AnimTypo variant="h4" sx={{mt:"20px", fontWeight: "bold"}}>Lexi Navigator</AnimTypo>
    </Container>
  );
}
