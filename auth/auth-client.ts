import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

// Next.js basePath - must match next.config.ts
const BASE_PATH = "/babyfeed";

// Compute origin at runtime (browser) to avoid hardcoding localhost in prod
const runtimeOrigin = typeof window !== "undefined"
    ? window.location.origin.replace(/\/$/, "")
    : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

// Debug: Log the base URL being used
console.log("Auth client base URL:", `${runtimeOrigin}${BASE_PATH}/api/auth`);

export const authClient = createAuthClient({
    baseURL: runtimeOrigin,
    basePath: `${BASE_PATH}/api/auth`,
    fetchOptions: {
        onError(context) {
            console.error("Auth client error details:", {
                error: context.error,
                response: context.response,
                request: context.request,
                status: context.response?.status,
                statusText: context.response?.statusText,
                url: context.request?.url,
            });

            // Don't try to read response body as it may already be consumed
            // The error details above should be sufficient for debugging
        },
        onSuccess(context) {
            console.log("Auth operation successful:", {
                status: context.response.status,
                url: context.request.url,
            });
        },
        onRequest(context) {
            console.log("Auth request:", {
                url: context.url,
                method: context.method || 'GET',
            });
        }
    }
});

export const {
    signIn,
    signOut,
    signUp,
    useSession,
    resetPassword,
    forgetPassword
} = authClient;

// Type definitions for better TypeScript support
export type Session = typeof auth.$Infer.Session;
