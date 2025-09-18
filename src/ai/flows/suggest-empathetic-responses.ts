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
    .describe('A list of AI-suggested empathetic responses.'),
});

export type SuggestEmpatheticResponsesOutput = z.infer<
  typeof SuggestEmpatheticResponsesOutputSchema
>;

// Define the tool for retrieving empathetic responses
const getEmpatheticResponses = ai.defineTool({
  name: 'getEmpatheticResponses',
  description:
    'Retrieves a list of professionally vetted, empathetic peer responses that can be used to respond to a user post.',
  inputSchema: z.object({
    postContent: z
      .string()
      .describe('The content of the user post to generate responses for.'),
  }),
  outputSchema: z.array(z.string()),
},
async input => {
  // In a real application, this would fetch responses from a database or external source
  // that contains professionally vetted empathetic responses.
  // For this example, we'll return a static list of responses.
  const cannedResponses = [
    'I hear you, and it sounds like you are going through a tough time.',
    'Thank you for sharing this. It takes courage to open up.',
    'I understand how you feel. I have been through something similar.',
    'You are not alone. Many people feel this way.',
    'Is there anything I can do to help?',
  ];

  return cannedResponses;
});

// Define the prompt
const suggestEmpatheticResponsesPrompt = ai.definePrompt({
  name: 'suggestEmpatheticResponsesPrompt',
  input: {schema: SuggestEmpatheticResponsesInputSchema},
  output: {schema: SuggestEmpatheticResponsesOutputSchema},
  tools: [getEmpatheticResponses],
  prompt: `You are an AI assistant designed to suggest empathetic responses to user posts on a mental wellness platform.

  The user has shared the following post:
  {{postContent}}

  Suggest a list of professionally vetted, empathetic peer responses that can be used to respond to this post.

  Use the getEmpatheticResponses tool to get the list of possible responses.

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
