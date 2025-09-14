import React from 'react';
import { motion } from 'framer-motion';
import { Baby, Milk } from 'lucide-react';
import { MilkBottleSticker } from '../UI/MilkBottleSticker';
import { UserMenu } from '../auth/user-menu';

interface PageHeaderProps {
  isClient: boolean;
}

export const PageHeader = React.memo(({ isClient }: PageHeaderProps) => {
  return (
    <>
      {/* Animated Background Particles - Client-side only to prevent hydration mismatch */}
      {isClient && (
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-20"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <MilkBottleSticker size="small" animate={false} />
            </motion.div>
          ))}
        </div>
      )}

      {/* User Menu */}
      <div className="relative z-20 flex justify-end p-1 sm:p-0">
        <UserMenu />
      </div>

      {/* Header */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="text-center mb-2 sm:mb-1"
      >
        <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-2 bg-white rounded-full shadow-lg">
            <Baby className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
          </div>
          <h1 className="text-2xl sm:text-4xl leading-tight sm:leading-none font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Baby Feeding Tracker
          </h1>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-2 sm:p-3 bg-white rounded-full shadow-lg"
          >
            <Milk className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </motion.div>
        </div>
        <p className="text-gray-600 font-medium text-sm sm:text-base mt-1 sm:mt-0">Track your little one's feeding sessions with love 💕</p>
      </motion.div>
    </>
  );
});

PageHeader.displayName = 'PageHeader';
