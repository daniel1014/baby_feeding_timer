# Baby Feeding Timer - Authentication System

A comprehensive authentication system built with Better Auth, featuring email/password authentication, Google OAuth, and Neon PostgreSQL integration.

## 🚀 Features

- **Email/Password Authentication**: Secure user registration and login
- **Google OAuth**: Social authentication with Google provider
- **Session Management**: Cookie-based sessions with configurable expiration
- **Route Protection**: Middleware-based route protection
- **Database Integration**: Neon PostgreSQL with automatic schema management
- **TypeScript Support**: Full type safety throughout the authentication flow
- **Comprehensive Testing**: Unit tests for all authentication components
- **Responsive UI**: Mobile-first authentication forms with Tailwind CSS

## 🌐 Production（Cloudflare Worker 代理 + 子路徑）實作與筆記

本專案部署在公開網域 `www.faithfulstack.com` 之下，並以 Cloudflare Worker 作為反向代理，把多個 side projects 以子路徑掛載。其中「Baby Feeding Timer」服務於 `/babyfeed`。為讓 Better Auth、Next.js、以及代理之間協同運作，我們做了以下重點調整。

### 整體設計（TL;DR）
- 前端所有導向都會自動帶上正確的「子路徑前綴」（例如 `/babyfeed`），避免誤導向到根域。
- Worker 會：
  - 正規化 Host（apex → www）
  - 依 `fs_app` Cookie 或 Referer 決定該請求屬於邊個子 App
  - 修正上游 3xx Location、補上子路徑前綴、並把 Host 改回公開網域
  - 在 3xx 與 HTML 回應都寫入 `fs_app`，且 Cookie Domain 設為 `.faithfulstack.com`（跨 apex/www）
  - 當缺少 Cookie/Referer（例如 OAuth 回呼）時，對 `/api/auth/*` 與 `/api/sessions*` 預設路由到 babyfeed app

### Worker 代理重點
- 檔案：`worker_proxy.js:1`
- Host 正規化：
  - 任何 `https://faithfulstack.com/...` 301 到 `https://www.faithfulstack.com/...`
- 靜態/Next.js 產物代理：
  - `/_next/*` 與常見靜態檔擁有獨立快取與 cache key（避免跨子 App 污染）
- `/api/*` 同源 API 決策：
  - 先用 `fs_app` Cookie，再退而用 Referer；兩者皆無時，若路徑為 `/api/auth/*` 或 `/api/sessions*`，預設送去 babyfeed app（避免 OAuth 回呼 404）
- 3xx Location 重寫（避免跳去上游 host、補 prefix、防 double-prefix）：
  - 同步設置/更新 `fs_app` Cookie
  - `Set-Cookie` 使用 `Domain=.faithfulstack.com`，跨 apex/www 都可讀
- HTML 導航回應：
  - 亦會寫入 `fs_app`（5 分鐘壽命），供之後無 Referer 的請求判斷所屬子 App
- 首頁與 Auth 頁糾正：
  - `/` 若已有 `fs_app` 或 Referer，302 帶回該子 App 根路徑
  - 直接進入 `/sign-in` / `/sign-up` 時，302 改到對應子 App 的 `/babyfeed/sign-in` / `/babyfeed/sign-up`

### Better Auth 設定
- 檔案：`auth/auth.ts:32`
- 取消硬編碼 `baseURL`，讓 Better Auth 自動以 `X-Forwarded-*` 推導；加上 `trustedOrigins`：
  - `https://www.faithfulstack.com`, `https://faithfulstack.com`, `https://*.vercel.app`, `http://localhost:3000`
- 推薦在部署環境設定：
  - `BETTER_AUTH_URL = https://www.faithfulstack.com`
  - 如需：`BETTER_AUTH_TRUSTED_ORIGINS = https://www.faithfulstack.com,https://faithfulstack.com,https://*.vercel.app`
- Google OAuth Console 請加入回呼：
  - `https://www.faithfulstack.com/api/auth/callback/google`

### Middleware 改動（修正登入後 307 迴圈）
- 檔案：`middleware.ts:1`
- 在生產環境 Better Auth 會用 `__Secure-better-auth.session_token` Cookie 名稱；
  - Middleware 改為同時檢查 `better-auth.session_token` 及 `__Secure-better-auth.session_token`

### 前端導向與連結
- 檔案：`utils/basePath.ts:1`
  - `getBasePathClient()` / `getBasePathServer()`：從 `fs_app` Cookie 或 `window.location` 推測前綴
  - `prefixPath(path, basePath)`：把路徑加上前綴，並避免重覆前綴
- 檔案：`auth/sign-in.tsx:1`, `auth/sign-up.tsx:1`
  - 使用 `prefixPath()` 修正「登入/註冊成功後導向」的雙重 `/babyfeed` 問題
- 檔案：`app/sign-in/page.tsx:1`, `app/sign-up/page.tsx:1`
  - 互相導向改為相對連結 `"sign-up"` / `"sign-in"`，避免 SSR 階段未取得前綴時輸出根域連結
- 檔案：`components/auth/user-menu.tsx:1`, `lib/auth-provider.tsx:1`
  - 將 `router.push/replace` 與保護導向統一經 `prefixPath()`

### 常見錯誤與對應
- 登入後仍被送回登入頁（307 來回）：
  - 檢查 Middleware 是否同時檢查 `__Secure-better-auth.session_token`
  - 確認 Cookie 的 Domain 是 `.faithfulstack.com`（由 Worker 設定）
- Google OAuth 回呼 404：
  - 確認 `BETTER_AUTH_URL` 指向公開域名
  - Worker 已為 `/api/auth/*` 做 babyfeed 預設路由；若仍 404，大多是 Google Console 的回呼 URI 未加入公開域名
