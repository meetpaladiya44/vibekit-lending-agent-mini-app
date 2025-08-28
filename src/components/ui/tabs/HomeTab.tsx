"use client";

/**
 * HomeTab component displays the main landing content for the mini app.
 * 
 * This is the default tab that users see when they first open the mini app.
 * It provides a simple welcome message and placeholder content that can be
 * customized for specific use cases.
 * 
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)] px-6">
      <div className="text-center w-full max-w-md mx-auto space-y-4">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to DeFi Assistant!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your AI-powered DeFi companion on Arbitrum. Try the new Chat tab to interact with DeFi protocols using natural language!
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💬 Click the <strong>Chat</strong> tab below to start your DeFi journey!
          </p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">Powered by Neynar 🪐</p>
      </div>
    </div>
  );
} 