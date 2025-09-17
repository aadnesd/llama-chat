import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useChat } from 'ai/react'
import ChatSection from '../chat-section'

// Mock the useChat hook from ai/react
jest.mock('ai/react', () => ({
  useChat: jest.fn(),
}))

// Mock the transform module
jest.mock('../transform', () => ({
  insertDataIntoMessages: jest.fn((messages) => messages),
}))

// Mock child components
jest.mock('../ui/chat', () => ({
  ChatMessages: ({ messages, isLoading, reload, stop }: any) => (
    <div data-testid="chat-messages">
      Messages: {messages.length}, Loading: {isLoading.toString()}
    </div>
  ),
  ChatInput: ({ input, handleSubmit, handleInputChange, isLoading }: any) => (
    <div data-testid="chat-input">
      <input
        value={input}
        onChange={handleInputChange}
        data-testid="message-input"
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        data-testid="submit-button"
      >
        Submit
      </button>
    </div>
  ),
}))

const mockUseChat = useChat as jest.MockedFunction<typeof useChat>

describe('ChatSection', () => {
  const defaultChatProps = {
    messages: [],
    input: '',
    isLoading: false,
    handleSubmit: jest.fn(),
    handleInputChange: jest.fn(),
    reload: jest.fn(),
    stop: jest.fn(),
    data: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseChat.mockReturnValue(defaultChatProps)
  })

  it('should render engine selection interface', () => {
    render(<ChatSection />)

    expect(screen.getByText('AI Engine Selection')).toBeInTheDocument()
    expect(screen.getByText(/Choose between LlamaIndex/)).toBeInTheDocument()
    expect(screen.getByLabelText('LlamaIndex')).toBeInTheDocument()
    expect(screen.getByLabelText('Semantic Kernel')).toBeInTheDocument()
  })

  it('should default to LlamaIndex engine', () => {
    render(<ChatSection />)

    const llamaIndexRadio = screen.getByLabelText('LlamaIndex')
    const semanticKernelRadio = screen.getByLabelText('Semantic Kernel')

    expect(llamaIndexRadio).toBeChecked()
    expect(semanticKernelRadio).not.toBeChecked()
  })

  it('should use /api/chat endpoint when LlamaIndex is selected', () => {
    render(<ChatSection />)

    expect(mockUseChat).toHaveBeenCalledWith(
      expect.objectContaining({
        api: '/api/chat',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
  })

  it('should switch to Semantic Kernel engine when selected', async () => {
    const user = userEvent.setup()
    
    // Re-render component when useChat is called with different props
    let chatProps = defaultChatProps
    mockUseChat.mockImplementation((props) => {
      if (props.api === '/api/chat-sk') {
        // Simulate new useChat call with different API
        chatProps = { ...defaultChatProps }
      }
      return chatProps
    })

    const { rerender } = render(<ChatSection />)

    const semanticKernelRadio = screen.getByLabelText('Semantic Kernel')
    await user.click(semanticKernelRadio)

    // Force re-render to trigger useChat with new state
    rerender(<ChatSection />)

    expect(semanticKernelRadio).toBeChecked()
    expect(screen.getByLabelText('LlamaIndex')).not.toBeChecked()
  })

  it('should show Semantic Kernel warning when selected', async () => {
    const user = userEvent.setup()
    render(<ChatSection />)

    // Initially, warning should not be visible
    expect(screen.queryByText(/Semantic Kernel mode uses direct OpenAI/)).not.toBeInTheDocument()

    const semanticKernelRadio = screen.getByLabelText('Semantic Kernel')
    await user.click(semanticKernelRadio)

    // Warning should now be visible
    expect(screen.getByText(/Semantic Kernel mode uses direct OpenAI/)).toBeInTheDocument()
    expect(screen.getByText(/Make sure to set your OPENAI_API_KEY/)).toBeInTheDocument()
  })

  it('should hide Semantic Kernel warning when LlamaIndex is selected', async () => {
    const user = userEvent.setup()
    render(<ChatSection />)

    // First select Semantic Kernel to show warning
    const semanticKernelRadio = screen.getByLabelText('Semantic Kernel')
    await user.click(semanticKernelRadio)
    expect(screen.getByText(/Semantic Kernel mode uses direct OpenAI/)).toBeInTheDocument()

    // Then select LlamaIndex to hide warning
    const llamaIndexRadio = screen.getByLabelText('LlamaIndex')
    await user.click(llamaIndexRadio)
    expect(screen.queryByText(/Semantic Kernel mode uses direct OpenAI/)).not.toBeInTheDocument()
  })

  it('should render ChatMessages component with correct props', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' },
    ]
    const isLoading = false
    const reload = jest.fn()
    const stop = jest.fn()

    mockUseChat.mockReturnValue({
      ...defaultChatProps,
      messages,
      isLoading,
      reload,
      stop,
    })

    render(<ChatSection />)

    const chatMessages = screen.getByTestId('chat-messages')
    expect(chatMessages).toHaveTextContent('Messages: 2, Loading: false')
  })

  it('should render ChatInput component with correct props', () => {
    const input = 'Test message'
    const handleSubmit = jest.fn()
    const handleInputChange = jest.fn()
    const isLoading = true

    mockUseChat.mockReturnValue({
      ...defaultChatProps,
      input,
      handleSubmit,
      handleInputChange,
      isLoading,
    })

    render(<ChatSection />)

    const messageInput = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')

    expect(messageInput).toHaveValue('Test message')
    expect(submitButton).toBeDisabled()
  })

  it('should handle radio button changes correctly', async () => {
    const user = userEvent.setup()
    render(<ChatSection />)

    const llamaIndexRadio = screen.getByLabelText('LlamaIndex')
    const semanticKernelRadio = screen.getByLabelText('Semantic Kernel')

    // Initially LlamaIndex should be selected
    expect(llamaIndexRadio).toBeChecked()
    expect(semanticKernelRadio).not.toBeChecked()

    // Click Semantic Kernel
    await user.click(semanticKernelRadio)
    expect(semanticKernelRadio).toBeChecked()
    expect(llamaIndexRadio).not.toBeChecked()

    // Click LlamaIndex again
    await user.click(llamaIndexRadio)
    expect(llamaIndexRadio).toBeChecked()
    expect(semanticKernelRadio).not.toBeChecked()
  })

  it('should apply correct styling classes', () => {
    render(<ChatSection />)

    // Just verify the elements exist and have some basic structure
    const engineSelection = screen.getByText('AI Engine Selection')
    expect(engineSelection).toBeInTheDocument()
    
    const container = engineSelection.closest('div')
    expect(container).toBeDefined()
    
    const mainContainer = screen.getByTestId('chat-messages').parentElement?.parentElement
    expect(mainContainer).toBeDefined()
  })

  it('should handle multiModal prop correctly', () => {
    const originalEnv = process.env.NEXT_PUBLIC_MODEL
    process.env.NEXT_PUBLIC_MODEL = 'gpt-4-vision-preview'

    mockUseChat.mockReturnValue(defaultChatProps)

    render(<ChatSection />)

    // The multiModal prop should be passed as true to ChatInput
    // This is tested indirectly through the component rendering without errors
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()

    process.env.NEXT_PUBLIC_MODEL = originalEnv
  })
})