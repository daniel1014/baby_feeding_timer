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
            redirectURI: process.env.NODE_ENV === 'production' 
                ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
                : "http://localhost:3000/api/auth/callback/google"
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
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        }
    },
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET!,
});