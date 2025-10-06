import { CSSProperties, useState } from "react";
import { End, Seg, Stop, StreamConfig, Style, Component } from "../types";
import { _sleep } from "../_/_utils";
import { _GatedBuffer } from "../_/_gatedBuffer";
import { defaults } from "../defaults/config";
import {
  TOKEN_RE,
  ONLY_WS,
  TRAILING_WS,
  ENDS_WITH_BOUNDARY,
  BOUNDARY_TOKEN,
} from "../_/_regex";

// TODO: make stream accomodate customizations!!!
// - [x] stops
// - [] streaming style -> smooth | word
// - [x] styled chunks
// - [x] component chunks
// - [] debug: false/true -> show signs and targets or not
// - [x] do not style punctuations -> in the producer, push punctuations separately from words
// - [] solve regex wrap problem
// - [x] fix affixes inside (), [], {}

export function useStreamNice(config: StreamConfig = defaults) {
  const [segs, setSegs] = useState<Seg[]>([]);

  async function streamReader(
    reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
    callback: (next: Seg, end: End) => void
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
      let pendingPause: number = 0;

      buf.release(1); // initial buffer release

      for await (const tok of buf) {
        let parsedTok: string = tok; // tok stripped from matcher affixes

        // 1. config: streaming style

        // 2. config: styled
        const { styledTok, styled } = extractTokStyles(tok, config.styled);

        // 3. config: components
        const { componentTok, component } = extractTokComponent(
          tok,
          config.components
        );

        parsedTok = componentTok ?? styledTok ?? tok; // toks with components take precedence over styled toks

        // compute duration for this token
        const duration = isSpace(parsedTok)
          ? pendingPause // apply pause on the following whitespace
          : baseDuration(parsedTok, config.speed);

        // emit token
        fullText += parsedTok;
        callback(
          { content: parsedTok, duration, styled, component },
          { done: false, content: "", error: "" }
        );

        // 4. config: stops
        // schedule next pause if this token is non-space
        if (!isSpace(parsedTok)) {
          const ms = getStopDuration(parsedTok, config.stops);
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
        { content: "", duration: 0, styled: null, component: null },
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
const baseDuration = (tok: string, speed = 0) => speed * tok.length;

const getStopDuration = (tok: string, stops?: Stop[]) => {
  if (!stops?.length) return 0;
  let ms = 0;

  for (const { signs, duration } of stops) {
    if (signs.some((rx) => rx.test(tok))) ms = Math.max(ms, duration);
  }
  return ms; // max pause among matches
};

const extractTokStyles = (
  tok: string,
  styles?: Style[]
): { styledTok: string | null; styled: CSSProperties | null } => {
  if (!styles?.length) return { styledTok: tok, styled: null };

  let styledTok: string | null = null;
  let lastStyle: CSSProperties | null = null;

  for (const { targets, style } of styles) {
    targets.forEach((rx) => {
      if (rx.test(tok)) {
        styledTok = tok.replace(rx, ""); // strip the matcher affix
        lastStyle = style;
      }
    });
  }
  return { styledTok, styled: lastStyle }; // return the last style
};

const extractTokComponent = (
  tok: string,
  components?: Component[]
): { componentTok: string | null; component: string | null } => {
  if (!components?.length) return { componentTok: tok, component: null };

  let componentTok: string | null = null;
  let lastComponent: string | null = null;

  for (const { targets, id } of components) {
    targets.forEach((rx) => {
      if (rx.test(tok)) {
        componentTok = tok.replace(rx, ""); // strip the matcher affix
        lastComponent = id;
      }
    });
  }
  return { componentTok, component: lastComponent }; // return the last component id
};
