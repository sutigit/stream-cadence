// --- tokenization helpers ---

/**
 * Matches line breaks (`\n` or `\r\n`).
 */
const NEWLINE = /\r?\n/;

/**
 * Matches runs of whitespace that are not newlines (spaces, tabs).
 */
const SPACES = /[^\S\r\n]+/;

/**
 * Matches runs of non-whitespace characters (words, punctuation).
 */
const NONSP = /[^\s]+/;

/**
 * Composite tokenizer regex.
 *
 * Splits text into three token categories:
 *   - Line breaks
 *   - Runs of spaces or tabs
 *   - Runs of non-whitespace characters (words or punctuation)
 *
 * Uses the global flag so repeated `.exec` calls walk through the input.
 *
 * Example:
 * ```ts
 * "hello  world\n".match(_TOKEN_RE)
 * // => ["hello", "  ", "world", "\n"]
 * ```
 */
export const TOKEN_RE = new RegExp(
  `(${NEWLINE.source}|${SPACES.source}|${NONSP.source})`,
  "g"
);

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
