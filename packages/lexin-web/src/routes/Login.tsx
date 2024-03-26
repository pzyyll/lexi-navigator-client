import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import SvgLnb from "@icons/Lnb";
import { Turnstile } from "@marsidev/react-turnstile";
// import TurnstileWidget from "@components/TurnstileWidget";
import { TurnstileInstance } from "@marsidev/react-turnstile";

import { req_login } from "@src/components/request/auth";

const siteKey = import.meta.env.VITE_APP_CF_CAPTCHA_SITE_KEY;

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="/">
        Lexi Navigator
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const LoginForm = ({ handleSubmit }) => {
  return (
    <Box
      sx={{
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "300px",
      }}
    >
      <Avatar sx={{ m: 1 }}>
        <SvgLnb viewBox="0 0 1091.6 1091.6" />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="User Name"
          name="username"
          autoComplete="username"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" id="remembermecheck"/>}
          label="Remember me"
          id="rememberme"
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign In
        </Button>
        {/* <Grid container>
          <Grid item xs>
            <Link href="#" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid> */}
      </Box>
    </Box>
  );
};

export default function Login() {
  const [cfToken, setCfToken] = React.useState("");
  const cftRef = React.useRef<TurnstileInstance>();
  const isVerified = cfToken.length > 0;
  console.log("cfToken: ", cfToken);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username= data.get("username")?.toString() || "";
    const password = data.get("username")?.toString() || "";
    // console.log("submitting form", cftRef.current);
    // cftRef.current?.reset();
    if (cftRef.current?.isExpired()) {
      console.log("expired");
      return;
    }
    req_login(username, password, cfToken).then((res) => {
      console.log("login response: ", res);
    });
  };

  const onExpired = () => {
    console.log("expired");
    setCfToken("");
    cftRef.current?.reset();
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isVerified ? (
        <LoginForm handleSubmit={handleSubmit} />
      ) : (
        <Turnstile
          ref={cftRef}
          siteKey={siteKey}
          onSuccess={(token) => setCfToken(token)}
          onExpire={onExpired}
        />
      )}
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
