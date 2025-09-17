This is a [LlamaIndex](https://www.llamaindex.ai/) project using [Next.js](https://nextjs.org/) bootstrapped with [`create-llama`](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/create-llama).

## Features

- **Dual AI Engine Support**: Choose between LlamaIndex (with MongoDB vector storage) and Microsoft Semantic Kernel
- **LlamaIndex Integration**: Uses MongoDB Atlas Vector Search for document retrieval and context-aware responses
- **Semantic Kernel Integration**: Direct OpenAI API integration with Microsoft's Semantic Kernel framework
- **Dynamic Engine Switching**: Toggle between engines in the UI without restarting the application

## Getting Started

First, install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Model configuration
MODEL=gpt-3.5-turbo
NEXT_PUBLIC_MODEL=gpt-3.5-turbo

# For LlamaIndex with MongoDB (default engine)
MONGO_URI=your_mongodb_connection_string
MONGODB_DATABASE=your_database_name
MONGODB_VECTORS=your_vector_collection_name
MONGODB_VECTOR_INDEX=your_vector_index_name

# For Semantic Kernel (optional)
OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## AI Engine Options

### LlamaIndex Engine (Default)
- Uses MongoDB Atlas Vector Search for document storage and retrieval
- Provides context-aware responses based on your document corpus
- Requires MongoDB setup and vector index configuration
- Best for applications that need to query against specific documents

### Semantic Kernel Engine
- Direct integration with OpenAI's API through Microsoft Semantic Kernel
- Provides general conversational AI capabilities
- Requires only an OpenAI API key
- Best for general-purpose chat applications

## Switching Between Engines

Use the radio buttons in the UI to switch between:
- **LlamaIndex**: Document-aware responses using vector search
- **Semantic Kernel**: General-purpose conversational AI

## Building the Application

To create a production build:

```bash
npm run build
```

## API Endpoints

- `/api/chat` - LlamaIndex-powered chat endpoint
- `/api/chat-sk` - Semantic Kernel-powered chat endpoint

## Learn More

To learn more about the underlying technologies:

- [LlamaIndex Documentation](https://docs.llamaindex.ai) - learn about LlamaIndex (Python features).
- [LlamaIndexTS Documentation](https://ts.llamaindex.ai) - learn about LlamaIndex (TypeScript features).
- [Microsoft Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/) - learn about Semantic Kernel framework.

You can check out [the LlamaIndexTS GitHub repository](https://github.com/run-llama/LlamaIndexTS) - your feedback and contributions are welcome!
