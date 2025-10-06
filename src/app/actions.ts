"use server";

import { handleIntentBasedQuery, type IntentBasedQueryOutput } from "@/ai/flows/intent-based-query-handling";

export async function getResponse(query: string): Promise<IntentBasedQueryOutput> {
  try {
    const response = await handleIntentBasedQuery({ query });
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
