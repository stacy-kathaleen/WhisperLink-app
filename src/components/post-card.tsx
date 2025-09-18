
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart } from 'lucide-react';
import ResponseDialog from '@/components/response-dialog';
import type { Post, Response as ResponseType } from '@/lib/types';
import { TimeAgo } from './time-ago';

interface PostCardProps {
  post: Post;
  onResponseSubmitted: (postId: string, newResponse: ResponseType) => void;
}

export default function PostCard({ post, onResponseSubmitted }: PostCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
      >
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            <TimeAgo date={post.createdAt} />
          </p>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-foreground/90">{post.text}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>
              {post.responses.length} {post.responses.length === 1 ? 'response' : 'responses'}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10" onClick={() => setIsDialogOpen(true)}>
            <Heart className="w-4 h-4 mr-2" />
            Respond
          </Button>
        </CardFooter>
      </Card>
      <ResponseDialog
        post={post}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onResponseSubmitted={onResponseSubmitted}
      />
    </>
  );
}
