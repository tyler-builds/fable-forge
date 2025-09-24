import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = authClient;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Both email and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signIn.email({
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">
          🏰 Return to Your Quest
        </h2>
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          Sign in to continue your adventure
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            📧 Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            placeholder="your.email@realm.com"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            🗝️ Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            placeholder="Your secret passphrase"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-amber-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Entering the Realm...
            </div>
          ) : (
            "⚡ Begin Adventure"
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          New to the realm?{" "}
          <button
            onClick={onSwitchToSignup}
            className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline hover:no-underline transition-colors"
            disabled={isLoading}
          >
            Create Your Legend
          </button>
        </p>
      </div>
    </div>
  );
}