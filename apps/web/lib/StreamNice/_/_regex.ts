// --- tokenization helpers ---

/**
 * TOKEN_RE
 *
 * Splits text into distinct lexical units (tokens):
 *   - Newlines (\n or \r\n)
 *   - Spaces/tabs
 *   - Delimiters (() [] {})
 *   - Terminal punctuation (.,!?;:) when followed by a space, newline, delimiter, or end of string
 *   - Word/punctuation runs like "!important:tomato" kept as a single token
 *
 * Design:
 * - Uses lookahead to separate only grammatically correct punctuation.
 * - Keeps inline punctuation (like ":" in "a:b") inside the token.
 * - Global flag allows incremental parsing using .exec() with .lastIndex tracking.
 */
export const TOKEN_RE = new RegExp(
  [
    String.raw`\r?\n`, // newline sequences
    String.raw`[^\S\r\n]+`, // spaces or tabs
    String.raw`[()\[\]{}]`, // delimiters
    String.raw`[.,!?;:](?=(?:\s|$|[()\[\]{}]))`, // terminal punctuation
    String.raw`(?:[^\s()[\]{}.,!?;:]+|[.,!?;:](?![\s()[\]{}]|$))+`, // inline runs
  ].join("|"),
  "g"
);

/*
Examples:
"Done."             → ["Done", "."]
"Hello, world."     → ["Hello", ",", " ", "world", "."]
"!important:tomato" → ["!important:tomato"]
"(a:b)"             → ["(", "a:b", ")"]
"?wow:yes!"         → ["?wow:yes!"]
*/

// --- producer boundary detectors ---

/**
 * BOUNDARY_TOKEN
 * Detects tokens that clearly separate text.
 * These are "safe" stopping points when reading a text stream.
 *
 * Includes:
 *   - Newlines (\n or \r\n)
 *   - Spaces or tabs
 *   - Single delimiters: (), [], {}
 *
 * The producer uses this to know which tokens can be safely finalized.
 * If the last token in a chunk is not a boundary, it might be an incomplete word,
 * so we wait for the next chunk before committing it.
 */
export const BOUNDARY_TOKEN = /^(?:\r?\n|[^\S\r\n]+|[()\[\]{}])$/;

/**
 * ENDS_WITH_BOUNDARY
 * Checks if the current text chunk ends on a boundary character.
 *
 * If true → The chunk ends cleanly, so all tokens are complete.
 * If false → The chunk probably ends in the middle of a word or sentence,
 *            so the producer holds back those partial tokens
 *            until more text arrives.
 */
export const ENDS_WITH_BOUNDARY = /(?:\r?\n|[^\S\r\n]|[()\[\]{}])$/;

/**
 * Matches a trailing whitespace character at the end of a string.
 * Equivalent to `/\s$/`.
 */
export const TRAILING_WS = /\s$/;

/**
 * Matches a string composed only of one or more whitespace characters.
 * Equivalent to `/^\s+$/`.
 */
export const ONLY_WS = /^\s+$/;
