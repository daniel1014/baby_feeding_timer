import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Baby } from 'lucide-react';
import { DateTime } from '../UI/DateTime';
import { DiaperAmount, DiaperColor, DiaperTexture, DiaperMood, DiaperRecordInput } from '../../types';

interface DiaperTabProps {
  currentTime: Date | null;
  onRecord: (input: DiaperRecordInput) => void;
}

const AMOUNTS: DiaperAmount[] = ['None', 'Light', 'Medium', 'Heavy'];
const COLORS: DiaperColor[] = ['None', 'Black', 'Bloody', 'Brown', 'Dark Brown', 'Green', 'White', 'Yellow', 'Yellow with Seeds'];
const TEXTURES: DiaperTexture[] = ['None', 'Diarrhea', 'Hard', 'Normal', 'Soft', 'Very Hard', 'Very Soft'];

export const DiaperTab: React.FC<DiaperTabProps> = ({ currentTime, onRecord }) => {
  const [date, setDate] = useState<Date>(currentTime ?? new Date());
  const [diaperType, setDiaperType] = useState<'Wet' | 'Dirty' | 'Wet & Dirty' | 'Dry'>('Wet');
  const [amount, setAmount] = useState<DiaperAmount>('None');
  const [color, setColor] = useState<DiaperColor>('None');
  const [texture, setTexture] = useState<DiaperTexture>('None');
  const [mood, setMood] = useState<DiaperMood>('happy');
  const [openAirAccident, setOpenAirAccident] = useState(false);
  const [diaperLeak, setDiaperLeak] = useState(false);
  const [notes, setNotes] = useState('');

  const handleDateTimeChange = (newDateTime: Date) => {
    setDate(newDateTime);
  };

  const record = () => {
    onRecord({
      dateTime: date,
      diaperType,
      amount,
      color,
      texture,
      mood,
      openAirAccident,
      diaperLeak,
      notes: notes || undefined,
    });
    // Reset minimal fields similar UX to screenshot: keep selections, clear toggles/notes
    setOpenAirAccident(false);
    setDiaperLeak(false);
    setNotes('');
  };

  const MoodIcon: React.FC<{ value: DiaperMood; label: string }> = ({ value, label }) => (
    <button
      onClick={() => setMood(value)}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
        mood === value ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-500 hover:border-rose-200'
      }`}
      aria-label={label}
    >
      <span className="text-xl">
        {value === 'very_happy' && '😄'}
        {value === 'happy' && '🙂'}
        {value === 'neutral' && '😐'}
        {value === 'sad' && '☹️'}
        {value === 'crying' && '😭'}
      </span>
    </button>
  );

  const Select: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Date & Time Display */}
      <div className="flex justify-center mb-4">
        <DateTime
          currentDateTime={date}
          onDateTimeChange={handleDateTimeChange}
          theme="diaper"
          editable={true}
          size="medium"
        />
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Diaper Type */}
        <div className="grid grid-cols-2 gap-3">
          {(['Wet', 'Dirty', 'Wet & Dirty', 'Dry'] as const).map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDiaperType(t)}
              className={`p-4 rounded-xl border text-center font-medium transition-all ${
                diaperType === t ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-700 hover:border-rose-200'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>

        {/* Amount / Color / Texture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select label="Amount" value={amount} onChange={(v) => setAmount(v as DiaperAmount)} options={AMOUNTS} />
          <Select label="Color" value={color} onChange={(v) => setColor(v as DiaperColor)} options={COLORS} />
          <Select label="Texture" value={texture} onChange={(v) => setTexture(v as DiaperTexture)} options={TEXTURES} />
        </div>

        {/* Mood */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Mood</label>
          <div className="grid grid-cols-5 gap-2">
            <MoodIcon value="very_happy" label="Very Happy" />
            <MoodIcon value="happy" label="Happy" />
            <MoodIcon value="neutral" label="Neutral" />
            <MoodIcon value="sad" label="Sad" />
            <MoodIcon value="crying" label="Crying" />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={openAirAccident} onChange={(e) => setOpenAirAccident(e.target.checked)} />
            <span className="text-gray-700">Open Air Accident</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" checked={diaperLeak} onChange={(e) => setDiaperLeak(e.target.checked)} />
            <span className="text-gray-700">Diaper Leak</span>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (optional)</label>
          <textarea
            placeholder="Any notes about this diaper change..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white shadow-sm transition-all"
            rows={3}
          />
        </div>

        {/* Save */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={record}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-lg bg-gradient-to-r from-rose-400 to-pink-500 text-white"
        >
          <Baby className="w-5 h-5" /> Save
        </motion.button>
      </div>
    </div>
  );
};

export default DiaperTab;


