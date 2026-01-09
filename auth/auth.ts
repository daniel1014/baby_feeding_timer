import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// Validate required environment variables
const requiredEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please check your .env.local file and ensure all variables are set.');
}

// Create database pool with error handling
const databasePool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
databasePool.on('error', (err) => {
    console.error('Database pool error:', err);
});

export const auth = betterAuth({
    database: databasePool,
    // Mount Better Auth at /babyfeed/api/auth (includes Next.js basePath)
    basePath: "/babyfeed/api/auth",
    // 動態信任來源：同時支援正式網域、無 www 版本、本地與 Vercel 預覽
    trustedOrigins: [
        "https://www.faithfulstack.com",
        "https://faithfulstack.com",
        "https://*.vercel.app",
        "http://localhost:3000",
    ],
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        async sendResetPassword(data) {
            // TODO: Implement email sending for password reset
            console.log('Password reset requested for:', data.user.email);
            console.log('Reset URL:', data.url);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // 交由 Better Auth 以 request 的 X-Forwarded-* 自動推導 baseURL/callback
        }
    },
    user: {
        additionalFields: {
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
            isEmailVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: false // Disable cookie caching to prevent "session data too large" error
        }
    },
    // Add better state management for OAuth
    state: {
        // Increase state expiration time to prevent premature expiration
        expiresIn: 10 * 60, // 10 minutes (default is 5 minutes)
    },
    // Add better error handling
    onError: (error: any, request: any) => {
        console.error('Better Auth Error:', {
            error: error.message,
            code: error.code,
            url: request.url,
            timestamp: new Date().toISOString()
        });
    },
    secret: process.env.BETTER_AUTH_SECRET!,
});
