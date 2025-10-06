export async function fetchResponse(input: string, instructions?: string) {
  const res = await fetch("/api/openai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, instructions: instructions ?? "" }),
  });
  return res;
}
