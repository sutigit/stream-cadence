'use client';

import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/chat-input";
import { cadenceLLM, useStreamCadence } from "./utils/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Copy, Glasses, Rabbit, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { fetchResponse } from "./api/openai/utils";
import { useStreamNice } from "@/lib/StreamNice/hooks/useStreamNice";
import { StreamConfig } from "@/lib/StreamNice/types";


export default function Home() {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // timings
  const [charsPerSec, setCharsPerSec] = useState<number>(30)
  const [shortPause, setShortPause] = useState<number>(300)
  const [longPause, setLongPause] = useState<number>(800)
  const [readSpeed, setReadSpeed] = useState<string>('fast')

  const options: StreamConfig = {
    speed: charsPerSec
  }

  const { streamReader, segs, setSegs } = useStreamNice(options)


  return (
    <main className="container mx-auto py-20 h-screen max-h-screen min-h-screen">
      <div className="mb-10">
        <p className="text-6xl font-bold mb-2">Customize AI message</p>
        <p className="text-6xl font-bold">streams with ease.</p>
      </div>
      <div className="w-full h-2/3 grid grid-cols-3 gap-1">

        {/* Chat container --------------------- */}
        <div className="chat-container w-full h-full px-6 py-4 col-span-2 bg-orange-100/80 rounded-2xl grid place-items-center">
          <div className="w-full h-full flex flex-col justify-between">
            <p className="text-primary-foreground font-bold text-lg mb-3">Your AI message</p>
            <div className="h-15 w-full bg-orange-200/50 shadow-md rounded-full flex flex-row justify-between items-center pl-6 pr-3">
              <p className="italic text-primary-foreground/40">Type your message here</p>
              <div className="h-10 aspect-square rounded-full bg-indigo-200"></div>
            </div>
          </div>
        </div>

        {/* Chat settings ---------------------- */}
        <div className="chat-settings w-full h-full grid col-span-1 grid-rows-4 gap-1">


          {/* system prompt ----------------------*/}
          <div className="system-prompt px-6 py-4 w-full h-full bg-lime-100/80 row-span-2 rounded-2xl grid place-items-center">
            <div className="w-full h-full">
              <p className="text-primary-foreground font-bold text-xl mb-4">System prompt</p>
              <p className="text-primary-foreground/80 leading-5 whitespace-pre-line">
                {
                  `Prefix all the key stuff regarding the topic with !key:

                  e.g. 
                  Lorem !key:ipsum`
                }
              </p>
            </div>
          </div>

          {/* Stream cadence and speed -------------- */}
          <div className="stream-cadence-and-speed row-span-1 grid grid-cols-3 gap-1">
            <div className="stream-speed-slider px-6 py-4 bg-stone-100/80 rounded-2xl col-span-2 grid place-items-center">
              <div className="w-full h-full">
                <p className="text-primary-foreground font-bold text-lg mb-3">Streaming speed</p>
              </div>
            </div>
            <div className="cadence-switch px-6 py-4 bg-red-100/80 rounded-2xl col-span-1 grid place-items-center">
              <div className="w-full h-full">
                <p className="text-primary-foreground font-bold text-lg mb-3">Cadence</p>
              </div>
            </div>
          </div>

          {/* Styled and components ----------------- */}
          <div className="stream-switches row-span-1 grid grid-cols-2 gap-1">
            <div className="switch-highlighs px-6 py-4 bg-purple-100/80 rounded-2xl grid place-items-center">
              {/* highlights switch */}
              <div className="w-full h-full">
                <p className="text-primary-foreground font-bold text-lg mb-3">Highlights</p>
              </div>
            </div>
            <div className="switch-interactions px-6 py-4 bg-emerald-100/80 rounded-2xl grid place-items-center">
              {/* interactions switch */}
              <div className="w-full h-full">
                <p className="text-primary-foreground font-bold text-lg mb-3">Interactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
