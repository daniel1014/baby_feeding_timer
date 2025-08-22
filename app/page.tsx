'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Milk, Moon } from 'lucide-react';
import Image from 'next/image';

// Components
import { PageHeader } from '../components/Layout/PageHeader';
import { TimerPanel } from '../components/Timer/TimerPanel';
import { BottleTab } from '../components/Session/BottleTab';
import DiaperTab from '../components/Session/DiaperTab';
import { SessionHistory } from '../components/Session/SessionHistory';
import { ScripturePopup } from '../components/UI/ScripturePopup';

// Hooks
import { useUnifiedTimer } from '../hooks/useUnifiedTimer';
import { useSessionManager } from '../hooks/useSessionManager';
import { useScripture } from '../hooks/useScripture';

// Types and constants
import { SessionType, TAB_THEMES } from '../types';
import { requestNotificationPermission } from '../utils/soundNotification';

export default function Home() {
  // Timers for each tab
  const breastfeedingTimer = useUnifiedTimer({ 
    mode: 'stopwatch'
  });
  const sleepingTimer = useUnifiedTimer({ 
    mode: 'stopwatch'
  });

  // Session management
  const sessionManager = useSessionManager();
  const scripture = useScripture();

  // UI state
  const [activeTab, setActiveTab] = useState<SessionType>('breastfeeding');
  const [bottleAmount, setBottleAmount] = useState('');
  const [bottleUnit, setBottleUnit] = useState<'ml' | 'oz'>('ml');
  const [notes, setNotes] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [customSessionTime, setCustomSessionTime] = useState<Date | null>(null);

  // Initialize client-side state
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

  // Session completion handlers
  const handleBreastfeedingComplete = React.useCallback(() => {
    sessionManager.completeBreastfeeding(breastfeedingTimer.timeMs, notes);
    breastfeedingTimer.reset();
    setNotes('');
    scripture.onTimerComplete();
  }, [breastfeedingTimer, sessionManager, notes, scripture]);

  const handleBottleFeedingRecord = React.useCallback(() => {
    sessionManager.recordBottleFeeding(bottleAmount, bottleUnit, notes);
    setBottleAmount('');
    setNotes('');
  }, [sessionManager, bottleAmount, bottleUnit, notes]);

  const handleSleepingComplete = React.useCallback(() => {
    sessionManager.completeSleeping(sleepingTimer.timeMs, notes);
    sleepingTimer.reset();
    setNotes('');
    setSleepStartTime(null);
  }, [sleepingTimer, sessionManager, notes]);

  const handleSleepStart = React.useCallback(() => {
    setSleepStartTime(new Date());
    sleepingTimer.startStopwatch();
  }, [sleepingTimer]);

  const handleTimeChange = React.useCallback((newTime: Date) => {
    setCustomSessionTime(newTime);
    setCurrentTime(newTime);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 relative overflow-hidden">
      {/* Page Header with Background Particles */}
      <PageHeader isClient={isClient} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl p-1 shadow-xl border border-gray-100 mb-8 max-w-2xl mx-auto">
          {(['breastfeeding', 'bottle', 'sleeping', 'diaper'] as SessionType[]).map((tabType) => {
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
                {tabType === 'diaper' && (
                  <Image src="/babyfeed/diaper_baby.svg" alt="Diaper" width={16} height={16} />
                )}
                {/* larger screen only */}
                <span className="hidden sm:inline">
                  {tabType === 'breastfeeding' && 'Breastfeeding'}
                  {tabType === 'bottle' && 'Bottle Feeding'}
                  {tabType === 'sleeping' && 'Sleeping'}
                  {tabType === 'diaper' && 'Diaper'}
                </span>
                {/* mobile only */}
                <span className="sm:hidden text-xs font-medium">
                  {tabType === 'breastfeeding' && 'Breast'}
                  {tabType === 'bottle' && 'Bottle'}
                  {tabType === 'sleeping' && 'Sleep'}
                  {tabType === 'diaper' && 'Diaper'}
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
                <TimerPanel
                  timer={breastfeedingTimer}
                  theme="breastfeeding"
                  currentTime={currentTime}
                  onComplete={handleBreastfeedingComplete}
                  onTimeChange={handleTimeChange}
                />

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
                <BottleTab
                  currentTime={currentTime}
                  bottleAmount={bottleAmount}
                  setBottleAmount={setBottleAmount}
                  bottleUnit={bottleUnit}
                  setBottleUnit={setBottleUnit}
                  notes={notes}
                  setNotes={setNotes}
                  onRecord={handleBottleFeedingRecord}
                  onTimeChange={handleTimeChange}
                />
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
                <TimerPanel
                  timer={sleepingTimer}
                  theme="sleeping"
                  currentTime={currentTime}
                  sleepStartTime={sleepStartTime}
                  onComplete={handleSleepingComplete}
                  onSleepStart={handleSleepStart}
                  onTimeChange={handleTimeChange}
                />

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

            {/* Diaper Tab */}
            {activeTab === 'diaper' && (
              <motion.div
                key="diaper"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <DiaperTab
                  currentTime={currentTime}
                  onRecord={(input) => {
                    sessionManager.recordDiaperChange(input);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent Sessions */}
        <SessionHistory sessions={sessionManager.sessions} />

        {/* Encouragement Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8"
        >
          <div className="flex items-center justify-center gap-2 text-lg font-medium text-gray-600">
            <span>🍼</span>
            <span>"You're doing amazing!" </span>
            <span>🍼</span>
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
          } else {
            scripture.addToFavorites(id);
          }
        }}
      />

    </div>
  );
}