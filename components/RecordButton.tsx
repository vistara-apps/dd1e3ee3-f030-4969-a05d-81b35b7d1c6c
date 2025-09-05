'use client';

import { RecordButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mic, Square, Play } from 'lucide-react';
import { useState } from 'react';

export function RecordButton({
  variant,
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false
}: RecordButtonProps) {
  const [recordingTime, setRecordingTime] = useState(0);

  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
      setRecordingTime(0);
    } else {
      onStartRecording();
      // Start timer (in real app, this would be handled by parent component)
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Store timer reference for cleanup
      (window as any).recordingTimer = timer;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonStyles = () => {
    if (disabled) {
      return 'bg-gray-500 cursor-not-allowed opacity-50';
    }
    
    if (isRecording) {
      return 'btn-urgent animate-recording';
    }
    
    switch (variant) {
      case 'urgent':
        return 'btn-urgent hover:scale-105';
      case 'primary':
      default:
        return 'btn-primary hover:scale-105';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 shadow-2xl',
          getButtonStyles()
        )}
      >
        {isRecording ? (
          <Square className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
        
        {isRecording && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>
      
      <div className="text-center">
        {isRecording ? (
          <div className="space-y-1">
            <p className="text-white font-medium">Recording...</p>
            <p className="text-white opacity-70 text-sm font-mono">
              {formatTime(recordingTime)}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-white font-medium">
              {variant === 'urgent' ? 'Emergency Record' : 'Start Recording'}
            </p>
            <p className="text-white opacity-70 text-xs">
              Tap to begin
            </p>
          </div>
        )}
      </div>
      
      {isRecording && (
        <div className="glass-card px-4 py-2 rounded-full">
          <p className="text-white text-xs opacity-80">
            Recording is secure and encrypted
          </p>
        </div>
      )}
    </div>
  );
}
