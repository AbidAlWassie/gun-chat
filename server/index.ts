// server/index.ts
import express from "express";
import Gun from "gun";

const GUN = Gun as unknown as (opts?: { web: any }) => any;

const app = express();
const server = app.listen(8765, () => {
  console.log("Relay peer running on port 8765");
});

GUN({ web: server });
