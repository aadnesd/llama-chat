import { NextRequest } from 'next/server'
import { POST } from '../route'
import * as semanticKernel from '../../chat/engine/semantic-kernel'

// Mock the semantic kernel module
jest.mock('../../chat/engine/semantic-kernel', () => ({
  createSemanticKernel: jest.fn(),
  streamChatWithSemanticKernel: jest.fn(),
}))

// Mock ai/react StreamingTextResponse
jest.mock('ai', () => ({
  StreamingTextResponse: jest.fn().mockImplementation((stream) => ({
    body: stream,
    headers: new Headers({ 'content-type': 'text/plain; charset=utf-8' }),
  })),
}))

const mockSemanticKernel = semanticKernel as jest.Mocked<typeof semanticKernel>

describe('/api/chat-sk route', () => {
  let mockKernel: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockKernel = {
      invokeStreamingPrompt: jest.fn(),
    }

    mockSemanticKernel.createSemanticKernel.mockResolvedValue({
      kernel: mockKernel,
      chatClient: {} as any,
    })
  })

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest
  }

  describe('POST', () => {
    it('should return 400 when messages array is empty', async () => {
      const request = createMockRequest({ messages: [] })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('messages are required')
    })

    it('should return 400 when last message is not from user', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('last message must be from the user')
    })

    it('should create semantic kernel instance', async () => {
      const messages = [{ role: 'user', content: 'Hello' }]

      mockSemanticKernel.streamChatWithSemanticKernel.mockImplementation(async function* () {
        yield 'Hi there!'
      })

      const request = createMockRequest({ messages })
      await POST(request)

      expect(mockSemanticKernel.createSemanticKernel).toHaveBeenCalled()
    })

    it('should handle streaming response correctly', async () => {
      const messages = [{ role: 'user', content: 'Test message' }]

      mockSemanticKernel.streamChatWithSemanticKernel.mockImplementation(async function* () {
        yield 'Test response'
      })

      const request = createMockRequest({ messages })
      const response = await POST(request)

      expect(response.body).toBeDefined()
    })

    it('should handle errors in semantic kernel creation', async () => {
      const messages = [{ role: 'user', content: 'Hello' }]
      const error = new Error('Failed to create kernel')

      mockSemanticKernel.createSemanticKernel.mockRejectedValue(error)

      const request = createMockRequest({ messages })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create kernel')
    })

    it('should handle streaming error gracefully', async () => {
      const messages = [{ role: 'user', content: 'Hello' }]

      mockSemanticKernel.streamChatWithSemanticKernel.mockImplementation(async function* () {
        throw new Error('Streaming failed')
      })

      const request = createMockRequest({ messages })
      const response = await POST(request)

      // The response should be created successfully even if streaming fails later
      expect(response.body).toBeDefined()
    })

    it('should extract user message correctly', async () => {
      const messages = [
        { role: 'user', content: 'First message' },
        { role: 'assistant', content: 'First response' },
        { role: 'user', content: 'Latest message' },
      ]

      const request = createMockRequest({ messages })
      const response = await POST(request)

      // The function should succeed and create a streaming response
      expect(response.body).toBeDefined()
      
      // Verify that createSemanticKernel was called (meaning the message was valid)
      expect(mockSemanticKernel.createSemanticKernel).toHaveBeenCalled()
    })
  })
})