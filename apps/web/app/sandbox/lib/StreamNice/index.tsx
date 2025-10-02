import { CadencedTextProps } from "./types"
import "nice.css"


export const StreamNice: React.FC<CadencedTextProps> = ({ segs, ...rest }) => {
    return (
        <p {...rest}>
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