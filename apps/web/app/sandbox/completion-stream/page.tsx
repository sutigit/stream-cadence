'use client';

import { useEffect, useRef, useState } from "react";

import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { fetchResponse } from "@/app/api/openai/utils";

import { useStreamNice } from "../lib/StreamNice/hooks/useStreamNice";
import { StreamNice } from "../lib/StreamNice";

const STOPS = {
    dots: '.',
    commas: ',',
    question: '',
    exclamation: '',
    end: '',
    mid: ''
}

const STREAM = {
    smooth: 'smooth',
    word: 'word',
}

const options = {
    stream: STREAM.smooth,
    speed: 20,
    stops: [
        {
            sign: [STOPS.dots],
            duration: 800,
        },
        {
            sign: [STOPS.commas],
            duration: 500,
        },
    ],
    highlights: [
        {
            sign: ['!bold:'],
            style: {
                fontWeight: 'bold',
                color: 'orange'
            }
        },
        {
            sign: ['!name:'],
            style: {
                fontWeight: 'bold',
                color: 'pink'
            }
        }
    ]
}

export default function Home() {
    const [input, setInput] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { segs, setSegs, streamReader } = useStreamNice()
    useScroll(scrollRef, segs)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        setInput("");
        setSegs([]);

        try {
            const res = await fetchResponse(text);
            if (!res?.body) throw new Error("No response body");
            const reader = res.body.getReader();

            await streamReader(reader, (next) => {
                setSegs(prev => [...prev, next]);
            })

        } catch (err) {
            console.error("📌", err)
        }
    }


    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex flex-col">
            <div
                className="h-2/3 bg-indigo-300/3 p-10 rounded-2xl flex my-10 overflow-y-scroll whitespace-pre-wrap pr-8 scroll-bar"
                ref={scrollRef}
            >
                <StreamNice segs={segs} className="text-2xl leading-9" />

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


