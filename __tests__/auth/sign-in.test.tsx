import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import SignIn from '@/auth/sign-in'
import { signIn } from '@/auth/auth-client'

// Mock the auth client
jest.mock('@/auth/auth-client', () => ({
  signIn: {
    email: jest.fn(),
    social: jest.fn(),
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

const mockSignInEmail = signIn.email as jest.MockedFunction<typeof signIn.email>
const mockSignInSocial = signIn.social as jest.MockedFunction<typeof signIn.social>

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in form correctly', () => {
    render(<SignIn />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })

  it('handles email sign in successfully', async () => {
    const user = userEvent.setup()
    mockSignInEmail.mockResolvedValue({ 
      data: { user: { id: '1', email: 'test@example.com' } } 
    } as any)

    render(<SignIn />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Successfully signed in!')
  })

  it('handles email sign in error', async () => {
    const user = userEvent.setup()
    mockSignInEmail.mockResolvedValue({ 
      error: { message: 'Invalid credentials' } 
    } as any)

    render(<SignIn />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  it('handles Google sign in', async () => {
    const user = userEvent.setup()
    mockSignInSocial.mockResolvedValue({} as any)

    render(<SignIn />)

    await user.click(screen.getByRole('button', { name: /sign in with google/i }))

    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/',
      })
    })
  })

  it('handles Google sign in error', async () => {
    const user = userEvent.setup()
    mockSignInSocial.mockRejectedValue(new Error('Google auth failed'))

    render(<SignIn />)

    await user.click(screen.getByRole('button', { name: /sign in with google/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to sign in with Google')
    })
  })

  it('toggles remember me checkbox', async () => {
    const user = userEvent.setup()
    
    render(<SignIn />)

    const checkbox = screen.getByLabelText(/remember me/i)
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('disables form while loading', async () => {
    const user = userEvent.setup()
    let resolveSignIn: any
    const signInPromise = new Promise(resolve => {
      resolveSignIn = resolve
    })
    mockSignInEmail.mockReturnValue(signInPromise as any)

    render(<SignIn />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    
    const signInButton = screen.getByRole('button', { name: /^sign in$/i })
    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    
    await user.click(signInButton)

    await waitFor(() => {
      expect(signInButton).toBeDisabled()
      expect(googleButton).toBeDisabled()
    })

    resolveSignIn({ data: { user: { id: '1' } } })
  })
})