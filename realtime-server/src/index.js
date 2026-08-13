import {WebSocketServer} from "ws"
import { DeepgramClient } from '@deepgram/sdk';
import 'dotenv/config'

const PORT = 8080;

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY,
});

const wss = new WebSocketServer({
  port: PORT,
});

console.log(`Server running on ws://localhost:${PORT}`);

wss.on("connection", (browserSocket) => {
  console.log("Browser connected");

  browserSocket.on("message", (audio) => {
    console.log(
      "Received:",
      audio.length,
      "bytes"
    );

    console.log(
      "First bytes:",
      audio.subarray(0, 16)
    );
  });

  browserSocket.on("close", () => {
    console.log("Browser disconnected");
  });

  browserSocket.on("error", (error) => {
    console.error("Browser WebSocket error:", error);
  });
});