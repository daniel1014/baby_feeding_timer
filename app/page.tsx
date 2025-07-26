'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useTimer } from '../hooks/useTimer';
import { useScripture } from '../hooks/useScripture';
import { TimerDisplay } from '../components/Timer/TimerDisplay';
import { TimerControls } from '../components/Timer/TimerControls';
import { TimerSettings } from '../components/Timer/TimerSettings';
import { MilkBottleSticker, MilkBottleDecorations } from '../components/UI/MilkBottleSticker';
import { ScripturePopup } from '../components/UI/ScripturePopup';
import { playNotificationSound, triggerHapticFeedback, showBrowserNotification, requestNotificationPermission } from '../utils/soundNotification';

export default function Home() {
  const timer = useTimer();
  const scripture = useScripture();

  // Handle timer completion
  useEffect(() => {
    if (timer.isCompleted) {
      // Play notification sound
      playNotificationSound();
      
      // Trigger haptic feedback
      triggerHapticFeedback();
      
      // Show browser notification
      showBrowserNotification(
        'Baby Feeding Timer Complete! 🍼',
        'Your feeding session has finished. Great job!'
      );
      
      // Show scripture popup
      scripture.onTimerComplete();
      
      // Show toast notification
      toast.success('Timer completed! 🎉', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'rgb(152, 251, 152)',
          color: 'rgb(34, 102, 34)',
          fontWeight: '500',
        },
      });
    }
  }, [timer.isCompleted]);

  // Request notification permission on first load
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Random scripture intervals (every 10 minutes for long timers)
  useEffect(() => {
    if (timer.isActive && timer.duration >= 30 * 60) { // Only for 30+ minute timers
      const interval = setInterval(() => {
        scripture.onRandomInterval();
      }, 10 * 60 * 1000); // Every 10 minutes
      
      return () => clearInterval(interval);
    }
  }, [timer.isActive, timer.duration]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <MilkBottleDecorations />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <MilkBottleSticker size="medium" animate={false} />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-700">
              Baby Feeding Timer
            </h1>
            <MilkBottleSticker size="medium" animate={false} />
          </div>
          <p className="text-gray-600 font-medium">
            A gentle companion for feeding time
          </p>
        </motion.header>

        {/* Main Timer Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full space-y-8"
          >
            {/* Timer Display */}
            <TimerDisplay
              remaining={timer.remaining}
              duration={timer.duration}
              isActive={timer.isActive}
              isCompleted={timer.isCompleted}
            />

            {/* Timer Controls */}
            <div className="flex justify-center">
              <TimerControls
                isActive={timer.isActive}
                isPaused={timer.isPaused}
                isCompleted={timer.isCompleted}
                onStart={timer.start}
                onPause={timer.pause}
                onResume={timer.resume}
                onReset={timer.reset}
              />
            </div>

            {/* Timer Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <TimerSettings
                currentDuration={timer.duration}
                onDurationChange={timer.setDuration}
                disabled={timer.isActive || timer.isPaused}
              />
            </motion.div>
          </motion.div>
        </main>

        {/* Encouragement Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-8 px-4"
        >
          <div className="flex items-center justify-center gap-2 text-lg font-medium text-gray-600">
            <MilkBottleSticker size="small" />
            <span>"You're doing great, mama!" </span>
            <MilkBottleSticker size="small" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Every feeding is a gift of love 💕
          </p>
        </motion.footer>
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
      <Toaster />
    </div>
  );
}
