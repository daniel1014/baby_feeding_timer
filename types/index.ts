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
  theme: 'encouragement' | 'strength' | 'peace' | 'love' | 'patience';
  length: 'short' | 'medium' | 'long'; // For timing display
}

export interface FeedingPreset {
  label: string;
  value: number; // Duration in seconds
}

export type TimerAction = 
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TICK' }
  | { type: 'COMPLETE' };