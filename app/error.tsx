'use client';

import { Shield, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h2>
        
        <p className="text-white opacity-80 mb-6 leading-relaxed">
          We encountered an error while loading LexiGuard. Your safety and privacy remain our top priority.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary w-full"
          >
            Reload App
          </button>
        </div>
        
        <div className="mt-6 p-4 glass-card rounded-lg">
          <p className="text-white opacity-60 text-xs">
            Error ID: {error.digest || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
