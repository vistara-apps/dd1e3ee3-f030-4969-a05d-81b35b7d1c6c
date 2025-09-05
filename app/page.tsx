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
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { EnhancedRecordButton } from '@/components/EnhancedRecordButton';
import { 
  useAuth, 
  useGuides, 
  useScripts, 
  useIncidents, 
  useSubscription 
} from '@/lib/hooks';
import { notify } from '@/components/NotificationProvider';
import { 
  Shield, 
  FileText, 
  Mic, 
  Clock, 
  AlertTriangle, 
  Users,
  Settings2,
  Bell,
  Crown,
  Lock
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

  // UI State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks
  const { user, authenticate, isAuthenticated } = useAuth();
  const { data: guides, isLoading: guidesLoading } = useGuides(
    appState.selectedState, 
    user?.preferredLanguage || 'en'
  );
  const { data: scripts, isLoading: scriptsLoading } = useScripts(
    undefined, 
    user?.preferredLanguage || 'en', 
    appState.selectedState
  );
  const { data: incidents, isLoading: incidentsLoading } = useIncidents(user?.userId);
  const { data: subscription } = useSubscription(user?.userId);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set frame ready for MiniKit
        setFrameReady();
        
        // Load saved state
        const savedState = storage.get('lexiguard-state');
        if (savedState) {
          setAppState(prev => ({ ...prev, ...savedState }));
        }
        
        // Try to get current location
        const location = await getCurrentLocation();
        if (location) {
          setAppState(prev => ({ 
            ...prev, 
            selectedState: location.state 
          }));
        }

        // Show welcome notification
        notify.info('Welcome to LexiGuard', 'Your rights protection companion');
        
      } catch (error) {
        console.error('App initialization error:', error);
        notify.error('Initialization failed', 'Please refresh the app');
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

  // Update user state when authenticated
  useEffect(() => {
    if (user) {
      setAppState(prev => ({
        ...prev,
        currentUser: user,
        selectedState: user.selectedState || prev.selectedState
      }));
    }
  }, [user]);

  // Handlers
  const handleTabChange = (tab: AppState['activeTab']) => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  };

  const handleStateSelect = (state: StateCode) => {
    setAppState(prev => ({ ...prev, selectedState: state }));
  };

  const handlePremiumFeatureAccess = (featureName: string) => {
    if (!user) {
      notify.warning('Sign in required', 'Please connect your wallet to access this feature');
      return false;
    }

    if (user.subscriptionStatus === 'free') {
      notify.info('Premium feature', `${featureName} requires a premium subscription`);
      setShowSubscriptionModal(true);
      return false;
    }

    return true;
  };

  const handleIncidentCreated = (incidentId: string) => {
    notify.success('Incident saved', 'Your recording has been securely stored');
    setAppState(prev => ({ ...prev, activeTab: 'incidents' }));
  };

  const handleShareIncident = (incident: Incident, contacts: string[]) => {
    if (!handlePremiumFeatureAccess('Incident sharing')) return;
    
    // In real app, this would call the API to update the incident
    notify.success('Incident shared', 'Your incident has been shared with selected contacts');
  };

  // Render loading state
  if (isLoading || guidesLoading || scriptsLoading) {
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
            {/* Premium Status */}
            {user && user.subscriptionStatus !== 'free' && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-semibold text-white">
                <Crown className="w-3 h-3" />
                <span>{user.subscriptionStatus === 'lifetime' ? 'Lifetime' : 'Premium'}</span>
              </div>
            )}
            
            {/* Upgrade Button for Free Users */}
            {user && user.subscriptionStatus === 'free' && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-semibold text-white hover:shadow-lg transition-all"
              >
                <Crown className="w-3 h-3" />
                <span>Upgrade</span>
              </button>
            )}
            
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
              {guides && guides.length > 0 ? (
                guides
                  .filter(guide => guide.state === appState.selectedState)
                  .map(guide => {
                    const isPremium = guide.type === 'premium';
                    const hasAccess = !isPremium || (user && user.subscriptionStatus !== 'free');
                    
                    return (
                      <div key={guide.guideId} className="relative">
                        {isPremium && !hasAccess && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <Lock className="w-8 h-8 text-white opacity-80 mx-auto" />
                              <p className="text-white font-semibold">Premium Content</p>
                              <button
                                onClick={() => setShowSubscriptionModal(true)}
                                className="btn-primary text-sm"
                              >
                                Upgrade to Access
                              </button>
                            </div>
                          </div>
                        )}
                        <InformationCard
                          key={guide.guideId}
                          variant="stateGuide"
                          title={guide.content.title}
                          content={guide.content.summary}
                          state={guide.state}
                          language={guide.language}
                          isPremium={guide.type === 'premium'}
                          onSelect={() => {
                            if (isPremium && !hasAccess) {
                              setShowSubscriptionModal(true);
                            } else {
                              // In real app, navigate to detailed guide view
                              console.log('Selected guide:', guide.guideId);
                            }
                          }}
                        />
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-white opacity-40 mx-auto mb-3" />
                  <p className="text-white opacity-70">Loading guides...</p>
                </div>
              )}
            </div>
            
            {guides && guides.filter(guide => guide.state === appState.selectedState).length === 0 && (
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
              {scripts && scripts.length > 0 ? (
                scripts.map(script => (
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
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-white opacity-40 mx-auto mb-3" />
                  <p className="text-white opacity-70">Loading scripts...</p>
                </div>
              )}
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
            
            <EnhancedRecordButton
              userId={user?.userId}
              selectedState={appState.selectedState}
              onIncidentCreated={handleIncidentCreated}
            />
          </div>
        )}

        {appState.activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Incident History</h2>
              <div className="text-white opacity-70 text-sm">
                {incidents?.length || 0} recorded
              </div>
            </div>
            
            {incidentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-white opacity-70">Loading incidents...</p>
              </div>
            ) : incidents && incidents.length > 0 ? (
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

      {/* Subscription Modal */}
      {user && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          userId={user.userId}
          walletAddress={user.walletAddress}
          currentPlan={user.subscriptionStatus}
        />
      )}
    </div>
  );
}
