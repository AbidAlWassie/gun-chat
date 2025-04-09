// server/index.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Gun from "gun";
dotenv.config();

const CLIENT_URL: string = process.env.CLIENT_URL as string;

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

const GUN = Gun as unknown as (opts?: { web: any; file?: string }) => any;
const server = app.listen(8765, () => {
  console.log("Relay peer running on port 8765");
});

GUN({
  web: server,
});
