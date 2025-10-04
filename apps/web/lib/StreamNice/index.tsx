import { CadencedTextProps } from "./types"
import "./nice.css"

// TODO: we need to collapse old spans to text!!!

export const StreamNice: React.FC<CadencedTextProps> = ({ segs, inStream, ...rest }) => {
    return (
        <p className="white-space-pre" {...rest}>
            {segs.map((s, i) => (
                <span
                    key={i}
                    className="cadence-anim"
                    style={{ ["--dur" as any]: `${s.duration}ms` }}
                >
                    {s.content}
                </span>
            ))}
        </p>
    )
}