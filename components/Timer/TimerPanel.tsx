import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Save, Timer, Watch, Plus, Check } from 'lucide-react';
import { UseUnifiedTimerReturn } from '../../hooks/useUnifiedTimer';
import AnimatedMilkBottleTimer from '../UI/AnimatedMilkBottleTimer';
import { DateTime } from '../UI/DateTime';
import { TIMER_PRESETS } from '../../types';

interface TimerPanelProps {
  timer: UseUnifiedTimerReturn;
  theme: 'breastfeeding' | 'sleeping';
  currentTime: Date | null;
  sleepStartTime?: Date | null;
  onComplete: () => void;
  onSleepStart?: () => void;
  onTimeChange?: (newTime: Date) => void;
}

export const TimerPanel = React.memo(({
  timer,
  theme,
  currentTime,
  sleepStartTime,
  onComplete,
  onSleepStart,
  onTimeChange
}: TimerPanelProps) => {
  const [customTimerDuration, setCustomTimerDuration] = useState('');
  const [showCustomDurationInput, setShowCustomDurationInput] = useState(false);

  const themeColors = {
    breastfeeding: {
      primary: 'from-pink-400 to-purple-500',
      modeActive: 'bg-pink-500 text-white shadow-sm',
      modeInactive: 'text-gray-600 hover:text-pink-600 hover:bg-pink-50',
      gradient: 'from-pink-50 to-purple-50',
      border: 'border-pink-100',
      text: 'text-pink-700',
      button: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
    },
    sleeping: {
      primary: 'from-purple-400 to-indigo-500',
      modeActive: 'bg-purple-500 text-white shadow-sm',
      modeInactive: 'text-gray-600 hover:text-purple-600 hover:bg-purple-50',
      gradient: 'from-purple-50 to-indigo-50',
      border: 'border-purple-100',
      text: 'text-purple-700',
      button: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
    }
  };

  const colors = themeColors[theme];
  const displayTime = sleepStartTime || currentTime;

  const handleCustomTimerStart = () => {
    const duration = Number(customTimerDuration);
    if (duration && duration > 0 && duration <= 1440) {
      timer.startTimer(duration * 60);
      setCustomTimerDuration('');
      setShowCustomDurationInput(false);
    }
  };

  const isCustomTimerValid = customTimerDuration &&
    !isNaN(Number(customTimerDuration)) &&
    Number(customTimerDuration) > 0 &&
    Number(customTimerDuration) <= 1440;

  return (
    <div className="space-y-6">
      {/* Enhanced Date & Time Display */}
      <div className="flex justify-center mb-4">
        {displayTime && (
          <DateTime
            currentDateTime={displayTime}
            onDateTimeChange={onTimeChange}
            theme={theme}
            editable={!!onTimeChange}
            size="medium"
          />
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
          <button
            onClick={timer.setStopwatchMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              timer.mode === 'stopwatch' ? colors.modeActive : colors.modeInactive
            }`}
          >
            <Watch className="w-4 h-4" />
            <span className="text-sm">Stopwatch</span>
          </button>
          <button
            onClick={timer.setTimerMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              timer.mode === 'countdown' ? colors.modeActive : colors.modeInactive
            }`}
          >
            <Timer className="w-4 h-4" />
            <span className="text-sm">Timer</span>
          </button>
        </div>
      </div>

      {/* Animated Timer Display */}
      <div className="text-center">
        <div className="flex flex-col items-center mb-6">
          {/* Timer Display Component */}
          <div className="mb-4">
            <AnimatedMilkBottleTimer
              mode={timer.mode}
              initialDuration={timer.mode === 'countdown' ? timer.initialTimeMs : undefined}
              isRunning={timer.isRunning}
              onComplete={onComplete}
              size="medium"
              theme={theme}
            />
          </div>
          
          {/* Time Display */}
          <div className={`text-4xl font-mono font-bold bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent mb-2`}>
            {timer.formatTime(timer.timeMs)}
          </div>
          <div className="text-sm text-gray-500">
            {timer.mode === 'stopwatch' 
              ? (timer.isRunning ? 
                  (theme === 'sleeping' ? '😴 Sleeping...' : '🔴 Recording...') : 
                  timer.time > 0 ? '⏸️ Paused' : 
                  (theme === 'sleeping' ? '🌙 Ready for sleep' : '⏱️ Ready to start'))
              : (timer.isRunning ? '⏰ Timer running...' : 
                 timer.time > 0 ? '⏸️ Paused' : 
                 timer.isCompleted ? '✅ Completed' : '⏰ Timer ready')
            }
          </div>
        </div>

        {/* Timer Presets - Only show in countdown mode */}
        <AnimatePresence mode="wait">
          {timer.mode === 'countdown' && (
            <motion.div
              key="timer-presets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className={`bg-gradient-to-r ${colors.gradient} rounded-lg p-4 border ${colors.border}`}>
                <label className={`text-sm font-medium ${colors.text} mb-3 block flex items-center gap-2`}>
                  <Timer className="w-4 h-4" />
                  Quick Timer Presets
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TIMER_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => timer.startTimer(preset.value)}
                      className={`group relative p-3 bg-white hover:${colors.gradient.split(' ')[1]} ${colors.text} rounded-lg font-medium transition-all duration-300 border ${colors.border.replace('border-', 'border-').replace('100', '200')} hover:${colors.border.replace('100', '300')} hover:shadow-md text-sm`}
                    >
                      <span className="relative z-10">{preset.label}</span>
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        layoutId={`preset-${preset.value}-${theme}`}
                      />
                    </motion.button>
                  ))}
                </div>
                
                {/* Custom Duration Input */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomDurationInput(!showCustomDurationInput)}
                    className={`text-xs font-medium ${colors.text} flex items-center gap-1 hover:${colors.text.replace('700', '800')} transition-colors duration-200 cursor-pointer`}
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
                                const value = e.target.value.replace(/^0+/, '');
                                setCustomTimerDuration(value);
                              }}
                              className={`w-full px-4 py-3 text-center text-lg font-medium border-2 ${colors.border.replace('100', '200')} rounded-xl focus:ring-2 focus:${colors.border.replace('border-', 'ring-').replace('200', '400')} focus:${colors.border.replace('100', '400')} transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-${theme === 'breastfeeding' ? 'pink' : 'purple'}-300`}
                              min="1"
                              max="1440"
                              autoFocus
                            />
                            <div className={`absolute right-10 top-1/2 transform -translate-y-1/2 ${colors.text.replace('700', '400')} text-sm font-medium hidden md:block`}>
                              min
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: isCustomTimerValid ? 1.05 : 1 }}
                            whileTap={{ scale: isCustomTimerValid ? 0.95 : 1 }}
                            onClick={handleCustomTimerStart}
                            disabled={!isCustomTimerValid}
                            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                              isCustomTimerValid
                                ? `bg-gradient-to-r ${colors.button} text-white shadow-lg hover:shadow-xl`
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCustomTimerValid && <Check className="w-4 h-4" />}
                              {isCustomTimerValid 
                                ? `Start ${customTimerDuration} min`
                                : 'Start'
                              }
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {!timer.isRunning ? (
            <>
              {timer.mode === 'stopwatch' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={theme === 'sleeping' && onSleepStart ? onSleepStart : timer.startStopwatch}
                  className={`flex items-center gap-2 bg-gradient-to-r ${colors.button} text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200`}
                >
                  <Play className="w-5 h-5" />
                  Start Stopwatch
                </motion.button>
              )}
              {timer.time > 0 && timer.mode === 'countdown' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={timer.resume}
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
              onClick={timer.pause}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={timer.reset}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full shadow-md hover:shadow-lg font-medium transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </motion.button>

          {timer.time > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Save className="w-5 h-5" />
              {theme === 'sleeping' ? 'Wake Up' : 'Complete'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
});

TimerPanel.displayName = 'TimerPanel';