import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import React, { useState } from 'react'

export default function Header() {
    const [cadence, setCadence] = useState<boolean>(true)
    const [highlights, setHighlights] = useState<boolean>(true)
    const [interactions, setInteractions] = useState<boolean>(true)
    const [speed, setSpeed] = useState<number>(70)

    return (
        <>
            <div className="mb-10">
                <p className="text-6xl font-bold mb-2">Customize AI message</p>
                <p className="text-6xl font-bold">streams with ease. <span className="text-xl text-indigo-400/80">beta</span></p>
            </div>
            <div className="w-full h-[540px] grid grid-cols-3 gap-1 text-primary-foreground">

                {/* Chat container --------------------- */}
                <div className="chat-container w-full h-full px-6 py-4 col-span-2 bg-orange-100/80 rounded-2xl grid place-items-center">
                    <div className="w-full h-full flex flex-col justify-between">
                        <p className=" font-bold text-lg">Your AI message</p>
                        <div className="py-6 px-2 flex-1 text-2xl">
                            Loorem ipsuum laalaalaa
                        </div>
                        <div className="h-15 w-full bg-orange-200/50 shadow-md rounded-full flex flex-row justify-between items-center pl-6 pr-3">
                            <p className="italic opacity-40">Type your message here</p>
                            <div className="h-10 aspect-square rounded-full bg-indigo-200"></div>
                        </div>
                    </div>
                </div>

                {/* Chat settings ---------------------- */}
                <div className="chat-settings w-full h-full grid col-span-1 grid-rows-4 gap-1">


                    {/* system prompt ----------------------*/}
                    <div className="system-prompt px-6 py-4 w-full h-full bg-lime-100/80 row-span-2 rounded-2xl grid place-items-center">
                        <div className="w-full h-full">
                            <p className="font-bold text-lg mb-4">System prompt</p>
                            <p className="leading-5 whitespace-pre-line opacity-80">
                                {
                                    `Prefix all the key stuff regarding the topic with !key:

                  e.g. 
                  Lorem !key:ipsum`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Stream cadence and speed -------------- */}
                    <div className="stream-cadence-and-speed row-span-1 grid grid-cols-3 gap-1">
                        <div className="stream-speed-slider px-6 py-4 bg-stone-100/80 rounded-2xl col-span-2 grid place-items-center">
                            <div className="w-full h-full relative">
                                <p className="font-bold text-lg">Streaming speed</p>
                                <div className="absolute px-4 top-5/9 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex gap-4">
                                    <span>Slow</span>
                                    <Slider min={10} max={100} value={[speed]} onValueChange={([v]) => setSpeed(v!)} />
                                    <span>Fast</span></div>
                            </div>
                        </div>
                        <div className="cadence-switch px-6 py-4 bg-red-100/80 rounded-2xl col-span-1 grid place-items-center">
                            <div className="w-full h-full relative">
                                <p className="font-bold text-lg">Cadence</p>
                                <div className="absolute top-5/9 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 ">
                                    <Switch checked={cadence} onClick={() => setCadence(prev => !prev)} />
                                    <span>{cadence ? 'On' : 'Off'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Styled and components ----------------- */}
                    <div className="stream-switches row-span-1 grid grid-cols-2 gap-1">
                        <div className="switch-highlighs px-6 py-4 bg-purple-100/80 rounded-2xl grid place-items-center">
                            {/* highlights switch */}
                            <div className="w-full h-full relative">
                                <p className="font-bold text-lg">Highlights</p>
                                <div className="absolute top-5/9 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm">
                                    <span className="font-bold">Match:</span>
                                    <span className={cn("bg-purple-100/60 px-2 rounded", highlights ? 'opacity-100' : 'opacity-50')}>!key:</span>
                                    <Switch checked={highlights} onClick={() => setHighlights(prev => !prev)} />
                                    <span>{highlights ? 'On' : 'Off'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="switch-interactions px-6 py-4 bg-emerald-100/80 rounded-2xl grid place-items-center">
                            {/* interactions switch */}
                            <div className="w-full h-full relative">
                                <p className="font-bold text-lg">Interactions</p>
                                <div className="absolute top-5/9 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-sm">
                                    <span className="font-bold">Match:</span>
                                    <span className={cn("bg-emerald-100/60 px-2 rounded", interactions ? 'opacity-100' : 'opacity-50')}>Saturn</span>
                                    <Switch checked={interactions} onClick={() => setInteractions(prev => !prev)} />
                                    <span>{interactions ? 'On' : 'Off'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
