'use client';

import { useRef, useState } from "react";

import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { fetchResponse } from "@/app/api/openai/utils";

import { useStreamNice } from "@/lib/StreamNice/hooks/useStreamNice";
import { StreamNice } from "@/lib/StreamNice";
import { STOPS, STREAM } from "@/lib/StreamNice/enums";
import { RegMatch, RegPrefix, RegStem } from "@/lib/StreamNice/utils";
import { InStreamComponent, InStreamComponents, StreamConfig } from "@/lib/StreamNice/types";

import colors from "tailwindcss/colors"

const config: StreamConfig = {
    stream: STREAM.smooth,
    speed: 40,
    stops: [
        {
            signs: [STOPS.mid],
            duration: 400,
        },
        {
            signs: [STOPS.end],
            duration: 750,
        },
    ],
    styled: [
        {
            targets: [RegMatch("on", false)],
            style: {
                color: colors.pink[300],
            },
        },
        {
            targets: [RegStem("talv", false)],
            style: {
                color: colors.blue[300],
            },
        },
    ],
    components: [
        {
            targets: [RegStem("talv", false)],
            id: 'my-link'
        },
    ],
    debug: false,
};


const MyLink = ({ id, match }: InStreamComponent) => (
    <button className="px-2 py-1 rounded bg-amber-200 text-zinc-100">{match}</button>
);

const components: InStreamComponents = {
    "my-link": MyLink,
};

export default function Home() {
    const [input, setInput] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { segs, setSegs, streamReader } = useStreamNice(config)
    useScroll(scrollRef, segs)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        setInput("");
        setSegs([]);

        try {
            const res = await fetchResponse(text, "Do exactly as said");
            if (!res?.body) throw new Error("No response body");
            const reader = res.body.getReader();

            await streamReader(reader, (next, end) => {
                if (end.error) {
                    console.error("📌 error", end.error)
                    return
                }

                if (end.done) {
                    console.log(end.content)
                    return
                }

                setSegs(prev => [...prev, next]);
            })

        } catch (err) {
            console.error(err)
        }
    }


    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex flex-col">
            <div
                className="h-2/3 bg-indigo-300/3 p-10 rounded-2xl flex my-10 overflow-y-scroll whitespace-pre-wrap pr-8 scroll-bar"
                ref={scrollRef}
            >
                <StreamNice segs={segs} inStream={components} className="text-xl leading-9" />

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


