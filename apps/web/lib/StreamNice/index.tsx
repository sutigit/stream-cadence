import { InternalSeg, Next, StreamNiceProps } from "./types"
import "./nice.css"
import { memo, useEffect, useState } from "react"

// - [] Performance: collapse old spans to text chunks, keep styled or component spans as they are.

// ROADMAP THINGS
// - add markdown parser
// - RegWrap
// - streaming style -> smooth | word and default


const StreamNice: React.FC<StreamNiceProps> = ({ next, inStream, ...rest }) => {

    const defineComponent = (componentId: string, target: string) => {
        const Component = inStream?.[componentId]
        return Component ? <Component id={componentId} match={target} /> : <span style={{ color: '#E11D48' }}>Invalid {componentId}</span>
    }

    const [oldSegs, setOldSegs] = useState<Next[]>([])
    const [freshSeg, setFreshSeg] = useState<Next | null>(null)

    const [update, setUpdate] = useState<string>(crypto.randomUUID()) // force update

    useEffect(() => {
        const prev = freshSeg
        if (prev) setOldSegs(old => [...old, prev])

        setFreshSeg(next)
        setUpdate(crypto.randomUUID())
    }, [next])


    return (
        <div className="ws-pre-line" {...rest}>
            {oldSegs.map((olds, i) => (
                <span
                    key={i}
                    style={{ ...olds.styled }}
                >
                    {olds.component ? defineComponent(olds.component, olds.content) : <>{olds.content}</>}
                </span>
            ))}
            {
                freshSeg ?
                    <span
                        key={update}
                        className="stream-smooth"
                        style={{ ["--dur" as any]: `${freshSeg.duration}ms`, ...freshSeg.styled }}
                    >
                        {freshSeg.component ? defineComponent(freshSeg.component, freshSeg.content) : <>{freshSeg.content}</>}
                    </span>
                    : null
            }
        </div>
    )
}

export default memo(StreamNice)