- 連結指向根域 `/sign-in` / `/sign-up`：
  - 確保頁面使用相對連結，或在 Client 用 `prefixPath()` 包裝

### 開發者快速檢查清單（Checklist）
- [ ] CF Worker 已部署最新版（含 3xx/HTML 設 `fs_app` + `Domain=.faithfulstack.com`、`/api` 預設路由、host 正規化）
- [ ] Vercel 已設定 `BETTER_AUTH_URL=https://www.faithfulstack.com`
- [ ] Google OAuth Console 已加 `https://www.faithfulstack.com/api/auth/callback/google`
- [ ] Middleware 同時檢查 `better-auth.session_token` 與 `__Secure-better-auth.session_token`
- [ ] 前端導向統一經 `prefixPath()`，避免 `/babyfeed/babyfeed`

## 📋 Prerequisites

Before setting up the authentication system, ensure you have:

1. **Node.js** (version 18 or higher)
2. **A Neon PostgreSQL database** (free tier available at [neon.tech](https://neon.tech))
3. **Google OAuth credentials** (from [Google Cloud Console](https://console.cloud.google.com))

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgres://username:password@hostname/database?sslmode=require"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here-minimum-32-characters-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Environment
NODE_ENV="development"
```

### 2. Database Setup

#### Option A: Using Neon Console (Recommended)
1. Go to your [Neon console](https://console.neon.tech)
2. Create a new database or use an existing one
3. Run the SQL schema from `schema.sql` in the Neon SQL Editor

#### Option B: Using CLI
```bash
# If you have psql installed and your DATABASE_URL configured
psql $DATABASE_URL -f schema.sql
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `http://localhost:3000` (for development)
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to your `.env.local` file

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
# Development
npm run dev

# Build for production
npm run build
npm start
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The authentication system includes tests for:
- Sign-in component functionality
- Sign-up component functionality
- User menu component behavior
- Error handling and validation
- Loading states and user interactions

## 🏗️ Architecture

### Authentication Flow

```
User → Sign In/Up Page → Better Auth API → Database → Session Cookie → Protected Routes
```

### Key Components

1. **`auth/auth.ts`**: Better Auth server configuration
2. **`auth/auth-client.ts`**: Client-side authentication utilities
3. **`auth/sign-in.tsx`**: Sign-in form component
4. **`auth/sign-up.tsx`**: Sign-up form component
5. **`middleware.ts`**: Route protection middleware
6. **`lib/auth-provider.tsx`**: React context for authentication state
7. **`components/auth/user-menu.tsx`**: User profile and menu component

### Database Schema

The system uses the following main tables:
- **`users`**: User profiles and authentication data
- **`sessions`**: Active user sessions
- **`accounts`**: OAuth provider accounts
- **`verifications`**: Email verification and password reset tokens

## 🔒 Security Features

- **Password Hashing**: Secure password hashing with bcrypt
- **Session Security**: HTTP-only cookies with CSRF protection
- **Rate Limiting**: Built-in rate limiting for authentication endpoints
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Protection**: Parameterized queries with Kysely ORM

## 🎨 UI Components

### Sign-In Form
- Email and password fields
- Remember me checkbox
- Google OAuth button
- Forgot password link
- Loading states and error handling

### Sign-Up Form
- First name and last name fields
- Email and password fields
- Password confirmation
- Optional profile image upload
- Form validation and error messages

### User Menu
- User avatar and name display
- Settings button (extensible)
- Sign-out functionality
- Loading and error states

## 📝 Usage Examples

### Protecting Routes

```typescript
// In your page component
import { RequireAuth } from "@/lib/auth-provider";

export default function ProtectedPage() {
  return (
    <RequireAuth>
      <div>This content requires authentication</div>
    </RequireAuth>
  );
}
```

### Using Authentication State

```typescript
import { useAuth } from "@/lib/auth-provider";

function MyComponent() {
  const { session, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return <div>Welcome, {session?.user?.name}!</div>;
}
```

### Manual Authentication

```typescript
import { signIn, signUp, signOut } from "@/auth/auth-client";

// Email sign in
const result = await signIn.email({
  email: "user@example.com",
  password: "password123"
});

// Google sign in
await signIn.social({
  provider: "google",
  callbackURL: "/babyfeed"
});

// Sign up
const result = await signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
});

// Sign out
await signOut();
```

## 🚀 Deployment

### Environment Variables for Production

Update your production environment variables:

```bash
DATABASE_URL="your-production-database-url"
BETTER_AUTH_SECRET="your-production-secret-key"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
NODE_ENV="production"
```

### Google OAuth for Production

1. Add your production domain to Google OAuth settings:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify your `DATABASE_URL` is correct
   - Ensure your database is running and accessible
   - Check firewall settings for Neon database

2. **Google OAuth Not Working**
   - Verify client ID and secret are correct
   - Check OAuth redirect URIs match exactly
   - Ensure Google+ API is enabled

3. **Session Issues**
   - Verify `BETTER_AUTH_SECRET` is set and secure
   - Check cookie settings in browser dev tools
   - Ensure `NEXT_PUBLIC_APP_URL` matches your domain

4. **Build Errors**
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=better-auth:*
```

## 📚 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)

## 🤝 Contributing

When contributing to the authentication system:

1. Run tests before submitting: `npm test`
2. Follow TypeScript best practices
3. Update tests for new features
4. Document any new environment variables
5. Test both email and OAuth flows

## 📄 License

This authentication system is part of the Baby Feeding Timer project and follows the same license terms.
