import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    console.log(transcript);
    

    if (!transcript || typeof transcript !== "string") {
      return Response.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: google("gemini-3.6-flash"),
      prompt: `Summarize the following transcript clearly and concisely.

Transcript:
${transcript}`,
    });

    return Response.json({
      summary: result.text,
    });

  } catch (error) {
    console.error("Error generating summary:", error);

    return Response.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}