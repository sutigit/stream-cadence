import { StreamNiceProps } from "./types"
import "./nice.css"

// ROADMAP THINGS
// - add markdown parser
// - Performance: collapse old spans to text chunks, keep styled or component spans as they are.
// - RegWrap
// - streaming style -> smooth | word and default


export const StreamNice: React.FC<StreamNiceProps> = ({ segs, inStream, ...rest }) => {

    const defineComponent = (componentId: string, target: string) => {
        const Component = inStream?.[componentId]
        return Component ? <Component id={componentId} match={target} /> : <span style={{ color: '#E11D48' }}>Invalid {componentId}</span>
    }

    return (
        <div className="ws-pre-line" {...rest}>
            {segs.map((s, i) => (
                <span
                    key={i}
                    className="stream-smooth"
                    style={{ ["--dur" as any]: `${s.duration}ms`, ...s.styled }}
                >
                    {s.component ? defineComponent(s.component, s.content) : <>{s.content}</>}
                </span>
            ))}
        </div>
    )
}