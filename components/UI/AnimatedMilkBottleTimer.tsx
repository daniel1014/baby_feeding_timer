"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedMilkBottleTimerProps {
  duration: number // Total time in seconds
  currentTime: number // Current elapsed time in seconds
  isActive: boolean
  size?: 'small' | 'medium' | 'large'
  theme?: 'breastfeeding' | 'bottle' | 'sleeping' | 'timer'
  drainRate?: number // Time in seconds for full drain (optional, defaults to duration)
}

export function AnimatedMilkBottleTimer({ 
  duration, 
  currentTime, 
  isActive, 
  size = 'medium',
  theme = 'breastfeeding',
  drainRate
}: AnimatedMilkBottleTimerProps) {
  
  // Calculate fill percentage (drains from 100% to 0% over drainDuration seconds, starting immediately)
  const drainDuration = drainRate || 60; // Default 1 minute
  const fillPercentage = Math.max(100 - (currentTime / drainDuration) * 100, 0);
  
  // Size configurations
  const sizeConfig = {
    small: { width: 120, height: 200 },
    medium: { width: 170, height: 280 },
    large: { width: 220, height: 360 }
  }
  
  const config = sizeConfig[size]
  
  // Theme-based colors
  const getThemeColors = () => {
    switch (theme) {
      case 'breastfeeding':
        return {
          primary: '#FFF8DC', // cream color
          secondary: '#F5DEB3', // wheat
          surface: '#FFFACD', // light cream highlight
          gradient: 'linear-gradient(180deg, #FFFACD 0%, #FFF8DC 30%, #F5DEB3 100%)'
        }
      case 'bottle':
        return {
          primary: '#E6F3FF', // light blue
          secondary: '#B3D9FF',
          surface: '#CCE7FF',
          gradient: 'linear-gradient(180deg, #CCE7FF 0%, #E6F3FF 30%, #B3D9FF 100%)'
        }
      case 'sleeping':
        return {
          primary: '#F3E8FF', // light purple
          secondary: '#D4C5F9',
          surface: '#E9D5FF',
          gradient: 'linear-gradient(180deg, #E9D5FF 0%, #F3E8FF 30%, #D4C5F9 100%)'
        }
      default:
        return {
          primary: '#FFF8DC',
          secondary: '#F5DEB3',
          surface: '#FFFACD',
          gradient: 'linear-gradient(180deg, #FFFACD 0%, #FFF8DC 30%, #F5DEB3 100%)'
        }
    }
  }

  const colors = getThemeColors()

  // Map fill percentage to the main body of the bottle only
  const bodyTopY = 50;
  const bodyBottomY = 264.63;
  const bodyHeight = bodyBottomY - bodyTopY;
  const liquidHeight = bodyHeight * (fillPercentage / 100);
  const liquidY = bodyBottomY - liquidHeight;

  // Wave animation for active state (removed unused variable)

  // Bottle SVG Paths Component
  const BottleSVGPaths = () => (
    <g id="bottle-structure">
      {/* Main bottle paths from babyBottle_vector.svg */}
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
      
      {/* Measurement lines and details */}
      <path className="fill-blue-600" d="M17.45,196.35h16.84c1.03,0,1.86.83,1.86,1.86s-.83,1.86-1.86,1.86h-16.84c-.67.01-1.43.06-2.08.17,0-1.72-.05-3.89,2.08-3.89,0,0-2.13,0,0,0Z"/>
      <line className="stroke-blue-500 stroke-[3.72px]" strokeLinecap="round" strokeLinejoin="round" x1="15.29" y1="144.09" x2="34.72" y2="144.09"/>
      <path className="fill-blue-700" d="M14.43,122.35h19.86c2.45.06,2.46,3.66,0,3.72-.46,0-22.12,0-21.72,0,0,0,0-3.72,0-3.72h1.86Z"/>
      <path className="fill-blue-800" d="M4.07,233.17h33.24c2.44.06,2.46,3.66,0,3.72,0,0-33.24,0-33.24,0h-1.86v-3.72h1.86Z"/>
      
      {/* Bottle outline paths */}
      <path className="stroke-black stroke-[2.71px] fill-none" strokeLinecap="round" strokeLinejoin="round" d="M23.92,93.66c-1.24-.56-1.93-1.49-2.42-2.58s-.21-2.04-.35-2.95c-.43-2.8-.44-20.1.69-21.72,3.06-4.37,7.25-3.76,12.02-4.06,21.45-1.37,64.01-2.2,84.88-.42,1.26.11,2.48.02,3.73.26,3.26.64,7.17,2.32,8.75,4.95.61,1.02.85,21.2.43,22.83-.83,3.21-3.45,4.64-7.02,5.36-.15.03-.3.05-.45.07-31.04-2.21-65.74,1.18-96.37-1.67-.88-.08-3.51.11-3.91-.07Z"/>
      <path className="stroke-black stroke-[2.71px] fill-none" strokeLinecap="round" strokeLinejoin="round" d="M33.91,61.26c.11-.73-.25-1.55-.23-2.21.64-15.04,20.84-11.57,27.28-22.46,4.72-7.98-3.41-12.63-3.19-19.88.36-11.73,15.5-19.24,27.45-13.25,5.05,2.53,8.54,6.35,9.5,11.41,1.46,7.74-6.85,12.41-3.71,20.25,5.16,12.88,29.05,8.19,27.91,25.77"/>
      {/* Main bottle container outline - PathMain */}
      <path className="stroke-black stroke-[2.71px] fill-none" strokeLinecap="round" strokeLinejoin="round" d="M27.93,96.26c-25.23,15.51-14.51,43.87-13.16,65.88.3,4.83.26,9.88.17,14.73-.03,1.49-.01,2.93-.09,4.42-.82,16.93-3.35,20.52-10.1,35.71-4.09,9.21-5.03,25.28.17,34.24,6,10.33,15.86,9.49,28.06,10.46,28.03,2.23,69.85,2.37,97.56-1.18,12.64-1.62,16.05-3.63,19.6-14.8,6.16-19.42-5.02-28.08-9.76-44.55-5.57-19.35-1.38-37.86,0-57.06,1.43-19.86,4.12-29.88-12.86-45.65-.11-.1-.23-.19-.35-.29-.93-.86-1.66-1.83-2.56-2.71"/>
    </g>
  )

  // Liquid ClipPath Component
  const LiquidClipPath = () => (
    <defs>
      <clipPath id="bottle-container">
        {/* PathMain from babyBottle_vector.svg - defines the exact bottle interior */}
        <path d="M27.93,96.26c-25.23,15.51-14.51,43.87-13.16,65.88.3,4.83.26,9.88.17,14.73-.03,1.49-.01,2.93-.09,4.42-.82,16.93-3.35,20.52-10.1,35.71-4.09,9.21-5.03,25.28.17,34.24,6,10.33,15.86,9.49,28.06,10.46,28.03,2.23,69.85,2.37,97.56-1.18,12.64-1.62,16.05-3.63,19.6-14.8,6.16-19.42-5.02-28.08-9.76-44.55-5.57-19.35-1.38-37.86,0-57.06,1.43-19.86,4.12-29.88-12.86-45.65-.11-.1-.23-.19-.35-.29-.93-.86-1.66-1.83-2.56-2.71"/>
      </clipPath>
      
      {/* Gradient definitions */}
      <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors.surface} />
        <stop offset="30%" stopColor={colors.primary} />
        <stop offset="100%" stopColor={colors.secondary} />
      </linearGradient>
      
      <linearGradient id="surfaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors.surface} stopOpacity="0.9" />
        <stop offset="50%" stopColor={colors.primary} stopOpacity="0.7" />
        <stop offset="100%" stopColor={colors.surface} stopOpacity="0.5" />
      </linearGradient>
    </defs>
  )

  // Animated Liquid Component
  const AnimatedLiquid = () => (
    <g clipPath="url(#bottle-container)">
      {/* Main liquid body */}
      <motion.rect
        x="0"
        y={liquidY}
        width="153.31"
        height={liquidHeight}
        fill="url(#liquidGradient)"
        initial={false}
        animate={{ 
          y: liquidY,
          height: liquidHeight 
        }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
      />
    </g>
  )

  // Bubble Effects Component
  const BubbleEffects = () => {
    if (!isActive || fillPercentage <= 10) return null
    
    const bubbles = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      cx: 50 + Math.random() * 53, // Random x position within bottle bounds
      initialCy: liquidY + liquidHeight * 0.8, // Adjusted to be more proportional
      targetCy: liquidY + liquidHeight * 0.2, // Adjusted to be more proportional
      r: 1 + Math.random() * 2, // Random bubble size
      delay: i * 0.8 // Stagger bubble animations
    }))

    return (
      <g clipPath="url(#bottle-container)">
        {bubbles.map(bubble => (
          <motion.circle
            key={bubble.id}
            cx={bubble.cx}
            r={bubble.r}
            fill={colors.surface}
            opacity={0.6}
            animate={{
              cy: [bubble.initialCy, bubble.targetCy, bubble.initialCy],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: bubble.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </g>
    )
  }

  return (
    <div className="relative flex items-center justify-center">
      <div 
        className="relative drop-shadow-lg"
        style={{ width: config.width, height: config.height }}
      >
        {/* Main SVG Container */}
        <svg
          viewBox="0 0 153.31 264.63"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <LiquidClipPath />
          <AnimatedLiquid />
          <BubbleEffects />
          <BottleSVGPaths />
        </svg>
        
        {/* Cute face when active */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center z-10"> {/* Lower z-index */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
              style={{ 
                marginTop: `${config.height * 0.15}px`,
                marginLeft: `${config.width * 0.02}px`
              }}
            >
              {/* Eyes */}
              <div className="flex gap-2 justify-center mb-1">
                <motion.div 
                  className="w-1 h-1 bg-gray-700 rounded-full"
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div 
                  className="w-1 h-1 bg-gray-700 rounded-full"
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.1 }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Floating hearts when timer is active */}
      {isActive && (
        <div className="absolute -top-2 -right-2 z-20"> {/* Lower z-index */}
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
      
      {/* Completion celebration */}
      {fillPercentage <= 0 && currentTime > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-30"> {/* Lower z-index */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="text-2xl"
          >
            ✨
          </motion.div>
        </div>
      )}
    </div>
  )
}