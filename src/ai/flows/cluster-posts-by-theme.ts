'use server';
/**
 * @fileOverview This file defines a Genkit flow for clustering anonymous posts into relatable themes using Google's Gemini AI.
 *
 * - clusterPostsByTheme - A function that clusters posts by theme.
 * - ClusterPostsByThemeInput - The input type for the clusterPostsByTheme function.
 * - ClusterPostsByThemeOutput - The return type for the clusterPostsByTheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClusterPostsByThemeInputSchema = z.array(
  z.object({
    id: z.string(),
    text: z.string().describe('The text content of the anonymous post.'),
  })
).describe('An array of anonymous posts to cluster by theme.');

export type ClusterPostsByThemeInput = z.infer<typeof ClusterPostsByThemeInputSchema>;

const ClusterPostsByThemeOutputSchema = z.array(
  z.object({
    theme: z.string().describe('The theme or category that the posts belong to.'),
    posts: z.array(
      z.object({
        id: z.string(),
        text: z.string().describe('The text content of the anonymous post.'),
      })
    ).describe('The anonymous posts belonging to this theme.'),
  })
).describe('An array of themes, each containing a list of related posts.');

export type ClusterPostsByThemeOutput = z.infer<typeof ClusterPostsByThemeOutputSchema>;

export async function clusterPostsByTheme(input: ClusterPostsByThemeInput): Promise<ClusterPostsByThemeOutput> {
  return clusterPostsByThemeFlow(input);
}

const clusterPostsPrompt = ai.definePrompt({
  name: 'clusterPostsPrompt',
  input: {schema: ClusterPostsByThemeInputSchema},
  output: {schema: ClusterPostsByThemeOutputSchema},
  prompt: `You are an AI that clusters anonymous posts into relatable themes.

  Given the following posts, group them into themes that reflect the common feelings, experiences, or topics they share.  Each post has an id field that must be preserved in the output.

  Posts:
  {{#each this}}
  ---
  Post ID: {{this.id}}
  Text: {{this.text}}
  {{/each}}
  ---

  Return a JSON array of themes. Each theme should have a "theme" field (string) describing the theme, and a "posts" field (array) containing the posts (with id and text) that belong to that theme.
  `,
});

const clusterPostsByThemeFlow = ai.defineFlow(
  {
    name: 'clusterPostsByThemeFlow',
    inputSchema: ClusterPostsByThemeInputSchema,
    outputSchema: ClusterPostsByThemeOutputSchema,
  },
  async input => {
    const {output} = await clusterPostsPrompt(input);
    return output!;
  }
);
