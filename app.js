const express = require("express");
require("dotenv").config();
const app = express();
const port = 3000;

const authBasePath = process.env.PINGONE_AUTH_BASE_PATH;
const envID = process.env.PINGONE_ENV_ID;
const clientID = process.env.PINGONE_CLIENT_ID;
const clientSecret = process.env.PINGONE_CLIENT_SECRET;
const scope = "openid profile p1:read:user";
const responseType = "code";
const grantType = "authorization_code";
const appBasePath = process.env.APP_BASE_PATH;
const callbackPath = "/login/callback";
const redirectURI = appBasePath + ":" + port + callbackPath;

// Re-route requests to root to /login.
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Link to trigger authentication.
app.get("/login", (req, res) => {
  const authzReq = new URL(envID + "/as/authorize", authBasePath);

  authzReq.searchParams.append("response_type", responseType);
  authzReq.searchParams.append("client_id", clientID);
  authzReq.searchParams.append("scope", scope);
  authzReq.searchParams.append("redirect_uri", redirectURI);

  res.send("<a href=" + authzReq.toString() + ">Login</a>");
});

app.get(callbackPath, async (req, res) => {
  const authorizationCode = req.query.code;

  // For demoing purposes
  console.log("");
  console.log("authorizationCode");
  console.log(authorizationCode);

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  // Authorization header is the result of base64 encoding the string
  // (clientID + ":" + clientSecret) appended to "Basic ".
  // e.g.,
  // "Basic 0123456lNzQtZT3Mi00ZmM0WI4ZWQtY2Q5NTMwTE0123456=="
  const authzHeader =
    "Basic " + Buffer.from(clientID + ":" + clientSecret).toString("base64");
  headers.append("Authorization", authzHeader);

  // Use URLSearchParams because we're using
  // "application/x-www-form-urlencoded".
  const urlBodyParams = new URLSearchParams();
  // The grant type is the OAuth 2.0 grant type that the PingOne app connection
  // is configured to accept.
  urlBodyParams.append("grant_type", grantType);
  // Include the authorization code that was extracted from the url when the
  // user was redirected to the redirect_uri from PingOne.
  urlBodyParams.append("code", authorizationCode);
  // The redirect_uri is where the tokens will be sent and must be registered
  // with PingOne by configuring the app connection.
  urlBodyParams.append("redirect_uri", redirectURI);

  // Options to supply the fetch function.
  const requestOptions = {
    method: "POST",
    headers: headers,
    body: urlBodyParams,
    redirect: "follow",
  };

  const tokenEndpoint = authBasePath + "/" + envID + "/as/token";

  // Make the exchange for tokens by calling the /token endpoint and sending the
  // authorization code.
  try {
    const response = await fetch(tokenEndpoint, requestOptions);
    const result = await response.json();

    // For demoing purposes
    console.log("");
    console.log("result");
    console.log(result);
    res.json(result);
  } catch (error) {
    // Handle error

    // For demoing purposes
    console.log(error);
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(
    `App listening on port ${port}. If running locally, navigate to http://localhost:3000 or http://localhost:3000/login in a browser.`
  );
});
