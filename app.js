const express = require("express");
require("dotenv").config();
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  res.send(
    "<a href='https://auth.pingone.com/2fb48636-1624-456c-a657-a81a6c30e3ec/as/authorize?response_type=code&client_id=ef8bee74-e572-4fc4-b8ed-cd9530511633&scope=openid%20profile%20email%20address%20p1%3Aread%3Auser&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin%2Fcallback'>Login</a>"
  );
});

app.get("/login/callback", async (req, res) => {
  const authorizationCode = req.query.code;
  console.log("");
  console.log("authorizationCode");
  console.log(authorizationCode);

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  console.log(process.env.AUTHZ_HEADER);

  // Authorization header is the result of base64 encoding client_id + ":" +
  // client_secret ex. output for the authorization header: "Basic
  // 01234mVlNzQtZT3Mi00ZmM0WI4ZWQtY2Q5NTMwTE0123456=="
  headers.append("Authorization", process.env.AUTHZ_HEADER);

  // Use URLSearchParams because we're using
  // "application/x-www-form-urlencoded".
  const urlBodyParams = new URLSearchParams();
  // The grant type is the OAuth 2.0 grant type that the PingOne app connection
  // is configured to accept.
  urlBodyParams.append("grant_type", "authorization_code");
  // Include the authorization code that was extracted from the url when the
  // user was redirected to the redirect_uri from PingOne.
  urlBodyParams.append("code", authorizationCode);
  // The redirect_uri is where the tokens will be sent and must be registered
  // with PingOne by configuring the app connection.
  urlBodyParams.append("redirect_uri", "http://localhost:3000/login/callback");

  // Options to supply the fetch function.
  const requestOptions = {
    method: "POST",
    headers: headers,
    body: urlBodyParams,
    redirect: "follow",
  };

  // Make the exchange for tokens by calling the /token endpoint.
  try {
    const response = await fetch(
      "https://auth.pingone.com/2fb48636-1624-456c-a657-a81a6c30e3ec/as/token",
      requestOptions
    );
    const result = await response.json();

    console.log("");
    console.log("result");
    console.log(result);
    res.json(result);
  } catch (error) {
    // Handle error
    console.log(error);
    res.send(error);
  }

  //     return null;
  //   }
  //   const options = {
  //     method: "POST",
  //     headers: {
  //       Authorization: authHeader,
  //     },
  //     redirect: "follow",
  //   };
  //   fetch();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
