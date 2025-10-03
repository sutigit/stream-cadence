export const _sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function _escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
