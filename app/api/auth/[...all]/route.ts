import { auth } from "@/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth);

// Add debugging wrapper with enhanced error handling
const debugHandler = (originalHandler: any) => async (request: Request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  console.log("Auth API route called:", {
    method: request.method,
    url: request.url,
    pathname: pathname,
    searchParams: Object.fromEntries(url.searchParams.entries()),
  });
  
  try {
    const response = await originalHandler(request);
    console.log("Auth API response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    return response;
  } catch (error: any) {
    console.error("Auth API error:", {
      message: error.message,
      stack: error.stack,
      url: request.url,
      timestamp: new Date().toISOString()
    });
    
    // For OAuth callback errors, redirect to sign-in with error message
    if (pathname.includes('/callback/') && error.message?.includes('State Mismatch')) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('error', 'oauth_state_mismatch');
      signInUrl.searchParams.set('message', 'OAuth session expired. Please try signing in again.');
      
      return Response.redirect(signInUrl, 302);
    }
    
    throw error;
  }
};

export const GET = debugHandler(originalGET);
export const POST = debugHandler(originalPOST);