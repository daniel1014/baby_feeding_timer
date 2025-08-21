import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import { UserMenu } from '@/components/auth/user-menu'
import { useSession, signOut } from '@/auth/auth-client'

// Mock the auth client
jest.mock('@/auth/auth-client', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
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

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

describe('UserMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    } as any)

    render(<UserMenu />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows sign in/up buttons when no session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    } as any)

    render(<UserMenu />)
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows user info when authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    } as any)

    render(<UserMenu />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'John Doe' })).toBeInTheDocument()
  })

  it('shows user info without image when no avatar', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    } as any)

    render(<UserMenu />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    // Should show default user icon instead of image
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('handles successful sign out', async () => {
    const user = userEvent.setup()
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    } as any)

    mockSignOut.mockResolvedValue(undefined)

    render(<UserMenu />)
    
    // Find the sign out button by looking for the LogOut icon
    const buttons = screen.getAllByRole('button')
    const signOutButton = buttons.find(button => 
      button.querySelector('svg[class*="lucide-log-out"]')
    )
    
    expect(signOutButton).toBeTruthy()
    await user.click(signOutButton!)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Signed out successfully')
    })
  })

  it('handles sign out error', async () => {
    const user = userEvent.setup()
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    } as any)

    mockSignOut.mockRejectedValue(new Error('Sign out failed'))

    render(<UserMenu />)
    
    // Find the sign out button by looking for the LogOut icon
    const buttons = screen.getAllByRole('button')
    const signOutButton = buttons.find(button => 
      button.querySelector('svg[class*="lucide-log-out"]')
    )
    
    expect(signOutButton).toBeTruthy()
    await user.click(signOutButton!)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to sign out')
    })
  })

  it('shows settings coming soon message', async () => {
    const user = userEvent.setup()
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    } as any)

    render(<UserMenu />)
    
    // Find the settings button by looking for the Settings icon
    const buttons = screen.getAllByRole('button')
    const settingsButton = buttons.find(button => 
      button.querySelector('svg[class*="lucide-settings"]')
    )
    
    expect(settingsButton).toBeTruthy()
    await user.click(settingsButton!)
    expect(toast.info).toHaveBeenCalledWith('Settings coming soon!')
  })

  it('disables sign out button while signing out', async () => {
    const user = userEvent.setup()
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      isPending: false,
      error: null,
    } as any)

    let resolveSignOut: any
    const signOutPromise = new Promise(resolve => {
      resolveSignOut = resolve
    })
    mockSignOut.mockReturnValue(signOutPromise as any)

    render(<UserMenu />)
    
    // Find the sign out button by looking for the LogOut icon
    const buttons = screen.getAllByRole('button')
    const signOutButton = buttons.find(button => 
      button.querySelector('svg[class*="lucide-log-out"]')
    )
    
    expect(signOutButton).toBeTruthy()
    await user.click(signOutButton!)

    await waitFor(() => {
      expect(signOutButton).toBeDisabled()
    })

    resolveSignOut(undefined)
  })
})