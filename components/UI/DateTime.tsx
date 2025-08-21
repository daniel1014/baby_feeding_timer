import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';
import { EnhancedDateTime } from './EnhancedDateTime';
import { DateTimePicker } from './DateTimePicker';

interface DateTimeProps {
  currentDateTime: Date;
  onDateTimeChange?: (newDateTime: Date) => void;
  theme: 'breastfeeding' | 'bottle' | 'sleeping' | 'diaper';
  editable?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const DateTime = React.memo(({
  currentDateTime,
  onDateTimeChange,
  theme,
  editable = true,
  size = 'medium',
  className = ''
}: DateTimeProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleDateTimeChange = (newDateTime: Date) => {
    onDateTimeChange?.(newDateTime);
    setIsPickerOpen(false);
  };

  const handleEditClick = () => {
    if (editable && onDateTimeChange) {
      setIsPickerOpen(true);
    }
  };

  const themeStyles = {
    breastfeeding: {
      editButton: 'hover:bg-pink-100 text-pink-600 hover:text-pink-700'
    },
    bottle: {
      editButton: 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
    },
    sleeping: {
      editButton: 'hover:bg-purple-100 text-purple-600 hover:text-purple-700'
    },
    diaper: {
      editButton: 'hover:bg-green-100 text-green-600 hover:text-green-700'
    }
  };

  const theme_styles = themeStyles[theme];

  return (
    <div className={`relative ${className}`}>
      {/* Date Time Display Container */}
      <div className="flex items-center gap-2">
        <EnhancedDateTime
          date={currentDateTime}
          theme={theme}
          size={size}
        />

        {/* Edit Button */}
        {editable && onDateTimeChange && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEditClick}
            className={`
              p-2 rounded-full transition-all duration-200 
              ${theme_styles.editButton}
              opacity-70 hover:opacity-100
              shadow-sm hover:shadow-md
            `}
            title="Edit date and time"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Date Time Picker Modal */}
      <DateTimePicker
        initialDateTime={currentDateTime}
        onSave={handleDateTimeChange}
        onCancel={() => setIsPickerOpen(false)}
        isOpen={isPickerOpen}
        theme={theme}
      />
    </div>
  );
});

DateTime.displayName = 'DateTime';