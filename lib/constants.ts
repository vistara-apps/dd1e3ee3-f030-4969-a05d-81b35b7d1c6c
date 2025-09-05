import { Guide, Script, ScenarioType } from './types';

// Sample Legal Guides Data
export const SAMPLE_GUIDES: Guide[] = [
  {
    guideId: 'ca-basic-en',
    state: 'CA',
    language: 'en',
    type: 'basic',
    lastUpdated: '2024-01-15',
    content: {
      title: 'California Legal Rights Guide',
      summary: 'Essential rights during police interactions in California',
      sections: [
        {
          title: 'Right to Remain Silent',
          content: 'You have the right to remain silent. You do not have to answer questions about where you are going, where you are traveling from, what you are doing, or where you live.',
          importance: 'critical'
        },
        {
          title: 'Right to Refuse Searches',
          content: 'You have the right to refuse to consent to a search of yourself, your car, or your home. Police may pat you down for weapons if they suspect you are armed and dangerous.',
          importance: 'critical'
        },
        {
          title: 'Right to Leave',
          content: 'You have the right to leave if you are not under arrest. Ask "Am I free to go?" If yes, you can leave calmly.',
          importance: 'important'
        }
      ]
    }
  },
  {
    guideId: 'ny-basic-en',
    state: 'NY',
    language: 'en',
    type: 'basic',
    lastUpdated: '2024-01-15',
    content: {
      title: 'New York Legal Rights Guide',
      summary: 'Essential rights during police interactions in New York',
      sections: [
        {
          title: 'Stop and Frisk Laws',
          content: 'Police may stop and frisk you if they have reasonable suspicion you are involved in criminal activity. You can ask "What crime do you suspect me of?"',
          importance: 'critical'
        },
        {
          title: 'ID Requirements',
          content: 'In New York, you are not required to carry ID or show it to police unless you are driving a vehicle.',
          importance: 'important'
        },
        {
          title: 'Recording Rights',
          content: 'You have the right to record police interactions in public spaces as long as you do not interfere with their duties.',
          importance: 'helpful'
        }
      ]
    }
  }
];

// Sample Scripts Data
export const SAMPLE_SCRIPTS: Script[] = [
  {
    scriptId: 'traffic-stop-en',
    scenario: 'traffic_stop',
    language: 'en',
    stateApplicability: ['ALL'],
    content: {
      title: 'Traffic Stop Script',
      situation: 'You have been pulled over by police during a traffic stop',
      doSay: [
        '"I am exercising my right to remain silent."',
        '"I do not consent to any searches."',
        '"Am I free to go?"',
        '"I would like to speak to a lawyer."'
      ],
      dontSay: [
        'Don\'t admit to speeding or any violations',
        'Don\'t argue about the reason for the stop',
        'Don\'t reach for documents until asked',
        'Don\'t consent to vehicle searches'
      ],
      keyPoints: [
        'Keep hands visible at all times',
        'Remain calm and polite',
        'Ask before reaching for documents',
        'Remember you can refuse consent to search'
      ]
    }
  },
  {
    scriptId: 'consent-search-en',
    scenario: 'consent_to_search',
    language: 'en',
    stateApplicability: ['ALL'],
    content: {
      title: 'Consent to Search Script',
      situation: 'Police are asking for permission to search you, your belongings, or your property',
      doSay: [
        '"I do not consent to any searches."',
        '"I am exercising my constitutional rights."',
        '"I want to speak to a lawyer before answering questions."',
        '"Am I under arrest or am I free to go?"'
      ],
      dontSay: [
        'Don\'t say "I have nothing to hide"',
        'Don\'t give partial consent',
        'Don\'t physically resist',
        'Don\'t argue about your rights'
      ],
      keyPoints: [
        'Consent must be voluntary and can be withdrawn',
        'Police may search anyway with probable cause',
        'Clearly state your refusal to consent',
        'Document the interaction if possible'
      ]
    }
  },
  {
    scriptId: 'questioning-en',
    scenario: 'questioning',
    language: 'en',
    stateApplicability: ['ALL'],
    content: {
      title: 'Police Questioning Script',
      situation: 'Police want to question you about a crime or incident',
      doSay: [
        '"I am invoking my right to remain silent."',
        '"I want to speak to a lawyer."',
        '"I do not wish to answer questions without my attorney present."',
        '"Am I under arrest?"'
      ],
      dontSay: [
        'Don\'t try to explain your innocence',
        'Don\'t answer "just a few questions"',
        'Don\'t lie or provide false information',
        'Don\'t sign anything without a lawyer'
      ],
      keyPoints: [
        'You must clearly invoke your right to silence',
        'Anything you say can be used against you',
        'Police can lie during questioning',
        'Request a lawyer immediately'
      ]
    }
  }
];

// Scenario Display Names
export const SCENARIO_NAMES: Record<ScenarioType, string> = {
  traffic_stop: 'Traffic Stop',
  consent_to_search: 'Search Request',
  questioning: 'Police Questioning',
  arrest: 'Arrest Situation',
  home_visit: 'Home Visit',
  stop_and_frisk: 'Stop and Frisk'
};

// Emergency Contacts
export const EMERGENCY_CONTACTS = {
  ACLU: {
    name: 'ACLU Legal Hotline',
    phone: '1-877-6-PROFILE',
    description: 'Civil rights legal assistance'
  },
  LEGAL_AID: {
    name: 'Legal Aid Society',
    phone: '1-888-663-6880',
    description: 'Free legal services for low-income individuals'
  }
};

// App Configuration
export const APP_CONFIG = {
  SUBSCRIPTION_PRICE: 4.99,
  LIFETIME_PRICE: 29.99,
  FREE_FEATURES: ['basic_guides', 'basic_scripts', 'basic_recording'],
  PREMIUM_FEATURES: ['all_state_guides', 'advanced_scripts', 'secure_sharing', 'legal_contacts'],
  SUPPORTED_LANGUAGES: ['en', 'es'] as const,
  MAX_RECORDING_DURATION: 3600, // 1 hour in seconds
  MAX_TRUSTED_CONTACTS: 5
};
