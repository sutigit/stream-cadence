import { Send } from "lucide-react";
import { FormEventHandler } from "react";
import { Button } from "./ui/button";

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
            <div className="pb-3 flex gap-4 flex-wrap justify-start">
                <Button className="cursor-pointer bg-zinc-800 text-primary/70 hover:opacity-100 px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="truncate">Tell me about our second closest star</span>
                    <span className="flex-shrink-0"><Send size={14} /></span>
                </Button>
                <Button className="cursor-pointer bg-zinc-800 text-primary/70 hover:opacity-100 px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="truncate">Read me a bed time story</span>
                    <span className="flex-shrink-0"><Send size={14} /></span>
                </Button>
                <Button className="cursor-pointer bg-zinc-800 text-primary/70 hover:opacity-100 px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 whitespace-nowrap">
                    <span className="truncate">How does this technology work?</span>
                    <span className="flex-shrink-0"><Send size={14} /></span>
                </Button>
            </div>
            <form onSubmit={onSubmit} className="flex mx-auto gap-5 bg-zinc-800 rounded-3xl py-3 pl-8 pr-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything"
                    className="w-full outline-none "
                />
                <Button
                    type="submit"
                    className="h-10 text-primary cursor-pointer aspect-square bg-indigo-500 flex justify-center items-center rounded-full"
                >
                    <Send size={20} />
                </Button>
            </form>
        </div>
    );
}
