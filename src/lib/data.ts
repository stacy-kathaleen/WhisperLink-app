import type { Post } from './types';

export const initialPosts: Post[] = [
  {
    id: '1',
    text: "I'm feeling really overwhelmed with school lately. It feels like no matter how much I study, it's never enough.",
    responses: [
      {
        id: 'r1',
        text: 'I hear you. School pressure can be intense. Remember to take breaks!',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    text: "I had a falling out with my best friend and I don't know how to fix it. Everything feels empty without them.",
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
  },
  {
    id: '3',
    text: 'Sometimes I feel like nobody really gets me. I put on a happy face but inside I feel so alone.',
    responses: [
      {
        id: 'r2',
        text: 'It takes courage to share that. You are not alone in feeling this way.',
        createdAt: new Date(Date.now() - 1000 * 3600 * 1).toISOString(),
      },
      {
        id: 'r3',
        text: 'I understand that feeling. Thanks for being brave enough to say it.',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
  },
  {
    id: '4',
    text: "I'm worried about the future. Everyone seems to have their life figured out, and I'm just... lost.",
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 3600 * 8).toISOString(),
  },
  {
    id: '5',
    text: "It's hard to balance my parents' expectations with what I actually want to do with my life.",
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
  },
  {
    id: '6',
    text: 'Just passed a huge exam I was dreading! Feeling so relieved and proud of myself for pulling through.',
    responses: [
       {
        id: 'r4',
        text: 'That is awesome! Congratulations!',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 3600 * 28).toISOString(),
  },
];
