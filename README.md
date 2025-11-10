# Baby Feeding Timer MVP Design

## Project Analysis & Requirements

**Current Setup**: Next.js 15.4.4 with React 19, TypeScript, Tailwind CSS 4

**MVP Features**:
- ⏰ Simple timer functionality (set & start/stop)
- 🍼 Custom SVG animation of a cute baby milk bottle draining
- 📖 Encouraging Bible scripture popups when timer triggers
- 👶 User-friendly interface for exhausted new parents

## Build and Deployment

This is a Next.js 15 application using the App Router with TypeScript. The build process generates static pages for authentication routes and dynamic API routes for Better Auth.

**Important**: The production build requires database connectivity for Better Auth session management. Ensure `DATABASE_URL` and `BETTER_AUTH_SECRET` are configured before building.

## Architecture Overview

### Core Application Structure
- **Baby Feeding Timer**: A React application for tracking infant feeding, sleeping, and diaper sessions
- **Better Auth Integration**: Full authentication system with email/password and Google OAuth
- **Database**: PostgreSQL (Neon) with Better Auth schema for user management
- **Session Management**: Database-only storage (cookie caching disabled due to session size constraints)

### Authentication Flow
```
User → Sign-in/Sign-up → Better Auth API → Neon PostgreSQL → Session → Protected Routes
```

**Critical Configuration**: Session cookie caching is **disabled** (`cookieCache: { enabled: false }`) in `auth/auth.ts` to prevent "session data too large" errors due to custom user fields (`firstName`, `lastName`, `isEmailVerified`).

### Key Integration Patterns

**Timer System**: The application uses a unified timer architecture via `useUnifiedTimer` hook that supports both stopwatch and countdown modes. Each session type (breastfeeding, sleeping) gets its own timer instance.

**Session Management**: The `useSessionManager` hook coordinates with `useUnifiedTimer` to track feeding sessions, storing data in localStorage and managing session history.

**Multi-Tab UI**: The main interface uses a tab system (`SessionType` enum) with each tab having its own theme configuration in `TAB_THEMES` constant.

### Critical Files

**Authentication Core**:
- `auth/auth.ts` - Better Auth server configuration with PostgreSQL and Google OAuth
- `auth/auth-client.ts` - Client-side authentication utilities
- `app/api/auth/[...all]/route.ts` - Better Auth API handler with debugging wrapper
- `middleware.ts` - Route protection using session cookie detection

**Application State**:
- `hooks/useUnifiedTimer.ts` - Core timer functionality with stopwatch/countdown modes
- `hooks/useSessionManager.ts` - Session tracking and localStorage persistence
- `lib/auth-provider.tsx` - React context for authentication state
- `types/index.ts` - TypeScript definitions for all session types and timer states

### Database Schema
Uses Better Auth v1.2+ schema with singular table names (`"user"`, `"session"`, `"account"`, `"verification"`). The schema includes custom fields for the Baby Feeding Timer application.

**Schema Location**: `schema.sql` - Ready for deployment to Neon PostgreSQL

### Testing Strategy
Jest configuration with React Testing Library for component testing. Test files located in `__tests__/auth/` focusing on authentication components.

### Component Architecture

**Layout Components**: `PageHeader` provides consistent navigation with user menu integration.

**Session Components**: 
- `TimerPanel` - Unified timer display with mode switching
- `BottleTab`, `DiaperTab` - Session-specific input forms
- `SessionHistory` - Historical session display

**Timer Components**:
- `TimerDisplay` - Visual timer with mode indication
- `TimerControls` - Start/pause/reset controls
- `AnimatedMilkBottleTimer` - Animated feeding progress

### Environment Configuration

**Required Environment Variables**:
```bash
DATABASE_URL                    # Neon PostgreSQL connection string
BETTER_AUTH_SECRET             # Min 32 characters for session encryption  
NEXT_PUBLIC_APP_URL            # Application base URL
GOOGLE_CLIENT_ID               # Google OAuth client ID
GOOGLE_CLIENT_SECRET           # Google OAuth client secret
```

**Google OAuth Setup**:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

### State Management Patterns

The application uses a combination of React hooks and localStorage for state persistence:

- **Timer State**: Managed by `useUnifiedTimer` with automatic cleanup and mode switching
- **Session State**: Managed by `useSessionManager` with localStorage persistence
- **Authentication State**: Managed by Better Auth with database sessions
- **UI State**: Component-level useState for form inputs and UI controls

### Error Handling

**Authentication Errors**: Handled in `app/api/auth/[...all]/route.ts` with OAuth callback error redirection to sign-in page with error messages.

**Timer Errors**: Race condition prevention in `useUnifiedTimer` using refs and cleanup functions.

**Session Errors**: Toast notifications via `react-hot-toast` for user feedback.

### Performance Considerations

**Timer Performance**: Uses 100ms intervals for smooth timer updates while preventing memory leaks with proper cleanup.

**Database Performance**: Optimized indexes in schema for session queries and user lookups.

**Bundle Optimization**: Uses Next.js 15 with Turbopack for development and automatic code splitting for production.
