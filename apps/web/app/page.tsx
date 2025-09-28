'use client';

import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/chat-input";
import { streamResponse } from "./api/openai/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Copy, Glasses, Rabbit, Settings2 } from "lucide-react";

// import { hello } from "@repo/stream-cadence/hello"

import "./cadence.css"
import { cn } from "@/lib/utils";

type Seg = { id: string; text: string; anim: "normal" | "short" | "long" | "space" };

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [segs, setSegs] = useState<Seg[]>([
    { id: "init", text: "Hi! To get started, send me a message using the buttons below, or just type anything you'd like.", anim: "normal" },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // timings
  const [tokenDelay, setTokenDelay] = useState<number>(100)
  const [shortPause, setShortPause] = useState<number>(300)
  const [longPause, setLongPause] = useState<number>(800)
  const [revealAnimation, setRevealAnimation] = useState<number>(500)
  const [readSpeed, setReadSpeed] = useState<string>('fast')

  // cadence tracker
  const lastEmitRef = useRef<number>(performance.now());

  function appendChunk(chunk: string) {
    const now = performance.now();
    const dt = now - lastEmitRef.current;
    lastEmitRef.current = now;

    const anim: Seg["anim"] = dt >= 1000 ? "long" : dt >= 650 ? "short" : "normal";

    // split into words and spaces so spaces render instantly
    const parts = chunk.split(/(\s+)/);
    setSegs(prev => {
      const next = [...prev];
      for (const p of parts) {
        if (!p) continue;
        if (/^\s+$/.test(p)) {
          next.push({ id: crypto.randomUUID(), text: p, anim: "space" });
        } else {
          next.push({ id: crypto.randomUUID(), text: p, anim });
        }
      }
      return next;
    });
  }

  useEffect(() => {
    queueMicrotask(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, [segs])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setSegs([]);
    setInput("");
    setLoading(true);
    lastEmitRef.current = performance.now();

    try {
      await streamResponse(
        input,
        (chunk) => appendChunk(chunk),
        { wordPauseMs: 400, shortPauseMs: 700, longPauseMs: 1200 }
      );

      // target dx
      // applyCadence(setInput, 115, 350, 700, 500) // pass number arguments
      // applyCadence(setInput, tokenDelay, shortPause, longPause, revelAnimation) // pass number type states
      // applyCadence(setInput, 'average') // pass enum type 'slow' | 'average' | 'fast'

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto h-screen max-h-screen min-h-screen flex">
      <section className="px-20 flex-2 h-full flex flex-col justify-center items-center">
        {/* <div className="pb-10 flex items-center gap-3 self-end">
          <p className="text-sm opacity-50">Ghosting</p>
          <Switch />
        </div> */}
        <div
          className="w-full flex mb-20 overflow-y-scroll h-[9rem] whitespace-pre-wrap pr-8 scroll-bar"
          ref={scrollRef}
        >
          <p className="text-2xl leading-9">
            {segs.length === 0 && (loading ? "…" : null)}
            {segs.map(s =>
              s.anim === "space" ? (
                <span key={s.id}>{s.text}</span>
              ) : (
                <span
                  key={s.id}
                  className={
                    s.anim === "long"
                      ? "chunk chunk-long"
                      : s.anim === "short"
                        ? "chunk chunk-short"
                        : "chunk"
                  }
                >
                  {s.text}
                </span>
              )
            )}
          </p>
        </div>
        <ChatInput onSubmit={onSubmit} input={input} setInput={setInput} />
      </section>

      <aside className="flex-1 h-full flex justify-center items-center">
        <section className="border-l-4 border-zinc-800/70 py-5 px-15 flex flex-col gap-14">

          <div>
            <p className="mb-4 opacity-50 flex items-center gap-2">
              Cadence speed
              <Rabbit size={18} />
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => setReadSpeed('slow')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'slow' ? 'bg-zinc-100' : 'bg-zinc-500')}>Slow</Button>
              <Button onClick={() => setReadSpeed('average')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'average' ? 'bg-zinc-100' : 'bg-zinc-500')}>Average</Button>
              <Button onClick={() => setReadSpeed('fast')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'fast' ? 'bg-zinc-100' : 'bg-zinc-500')}>Fast</Button>
              <Button onClick={() => setReadSpeed('custom')} className={cn("rounded-full cursor-pointer px-5", readSpeed === 'custom' ? 'bg-zinc-100' : 'bg-zinc-500')}>Custom</Button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <p className="mb-4 opacity-50 flex items-center gap-2 w-full">Advanced settings<Settings2 size={18} /><Copy className="cursor-pointer ml-auto" size={16} /></p>
            </div>
            <div className="flex flex-col gap-7 w-full">
              <div>
                <p className="opacity-50 mb-3 text-sm">Token delay: {tokenDelay} ms</p>
                <Slider defaultValue={[tokenDelay]} max={1000} step={1} onValueChange={(values) => setTokenDelay((values[0] ?? 1))} />
              </div>
              <div>
                <p className="opacity-50 mb-3 text-sm">Short pause: {shortPause} ms</p>
                <Slider defaultValue={[shortPause]} max={1000} step={1} onValueChange={(values) => setShortPause((values[0] ?? 1))} />
              </div>
              <div>
                <p className="opacity-50 mb-3 text-sm">Long pause: {longPause} ms</p>
                <Slider defaultValue={[longPause]} max={1000} step={1} onValueChange={(values) => setLongPause((values[0] ?? 1))} />
              </div>
              <div>
                <p className="opacity-50 mb-3 text-sm">Reveal animation: {revealAnimation} ms</p>
                <Slider defaultValue={[revealAnimation]} max={1000} step={1} onValueChange={(values) => setRevealAnimation((values[0] ?? 1))} />
              </div>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
