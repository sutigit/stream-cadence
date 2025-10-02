export type Seg = { content: string; duration: number };
export type End = { content: string; error: string; done: boolean };

export type CadencedTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  segs: Seg[];
};
