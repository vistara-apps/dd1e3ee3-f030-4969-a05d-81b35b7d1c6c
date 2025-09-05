'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Share2,
  AlertCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { useRecording, useLocation, useCreateIncident } from '@/lib/hooks';
import { generateId } from '@/lib/utils';
import { SCENARIO_NAMES } from '@/lib/constants';
import { ScenarioType } from '@/lib/types';

interface EnhancedRecordButtonProps {
  userId?: string;
  selectedState: string;
  onIncidentCreated?: (incidentId: string) => void;
}

export function EnhancedRecordButton({
  userId,
  selectedState,
  onIncidentCreated
}: EnhancedRecordButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('questioning');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [notes, setNotes] = useState('');
  
  const { 
    isRecording, 
    recordingData, 
    startRecording, 
    stopRecording 
  } = useRecording();
  
  const { 
    location, 
    getCurrentLocation, 
    isLoading: locationLoading 
  } = useLocation();
  
  const createIncident = useCreateIncident();

  // Get location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Create audio URL when recording is complete
  useEffect(() => {
    if (recordingData?.blob && !isRecording) {
      const url = URL.createObjectURL(recordingData.blob);
      setAudioUrl(url);
      setShowSaveDialog(true);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordingData?.blob, isRecording]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      // Show error toast or modal
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;
    
    const audio = document.getElementById('incident-audio') as HTMLAudioElement;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl || !recordingData) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `incident-${new Date().toISOString().split('T')[0]}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveIncident = async () => {
    if (!recordingData || !userId) return;
    
    try {
      const incident = {
        incidentId: generateId(),
        userId,
        timestamp: recordingData.startTime.toISOString(),
        location: {
          latitude: location?.latitude,
          longitude: location?.longitude,
          address: location?.address || 'Unknown location',
          state: selectedState,
        },
        summary: notes || `${SCENARIO_NAMES[selectedScenario]} interaction recorded`,
        sharedStatus: 'private' as const,
        metadata: {
          duration: recordingData.duration,
          interactionType: selectedScenario,
          notes,
        },
      };

      const result = await createIncident.mutateAsync(incident);
      
      if (result.success) {
        setShowSaveDialog(false);
        setNotes('');
        setAudioUrl(null);
        onIncidentCreated?.(result.data.incidentId);
      }
    } catch (error) {
      console.error('Failed to save incident:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Recording Button */}
      <div className="flex justify-center">
        <motion.button
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
          }`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isRecording ? { 
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.7)',
              '0 0 0 20px rgba(239, 68, 68, 0)',
            ]
          } : {}}
          transition={isRecording ? { 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeOut"
          } : {}}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </motion.button>
      </div>

      {/* Recording Status */}
      <AnimatePresence>
        {isRecording && recordingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-semibold">Recording Active</span>
              </div>
              <div className="flex items-center space-x-2 text-white opacity-80">
                <Clock className="w-4 h-4" />
                <span className="font-mono">
                  {formatDuration(recordingData.duration)}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white opacity-70">Location:</span>
                <span className="text-white flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {locationLoading ? 'Getting location...' : 
                     location?.address || 'Unknown location'}
                  </span>
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-white opacity-70">Scenario:</span>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value as ScenarioType)}
                  className="bg-white bg-opacity-10 text-white text-sm rounded px-2 py-1 border border-white border-opacity-20"
                >
                  {Object.entries(SCENARIO_NAMES).map(([key, name]) => (
                    <option key={key} value={key} className="bg-gray-800 text-white">
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 text-white opacity-80 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>Your recording is being encrypted and stored securely. Keep your phone visible but don't obstruct officers.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playback Controls */}
      <AnimatePresence>
        {audioUrl && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 space-y-4"
          >
            <h3 className="text-white font-semibold">Recording Complete</h3>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="text-white opacity-80 text-sm">
                  Duration: {recordingData ? formatDuration(recordingData.duration) : '0:00'}
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
                title="Download recording"
              >
                <Download className="w-5 h-5 text-white opacity-80" />
              </button>
            </div>
            
            <audio
              id="incident-audio"
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 space-y-4"
          >
            <h3 className="text-white font-semibold">Save Incident Report</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-white opacity-80 text-sm mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details about the incident..."
                  className="w-full p-3 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50 rounded-lg border border-white border-opacity-20 focus:border-opacity-40 focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 px-4 text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                Discard
              </button>
              
              <button
                onClick={handleSaveIncident}
                disabled={createIncident.isPending}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createIncident.isPending ? 'Saving...' : 'Save Incident'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Tips */}
      {!isRecording && !audioUrl && (
        <div className="glass-card p-4">
          <h3 className="text-white font-semibold mb-3">Recording Tips</h3>
          <ul className="space-y-2 text-white opacity-80 text-sm">
            <li>• Tap to start recording your interaction</li>
            <li>• Keep your phone visible but don't obstruct officers</li>
            <li>• State clearly: "I am recording for my safety"</li>
            <li>• Recording is your constitutional right in public</li>
            <li>• Your recording is encrypted and stored securely</li>
          </ul>
        </div>
      )}
    </div>
  );
}
