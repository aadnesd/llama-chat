import { StreamingTextResponse } from "ai";
import { ChatMessage } from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createSemanticKernel, streamChatWithSemanticKernel } from "../chat/engine/semantic-kernel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages }: { messages: ChatMessage[] } = body;
    const userMessage = messages.pop();
    
    if (!messages || !userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    // Create Semantic Kernel instance
    const { kernel } = await createSemanticKernel();

    // Create a streaming response using Semantic Kernel
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatWithSemanticKernel(
            kernel,
            userMessage.content,
            messages
          )) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("[Semantic Kernel]", error);
          controller.error(error);
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("[Semantic Kernel]", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}