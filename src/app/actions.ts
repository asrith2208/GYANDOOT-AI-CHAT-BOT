"use server";

import { handleIntentBasedQuery, type IntentBasedQueryOutput } from "@/ai/flows/intent-based-query-handling";
import { textToSpeech } from "@/ai/flows/text-to-speech";

export interface Message {
  role: "user" | "bot";
  content: string;
}

export async function getResponseAndAudio(history: Message[], query: string): Promise<IntentBasedQueryOutput & { audioData?: string }> {
  try {
    const response = await handleIntentBasedQuery({ history, query });
    if (!response || !response.answer || !response.language) {
        throw new Error("Invalid response from AI model.");
    }
    
    // Generate audio in parallel
    const audioPromise = textToSpeech({ text: response.answer }).catch(err => {
      console.error("Failed to generate audio:", err);
      return { media: "" }; // Return empty media on failure
    });

    const audioResult = await audioPromise;

    return {
        ...response,
        audioData: audioResult.media
    };

  } catch (error) {
    console.error("Error getting response from AI:", error);
    throw new Error("Failed to get response from AI.");
  }
}
