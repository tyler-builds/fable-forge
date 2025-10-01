import { Sparkles, Swords } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-b from-gray-800 to-slate-900 rounded-xl shadow-2xl border border-gray-600 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <Swords size={32} className="text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent p-1">
                Fable Forge
              </span>
              <Swords size={32} className="text-purple-500" />
            </h1>
            <p className="text-blue-300 text-lg">Enter the Realm</p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-300 text-sm flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-purple-400" /> Where legends are born and adventures await{" "}
            <Sparkles size={16} className="text-blue-400" />
          </p>
        </div>
      </div>
    </div>
  );
}
