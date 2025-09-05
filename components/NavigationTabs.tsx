'use client';

import { NavigationTabsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Shield, FileText, Mic, Clock } from 'lucide-react';

export function NavigationTabs({
  variant,
  activeTab,
  onTabChange
}: NavigationTabsProps) {
  const tabs = [
    {
      id: 'guides' as const,
      label: 'Rights',
      icon: Shield,
      description: 'Legal guides'
    },
    {
      id: 'scripts' as const,
      label: 'Scripts',
      icon: FileText,
      description: 'What to say'
    },
    {
      id: 'record' as const,
      label: 'Record',
      icon: Mic,
      description: 'Document incident'
    },
    {
      id: 'incidents' as const,
      label: 'History',
      icon: Clock,
      description: 'Past incidents'
    }
  ];

  if (variant === 'bottom') {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-white border-opacity-20 px-4 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'text-white opacity-70 hover:opacity-100 hover:bg-white hover:bg-opacity-10'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default horizontal tabs
  return (
    <div className="flex items-center space-x-1 glass-card p-1 rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'nav-tab flex items-center space-x-2',
              isActive ? 'nav-tab-active' : 'nav-tab-inactive'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
