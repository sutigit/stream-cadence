import { CSSProperties, FC } from "react";

export type Seg = { content: string; duration: number };
export type End = { content: string; error: string; done: boolean };

export type CadencedTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  segs: Seg[];
  inStream?: InStreamComponents;
};

export interface Stop {
  sign: RegExp[];
  duration: number;
}

export interface Style {
  target: RegExp[];
  style: CSSProperties;
}

export interface Component {
  target: RegExp[];
  id: string;
}

export interface StreamConfig {
  stream?: "smooth" | "word";
  speed?: number;
  stops?: Stop[];
  styled?: Style[];
  components?: Component[];
  debug?: boolean;
}

export interface InStreamComponent {
  id: string;
  match: string;
}

export type InStreamComponents = Record<string, FC<InStreamComponent>>;
