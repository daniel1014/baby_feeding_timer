import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Milk } from 'lucide-react';
import AnimatedMilkBottleTimer from '../UI/AnimatedMilkBottleTimer';
import { DateTime } from '../UI/DateTime';
import { mlToOz, ozToMl } from '../../utils/conversions';
import { BOTTLE_PRESETS } from '../../types';

interface BottleTabProps {
  currentTime: Date | null;
  bottleAmount: string;
  setBottleAmount: (amount: string) => void;
  bottleUnit: 'ml' | 'oz';
  setBottleUnit: (unit: 'ml' | 'oz') => void;
  notes: string;
  setNotes: (notes: string) => void;
  onRecord: () => void;
  onTimeChange?: (newTime: Date) => void;
}

export const BottleTab = React.memo(({
  currentTime,
  bottleAmount,
  setBottleAmount,
  bottleUnit,
  setBottleUnit,
  notes,
  setNotes,
  onRecord,
  onTimeChange
}: BottleTabProps) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Date & Time Display */}
      <div className="flex justify-center mb-4">
        {currentTime && (
          <DateTime
            currentDateTime={currentTime}
            onDateTimeChange={onTimeChange}
            theme="bottle"
            editable={!!onTimeChange}
            size="medium"
          />
        )}
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Small Decorative Bottle */}
        <div className="flex justify-center mb-4">
          <AnimatedMilkBottleTimer
            mode="stopwatch"
            isRunning={false}
            size="small"
            theme="bottle"
          />
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBottleUnit('ml')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                bottleUnit === 'ml'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              ml
            </button>
            <button
              onClick={() => setBottleUnit('oz')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                bottleUnit === 'oz'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              oz
            </button>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Quick Select Amount
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {BOTTLE_PRESETS.map((preset) => {
              const displayValue = bottleUnit === 'ml' 
                ? preset.value 
                : Math.round(preset.value * 0.033814 * 10) / 10;
              const displayLabel = bottleUnit === 'ml' 
                ? `${preset.value}ml` 
                : `${displayValue}oz`;
              
              return (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBottleAmount(displayValue.toString())}
                  className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-xl font-medium transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                >
                  {displayLabel}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Custom Amount ({bottleUnit})
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder={`Enter amount in ${bottleUnit}...`}
              value={bottleAmount}
              onChange={(e) => setBottleAmount(e.target.value)}
              className="w-full p-3 text-center text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 bg-white shadow-sm transition-all duration-200"
              step="0.1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              {bottleUnit}
            </div>
          </div>
          {bottleAmount && (
            <div className="text-xs text-gray-500 mt-1 text-center">
              {bottleUnit === 'ml' 
                ? `≈ ${mlToOz(parseFloat(bottleAmount))}oz`
                : `≈ ${ozToMl(parseFloat(bottleAmount))}ml`
              }
            </div>
          )}
        </div>

        {/* Notes Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Notes (optional)
          </label>
          <textarea
            placeholder="Any notes about this feeding..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
            rows={3}
          />
        </div>

        {/* Record Button */}
        <motion.button
          whileHover={{ scale: bottleAmount ? 1.02 : 1 }}
          whileTap={{ scale: bottleAmount ? 0.98 : 1 }}
          onClick={onRecord}
          disabled={!bottleAmount}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 ${
            bottleAmount
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Milk className="w-5 h-5" />
          Record Bottle Feeding
        </motion.button>
      </div>
    </div>
  );
});

BottleTab.displayName = 'BottleTab';