'use client';

import { useEffect, useRef, useState } from "react";
import ChatInput from "../../components/chat-input";

import "./cadence.css"
import { useScroll } from "@/hooks/use-scroll";


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
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex">
            <section className="px-20 flex-2 h-full flex flex-col justify-center items-center">
                <div
                    className="w-full flex mb-20 overflow-y-scroll h-[9rem] whitespace-pre-wrap pr-8 scroll-bar"
                    ref={scrollRef}
                >
                    <p className="text-xl leading-9">
                        Hello
                    </p>
                </div>
                <ChatInput onSubmit={onSubmit} input={input} setInput={setInput} />
            </section>
        </main>
    );
}
