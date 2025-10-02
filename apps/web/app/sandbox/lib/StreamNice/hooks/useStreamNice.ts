import { useState } from "react";
import { GatedBuffer } from "../GatedBuffer";
import { End, Seg } from "../types";

const _sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Props {}

export function useStreamNice() {
  const [segs, setSegs] = useState<Seg[]>([]);

  async function streamReader(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    callback: (next: Seg, end: End) => void
  ) {
    const dec = new TextDecoder();

    const buf = new GatedBuffer();

    // --- tokenization helpers ---
    const NEWLINE = /\r?\n/; // line breaks
    const SPACES = /[^\S\r\n]+/; // spaces/tabs, not newlines
    const NONSP = /[^\s]+/; // words/punct
    const TOKEN_RE = new RegExp(
      `(${NEWLINE.source}|${SPACES.source}|${NONSP.source})`,
      "g"
    );

    const pump = async () => {
      let tail = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        tail += dec.decode(value, { stream: true });

        TOKEN_RE.lastIndex = 0;
        let m: RegExpExecArray | null,
          consumed = 0,
          out: string[] = [],
          last: string | undefined;
        while ((m = TOKEN_RE.exec(tail)) !== null) {
          last = m[0];
          out.push(last);
          consumed = TOKEN_RE.lastIndex;
        }
        if (out.length && !/\s$/.test(tail) && last && !/^\s+$/.test(last)) {
          out.pop();
          consumed -= last.length; // keep partial word
        }
        for (const t of out) buf.add(t);
        tail = tail.slice(consumed);
      }
      if (tail) {
        TOKEN_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = TOKEN_RE.exec(tail)) !== null) buf.add(m[0]);
      }
      buf.close();
      reader.releaseLock();
    };

    // --- pacing helpers ---
    const isSpace = (s: string) => /^\s+$/.test(s);
    const endsFull = (s: string) => /[.!?]$/.test(s);
    const endsHalf = (s: string) => /[,;:]$/.test(s);

    const CHAR_MS = 50; // per visible char
    const HALF_PAUSE = 350; // after , ; :
    const FULL_PAUSE = 720; // after . ? !

    let fullText = "";

    const consume = async () => {
      let pendingPause: number | null = null;
      buf.release(1); // prime once

      for await (const tok of buf) {
        const duration = isSpace(tok)
          ? (pendingPause ?? 0)
          : CHAR_MS * tok.length;

        pendingPause = !isSpace(tok)
          ? endsFull(tok)
            ? FULL_PAUSE
            : endsHalf(tok)
              ? HALF_PAUSE
              : null
          : null;

        fullText += tok;

        callback(
          { content: tok, duration },
          { done: false, content: "", error: "" }
        );

        await _sleep(duration);
        buf.release(1);
      }

      // done
      callback(
        { content: "", duration: 0 },
        { done: true, content: fullText, error: "" }
      );
    };

    // run producer and consumer
    pump();
    consume();
  }

  return {
    segs,
    setSegs,
    streamReader,
  };
}
