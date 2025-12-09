'use server';
// Adapts text to regional slang

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdaptToRegionalSlangInputSchema = z.object({
  text: z.string().describe('The text to adapt to regional slang.'),
  language: z.string().describe('The target language for regional slang adaptation.'),
  region: z.string().describe('The region or state to adapt the slang to.'),
});
export type AdaptToRegionalSlangInput = z.infer<typeof AdaptToRegionalSlangInputSchema>;

const AdaptToRegionalSlangOutputSchema = z.object({
  adaptedText: z.string().describe('The text adapted to regional slang.'),
});
export type AdaptToRegionalSlangOutput = z.infer<typeof AdaptToRegionalSlangOutputSchema>;

export async function adaptToRegionalSlang(input: AdaptToRegionalSlangInput): Promise<AdaptToRegionalSlangOutput> {
  return adaptToRegionalSlangFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptToRegionalSlangPrompt',
  input: { schema: AdaptToRegionalSlangInputSchema },
  output: { schema: AdaptToRegionalSlangOutputSchema },
  prompt: `You are a regional slang adaptation expert for Indian languages.

You will take the given text and adapt it to include regional slang, idioms, and colloquialisms for the specified language and region.

Original Text: {{{text}}}
Language: {{{language}}}
Region: {{{region}}}

Please adapt the text to sound natural and engaging for people from the specified region.`,
});

const adaptToRegionalSlangFlow = ai.defineFlow(
  {
    name: 'adaptToRegionalSlangFlow',
    inputSchema: AdaptToRegionalSlangInputSchema,
    outputSchema: AdaptToRegionalSlangOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
