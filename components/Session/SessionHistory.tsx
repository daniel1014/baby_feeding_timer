"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Baby, Milk, Moon } from 'lucide-react';
import { FeedingSession, SessionType, TAB_THEMES } from '../../types';
import { formatDate, formatTimeFromSeconds, formatDurationHuman } from '../../utils/timeFormatting';
import { ozToMl } from '../../utils/conversions';

interface SessionHistoryProps {
  sessions: FeedingSession[];
  activeTab: SessionType;
  onDeleteSessions?: (ids: string[]) => void;
}

export const SessionHistory = React.memo(({ sessions, activeTab, onDeleteSessions }: SessionHistoryProps) => {
  // Date range filter state
  type Range = '24h' | '3d' | '7d' | '30d' | 'all';
  const [range, setRange] = useState<Range>('24h');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    if (onDeleteSessions && selected.size > 0) {
      onDeleteSessions(Array.from(selected));
      setSelected(new Set());
      setSelectionMode(false);
    }
  };

  const filteredSessions = useMemo(() => {
    const byTab = sessions.filter(s => s.type === activeTab);
    if (range === 'all') return byTab;
    const now = new Date().getTime();
    const msMap: Record<Exclude<Range, 'all'>, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - msMap[range as Exclude<Range, 'all'>];
    return byTab.filter(s => s.startTime.getTime() >= cutoff);
  }, [sessions, activeTab, range]);
  
  if (filteredSessions.length === 0) {
    const tabNames = {
      breastfeeding: 'Breastfeeding',
      bottle: 'Bottle Feeding', 
      sleeping: 'Sleeping',
      diaper: 'Diaper'
    };
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            Recent {tabNames[activeTab]} History
          </h3>
          <div className="ml-auto">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="text-xs sm:text-sm px-2 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="24h">Last 24 hours</option>
              <option value="3d">Last 3 days</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">{TAB_THEMES[activeTab].icon}</div>
          <p>No {tabNames[activeTab].toLowerCase()} sessions in selected range</p>
          <p className="text-sm mt-1">Start tracking to see your history here</p>
        </div>
      </div>
    );
  }

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'very_happy':
        return '😄';
      case 'happy':
        return '🙂';
      case 'neutral':
        return '😐';
      case 'sad':
        return '☹️';
      case 'crying':
        return '😢';
      default:
        return '📝';
    }
  };

  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case 'breastfeeding':
        return <Baby className="w-4 h-4" />;
      case 'bottle':
        return <Milk className="w-4 h-4" />;
      case 'sleeping':
        return <Moon className="w-4 h-4" />;
      case 'diaper':
        return <Baby className="w-4 h-4" />;
      default:
        return <Baby className="w-4 h-4" />;
    }
  };

  const getSessionTitle = (type: SessionType) => {
    switch (type) {
      case 'breastfeeding':
        return 'Breastfeeding';
      case 'bottle':
        return 'Bottle Feeding';
      case 'sleeping':
        return 'Sleeping';
      case 'diaper':
        return 'Diaper';
      default:
        return 'Session';
    }
  };

  const tabNames = {
    breastfeeding: 'Breastfeeding',
    bottle: 'Bottle Feeding', 
    sleeping: 'Sleeping',
    diaper: 'Diaper'
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          Recent {tabNames[activeTab]} History
        </h3>
        <div className="ml-auto flex items-center gap-2">
          {selectionMode && (
            <button
              onClick={handleDelete}
              className="text-xs sm:text-sm px-2 py-1.5 bg-red-500 text-white rounded-full shadow-sm"
            >
              Delete
            </button>
          )}
          {selectionMode && (
            <button
              onClick={() => { setSelectionMode(false); setSelected(new Set()); }}
              className="text-xs sm:text-sm px-2 py-1.5 bg-gray-100 text-gray-700 rounded-full shadow-sm"
            >
              Cancel
            </button>
          )}
          {!selectionMode && (
            <button
              onClick={() => setSelectionMode(true)}
              className="text-xs sm:text-sm px-2 py-1.5 bg-gray-100 text-gray-700 rounded-full shadow-sm"
            >
              Select
            </button>
          )}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="text-xs sm:text-sm px-2 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="24h">Last 24 hours</option>
            <option value="3d">Last 3 days</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
      <div className="space-y-2.5 sm:space-y-3">
        {filteredSessions.map((session, index) => {
          const theme = TAB_THEMES[session.type as SessionType];
          
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100 ${selectionMode && selected.has(session.id) ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="flex items-center gap-3 w-0 flex-1 min-w-0">
                {selectionMode && (
                  <input
                    type="checkbox"
                    checked={selected.has(session.id)}
                    onChange={() => toggleSelect(session.id)}
                    className="w-4 h-4 flex-shrink-0"
                  />
                )}
                <div className={`p-2 rounded-full ${theme.secondary}`}>
                  {getSessionIcon(session.type as SessionType)}
                </div>
                <div className="min-w-0">
                  {/* <div className="font-medium text-gray-800 leading-5">
                    {getSessionTitle(session.type as SessionType)}
                  </div> */}
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formatDate(session.startTime)} • {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {session.endTime && session.startTime.toDateString() !== session.endTime.toDateString() && (
                      <span> - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                  {/* Notes for non-diaper sessions under datetime */}
                  {session.type !== 'diaper' && session.notes && (
                    <div className="mt-1 text-[11px] sm:text-xs text-gray-600 inline-flex items-center gap-1 min-w-0 truncate">
                      <span>📝</span>
                      <span className="truncate">{session.notes}</span>
                    </div>
                  )}
                  {session.type === 'diaper' && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0 text-[11px] sm:text-xs text-gray-600 leading-4">
                      {(() => {
                        const s: any = session;
                        const parts: string[] = [];
                        if (s.diaperType) parts.push(String(s.diaperType));
                        if (s.amount && s.amount !== 'None') parts.push(String(s.amount));
                        if (s.color && s.color !== 'None') parts.push(String(s.color));
                        if (s.texture && s.texture !== 'None') parts.push(String(s.texture));
                        if (s.openAirAccident || s.diaperLeak) {
                          const issues = [s.openAirAccident ? 'Open Air Accident' : null, s.diaperLeak ? 'Leak' : null].filter(Boolean).join(' & ');
                          parts.push(issues);
                        }
                        return parts.map((txt: string, i: number) => (
                          <span key={i} className="truncate">
                            {i > 0 && <span className="mx-1 opacity-60">|</span>}
                            {txt}
                          </span>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                {session.duration && (
                  <div className="text-[11px] sm:text-sm font-medium text-gray-700">
                    {(session.type === 'breastfeeding' || session.type === 'sleeping')
                      ? formatDurationHuman(session.duration)
                      : formatTimeFromSeconds(session.duration)
                    }
                  </div>
                )}
                {session.type === 'bottle' && 'amount' in session && (
                  <div className="font-mono text-sm font-medium text-gray-600">
                    {session.amount}{session.unit}
                    {session.unit === 'oz' && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({ozToMl(session.amount)}ml)
                      </span>
                    )}
                  </div>
                )}
                {session.type === 'diaper' && session.notes && (
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-1 max-w-40 sm:max-w-48 truncate inline-flex items-center gap-1">
                    <span>{getMoodEmoji((session as any).mood)}</span>
                    <span className="truncate">{session.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

SessionHistory.displayName = 'SessionHistory';
