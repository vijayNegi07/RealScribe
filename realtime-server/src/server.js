import { WebSocketServer } from "ws";
import { DeepgramClient } from "@deepgram/sdk";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

const PORT = 8080;

const wss = new WebSocketServer({
  port: PORT,
});

const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });


console.log(`WebSocket server running on ws://localhost:${PORT}`);

wss.on("connection", async (browserSocket) => {
  console.log("Client connected");

  let deepReady = false;

  const deepgramSocket = await deepgram.listen.v1.connect({
    model: "nova-3",
    language: "en",
    smart_format: "true",
    interim_results: "true",

    encoding: "linear16",
    sample_rate: 16000,
    channels: 1,
  });

  deepgramSocket.on("open", () => {
    console.log("DEEPGRAM OPEN");
  });

  deepgramSocket.on("message", (data) => {
    console.log("DEEPGRAM DATA->", data);

    if (data.type === "SpeechStarted") {
      console.log(`[Event  ] SpeechStarted (${data.timestamp}s)`);
      return;
    }
    if (data.type === "Results" && data.channel?.alternatives?.[0]) {
      const transcript = data.channel.alternatives[0].transcript;
      const prefix = data.is_final ? "[ FINAL ]" : "[Interim]";
      const words = data.channel.alternatives[0].words;
      const speakers = new Set(
        words.map((w) => w.speaker).filter((s) => s !== undefined),
      );
      const speaker =
        speakers.size > 1 ? `${words[0]?.speaker}+` : words[0]?.speaker;
      if (transcript) {
        console.log(`${prefix} [Speaker ${speaker}] ${transcript}`);

        browserSocket.send(
          JSON.stringify({
            type: "transcript",
            transcript,
            isFinal: data.is_final,
            speaker,
          }),
        );
      }
    }
  });

  deepgramSocket.on("close", () => {
    deepReady = false;
    console.log("Deepgram connection closed");
  });

  deepgramSocket.on("error", (err) => {
    console.error(err);
  });

  deepgramSocket.connect();
  await deepgramSocket.waitForOpen();

  deepReady = true;

  console.log("DeepGram socket connected");

  browserSocket.on("message", (audio) => {
    if (!deepReady) {
      console.log("Deepgram is not ready");
      return;
    }

    try {
      if (deepReady) {
        deepgramSocket.sendMedia(audio);
      }
    } catch (error) {
      console.error("Could not send audio:", error.message);
    }
  });

  // Browser disconnected
  browserSocket.on("close", () => {
    console.log("Browser disconnected");

    deepgramSocket.close();
  });

  browserSocket.on("error", (err) => {
    console.error("Browser WebSocket error:", err);
  });
});
