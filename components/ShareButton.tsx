'use client';

import { ShareButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Share2, Send, Users, Mail } from 'lucide-react';
import { useState } from 'react';

export function ShareButton({
  variant,
  incident,
  onShare,
  disabled = false
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleShare = async (method: 'contacts' | 'legal' | 'emergency') => {
    setIsSharing(true);
    
    try {
      // Mock sharing logic - in real app, this would call actual sharing APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shareTargets = method === 'contacts' ? ['trusted-contacts'] : 
                          method === 'legal' ? ['legal-aid'] : 
                          ['emergency-contacts'];
      
      onShare(shareTargets);
      setShowOptions(false);
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (variant === 'iconOnly') {
    return (
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || isSharing}
        className={cn(
          'p-3 rounded-full transition-all duration-200',
          disabled ? 'bg-gray-500 opacity-50 cursor-not-allowed' : 'glass-card hover:bg-opacity-20'
        )}
      >
        <Share2 className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || isSharing}
        className={cn(
          'btn-secondary flex items-center space-x-2 w-full justify-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Share2 className="w-5 h-5" />
        <span>{isSharing ? 'Sharing...' : 'Share Incident'}</span>
      </button>

      {showOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 rounded-lg space-y-3 z-10 animate-slide-up">
          <h4 className="text-white font-medium text-sm">Share with:</h4>
          
          <button
            onClick={() => handleShare('contacts')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            <Users className="w-5 h-5 text-blue-400" />
            <div className="text-left">
              <p className="text-white font-medium text-sm">Trusted Contacts</p>
              <p className="text-white opacity-70 text-xs">Family & friends</p>
            </div>
          </button>
          
          <button
            onClick={() => handleShare('legal')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            <Mail className="w-5 h-5 text-green-400" />
            <div className="text-left">
              <p className="text-white font-medium text-sm">Legal Aid</p>
              <p className="text-white opacity-70 text-xs">ACLU & Legal Services</p>
            </div>
          </button>
          
          <button
            onClick={() => handleShare('emergency')}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            <Send className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <p className="text-white font-medium text-sm">Emergency Contacts</p>
              <p className="text-white opacity-70 text-xs">Immediate notification</p>
            </div>
          </button>
          
          <div className="pt-2 border-t border-white border-opacity-20">
            <p className="text-white opacity-60 text-xs text-center">
              Incident ID: {incident.incidentId.slice(0, 8)}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
