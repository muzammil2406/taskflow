'use client';

import Link from 'next/link';
import {
  KanbanSquare,
  LayoutDashboard,
  Settings,
  Users,
  LineChart,
  Calendar,
  Award,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <KanbanSquare className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">TaskZen</span>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                    "bg-accent text-accent-foreground": pathname === '/',
                })}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/calendar"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                    "bg-accent text-accent-foreground": pathname === '/calendar',
                })}
              >
                <Calendar className="h-5 w-5" />
                <span className="sr-only">Calendar</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Calendar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/analytics"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                    "bg-accent text-accent-foreground": pathname === '/analytics',
                })}
              >
                <LineChart className="h-5 w-5" />
                <span className="sr-only">Analytics</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Analytics</TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/achievements"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                    "bg-accent text-accent-foreground": pathname === '/achievements',
                })}
              >
                <Award className="h-5 w-5" />
                <span className="sr-only">Achievements</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Achievements</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/team"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                    "bg-accent text-accent-foreground": pathname === '/team',
                })}
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Team</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Team</TooltipContent>
          </Tooltip>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8", {
                    "bg-accent text-accent-foreground": pathname === '/settings',
                })}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
