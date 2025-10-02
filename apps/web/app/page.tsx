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


export default function Home() {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // timings
  const [charsPerSec, setCharsPerSec] = useState<number>(20)
  const [shortPause, setShortPause] = useState<number>(300)
  const [longPause, setLongPause] = useState<number>(800)
  const [readSpeed, setReadSpeed] = useState<string>('fast')

  // const { streamReader, segs, setSegs } = useStreamNice(options)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setInput("");
    setLoading(true);

    const res = await fetchResponse(input);
    if (!res?.body) throw new Error("No response body");
    const reader = res.body.getReader();

    // await streamReader(reader, (next) => {
    //      setSegs(prev => [...prev, next]);
    // })

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

          </p>
        </div>
        <ChatInput onSubmit={onSubmit} input={input} setInput={setInput} />
      </section>

      <aside className="flex-1 h-full flex justify-center items-center">
        <section className="border-l-4 border-zinc-800/70 py-5 px-15 flex flex-col gap-14">

          <div>
            <p className="mb-4 opacity-50 flex items-center gap-2">
              Streaming speed
              <Rabbit size={18} />
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => setReadSpeed('slow')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'slow' ? 'bg-zinc-100' : 'bg-zinc-400')}>Slow</Button>
              <Button onClick={() => setReadSpeed('average')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'average' ? 'bg-zinc-100' : 'bg-zinc-400')}>Average</Button>
              <Button onClick={() => setReadSpeed('fast')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'fast' ? 'bg-zinc-100' : 'bg-zinc-400')}>Fast</Button>
              <Button onClick={() => setReadSpeed('custom')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'custom' ? 'bg-zinc-100' : 'bg-zinc-400')}>Custom</Button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <p className="mb-4 opacity-50 flex items-center gap-2 w-full">Advanced settings<Settings2 size={18} /><Copy className="cursor-pointer ml-auto" size={16} /></p>
            </div>
            <div className="flex flex-col gap-7 w-full">
              <div>
                <p className="opacity-50 mb-3 text-sm">Characters per second: {charsPerSec}</p>
                <Slider defaultValue={[charsPerSec]} max={100} step={1} onValueChange={(values) => setCharsPerSec((values[0] ?? 1))} />
              </div>
              <div>
                <p className="opacity-50 mb-3 text-sm">Short pause: {shortPause} ms</p>
                <Slider defaultValue={[shortPause]} max={1000} step={1} onValueChange={(values) => setShortPause((values[0] ?? 1))} />
              </div>
              <div>
                <p className="opacity-50 mb-3 text-sm">Long pause: {longPause} ms</p>
                <Slider defaultValue={[longPause]} max={1000} step={1} onValueChange={(values) => setLongPause((values[0] ?? 1))} />
              </div>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
