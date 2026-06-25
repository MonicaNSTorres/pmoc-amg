import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-100">
            <AppSidebar />

            <main className="ml-64 min-h-screen p-8">
                {children}
            </main>
        </div>
    );
}