'use client';

import { useEffect, useRef, useState } from "react";

import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { fetchResponse } from "@/app/api/openai/utils";

const text = `
In the beginning, Hydrogen drifted alone through the void, restless and abundant. It sought company, and when it met Oxygen, a spark lit the darkness. Together they danced as water, flowing through the newborn world.

Helium watched from a distance, serene and untouchable, content to float above the fray. Noble and reserved, it rarely spoke, but its quiet presence filled the stars with light.

Carbon arrived with patience. It built bridges, chains, and rings, linking atoms into endless patterns. From its designs, the first whispers of life took shape, fragile yet determined.

Iron rose from the heart of fire. Strong, magnetic, and steady, it became the bones of planets and the blood of creatures. Without complaint, it carried the weight of both earth and body.

Gold lay hidden in stone, shining only when discovered. It did not tarnish, did not falter. For ages, it was treasured as a symbol of permanence in a world of change.

And deep below, Uranium stirred. Heavy, unstable, yet full of energy, it remained a secret—its power dangerous, its promise immense.

Each element had a role. Alone they were characters, together they were the script: the architecture of galaxies, the chemistry of oceans, the spark of breath. Their story was not finished, for it was the story of everything.
`

export default function Home() {
    const scrollRef = useRef<HTMLDivElement>(null);
    useScroll(scrollRef, text)


    return (
        <main className="container mx-auto h-screen max-h-screen min-h-screen flex flex-col">
            <div
                className="h-2/3 max-h-2/3 bg-indigo-300/3 px-10 rounded-2xl flex m-10 overflow-y-scroll whitespace-pre-wrap pr-8 scroll-bar"
                ref={scrollRef}
            >
                <p className="text-xl leading-9">
                    {text}
                </p>
            </div>
            <Button className="bg-indigo-400 self-center rounded-full px-40" size="lg">Stream Text</Button>
        </main>
    );
}
