"use client"

import { Button } from "@/components/UI/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Checkbox } from "@/components/UI/checkbox";
import { useState, useEffect, Suspense } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { signIn } from "@/auth/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth errors in URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error === 'oauth_state_mismatch' && message) {
      setOauthError(message);
      toast.error(message);
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setOauthError(null);
      
      // Clear any existing OAuth state by refreshing the page
      await signIn.social({
        provider: "google",
        callbackURL: "/"
      });
    } catch (error: any) {
      console.error("Google sign in error:", error);
      
      if (error.message?.includes('State Mismatch')) {
        setOauthError("OAuth session expired. Please try signing in again.");
        toast.error("OAuth session expired. Please try signing in again.");
      } else {
        setOauthError("Failed to sign in with Google. Please try again.");
        toast.error("Failed to sign in with Google. Please try again.");
      }
      
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* OAuth Error Display */}
        {oauthError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={16} />
              <span className="text-sm">{oauthError}</span>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="password"
                autoComplete="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  onClick={() => {
                    setRememberMe(!rememberMe);
                  }}
                />
                <Label htmlFor="remember">Remember me</Label>
              </div>

          

          <Button
              type="submit"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const result = await signIn.email({
                    email,
                    password,
                    rememberMe
                  });
                  
                  if (result.data) {
                    toast.success("Successfully signed in!");
                    router.push("/");
                  } else if (result.error) {
                    toast.error(result.error.message || "Failed to sign in");
                  }
                } catch (error) {
                  toast.error("An unexpected error occurred");
                  console.error("Sign in error:", error);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sign In"
              )}
              </Button>

          

          <div className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col"
            )}>
              
				<Button
                  variant="outline"
                  className={cn(
                    "w-full gap-2"
                  )}
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
				<path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
				<path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
				<path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
				<path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
			</svg>
                  Sign in with Google
                </Button>
            </div>
        </div>
      </CardContent>
      
    </Card>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Loading...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    }>
      <SignInForm />
    </Suspense>
  );
}