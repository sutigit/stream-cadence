import { CSSProperties, ReactElement } from "react";

export type Seg = { content: string; duration: number };
export type End = { content: string; error: string; done: boolean };

export type CadencedTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  segs: Seg[];
};

export interface Stop {
  sign: RegExp[];
  duration: number;
}

export interface Match {
  target: RegExp[];
  style: CSSProperties;
}

export interface Interaction {
  target: RegExp[];
  component: (match: string) => ReactElement;
}

export interface StreamConfig {
  stream?: "smooth" | "word";
  speed?: number;
  stops?: Stop[];
  match?: Match[];
  interactions?: Interaction[];
  debug?: boolean;
}
