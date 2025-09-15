# LlamaChat - AI-Powered Chat Application

**ALWAYS follow these instructions first.** Only use search or bash commands when you encounter unexpected information that does not match what's documented here.

LlamaChat is a Next.js 14 application built with TypeScript that integrates LlamaIndex for document-based AI chat functionality. The app can work with either MongoDB Atlas vector storage or local file-based storage as a fallback.

## Working Effectively

### Bootstrap and Build (CRITICAL TIMING INFO)
- **Node.js version**: Requires Node.js v20+ (v20.19.5 validated)
- **Install dependencies**: `npm install` -- takes 60 seconds, NEVER CANCEL. Set timeout to 120+ seconds.
- **Build the application**: `npm run build` -- takes 18-20 seconds, NEVER CANCEL. Set timeout to 60+ seconds.
- **Run linter**: `npm run lint` -- takes 5-10 seconds
- **Development server**: `npm run dev` -- starts in 1-2 seconds, runs on first available port (3000, 3001, 3002, etc.)

### Full Setup Process (Copy-Paste Ready)
```bash
# 1. Install dependencies (NEVER CANCEL - takes ~60 seconds)
npm install

# 2. Build application (NEVER CANCEL - takes ~18 seconds)
npm run build

# 3. Run linter to verify code quality
npm run lint

# 4. Start development server
npm run dev
```

### Environment Setup
- The application requires an `.env` file with `MODEL=gpt-3.5-turbo` and `NEXT_PUBLIC_MODEL=gpt-3.5-turbo`
- For full functionality, add OpenAI API key: `OPENAI_API_KEY=your_key_here`
- For MongoDB Atlas vector storage (optional), add:
  ```
  MONGO_URI=your_mongodb_connection_string
  MONGODB_DATABASE=your_database_name
  MONGODB_VECTORS=your_collection_name
  MONGODB_VECTOR_INDEX=your_vector_index_name
  ```

### Document Processing
- **Generate embeddings**: `npm run generate` -- NEVER CANCEL: Can take 5-15 minutes depending on document size
- Documents are stored in the `./data` directory (contains PDF files about construction projects)
- Local embeddings cache stored in `./cache` directory
- If MongoDB is not configured, automatically falls back to local storage

## Validation and Testing

### Always Run These Validation Steps After Changes
1. **Build validation**: `npm run build` (must complete successfully in ~18 seconds)
2. **Lint validation**: `npm run lint` (must show "No ESLint warnings or errors")
3. **Development server**: `npm run dev` (must start and show "Ready in" message)
4. **Manual testing scenario**: Open browser to localhost:3000+ and verify the chat interface loads

### Manual Testing Scenarios
- **Basic UI Test**: Navigate to the application URL, verify header, chat input, and message area are visible
- **Chat Interface Test**: Type a message in the input field and click "Send message" button
- **Document Chat Test** (requires OpenAI API key): Ask questions about the construction documents in the `./data` folder
- **File Upload Test**: Test the file upload functionality using the upload button in the chat input

### Development Server Behavior
- Automatically finds next available port (3000 → 3001 → 3002, etc.)
- Hot reload works for TypeScript/React changes
- API routes available at `/api/chat`
- Logs appear in terminal, including AI model responses and errors

## Codebase Navigation

### Key Directories and Files
```
├── app/                          # Next.js App Router
│   ├── api/chat/                # Chat API endpoint
│   │   ├── route.ts            # Main chat API handler
│   │   ├── engine/             # LlamaIndex integration
│   │   │   ├── index.ts        # Chat engine configuration
│   │   │   ├── generate.mjs    # Document embedding generator
│   │   │   ├── shared.mjs      # Shared constants and utilities
│   │   │   └── constants.mjs   # Local storage constants
│   │   └── llamaindex-stream.ts # AI streaming utilities
│   ├── components/             # React components
│   │   ├── chat-section.tsx    # Main chat interface
│   │   ├── header.tsx          # Application header
│   │   └── ui/                 # Reusable UI components
│   │       ├── chat/           # Chat-specific components
│   │       │   ├── chat-input.tsx     # Message input component
│   │       │   ├── chat-messages.tsx  # Message display component
│   │       │   ├── chat-avatar.tsx    # User/AI avatars
│   │       │   └── chat-message.tsx   # Individual message component
│   │       ├── button.tsx      # Reusable button component
│   │       └── input.tsx       # Reusable input component
│   ├── layout.tsx              # Root layout (uses system fonts)
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles (Tailwind CSS)
├── data/                       # Document storage (PDF files)
├── cache/                      # Local vector embeddings cache
├── public/                     # Static assets
├── .env                        # Environment variables
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── next.config.js             # Next.js configuration
```

### Important Implementation Details
- **Dual Storage Support**: MongoDB Atlas (primary) with local file fallback
- **Font Configuration**: Uses system fonts (Google Fonts removed due to network restrictions)
- **TypeScript**: Strict mode enabled with proper type checking
- **Styling**: Tailwind CSS with custom gradient backgrounds
- **File Uploads**: Supports both document and image uploads
- **Streaming**: Real-time AI response streaming using Vercel AI SDK

## Common Tasks and Troubleshooting

### When Making API Changes
- Always check `app/api/chat/route.ts` for the main chat logic
- The engine configuration is in `app/api/chat/engine/index.ts`
- After API changes, test with `npm run build` and manual chat testing

### When Making UI Changes
- Chat components are in `app/components/ui/chat/`
- Main chat interface is `app/components/chat-section.tsx`
- Always verify that TypeScript compiles without errors
- Test both message sending and receiving scenarios

### When Adding Dependencies
- Run `npm install <package>` first
- Always run `npm run build` to verify compatibility
- Check for TypeScript declaration files if needed

### Common Issues and Solutions
- **Build fails with "Set OpenAI Key" error**: This is expected when running `generate` without API key
- **Port already in use**: Development server automatically finds next available port
- **Google Fonts errors**: Already resolved - application uses system fonts
- **MongoDB connection errors**: Expected when MongoDB is not configured - fallback to local storage works
- **TypeScript errors**: Most common in chat components - check proper prop typing

### Before Committing Changes
```bash
# Always run this sequence before committing
npm run build    # Must succeed in ~18 seconds
npm run lint     # Must show no errors or warnings
npm run dev      # Verify dev server starts
# Manual test: Open browser and verify UI works
```

## Performance Expectations
- **npm install**: 60 seconds (includes heavy AI/ML dependencies)
- **npm run build**: 18-20 seconds (optimized production build)
- **npm run lint**: 5-10 seconds (ESLint checks)
- **npm run dev**: 1-2 seconds to start, hot reload <1 second
- **npm run generate**: 5-15 minutes (depends on document count and OpenAI API speed)

## Architecture Notes
- Built on Next.js 14 with App Router
- Uses LlamaIndex TypeScript for AI integration
- Supports both OpenAI GPT models and local embeddings
- Implements proper error boundaries and fallback mechanisms
- Responsive design with Tailwind CSS
- Real-time streaming responses for better UX

**Remember**: Always validate build and lint success after any changes. The application has been thoroughly tested and these commands work reliably when run with proper timeouts.
