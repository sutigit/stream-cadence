import { End, Next, StreamConfig } from "../types";
import {
  _baseDuration,
  _extractTokComponent,
  _extractTokStyles,
  _getStopDuration,
  _isSpace,
  _sleep,
} from "../_/_utils";
import { _GatedBuffer } from "../_/_gatedBuffer";
import { defaults } from "../defaults/config";
import { TOKEN_RE, ENDS_WITH_BOUNDARY, BOUNDARY_TOKEN } from "../_/_regex";
import { useState } from "react";

// Never make it be zero to avoid react state batching problems.
// Increase if skipped useEffect problems occurs
const MIN_PAUSE = 1; // ms.

export function useStreamNice(config: StreamConfig = defaults) {
  const [next, setNext] = useState<Next | null>(null);

  async function streamReader(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    callback: (next: Next, end: End) => void
  ) {
    const dec = new TextDecoder();
    const buf = new _GatedBuffer();

    /**
     * Stream token producer.
     *
     * Reads decoded text chunks, tokenizes them with TOKEN_RE, and emits only
     * the tokens that are guaranteed complete. If a chunk ends in the middle of
     * a word/run, those tokens are held back in `tail` and completed when the
     * next chunk arrives.
     */
    const produce = async () => {
      // `tail` carries any uncommitted text between reads.
      let tail = "";

      while (true) {
        // 1) Read the next chunk from the stream.
        const { value, done } = await reader.read();
        if (done) break;

        // 2) Decode and append to the unprocessed tail.
        tail += dec.decode(value, { stream: true });

        // 3) Tokenize the current tail.
        let consumed = 0; // number of characters safely consumed from `tail`
        const out: string[] = []; // tokens we plan to commit from this iteration
        let last: string | undefined; // last token matched (used only for inspection)

        // Reset the regex engine's position so `.exec` walks from the start of `tail`.
        TOKEN_RE.lastIndex = 0;

        // Walk through all matches in `tail`. Because TOKEN_RE has the /g flag,
        // each exec() advances TOKEN_RE.lastIndex to the end of the match.
        for (
          let m: RegExpExecArray | null;
          (m = TOKEN_RE.exec(tail)) !== null;

        ) {
          last = m[0];
          out.push(last);
          consumed = TOKEN_RE.lastIndex; // remember how far we parsed
        }

        // 4) If the chunk did NOT end on a boundary, we might have split a token.
        // Peel back ALL trailing non-boundary tokens so they stay in `tail`
        // and can merge with the next chunk.
        if (out.length && !ENDS_WITH_BOUNDARY.test(tail)) {
          while (out.length && !BOUNDARY_TOKEN.test(out[out.length - 1]!)) {
            const t = out.pop()!; // remove the unsafe trailing token
            consumed -= t.length; // rewind the consumed counter
          }
        }

        // 5) Emit only the safe tokens.
        for (const t of out) buf.add(t);

        // 6) Keep the unconsumed remainder in `tail` for the next loop.
        tail = tail.slice(consumed);
      }

      // 7) Final flush: after the stream ends, whatever remains in `tail`
      // is complete by definition. Tokenize and emit it all.
      if (tail) {
        TOKEN_RE.lastIndex = 0;
        for (
          let m: RegExpExecArray | null;
          (m = TOKEN_RE.exec(tail)) !== null;

        ) {
          buf.add(m[0]);
        }
      }

      // 8) Signal completion and release the reader lock.
      buf.close();
      reader.releaseLock();
    };

    // consumer ---------------------------------------------------------
    let fullText = "";

    const consume = async () => {
      let pendingPause: number = MIN_PAUSE;

      buf.release(1); // initial buffer release

      for await (const tok of buf) {
        let parsedTok: string = tok; // tok stripped from matcher affixes

        // 1. config: streaming style -> stream | word
        // -- in roadmap

        // 2. config: components
        const { componentTok: initParseTok, component } = _extractTokComponent(
          tok,
          config.components
        );

        // 3. config: styled
        const { styledTok: finalParseTok, styled } = _extractTokStyles(
          initParseTok,
          config.styled
        );

        // toks with components take precedence over styled toks
        parsedTok = config.debug ? tok : (finalParseTok ?? tok);

        // compute duration for this token
        const duration = _isSpace(parsedTok)
          ? pendingPause // apply pause on the following whitespace
          : _baseDuration(parsedTok, config.speed);

        // emit token
        fullText += parsedTok;

        const basic = !styled && !component;
        callback(
          { content: parsedTok, duration, basic, styled, component },
          { done: false, content: "", error: "" }
        );

        // 4. config: stops
        // schedule next pause if this token is non-space
        if (!_isSpace(parsedTok)) {
          const ms = _getStopDuration(parsedTok, config.stops);
          // take the larger pause if one already pending (e.g., "?!")
          pendingPause = Math.max(pendingPause, ms);
        } else {
          // pause consumed by whitespace; reset
          pendingPause = MIN_PAUSE;
        }

        await _sleep(duration);
        buf.release(1);
      }

      // done
      callback(
        {
          content: "",
          duration: MIN_PAUSE,
          basic: true,
          styled: null,
          component: null,
        },
        { done: true, content: fullText, error: "" }
      );
    };

    produce();
    consume();
  }

  return {
    next,
    setNext,
    streamReader,
  };
}
