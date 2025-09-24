import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authClient.signUp.email({
        email: email.trim(),
        password,
        name: email.split("@")[0] // Use email prefix as name
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2">🌟 Forge Your Legend</h2>
        <p className="text-amber-700 dark:text-amber-300 text-sm">Create an account to begin your epic journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <div>
          <label htmlFor="signup-email" className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            📧 Email Address
          </label>
          <input
            id="signup-email"
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
          <label
            htmlFor="signup-password"
            className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            🗝️ Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            placeholder="Choose a strong passphrase"
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            🔒 Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            placeholder="Confirm your passphrase"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-lg border-2 border-emerald-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Forging Your Legend...
            </div>
          ) : (
            "✨ Create Legend"
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-amber-700 dark:text-amber-300 text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 underline hover:no-underline transition-colors"
            disabled={isLoading}>
            Continue Your Quest
          </button>
        </p>
      </div>
    </div>
  );
}
