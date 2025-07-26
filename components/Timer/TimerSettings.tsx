import React from 'react';
import { motion } from 'framer-motion';
import { FEEDING_PRESETS } from '../../data/scriptures';
import { formatTimeVerbose } from '../../utils/timeFormat';

interface TimerSettingsProps {
  currentDuration: number;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

export function TimerSettings({ currentDuration, onDurationChange, disabled }: TimerSettingsProps) {
  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">
        Quick Presets
      </h3>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FEEDING_PRESETS.map((preset) => (
          <motion.button
            key={preset.value}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            onClick={() => !disabled && onDurationChange(preset.value)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${currentDuration === preset.value
                ? 'bg-pink-400 text-white shadow-md ring-2 ring-pink-300'
                : disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:bg-pink-50 hover:border-pink-200 focus:ring-pink-300'
              }
            `}
            aria-label={`Set timer to ${preset.label}`}
            aria-pressed={currentDuration === preset.value}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>
      
      {/* Current selection display */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500">
          Current duration: <span className="font-semibold text-gray-700">
            {formatTimeVerbose(currentDuration)}
          </span>
        </div>
      </div>
      
      {/* Custom duration input for future enhancement */}
      <div className="mt-4 text-center">
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700 transition-colors">
            Custom duration
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={Math.floor(currentDuration / 60)}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 1;
                  onDurationChange(minutes * 60);
                }}
                disabled={disabled}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:border-pink-400 focus:outline-none"
                aria-label="Custom duration in minutes"
              />
              <span className="text-gray-700">minutes</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}