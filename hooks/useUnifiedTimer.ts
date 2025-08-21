import { useState, useEffect, useRef } from 'react';

export type TimerMode = 'stopwatch' | 'countdown';

export interface UseUnifiedTimerOptions {
  mode?: TimerMode;
  onComplete?: () => void;
}

export interface UseUnifiedTimerReturn {
  // Current state
  mode: TimerMode;
  timeMs: number;
  time: number; // time in seconds
  initialTimeMs: number;
  isRunning: boolean;
  elapsedTime: number;
  isCompleted: boolean;
  
  // Control methods
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  
  // Mode switching (for tab timers)
  setStopwatchMode: () => void;
  setTimerMode: () => void;
  startStopwatch: () => void;
  startTimer: (durationSeconds: number) => void;
  
  // Utilities
  formatTime: (milliseconds: number) => string;
}

export function useUnifiedTimer({
  mode: initialMode = 'stopwatch',
  onComplete
}: UseUnifiedTimerOptions = {}): UseUnifiedTimerReturn {
  
  const [mode, setMode] = useState<TimerMode>(initialMode);
  const [timeMs, setTimeMs] = useState(0);
  const [initialTimeMs, setInitialTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to avoid stale closures in intervals
  const modeRef = useRef(mode);
  modeRef.current = mode;
  
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Main timer effect - handles both stopwatch and countdown
  useEffect(() => {
    if (isRunning) {
      // Clear any existing interval first to prevent multiple intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (modeRef.current === 'stopwatch') {
          setTimeMs(prevTime => prevTime + 100);
        } else {
          // Countdown mode
          setTimeMs(prevTime => {
            const newTime = prevTime - 100;
            if (newTime <= 0) {
              // Clear interval immediately to prevent race condition
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              // Use setTimeout to avoid state update in render cycle
              setTimeout(() => {
                setIsRunning(false);
                onCompleteRef.current?.();
              }, 0);
              return 0;
            }
            return newTime;
          });
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Control methods
  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);
  
  const reset = () => {
    setTimeMs(mode === 'countdown' ? initialTimeMs : 0);
    setIsRunning(false);
  };

  // Mode switching methods for tab timers
  const setStopwatchMode = () => {
    setMode('stopwatch');
    setTimeMs(0);
    setInitialTimeMs(0);
    setIsRunning(false);
  };

  const setTimerMode = () => {
    setMode('countdown');
    setTimeMs(0);
    setInitialTimeMs(0);
    setIsRunning(false);
  };

  const startStopwatch = () => {
    setMode('stopwatch');
    setTimeMs(0);
    setInitialTimeMs(0);
    setIsRunning(true);
  };

  const startTimer = (durationSeconds: number) => {
    const durationMs = durationSeconds * 1000;
    setMode('countdown');
    setInitialTimeMs(durationMs);
    setTimeMs(durationMs);
    setIsRunning(true);
  };

  // Utility function - centralized time formatting
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculated values
  const time = Math.floor(timeMs / 1000);
  const elapsedTime = mode === 'countdown' ? Math.floor((initialTimeMs - timeMs) / 1000) : time;
  const isCompleted = mode === 'countdown' && timeMs === 0 && initialTimeMs > 0;

  return {
    // State
    mode,
    timeMs,
    time,
    initialTimeMs,
    isRunning,
    elapsedTime,
    isCompleted,
    
    // Controls
    start,
    pause,
    resume,
    reset,
    
    // Mode switching
    setStopwatchMode,
    setTimerMode,
    startStopwatch,
    startTimer,
    
    // Utilities
    formatTime
  };
}