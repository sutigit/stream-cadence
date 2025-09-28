//   const res = await fetch("/api/openai/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message }),
//     signal: opts?.signal,
//   });

async function cadenceLLM(
  res: Response,
  onText: (t: string) => void,
  wordMs: number, // pause after each word
  shortMs: number, // pause for "|"
  longMs: number, // pause for "||"
  revealMs: number
) {
  const ct = res.headers.get("content-type") || "";
  const reader = res.body!.getReader();
  const dec = new TextDecoder();

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

  if (!ct.startsWith("text/event-stream")) {
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
  }
}
