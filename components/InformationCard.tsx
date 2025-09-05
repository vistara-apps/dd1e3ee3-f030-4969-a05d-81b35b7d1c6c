'use client';

import { InformationCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Shield, FileText, Lock } from 'lucide-react';

export function InformationCard({
  variant,
  title,
  content,
  state,
  language = 'en',
  onSelect,
  isPremium = false
}: InformationCardProps) {
  const getIcon = () => {
    switch (variant) {
      case 'stateGuide':
        return <Shield className="w-6 h-6" />;
      case 'script':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'stateGuide':
        return 'border-l-4 border-l-green-400';
      case 'script':
        return 'border-l-4 border-l-blue-400';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'glass-card p-4 cursor-pointer transition-all duration-200 hover:bg-opacity-20 animate-fade-in',
        getVariantStyles(),
        onSelect && 'hover:scale-[1.02]'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-white opacity-80">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg leading-tight">
              {title}
            </h3>
            {state && (
              <p className="text-white opacity-70 text-sm">
                {state} • {language === 'es' ? 'Español' : 'English'}
              </p>
            )}
          </div>
        </div>
        {isPremium && (
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" />
            <span>Premium</span>
          </div>
        )}
      </div>
      
      <p className="text-white opacity-80 text-sm leading-relaxed line-clamp-3">
        {content}
      </p>
      
      {variant === 'stateGuide' && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-white opacity-60">
            <span>Last updated: Jan 2024</span>
          </div>
          <button className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors duration-200">
            View Guide →
          </button>
        </div>
      )}
      
      {variant === 'script' && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-white opacity-60">
            <span>All states applicable</span>
          </div>
          <button className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors duration-200">
            View Script →
          </button>
        </div>
      )}
    </div>
  );
}
