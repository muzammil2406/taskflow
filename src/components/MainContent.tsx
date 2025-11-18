'use client';

import { TaskProvider } from "@/contexts/TaskContext";
import { AppSidebar } from "./layout/AppSidebar";
import { Navbar } from "./layout/Navbar";

export function MainContent({ children }: { children: React.ReactNode }) {
    return (
        <TaskProvider>
            <div className="flex min-h-screen w-full bg-muted/40">
                <AppSidebar />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
                    <Navbar />
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        {children}
                    </main>
                </div>
            </div>
        </TaskProvider>
    );
}
