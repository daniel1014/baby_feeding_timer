import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Baby, Milk, Moon } from 'lucide-react';
import { FeedingSession, SessionType, TAB_THEMES } from '../../types';
import { formatDate, formatTimeFromSeconds } from '../../utils/timeFormatting';
import { ozToMl } from '../../utils/conversions';

interface SessionHistoryProps {
  sessions: FeedingSession[];
}

export const SessionHistory = React.memo(({ sessions }: SessionHistoryProps) => {
  if (sessions.length === 0) {
    return null;
  }

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

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        Recent History
      </h3>
      <div className="space-y-2.5 sm:space-y-3">
        {sessions.slice(0, 5).map((session, index) => {
          const theme = TAB_THEMES[session.type as SessionType];
          
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${theme.secondary}`}>
                  {getSessionIcon(session.type as SessionType)}
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {getSessionTitle(session.type as SessionType)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(session.startTime)} • {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {session.endTime && session.startTime.toDateString() !== session.endTime.toDateString() && (
                      <span> - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {session.duration && (
                  <div className="font-mono text-sm font-medium text-gray-600">
                    {formatTimeFromSeconds(session.duration)}
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
                {session.type === 'diaper' && (
                  <div className="text-xs text-gray-600">
                    {(session as any).diaperType}
                    {((session as any).amount && (session as any).amount !== 'None') && ` • ${(session as any).amount}`}
                    {((session as any).color && (session as any).color !== 'None') && ` • ${(session as any).color}`}
                    {((session as any).texture && (session as any).texture !== 'None') && ` • ${(session as any).texture}`}
                    {((session as any).openAirAccident || (session as any).diaperLeak) && (
                      <span> • {[(session as any).openAirAccident ? 'Open Air Accident' : null, (session as any).diaperLeak ? 'Leak' : null].filter(Boolean).join(' & ')}</span>
                    )}
                  </div>
                )}
                {session.notes && (
                  <div className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                    📝 {session.notes}
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
