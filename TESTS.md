# Test Suite Documentation

This document describes the comprehensive test suite for the llama-chat application, specifically covering the Microsoft Semantic Kernel integration.

## Overview

The test suite uses Jest with TypeScript support and React Testing Library for component testing. All tests are located in `__tests__` directories alongside the code they test.

## Test Structure

### 1. Semantic Kernel Service Tests (`app/api/chat/engine/__tests__/semantic-kernel.test.ts`)

Tests the core Semantic Kernel integration functions:

- **`createSemanticKernel()`**
  - Creates kernel with OpenAI chat client
  - Handles environment variables correctly
  - Uses default model when not specified

- **`chatWithSemanticKernel()`**
  - Returns proper responses from kernel invocation
  - Handles empty responses with fallback message
  - Properly throws errors on failures
  - Supports chat history parameter

- **`streamChatWithSemanticKernel()`**
  - Yields streaming response chunks correctly
  - Skips chunks without text content
  - Handles streaming errors appropriately
  - Supports chat history in streaming mode

### 2. API Route Tests (`app/api/chat-sk/__tests__/route.test.ts`)

Tests the HTTP endpoint for Semantic Kernel chat:

- **Request Validation**
  - Returns 400 for empty messages array
  - Returns 400 when last message is not from user
  - Properly extracts user messages from chat history

- **Successful Operations**
  - Creates semantic kernel instance correctly
  - Handles streaming responses appropriately
  - Manages chat history properly

- **Error Handling**
  - Handles semantic kernel creation errors
  - Manages streaming errors gracefully
  - Returns proper error responses with correct status codes

### 3. UI Component Tests (`app/components/__tests__/chat-section.test.tsx`)

Tests the chat interface with engine selection:

- **Engine Selection Interface**
  - Renders engine selection radio buttons
  - Defaults to LlamaIndex engine
  - Allows switching between engines
  - Shows/hides Semantic Kernel warnings appropriately

- **API Integration**
  - Uses `/api/chat` endpoint for LlamaIndex
  - Uses `/api/chat-sk` endpoint for Semantic Kernel
  - Passes correct props to child components

- **User Interactions**
  - Handles radio button changes correctly
  - Maintains proper state management
  - Supports keyboard and mouse interactions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- app/api/chat/engine/__tests__/semantic-kernel.test.ts
```

## Test Coverage

The test suite provides comprehensive coverage for:

- ✅ **Semantic Kernel Service**: 100% coverage
- ✅ **Chat-SK API Route**: 73.91% coverage
- ✅ **Chat Section Component**: 100% coverage

Key areas covered:
- All happy path scenarios
- Error handling and edge cases
- API request/response validation
- UI state management and interactions
- Environment variable handling
- Streaming response functionality

## Mock Strategy

The tests use comprehensive mocking to isolate functionality:

- **Semantic Kernel modules** are mocked to avoid external dependencies
- **Next.js APIs** (Request, Response, Headers) are polyfilled for Node.js environment
- **AI/React StreamingTextResponse** is mocked for streaming tests
- **Environment variables** are set up for consistent test runs

## Future Test Enhancements

Potential areas for additional testing:
- Integration tests with real Semantic Kernel API (in CI environment)
- End-to-end tests for complete chat flows
- Performance tests for streaming responses
- Accessibility tests for UI components
- Visual regression tests for engine selection interface

## Best Practices

The test suite follows these best practices:
- **Isolation**: Each test is independent and doesn't affect others
- **Clarity**: Test names clearly describe what is being tested
- **Coverage**: Critical paths and error scenarios are thoroughly tested
- **Maintainability**: Tests are well-organized and easy to update
- **Performance**: Tests run quickly with appropriate mocking