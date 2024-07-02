require("dotenv").config();
const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const app = express();
const port = 3000;

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  console.log("Authorization code received:", code);

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    console.log("Access token received:", accessToken);
    res.redirect(`/success?access_token=${accessToken}`);
  } catch (error) {
    console.error(
      "Error exchanging code for token",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Internal Server Error");
  }
});

app.get("/success", (req, res) => {
  const accessToken = req.query.access_token;
  console.log("Redirecting to success with access token:", accessToken);
  res.send(`<script>
        localStorage.setItem('access_token', '${accessToken}');
        console.log('Access token stored in localStorage');
        window.opener.updateRecentlyPlayed();
        window.close();
    </script>`);
});

app.listen(port, () => {
  console.log(`Listening at http://127.0.0.1:${port}`);
});
