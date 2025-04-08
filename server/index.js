// server/index.js
import express from "express";
import Gun from "gun";
const app = express();

const server = app.listen(8765, () => {
  console.log("Relay peer running on port 8765");
});

Gun({ web: server });
