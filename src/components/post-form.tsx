'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitPostAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import type { Post } from '@/lib/types';

interface PostFormProps {
  onPostSubmitted: (post: Post) => void;
}

const MAX_LENGTH = 500;

export function PostForm({ onPostSubmitted }: PostFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0 || content.length > MAX_LENGTH) {
      toast({
        variant: 'destructive',
        title: 'Invalid input',
        description: 'Your whisper cannot be empty or over 500 characters.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitPostAction(content);
      if (result.success && result.post) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        onPostSubmitted(result.post);
        setContent('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Post Failed',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not submit your whisper. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Share a Whisper</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Share your feelings anonymously..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_LENGTH}
            className="min-h-[120px] text-base"
            aria-label="New whisper content"
          />
          <div className="flex justify-between items-center">
            <p
              className={`text-sm ${
                content.length > MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {content.length} / {MAX_LENGTH}
            </p>
            <Button type="submit" disabled={isSubmitting || content.trim().length === 0}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              <span>Whisper</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
