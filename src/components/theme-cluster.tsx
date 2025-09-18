'use client';

import { ThemeCluster, Response as ResponseType } from '@/lib/types';
import PostCard from '@/components/post-card';
import { motion } from 'framer-motion';

interface ThemeClusterComponentProps {
  cluster: ThemeCluster;
  onResponseSubmitted: (postId: string, newResponse: ResponseType) => void;
}

export default function ThemeClusterComponent({ cluster, onResponseSubmitted }: ThemeClusterComponentProps) {
  return (
    <motion.div
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-headline font-bold text-foreground/80 mb-6 pb-2 border-b-2 border-accent/50">
        {cluster.theme}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cluster.posts.map((post) => (
          <PostCard key={post.id} post={post} onResponseSubmitted={onResponseSubmitted} />
        ))}
      </div>
    </motion.div>
  );
}
