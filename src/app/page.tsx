
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

// Function to shuffle an array
function shuffle(array: any[]) {
  const newArray = [...array];
  let currentIndex = newArray.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}


export default async function Home() {
  // To avoid overloading the model and to show variety, we shuffle the posts.
  const allPosts = shuffle(initialPosts);

  // We'll take a random subset of posts for the initial clustering.
  // This reduces the payload and the likelihood of a 503 error.
  const postsForClustering = allPosts.slice(0, 9);
  
  const postInputs: ClusterPostsByThemeInput = postsForClustering.map((p) => ({
    id: p.id,
    text: p.text,
  }));

  let initialClusters: ThemeCluster[] = [];
  try {
    if (postInputs.length > 0) {
      const clusteredOutput = await clusterPostsByTheme(postInputs);
      // We merge with the *subset* of posts we sent for clustering
      initialClusters = mergeClustersWithPosts(clusteredOutput, postsForClustering);
    }
  } catch (error) {
    console.error('Failed to cluster posts on initial load:', error);
    // If clustering fails, we fall back to a simple list of ALL posts.
    initialClusters = [{ theme: 'Recent Whispers', posts: allPosts }];
  }

  return (
    <Suspense fallback={<LoadingWhisperWall />}>
      <WhisperWallClient
        // We pass ALL posts to the client so it has the full dataset for client-side operations
        initialPosts={allPosts} 
        initialClusters={initialClusters}
      />
    </Suspense>
  );
}
