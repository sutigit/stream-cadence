import { Send } from "lucide-react";
import { FormEventHandler } from "react";

export default function ChatInput({
    onSubmit,
    input,
    setInput
}: {
    onSubmit: FormEventHandler<HTMLFormElement>,
    input: string,
    setInput: (value: string) => void
}) {

    return (
        <div className="w-full">
            <div className="pb-3 flex gap-4 flex-wrap justify-center">
                <button className="cursor-pointer bg-zinc-800 px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="truncate">Tell me about our second closest star</span>
                    <span className="flex-shrink-0"><Send size={14} /></span>
                </button>
                <button className="cursor-pointer bg-zinc-800 px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="truncate">Read me a bed time story</span>
                    <span className="flex-shrink-0"><Send size={14} /></span>
                </button>
                <button className="cursor-pointer bg-zinc-800 px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="truncate">How does this technology work?</span>
                    <span className="flex-shrink-0"><Send size={14} /></span>
                </button>
            </div>
            <form onSubmit={onSubmit} className="flex mx-auto gap-5 bg-zinc-800 rounded-3xl py-3 pl-8 pr-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything"
                    className="w-full outline-none "
                />
                <button
                    type="submit"
                    className="h-12 cursor-pointer aspect-square bg-indigo-500 flex justify-center items-center rounded-full"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
