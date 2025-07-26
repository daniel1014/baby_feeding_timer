import React from 'react';
import { motion } from 'framer-motion';

interface MilkBottleStickerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  animate?: boolean;
}

export function MilkBottleSticker({ 
  size = 'medium', 
  className = '', 
  animate = true 
}: MilkBottleStickerProps) {
  const sizeMap = {
    small: 'w-6 h-8',
    medium: 'w-8 h-10',
    large: 'w-12 h-16'
  };

  const bottleVariants = {
    idle: {
      y: 0,
      rotate: 0,
      scale: 1,
    },
    float: {
      y: [-2, 2, -2],
      rotate: [-1, 1, -1],
      scale: [1, 1.02, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      className={`${sizeMap[size]} ${className}`}
      variants={bottleVariants}
      initial="idle"
      animate={animate ? "float" : "idle"}
      whileHover="hover"
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Bottle body */}
        <path
          d="M25 35 L25 95 Q25 105 35 105 L65 105 Q75 105 75 95 L75 35 Z"
          fill="url(#bottleGradient)"
          stroke="rgb(255, 182, 193)"
          strokeWidth="2"
        />
        
        {/* Bottle neck */}
        <rect
          x="40"
          y="20"
          width="20"
          height="15"
          fill="url(#neckGradient)"
          stroke="rgb(255, 182, 193)"
          strokeWidth="1.5"
          rx="2"
        />
        
        {/* Bottle cap/nipple */}
        <ellipse
          cx="50"
          cy="15"
          rx="12"
          ry="8"
          fill="url(#capGradient)"
          stroke="rgb(240, 230, 140)"
          strokeWidth="1.5"
        />
        
        {/* Milk level */}
        <path
          d="M30 40 L30 85 Q30 95 40 95 L60 95 Q70 95 70 85 L70 40 Z"
          fill="url(#milkGradient)"
          opacity="0.9"
        />
        
        {/* Measurement lines */}
        <g stroke="rgb(255, 182, 193)" strokeWidth="1" opacity="0.6">
          <line x1="20" y1="50" x2="25" y2="50" />
          <line x1="20" y1="65" x2="25" y2="65" />
          <line x1="20" y1="80" x2="25" y2="80" />
        </g>
        
        {/* Cute highlight */}
        <ellipse
          cx="40"
          cy="55"
          rx="8"
          ry="12"
          fill="url(#highlightGradient)"
          opacity="0.4"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 255, 255)" />
            <stop offset="100%" stopColor="rgb(255, 240, 245)" />
          </linearGradient>
          
          <linearGradient id="neckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 255, 255)" />
            <stop offset="100%" stopColor="rgb(255, 245, 250)" />
          </linearGradient>
          
          <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(250, 240, 190)" />
            <stop offset="100%" stopColor="rgb(240, 230, 140)" />
          </linearGradient>
          
          <linearGradient id="milkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 255, 255)" />
            <stop offset="100%" stopColor="rgb(255, 250, 240)" />
          </linearGradient>
          
          <radialGradient id="highlightGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="rgb(255, 255, 255)" />
            <stop offset="100%" stopColor="rgb(255, 255, 255)" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// Decorative component with multiple bottles
export function MilkBottleDecorations() {
  return (
    <>
      {/* Top left */}
      <div className="absolute top-8 left-8 opacity-60">
        <MilkBottleSticker size="small" />
      </div>
      
      {/* Top right */}
      <div className="absolute top-12 right-12 opacity-70">
        <MilkBottleSticker size="medium" />
      </div>
      
      {/* Bottom left */}
      <div className="absolute bottom-16 left-6 opacity-50">
        <MilkBottleSticker size="medium" />
      </div>
      
      {/* Bottom right */}
      <div className="absolute bottom-20 right-8 opacity-60">
        <MilkBottleSticker size="small" />
      </div>
      
      {/* Mobile-friendly decorations */}
      <div className="sm:hidden absolute top-4 right-4 opacity-40">
        <MilkBottleSticker size="small" />
      </div>
      
      <div className="sm:hidden absolute bottom-4 left-4 opacity-40">
        <MilkBottleSticker size="small" />
      </div>
    </>
  );
}