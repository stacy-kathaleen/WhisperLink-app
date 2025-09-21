
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
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Bell, Link, PenSquare, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { ThemeToggle } from './theme-toggle';

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

  const handleManualCluster = useCallback(() => {
    if (posts.length === 0) {
      setClusters([]);
      return;
    }
    startClustering(async () => {
      const postInputs: ClusterPostsByThemeInput = posts.map((p) => ({
        id: p.id,
        text: p.text,
      }));
      try {
        const clusteredOutput = await clusterPostsByTheme(postInputs);
        const newClusters = mergeClustersWithPosts(clusteredOutput, posts);
        setClusters(newClusters);
        toast({
          title: 'Success!',
          description: 'The whispers have been regrouped into new themes.',
        });
      } catch (error) {
        console.error('Failed to re-cluster posts:', error);
        toast({
          variant: 'destructive',
          title: 'Clustering Error',
          description: 'Could not regroup the whispers at this time. Please try again later.',
        });
      }
    });
  }, [posts, toast]);


  const handlePostSubmitted = useCallback(
    (newPost: Post) => {
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      
      const recentWhispersTheme = 'Recent Whispers';
      const existingClusterIndex = clusters.findIndex(c => c.theme === recentWhispersTheme);

      if (existingClusterIndex !== -1) {
        // Add to existing "Recent Whispers" theme
        const updatedClusters = [...clusters];
        updatedClusters[existingClusterIndex].posts = [newPost, ...updatedClusters[existingClusterIndex].posts];
        setClusters(updatedClusters);
      } else {
        // Create new "Recent Whispers" theme and add it to the top
        const newCluster: ThemeCluster = {
          theme: recentWhispersTheme,
          posts: [newPost],
        };
        setClusters([newCluster, ...clusters]);
      }

      setIsPostFormOpen(false);
    },
    [posts, clusters]
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
          <div className="text-center py-4 flex items-center justify-center gap-2 border-b">
            <Link className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-headline font-bold text-foreground">
              WhisperLink
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <div className='p-4 space-y-2'>
              <Dialog open={isPostFormOpen} onOpenChange={setIsPostFormOpen}>
                <DialogTrigger asChild>
                    <Button className='w-full' size="lg">
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
              <Button variant="outline" className="w-full" onClick={handleManualCluster} disabled={isClustering}>
                  {isClustering ? (
                      <RefreshCw className="mr-2 animate-spin" />
                  ) : (
                      <RefreshCw className="mr-2" />
                  )}
                  Refresh Themes
              </Button>
            </div>
        </SidebarContent>
        <SidebarFooter>
          <div className='p-4'>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
            <header className="p-4 flex items-center gap-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <SidebarTrigger />
                <p className="text-muted-foreground text-sm md:text-base flex-grow">
                    An anonymous, AI-mediated peer support platform.
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bell />
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="grid gap-2">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time notifications are not yet enabled.
                        </p>
                      </div>
                      <Separator />
                      <div className="text-center text-xs text-muted-foreground p-4">
                        <p>This is where you'll see updates when people respond to your whispers.</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mt-8">
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

            <footer className="py-6 text-center text-muted-foreground text-xs border-t">
                <p>WhisperLink &copy; {new Date().getFullYear()}. Anonymity and safety are our priorities.</p>
                <p className="mt-1">Powered by Google AI and a community that cares.</p>
            </footer>
        </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
