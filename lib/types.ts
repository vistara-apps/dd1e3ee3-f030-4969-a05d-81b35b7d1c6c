// User Types
export interface User {
  userId: string;
  walletAddress: string;
  subscriptionStatus: 'free' | 'premium' | 'lifetime';
  preferredLanguage: 'en' | 'es';
  trustedContacts: TrustedContact[];
  selectedState?: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
}

// Guide Types
export interface Guide {
  guideId: string;
  state: string;
  language: 'en' | 'es';
  content: GuideContent;
  type: 'basic' | 'premium';
  lastUpdated: string;
}

export interface GuideContent {
  title: string;
  summary: string;
  sections: GuideSection[];
}

export interface GuideSection {
  title: string;
  content: string;
  importance: 'critical' | 'important' | 'helpful';
}

// Script Types
export interface Script {
  scriptId: string;
  scenario: ScenarioType;
  language: 'en' | 'es';
  content: ScriptContent;
  stateApplicability: string[];
}

export type ScenarioType = 
  | 'traffic_stop'
  | 'consent_to_search'
  | 'questioning'
  | 'arrest'
  | 'home_visit'
  | 'stop_and_frisk';

export interface ScriptContent {
  title: string;
  situation: string;
  doSay: string[];
  dontSay: string[];
  keyPoints: string[];
}

// Incident Types
export interface Incident {
  incidentId: string;
  userId: string;
  timestamp: string;
  location: {
    latitude?: number;
    longitude?: number;
    address?: string;
    state: string;
  };
  recordingUrl?: string;
  summary: string;
  sharedStatus: 'private' | 'shared_contacts' | 'shared_legal';
  metadata: IncidentMetadata;
}

export interface IncidentMetadata {
  duration?: number;
  interactionType: ScenarioType;
  officerBadgeNumbers?: string[];
  vehicleInfo?: string;
  notes?: string;
}

// App State Types
export interface AppState {
  currentUser: User | null;
  selectedState: StateCode;
  activeTab: 'guides' | 'scripts' | 'record' | 'incidents';
  isRecording: boolean;
  currentIncident: Partial<Incident> | null;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Component Props Types
export interface InformationCardProps {
  variant: 'stateGuide' | 'script';
  title: string;
  content: string;
  state?: string;
  language?: 'en' | 'es';
  onSelect?: () => void;
  isPremium?: boolean;
}

export interface RecordButtonProps {
  variant: 'primary' | 'urgent';
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export interface ShareButtonProps {
  variant: 'default' | 'iconOnly';
  incident: Incident;
  onShare: (contacts: string[]) => void;
  disabled?: boolean;
}

export interface NavigationTabsProps {
  variant: 'bottom';
  activeTab: AppState['activeTab'];
  onTabChange: (tab: AppState['activeTab']) => void;
}

// Constants
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export type StateCode = typeof US_STATES[number];
