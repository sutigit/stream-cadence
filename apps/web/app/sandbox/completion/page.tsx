'use client';

import { useRef, useState } from "react";

import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { fetchResponse } from "@/app/api/openai/utils";

import { useStreamNice } from "@/lib/StreamNice/hooks/useStreamNice";
import StreamNice from "@/lib/StreamNice";
import { STOPS, STREAM } from "@/lib/StreamNice/enums";
import { RegMatch, RegPrefix, RegStem } from "@/lib/StreamNice/utils";
import { InStreamComponent, InStreamComponents, StreamConfig } from "@/lib/StreamNice/types";

import colors from "tailwindcss/colors"

const config: StreamConfig = {
    stream: STREAM.smooth,
    speed: 30,
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
    // styled: [
    //     {
    //         targets: [RegPrefix("!winter:")],
    //         style: {
    //             color: colors.pink[300],
    //         },
    //     },
    // ],
    components: [
        {
            targets: [RegStem("saturn", false)],
            id: 'my-link'
        },
    ],
    debug: false
};


const MyLink = ({ id, match }: InStreamComponent) => (
    // remember in docs to tell people that components need to be inline components like span, buttons or inline classed components
    <div style={{ display: 'inline' }} onClick={() => console.log(match)} className="px-1 cursor-pointer py-0 rounded-md bg-amber-300 text-zinc-900">{match}</div>
);

const components: InStreamComponents = {
    "my-link": MyLink,
};

export default function Home() {
    const [input, setInput] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { next, setNext, streamReader } = useStreamNice(config)
    useScroll(scrollRef, next)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        setInput("");
        setNext(null)

        try {
            const res = await fetchResponse(text, '');
            if (!res?.body) throw new Error("No response body");
            const reader = res.body.getReader();

            await streamReader(reader, (value, end) => {
                if (end.error) throw new Error(end.error)
                if (end.done) return
                setNext(value);
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
                <StreamNice next={next} inStream={components} />
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


