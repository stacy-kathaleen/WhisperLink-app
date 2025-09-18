'use server';

import {
  moderateHighRiskContent,
  ModerateHighRiskContentInput,
} from '@/ai/flows/moderate-high-risk-content';
import {
  suggestEmpatheticResponses,
  SuggestEmpatheticResponsesInput,
} from '@/ai/flows/suggest-empathetic-responses';
import { Post, Response } from '@/lib/types';

export async function submitPostAction(
  text: string
): Promise<{ success: boolean; message: string; post?: Post }> {
  const moderationInput: ModerateHighRiskContentInput = { text };
  const moderationResult = await moderateHighRiskContent(moderationInput);

  if (moderationResult.isHighRisk) {
    return {
      success: false,
      message:
        'This post has been flagged as high-risk and cannot be posted. If you are in crisis, please seek help immediately.',
    };
  }

  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    text,
    responses: [],
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    message: 'Your whisper has been posted.',
    post: newPost,
  };
}

export async function submitResponseAction(
  postId: string,
  text: string
): Promise<{ success: boolean; message:string; response?: Response }> {
    const moderationInput: ModerateHighRiskContentInput = { text };
    const moderationResult = await moderateHighRiskContent(moderationInput);

    if (moderationResult.isHighRisk) {
        return {
        success: false,
        message:
            'This response has been flagged as high-risk and cannot be posted. Please keep responses supportive and safe.',
        };
    }

    const newResponse: Response = {
        id: `response-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text,
        createdAt: new Date().toISOString(),
    };

    return {
        success: true,
        message: 'Your response has been added.',
        response: newResponse,
    };
}


export async function getSuggestedResponsesAction(postContent: string) {
  try {
    const input: SuggestEmpatheticResponsesInput = { postContent };
    const result = await suggestEmpatheticResponses(input);
    return result.suggestedResponses;
  } catch (error) {
    console.error('Error getting suggested responses:', error);
    return [];
  }
}
