"use client";

import { useChat } from "ai/react";
import { useMemo, useState } from "react";
import { insertDataIntoMessages } from "./transform";
import { ChatInput, ChatMessages } from "./ui/chat";

export default function ChatSection() {
  const [useSemanticKernel, setUseSemanticKernel] = useState(false);

  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    data,
  } = useChat({
    api: useSemanticKernel ? "/api/chat-sk" : "/api/chat",
    headers: {
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
  });

  const transformedMessages = useMemo(() => {
    return insertDataIntoMessages(messages, data);
  }, [messages, data]);

  return (
    <div className="space-y-4 max-w-5xl w-full">
      {/* Engine Toggle */}
      <div className="bg-white rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Engine Selection
            </h3>
            <p className="text-sm text-gray-600">
              Choose between LlamaIndex (with MongoDB) or Microsoft Semantic Kernel
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="llamaindex"
                checked={!useSemanticKernel}
                onChange={() => setUseSemanticKernel(false)}
                className="mr-2"
              />
              LlamaIndex
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="semantic-kernel"
                checked={useSemanticKernel}
                onChange={() => setUseSemanticKernel(true)}
                className="mr-2"
              />
              Semantic Kernel
            </label>
          </div>
        </div>
        {useSemanticKernel && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Semantic Kernel mode uses direct OpenAI API integration without vector database storage.
              Make sure to set your OPENAI_API_KEY environment variable.
            </p>
          </div>
        )}
      </div>

      <ChatMessages
        messages={transformedMessages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
      />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        multiModal={process.env.NEXT_PUBLIC_MODEL === "gpt-4-vision-preview"}
      />
    </div>
  );
}
