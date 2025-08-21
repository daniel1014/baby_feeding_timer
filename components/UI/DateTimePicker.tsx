import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
  initialDateTime: Date;
  onSave: (dateTime: Date) => void;
  onCancel: () => void;
  isOpen: boolean;
  theme: 'breastfeeding' | 'bottle' | 'sleeping' | 'diaper';
}

export const DateTimePicker = React.memo(({
  initialDateTime,
  onSave,
  onCancel,
  isOpen,
  theme
}: DateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Theme styles
  const themeStyles = {
    breastfeeding: {
      primary: 'bg-pink-500 hover:bg-pink-600',
      secondary: 'border-pink-300 focus:border-pink-500 focus:ring-pink-200',
      text: 'text-pink-700'
    },
    bottle: {
      primary: 'bg-blue-500 hover:bg-blue-600',
      secondary: 'border-blue-300 focus:border-blue-500 focus:ring-blue-200',
      text: 'text-blue-700'
    },
    sleeping: {
      primary: 'bg-purple-500 hover:bg-purple-600',
      secondary: 'border-purple-300 focus:border-purple-500 focus:ring-purple-200',
      text: 'text-purple-700'
    },
    diaper: {
      primary: 'bg-green-500 hover:bg-green-600',
      secondary: 'border-green-300 focus:border-green-500 focus:ring-green-200',
      text: 'text-green-700'
    }
  };

  const theme_styles = themeStyles[theme];

  // Initialize date and time strings when modal opens
  useEffect(() => {
    if (isOpen && initialDateTime) {
      // Format date as YYYY-MM-DD for input
      const dateStr = initialDateTime.toISOString().split('T')[0];
      setSelectedDate(dateStr);
      
      // Format time as HH:mm for input
      const timeStr = initialDateTime.toTimeString().slice(0, 5);
      setSelectedTime(timeStr);
    }
  }, [isOpen, initialDateTime]);

  const handleSave = () => {
    if (selectedDate && selectedTime) {
      // Combine date and time strings into a Date object
      const combinedDateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      // Validate that the date is not in the future
      const now = new Date();
      if (combinedDateTime > now) {
        alert('Cannot set a future date and time');
        return;
      }
      
      onSave(combinedDateTime);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && selectedDate && selectedTime) {
      handleSave();
    }
  };

  const isValid = selectedDate && selectedTime;
  const maxDate = new Date().toISOString().split('T')[0]; // Today's date

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 background-transparent flex items-center justify-center z-50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${theme_styles.text}`}>
                Edit Date & Time
              </h3>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Date Input */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${theme_styles.text} mb-2`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={maxDate}
                className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${theme_styles.secondary} focus:ring-2 focus:outline-none`}
                autoFocus
              />
            </div>

            {/* Time Input */}
            <div className="mb-6">
              <label className={`block text-sm font-medium ${theme_styles.text} mb-2`}>
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${theme_styles.secondary} focus:ring-2 focus:outline-none`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: isValid ? 1.02 : 1 }}
                whileTap={{ scale: isValid ? 0.98 : 1 }}
                onClick={handleSave}
                disabled={!isValid}
                className={`px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  isValid 
                    ? `${theme_styles.primary} shadow-lg hover:shadow-xl transform hover:-translate-y-0.5` 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save
              </motion.button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Escape to cancel or Enter to save
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

DateTimePicker.displayName = 'DateTimePicker';