# Baby Feeding Timer MVP Design

## Project Analysis & Requirements

**Current Setup**: Next.js 15.4.4 with React 19, TypeScript, Tailwind CSS 4

**MVP Features**:
- ⏰ Simple timer functionality (set & start/stop)
- 🍼 Cute baby milk container stickers/graphics
- 📖 Encouraging Bible scripture popups when timer triggers
- 👶 User-friendly interface for exhausted new parents

## System Architecture

```
Baby Feeding Timer MVP
├── Components/
│   ├── Timer/
│   │   ├── TimerDisplay.tsx      # Main timer UI
│   │   ├── TimerControls.tsx     # Start/stop/reset buttons
│   │   └── TimerSettings.tsx     # Duration selection
│   ├── UI/
│   │   ├── MilkBottleSticker.tsx # Cute baby bottle graphics
│   │   ├── ScripturePopup.tsx    # Bible verse overlay
│   │   └── Layout.tsx            # Main app layout
│   └── Common/
│       ├── Button.tsx            # Reusable button component
│       └── Modal.tsx             # Modal wrapper
├── Hooks/
│   ├── useTimer.ts               # Timer logic & state
│   ├── useScripture.ts           # Scripture management
│   └── useLocalStorage.ts        # Persist user preferences
├── Data/
│   └── scriptures.ts             # Bible verses collection
├── Utils/
│   ├── timeFormat.ts             # Time formatting utilities
│   └── soundNotification.ts      # Audio notifications
└── Types/
    └── index.ts                  # TypeScript definitions
```

## UI/UX Design Specifications

### Visual Design System

**Color Palette** (Baby-friendly pastels):
```css
:root {
  --primary: #FFB6C1;      /* Light Pink */
  --secondary: #E6E6FA;    /* Lavender */
  --accent: #F0E68C;       /* Khaki (warm yellow) */
  --success: #98FB98;      /* Pale Green */
  --background: #FFFACD;   /* Lemon Chiffon */
  --text: #4A4A4A;         /* Soft Gray */
  --white: #FFFFFF;
}
```

**Typography**:
- Primary: `font-family: 'Inter', sans-serif` (clean, readable)
- Timer Display: `font-family: 'JetBrains Mono', monospace` (clear numbers)
- Size Scale: text-sm (14px) → text-xl (20px) → text-4xl (36px)

### Layout Design

**Main Screen Layout**:
```
┌─────────────────────────────────┐
│           🍼 Header 🍼          │
│      "Baby Feeding Timer"       │
├─────────────────────────────────┤
│                                 │
│         ┌─────────────┐         │
│         │   25:00     │         │ ← Timer Display
│         │  (Large)    │         │
│         └─────────────┘         │
│                                 │
│    🍼    [Start] [Reset]   🍼   │ ← Controls + Stickers
│                                 │
│         Quick Presets:          │
│      [15min] [30min] [45min]    │ ← Quick Settings
│                                 │
│      🍼 "You're doing great!" 🍼│ ← Encouragement
└─────────────────────────────────┘
```

### Cute Elements Design

**Milk Bottle Stickers**:
- **Primary Bottle**: Large SVG with soft gradients (pink → white)
- **Mini Bottles**: Scattered decorative elements
- **Animations**: Gentle bobbing motion, scale on hover
- **Positions**: Corners and around timer display

**Visual Hierarchy**:
1. **Timer Display** (Center, Large) - 60px font
2. **Control Buttons** (Below timer) - 48px height
3. **Quick Presets** (Below controls) - 36px height
4. **Decorative Elements** (Scattered) - 24-32px

## Timer Functionality & State Management

### Timer State Design

```typescript
interface TimerState {
  duration: number;        // Total time in seconds
  remaining: number;       // Time left in seconds
  isActive: boolean;       // Timer running
  isPaused: boolean;       // Timer paused
  isCompleted: boolean;    // Timer finished
  lastStartTime: number;   // For pause/resume accuracy
}

interface TimerPreferences {
  defaultDuration: number; // User's preferred duration
  soundEnabled: boolean;   // Audio notifications
  vibrationEnabled: boolean; // Haptic feedback (mobile)
  scriptureEnabled: boolean; // Show Bible verses
}
```

### Timer Logic Flow

```
Timer States:
IDLE → START → RUNNING → [PAUSE ⇄ RUNNING] → COMPLETED → IDLE

State Transitions:
- IDLE: duration set, remaining = duration, isActive = false
- START: isActive = true, lastStartTime = now()
- RUNNING: countdown active, remaining decreases
- PAUSE: isActive = false, isPaused = true, preserve remaining
- RESUME: isActive = true, isPaused = false, update lastStartTime
- COMPLETE: remaining = 0, isCompleted = true, trigger notifications
- RESET: return to IDLE state
```

### Key Features

**Timer Accuracy**:
- Use `performance.now()` for precision
- Account for browser tab visibility
- Handle background/foreground state changes

