/**
 * useFlushedState
 * ----------------
 * A drop-in replacement for useState that forces React to flush updates synchronously.
 *
 * React 18 batches async updates for performance. In streaming or real-time UIs,
 * this can delay state propagation and cause effects to skip intermediate values.
 *
 * This hook wraps setState in ReactDOM.flushSync(), ensuring each update commits
 * and runs effects immediately — even inside async callbacks like streaming readers.
 *
 * Use cases:
 * - Real-time stream rendering (token-by-token updates)
 * - Measuring DOM layout right after a state change
 * - Forcing per-frame or per-chunk updates during async reads
 *
 * Trade-offs:
 * - Breaks React's batching optimizations
 * - May cause more renders per second (CPU cost)
 * - Should only be used when immediate flushes are required
 *
 * Docs:
 * https://react.dev/reference/react-dom/flushSync
 */

// DEPRECATED. DELETE THIS ON NEXT VERSION WHEN NO PROBLEMS CONFIRMED

import { useState } from "react";
import { flushSync } from "react-dom";

export function useFlushedState<T>(
  initial: T
): [T, (v: React.SetStateAction<T>) => void] {
  const [state, setState] = useState<T>(initial);
  const setFlushedState = (v: React.SetStateAction<T>) => {
    flushSync(() => setState(v));
  };
  return [state, setFlushedState];
}
