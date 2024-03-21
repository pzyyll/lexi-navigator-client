import { Container } from "@mui/material";
import { IconButton } from "@mui/material";
import SvgLnb from "@src/components/icons/Lnb";

export default function Root() {
  return (
    <Container component="main" maxWidth="sm">
      <IconButton>
        <SvgLnb viewBox="0 0 1091.6 1091.6" />
      </IconButton>
      <h1>Lexi Navigator</h1>
    </Container>
  );
}
