/**
 * Pauses execution for a given number of milliseconds.
 *
 * This is a simple helper function that returns a Promise
 * that resolves after the specified delay. It’s useful for
 * adding controlled delays in async code, such as rate limiting,
 * testing, or waiting between retries.
 *
 * Example:
 *   await _sleep(1000) // waits 1 second
 *
 * @param ms - Number of milliseconds to wait.
 * @returns A Promise that resolves after the delay.
 */
export const _sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Escapes special characters in a string so it can be safely used inside a regular expression.
 *
 * Regular expressions use characters like ., *, +, ?, ^, $, {, }, (, ), |, [, ], and \
 * for special meanings. This function adds a backslash (`\`) before each of these
 * characters so they are treated literally by the regex engine.
 *
 * Example:
 *   _escapeRegex("a+b*c") // returns "a\\+b\\*c"
 *   new RegExp("^" + _escapeRegex("a+b*c") + "$").test("a+b*c") // true
 *
 * @param str - The input string to escape.
 * @returns A new string with regex special characters escaped.
 */
export function _escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
