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
