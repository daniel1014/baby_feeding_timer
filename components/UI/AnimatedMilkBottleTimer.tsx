"use client"

import React from 'react'
import { motion, type Transition, type Easing } from 'framer-motion'
import Image from 'next/image'

interface AnimatedMilkBottleTimerProps {
  mode: 'stopwatch' | 'countdown'
  initialDuration?: number // Duration in milliseconds for countdown mode
  isRunning: boolean
  onComplete?: () => void
  size?: 'small' | 'medium' | 'large'
  theme?: 'breastfeeding' | 'bottle' | 'sleeping' | 'timer'
}

export default function AnimatedMilkBottleTimer({ 
  mode,
  initialDuration = 120000, // Default 2 minutes in milliseconds for countdown mode
  isRunning,
  onComplete,
  size = 'medium',
  theme = 'breastfeeding'
}: AnimatedMilkBottleTimerProps) {

  // Single source of truth for elapsed time with RAF
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const startAtRef = React.useRef<number | null>(null);
  const pausedAccumRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const hasCompletedRef = React.useRef(false);
  
  // Stable refs for dynamic props (prevents function recreation)
  const modeRef = React.useRef(mode);
  const initialDurationRef = React.useRef(initialDuration);
  const onCompleteRef = React.useRef(onComplete);
  
  // Update refs when props change
  React.useEffect(() => { modeRef.current = mode }, [mode]);
  React.useEffect(() => { initialDurationRef.current = initialDuration }, [initialDuration]);
  React.useEffect(() => { onCompleteRef.current = onComplete }, [onComplete]);
  
  // Run reset before start/stop so a mode/duration change in the same render
  // doesn't immediately cancel a just-started RAF
  React.useEffect(() => {
    console.log('Mode/duration changed - resetting timer');
    
    // Stop any running animation
    if (rafRef.current != null) {
      if (typeof window !== 'undefined') {
        (window as any).__rafStops++;
        console.log('Clearing RAF on reset:', rafRef.current, 'totalStops=', (window as any).__rafStops);
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Reset all state
    setElapsedMs(0);
    startAtRef.current = null;
    pausedAccumRef.current = 0;
    hasCompletedRef.current = false;
    
    console.log('Reset complete. RAF stats:', {
      starts: typeof window !== 'undefined' ? (window as any).__rafStarts : 0,
      stops: typeof window !== 'undefined' ? (window as any).__rafStops : 0,
      difference: typeof window !== 'undefined' ? (window as any).__rafStarts - (window as any).__rafStops : 0
    });
  }, [mode, initialDuration]);

  // Stable startTimer (no deps - uses refs for all dynamic values)
  const startTimer = React.useCallback(() => {
    if (rafRef.current != null) {
      console.log('startTimer: RAF already running, id=', rafRef.current);
      return;
    }
    
    startAtRef.current = performance.now();
    console.log('Starting timer at', startAtRef.current);
    
    const loop = (t: number) => {
      const elapsedSinceStart = startAtRef.current ? t - startAtRef.current : 0;
      const elapsed = pausedAccumRef.current + elapsedSinceStart;
      
      if (modeRef.current === 'countdown') {
        setElapsedMs(() => Math.min(Math.round(elapsed), initialDurationRef.current));
        
        // Check for completion
        if (elapsed >= initialDurationRef.current) {
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current?.();
            console.log('Timer completed!');
          }
          
          if (rafRef.current != null) {
            if (typeof window !== 'undefined') {
              (window as any).__rafStops++;
              console.log('Clearing RAF on completion:', rafRef.current, 'totalStops=', (window as any).__rafStops);
            }
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          return;
        }
      } else {
        // Stopwatch mode - runs indefinitely until manually stopped
        setElapsedMs(() => Math.round(elapsed));
      }
      
      // Schedule next frame and capture the id immediately
      rafRef.current = requestAnimationFrame(loop);
    };
    
    // Start and capture id
    rafRef.current = requestAnimationFrame(loop);
    
    if (typeof window !== 'undefined') {
      (window as any).__rafStarts++;
      console.log('Created RAF:', rafRef.current, 'totalStarts=', (window as any).__rafStarts);
    }
  }, []); // Empty deps - completely stable
  
  // Stable stopTimer (no deps)
  const stopTimer = React.useCallback(() => {
    if (rafRef.current != null) {
      if (typeof window !== 'undefined') {
        (window as any).__rafStops++;
        console.log('stopTimer: Clearing RAF:', rafRef.current, 'totalStops=', (window as any).__rafStops);
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (startAtRef.current != null) {
      const additionalElapsed = performance.now() - startAtRef.current;
      pausedAccumRef.current += additionalElapsed;
      console.log('Paused. Accumulated:', pausedAccumRef.current);
      startAtRef.current = null;
    }
  }, []); // Empty deps - completely stable
  
  // Effect only depends on isRunning (and stable functions)
  React.useEffect(() => {
    console.log('isRunning changed to:', isRunning);
    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }
    
  }, [isRunning, startTimer, stopTimer]);

  // Separate unmount cleanup
  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        if (typeof window !== 'undefined') {
          (window as any).__rafStops++;
          console.log('Unmount/cleanup - clearing RAF:', rafRef.current, 'totalStops=', (window as any).__rafStops);
        }
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []); 
  
  // Convert to seconds for calculations
  const elapsedSeconds = elapsedMs / 1000;
  
  // Calculate fill percentage
  let fillPercentage: number;
  if (mode === 'stopwatch') {
    // Stopwatch: drain from 100% to 0% over default 2 minutes (120s)
    const stopwatchDuration = 120000; // 2 minutes in milliseconds
    const progress = Math.min(elapsedMs / stopwatchDuration, 1);
    fillPercentage = Math.max((1 - progress) * 100, 0);
  } else {
    // Countdown: start with full liquid (100%) when not running, then drain from 100% to 0%
    if (elapsedMs === 0 && !isRunning) {
      fillPercentage = 100; // Show full liquid when countdown timer is ready/reset
    } else {
      const progress = Math.min(elapsedMs / initialDuration, 1);
      fillPercentage = Math.max((1 - progress) * 100, 0);
    }
  }
  
  // Correct liquid positioning - full bottle should reach near the neck
  const bodyTopY = 94;       // Near top of bottle neck for full liquid
  const bodyBottomY = 264;   // Bottom of viewBox
  const bodyHeight = bodyBottomY - bodyTopY;
  const liquidHeight = bodyHeight * (fillPercentage / 100);
  const liquidY = bodyBottomY - liquidHeight;
  
  // Size configurations - adjusted for better spacing
  const sizeConfig = {
    small: { width: 100, height: 160 },
    medium: { width: 140, height: 220 },
    large: { width: 180, height: 280 }
  }
  
  const config = sizeConfig[size]
  
  // Theme-based colors
  const getThemeColors = () => {
    switch (theme) {
      case 'breastfeeding':
        return {
          primary: '#FFF8DC',
          secondary: '#F5DEB3',
          surface: '#FFFACD',
        }
      case 'bottle':
        return {
          primary: '#E6F3FF',
          secondary: '#B3D9FF',
          surface: '#CCE7FF',
        }
      case 'sleeping':
        return {
          primary: '#F3E8FF',
          secondary: '#D4C5F9',
          surface: '#E9D5FF',
        }
      default:
        return {
          primary: '#FFF8DC',
          secondary: '#F5DEB3',
          surface: '#FFFACD',
        }
    }
  }

  const colors = getThemeColors()

  // Bottle SVG Components (unchanged from original)
  const BottleSVGBackgroundPaths = () => (
    <g id="bottle-background">
      <path className="fill-gray-400" d="M14.86,181.28c.07-1.49.06-2.93.09-4.42,5.39.84,16.63-1.12,21.28,0,.76.18,2.08,1.58,1.94,2.39-.56.81-1.71,2.16-2.81,2.39-4.63,1-15.29-.51-20.5-.37Z"/>
      <g>
        <path className="fill-yellow-100" d="M85.22,3.46c-.58,3.01-4.45.26-6.48,1.29,14.57,6.93,5.06,14.88,4.32,24.3-.93,11.76,8.7,20.27,22.66,19.33,1.57.67-6.19,5.91-6.91,6.26-11.31,5.57-30.26,2.97-43.6,3.31-7.13.18-14.37,1.02-21.54,1.1.64-15.04,20.84-11.57,27.28-22.46,4.72-7.98-3.41-12.63-3.19-19.88.36-11.73,15.5-19.24,27.45-13.25Z"/>
        <path className="fill-yellow-200" d="M118.75,61.93c-20.87-1.78-63.44-.95-84.88.42l.04-1.09c.11-.73-.25-1.55-.23-2.21,7.17-.09,14.41-.92,21.54-1.1,13.34-.34,32.28,2.26,43.6-3.31.72-.35,8.48-5.59,6.91-6.26-13.97.94-23.59-7.57-22.66-19.33.74-9.42,10.25-17.37-4.32-24.3,2.02-1.03,5.89,1.73,6.48-1.29,5.05,2.53,8.54,6.35,9.5,11.41,1.46,7.74-6.85,12.41-3.71,20.25,5.16,12.88,29.05,8.19,27.91,25.77l-.16,1.04Z"/>
        <path className="fill-pink-200" d="M122.49,62.19c-.06,1.76.11,3.58.29,5.32-2.86-.06-5.81-.67-8.63-.74-24.92-.56-49.96.42-74.9,0-1.25.47-1.14,18.58-1.08,20.99l-17.01.37c-.43-2.8-.44-20.1.69-21.72,3.06-4.37,7.25-3.76,12.02-4.06,21.45-1.37,64.01-2.2,84.88-.42,1.26.11,2.48.02,3.73.26Z"/>
        <path className="fill-red-400" d="M131.24,67.15c.61,1.02.85,21.2.43,22.83-.83,3.21-3.45,4.64-7.02,5.36l-.03.11-.42-.04c-31.04-2.21-65.74,1.18-96.37-1.67-.88-.08-3.51.11-3.91-.07-1.24-.56-1.93-1.49-2.42-2.58,5.54-.58,11.11-.34,16.66-.37,25.53-.11,51.08.08,76.62,0,10.5-3.77,8.79-15.26,7.99-23.19,2.85.06,5.63-.25,8.46-.37Z"/>
        <path className="fill-gray-300" d="M124.62,95.44l.03-.11c-.03.05-.05.09-.03.11.9.87,1.63,1.85,2.56,2.71.11.1.24.19.35.29-.11-.1-.23-.19-.35-.29-2.34.64-4.53.91-6.99,1.03-29.59,1.41-60.68-1.06-90.44,0-1.44-.22-1.9-1.88-1.82-2.92.04-.52,2.43-.74-.1-2.53,30.62,2.85,65.32-.54,96.37,1.67l.42.04Z"/>
        <path className="fill-pink-300" d="M38.17,88.13c.03.9.56,1.66,0,2.58-5.55.02-11.12-.21-16.66.37-.47-1.03-.21-2.04-.35-2.95l17.01-.37c0,.12,0,.25,0,.37Z"/>
        <path className="fill-pink-300" d="M131.24,67.15c-2.84.12-5.61.43-8.46.37-.18-1.74-.35-3.56-.29-5.32,3.26.64,7.17,2.32,8.75,4.95Z"/>
        <path className="fill-pink-300" d="M114.14,66.78c-.83,8.38,1.07,17.7-10.14,21.35H38.17c0-.12,0-.25,0-.37-.06-2.4-.17-20.51,1.08-20.99,24.94.42,49.97-.56,74.9,0Z"/>
        <path className="fill-pink-400" d="M122.78,67.52c.81,7.93,2.52,19.43-7.99,23.19-25.54.08-51.09-.11-76.62,0,.56-.91.03-1.67,0-2.58h65.83c11.21-3.65,9.31-12.97,10.14-21.35,2.83.06,5.77.68,8.63.74Z"/>
      </g>
      <path className="fill-blue-600" d="M17.45,196.35h16.84c1.03,0,1.86.83,1.86,1.86s-.83,1.86-1.86,1.86h-16.84c-.67.01-1.43.06-2.08.17,0-1.72-.05-3.89,2.08-3.89,0,0-2.13,0,0,0Z"/>
      <line className="stroke-blue-500 stroke-[3.72px]" strokeLinecap="round" strokeLinejoin="round" x1="15.29" y1="144.09" x2="34.72" y2="144.09"/>
      <path className="fill-blue-700" d="M14.43,122.35h19.86c2.45.06,2.46,3.66,0,3.72-.46,0-22.12,0-21.72,0,0,0,0-3.72,0-3.72h1.86Z"/>
      <path className="fill-blue-800" d="M4.07,233.17h33.24c2.44.06,2.46,3.66,0,3.72,0,0-33.24,0-33.24,0h-1.86v-3.72h1.86Z"/>
    </g>
  )

  const BottleSVGOutlinePaths = () => (
    <g id="bottle-outline">
      <path className="stroke-black stroke-[2.71px] fill-none" strokeLinecap="round" strokeLinejoin="round" d="M23.92,93.66c-1.24-.56-1.93-1.49-2.42-2.58s-.21-2.04-.35-2.95c-.43-2.8-.44-20.1.69-21.72,3.06-4.37,7.25-3.76,12.02-4.06,21.45-1.37,64.01-2.2,84.88-.42,1.26.11,2.48.02,3.73.26,3.26.64,7.17,2.32,8.75,4.95.61,1.02.85,21.2.43,22.83-.83,3.21-3.45,4.64-7.02,5.36-.15.03-.3.05-.45.07-31.04-2.21-65.74,1.18-96.37-1.67-.88-.08-3.51.11-3.91-.07Z"/>
      <path className="stroke-black stroke-[2.71px] fill-none" strokeLinecap="round" strokeLinejoin="round" d="M27.93,96.26c-25.23,15.51-14.51,43.87-13.16,65.88.3,4.83.26,9.88.17,14.73-.03,1.49-.01,2.93-.09,4.42-.82,16.93-3.35,20.52-10.1,35.71-4.09,9.21-5.03,25.28.17,34.24,6,10.33,15.86,9.49,28.06,10.46,28.03,2.23,69.85,2.37,97.56-1.18,12.64-1.62,16.05-3.63,19.6-14.8,6.16-19.42-5.02-28.08-9.76-44.55-5.57-19.35-1.38-37.86,0-57.06,1.43-19.86,4.12-29.88-12.86-45.65-.11-.1-.23-.19-.35-.29-.93-.86-1.66-1.83-2.56-2.71"/>
    </g>
  )

  const LiquidDefs = () => (
    <defs>
      {/* Reusable bottle shape path */}
      <path id="bottle-shape" d="M27.93,96.26c-25.23,15.51-14.51,43.87-13.16,65.88.3,4.83.26,9.88.17,14.73-.03,1.49-.01,2.93-.09,4.42-.82,16.93-3.35,20.52-10.1,35.71-4.09,9.21-5.03,25.28.17,34.24,6,10.33,15.86,9.49,28.06,10.46,28.03,2.23,69.85,2.37,97.56-1.18,12.64-1.62,16.05-3.63,19.6-14.8,6.16-19.42-5.02-28.08-9.76-44.55-5.57-19.35-1.38-37.86,0-57.06,1.43-19.86,4.12-29.88-12.86-45.65-.11-.1-.23-.19-.35-.29-.93-.86-1.66-1.83-2.56-2.71Z" />

      {/* Gradient for the liquid */}
      <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors.surface} />
        <stop offset="30%" stopColor={colors.primary} />
        <stop offset="100%" stopColor={colors.secondary} />
      </linearGradient>

      {/* Mask that reveals the bottle fill */}
      <mask id="liquidMask" maskUnits="userSpaceOnUse">
        {/* White reveals, black hides */}
        <rect
          id="liquidMaskRect"
          x="0"
          y={isNaN(liquidY) ? 264 : liquidY}
          width="153.31"
          height={isNaN(liquidHeight) ? 0 : liquidHeight}
          fill="white"
        />
      </mask>

      {/* Keep a clipPath for bubbles and other internals */}
      <clipPath id="bottle-container" clipPathUnits="userSpaceOnUse">
        <use href="#bottle-shape" />
      </clipPath>
    </defs>
  )

  const AnimatedLiquid = () => (
    <g>
      {/* Bottle-shaped fill revealed by mask */}
      <use href="#bottle-shape" fill="url(#liquidGradient)" mask="url(#liquidMask)" />
    </g>
  )

  const BubbleEffects = () => {
    // Temporarily simplified - static bubbles for debugging
    if (!isRunning || fillPercentage <= 10 || fillPercentage >= 100) return null
    
    return (
      <g clipPath="url(#bottle-container)">
        {/* Static bubbles - no animation for now */}
        <circle cx="60" cy={liquidY + 20} r="2" fill={colors.surface} opacity="0.4" />
        <circle cx="80" cy={liquidY + 40} r="1.5" fill={colors.surface} opacity="0.3" />
        <circle cx="70" cy={liquidY + 30} r="1" fill={colors.surface} opacity="0.5" />
      </g>
    )
  }

  // Render sleeping image or bottle based on theme
  if (theme === 'sleeping') {
    return (
      <div className="flex items-center justify-center">
        <Image
          src="/babyfeed/baby_sleeping.png"
          alt="Baby sleeping peacefully"
          width={config.width}
          height={config.height}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    );
  }

  // Render animated bottle for other themes
  return (
    <div className="relative flex items-center justify-center">
      <div 
        className="relative drop-shadow-lg"
        style={{ width: config.width, height: config.height }}
      >
        <svg
          viewBox="0 0 153.31 264.63"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <LiquidDefs />
          <BottleSVGBackgroundPaths />
          <AnimatedLiquid />
          <BubbleEffects />
          <BottleSVGOutlinePaths />
        </svg>
        
        {/* Enhanced cute face animation */}
        {isRunning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ 
                scale: [1, 1.08, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-center relative"
              style={{ 
                marginTop: `${config.height * 0.18}px`,
                marginLeft: `${config.width * 0.05}px`
              }}
            >
              {/* 
                To keep the eye and mouth animation transitions in sync, 
                we use a shared transition object, but with the correct Framer Motion type for `ease`.
                The minimal change is to use `ease: "easeInOut"` as an array, which is accepted by Framer Motion.
              */}
              {(() => {
                const duration = 3;
                // Use string literal for ease to satisfy Framer Motion's type
                const sharedTransition: Transition = {
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut" as Easing
                };
                return (
                  <>
                    {/* Eye */}
                    <motion.div
                      className="flex gap-3 justify-center mb-2"
                      animate={{ 
                        scaleY: [1, 0.1, 1],
                        scaleX: [1, 1, 1]
                      }}
                      transition={sharedTransition}
                    >
                      <div 
                        className={`w-2 h-2 ${theme === 'breastfeeding' ? 'bg-pink-600' : 'bg-blue-600'} rounded-full relative`}
                      />
                      <div 
                        className={`w-2 h-2 ${theme === 'breastfeeding' ? 'bg-pink-600' : 'bg-blue-600'} rounded-full relative`}
                      />
                    </motion.div>
                    
                    {/* Mouth */}
                    <motion.div
                      className={`w-4 h-2 border-2 ${theme === 'breastfeeding' ? 'border-pink-500' : 'border-blue-500'} rounded-b-full border-t-0`}
                      animate={{ 
                        scaleX: [1.5, 1.2, 1.5],
                        scaleY: [1, 0.8, 1]
                      }}
                      transition={sharedTransition}
                      style={{ marginLeft: '5px' }}
                    />
                  </>
                );
              })()}
            
            </motion.div>
          </div>
        )}
        
        {/* Floating hearts */}
        {isRunning && (
          <div className="absolute -top-2 -right-2">
            <motion.div
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="text-pink-400 text-sm"
            >
              💕
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

// Demo component with proper state management
export function TimerDemo() {
  const [mode, setMode] = React.useState<'stopwatch' | 'countdown'>('stopwatch')
  const [isRunning, setIsRunning] = React.useState(false)
  const [duration, setDuration] = React.useState(120) // 2 minutes default
  const [key, setKey] = React.useState(0) // Force remount on reset
  
  const handleReset = () => {
    setIsRunning(false)
    setKey(prev => prev + 1) // Force component remount for clean reset
  }
  
  const handleModeChange = (newMode: 'stopwatch' | 'countdown') => {
    setMode(newMode)
    setIsRunning(false)
    setKey(prev => prev + 1) // Force remount when changing modes
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Baby Bottle Timer</h1>
        
        {/* Mode selector */}
        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'stopwatch' 
                ? 'bg-pink-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🍼 Stopwatch
          </button>
          <button
            onClick={() => handleModeChange('countdown')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'countdown' 
                ? 'bg-pink-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ⏱️ Timer
          </button>
        </div>
        
        {/* Duration selector for countdown mode */}
        {mode === 'countdown' && !isRunning && (
          <div className="flex gap-2 justify-center mb-6">
            {[30, 60, 120, 180, 300].map(seconds => (
              <button
                key={seconds}
                onClick={() => {
                  setDuration(seconds)
                  setKey(prev => prev + 1) // Reset timer when duration changes
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  duration === seconds 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {seconds >= 60 ? `${seconds/60}m` : `${seconds}s`}
              </button>
            ))}
          </div>
        )}
        
        {/* Timer component */}
        <div className="flex justify-center mb-8">
          <AnimatedMilkBottleTimer
            key={key} // Force remount on reset
            mode={mode}
            initialDuration={duration}
            isRunning={isRunning}
            onComplete={() => {
              setIsRunning(false)
              console.log('Timer completed!')
            }}
            size="large"
            theme="bottle"
          />
        </div>
        
        {/* Control buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {isRunning ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-bold text-lg hover:bg-gray-300 transition-all"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  )
}