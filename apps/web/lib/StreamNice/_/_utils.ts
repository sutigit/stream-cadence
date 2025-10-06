import { CSSProperties } from "react";
import { Component, Stop, Style } from "../types";
import { ONLY_WS } from "./_regex";

/**
 * Waits for a given number of milliseconds.
 * @param ms - Time to wait.
 * @returns Promise that resolves after the delay.
 */
export const _sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Escapes special regex characters in a string.
 * @param str - String to escape.
 * @returns Escaped string safe for use in regex.
 */
export function _escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks if a string has only whitespace.
 * @param s - Input string.
 * @returns True if whitespace only.
 */
export const _isSpace = (s: string) => ONLY_WS.test(s);

/**
 * Gets duration based on token length and speed.
 * @param tok - Token text.
 * @param speed - Milliseconds per character.
 * @returns Total duration.
 */
export const _baseDuration = (tok: string, speed = 0) => speed * tok.length;

/**
 * Gets the longest stop duration for matching tokens.
 * @param tok - Token text.
 * @param stops - List of stop rules.
 * @returns Duration in milliseconds.
 */
export const _getStopDuration = (tok: string, stops?: Stop[]) => {
  if (!stops?.length) return 0;
  let ms = 0;

  for (const { signs, duration } of stops) {
    if (signs.some((rx) => rx.test(tok))) ms = Math.max(ms, duration);
  }
  return ms;
};

/**
 * Finds the first matching style for a token.
 * Strips prefix/suffix if the style is marked as an affix.
 * @param tok - Token text.
 * @param styles - List of style matchers.
 * @returns Token text and CSS style.
 */
export const _extractTokStyles = (
  tok: string,
  styles?: Style[]
): { styledTok: string; styled: CSSProperties | null } => {
  if (!styles?.length) return { styledTok: tok, styled: null };

  for (const { targets, style } of styles) {
    for (const rx of targets) {
      if (!rx.target.test(tok)) continue;
      const styledTok = rx.type === "match" ? tok : tok.replace(rx.target, "");
      return { styledTok, styled: style };
    }
  }

  return { styledTok: tok, styled: null };
};

/**
 * Finds the first matching component for a token.
 * Strips prefix/suffix if the matcher is marked as an affix.
 * @param tok - Token text.
 * @param components - List of component matchers.
 * @returns Token text and component ID.
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
        rx.type === "match" ? tok : tok.replace(rx.target, "");
      return { componentTok, component: id };
    }
  }

  return { componentTok: tok, component: null };
};
