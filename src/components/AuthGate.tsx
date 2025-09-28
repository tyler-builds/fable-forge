import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Get authentication status
  const { data: session, isPending: sessionPending } = authClient.useSession();

  // Show loading while checking authentication
  if (sessionPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="bg-gradient-to-b from-gray-800 to-slate-900 p-8 rounded-xl shadow-2xl border border-gray-600">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-300 font-medium">🌟 Awakening the realm...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the main app
  if (session?.user) {
    return <>{children}</>;
  }

  // Show authentication forms
  return (
    <AuthLayout>
      {authMode === "login" ? (
        <LoginForm onSwitchToSignup={() => setAuthMode("signup")} />
      ) : (
        <SignupForm onSwitchToLogin={() => setAuthMode("login")} />
      )}
    </AuthLayout>
  );
}
