export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-2xl border-2 border-amber-200 dark:border-amber-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ⚔️ Fable Forge ⚔️
            </h1>
            <p className="text-amber-800 dark:text-amber-200 text-lg">
              Enter the Realm
            </p>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          </div>

          {/* Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-amber-300 dark:text-amber-400 text-sm">
            🌟 Where legends are born and adventures await 🌟
          </p>
        </div>
      </div>
    </div>
  );
}