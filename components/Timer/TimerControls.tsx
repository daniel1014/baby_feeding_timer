import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function TimerControls({
  isActive,
  isPaused,
  isCompleted,
  onStart,
  onPause,
  onResume,
  onReset
}: TimerControlsProps) {
  const handleToggle = () => {
    if (isActive) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Main Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`
          flex items-center justify-center w-16 h-16 rounded-full
          font-semibold text-white shadow-lg transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${isActive
            ? 'bg-red-400 hover:bg-red-500 focus:ring-red-300'
            : isCompleted
              ? 'bg-green-400 hover:bg-green-500 focus:ring-green-300'
              : 'bg-pink-400 hover:bg-pink-500 focus:ring-pink-300'
          }
        `}
        aria-label={isActive ? 'Pause timer' : isPaused ? 'Resume timer' : 'Start timer'}
      >
        {isActive ? (
          <PauseIcon className="w-8 h-8" />
        ) : (
          <PlayIcon className="w-8 h-8 ml-1" />
        )}
      </motion.button>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        disabled={!isActive && !isPaused && !isCompleted}
        className={`
          flex items-center justify-center w-12 h-12 rounded-full
          transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${(!isActive && !isPaused && !isCompleted)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-400 hover:bg-gray-500 text-white shadow-md focus:ring-gray-300'
          }
        `}
        aria-label="Reset timer"
      >
        <ArrowPathIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
}