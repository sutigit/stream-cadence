'use client';

import { useEffect, useRef, useState } from "react";

import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { fetchResponse } from "@/app/api/openai/utils";
import { cn } from "@/lib/utils";

interface Message {
    type: "user" | "system";
    content: string;
}

export default function Home() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [completion, setCompletion] = useState<string>("");

    const scrollRef = useRef<HTMLDivElement>(null);
    useScroll(scrollRef, [messages, completion]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        // push user message immediately
        setMessages(prev => [...prev, { type: "user", content: text }]);
        setInput("");
        setCompletion("");
        setLoading(true);

        try {
            const res = await fetchResponse(text);
            if (!res?.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let sysText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                // { stream: true }buffers incomplete sequences
                const chunk = decoder.decode(value, { stream: true });
                if (chunk) {
                    sysText += chunk;
                    setCompletion(prev => prev + chunk);
                }
            }

            // flush decoder to avoid losing last character(s)
            const tail = decoder.decode();
            if (tail) {
                sysText += tail;
                setCompletion(prev => prev + tail);
            }

            // now append the completed system message
            setMessages(prev => [...prev, { type: "system", content: sysText }]);
            setCompletion("");
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                { type: "system", content: `Error: ${err?.message || "stream failed"}` },
            ]);
            setCompletion("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex flex-col">
            <div
                className="h-2/3 bg-indigo-300/3 p-10 rounded-2xl flex-col gap-20 my-10 overflow-y-scroll whitespace-pre-wrap pr-8 scroll-bar"
                ref={scrollRef}
            >
                {messages.map((m, idx) => (
                    <p
                        key={idx}
                        className={cn(
                            "text-xl leading-9",
                            m.type === "user" && "text-indigo-400 text-right"
                        )}
                    >
                        {m.content}
                    </p>
                ))}

                {/* live streamed tokens */}
                {completion && (
                    <p className="text-xl leading-9">
                        {completion}
                    </p>
                )}
            </div>

            <form onSubmit={onSubmit} className="flex mx-auto gap-5 bg-zinc-800 rounded-3xl py-3 pl-8 pr-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything"
                    className="w-full outline-none"
                    disabled={loading}
                />
                <Button
                    type="submit"
                    className="h-10 text-primary aspect-square bg-indigo-500 flex justify-center items-center rounded-full disabled:opacity-50"
                    disabled={loading}
                >
                    <Send size={20} />
                </Button>
            </form>
        </main>
    );
}
