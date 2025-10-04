import { _escapeRegex } from "./_/_utils";

/**
 * Creates a regex that matches strings starting with the given prefix.
 *
 * Example:
 *   RegPrefix("!bold:") -> /^!bold:/
 *   /^!bold:/.test("!bold:hello") === true
 */
export function RegPrefix(start: string): RegExp {
  return new RegExp("^" + _escapeRegex(start));
}

/**
 * Creates a regex that matches strings ending with the given suffix.
 *
 * Example:
 *   RegSuffix(":end") -> /:end$/
 *   /:end$/.test("thing:end") === true
 */
export function RegSuffix(end: string): RegExp {
  return new RegExp(_escapeRegex(end) + "$");
}

/**
 * Creates a regex that matches strings starting with `start` and ending with `end`,
 * with any characters in between (including none).
 *
 * Example:
 *   RegWrap("!start:", ":end") -> /^!start:.*:end$/
 *   /^!start:.*:end$/.test("!start:anything:end") === true
 */
export function RegWrap(start: string, end: string): RegExp {
  return new RegExp("^" + _escapeRegex(start) + ".*" + _escapeRegex(end) + "$");
}
