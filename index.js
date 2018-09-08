const express = require("express");
const Webtask = require("webtask-tools");
const bodyParser = require("body-parser");

const app = express();

app.get("/geo", (req, res) => {
  res.send({ city: "gothenburg" });
});

module.exports = Webtask.fromExpress(app);
