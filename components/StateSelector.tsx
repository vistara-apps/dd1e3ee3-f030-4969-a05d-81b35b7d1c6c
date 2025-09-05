'use client';

import { useState } from 'react';
import { StateCode, US_STATES } from '@/lib/types';
import { getStateName, cn } from '@/lib/utils';
import { MapPin, ChevronDown, Search } from 'lucide-react';

interface StateSelectorProps {
  selectedState: StateCode | null;
  onStateSelect: (state: StateCode) => void;
  className?: string;
}

export function StateSelector({
  selectedState,
  onStateSelect,
  className
}: StateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = US_STATES.filter(state =>
    getStateName(state).toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStateSelect = (state: StateCode) => {
    onStateSelect(state);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card w-full flex items-center justify-between p-4 rounded-lg hover:bg-opacity-20 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-white opacity-80" />
          <div className="text-left">
            <p className="text-white font-medium">
              {selectedState ? getStateName(selectedState) : 'Select Your State'}
            </p>
            <p className="text-white opacity-70 text-sm">
              {selectedState ? `${selectedState} - Legal Rights` : 'Choose for state-specific rights'}
            </p>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 text-white opacity-80 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg p-4 z-20 max-h-80 overflow-hidden animate-slide-up">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white opacity-60" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredStates.map((state) => (
              <button
                key={state}
                onClick={() => handleStateSelect(state)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-white hover:bg-opacity-10',
                  selectedState === state && 'bg-white bg-opacity-20'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    {getStateName(state)}
                  </span>
                  <span className="text-white opacity-60 text-sm">
                    {state}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          {filteredStates.length === 0 && (
            <div className="text-center py-4">
              <p className="text-white opacity-70">No states found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
