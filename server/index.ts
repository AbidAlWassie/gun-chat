// server/index.ts
import express from "express";
import Gun from "gun";
import path from "path";

const GUN = Gun as unknown as (opts?: { web: any; file?: string }) => any;

const app = express();
const server = app.listen(8765, () => {
  console.log("Relay peer running on port 8765");
});

GUN({
  web: server,
  file: path.resolve(__dirname, "server/radata"), // Absolute path
});
