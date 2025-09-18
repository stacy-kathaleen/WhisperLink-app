import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-empathetic-responses.ts';
import '@/ai/flows/moderate-high-risk-content.ts';
import '@/ai/flows/cluster-posts-by-theme.ts';