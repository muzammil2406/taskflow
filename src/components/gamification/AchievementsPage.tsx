'use client';

import { useUser } from '@/hooks/useUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ALL_ACHIEVEMENTS } from '@/lib/gamification';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function AchievementsPage() {
    const { user, loading } = useUser();

    if(loading) {
        return (
             <div className="mx-auto grid w-full max-w-6xl gap-2">
                <h1 className="text-3xl font-semibold">Achievements</h1>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    const earnedAchievements = user?.achievements || [];

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Achievements</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Your Badges</CardTitle>
                    <CardDescription>
                        You have unlocked {earnedAchievements.length} of {ALL_ACHIEVEMENTS.length} achievements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {ALL_ACHIEVEMENTS.map(achievement => {
                                const isEarned = earnedAchievements.includes(achievement.id);
                                return (
                                    <Tooltip key={achievement.id}>
                                        <TooltipTrigger asChild>
                                            <div className={cn(
                                                "flex flex-col items-center justify-center gap-2 p-4 border rounded-lg aspect-square transition-all",
                                                isEarned ? "bg-accent/20 border-accent" : "bg-muted/50 filter grayscale opacity-60"
                                            )}>
                                                <div className="relative">
                                                     <achievement.icon className={cn("h-16 w-16", isEarned ? "text-accent" : "text-muted-foreground")} />
                                                     {!isEarned && <Lock className="absolute -bottom-1 -right-1 h-5 w-5 bg-muted rounded-full p-1"/>}
                                                </div>
                                                <p className="text-sm font-semibold text-center">{achievement.name}</p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{achievement.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </TooltipProvider>
                </CardContent>
            </Card>
        </div>
    );
}
