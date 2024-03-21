enum ReqUrl {
  login = "/api/auth/login",
  logout = "/api/auth/logout",
  register = "/api/auth/signup",
}

const headers = {
  accept: "application/json",
  "Content-Type": "application/json",
};

export const req_login = async (username: string, password: string, cftoken: string) => {
  console.log("login request: ", username, password, cftoken);
  const res = await fetch(ReqUrl.login, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ username, password, cftoken }),
  });
  return res.json();
};
