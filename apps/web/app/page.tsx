'use client';

import { useRef, useState } from "react";
import ChatInput from "../components/chat-input";
import { streamResponse } from "./api/openai/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"
import { Copy, Glasses, Parentheses, Settings2, SquareFunction } from "lucide-react";

import "./cadence.css"

type Seg = { id: string; text: string; anim: "normal" | "short" | "long" | "space" };

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [segs, setSegs] = useState<Seg[]>([
    { id: "init", text: "Buch, buch, buch!", anim: "normal" },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // timings
  const [tokenDelay, setTokenDelay] = useState<number>(100)
  const [shortPause, setShortPause] = useState<number>(300)
  const [longPause, setLongPause] = useState<number>(800)
  const [revealAnimation, setRevealAnimation] = useState<number>(500)

  // cadence tracker
  const lastEmitRef = useRef<number>(performance.now());

  function appendChunk(chunk: string) {
    const now = performance.now();
    const dt = now - lastEmitRef.current;
    lastEmitRef.current = now;

    const anim: Seg["anim"] = dt >= 700 ? "long" : dt >= 350 ? "short" : "normal";

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

    // autoscroll
    queueMicrotask(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

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
        { wordPauseMs: 115, shortPauseMs: 350, longPauseMs: 700 }
      );
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
            <p className="mb-3 opacity-50 flex items-center gap-2">
              Reading speed
              <Glasses size={18} />
            </p>
            <div className="flex items-center gap-3">
              <Button className="rounded-full cursor-pointer bg-zinc-400 px-5">Slow</Button>
              <Button className="rounded-full cursor-pointer bg-zinc-400 px-5">Average</Button>
              <Button className="rounded-full cursor-pointer bg-zinc-400 px-5">Fast</Button>
              <Button className="rounded-full cursor-pointer bg-zinc-400 px-5">Custom</Button>
            </div>
          </div>

          <div>
            <p className="mb-3 opacity-50 flex items-center gap-2">
              Advanced settings
              <Settings2 size={18} />
            </p>
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

          <div>
            <p className="mb-3 opacity-50 flex items-center gap-2">
              Cadence arguments
              <SquareFunction size={18} />
            </p>
            <div className="flex items-center gap-2">
              <p className="w-12 text-center py-1 rounded-md text-xs bg-zinc-700 opacity-80">{tokenDelay}</p>
              <p className="w-12 text-center py-1 rounded-md text-xs bg-zinc-700 opacity-80">{shortPause}</p>
              <p className="w-12 text-center py-1 rounded-md text-xs bg-zinc-700 opacity-80">{longPause}</p>
              <p className="w-12 text-center py-1 rounded-md text-xs bg-zinc-700 opacity-80">{revealAnimation}</p>
              <Button variant="ghost" className="text-zinc-300 rounded-full cursor-pointer"><Copy /></Button>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
}
