import 'dotenv/config';
import { DeepgramClient } from '@deepgram/sdk';

const STREAM_URL =
  'https://playerservices.streamtheworld.com/api/livestream-redirect/CSPANRADIOAAC.aac';

const live = async () => {
//   const apiKey = process.env.DEEPGRAM_API_KEY;
//   if (!apiKey) {
//     throw new Error('Set DEEPGRAM_API_KEY in .env');
//   }

  const apiKey = "288df2346da52b9ba4bc8b8326ec324a13b62b4f"

  const deepgram = new DeepgramClient({ apiKey });

  const socket = await deepgram.listen.v1.connect({
    model: 'nova-3',
    language: 'en',
    smart_format: 'true',
    interim_results: 'true',
  });

  socket.on('message', (data) => {
    if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
      const transcript = data.channel.alternatives[0].transcript;
      if (transcript) {
        const isFinal = data.is_final;
        console.log(isFinal ? `[final] ${transcript}` : `[partial] ${transcript}`);
      }
    }
  });

  socket.on('close', () => {
    console.log('Connection closed.');
  });

  socket.on('error', (err) => {
    console.error(err);
  });

  socket.connect();
  await socket.waitForOpen();

  console.log(`Transcribing ${STREAM_URL}...\n`);

  const response = await fetch(STREAM_URL, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Stream fetch failed: ${response.status}`);
  }

  const reader = response.body.getReader();

  const pump = async () => {
    const { done, value } = await reader.read();
    if (done) return;
    socket.sendMedia(value);
    return pump();
  };

  await pump();
};

live().catch(console.error);
