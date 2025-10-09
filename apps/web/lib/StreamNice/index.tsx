import { InternalSeg, Seg, StreamNiceProps } from "./types"
import "./nice.css"
import { memo, useEffect, useState } from "react"

// - [] Performance: collapse old spans to text chunks, keep styled or component spans as they are.

// ROADMAP THINGS
// - add markdown parser
// - RegWrap
// - streaming style -> smooth | word and default


const StreamNice: React.FC<StreamNiceProps> = ({ segs, inStream, ...rest }) => {

    const defineComponent = (componentId: string, target: string) => {
        const Component = inStream?.[componentId]
        return Component ? <Component id={componentId} match={target} /> : <span style={{ color: '#E11D48' }}>Invalid {componentId}</span>
    }

    const [oldSegs, setOldSegs] = useState<Seg[]>([])
    const [freshSeg, setFreshSeg] = useState<Seg>()

    const [freshSegUpdate, setFreshSegUpdate] = useState<string>(crypto.randomUUID())

    useEffect(() => {
        const latest = segs[segs.length - 1]
        const prev = segs[segs.length - 2] ?? null

        // what a weird bug, the fifth seg already has 6 items that messess this up.
        console.log("📌 latest:", latest?.content)
        console.log("📌 prev:", prev?.content)
        console.log("📌 segs", segs)

        if (prev) setOldSegs(old => [...old, prev])

        setFreshSeg(latest)
        setFreshSegUpdate(crypto.randomUUID())
    }, [segs])


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
                        key={freshSegUpdate}
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