import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, formatTimeOfDay } from '../../utils/timeFormatting';

interface EnhancedDateTimeProps {
  date: Date;
  theme: 'breastfeeding' | 'bottle' | 'sleeping' | 'diaper';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const EnhancedDateTime = React.memo(({
  date,
  theme,
  size = 'medium',
  className = ''
}: EnhancedDateTimeProps) => {
  const themeStyles = {
    breastfeeding: {
      gradient: 'from-pink-50 to-pink-100',
      border: 'border-pink-200',
      iconColor: 'text-pink-600',
      textPrimary: 'text-pink-800',
      textSecondary: 'text-pink-600'
    },
    bottle: {
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      textPrimary: 'text-blue-800',
      textSecondary: 'text-blue-600'
    },
    sleeping: {
      gradient: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      iconColor: 'text-purple-600',
      textPrimary: 'text-purple-800',
      textSecondary: 'text-purple-600'
    },
    diaper: {
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      textPrimary: 'text-green-800',
      textSecondary: 'text-green-600'
    }
  };

  const sizeStyles = {
    small: {
      container: 'px-3 py-2',
      dateText: 'text-sm',
      timeText: 'text-xs',
      iconSize: 'w-3 h-3',
      gap: 'gap-2'
    },
    medium: {
      container: 'px-4 py-3',
      dateText: 'text-lg',
      timeText: 'text-sm',
      iconSize: 'w-4 h-4',
      gap: 'gap-3'
    },
    large: {
      container: 'px-6 py-4',
      dateText: 'text-xl',
      timeText: 'text-base',
      iconSize: 'w-5 h-5',
      gap: 'gap-4'
    }
  };

  const theme_styles = themeStyles[theme];
  const size_styles = sizeStyles[size];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -1 }}
      className={`
        bg-gradient-to-br ${theme_styles.gradient} 
        ${theme_styles.border} border-2
        rounded-2xl ${size_styles.container} 
        shadow-sm hover:shadow-lg 
        transition-all duration-300
        backdrop-blur-sm
        ${className}
      `}
    >
      <div className={`flex items-center justify-center ${size_styles.gap}`}>
        {/* Date Section */}
        <div className="flex items-center gap-2">
          <Calendar className={`${size_styles.iconSize} ${theme_styles.iconColor}`} />
          <div className={`font-semibold ${theme_styles.textPrimary} ${size_styles.dateText}`}>
            {formatDate(date)}
          </div>
        </div>

        {/* Separator */}
        <div className={`w-px h-6 bg-gradient-to-b ${theme_styles.border} opacity-60`} />

        {/* Time Section */}
        <div className="flex items-center gap-2">
          <Clock className={`${size_styles.iconSize} ${theme_styles.iconColor}`} />
          <div className={`font-mono font-medium ${theme_styles.textSecondary} ${size_styles.timeText}`}>
            {formatTimeOfDay(date)}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

EnhancedDateTime.displayName = 'EnhancedDateTime';