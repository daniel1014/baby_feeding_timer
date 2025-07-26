import React from 'react';
import { motion } from 'framer-motion';
import { formatTime, getProgressPercentage } from '../../utils/timeFormat';

interface TimerDisplayProps {
  remaining: number;
  duration: number;
  isActive: boolean;
  isCompleted: boolean;
}

export function TimerDisplay({ remaining, duration, isActive, isCompleted }: TimerDisplayProps) {
  const progress = getProgressPercentage(remaining, duration);
  const formattedTime = formatTime(remaining);
  
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Circular Progress Ring */}
      <div className="relative w-64 h-64 mb-8">
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 100 100"
        >
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(230, 230, 250)" // var(--secondary)
            strokeWidth="8"
            className="opacity-30"
          />
          
          {/* Progress ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(255, 182, 193)" // var(--primary)
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            className="transition-all duration-300 ease-in-out"
            style={{
              filter: isCompleted ? 'drop-shadow(0 0 20px rgb(152, 251, 152))' : 'none'
            }}
          />
        </svg>
        
        {/* Timer Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isActive ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="text-center"
          >
            <div 
              className={`text-6xl font-mono font-bold transition-colors duration-300 ${
                isCompleted 
                  ? 'text-green-500' 
                  : isActive 
                    ? 'text-pink-400' 
                    : 'text-gray-600'
              }`}
            >
              {formattedTime}
            </div>
            
            {/* Status indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm font-medium text-gray-500"
            >
              {isCompleted ? (
                <span className="text-green-500 font-semibold">Complete! 🎉</span>
              ) : isActive ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-pink-400"
                >
                  Running...
                </motion.span>
              ) : (
                <span>Ready to start</span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Progress bar for mobile/alternative view */}
      <div className="w-full max-w-sm bg-gray-200 rounded-full h-3 mb-4 sm:hidden">
        <motion.div
          className="bg-pink-400 h-3 rounded-full transition-all duration-300"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          style={{
            background: isCompleted 
              ? 'linear-gradient(90deg, rgb(152, 251, 152), rgb(144, 238, 144))'
              : 'linear-gradient(90deg, rgb(255, 182, 193), rgb(255, 160, 180))'
          }}
        />
      </div>
    </div>
  );
}