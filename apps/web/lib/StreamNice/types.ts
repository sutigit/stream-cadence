import { CSSProperties, FC } from "react";

export type Seg = {
  content: string;
  duration: number;
  basic: boolean;
  styled: CSSProperties | null;
  component: string | null; // components take precedence ofer styled if they have the same matcher
};

export type End = { content: string; error: string; done: boolean };

export type Target = {
  target: RegExp;
  type: "match" | "affix";
};

export interface Stop {
  signs: RegExp[];
  duration: number;
}

export interface Style {
  targets: Target[];
  style: CSSProperties;
}

export interface Component {
  targets: Target[];
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

export type CadencedTextProps = React.HTMLAttributes<HTMLDivElement> & {
  segs: Seg[];
  inStream?: InStreamComponents;
};
