import { OpenAIChatClient } from "@semantic-kernel/openai";
import { Kernel } from "semantic-kernel";

/**
 * Creates a Semantic Kernel instance with OpenAI integration
 */
export async function createSemanticKernel() {
  // Create OpenAI chat client
  const chatClient = new OpenAIChatClient({
    apiKey: process.env.OPENAI_API_KEY,
    modelId: (process.env.MODEL as string) ?? "gpt-3.5-turbo",
  });

  // Create kernel and add the chat client as a service
  const kernel = new Kernel();
  kernel.addService(chatClient);

  return { kernel, chatClient };
}

/**
 * Simple chat completion using Semantic Kernel
 */
export async function chatWithSemanticKernel(
  kernel: Kernel,
  message: string,
  chatHistory: any[] = []
): Promise<string> {
  try {
    // Use the kernel's prompt invocation
    const result = await kernel.invokePrompt(message);
    
    return result?.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Semantic Kernel chat error:", error);
    throw new Error("Failed to generate response with Semantic Kernel");
  }
}

/**
 * Streaming chat completion using Semantic Kernel
 */
export async function* streamChatWithSemanticKernel(
  kernel: Kernel,
  message: string,
  chatHistory: any[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    // Use streaming prompt invocation
    const streamingResponse = kernel.invokeStreamingPrompt(message);
    
    for await (const chunk of streamingResponse) {
      if (chunk?.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Semantic Kernel streaming error:", error);
    throw new Error("Failed to generate streaming response with Semantic Kernel");
  }
}