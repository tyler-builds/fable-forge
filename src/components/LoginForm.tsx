import { AlertTriangle, Key, Mail, Swords, Zap } from "lucide-react";
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
        password
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
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Swords size={24} className="text-blue-400" />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Return to Your Quest
          </span>
        </h2>
        <p className="text-blue-300 text-sm">Sign in to continue your adventure</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Mail size={16} /> Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Your email"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <Key size={16} /> Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Your password"
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
              Entering the Realm...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap size={18} /> Begin Adventure
            </div>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-blue-300 text-sm">
          New to the realm?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-semibold text-blue-400 hover:text-blue-200 underline hover:no-underline transition-colors"
            disabled={isLoading}>
            Create Your Legend
          </button>
        </p>
      </div>
    </div>
  );
}
