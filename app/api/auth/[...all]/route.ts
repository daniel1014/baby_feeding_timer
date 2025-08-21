import { auth } from "@/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth);

// Add debugging wrapper
const debugHandler = (originalHandler: any) => async (request: Request) => {
  console.log("Auth API route called:", {
    method: request.method,
    url: request.url,
    pathname: new URL(request.url).pathname,
  });
  
  try {
    const response = await originalHandler(request);
    console.log("Auth API response:", {
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  } catch (error) {
    console.error("Auth API error:", error);
    throw error;
  }
};

export const GET = debugHandler(originalGET);
export const POST = debugHandler(originalPOST);