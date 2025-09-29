import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {


    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex items-center justify-center">
            <section>
                <h1 className="text-4xl text-center">Sandbox</h1>
                <div className="flex gap-5 mt-5">
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
                </div>
            </section>
        </main>
    );
}
