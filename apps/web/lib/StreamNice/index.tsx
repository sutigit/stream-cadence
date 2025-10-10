import { Component, InternalSeg, Next, StreamNiceProps, Styled } from "./types"
import "./nice.css"
import { memo, ReactNode, useEffect, useState } from "react"

// - [x] Performance: collapse old spans to text chunks, keep styled or component spans as they are.
// - [x] accomodate styled
// - [x] accomodate component 
// - [X] where the hell did my fadeIn go
// - [X] use something else than flushSync.... try animationInterval then...

// ROADMAP THINGS
// - add markdown parser
// - RegWrap
// - streaming style -> smooth | word and default


const StreamNice: React.FC<StreamNiceProps> = ({ next, inStream, ...rest }) => {

    const defineComponent = (componentId: string, target: string) => {
        const Component = inStream?.[componentId]
        return Component ? <Component id={componentId} match={target} /> : <span style={{ color: '#E11D48' }}>Invalid {componentId}</span>
    }

    const [old, setOld] = useState<(string | Next)[]>([])
    const [temp, setTemp] = useState<string | Next>("")
    const [last, setLast] = useState<Next | null>(null)

    const [update, setUpdate] = useState<string>(crypto.randomUUID()) // force update

    useEffect(() => {
        if (!next) {
            setOld([])
            setTemp("")
            setLast(null)
            return
        }

        const prev = last
        if (prev) {
            if (prev?.basic) {
                // if basic chunk, accumulate text content to one 
                // segment untila a none basic chunk appears
                setTemp(t => t + prev.content as string)
            } else {
                // when chunk is not basic, push the segments to old segments

                // 1. copy current old segments
                const harden: (string | Next)[] = [...old]

                // 2. add the accumulated string temp if any
                if (temp) harden.push(temp as string)

                // 3. add the lastest none basic chunk
                harden.push(prev as Next)

                // 4. apply all
                setOld(harden)

                // 5. reset temp
                setTemp("")
            }
        }

        setLast(next)
        setUpdate(crypto.randomUUID()) // force update last chunk
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
                        // if segment is a styled or component object
                        <span
                            key={i}
                            className="old"
                            style={{ ...old.styled }}
                        >
                            {old.component ? defineComponent(old.component, old.content) : old.content}
                        </span>
                ))
            }

            {
                /* temporary segment ----------------------- */
                (typeof temp === "string") ?
                    // if segment is purely text
                    <span className="temp">{temp}</span>
                    :
                    // if segment is a styled or component object
                    <span
                        className="temp"
                        style={{ ...temp.styled }}
                    >
                        {temp.component ? defineComponent(temp.component, temp.content) : temp.content}
                    </span>
            }


            {
                /* last chunk animated ---------------------*/
                last &&
                <span
                    key={update}
                    className="last stream-nice-anim"
                    style={{ ["--dur" as any]: `${last.duration}ms`, ...last.styled }}
                >
                    {last.component ? defineComponent(last.component, last.content) : last.content}
                </span>
            }
        </div>
    )
}

export default StreamNice