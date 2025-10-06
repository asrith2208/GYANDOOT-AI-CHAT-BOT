'use server';
/**
 * @fileOverview A Genkit flow for generating adaptive multilingual responses for the Uttaranchal University chatbot.
 *
 * - generateAdaptiveResponse - A function that generates contextually relevant answers in multiple Indian languages.
 * - AdaptiveResponseInput - The input type for the generateAdaptiveResponse function.
 * - AdaptiveResponseOutput - The return type for the generateAdaptiveResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveResponseInputSchema = z.object({
  query: z.string().describe('The user query in any language.'),
  language: z.string().describe('The target Indian language for the response.'),
  tone: z.string().describe('The regional tone for the response (e.g., formal, informal, slang).'),
  universityInformation: z.string().describe('Relevant information about Uttaranchal University to answer the query.'),
});
export type AdaptiveResponseInput = z.infer<typeof AdaptiveResponseInputSchema>;

const AdaptiveResponseOutputSchema = z.object({
  response: z.string().describe('The generated response in the specified language and tone.'),
});
export type AdaptiveResponseOutput = z.infer<typeof AdaptiveResponseOutputSchema>;

export async function generateAdaptiveResponse(input: AdaptiveResponseInput): Promise<AdaptiveResponseOutput> {
  return adaptiveMultilingualResponseGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveMultilingualResponsePrompt',
  input: {schema: AdaptiveResponseInputSchema},
  output: {schema: AdaptiveResponseOutputSchema},
  prompt: `You are a multilingual chatbot for Uttaranchal University. You are able to answer questions in multiple Indian languages, and adapt your tone to be appropriate for the region.

  The user has asked the following question in any language:
  {{query}}

  Please respond in {{language}}, using a tone that is {{tone}}.

  Here is some information about Uttaranchal University that may be helpful:
  {{universityInformation}}

  If the question is not related to Uttaranchal University, respond with: "For further assistance, please contact our support team at 7842311198."

  Make sure the response is slow-paced, word-by-word, and easy to understand.
  `,
});

const adaptiveMultilingualResponseGenerationFlow = ai.defineFlow(
  {
    name: 'adaptiveMultilingualResponseGenerationFlow',
    inputSchema: AdaptiveResponseInputSchema,
    outputSchema: AdaptiveResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
