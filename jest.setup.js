import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.OPENAI_API_KEY = 'test-api-key'
process.env.MODEL = 'gpt-3.5-turbo'

// Mock Next.js NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map(),
    })),
  },
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock semantic-kernel modules for testing
jest.mock('@semantic-kernel/openai', () => ({
  OpenAIChatClient: jest.fn().mockImplementation(() => ({
    chat: jest.fn().mockResolvedValue({ text: 'Mock response' }),
  })),
}))

jest.mock('semantic-kernel', () => ({
  Kernel: jest.fn().mockImplementation(() => ({
    addService: jest.fn(),
    invokePrompt: jest.fn().mockResolvedValue({ text: 'Mock response' }),
    invokeStreamingPrompt: jest.fn().mockImplementation(async function* () {
      yield { text: 'Mock ' }
      yield { text: 'streaming ' }
      yield { text: 'response' }
    }),
  })),
}))