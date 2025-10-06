import client from "../connection";

export async function POST(req: Request) {
  const { input, instructions } = await req.json();
  const stream = await client.responses.create({
    model: process.env.OPENAI_MODEL!,
    stream: true,
    instructions,
    input,
  });

  const encoder = new TextEncoder();
  const rs = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          controller.enqueue(encoder.encode(event.delta));
        }
      }
      controller.close();
    },
  });

  return new Response(rs, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
