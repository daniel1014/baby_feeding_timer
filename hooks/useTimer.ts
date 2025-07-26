import { useCallback, useEffect, useReducer, useRef } from 'react';
import { TimerState, TimerAction } from '../types';

const initialState: TimerState = {
  duration: 30 * 60, // Default 30 minutes
  remaining: 30 * 60,
  isActive: false,
  isPaused: false,
  isCompleted: false,
  lastStartTime: 0,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        isActive: true,
        isPaused: false,
        isCompleted: false,
        lastStartTime: performance.now(),
      };
    
    case 'PAUSE':
      return {
        ...state,
        isActive: false,
        isPaused: true,
      };
    
    case 'RESUME':
      return {
        ...state,
        isActive: true,
        isPaused: false,
        lastStartTime: performance.now(),
      };
    
    case 'RESET':
      return {
        ...state,
        remaining: state.duration,
        isActive: false,
        isPaused: false,
        isCompleted: false,
        lastStartTime: 0,
      };
    
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
        remaining: action.payload,
        isActive: false,
        isPaused: false,
        isCompleted: false,
        lastStartTime: 0,
      };
    
    case 'TICK':
      if (state.remaining <= 1) {
        return {
          ...state,
          remaining: 0,
          isActive: false,
          isPaused: false,
          isCompleted: true,
        };
      }
      return {
        ...state,
        remaining: state.remaining - 1,
      };
    
    case 'COMPLETE':
      return {
        ...state,
        remaining: 0,
        isActive: false,
        isPaused: false,
        isCompleted: true,
      };
    
    default:
      return state;
  }
}

export function useTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer tick with high precision
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      lastTickRef.current = performance.now();
      
      intervalRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = now - lastTickRef.current;
        
        // Only tick if roughly 1 second has passed (with tolerance for performance)
        if (elapsed >= 950) {
          dispatch({ type: 'TICK' });
          lastTickRef.current = now;
        }
      }, 100); // Check every 100ms for precision
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.isActive, state.isPaused]);

  // Handle visibility change (background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isActive) {
        // Store the time when going to background
        localStorage.setItem('timerBackgroundTime', performance.now().toString());
        localStorage.setItem('timerRemaining', state.remaining.toString());
      } else if (!document.hidden && state.isActive) {
        // Calculate elapsed time when coming back to foreground
        const backgroundTime = localStorage.getItem('timerBackgroundTime');
        const savedRemaining = localStorage.getItem('timerRemaining');
        
        if (backgroundTime && savedRemaining) {
          const elapsed = (performance.now() - parseFloat(backgroundTime)) / 1000;
          const newRemaining = Math.max(0, parseInt(savedRemaining) - Math.floor(elapsed));
          
          if (newRemaining <= 0) {
            dispatch({ type: 'COMPLETE' });
          } else {
            // Update remaining time based on background elapsed time
            const timeDiff = parseInt(savedRemaining) - newRemaining;
            for (let i = 0; i < timeDiff; i++) {
              dispatch({ type: 'TICK' });
            }
          }
          
          localStorage.removeItem('timerBackgroundTime');
          localStorage.removeItem('timerRemaining');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isActive, state.remaining]);

  const start = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setDuration = useCallback((duration: number) => {
    dispatch({ type: 'SET_DURATION', payload: duration });
  }, []);

  const toggle = useCallback(() => {
    if (state.isActive) {
      pause();
    } else if (state.isPaused) {
      resume();
    } else {
      start();
    }
  }, [state.isActive, state.isPaused, start, pause, resume]);

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    setDuration,
    toggle,
  };
}