'use client';

import { Incident } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';
import { MapPin, Clock, Share2, Play, Lock } from 'lucide-react';
import { ShareButton } from './ShareButton';

interface IncidentCardProps {
  incident: Incident;
  onPlay?: () => void;
  onShare?: (contacts: string[]) => void;
  className?: string;
}

export function IncidentCard({
  incident,
  onPlay,
  onShare,
  className
}: IncidentCardProps) {
  const getStatusColor = () => {
    switch (incident.sharedStatus) {
      case 'shared_contacts':
        return 'text-blue-400';
      case 'shared_legal':
        return 'text-green-400';
      case 'private':
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (incident.sharedStatus) {
      case 'shared_contacts':
        return 'Shared with contacts';
      case 'shared_legal':
        return 'Shared with legal aid';
      case 'private':
      default:
        return 'Private';
    }
  };

  return (
    <div className={cn('glass-card p-4 space-y-4 animate-fade-in', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">
            {incident.metadata.interactionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <p className="text-white opacity-70 text-sm">
            {formatDate(incident.timestamp)}
          </p>
        </div>
        <div className={cn('flex items-center space-x-1 text-xs', getStatusColor())}>
          <Lock className="w-3 h-3" />
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Location */}
      {incident.location.address && (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-white opacity-60" />
          <p className="text-white opacity-80 text-sm">
            {incident.location.address}
          </p>
        </div>
      )}

      {/* Summary */}
      <p className="text-white opacity-80 text-sm leading-relaxed">
        {incident.summary}
      </p>

      {/* Metadata */}
      {incident.metadata.duration && (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-white opacity-60" />
          <p className="text-white opacity-70 text-sm">
            Duration: {Math.floor(incident.metadata.duration / 60)}m {incident.metadata.duration % 60}s
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white border-opacity-20">
        <div className="flex items-center space-x-3">
          {incident.recordingUrl && onPlay && (
            <button
              onClick={onPlay}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Play Recording</span>
            </button>
          )}
        </div>
        
        {onShare && (
          <ShareButton
            variant="iconOnly"
            incident={incident}
            onShare={onShare}
          />
        )}
      </div>

      {/* Additional metadata */}
      {incident.metadata.notes && (
        <div className="pt-2 border-t border-white border-opacity-10">
          <p className="text-white opacity-70 text-xs">
            <span className="font-medium">Notes:</span> {incident.metadata.notes}
          </p>
        </div>
      )}
    </div>
  );
}
