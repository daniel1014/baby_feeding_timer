import SignUp from "@/auth/sign-up";
import { Suspense } from "react";
import Link from "next/link";
import { getBasePathServer, prefixPath } from "@/utils/basePath";

export default function SignUpPage() {
  const base = getBasePathServer();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href={prefixPath('/sign-in', base)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        <Suspense fallback={
          <div className="w-full bg-white rounded-md shadow p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        }>
          <SignUp />
        </Suspense>
      </div>
    </div>
  );
}
