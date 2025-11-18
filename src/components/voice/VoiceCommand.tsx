'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, Loader2, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { createTaskFromVoiceAction } from '@/app/actions/ai';
import { useTasks } from '@/hooks/useTasks';
import { doc, Timestamp, collection } from 'firebase/firestore';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { useUser } from '@/hooks/useUser';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function VoiceCommand() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { users } = useTasks();
  const { user } = useUser();
  const firestore = useFirestore();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setIsDialogOpen(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice commands.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      
      try {
        const taskDetails = await createTaskFromVoiceAction(base64Audio, users);

        if (taskDetails && user && firestore) {
           const tasksCollectionRef = collection(firestore, 'users', user.uid, 'tasks');
           const newTask = {
                title: taskDetails.title,
                description: taskDetails.description || '',
                status: 'todo',
                priority: taskDetails.priority || 'medium',
                dueDate: taskDetails.dueDate ? Timestamp.fromDate(new Date(taskDetails.dueDate)) : null,
                assignedTo: taskDetails.assignedTo || null,
                createdBy: user.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
           };
           addDocumentNonBlocking(tasksCollectionRef, newTask);
           toast({
               title: "Task Created by Voice!",
               description: `Task "${taskDetails.title}" has been added to your board.`,
           });
        } else {
            throw new Error("Failed to get task details from AI.");
        }

      } catch (error) {
        console.error("Error processing voice command:", error);
        toast({
          title: "Voice Command Failed",
          description: "Could not create a task from your voice command.",
          variant: "destructive",
        });
      } finally {
        audioChunksRef.current = [];
        setIsProcessing(false);
        setIsDialogOpen(false);
      }
    };
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    // Clean up stream on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <Button variant="outline" size="icon" onClick={toggleRecording} disabled={isProcessing}>
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Command Active</DialogTitle>
            <DialogDescription>
              {isRecording ? "I'm listening... Tell me what task to create." : "Processing your command..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-24">
             {isRecording && <div className="h-16 w-16 bg-red-500 rounded-full animate-pulse" />}
             {isProcessing && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
          </div>
          <DialogFooter>
             {isRecording && (
                <Button variant="destructive" onClick={stopRecording}>
                    <Square className="mr-2 h-4 w-4" /> Stop Recording
                </Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
