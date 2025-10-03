import { useState } from "react";
import { End, Seg, StreamConfig } from "../types";
import { _sleep } from "../_/_utils";
import { _GatedBuffer } from "../_/_gatedBuffer";
import { defaults } from "../defaults/config";
import { TOKEN_RE, ONLY_WS, TRAILING_WS } from "../_/_regex";

// TODO: make stream accomodate customizations!!!

export function useStreamNice(config: StreamConfig = defaults) {
  const [segs, setSegs] = useState<Seg[]>([]);

  async function streamReader(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    callback: (next: Seg, end: End) => void
  ) {
    const dec = new TextDecoder();
    const buf = new _GatedBuffer();

    const produce = async () => {
      let tail = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        tail += dec.decode(value, { stream: true });

        let m: RegExpExecArray | null;
        let consumed = 0;
        let out: string[] = [];
        let last: string | undefined;

        // resets the regex’s global internal position pointer
        TOKEN_RE.lastIndex = 0;

        while ((m = TOKEN_RE.exec(tail)) !== null) {
          last = m[0];
          out.push(last);
          consumed = TOKEN_RE.lastIndex;
        }

        if (
          // check tail does not end in whitespace,
          out.length &&
          !TRAILING_WS.test(tail) &&
          // and last is not purely whitespace.
          last &&
          !ONLY_WS.test(last)
        ) {
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
    const ws = (s: string) => ONLY_WS.test(s);
    const endsFull = (s: string) => /[.!?]$/.test(s);
    const endsHalf = (s: string) => /[,;:]$/.test(s);

    const HALF_PAUSE = 350; // after , ; :
    const FULL_PAUSE = 720; // after . ? !

    let fullText = "";

    const consume = async () => {
      let pendingPause: number | null = null;
      buf.release(1); // prime once

      for await (const tok of buf) {
        const duration = ws(tok)
          ? (pendingPause ?? 0)
          : (config.speed ?? 0) * tok.length;

        pendingPause = !ws(tok)
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

    produce();
    consume();
  }

  return {
    segs,
    setSegs,
    streamReader,
  };
}
