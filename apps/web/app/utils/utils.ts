import { useRef, useState } from "react";

// STUDY THIIIIS

async function cadenceLLM(
  message: string,
  onText: (t: string) => void,
  wordMs: number, // pause after each word
  shortMs: number, // pause for "|"
  longMs: number, // pause for "||"
  revealMs: number,
  opts?: {
    signal?: AbortSignal;
  }
) {
  // GETS THE READABLE STREAM ============================
  const res = await fetch("/api/openai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    signal: opts?.signal,
  });
  const reader = res.body!.getReader();
  // ======================================================

  // PROCESSESS WHAT AND HOW? ======================================================
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let carry = "";
  let wordBuf = "";
  let spaceBuf = "";
  let pendingPauseSpace = false; // ensure exactly one space after a pause

  const emitWord = async () => {
    if (!wordBuf) return;
    onText(wordBuf);
    wordBuf = "";
    await sleep(wordMs);
  };

  const emitSpacesOnly = () => {
    if (!wordBuf && spaceBuf) {
      const normalizedSpaces = spaceBuf.replace(/[ \t]+/g, " ");
      onText(normalizedSpaces);
      spaceBuf = "";
    }
  };

  // ENTRY: Remember that this loops =>
  const process = async (text: string, final = false) => {
    carry += text;

    let i = 0;
    while (i < carry.length) {
      const ch = carry[i];

      if (ch === "|") {
        // If '|' is incomplete at chunk end, wait.
        if (!final && i === carry.length - 1) break;

        await emitWord();

        // Drop any spaces collected before the pause to avoid double spacing.
        spaceBuf = "";

        // Handle single vs double pipe. If second '|' is at chunk end, wait.
        const hasSecond = i + 1 < carry.length && carry[i + 1] === "|";
        if (!final && hasSecond && i + 1 === carry.length - 1) break;

        i += hasSecond ? 2 : 1;
        await sleep(hasSecond ? longMs : shortMs);

        // Defer emitting a single space until the next non-space char.
        pendingPauseSpace = true;
        continue;
      }

      if (/\s/.test(ch ?? "")) {
        // If we just paused, swallow following spaces entirely.
        if (pendingPauseSpace) {
          i++;
          continue;
        }

        spaceBuf += ch;
        i++;
        if (i >= carry.length) break;
        if (wordBuf) {
          await emitWord();
        } else {
          emitSpacesOnly();
        }
        continue;
      }

      // Non-space character
      if (pendingPauseSpace) {
        onText(" ");
        pendingPauseSpace = false;
      }

      if (!wordBuf && spaceBuf) {
        emitSpacesOnly();
      }

      wordBuf += ch;
      i++;
      if (i >= carry.length) break;
    }

    if (i > 0) carry = carry.slice(i);

    if (final) {
      // Do not emit trailing space for a pause at end.
      pendingPauseSpace = false;

      if (wordBuf) {
        await emitWord();
      }
      if (spaceBuf) {
        emitSpacesOnly();
      }
      carry = "";
    }
  };
  // =====================================================================

  // I DONT KNOW HOW THIS RELATES TO REST YET ============================
  const dec = new TextDecoder();

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      await process(dec.decode(value, { stream: true }), false);
    }
  } finally {
    const tail = dec.decode();
    await process(tail, true);
  }
  // =====================================================================
}

// APPENDING PROCEDURE IN FRONTEND =======================================
type Seg = {
  id: string;
  text: string;
  anim: "normal" | "short" | "long" | "space";
};

function useStreamCadence() {
  const [segs, setSegs] = useState<Seg[]>([
    // { id: "init", text: "Init text", anim: "normal" },
  ]);

  // cadence tracker
  const lastEmitRef = useRef<number>(performance.now());

  function appendChunk(chunk: string) {
    const now = performance.now();
    const dt = now - lastEmitRef.current;
    lastEmitRef.current = now;

    const anim: Seg["anim"] =
      dt >= 1000 ? "long" : dt >= 650 ? "short" : "normal";

    // split into words and spaces so spaces render instantly
    const parts = chunk.split(/(\s+)/);
    setSegs((prev) => {
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

  return {
    segs,
    setSegs,
    appendChunk,
    lastEmitRef,
  };
}
// =====================================================================

// TARGET DX
//  cadenceLLM(115, 350, 700, 500) // pass number arguments
//  cadenceLLM('average') // pass enum type 'slow' | 'average' | 'fast'
// OR
//  cadenceText(115, 350, 700, 500) // pass number arguments
//  cadenceText('average') // pass enum type 'slow' | 'average' | 'fast'
export { cadenceLLM, useStreamCadence };
