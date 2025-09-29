'use client';

import { useEffect, useRef, useState } from "react";

import "../../cadence.css"
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";


export default function Home() {
    const [input, setInput] = useState<string>("");
    const [texts, setTexts] = useState()
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    useScroll(scrollRef, texts)


    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;

        setInput("");
        setLoading(true);

        try {


        } finally {
            setLoading(false);
        }
    }


    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex flex-col">
            <h1 className="px-20 pt-5 text-xl text-red-300 text-center w-full">completion-stream</h1>
            <section className="px-20 flex-2 h-full flex flex-col justify-center items-center">
                <div
                    className="w-full flex mb-20 overflow-y-scroll h-[9rem] whitespace-pre-wrap pr-8 scroll-bar"
                    ref={scrollRef}
                >
                    <p className="text-xl leading-9">
                        Hello
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
            </section>
        </main>
    );
}
