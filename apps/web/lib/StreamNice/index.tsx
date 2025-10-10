import { Component, InternalSeg, Next, StreamNiceProps, Styled } from "./types"
import "./nice.css"
import { memo, ReactNode, useEffect, useState } from "react"

// - [x] Performance: collapse old spans to text chunks, keep styled or component spans as they are.
// - [] accomodate styled
// - [] accomodate component 
// - [] where the hell did my fadeIn go

// ROADMAP THINGS
// - add markdown parser
// - RegWrap
// - streaming style -> smooth | word and default


const StreamNice: React.FC<StreamNiceProps> = ({ next, inStream, ...rest }) => {

    const defineComponent = (componentId: string, target: string) => {
        const Component = inStream?.[componentId]
        console.log("📌 haloo!", Component)

        return Component ? <Component id={componentId} match={target} /> : <span style={{ color: '#E11D48' }}>Invalid {componentId}</span>
    }

    const [old, setOld] = useState<(string | Next)[]>([])
    const [temp, setTemp] = useState<string | Next>("")
    const [latest, setLatest] = useState<Next | null>(null)

    const [update, setUpdate] = useState<string>(crypto.randomUUID()) // force update

    useEffect(() => {
        const prev = latest
        if (prev) {
            if (prev.basic) {
                // accumulate temp segments as long as the chunk is basic text
                setTemp(temp => temp + prev?.content)
            } else {
                // when the chunk is styled or component, add the temp segment to the old segments
                // and set the new styled or component chunk as temp
                setOld(prevOlds => [...prevOlds, temp])
                setTemp(prev)
            }
        }


        setLatest(next)
        setUpdate(crypto.randomUUID()) // force update latest chunk
    }, [next])


    return (
        <div className="ws-pre-line" {...rest}>
            {
                /* old segments ----------------------------- */
                old.map((old, i) => (
                    (typeof old === "string") ?
                        // if segment is purely text
                        <span key={i} className="old">{old}</span>
                        :
                        // if segment is a styled text or component
                        <span
                            key={i}
                            className="old"
                            style={{ ...old.styled }}
                        >
                            {old.component ? "hmmmm" : old.content}
                        </span>
                ))
            }

            {
                /* temporary segment ----------------------- */
                (typeof temp === "string") ?
                    // if segment is purely text
                    <span className="temp">{temp}</span>
                    :
                    // if segment is a styled text or component
                    <span
                        className="temp"
                        style={{ ...temp.styled }}
                    >
                        {temp.component ? "hmmmm" : temp.content}
                    </span>
            }


            {
                /* latest chunk animated ---------------------*/
                latest &&
                <span
                    key={update}
                    className="latest"
                    style={{ ["--dur" as any]: `${latest.duration}ms` }}
                >
                    {latest.component ? defineComponent(latest.component, latest.content) : latest.content}
                </span>
            }
        </div>
    )
}

export default memo(StreamNice)