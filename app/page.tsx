'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Name, Avatar } from '@coinbase/onchainkit/identity';
import { 
  AppState, 
  StateCode, 
  Guide, 
  Script, 
  Incident, 
  ScenarioType 
} from '@/lib/types';
import { 
  SAMPLE_GUIDES, 
  SAMPLE_SCRIPTS, 
  SCENARIO_NAMES 
} from '@/lib/constants';
import { generateId, getCurrentLocation, storage } from '@/lib/utils';
import { InformationCard } from '@/components/InformationCard';
import { RecordButton } from '@/components/RecordButton';
import { ShareButton } from '@/components/ShareButton';
import { NavigationTabs } from '@/components/NavigationTabs';
import { StateSelector } from '@/components/StateSelector';
import { IncidentCard } from '@/components/IncidentCard';
import { 
  Shield, 
  FileText, 
  Mic, 
  Clock, 
  AlertTriangle, 
  Users,
  Settings2,
  Bell
} from 'lucide-react';

export default function LexiGuardApp() {
  const { setFrameReady } = useMiniKit();
  
  // App State
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    selectedState: 'CA',
    activeTab: 'guides',
    isRecording: false,
    currentIncident: null
  });

  // Data State
  const [guides, setGuides] = useState<Guide[]>(SAMPLE_GUIDES);
  const [scripts, setScripts] = useState<Script[]>(SAMPLE_SCRIPTS);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set frame ready for MiniKit
        setFrameReady();
        
        // Load saved data
        const savedState = storage.get('lexiguard-state');
        const savedIncidents = storage.get('lexiguard-incidents');
        
        if (savedState) {
          setAppState(prev => ({ ...prev, ...savedState }));
        }
        
        if (savedIncidents) {
          setIncidents(savedIncidents);
        }
        
        // Try to get current location
        const location = await getCurrentLocation();
        if (location) {
          setAppState(prev => ({ 
            ...prev, 
            selectedState: location.state 
          }));
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [setFrameReady]);

  // Save state changes
  useEffect(() => {
    if (!isLoading) {
      storage.set('lexiguard-state', {
        selectedState: appState.selectedState,
        activeTab: appState.activeTab
      });
    }
  }, [appState.selectedState, appState.activeTab, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      storage.set('lexiguard-incidents', incidents);
    }
  }, [incidents, isLoading]);

  // Handlers
  const handleTabChange = (tab: AppState['activeTab']) => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  };

  const handleStateSelect = (state: StateCode) => {
    setAppState(prev => ({ ...prev, selectedState: state }));
  };

  const handleStartRecording = () => {
    const newIncident: Partial<Incident> = {
      incidentId: generateId(),
      timestamp: new Date().toISOString(),
      location: {
        state: appState.selectedState,
        address: 'Current Location' // In real app, get actual location
      },
      summary: '',
      sharedStatus: 'private',
      metadata: {
        interactionType: 'questioning', // Default type
        duration: 0
      }
    };

    setAppState(prev => ({
      ...prev,
      isRecording: true,
      currentIncident: newIncident
    }));
  };

  const handleStopRecording = () => {
    if (appState.currentIncident) {
      const completedIncident: Incident = {
        ...appState.currentIncident,
        userId: 'current-user', // In real app, get from auth
        summary: `${SCENARIO_NAMES[appState.currentIncident.metadata?.interactionType || 'questioning']} interaction recorded`,
        recordingUrl: `recording-${appState.currentIncident.incidentId}`,
        metadata: {
          ...appState.currentIncident.metadata!,
          duration: 120 // Mock duration
        }
      } as Incident;

      setIncidents(prev => [completedIncident, ...prev]);
    }

    setAppState(prev => ({
      ...prev,
      isRecording: false,
      currentIncident: null
    }));
  };

  const handleShareIncident = (incident: Incident, contacts: string[]) => {
    const updatedIncident = {
      ...incident,
      sharedStatus: contacts.includes('legal-aid') ? 'shared_legal' : 'shared_contacts'
    } as Incident;

    setIncidents(prev =>
      prev.map(inc => inc.incidentId === incident.incidentId ? updatedIncident : inc)
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
          <p className="text-white opacity-80">Loading LexiGuard...</p>
        </div>
      </div>
    );
  }

  // Render main app
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-6 border-b border-white border-opacity-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LexiGuard</h1>
              <p className="text-white opacity-70 text-sm">Your Rights, Instantly</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 glass-card rounded-lg hover:bg-opacity-20 transition-all duration-200">
              <Bell className="w-5 h-5 text-white opacity-80" />
            </button>
            <Wallet>
              <ConnectWallet>
                <Avatar className="w-8 h-8" />
                <Name />
              </ConnectWallet>
            </Wallet>
          </div>
        </div>

        {/* State Selector */}
        <StateSelector
          selectedState={appState.selectedState}
          onStateSelect={handleStateSelect}
        />
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Emergency Alert */}
        <div className="glass-card p-4 border-l-4 border-l-red-400">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold text-sm">Emergency Reminder</h3>
              <p className="text-white opacity-80 text-xs leading-relaxed mt-1">
                If you're in immediate danger, call 911. This app is for documentation and rights information.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {appState.activeTab === 'guides' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Legal Rights Guides</h2>
              <div className="text-white opacity-70 text-sm">
                {appState.selectedState} State
              </div>
            </div>
            
            <div className="space-y-4">
              {guides
                .filter(guide => guide.state === appState.selectedState)
                .map(guide => (
                  <InformationCard
                    key={guide.guideId}
                    variant="stateGuide"
                    title={guide.content.title}
                    content={guide.content.summary}
                    state={guide.state}
                    language={guide.language}
                    isPremium={guide.type === 'premium'}
                    onSelect={() => {
                      // In real app, navigate to detailed guide view
                      console.log('Selected guide:', guide.guideId);
                    }}
                  />
                ))}
            </div>
            
            {guides.filter(guide => guide.state === appState.selectedState).length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-white opacity-40 mx-auto mb-3" />
                <p className="text-white opacity-70">
                  No guides available for {appState.selectedState} yet.
                </p>
                <p className="text-white opacity-50 text-sm mt-1">
                  We're working on adding more state-specific content.
                </p>
              </div>
            )}
          </div>
        )}

        {appState.activeTab === 'scripts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Scenario Scripts</h2>
              <div className="text-white opacity-70 text-sm">
                What to say
              </div>
            </div>
            
            <div className="space-y-4">
              {scripts.map(script => (
                <InformationCard
                  key={script.scriptId}
                  variant="script"
                  title={script.content.title}
                  content={script.content.situation}
                  onSelect={() => {
                    // In real app, navigate to detailed script view
                    console.log('Selected script:', script.scriptId);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {appState.activeTab === 'record' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Document Incident</h2>
              <p className="text-white opacity-70 text-sm">
                Securely record and document your interaction
              </p>
            </div>
            
            <div className="flex justify-center">
              <RecordButton
                variant="primary"
                isRecording={appState.isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
            </div>
            
            {appState.isRecording && appState.currentIncident && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-white font-semibold">Recording Active</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white opacity-70">Location:</span>
                    <span className="text-white">{appState.currentIncident.location?.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white opacity-70">Started:</span>
                    <span className="text-white">
                      {new Date(appState.currentIncident.timestamp!).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-white opacity-80 text-xs">
                  Your recording is being encrypted and stored securely.
                </p>
              </div>
            )}
            
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-white opacity-80 text-sm">
                <li>• Keep your phone visible but don't obstruct officers</li>
                <li>• State clearly: "I am recording for my safety"</li>
                <li>• Don't interfere with police duties</li>
                <li>• Recording is your constitutional right in public</li>
              </ul>
            </div>
          </div>
        )}

        {appState.activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Incident History</h2>
              <div className="text-white opacity-70 text-sm">
                {incidents.length} recorded
              </div>
            </div>
            
            {incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map(incident => (
                  <IncidentCard
                    key={incident.incidentId}
                    incident={incident}
                    onPlay={() => {
                      // In real app, play the recording
                      console.log('Playing recording:', incident.recordingUrl);
                    }}
                    onShare={(contacts) => handleShareIncident(incident, contacts)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-white opacity-30 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No Incidents Recorded</h3>
                <p className="text-white opacity-70 text-sm mb-4">
                  Your documented interactions will appear here
                </p>
                <button
                  onClick={() => handleTabChange('record')}
                  className="btn-primary"
                >
                  Start Recording
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <NavigationTabs
        variant="bottom"
        activeTab={appState.activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
