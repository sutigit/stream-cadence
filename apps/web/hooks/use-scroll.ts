import { useEffect, RefObject } from "react";

export function useScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  trigger: any
) {
  useEffect(() => {
    if (!scrollRef) return;

    queueMicrotask(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [trigger, scrollRef]);
}
