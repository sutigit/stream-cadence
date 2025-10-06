import { CSSProperties } from "react";
import { Component, Stop, Style } from "../types";
import { ONLY_WS } from "./_regex";

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

/**
 * Utility regex for detecting whitespace-only strings.
 */
export const _isSpace = (s: string) => ONLY_WS.test(s); // check whitespace

/**
 * Computes a base display or animation duration for a token.
 *
 * Duration is proportional to the token length and the given speed.
 *
 * @example
 * _baseDuration("hello", 50) // 250
 *
 * @param tok - The token text.
 * @param speed - Duration multiplier per character.
 * @returns The computed duration in milliseconds.
 */
export const _baseDuration = (tok: string, speed = 0) => speed * tok.length;

/**
 * Calculates a pause (stop) duration for a given token based on stop markers.
 *
 * If multiple markers match, the longest duration is used.
 *
 * @example
 * _getStopDuration(".", [{ signs: [/\.|!/], duration: 300 }]) // 300
 *
 * @param tok - The token text to test.
 * @param stops - Optional array of stop definitions `{ signs, duration }`.
 * @returns The maximum matching stop duration in milliseconds, or 0 if none.
 */
export const _getStopDuration = (tok: string, stops?: Stop[]) => {
  if (!stops?.length) return 0;
  let ms = 0;

  for (const { signs, duration } of stops) {
    if (signs.some((rx) => rx.test(tok))) ms = Math.max(ms, duration);
  }
  return ms; // max pause among matches
};

/**
 * Extracts a styled token and its associated CSS style definition.
 *
 * Iterates through all defined style matchers, returning the first match found.
 * If a regex uses an affix (prefix/suffix), it is removed from the returned token.
 *
 * @example
 * _extractTokStyles("!bold:text", [
 *   { targets: [RegPrefix("!bold:")], style: { fontWeight: "bold" } }
 * ])
 * // → { styledTok: "text", styled: { fontWeight: "bold" } }
 *
 * @param tok - The token text.
 * @param styles - Optional array of style matchers.
 * @returns The processed token and its style, or the original token if none matched.
 */
export const _extractTokStyles = (
  tok: string,
  styles?: Style[]
): { styledTok: string; styled: CSSProperties | null } => {
  if (!styles?.length) return { styledTok: tok, styled: null };

  for (const { targets, style } of styles) {
    for (const rx of targets) {
      if (!rx.target.test(tok)) continue;

      const styledTok = rx.type === "match" ? tok : tok.replace(rx.target, ""); // strip affix only

      return { styledTok, styled: style }; // first match wins
    }
  }

  return { styledTok: tok, styled: null };
};

/**
 * Extracts a component identifier from a token.
 *
 * Used when certain tokens represent structured components (e.g., emoji, command, UI element).
 * If a regex uses an affix (prefix/suffix), that part is stripped before returning.
 *
 * @example
 * _extractTokComponent("!btn:Click", [
 *   { targets: [RegPrefix("!btn:")], id: "button" }
 * ])
 * // → { componentTok: "Click", component: "button" }
 *
 * @param tok - The token text.
 * @param components - Optional array of component matchers.
 * @returns The processed token and its matched component id, or null if none matched.
 */
export const _extractTokComponent = (
  tok: string,
  components?: Component[]
): { componentTok: string; component: string | null } => {
  if (!components?.length) return { componentTok: tok, component: null };

  for (const { targets, id } of components) {
    for (const rx of targets) {
      if (!rx.target.test(tok)) continue;

      const componentTok =
        rx.type === "match" ? tok : tok.replace(rx.target, ""); // strip affix only

      return { componentTok, component: id }; // first match wins
    }
  }

  return { componentTok: tok, component: null };
};
