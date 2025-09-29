import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SandboxLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <nav className="flex gap-3 mt-5 w-full flex justify-center">
                <Button className="rounded-full">
                    <Link href="/sandbox/text-stream">text-stream</Link>
                </Button>

                <Button className="rounded-full">
                    <Link href="/sandbox/completion-stream">completion-stream</Link>
                </Button>

                <Button className="rounded-full">
                    <Link href="/sandbox/stored-completion-stream">stored-completion-stream</Link>
                </Button>

                <Button className="rounded-full">
                    <Link href="/sandbox/conversation-stream">conversation-stream</Link>
                </Button>
            </nav>
            {children}
        </main>
    );
}
