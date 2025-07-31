'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Play, Pause, RotateCcw, Baby, Milk, Clock, Save, Moon } from 'lucide-react';
import { MilkBottleSticker } from '../components/UI/MilkBottleSticker';
import { ScripturePopup } from '../components/UI/ScripturePopup';
import { AnimatedMilkBottleTimer } from '../components/UI/AnimatedMilkBottleTimer';
import { useScripture } from '../hooks/useScripture';
import { playNotificationSound, triggerHapticFeedback, showBrowserNotification, requestNotificationPermission } from '../utils/soundNotification';
import { 
  FeedingSession, 
  BreastfeedingSession, 
  BottleFeedingSession, 
  SleepingSession, 
  SessionType, 
  TAB_THEMES, 
  BOTTLE_PRESETS 
} from '../types';

// Timer Hook
function useTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
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
    setTime(0);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return { time, isRunning, start, pause, reset, formatTime };
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
  const { time, isRunning, start, pause, reset, formatTime } = useTimer();
  const scripture = useScripture();
  const [activeTab, setActiveTab] = useState<SessionType>('breastfeeding');
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [bottleAmount, setBottleAmount] = useState('');
  const [bottleUnit, setBottleUnit] = useState<'ml' | 'oz'>('ml');
  const [notes, setNotes] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

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
    if (time === 0) return;
    
    pause();
    const now = new Date();
    const startTime = new Date(now.getTime() - time * 1000);
    const session: BreastfeedingSession = {
      id: Date.now().toString(),
      type: 'breastfeeding',
      startTime,
      endTime: now,
      date: startTime.toISOString().split('T')[0],
      duration: time,
      notes: notes || undefined,
    };
    setSessions(prev => [session, ...prev]);
    reset();
    setNotes('');
    
    // Trigger completion effects
    playNotificationSound();
    triggerHapticFeedback();
    showBrowserNotification(
      'Breastfeeding Session Complete! 🤱',
      `Session lasted ${formatTime(time)}. Great job!`
    );
    scripture.onTimerComplete();
    toast.success(`Breastfeeding session completed! ${formatTime(time)} 🎉`, {
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
    if (time === 0) return;
    
    pause();
    const now = new Date();
    const startTime = new Date(now.getTime() - time * 1000);
    const session: SleepingSession = {
      id: Date.now().toString(),
      type: 'sleeping',
      startTime,
      endTime: now,
      date: startTime.toISOString().split('T')[0],
      duration: time,
      notes: notes || undefined,
    };
    setSessions(prev => [session, ...prev]);
    reset();
    setNotes('');
    setSleepStartTime(null);
    
    // Trigger completion effects
    playNotificationSound();
    triggerHapticFeedback();
    showBrowserNotification(
      'Sleep Session Complete! 😴',
      `Baby slept for ${formatTime(time)}. Sweet dreams!`
    );
    toast.success(`Sleep session completed! ${formatTime(time)} 😴`, {
      duration: 3000,
      position: 'top-center',
    });
  };

  // Handle sleep start
  const startSleeping = () => {
    setSleepStartTime(new Date());
    start();
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
        <div className="flex bg-white rounded-xl p-1 shadow-lg mb-8 max-w-2xl mx-auto">
          {(['breastfeeding', 'bottle', 'sleeping'] as SessionType[]).map((tabType) => {
            const theme = TAB_THEMES[tabType];
            const isActive = activeTab === tabType;
            
            return (
              <button
                key={tabType}
                onClick={() => setActiveTab(tabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? theme.secondary + ' shadow-sm'
                    : `text-gray-600 hover:${theme.accent}`
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
              </button>
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

                {/* Animated Milk Bottle Timer */}
                <div className="text-center">
                  <div className="flex flex-col items-center mb-6">
                    {/* Animated Milk Bottle */}
                    <motion.div
                      animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                      transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
                      className="mb-4"
                    >
                      <AnimatedMilkBottleTimer
                        duration={1800} // 30 minutes default for demo
                        currentTime={time}
                        isActive={isRunning}
                        size="large"
                        theme="breastfeeding"
                      />
                    </motion.div>
                    
                    {/* Time Display */}
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-2">
                      {formatTime(time)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isRunning ? '🔴 Recording...' : time > 0 ? '⏸️ Paused' : '⏱️ Ready to start'}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {!isRunning ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={start}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
                      >
                        <Play className="w-5 h-5" />
                        Start
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={pause}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={reset}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-full shadow-lg font-medium"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </motion.button>

                    {time > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={completeBreastfeeding}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
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
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                      duration={100}
                      currentTime={bottleAmount ? Math.min(parseFloat(bottleAmount) || 0, 100) : 0}
                      isActive={false}
                      size="medium"
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
                            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all duration-200 border-2 border-transparent hover:border-blue-200"
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
                        className="w-full p-3 text-center text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
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
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Record Button */}
                  <motion.button
                    whileHover={{ scale: bottleAmount ? 1.05 : 1 }}
                    whileTap={{ scale: bottleAmount ? 0.95 : 1 }}
                    onClick={recordBottleFeeding}
                    disabled={!bottleAmount}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 ${
                      bottleAmount
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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

                {/* Animated Sleep Timer */}
                <div className="text-center">
                  <div className="flex flex-col items-center mb-6">
                    {/* Animated Milk Bottle for Sleep */}
                    <motion.div
                      animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                      transition={{ duration: 3, repeat: isRunning ? Infinity : 0 }}
                      className="mb-4 opacity-80"
                    >
                      <AnimatedMilkBottleTimer
                        duration={3600} // 1 hour default for sleep
                        currentTime={time}
                        isActive={isRunning}
                        size="large"
                        theme="sleeping"
                      />
                    </motion.div>
                    
                    {/* Time Display */}
                    <div className="text-4xl font-mono font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
                      {formatTime(time)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {isRunning ? '😴 Sleeping...' : time > 0 ? '⏸️ Paused' : '🌙 Ready for sleep'}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {!isRunning ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startSleeping}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
                      >
                        <Play className="w-5 h-5" />
                        Start Sleep
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={pause}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        reset();
                        setSleepStartTime(null);
                      }}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-full shadow-lg font-medium"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </motion.button>

                    {time > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={completeSleeping}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
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
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                const theme = TAB_THEMES[session.type];
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
                          {formatTime(session.duration)}
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
