'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Play, Pause, RotateCcw, Baby, Milk, Clock, Save, Moon, Timer, Watch, Plus, Check } from 'lucide-react';
import { MilkBottleSticker } from '../components/UI/MilkBottleSticker';
import { ScripturePopup } from '../components/UI/ScripturePopup';
import AnimatedMilkBottleTimer from "../components/UI/AnimatedMilkBottleTimer"
import { useScripture } from '../hooks/useScripture';
import { playNotificationSound, triggerHapticFeedback, showBrowserNotification, requestNotificationPermission } from '../utils/soundNotification';
import { 
  FeedingSession, 
  BreastfeedingSession, 
  BottleFeedingSession, 
  SleepingSession, 
  SessionType, 
  TAB_THEMES, 
  BOTTLE_PRESETS,
  TIMER_PRESETS
} from '../types';

// Stopwatch Hook (counts up from 0) - using millisecond precision
function useStopwatch() {
  const [timeMs, setTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeMs(prevTime => prevTime + 100);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setTimeMs(0);
    setIsRunning(false);
  };

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

  const timeInSeconds = Math.floor(timeMs / 1000);

  return { time: timeInSeconds, timeMs, isRunning, start, pause, reset, formatTime };
}

// Custom Timer Hook for tabs (like breastfeeding/sleeping) - supports both stopwatch and countdown
function useTabTimer() {
  const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [timeMs, setTimeMs] = useState(0);
  const [initialTimeMs, setInitialTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🔧 FIX: Use ref to track mode without causing useEffect re-runs
  const modeRef = useRef(mode);
  modeRef.current = mode; // Keep ref updated

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
          setTimeMs(prevTime => {
            const newTime = prevTime - 100;
            if (newTime <= 0) {
              // Clear interval immediately to prevent race condition
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              // Use setTimeout to avoid state update in render cycle
              setTimeout(() => setIsRunning(false), 0);
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
  }, [isRunning]); // Only depend on isRunning, not mode

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
    setIsRunning(true);
  };

  const startTimer = (durationSeconds: number) => {
    const durationMs = durationSeconds * 1000;
    setMode('countdown');
    setInitialTimeMs(durationMs);
    setTimeMs(durationMs);
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);

  const reset = () => {
    setTimeMs(mode === 'countdown' ? initialTimeMs : 0);
    setIsRunning(false);
  };

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

  const timeInSeconds = Math.floor(timeMs / 1000);
  const elapsedTime = mode === 'countdown' ? Math.floor((initialTimeMs - timeMs) / 1000) : timeInSeconds;

  // Clean implementation without excessive logging


  return {
    mode,
    time: timeInSeconds,
    timeMs,
    initialTimeMs,
    elapsedTime,
    isRunning,
    setStopwatchMode,
    setTimerMode,
    startStopwatch,
    startTimer,
    pause,
    resume,
    reset,
    formatTime,
    isCompleted: mode === 'countdown' && timeMs === 0 && initialTimeMs > 0
  };
}

// Countdown Timer Hook (counts down from preset value) - using millisecond precision
function useCountdownTimer() {
  const [initialTimeMs, setInitialTimeMs] = useState(0);
  const [remainingTimeMs, setRemainingTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remainingTimeMs > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTimeMs(prevTime => {
          if (prevTime <= 100) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 100;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingTimeMs]);

  const start = (duration?: number) => {
    if (duration) {
      const durationMs = duration * 1000;
      setInitialTimeMs(durationMs);
      setRemainingTimeMs(durationMs);
    }
    setIsRunning(true);
  };
  
  const pause = () => setIsRunning(false);
  
  const reset = () => {
    setRemainingTimeMs(initialTimeMs);
    setIsRunning(false);
  };

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

  const elapsedTimeMs = initialTimeMs - remainingTimeMs;
  const remainingTime = Math.floor(remainingTimeMs / 1000);
  const elapsedTime = Math.floor(elapsedTimeMs / 1000);
  const initialTime = Math.floor(initialTimeMs / 1000);

  return { 
    remainingTime, 
    elapsedTime, 
    initialTime,
    remainingTimeMs,
    elapsedTimeMs,
    initialTimeMs,
    isRunning, 
    start, 
    pause, 
    reset, 
    formatTime 
  };
}

// Helper function to format date for display
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Helper function to convert ml to oz
const mlToOz = (ml: number) => (ml * 0.033814).toFixed(1);
const ozToMl = (oz: number) => Math.round(oz * 29.5735);

export default function Home() {
  // Separate timers for each tab
  const breastfeedingTimer = useTabTimer();
  const sleepingTimer = useTabTimer();
  const countdownTimer = useCountdownTimer();
  const scripture = useScripture();
  const [activeTab, setActiveTab] = useState<SessionType>('breastfeeding');
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [bottleAmount, setBottleAmount] = useState('');
  const [bottleUnit, setBottleUnit] = useState<'ml' | 'oz'>('ml');
  const [notes, setNotes] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [customTimerDuration, setCustomTimerDuration] = useState('');
  const [showTimerInput, setShowTimerInput] = useState(false);
  const [showCustomDurationInput, setShowCustomDurationInput] = useState(false);
  const [showCustomSleepDurationInput, setShowCustomSleepDurationInput] = useState(false);

  // Prevent hydration mismatch by only showing animated particles on client
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Request notification permission on first load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Handle breastfeeding completion
  const completeBreastfeeding = () => {
    if (breastfeedingTimer.time === 0) return;
    
    breastfeedingTimer.pause();
    const now = new Date();
    const startTime = new Date(now.getTime() - breastfeedingTimer.time * 1000);
    const session: BreastfeedingSession = {
      id: Date.now().toString(),
      type: 'breastfeeding',
      startTime,
      endTime: now,
      date: startTime.toISOString().split('T')[0],
      duration: breastfeedingTimer.time,
      notes: notes || undefined,
    };
    setSessions(prev => [session, ...prev]);
    breastfeedingTimer.reset();
    setNotes('');
    
    // Trigger completion effects
    playNotificationSound();
    triggerHapticFeedback();
    showBrowserNotification(
      'Breastfeeding Session Complete! 🤱',
      `Session lasted ${breastfeedingTimer.formatTime(breastfeedingTimer.timeMs)}. Great job!`
    );
    scripture.onTimerComplete();
    toast.success(`Breastfeeding session completed! ${breastfeedingTimer.formatTime(breastfeedingTimer.timeMs)} 🎉`, {
      duration: 3000,
      position: 'top-center',
    });
  };

  // Handle bottle feeding recording
  const recordBottleFeeding = () => {
    if (!bottleAmount) return;
    
    const now = new Date();
    const session: BottleFeedingSession = {
      id: Date.now().toString(),
      type: 'bottle',
      startTime: now,
      endTime: now,
      date: now.toISOString().split('T')[0],
      amount: parseFloat(bottleAmount),
      unit: bottleUnit,
      notes: notes || undefined,
    };
    setSessions(prev => [session, ...prev]);
    setBottleAmount('');
    setNotes('');
    
    const displayAmount = bottleUnit === 'ml' 
      ? `${bottleAmount}ml` 
      : `${bottleAmount}oz (${mlToOz(parseFloat(bottleAmount))}ml)`;
    
    toast.success(`Bottle Feeding recorded: ${displayAmount} 🍼`, {
      duration: 3000,
      position: 'top-center',
    });
  };

  // Handle sleeping session completion
  const completeSleeping = () => {
    if (sleepingTimer.time === 0) return;
    
    sleepingTimer.pause();
    const now = new Date();
    const startTime = new Date(now.getTime() - sleepingTimer.time * 1000);
    const session: SleepingSession = {
      id: Date.now().toString(),
      type: 'sleeping',
      startTime,
      endTime: now,
      date: startTime.toISOString().split('T')[0],
      duration: sleepingTimer.time,
      notes: notes || undefined,
    };
    setSessions(prev => [session, ...prev]);
    sleepingTimer.reset();
    setNotes('');
    setSleepStartTime(null);
    
    // Trigger completion effects
    playNotificationSound();
    triggerHapticFeedback();
    showBrowserNotification(
      'Sleep Session Complete! 😴',
      `Baby slept for ${sleepingTimer.formatTime(sleepingTimer.timeMs)}. Sweet dreams!`
    );
    toast.success(`Sleep session completed! ${sleepingTimer.formatTime(sleepingTimer.timeMs)} 😴`, {
      duration: 3000,
      position: 'top-center',
    });
  };

  // Handle sleep start
  const startSleeping = () => {
    setSleepStartTime(new Date());
    sleepingTimer.startStopwatch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Particles - Client-side only to prevent hydration mismatch */}
      {isClient && (
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <MilkBottleSticker size="small" animate={false} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Baby className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Baby Feeding Tracker
            </h1>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 bg-white rounded-full shadow-lg"
            >
              <Milk className="w-8 h-8 text-blue-500" />
            </motion.div>
          </div>
          <p className="text-gray-600 font-medium">Track your little one's feeding sessions with love 💕</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl p-1 shadow-xl border border-gray-100 mb-8 max-w-2xl mx-auto">
          {(['breastfeeding', 'bottle', 'sleeping'] as SessionType[]).map((tabType) => {
            const theme = TAB_THEMES[tabType];
            const isActive = activeTab === tabType;
            
            return (
              <motion.button
                key={tabType}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  isActive
                    ? theme.secondary + ' shadow-md transform translate-y-[-1px]'
                    : `text-gray-600 hover:${theme.accent} hover:shadow-sm`
                }`}
              >
                {tabType === 'breastfeeding' && <Baby className="w-4 h-4" />}
                {tabType === 'bottle' && <Milk className="w-4 h-4" />}
                {tabType === 'sleeping' && <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {tabType === 'breastfeeding' && 'Breastfeeding'}
                  {tabType === 'bottle' && 'Bottle Feeding'}
                  {tabType === 'sleeping' && 'Sleeping'}
                </span>
                <span className="sm:hidden text-xs font-medium">
                  {tabType === 'breastfeeding' && 'Breast'}
                  {tabType === 'bottle' && 'Bottle'}
                  {tabType === 'sleeping' && 'Sleep'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <AnimatePresence mode="wait">
            {/* Breastfeeding Tab */}
            {activeTab === 'breastfeeding' && (
              <motion.div
                key="breastfeeding"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >

                {/* Date & Time Display */}
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {currentTime ? formatDate(currentTime) : ''}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
                    <button
                      onClick={breastfeedingTimer.setStopwatchMode}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        breastfeedingTimer.mode === 'stopwatch'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <Watch className="w-4 h-4" />
                      <span className="text-sm">Stopwatch</span>
                    </button>
                    <button
                      onClick={breastfeedingTimer.setTimerMode}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        breastfeedingTimer.mode === 'countdown'
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <Timer className="w-4 h-4" />
                      <span className="text-sm">Timer</span>
                    </button>
                  </div>
                </div>

                {/* Animated Milk Bottle Timer */}
                <div className="text-center">
                  <div className="flex flex-col items-center mb-6">
                    {/* Animated Milk Bottle */}
                    <motion.div
                      animate={{ scale: breastfeedingTimer.isRunning ? [1, 1.02, 1] : 1 }}
                      transition={{ duration: 2, repeat: breastfeedingTimer.isRunning ? Infinity : 0 }}
                      className="mb-4"
                    >
                      <AnimatedMilkBottleTimer
                        mode={breastfeedingTimer.mode}
                        initialDuration={breastfeedingTimer.mode === 'countdown' ? breastfeedingTimer.initialTimeMs : undefined}
                        isRunning={breastfeedingTimer.isRunning}
                        size="medium"
                        theme="breastfeeding"
                      />
                    </motion.div>
                    
                    {/* Time Display */}
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-2">
                      {breastfeedingTimer.formatTime(breastfeedingTimer.timeMs)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {breastfeedingTimer.mode === 'stopwatch' 
                        ? (breastfeedingTimer.isRunning ? '🔴 Recording...' : breastfeedingTimer.time > 0 ? '⏸️ Paused' : '⏱️ Ready to start')
                        : (breastfeedingTimer.isRunning ? '⏰ Timer running...' : breastfeedingTimer.time > 0 ? '⏸️ Paused' : breastfeedingTimer.isCompleted ? '✅ Completed' : '⏰ Timer ready')
                      }
                    </div>
                  </div>

                  {/* Conditional Content Based on Mode */}
                  <AnimatePresence mode="wait">
                    {breastfeedingTimer.mode === 'stopwatch' && breastfeedingTimer.time === 0 && !breastfeedingTimer.isRunning ? (
                      <motion.div
                        key="stopwatch-ready"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6"
                      >
                      </motion.div>
                    ) : breastfeedingTimer.mode === 'countdown' ? (
                      <motion.div
                        key="timer-presets"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6"
                      >
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
                          <label className="text-sm font-medium text-pink-700 mb-3 block flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            Quick Timer Presets
                          </label>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {TIMER_PRESETS.map((preset) => (
                              <motion.button
                                key={preset.value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => breastfeedingTimer.startTimer(preset.value)}
                                className="group relative p-3 bg-white hover:bg-pink-50 text-pink-700 rounded-lg font-medium transition-all duration-300 border border-pink-200 hover:border-pink-300 hover:shadow-md text-sm"
                              >
                                <span className="relative z-10">{preset.label}</span>
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                  layoutId={`preset-${preset.value}`}
                                />
                              </motion.button>
                            ))}
                          </div>
                          
                          {/* 
                            Enhanced Custom Timer Input for Breastfeeding Timer
                            - Clickable label to expand/collapse the custom duration input
                            - Smooth animation for better UX
                          */}
                          <div className="space-y-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowCustomDurationInput(!showCustomDurationInput)}
                              className="text-xs font-medium text-pink-600 flex items-center gap-1 hover:text-pink-700 transition-colors duration-200 cursor-pointer"
                            >
                              <motion.div
                                animate={{ rotate: showCustomDurationInput ? 45 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Plus className="w-3 h-3" />
                              </motion.div>
                              Custom Duration
                            </motion.button>
                            
                            <AnimatePresence>
                              {showCustomDurationInput && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, y: -10 }}
                                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                                  exit={{ opacity: 0, height: 0, y: -10 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                      <input
                                        type="number"
                                        placeholder="Enter minutes"
                                        value={customTimerDuration}
                                        onChange={(e) => {
                                          // Only allow numbers and trim leading zeros
                                          const value = e.target.value.replace(/^0+/, '');
                                          setCustomTimerDuration(value);
                                        }}
                                        className="w-full px-4 py-3 text-center text-lg font-medium border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-pink-300"
                                        min="1"
                                        max="1440"
                                        autoFocus
                                      />
                                      {/* 
                                        The "min" label is hidden on mobile devices for a cleaner UI.
                                      */}
                                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-pink-400 text-sm font-medium hidden md:block">
                                        min
                                      </div>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: customTimerDuration && Number(customTimerDuration) > 0 ? 1.05 : 1 }}
                                      whileTap={{ scale: customTimerDuration && Number(customTimerDuration) > 0 ? 0.95 : 1 }}
                                      onClick={() => {
                                        const duration = Number(customTimerDuration);
                                        if (duration && duration > 0 && duration <= 1440) {
                                          breastfeedingTimer.startTimer(duration * 60);
                                          setCustomTimerDuration('');
                                          setShowCustomDurationInput(false); // Hide input after starting timer
                                        }
                                      }}
                                      disabled={
                                        !customTimerDuration ||
                                        isNaN(Number(customTimerDuration)) ||
                                        Number(customTimerDuration) <= 0 ||
                                        Number(customTimerDuration) > 1440
                                      }
                                      className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                                        customTimerDuration &&
                                        !isNaN(Number(customTimerDuration)) &&
                                        Number(customTimerDuration) > 0 &&
                                        Number(customTimerDuration) <= 1440
                                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl'
                                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {customTimerDuration &&
                                          !isNaN(Number(customTimerDuration)) &&
                                          Number(customTimerDuration) > 0 &&
                                          Number(customTimerDuration) <= 1440 && (
                                            <Check className="w-4 h-4" />
                                        )}
                                        {customTimerDuration &&
                                          !isNaN(Number(customTimerDuration)) &&
                                          Number(customTimerDuration) > 0 &&
                                          Number(customTimerDuration) <= 1440
                                          ? `Start ${customTimerDuration} min`
                                          : 'Start'}
                                      </div>
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  
                  <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {!breastfeedingTimer.isRunning ? (
                      <>
                        {breastfeedingTimer.mode === 'stopwatch' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={breastfeedingTimer.startStopwatch}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <Play className="w-5 h-5" />
                            Start Stopwatch
                          </motion.button>
                        )}
                        {breastfeedingTimer.time > 0 && breastfeedingTimer.mode === 'countdown' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={breastfeedingTimer.resume}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <Play className="w-5 h-5" />
                            Resume Timer
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={breastfeedingTimer.pause}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={breastfeedingTimer.reset}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full shadow-md hover:shadow-lg font-medium transition-all duration-200"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </motion.button>

                    {breastfeedingTimer.time > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={completeBreastfeeding}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Save className="w-5 h-5" />
                        Complete
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="max-w-md mx-auto">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Session Notes (optional)
                  </label>
                  <textarea
                    placeholder="Any notes about this feeding session..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white shadow-sm transition-all duration-200"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {/* Bottle Feeding Tab */}
            {activeTab === 'bottle' && (
              <motion.div
                key="bottle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Date & Time Display */}
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {currentTime ? formatDate(currentTime) : ''}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>

                <div className="max-w-md mx-auto space-y-6">
                  {/* Small Decorative Bottle */}
                  <div className="flex justify-center mb-4">
                    <AnimatedMilkBottleTimer
                      mode="stopwatch"
                      isRunning={false}
                      size="small"
                      theme="bottle"
                    />
                  </div>
                  {/* Unit Toggle */}
                  <div className="flex justify-center">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setBottleUnit('ml')}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                          bottleUnit === 'ml'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        ml
                      </button>
                      <button
                        onClick={() => setBottleUnit('oz')}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                          bottleUnit === 'oz'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        oz
                      </button>
                    </div>
                  </div>

                  {/* Quick Amount Presets */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Quick Select Amount
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {BOTTLE_PRESETS.map((preset) => {
                        const displayValue = bottleUnit === 'ml' 
                          ? preset.value 
                          : Math.round(preset.value * 0.033814 * 10) / 10;
                        const displayLabel = bottleUnit === 'ml' 
                          ? `${preset.value}ml` 
                          : `${displayValue}oz`;
                        
                        return (
                          <motion.button
                            key={preset.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBottleAmount(displayValue.toString())}
                            className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-xl font-medium transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                          >
                            {displayLabel}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Custom Amount ({bottleUnit})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={`Enter amount in ${bottleUnit}...`}
                        value={bottleAmount}
                        onChange={(e) => setBottleAmount(e.target.value)}
                        className="w-full p-3 text-center text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 bg-white shadow-sm transition-all duration-200"
                        step="0.1"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        {bottleUnit}
                      </div>
                    </div>
                    {bottleAmount && (
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {bottleUnit === 'ml' 
                          ? `≈ ${mlToOz(parseFloat(bottleAmount))}oz`
                          : `≈ ${ozToMl(parseFloat(bottleAmount))}ml`
                        }
                      </div>
                    )}
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notes (optional)
                    </label>
                    <textarea
                      placeholder="Any notes about this feeding..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                      rows={3}
                    />
                  </div>

                  {/* Record Button */}
                  <motion.button
                    whileHover={{ scale: bottleAmount ? 1.02 : 1 }}
                    whileTap={{ scale: bottleAmount ? 0.98 : 1 }}
                    onClick={recordBottleFeeding}
                    disabled={!bottleAmount}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 ${
                      bottleAmount
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Milk className="w-5 h-5" />
                    Record Bottle Feeding
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Sleeping Tab */}
            {activeTab === 'sleeping' && (
              <motion.div
                key="sleeping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Date & Time Display */}
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {currentTime ? formatDate(currentTime) : ''}
                  </div>
                  <div className="text-sm text-gray-500">
                    {sleepStartTime ? sleepStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                  </div>
                </div>

                {/* Mode Toggle for Sleeping */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
                    <button
                      onClick={() => {
                        sleepingTimer.setStopwatchMode();
                        setSleepStartTime(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        sleepingTimer.mode === 'stopwatch'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Watch className="w-4 h-4" />
                      <span className="text-sm">Stopwatch</span>
                    </button>
                    <button
                      onClick={() => {
                        sleepingTimer.setTimerMode();
                        setSleepStartTime(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        sleepingTimer.mode === 'countdown'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Timer className="w-4 h-4" />
                      <span className="text-sm">Timer</span>
                    </button>
                  </div>
                </div>

                {/* Animated Sleep Timer */}
                <div className="text-center">
                  <div className="flex flex-col items-center mb-6">
                    {/* Animated Milk Bottle for Sleep */}
                    <motion.div
                      animate={{ scale: sleepingTimer.isRunning ? [1, 1.02, 1] : 1 }}
                      transition={{ duration: 3, repeat: sleepingTimer.isRunning ? Infinity : 0 }}
                      className="mb-4 opacity-80"
                    >
                      <AnimatedMilkBottleTimer
                        mode={sleepingTimer.mode}
                        initialDuration={sleepingTimer.mode === 'countdown' ? sleepingTimer.initialTimeMs : undefined}
                        isRunning={sleepingTimer.isRunning}
                        onComplete={() => {
                          if (sleepingTimer.mode === 'countdown') {
                            // Timer completed - trigger completion effects  
                            playNotificationSound();
                            triggerHapticFeedback();
                            showBrowserNotification(
                              'Sleep Timer Complete! 😴',
                              'Time to check on baby!'
                            );
                            toast.success(`Sleep timer completed! 😴`, {
                              duration: 3000,
                              position: 'top-center',
                            });
                          }
                        }}
                        size="medium"
                        theme="sleeping"
                      />
                    </motion.div>                    {/* Time Display */}
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                      {sleepingTimer.formatTime(sleepingTimer.timeMs)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {sleepingTimer.mode === 'stopwatch' 
                        ? (sleepingTimer.isRunning ? '😴 Sleeping...' : sleepingTimer.time > 0 ? '⏸️ Paused' : '🌙 Ready for sleep')
                        : (sleepingTimer.isRunning ? '⏰ Sleep timer running...' : sleepingTimer.time > 0 ? '⏸️ Paused' : sleepingTimer.isCompleted ? '✅ Sleep time completed' : '⏰ Sleep timer ready')
                      }
                    </div>
                  </div>

                  {/* Sleep Timer Presets - Only show in countdown mode */}
                  {sleepingTimer.mode === 'countdown' && (
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Sleep Timer Presets
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {TIMER_PRESETS.map((preset) => (
                          <motion.button
                            key={preset.value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sleepingTimer.startTimer(preset.value)}
                            className="p-3 bg-gradient-to-br from-purple-50 to-indigo-100 hover:from-purple-100 hover:to-indigo-200 text-purple-700 rounded-xl font-medium transition-all duration-200 border border-purple-200 hover:border-purple-300 text-sm shadow-sm hover:shadow-md"
                          >
                            {preset.label}
                          </motion.button>
                        ))}
                      </div>
                      
                      {/* Custom Sleep Timer Input with Collapsible Design */}
                      <div className="max-w-xs mx-auto space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowCustomSleepDurationInput(!showCustomSleepDurationInput)}
                          className="text-xs font-medium text-purple-600 flex items-center gap-1 hover:text-purple-700 transition-colors duration-200 cursor-pointer"
                        >
                          <motion.div
                            animate={{ rotate: showCustomSleepDurationInput ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Plus className="w-3 h-3" />
                          </motion.div>
                          Custom Duration
                        </motion.button>
                        
                        <AnimatePresence>
                          {showCustomSleepDurationInput && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden space-y-3"
                            >
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="Enter minutes"
                                  value={customTimerDuration}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/^0+/, '');
                                    setCustomTimerDuration(value);
                                  }}
                                  className="w-full px-4 py-3 text-center text-lg font-medium border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-purple-300"
                                  min="1"
                                  max="1440"
                                  autoFocus
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-sm font-medium">
                                  min
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: customTimerDuration && Number(customTimerDuration) > 0 ? 1.02 : 1 }}
                                whileTap={{ scale: customTimerDuration && Number(customTimerDuration) > 0 ? 0.98 : 1 }}
                                onClick={() => {
                                  const duration = Number(customTimerDuration);
                                  if (duration && duration > 0 && duration <= 1440) {
                                    sleepingTimer.startTimer(duration * 60);
                                    setCustomTimerDuration('');
                                    setShowCustomSleepDurationInput(false);
                                  }
                                }}
                                disabled={
                                  !customTimerDuration ||
                                  isNaN(Number(customTimerDuration)) ||
                                  Number(customTimerDuration) <= 0 ||
                                  Number(customTimerDuration) > 1440
                                }
                                className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                                  customTimerDuration &&
                                  !isNaN(Number(customTimerDuration)) &&
                                  Number(customTimerDuration) > 0 &&
                                  Number(customTimerDuration) <= 1440
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  {customTimerDuration &&
                                    !isNaN(Number(customTimerDuration)) &&
                                    Number(customTimerDuration) > 0 &&
                                    Number(customTimerDuration) <= 1440 && (
                                      <Check className="w-4 h-4" />
                                  )}
                                  {customTimerDuration &&
                                    !isNaN(Number(customTimerDuration)) &&
                                    Number(customTimerDuration) > 0 &&
                                    Number(customTimerDuration) <= 1440
                                    ? `Start ${customTimerDuration} min`
                                    : 'Start Sleep Timer'}
                                </div>
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {!sleepingTimer.isRunning ? (
                      <>
                        {sleepingTimer.mode === 'stopwatch' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startSleeping}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <Play className="w-5 h-5" />
                            Start Stopwatch
                          </motion.button>
                        )}
                        {sleepingTimer.time > 0 && sleepingTimer.mode === 'countdown' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={sleepingTimer.resume}
                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <Play className="w-5 h-5" />
                            Resume Timer
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sleepingTimer.pause}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        sleepingTimer.reset();
                        setSleepStartTime(null);
                      }}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full shadow-md hover:shadow-lg font-medium transition-all duration-200"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </motion.button>

                    {sleepingTimer.time > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={completeSleeping}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Save className="w-5 h-5" />
                        Wake Up
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="max-w-md mx-auto">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Sleep Notes (optional)
                  </label>
                  <textarea
                    placeholder="Any notes about this sleep session..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all duration-200"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}


          </AnimatePresence>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session, index) => {
                const theme = TAB_THEMES[session.type as SessionType];
                const getSessionIcon = () => {
                  switch (session.type) {
                    case 'breastfeeding':
                      return <Baby className="w-4 h-4" />;
                    case 'bottle':
                      return <Milk className="w-4 h-4" />;
                    case 'sleeping':
                      return <Moon className="w-4 h-4" />;
                    default:
                      return <Baby className="w-4 h-4" />;
                  }
                };

                const getSessionTitle = () => {
                  switch (session.type) {
                    case 'breastfeeding':
                      return 'Breastfeeding';
                    case 'bottle':
                      return 'Bottle Feeding';
                    case 'sleeping':
                      return 'Sleeping';
                    default:
                      return 'Session';
                  }
                };

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${theme.secondary}`}>
                        {getSessionIcon()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {getSessionTitle()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(session.startTime)} • {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {session.endTime && session.startTime.toDateString() !== session.endTime.toDateString() && (
                            <span> - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {session.duration && (
                        <div className="font-mono text-sm font-medium text-gray-600">
                          {breastfeedingTimer.formatTime(session.duration)}
                        </div>
                      )}
                      {session.type === 'bottle' && 'amount' in session && (
                        <div className="font-mono text-sm font-medium text-gray-600">
                          {session.amount}{session.unit}
                          {session.unit === 'oz' && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({ozToMl(session.amount)}ml)
                            </span>
                          )}
                        </div>
                      )}
                      {session.notes && (
                        <div className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                          📝 {session.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Encouragement Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8"
        >
          <div className="flex items-center justify-center gap-2 text-lg font-medium text-gray-600">
            <MilkBottleSticker size="small" />
            <span>"You're doing amazing!" </span>
            <MilkBottleSticker size="small" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Every feeding is a gift of love 💕
          </p>
        </motion.div>
      </div>

      {/* Scripture Popup */}
      <ScripturePopup
        scripture={scripture.currentScripture}
        isVisible={scripture.isPopupVisible}
        isFavorite={scripture.currentScripture ? scripture.isFavorite(scripture.currentScripture.id) : false}
        onClose={scripture.hideScripture}
        onNext={scripture.nextScripture}
        onToggleFavorite={(id) => {
          if (scripture.isFavorite(id)) {
            scripture.removeFromFavorites(id);
            toast.success('Removed from favorites');
          } else {
            scripture.addToFavorites(id);
            toast.success('Added to favorites ❤️');
          }
        }}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
}
