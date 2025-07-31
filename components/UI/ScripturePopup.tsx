import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Scripture } from '../../types';

interface ScripturePopupProps {
  scripture: Scripture | null;
  isVisible: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onNext: () => void;
  onToggleFavorite: (scriptureId: string) => void;
}

export function ScripturePopup({
  scripture,
  isVisible,
  isFavorite,
  onClose,
  onNext,
  onToggleFavorite
}: ScripturePopupProps) {
  if (!scripture) return null;

  const themeEmojis = {
    encouragement: '🌟',
    strength: '💪',
    peace: '🕊️',
    love: '💕',
    patience: '🌱'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {themeEmojis[scripture.theme]}
                </span>
                <h3 className="text-lg font-semibold text-gray-800">
                  Timer Complete!
                </h3>
              </div>
              
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close scripture popup"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Scripture Content */}
            <div className="text-center mb-8 space-y-6">
              {/* English Version */}
              <div>
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-gray-700 leading-relaxed font-medium mb-3 italic"
                >
                  "{scripture.verse}"
                </motion.blockquote>
                
                <motion.cite
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-semibold text-pink-600 not-italic"
                >
                  — {scripture.reference}
                </motion.cite>
              </div>


              {/* Chinese Version */}
              <div>
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-700 leading-relaxed font-medium mb-3"
                  style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Microsoft YaHei", sans-serif' }}
                >
                  "{scripture.verseChinese}"
                </motion.blockquote>
                
                <motion.cite
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm font-semibold text-blue-600 not-italic"
                  style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Microsoft YaHei", sans-serif' }}
                >
                  — {scripture.referenceChinese}
                </motion.cite>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleFavorite(scripture.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50
                  ${isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-300'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200 focus:ring-pink-300'
                  }
                `}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-5 h-5" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                <span className="text-sm">
                  {isFavorite ? 'Saved' : 'Save'}
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
                aria-label="Show next scripture"
              >
                <span className="text-sm">Next</span>
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 bg-pink-400 text-white rounded-lg font-medium hover:bg-pink-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:ring-opacity-50"
                aria-label="Close popup"
              >
                Close
              </motion.button>
            </div>
            
            {/* Theme indicator */}
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium capitalize">
                {scripture.theme}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}