/**
 * Streaming modes control how text is emitted.
 *
 * - `"smooth"` → emit characters one by one at a steady pace
 * - `"word"`   → emit text in word-sized chunks
 */
export const STREAM = Object.freeze({
  smooth: "smooth",
  word: "word",
});

/**
 * Regex categories for punctuation "stops".
 * These can be used to insert pauses in a stream depending on the
 * punctuation found at the end of a string.
 *
 * - `dots`        → matches a literal period at the end of a string
 * - `commas`      → matches a literal comma at the end of a string
 * - `question`    → matches a question mark at the end of a string
 * - `exclamation` → matches an exclamation mark at the end of a string
 * - `mid`         → matches mid-sentence punctuation (comma, semicolon, colon)
 * - `end`         → matches terminating punctuation (period, question, exclamation)
 */
export const STOPS = Object.freeze({
  dots: /\.$/,
  commas: /,$/,
  question: /\?$/,
  exclamation: /!$/,
  mid: /[,;:]$/,
  end: /[.!?]$/,
});
