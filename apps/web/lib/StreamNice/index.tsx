import { CadencedTextProps } from "./types"
import "./nice.css"
import { useEffect } from "react"

// - [] add markdown parser
// - [x] now accomodate components!!!
// - [] Performance: collapse old spans to text chunks, keep styled or component spans as they are.
// 

// ROADMAP THINGS
// - RegWrap
// - Streaming by WORDs

export const StreamNice: React.FC<CadencedTextProps> = ({ segs, inStream, ...rest }) => {

    const defineComponent = (componentId: string, target: string) => {
        const Component = inStream?.[componentId]
        return Component ? <Component id={componentId} match={target} /> : <div style={{ color: '#E11D48' }}>Invalid {componentId}</div>
    }

    return (
        <div style={{ whiteSpace: 'pre-line' }} {...rest}>
            {segs.map((s, i) => (
                <div
                    key={i}
                    className="stream-smooth"
                    style={{ ["--dur" as any]: `${s.duration}ms`, ...s.styled, display: "inline" }}
                >
                    {s.component ? defineComponent(s.component, s.content) : <>{s.content}</>}
                </div>
            ))}
        </div>
    )
}