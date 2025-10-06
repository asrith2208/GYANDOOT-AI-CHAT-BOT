"use server";

import { handleIntentBasedQuery, type IntentBasedQueryOutput } from "@/ai/flows/intent-based-query-handling";
import { textToSpeech } from "@/ai/flows/text-to-speech";

export interface Message {
  role: "user" | "bot";
  content: string;
}

export async function getResponse(history: Message[], query: string): Promise<IntentBasedQueryOutput> {
  try {
    const response = await handleIntentBasedQuery({ history, query });
    if (!response || !response.answer || !response.language) {
        throw new Error("Invalid response from AI model.");
    }
    return response;
  } catch (error) {
    console.error("Error getting response from AI:", error);
    // It's better to throw an error and let the client handle it
    throw new Error("Failed to get response from AI.");
  }
}

export async function getAudio(text: string): Promise<{media: string}> {
    return await textToSpeech({ text });
}
