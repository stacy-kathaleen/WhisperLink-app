
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  getSuggestedResponsesAction,
  submitResponseAction,
} from '@/app/actions';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Post, Response as ResponseType } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { TimeAgo } from './time-ago';
import { Card, CardContent } from './ui/card';

interface ResponseDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onResponseSubmitted: (postId: string, newResponse: ResponseType) => void;
}

const MAX_RESPONSE_LENGTH = 300;

export default function ResponseDialog({
  post,
  isOpen,
  onOpenChange,
  onResponseSubmitted
}: ResponseDialogProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseText, setResponseText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsLoadingSuggestions(true);
      getSuggestedResponsesAction(post.text)
        .then(setSuggestions)
        .catch(() => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load AI suggestions.',
          });
        })
        .finally(() => setIsLoadingSuggestions(false));
    } else {
      // Reset state on close
      setSuggestions([]);
      setResponseText('');
    }
  }, [isOpen, post.text, toast]);

  const handleSubmit = async () => {
    if (responseText.trim().length === 0 || responseText.length > MAX_RESPONSE_LENGTH) {
        toast({
            variant: "destructive",
            title: "Invalid Response",
            description: "Response cannot be empty or over 300 characters."
        });
        return;
    }

    setIsSubmitting(true);
    const result = await submitResponseAction(post.id, responseText);
    if(result.success && result.response) {
        toast({
            title: "Success",
            description: result.message
        });
        onResponseSubmitted(post.id, result.response);
        onOpenChange(false);
    } else {
        toast({
            variant: "destructive",
            title: "Response Failed",
            description: result.message
        });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Respond to Whisper</DialogTitle>
          <DialogDescription>
            Your response is anonymous. Be kind and supportive.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/50 border-none shadow-none">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">
                Whispered <TimeAgo date={post.createdAt} />
            </p>
            <p>{post.text}</p>
          </CardContent>
        </Card>
        
        {post.responses.length > 0 && (
            <div className="space-y-2">
                <h4 className="font-semibold text-sm">Previous Responses</h4>
                <ScrollArea className="h-24 rounded-md border p-2">
                {post.responses.map(res => (
                    <div key={res.id} className="text-sm p-2 border-b last:border-b-0">
                        <p>{res.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <TimeAgo date={res.createdAt} />
                        </p>
                    </div>
                ))}
                </ScrollArea>
            </div>
        )}

        <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Suggested Responses
            </h4>
            {isLoadingSuggestions ? (
                <div className='flex gap-2'>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                        <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setResponseText(suggestion)}
                        >
                        {suggestion}
                        </Button>
                    ))}
                </div>
            )}
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
              <Textarea
                  placeholder="Write your own supportive response..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  maxLength={MAX_RESPONSE_LENGTH}
                  className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                  <p className={`text-sm ${
                      responseText.length > MAX_RESPONSE_LENGTH ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                      {responseText.length} / {MAX_RESPONSE_LENGTH}
                  </p>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                      ) : (
                      <Send />
                      )}
                      <span>Send Response</span>
                  </Button>
              </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
