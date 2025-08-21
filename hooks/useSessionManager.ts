import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FeedingSession, 
  BreastfeedingSession, 
  BottleFeedingSession, 
  SleepingSession 
} from '../types';
import { formatTime } from '../utils/timeFormatting';
import { mlToOz } from '../utils/conversions';
import { playNotificationSound, triggerHapticFeedback, showBrowserNotification } from '../utils/soundNotification';

export interface UseSessionManagerReturn {
  sessions: FeedingSession[];
  completeBreastfeeding: (timerTimeMs: number, notes?: string) => void;
  recordBottleFeeding: (amount: string, unit: 'ml' | 'oz', notes?: string) => void;
  completeSleeping: (timerTimeMs: number, notes?: string) => void;
}

export function useSessionManager(): UseSessionManagerReturn {
  const [sessions, setSessions] = useState<FeedingSession[]>([]);

  const completeBreastfeeding = useCallback((timerTimeMs: number, notes?: string) => {
    if (timerTimeMs === 0) return;
    
    const now = new Date();
    const durationSeconds = Math.floor(timerTimeMs / 1000);
    const startTime = new Date(now.getTime() - timerTimeMs);
    
    const session: BreastfeedingSession = {
      id: Date.now().toString(),
      type: 'breastfeeding',
      startTime,
      endTime: now,
      date: startTime.toISOString().split('T')[0],
      duration: durationSeconds,
      notes: notes || undefined,
    };
    
    setSessions(prev => [session, ...prev]);
    
    // Trigger completion effects
    playNotificationSound();
    triggerHapticFeedback();
    showBrowserNotification(
      'Breastfeeding Session Complete! 🤱',
      `Session lasted ${formatTime(timerTimeMs)}. Great job!`
    );
    
    toast.success(`Breastfeeding session completed! ${formatTime(timerTimeMs)} 🎉`, {
      duration: 3000,
      position: 'top-center',
    });
  }, []);

  const recordBottleFeeding = useCallback((amount: string, unit: 'ml' | 'oz', notes?: string) => {
    if (!amount) return;
    
    const now = new Date();
    const session: BottleFeedingSession = {
      id: Date.now().toString(),
      type: 'bottle',
      startTime: now,
      endTime: now,
      date: now.toISOString().split('T')[0],
      amount: parseFloat(amount),
      unit,
      notes: notes || undefined,
    };
    
    setSessions(prev => [session, ...prev]);
    
    const displayAmount = unit === 'ml' 
      ? `${amount}ml` 
      : `${amount}oz (${mlToOz(parseFloat(amount))}ml)`;
    
    toast.success(`Bottle Feeding recorded: ${displayAmount} 🍼`, {
      duration: 3000,
      position: 'top-center',
    });
  }, []);

  const completeSleeping = useCallback((timerTimeMs: number, notes?: string) => {
    if (timerTimeMs === 0) return;
    
    const now = new Date();
    const durationSeconds = Math.floor(timerTimeMs / 1000);
    const startTime = new Date(now.getTime() - timerTimeMs);
    
    const session: SleepingSession = {
      id: Date.now().toString(),
      type: 'sleeping',
      startTime,
      endTime: now,
      date: startTime.toISOString().split('T')[0],
      duration: durationSeconds,
      notes: notes || undefined,
    };
    
    setSessions(prev => [session, ...prev]);
    
    // Trigger completion effects
    playNotificationSound();
    triggerHapticFeedback();
    showBrowserNotification(
      'Sleep Session Complete! 😴',
      `Baby slept for ${formatTime(timerTimeMs)}. Sweet dreams!`
    );
    
    toast.success(`Sleep session completed! ${formatTime(timerTimeMs)} 😴`, {
      duration: 3000,
      position: 'top-center',
    });
  }, []);

  return {
    sessions,
    completeBreastfeeding,
    recordBottleFeeding,
    completeSleeping
  };
}