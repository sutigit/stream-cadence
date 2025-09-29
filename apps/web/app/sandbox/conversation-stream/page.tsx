'use client';

import { useEffect, useRef, useState } from "react";

import "../../cadence.css"
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { fetchResponse } from "@/app/api/openai/utils";


export default function Home() {
    const [input, setInput] = useState<string>("");
    const [texts, setTexts] = useState()
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    useScroll(scrollRef, texts)

    const [completion, setCompletion] = useState<string>("")

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;

        setInput("");
        setLoading(true);

        try {

            const res = await fetchResponse(input)

            const dec = new TextDecoder()
            const reader = res.body!.getReader()

            while (true) {
                const { value, done } = await reader.read()
                if (done) return

                setCompletion(prev => prev + dec.decode(value))
            }

        } finally {
            setLoading(false);
        }
    }


    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex flex-col">
            <div
                className="h-2/3 bg-indigo-300/3 p-10 rounded-2xl flex my-10 overflow-y-scroll whitespace-pre-wrap pr-8 scroll-bar"
                ref={scrollRef}
            >
                <p className="text-xl leading-9">
                    {completion}
                </p>
            </div>
            <form onSubmit={onSubmit} className="flex mx-auto gap-5 bg-zinc-800 rounded-3xl py-3 pl-8 pr-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything"
                    className="w-full outline-none "
                />
                <Button
                    type="submit"
                    className="h-10 text-primary cursor-pointer aspect-square bg-indigo-500 flex justify-center items-center rounded-full"
                >
                    <Send size={20} />
                </Button>
            </form>
        </main>
    );
}
