/**
 * Regex helpers for building safe, intent-clear matchers.
 *
 * All builders return a `Target`:
 *   { target: RegExp; type: "affix" | "match" }
 *
 * - `type: "affix"` → pattern represents a removable prefix or suffix.
 *   Used when part of the token (like "!bold:" or ":end") should be stripped.
 *
 * - `type: "match"` → pattern represents a general matcher.
 *   Used for exact words, contains, stems, or wrapped text where nothing is removed.
 *
 * Notes:
 * - All input strings are escaped with `_escapeRegex` so user text is treated literally.
 * - Case sensitivity can be toggled with the `caseSensitive` parameter.
 */

import { _escapeRegex } from "./_/_utils";
import { Target } from "./types";

/**
 * Match strings that start with a given prefix.
 *
 * @example
 * RegPrefix("!bold:").target.test("!bold:hello") // true
 * RegPrefix("!bold:").target.test("hello!bold:") // false
 *
 * @param start - Prefix to match at the beginning.
 * @returns { target: /^<start>/, type: "affix" }
 */
export function RegPrefix(start: string): Target {
  const target = new RegExp("^" + _escapeRegex(start));
  return { target, type: "affix" };
}

/**
 * Match strings that end with a given suffix.
 *
 * @example
 * RegSuffix(":end").target.test("thing:end") // true
 * RegSuffix(":end").target.test("end:thing") // false
 *
 * @param end - Suffix to match at the end.
 * @returns { target: /<end>$/, type: "affix" }
 */
export function RegSuffix(end: string): Target {
  const target = new RegExp(_escapeRegex(end) + "$");
  return { target, type: "affix" };
}

/**
 * Experimental
 *
 * Match strings that start with `start` and end with `end`,
 * allowing any characters (including none) in between.
 *
 * @example
 * RegWrap("!start:", ":end").target.test("!start:any:end") // true
 * RegWrap("!start:", ":end").target.test("prefix!start:end") // false
 *
 * @param start - Required prefix.
 * @param end - Required suffix.
 * @returns { target: /^<start>.*<end>$/, type: "match" }
 */
// export function RegWrap(start: string, end: string): Target {
//   const target = new RegExp(
//     "^" + _escapeRegex(start) + ".*" + _escapeRegex(end) + "$"
//   );
//   return { target, type: "match" };
// }

/**
 * Match a string that is exactly equal to `word`.
 *
 * @example
 * RegMatch("Hello").target.test("Hello") // true
 * RegMatch("Hello").target.test("hello") // false
 * RegMatch("Hello", false).target.test("hello") // true
 *
 * @param word - Exact word to match.
 * @param caseSensitive - Case sensitivity (default: true).
 * @returns { target: /^<word>$/, type: "match" }
 */
export function RegMatch(word: string, caseSensitive: boolean = true): Target {
  const flags = caseSensitive ? "" : "i";
  const target = new RegExp("^" + _escapeRegex(word) + "$", flags);
  return { target, type: "match" };
}

/**
 * Match any string that contains `text` anywhere.
 *
 * @example
 * RegContains("core").target.test("hardcore") // true
 * RegContains("core").target.test("encore") // true
 * RegContains("core").target.test("CORE") // false
 * RegContains("core", false).target.test("CORE") // true
 *
 * @param text - Substring to search for.
 * @param caseSensitive - Case sensitivity (default: true).
 * @returns { target: /<text>/, type: "match" }
 */
export function RegContains(
  text: string,
  caseSensitive: boolean = true
): Target {
  const flags = caseSensitive ? "" : "i";
  const target = new RegExp(_escapeRegex(text), flags);
  return { target, type: "match" };
}

/**
 * Match any word that begins with the given `stem`.
 * Uses a word boundary (`\\b`) to ensure the stem occurs at the start of a word.
 *
 * @example
 * RegStem("run").target.test("running fast") // true
 * RegStem("run").target.test("runner") // true
 * RegStem("run").target.test("rerun") // false
 * RegStem("run", false).target.test("RUNNING") // true
 *
 * @param stem - Stem to match at the start of a word.
 * @param caseSensitive - Case sensitivity (default: true).
 * @returns { target: /\\b<stem>/, type: "match" }
 */
export function RegStem(stem: string, caseSensitive: boolean = true): Target {
  const flags = caseSensitive ? "" : "i";
  const target = new RegExp("\\b" + _escapeRegex(stem), flags);
  return { target, type: "match" };
}