**Preset Durations**:
```javascript
const FEEDING_PRESETS = [
  { label: "15 min", value: 15 * 60 },
  { label: "30 min", value: 30 * 60 },
  { label: "45 min", value: 45 * 60 },
  { label: "1 hour", value: 60 * 60 }
];
```

**Notifications**:
- Browser notification API
- Audio chime (gentle baby-friendly sound)
- Visual animation (pulsing bottle)
- Haptic feedback (mobile devices)

## Bible Scripture Popup System

### Scripture Data Structure

```typescript
interface Scripture {
  id: string;
  verse: string;
  reference: string;
  theme: 'encouragement' | 'strength' | 'peace' | 'love' | 'patience';
  length: 'short' | 'medium' | 'long'; // For timing display
}

const SCRIPTURES: Scripture[] = [
  {
    id: '1',
    verse: "She is clothed with strength and dignity; she can laugh at the days to come.",
    reference: "Proverbs 31:25",
    theme: 'strength',
    length: 'medium'
  },
  {
    id: '2', 
    verse: "For I know the plans I have for you, plans to prosper you and not to harm you.",
    reference: "Jeremiah 29:11",
    theme: 'encouragement',
    length: 'long'
  }
  // ... 20-30 carefully selected verses
];
```

### Popup Trigger Logic

**Trigger Conditions**:
- Timer completion (100% chance)
- Random intervals during long timers (15% chance every 10 minutes)
- User setting: Enable/disable scriptures
- Context-aware: Show encouraging verses during night feeds

**Display Behavior**:
```
Popup Flow:
Timer Complete → Gentle fade-in → Display 8 seconds → Fade out
                     ↓
              [Dismiss] [Next Verse] buttons
                     ↓
              Optional: Save favorite verses
```

### Popup Design

**Visual Design**:
```
┌─────────────────────────────────┐
│  🕊️    Timer Complete!    🕊️   │
├─────────────────────────────────┤
│                                 │
│  "She is clothed with strength  │
│   and dignity; she can laugh    │
│     at the days to come."       │
│                                 │
│         - Proverbs 31:25        │
│                                 │
│     [❤️ Save]    [✕ Close]      │
└─────────────────────────────────┘
```

**Animation**: Gentle slide-up from bottom with soft shadow and rounded corners

## Technical Implementation Guide

### Development Roadmap

**Phase 1: Core Timer (Week 1)**
1. Set up timer hook with state management
2. Create basic timer display component
3. Implement start/stop/reset functionality
4. Add preset duration buttons

**Phase 2: Visual Design (Week 2)**
1. Design and implement milk bottle SVG components
2. Apply pastel color scheme and typography
3. Add gentle animations and hover effects
4. Implement responsive mobile layout

**Phase 3: Scripture System (Week 3)**
1. Create scripture data collection
2. Implement popup modal component
3. Add trigger logic and timing
4. Implement local storage for preferences

### Key Dependencies

**Required Packages**:
```json
{
  "dependencies": {
    "@heroicons/react": "^2.0.18",    // Icons
    "framer-motion": "^10.16.4",      // Animations
    "react-hot-toast": "^2.4.1"       // Notifications
  }
}
```

### Performance Considerations

**Optimization Strategies**:
- Use `useCallback` for timer functions
- Implement `React.memo` for pure components
- Lazy load scripture data
- Service Worker for offline functionality
- PWA capabilities for mobile app-like experience

### Mobile-First Features

**Progressive Web App (PWA)**:
- Installable on mobile home screen
- Offline functionality
- Push notifications for timer completion
- Haptic feedback on touch devices
- Screen wake lock during active timer

### Accessibility & User Experience

**Accessibility Features**:
- High contrast mode support
- Screen reader compatibility
- Keyboard navigation
- Large touch targets (minimum 44px)
- Focus indicators

**Parent-Friendly UX**:
- One-handed operation
- Large, easy-to-tap buttons
- Clear visual feedback
- Gentle, non-jarring notifications
- Quick access to common durations

## Summary

The Baby Feeding Timer MVP design provides a comprehensive, parent-friendly solution with:

**🎯 Core Features**:
- Intuitive timer with preset durations (15/30/45/60 min)
- Cute milk bottle stickers with gentle animations
- Encouraging Bible scripture popups on timer completion
- Mobile-optimized PWA with offline capabilities

**🎨 Design Highlights**:
- Soft pastel color palette perfect for tired parents
- Large, accessible touch targets for one-handed use
- Gentle animations and non-jarring notifications
- Clean, distraction-free interface

**⚡ Technical Stack**:
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4 for styling
- Framer Motion for animations
- Local Storage for user preferences
- PWA capabilities for mobile app experience

**🚀 Ready for Implementation**:
The design is optimized for the existing Next.js setup and provides clear technical specifications for immediate development. The 3-week roadmap ensures a focused MVP delivery while maintaining high quality and accessibility standards.

This design balances functionality, aesthetics, and spiritual encouragement to create a truly helpful tool for new parents during feeding times.