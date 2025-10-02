export type Seg = { content: string; duration: number };

export type CadencedTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  segs: Seg[];
};
