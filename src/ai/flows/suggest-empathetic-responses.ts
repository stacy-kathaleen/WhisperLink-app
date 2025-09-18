// src/ai/flows/suggest-empathetic-responses.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting empathetic responses to user posts.
 *
 * The flow takes a user post as input and returns a list of AI-suggested empathetic responses.
 *
 * @exports {
 *   suggestEmpatheticResponses,
 *   SuggestEmpatheticResponsesInput,
 *   SuggestEmpatheticResponsesOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const SuggestEmpatheticResponsesInputSchema = z.object({
  postContent: z.string().describe('The content of the user post to respond to.'),
});

export type SuggestEmpatheticResponsesInput = z.infer<
  typeof SuggestEmpatheticResponsesInputSchema
>;

// Define the output schema
const SuggestEmpatheticResponsesOutputSchema = z.object({
  suggestedResponses: z
    .array(z.string())
    .describe('A list of AI-generated empathetic and supportive responses.'),
});

export type SuggestEmpatheticResponsesOutput = z.infer<
  typeof SuggestEmpatheticResponsesOutputSchema
>;

// Define the prompt
const suggestEmpatheticResponsesPrompt = ai.definePrompt({
  name: 'suggestEmpatheticResponsesPrompt',
  input: {schema: SuggestEmpatheticResponsesInputSchema},
  output: {schema: SuggestEmpatheticResponsesOutputSchema},
  prompt: `You are an AI assistant designed to suggest empathetic responses to user posts on a mental wellness platform.

  The user has shared the following post:
  "{{postContent}}"

  Generate a list of 3-4 short, supportive, and empathetic peer responses that are directly relevant to the post's content. The responses should sound natural and be something a peer would say.

  Return the responses in the suggestedResponses field.
  `,
});

// Define the flow
const suggestEmpatheticResponsesFlow = ai.defineFlow(
  {
    name: 'suggestEmpatheticResponsesFlow',
    inputSchema: SuggestEmpatheticResponsesInputSchema,
    outputSchema: SuggestEmpatheticResponsesOutputSchema,
  },
  async input => {
    const {output} = await suggestEmpatheticResponsesPrompt(input);
    return output!;
  }
);

/**
 * Suggests empathetic responses to a given post content.
 * @param input - The input object containing the post content.
 * @returns A promise that resolves to an object containing a list of suggested responses.
 */
export async function suggestEmpatheticResponses(
  input: SuggestEmpatheticResponsesInput
): Promise<SuggestEmpatheticResponsesOutput> {
  return suggestEmpatheticResponsesFlow(input);
}
