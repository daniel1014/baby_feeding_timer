import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import SignUp from '@/auth/sign-up'
import { signUp } from '@/auth/auth-client'

// Mock the auth client
jest.mock('@/auth/auth-client', () => ({
  signUp: {
    email: jest.fn(),
  },
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
}))

const mockSignUpEmail = signUp.email as jest.MockedFunction<typeof signUp.email>

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign up form correctly', () => {
    render(<SignUp />)
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/profile image/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument()
  })

  it('handles successful account creation', async () => {
    const user = userEvent.setup()
    mockSignUpEmail.mockResolvedValue({ 
      data: { user: { id: '1', email: 'test@example.com', name: 'John Doe' } } 
    } as any)

    render(<SignUp />)

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        image: undefined,
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Account created successfully!')
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<SignUp />)

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
    
    await user.click(screen.getByRole('button', { name: /create an account/i }))

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match')
    expect(mockSignUpEmail).not.toHaveBeenCalled()
  })

  it('handles sign up error from server', async () => {
    const user = userEvent.setup()
    mockSignUpEmail.mockResolvedValue({ 
      error: { message: 'Email already exists' } 
    } as any)

    render(<SignUp />)

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email already exists')
    })
  })

  it('disables submit button when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<SignUp />)

    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
    
    const submitButton = screen.getByRole('button', { name: /create an account/i })
    expect(submitButton).toBeDisabled()
  })

  it('handles image upload and preview', async () => {
    const user = userEvent.setup()
    
    render(<SignUp />)

    const file = new File(['dummy content'], 'profile.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/profile image/i)
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/jpeg;base64,dummyimage',
      onloadend: null as any,
    }
    global.FileReader = jest.fn(() => mockFileReader) as any

    await user.upload(fileInput, file)

    // Simulate the file reader finishing
    mockFileReader.onloadend()

    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)
  })

  it('handles network error during sign up', async () => {
    const user = userEvent.setup()
    mockSignUpEmail.mockRejectedValue(new Error('Network error'))

    render(<SignUp />)

    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    await user.click(screen.getByRole('button', { name: /create an account/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred')
    })
  })
})