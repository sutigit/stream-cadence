export async function fetchResponse(input: string) {
  const res = await fetch("/api/openai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input }),
  });
  return res;
}
