'use server';
/**
 * @fileOverview An AI agent for moderating high-risk content on the platform.
 *
 * - moderateHighRiskContent - A function that moderates high-risk content and filters inappropriate posts.
 * - ModerateHighRiskContentInput - The input type for the moderateHighRiskContent function.
 * - ModerateHighRiskContentOutput - The return type for the moderateHighRiskContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateHighRiskContentInputSchema = z.object({
  text: z
    .string()
    .describe("The text content to be checked for high-risk elements."),
});
export type ModerateHighRiskContentInput = z.infer<typeof ModerateHighRiskContentInputSchema>;

const ModerateHighRiskContentOutputSchema = z.object({
  isHighRisk: z.boolean().describe('Whether the content is considered high-risk.'),
  reason: z.string().describe('The reason why the content is flagged as high-risk.'),
});
export type ModerateHighRiskContentOutput = z.infer<typeof ModerateHighRiskContentOutputSchema>;

export async function moderateHighRiskContent(input: ModerateHighRiskContentInput): Promise<ModerateHighRiskContentOutput> {
  return moderateHighRiskContentFlow(input);
}

const moderateHighRiskContentPrompt = ai.definePrompt({
  name: 'moderateHighRiskContentPrompt',
  input: {schema: ModerateHighRiskContentInputSchema},
  output: {schema: ModerateHighRiskContentOutputSchema},
  prompt: `You are an AI moderator responsible for identifying high-risk content in user-generated text.

  Review the following text and determine if it contains any high-risk elements such as:
  - Suicidal ideation or self-harm
  - Violence or threats of violence
  - Cyberbullying or harassment
  - Hate speech or discrimination
  - Explicit or inappropriate content

  Based on your analysis, set the 'isHighRisk' output field to true if the content is high-risk, and provide a detailed explanation in the 'reason' field.
  If the content is not high-risk, set 'isHighRisk' to false and provide a reason.

  Text: {{{text}}}
  `,
});

const moderateHighRiskContentFlow = ai.defineFlow(
  {
    name: 'moderateHighRiskContentFlow',
    inputSchema: ModerateHighRiskContentInputSchema,
    outputSchema: ModerateHighRiskContentOutputSchema,
  },
  async input => {
    const {output} = await moderateHighRiskContentPrompt(input);
    return output!;
  }
);
