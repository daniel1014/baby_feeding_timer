export interface TimerState {
  duration: number;        // Total time in seconds
  remaining: number;       // Time left in seconds
  isActive: boolean;       // Timer running
  isPaused: boolean;       // Timer paused
  isCompleted: boolean;    // Timer finished
  lastStartTime: number;   // For pause/resume accuracy
}

export interface TimerPreferences {
  defaultDuration: number; // User's preferred duration
  soundEnabled: boolean;   // Audio notifications
  vibrationEnabled: boolean; // Haptic feedback (mobile)
  scriptureEnabled: boolean; // Show Bible verses
}

export interface Scripture {
  id: string;
  verse: string;
  reference: string;
  verseChinese: string;
  referenceChinese: string;
  theme: 'encouragement' | 'strength' | 'peace' | 'love' | 'patience';
  length: 'short' | 'medium' | 'long'; // For timing display
}

export interface FeedingPreset {
  label: string;
  value: number; // Duration in seconds
}

// Enhanced Session Types
export interface SessionBase {
  id: string;
  startTime: Date;
  endTime?: Date;
  date: string; // YYYY-MM-DD format
  duration?: number; // Duration in seconds
  notes?: string;
}

export interface BreastfeedingSession extends SessionBase {
  type: 'breastfeeding';
  side?: 'left' | 'right' | 'both';
}

export interface BottleFeedingSession extends SessionBase {
  type: 'bottle';
  amount: number;
  unit: 'ml' | 'oz';
}

export interface SleepingSession extends SessionBase {
  type: 'sleeping';
  environment?: 'crib' | 'bassinet' | 'co-sleeping' | 'other';
}

export type FeedingSession = BreastfeedingSession | BottleFeedingSession | SleepingSession;

// Tab Theme Configuration
export interface TabTheme {
  primary: string;
  secondary: string;
  accent: string;
  icon: string;
  activeColor: string;
}

export type SessionType = 'breastfeeding' | 'bottle' | 'sleeping';

export const TAB_THEMES: Record<SessionType, TabTheme> = {
  breastfeeding: {
    primary: 'from-pink-400 to-pink-500',
    secondary: 'bg-pink-100 text-pink-700',
    accent: 'text-pink-600',
    icon: '🤱',
    activeColor: 'pink'
  },
  bottle: {
    primary: 'from-blue-400 to-blue-500', 
    secondary: 'bg-blue-100 text-blue-700',
    accent: 'text-blue-600',
    icon: '🍼',
    activeColor: 'blue'
  },
  sleeping: {
    primary: 'from-purple-400 to-indigo-500',
    secondary: 'bg-purple-100 text-purple-700', 
    accent: 'text-purple-600',
    icon: '😴',
    activeColor: 'purple'
  }
};

// Bottle Feeding Presets
export const BOTTLE_PRESETS = [
  { label: '30ml', value: 30 },
  { label: '60ml', value: 60 },
  { label: '90ml', value: 90 },
  { label: '120ml', value: 120 },
  { label: '150ml', value: 150 },
  { label: '180ml', value: 180 }
];

// Timer Presets (in seconds)
export const TIMER_PRESETS = [
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '20 min', value: 1200 },
  { label: '30 min', value: 1800 }
];

export type TimerAction = 
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TICK' }
  | { type: 'COMPLETE' };