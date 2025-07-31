"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedMilkBottleTimerProps {
  duration: number // Total time in seconds
  currentTime: number // Current elapsed time in seconds
  isActive: boolean
  size?: 'small' | 'medium' | 'large'
  theme?: 'breastfeeding' | 'bottle' | 'sleeping'
}

export function AnimatedMilkBottleTimer({ 
  duration, 
  currentTime, 
  isActive, 
  size = 'medium',
  theme = 'breastfeeding'
}: AnimatedMilkBottleTimerProps) {
  // Calculate fill percentage (0-100)
  const fillPercentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0
  
  // Size configurations
  const sizeConfig = {
    small: { width: 60, height: 100, strokeWidth: 2 },
    medium: { width: 80, height: 130, strokeWidth: 3 },
    large: { width: 100, height: 160, strokeWidth: 4 }
  }
  
  const config = sizeConfig[size]
  
  // Theme-based milk colors
  const getThemeColors = () => {
    switch (theme) {
      case 'breastfeeding':
        return {
          light: '#fdf2f8', // pink-50
          medium: '#fce7f3', // pink-100
          dark: '#f9a8d4', // pink-300
          full: '#ec4899' // pink-500
        }
      case 'bottle':
        return {
          light: '#eff6ff', // blue-50
          medium: '#dbeafe', // blue-100
          dark: '#93c5fd', // blue-300
          full: '#3b82f6' // blue-500
        }
      case 'sleeping':
        return {
          light: '#faf5ff', // purple-50
          medium: '#f3e8ff', // purple-100
          dark: '#c4b5fd', // purple-300
          full: '#8b5cf6' // purple-500
        }
      default:
        return {
          light: '#f8fafc',
          medium: '#f1f5f9',
          dark: '#e2e8f0',
          full: '#cbd5e1'
        }
    }
  }

  // Milk color that changes as it fills
  const getMilkColor = (percentage: number) => {
    const colors = getThemeColors()
    if (percentage < 25) return colors.light
    if (percentage < 50) return colors.medium
    if (percentage < 75) return colors.dark
    return colors.full
  }
  
  // Bubble animation variants
  const bubbleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: [0, 1, 0], 
      scale: [0, 1, 0.8],
      y: [-20, -60, -100],
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatDelay: Math.random() * 2
      }
    }
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="drop-shadow-lg"
      >
        {/* Bottle outline */}
        <defs>
          <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          
          <linearGradient id="milkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={getMilkColor(fillPercentage)} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          
          {/* Cute bottle shape path */}
          <path
            id="bottleShape"
            d={`M ${config.width * 0.3} 10 L ${config.width * 0.7} 10 L ${config.width * 0.7} 25 L ${config.width * 0.8} 25 L ${config.width * 0.8} ${config.height - 15} Q ${config.width * 0.8} ${config.height - 5} ${config.width * 0.7} ${config.height - 5} L ${config.width * 0.3} ${config.height - 5} Q ${config.width * 0.2} ${config.height - 5} ${config.width * 0.2} ${config.height - 15} L ${config.width * 0.2} 25 L ${config.width * 0.3} 25 Z`}
          />
        </defs>
        
        {/* Bottle background */}
        <use
          href="#bottleShape"
          fill="url(#bottleGradient)"
          stroke="#e2e8f0"
          strokeWidth={config.strokeWidth}
          opacity="0.9"
        />
        
        {/* Milk fill with animated height */}
        <motion.rect
          x={config.width * 0.25}
          y={config.height - 10 - (fillPercentage / 100) * (config.height - 35)}
          width={config.width * 0.5}
          height={(fillPercentage / 100) * (config.height - 35)}
          fill="url(#milkGradient)"
          rx="5"
          initial={{ height: 0 }}
          animate={{ 
            height: (fillPercentage / 100) * (config.height - 35),
            y: config.height - 10 - (fillPercentage / 100) * (config.height - 35)
          }}
          transition={{ 
            duration: isActive ? 0.5 : 1, 
            ease: "easeInOut" 
          }}
        />
        
        {/* Milk surface with gentle wave animation */}
        {fillPercentage > 0 && (
          <motion.ellipse
            cx={config.width * 0.5}
            cy={config.height - 10 - (fillPercentage / 100) * (config.height - 35)}
            rx={config.width * 0.22}
            ry="3"
            fill="#ffffff"
            opacity="0.8"
            animate={{
              ry: isActive ? [3, 4, 3] : 3,
              opacity: isActive ? [0.8, 0.6, 0.8] : 0.8
            }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Bottle cap */}
        <rect
          x={config.width * 0.35}
          y="5"
          width={config.width * 0.3}
          height="10"
          fill="#94a3b8"
          rx="2"
        />
        
        {/* Nipple */}
        <ellipse
          cx={config.width * 0.5}
          cy="10"
          rx="4"
          ry="6"
          fill="#f1f5f9"
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        
        {/* Measurement marks */}
        {[25, 50, 75].map((mark, index) => (
          <g key={mark}>
            <line
              x1={config.width * 0.85}
              y1={config.height - 10 - (mark / 100) * (config.height - 35)}
              x2={config.width * 0.9}
              y2={config.height - 10 - (mark / 100) * (config.height - 35)}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <text
              x={config.width * 0.95}
              y={config.height - 10 - (mark / 100) * (config.height - 35) + 2}
              fontSize="8"
              fill="#64748b"
              textAnchor="start"
            >
              {mark}%
            </text>
          </g>
        ))}
        
        {/* Animated bubbles when active */}
        {isActive && fillPercentage > 10 && (
          <>
            {[1, 2, 3].map((bubble) => (
              <motion.circle
                key={bubble}
                cx={config.width * (0.3 + Math.random() * 0.4)}
                cy={config.height - 15 - (fillPercentage / 100) * (config.height - 35) + 10}
                r="2"
                fill="#ffffff"
                opacity="0.7"
                variants={bubbleVariants}
                initial="hidden"
                animate="visible"
                style={{
                  animationDelay: `${bubble * 0.5}s`
                }}
              />
            ))}
          </>
        )}
        
        {/* Cute face when active */}
        {isActive && (
          <g opacity="0.8">
            {/* Eyes */}
            <motion.circle
              cx={config.width * 0.42}
              cy={config.height * 0.4}
              r="2"
              fill="#64748b"
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx={config.width * 0.58}
              cy={config.height * 0.4}
              r="2"
              fill="#64748b"
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
            
            {/* Smile */}
            <motion.path
              d={`M ${config.width * 0.45} ${config.height * 0.5} Q ${config.width * 0.5} ${config.height * 0.55} ${config.width * 0.55} ${config.height * 0.5}`}
              stroke="#64748b"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </g>
        )}
      </svg>
      
      {/* Floating hearts when timer is active */}
      {isActive && (
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
      
      {/* Completion celebration */}
      {fillPercentage >= 100 && (
        <div className="absolute inset-0 flex items-center justify-center">
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