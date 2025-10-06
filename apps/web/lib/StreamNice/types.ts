import { CSSProperties, FC } from "react";

export type Seg = {
  content: string;
  duration: number;
  styled: CSSProperties | null;
  component: string | null; // components take precedence ofer styled if they have the same matcher
};

export type End = { content: string; error: string; done: boolean };

export type CadencedTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  segs: Seg[];
  inStream?: InStreamComponents;
};

export interface Stop {
  signs: RegExp[];
  duration: number;
}

export interface Style {
  targets: RegExp[];
  style: CSSProperties;
}

export interface Component {
  targets: RegExp[];
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
