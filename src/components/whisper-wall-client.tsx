'use client';

import { useState, useTransition, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Post, ThemeCluster, Response as ResponseType } from '@/lib/types';
import {
  clusterPostsByTheme,
  ClusterPostsByThemeInput,
  ClusterPostsByThemeOutput,
} from '@/ai/flows/cluster-posts-by-theme';

import { PostForm } from '@/components/post-form';
import ThemeClusterComponent from '@/components/theme-cluster';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Bell, Link, PenSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface WhisperWallClientProps {
  initialPosts: Post[];
  initialClusters: ThemeCluster[];
}

function mergeClustersWithPosts(
  clusters: ClusterPostsByThemeOutput,
  posts: Post[]
): ThemeCluster[] {
  const postMap = new Map(posts.map((post) => [post.id, post]));
  return clusters.map((cluster) => ({
    theme: cluster.theme,
    posts: cluster.posts.map((p) => postMap.get(p.id)!).filter(Boolean),
  }));
}

export default function WhisperWallClient({
  initialPosts,
  initialClusters,
}: WhisperWallClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [clusters, setClusters] = useState<ThemeCluster[]>(initialClusters);
  const [isClustering, startClustering] = useTransition();
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const { toast } = useToast();

  const refetchClusters = useCallback(async (currentPosts: Post[]) => {
    if (currentPosts.length === 0) {
      setClusters([]);
      return;
    }
    startClustering(async () => {
      const postInputs: ClusterPostsByThemeInput = currentPosts.map((p) => ({
        id: p.id,
        text: p.text,
      }));
      try {
        const clusteredOutput = await clusterPostsByTheme(postInputs);
        const newClusters = mergeClustersWithPosts(clusteredOutput, currentPosts);
        setClusters(newClusters);
      } catch (error) {
        console.error('Failed to re-cluster posts:', error);
        toast({
          variant: 'destructive',
          title: 'Clustering Error',
          description: 'Could not regroup the whispers. Displaying as a list.',
        });
        setClusters([{ theme: 'Recent Whispers', posts: currentPosts }]);
      }
    });
  }, [toast]);

  const handlePostSubmitted = useCallback(
    (newPost: Post) => {
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      refetchClusters(updatedPosts);
      setIsPostFormOpen(false);
    },
    [posts, refetchClusters]
  );
  
  const handleResponseSubmitted = useCallback((postId: string, newResponse: ResponseType) => {
    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            return { ...p, responses: [newResponse, ...p.responses] };
        }
        return p;
    });
    setPosts(updatedPosts);

    // Also update the posts within the clusters
    const updatedClusters = clusters.map(cluster => ({
      ...cluster,
      posts: cluster.posts.map(p => {
        if (p.id === postId) {
            return { ...p, responses: [newResponse, ...p.responses] };
        }
        return p;
      })
    }));
    setClusters(updatedClusters);

  }, [posts, clusters]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="text-center py-4 flex items-center justify-center gap-2">
            <Link className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold text-primary">
              WhisperLink
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <div className='p-4'>
              <Dialog open={isPostFormOpen} onOpenChange={setIsPostFormOpen}>
                <DialogTrigger asChild>
                    <Button className='w-full'>
                        <PenSquare className='mr-2' />
                        New Whisper
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share a Whisper</DialogTitle>
                    </DialogHeader>
                    <PostForm onPostSubmitted={handlePostSubmitted} />
                </DialogContent>
              </Dialog>
            </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <header className="py-8 flex items-center gap-4">
                <SidebarTrigger />
                <p className="text-muted-foreground text-lg flex-grow">
                    Share your story. Find your connection.
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bell />
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          You have no new notifications.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mt-12">
                {isClustering ? (
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
                ) : (
                    clusters.map((cluster) => (
                    <ThemeClusterComponent key={cluster.theme} cluster={cluster} onResponseSubmitted={handleResponseSubmitted} />
                    ))
                )}
                </div>
            </main>

            <footer className="py-6 text-center text-muted-foreground text-sm">
                <p>WhisperLink &copy; {new Date().getFullYear()}. Anonymity and safety are our priorities.</p>
                <p className="mt-1">Powered by Google AI and a community that cares.</p>
            </footer>
        </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
