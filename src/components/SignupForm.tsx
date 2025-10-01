import { AlertTriangle, Key, Lock, Mail, Sparkles } from "lucide-react";
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
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles size={24} className="text-purple-400" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Forge Your Legend
          </span>
        </h2>
        <p className="text-blue-300 text-sm">Create an account to begin your epic journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Mail size={16} /> Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter email"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Key size={16} /> Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter passsword"
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Lock size={16} /> Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Confirm password"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg border border-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Forging Your Legend...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={18} /> Create Legend
            </div>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-blue-300 text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-blue-400 hover:text-blue-200 underline hover:no-underline transition-colors"
            disabled={isLoading}>
            Continue Your Quest
          </button>
        </p>
      </div>
    </div>
  );
}
