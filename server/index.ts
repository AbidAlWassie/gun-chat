// server/index.ts
import express from "express";
// Import Gun as a default import and use type assertion
import Gun from "gun";

// Type assertion to tell TypeScript that Gun is callable
const GUN = Gun as unknown as (opts?: { web: any }) => any;

const app = express();

const server = app.listen(8765, () => {
  console.log("Relay peer running on port 8765");
});

GUN({ web: server });
