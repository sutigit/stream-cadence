import { useState } from "react";
import { End, Seg, Stop, StreamConfig } from "../types";
import { _sleep } from "../_/_utils";
import { _GatedBuffer } from "../_/_gatedBuffer";
import { defaults } from "../defaults/config";
import { TOKEN_RE, ONLY_WS, TRAILING_WS } from "../_/_regex";

// TODO: make stream accomodate customizations!!!
// - [x] stops
// - [] streaming style -> smooth | word
// - [] styled chunks
// - [] component shunks
// - [] debug: false/true -> show signs and targets or not

export function useStreamNice(config: StreamConfig = defaults) {
  const [segs, setSegs] = useState<Seg[]>([]);

  async function streamReader(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    callback: (next: Seg, end: End) => void
  ) {
    const dec = new TextDecoder();
    const buf = new _GatedBuffer();

    // producer --------------------------------------------------------------
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

      // done
      buf.close();
      reader.releaseLock();
    };

    // consumer ---------------------------------------------------------
    let fullText = "";

    const consume = async () => {
      let pendingPause: number = 0;
      buf.release(1); // prime once

      for await (const tok of buf) {
        // compute duration for this token
        const duration = isSpace(tok)
          ? pendingPause // apply pause on the following whitespace
          : baseDuration(tok, config.speed);

        // emit token
        fullText += tok;
        callback(
          { content: tok, duration },
          { done: false, content: "", error: "" }
        );

        // schedule next pause if this token is non-space
        if (!isSpace(tok)) {
          const ms = stopDuration(tok, config.stops);
          // take the larger pause if one already pending (e.g., "?!")
          pendingPause = Math.max(pendingPause, ms);
        } else {
          // pause consumed by whitespace; reset
          pendingPause = 0;
        }

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

// helpers -------------------------------------------------------------------
const isSpace = (s: string) => ONLY_WS.test(s); // check whitespace

const stopDuration = (tok: string, stops?: Stop[]) => {
  if (!stops?.length) return 0;
  let ms = 0;
  for (const { signs, duration } of stops) {
    if (signs.some((rx) => rx.test(tok))) ms = Math.max(ms, duration);
  }
  return ms; // max pause among matches
};

const baseDuration = (tok: string, speed = 0) => speed * tok.length;
