# LexiGuard - Your Rights, Instantly

A mobile-first Base Mini App providing instant, state-specific legal rights information and communication tools for individuals during police interactions.

## Features

### 🛡️ State-Specific Rights Guides
- One-page, mobile-optimized summaries of legal rights
- Tailored to user's detected location or selected state
- Available in English and Spanish
- Critical, important, and helpful information categorized

### 📝 Scenario-Based Scripts
- Pre-written, actionable scripts for common police encounters
- Traffic stops, consent to search, questioning scenarios
- Clear guidance on what to say and what not to say
- Adaptable communication strategies

### 🎙️ One-Tap Incident Recording
- Discreet, easily accessible recording feature
- Secure storage with encryption
- Audio and optional video recording
- Linked to incident reports

### 🔗 Automated Information Sharing
- Generate concise incident summaries
- Share with pre-selected trusted contacts
- Legal aid integration
- Secure sharing via encrypted links

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base (Coinbase L2)
- **Wallet Integration**: OnchainKit + MiniKit
- **Styling**: Tailwind CSS with custom design system
- **TypeScript**: Full type safety
- **State Management**: React hooks with local storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Base wallet for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lexiguard-base-miniapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application
│   ├── providers.tsx      # MiniKit provider setup
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── InformationCard.tsx
│   ├── RecordButton.tsx
│   ├── ShareButton.tsx
│   ├── NavigationTabs.tsx
│   ├── StateSelector.tsx
│   └── IncidentCard.tsx
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript definitions
│   ├── constants.ts      # App constants and sample data
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Key Components

### MiniKit Integration
- Uses `@coinbase/onchainkit/minikit` for Base integration
- Wallet connection via OnchainKit components
- Frame-ready for Farcaster integration

### State Management
- Local storage for persistence
- React hooks for state management
- Type-safe state with TypeScript

### Design System
- Purple/blue gradient theme matching the reference design
- Glass morphism effects
- Mobile-first responsive design
- Consistent spacing and typography

## Data Models

### User
- `userId`, `walletAddress`, `subscriptionStatus`
- `preferredLanguage`, `trustedContacts`

### Guide
- State-specific legal rights information
- Multi-language support
- Premium/basic tiers

### Script
- Scenario-based communication templates
- State applicability
- Do/don't say guidance

### Incident
- Recorded interactions with metadata
- Location, duration, sharing status
- Secure storage and sharing

## Business Model

- **Freemium**: Basic features free, premium $4.99/month
- **Lifetime**: $29.99 for single state premium access
- **Premium Features**: All state guides, advanced recording, secure sharing

## Security & Privacy

- End-to-end encryption for recordings
- Local storage for sensitive data
- Secure sharing with trusted contacts
- No tracking or data mining

## Legal Disclaimer

This app provides general legal information and should not be considered legal advice. Always consult with a qualified attorney for specific legal situations.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@lexiguard.app or join our community Discord.

---

**LexiGuard - Your Rights, Instantly. Stay Informed, Stay Safe.**
