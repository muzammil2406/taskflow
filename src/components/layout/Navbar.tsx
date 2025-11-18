'use client';
import {
  Search,
  PanelLeft,
  PlusCircle,
  Mic,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useTasks } from '@/hooks/useTasks';
import { useState } from 'react';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import router from 'next/router';
import { useRouter } from 'next/navigation';
import VoiceCommand from '../voice/VoiceCommand';


export function Navbar() {
    const { user } = useUser();
    const { toast } = useToast();
    const { setFilters } = useTasks();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast({ title: "You've been logged out." });
        } catch (error) {
            toast({ title: 'Error logging out', variant: 'destructive' });
        }
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                {/* Mobile sidebar content can be replicated here */}
            </SheetContent>
            </Sheet>
            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search tasks..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                />
            </div>
             <div className="flex items-center gap-2 ml-auto">
                <VoiceCommand />
                <Button size="sm" className="h-8 gap-1" onClick={() => setCreateModalOpen(true)}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        New Task
                    </span>
                </Button>
            </div>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
                >
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.name || 'User'} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/support')}>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            {isCreateModalOpen && <TaskDetailModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />}
        </header>
    );
}
