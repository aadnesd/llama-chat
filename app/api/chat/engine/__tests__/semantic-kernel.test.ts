import { OpenAIChatClient } from '@semantic-kernel/openai'
import { Kernel } from 'semantic-kernel'
import {
  createSemanticKernel,
  chatWithSemanticKernel,
  streamChatWithSemanticKernel,
} from '../semantic-kernel'

// Mock the semantic kernel modules
jest.mock('@semantic-kernel/openai')
jest.mock('semantic-kernel')

const MockedOpenAIChatClient = OpenAIChatClient as jest.MockedClass<typeof OpenAIChatClient>
const MockedKernel = Kernel as jest.MockedClass<typeof Kernel>

describe('Semantic Kernel Service', () => {
  let mockKernel: jest.Mocked<Kernel>
  let mockChatClient: jest.Mocked<OpenAIChatClient>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockKernel = {
      addService: jest.fn(),
      invokePrompt: jest.fn(),
      invokeStreamingPrompt: jest.fn(),
    } as any

    mockChatClient = {
      chat: jest.fn(),
    } as any

    MockedKernel.mockImplementation(() => mockKernel)
    MockedOpenAIChatClient.mockImplementation(() => mockChatClient)
  })

  describe('createSemanticKernel', () => {
    it('should create a kernel with OpenAI chat client', async () => {
      const originalEnv = process.env
      process.env.OPENAI_API_KEY = 'test-key'
      process.env.MODEL = 'gpt-4'

      const result = await createSemanticKernel()

      expect(MockedOpenAIChatClient).toHaveBeenCalledWith({
        apiKey: 'test-key',
        modelId: 'gpt-4',
      })
      expect(MockedKernel).toHaveBeenCalled()
      expect(mockKernel.addService).toHaveBeenCalledWith(mockChatClient)
      expect(result).toEqual({
        kernel: mockKernel,
        chatClient: mockChatClient,
      })

      process.env = originalEnv
    })

    it('should use default model when MODEL env var is not set', async () => {
      const originalEnv = process.env
      process.env.OPENAI_API_KEY = 'test-key'
      delete process.env.MODEL

      await createSemanticKernel()

      expect(MockedOpenAIChatClient).toHaveBeenCalledWith({
        apiKey: 'test-key',
        modelId: 'gpt-3.5-turbo',
      })

      process.env = originalEnv
    })
  })

  describe('chatWithSemanticKernel', () => {
    it('should return response from kernel prompt invocation', async () => {
      const mockResponse = { text: 'Hello, how can I help you?' }
      mockKernel.invokePrompt.mockResolvedValue(mockResponse)

      const result = await chatWithSemanticKernel(mockKernel, 'Hello')

      expect(mockKernel.invokePrompt).toHaveBeenCalledWith('Hello')
      expect(result).toBe('Hello, how can I help you?')
    })

    it('should return default message when response has no text', async () => {
      mockKernel.invokePrompt.mockResolvedValue(null)

      const result = await chatWithSemanticKernel(mockKernel, 'Hello')

      expect(result).toBe("I'm sorry, I couldn't generate a response.")
    })

    it('should throw error when kernel invocation fails', async () => {
      const error = new Error('API Error')
      mockKernel.invokePrompt.mockRejectedValue(error)

      await expect(chatWithSemanticKernel(mockKernel, 'Hello')).rejects.toThrow(
        'Failed to generate response with Semantic Kernel'
      )
    })

    it('should handle chat history parameter', async () => {
      const mockResponse = { text: 'Response with history' }
      mockKernel.invokePrompt.mockResolvedValue(mockResponse)
      const chatHistory = [{ role: 'user', content: 'Previous message' }]

      const result = await chatWithSemanticKernel(mockKernel, 'Hello', chatHistory)

      expect(mockKernel.invokePrompt).toHaveBeenCalledWith('Hello')
      expect(result).toBe('Response with history')
    })
  })

  describe('streamChatWithSemanticKernel', () => {
    it('should yield streaming response chunks', async () => {
      const mockChunks = [
        { text: 'Hello ' },
        { text: 'there! ' },
        { text: 'How can I help?' },
      ]

      mockKernel.invokeStreamingPrompt.mockImplementation(async function* () {
        for (const chunk of mockChunks) {
          yield chunk
        }
      })

      const generator = streamChatWithSemanticKernel(mockKernel, 'Hello')
      const results = []

      for await (const chunk of generator) {
        results.push(chunk)
      }

      expect(mockKernel.invokeStreamingPrompt).toHaveBeenCalledWith('Hello')
      expect(results).toEqual(['Hello ', 'there! ', 'How can I help?'])
    })

    it('should skip chunks without text', async () => {
      const mockChunks = [
        { text: 'Hello ' },
        { other: 'data' }, // chunk without text
        { text: 'world!' },
      ]

      mockKernel.invokeStreamingPrompt.mockImplementation(async function* () {
        for (const chunk of mockChunks) {
          yield chunk
        }
      })

      const generator = streamChatWithSemanticKernel(mockKernel, 'Hello')
      const results = []

      for await (const chunk of generator) {
        results.push(chunk)
      }

      expect(results).toEqual(['Hello ', 'world!'])
    })

    it('should throw error when streaming fails', async () => {
      const error = new Error('Streaming error')
      mockKernel.invokeStreamingPrompt.mockImplementation(async function* () {
        throw error
      })

      const generator = streamChatWithSemanticKernel(mockKernel, 'Hello')

      await expect(async () => {
        for await (const chunk of generator) {
          // This should throw
        }
      }).rejects.toThrow('Failed to generate streaming response with Semantic Kernel')
    })

    it('should handle chat history parameter in streaming', async () => {
      const mockChunks = [{ text: 'Streaming with history' }]
      mockKernel.invokeStreamingPrompt.mockImplementation(async function* () {
        for (const chunk of mockChunks) {
          yield chunk
        }
      })

      const chatHistory = [{ role: 'user', content: 'Previous message' }]
      const generator = streamChatWithSemanticKernel(mockKernel, 'Hello', chatHistory)
      const results = []

      for await (const chunk of generator) {
        results.push(chunk)
      }

      expect(mockKernel.invokeStreamingPrompt).toHaveBeenCalledWith('Hello')
      expect(results).toEqual(['Streaming with history'])
    })
  })
})