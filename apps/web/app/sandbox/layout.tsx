'use client'

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SandboxLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname() ?? '';

    // derive active key from the current pathname (last segment)
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] ?? '';
    const allowed = [
        'text',
        'completion',
        'conversation',
    ];
    const active = allowed.includes(last) ? last : '';

    const btnBase = 'rounded-full bg-indigo-200 transition-transform duration-150';
    const activeClass = 'opacity-100 scale-105 bg-indigo-400 text-white shadow-lg';
    const inactiveClass = 'opacity-80 hover:opacity-100';

    return (
        <main>
            <nav className="flex gap-3 mt-5 w-full flex justify-center">
                <Button
                    className={cn(btnBase, active === 'text' ? activeClass : inactiveClass)}
                    size="lg"
                >
                    <Link href="/sandbox/text">Text</Link>
                </Button>

                <Button
                    className={cn(btnBase, active === 'completion' ? activeClass : inactiveClass)}
                    size="lg"
                >
                    <Link href="/sandbox/completion">Completion</Link>
                </Button>

                <Button
                    className={cn(btnBase, active === 'conversation' ? activeClass : inactiveClass)}
                    size="lg"
                >
                    <Link href="/sandbox/conversation">Conversation</Link>
                </Button>
            </nav>
            {children}
        </main>
    );
}
