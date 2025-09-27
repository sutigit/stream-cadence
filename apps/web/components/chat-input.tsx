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
        <form onSubmit={onSubmit} className="w-full flex mx-auto gap-5 bg-zinc-800 rounded-3xl py-3 pl-8 pr-4">
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
    );
}
