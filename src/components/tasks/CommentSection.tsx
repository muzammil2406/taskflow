'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { Comment as CommentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Send } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/hooks/useUser';

const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty.'),
});

interface CommentSectionProps {
  taskId: string;
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore || !taskId || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'tasks', taskId, 'comments'), orderBy('createdAt', 'asc'));
  }, [firestore, taskId, user]);

  const { data: comments, isLoading: loadingComments } = useCollection<CommentType>(commentsQuery);

  const onSubmit = async (values: z.infer<typeof commentSchema>) => {
    if (!user || !commentsQuery || !firestore) return;
    setIsSubmitting(true);
    
    const commentCollectionRef = collection(firestore, 'users', user.uid, 'tasks', taskId, 'comments');
    
    addDocumentNonBlocking(commentCollectionRef, {
        taskId,
        userId: user.uid,
        userName: user.name,
        userPhotoURL: user.photoURL,
        text: values.text,
        createdAt: serverTimestamp(),
      });

    form.reset();
    setIsSubmitting(false);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="pt-6 h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        <div className="flex-1 space-y-4 pr-2 overflow-y-auto">
            {loadingComments ? (
                 [...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                ))
            ) : comments && comments.length > 0 ? (
                comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.userPhotoURL || undefined} />
                    <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{comment.userName}</p>
                        <p className="text-xs text-muted-foreground">
                        {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                        </p>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center pt-8">No comments yet. Start the conversation!</p>
            )}
        </div>
        <div className="mt-4 pt-4 border-t">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start space-x-2">
                <Avatar className="h-10 w-10 hidden sm:block">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormControl>
                        <Textarea placeholder="Add a comment..." {...field} className="min-h-[40px]"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" size="icon" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
            </form>
            </Form>
        </div>
    </div>
  );
}
