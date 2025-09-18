import { initialPosts } from '@/lib/data';
import {
  clusterPostsByTheme,
  ClusterPostsByThemeInput,
  ClusterPostsByThemeOutput,
} from '@/ai/flows/cluster-posts-by-theme';
import { Post, ThemeCluster } from '@/lib/types';
import WhisperWallClient from '@/components/whisper-wall-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function mergeClustersWithPosts(
  clusters: ClusterPostsByThemeOutput,
  posts: Post[]
): ThemeCluster[] {
  const postMap = new Map(posts.map((post) => [post.id, post]));
  return clusters.map((cluster) => ({
    theme: cluster.theme,
    posts: cluster.posts
      .map((p) => postMap.get(p.id)!)
      .filter(Boolean),
  }));
}

function LoadingWhisperWall() {
  return (
    <div className="space-y-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  const posts: Post[] = initialPosts;
  const postInputs: ClusterPostsByThemeInput = posts.map((p) => ({
    id: p.id,
    text: p.text,
  }));

  let initialClusters: ThemeCluster[] = [];
  try {
    if (postInputs.length > 0) {
      const clusteredOutput = await clusterPostsByTheme(postInputs);
      initialClusters = mergeClustersWithPosts(clusteredOutput, posts);
    }
  } catch (error) {
    console.error('Failed to cluster posts on initial load:', error);
    initialClusters = [{ theme: 'Recent Whispers', posts: posts }];
  }

  return (
    <Suspense fallback={<LoadingWhisperWall />}>
      <WhisperWallClient
        initialPosts={posts}
        initialClusters={initialClusters}
      />
    </Suspense>
  );
}
