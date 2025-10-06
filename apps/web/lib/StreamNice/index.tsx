import { CadencedTextProps } from "./types"
import "./nice.css"
import { useEffect } from "react"

// - [] add markdown parser
// - [] collapse old spans to one text chunk, keep styled or component spans as they are tho

export const StreamNice: React.FC<CadencedTextProps> = ({ segs, inStream, ...rest }) => {

    useEffect(() => {
        console.log("📌 segs", segs[segs.length - 1])
    }, [segs])

    return (
        <p className="white-space-pre" {...rest}>
            {segs.map((s, i) => (
                <span
                    key={i}
                    className="stream-smooth"
                    style={{ ["--dur" as any]: `${s.duration}ms`, ...s.styled }}
                >
                    {s.content}
                </span>
            ))}
        </p>
    )
}