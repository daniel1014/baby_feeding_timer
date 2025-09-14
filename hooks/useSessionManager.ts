import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FeedingSession, 
  BreastfeedingSession, 
  BottleFeedingSession, 
  SleepingSession,
  DiaperSession,
  DiaperRecordInput
} from '../types';
import { formatTime } from '../utils/timeFormatting';
import { mlToOz } from '../utils/conversions';
import { playNotificationSound, triggerHapticFeedback, showBrowserNotification } from '../utils/soundNotification';
import { getBasePathClient, prefixPath } from '@/utils/basePath';

export interface UseSessionManagerReturn {
  sessions: FeedingSession[];
  loading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  completeBreastfeeding: (timerTimeMs: number, notes?: string) => void;
  recordBottleFeeding: (amount: string, unit: 'ml' | 'oz', notes?: string) => void;
  completeSleeping: (timerTimeMs: number, notes?: string) => void;
  recordDiaperChange: (input: DiaperRecordInput) => void;
}

export function useSessionManager(): UseSessionManagerReturn {
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const basePath = getBasePathClient();
  const refreshingRef = useRef(false);

  const mapApiToSession = useCallback((row: any): FeedingSession | null => {
    if (!row) return null;
    const type = row.sessiontype as 'breastfeeding' | 'bottle' | 'sleeping' | 'diaper';
    const base = {
      id: String(row.id),
      startTime: new Date(row.starttime),
      endTime: row.endtime ? new Date(row.endtime) : undefined,
      date: row.date,
      duration: row.duration ?? undefined,
      notes: row.notes ?? undefined,
    };

    switch (type) {
      case 'breastfeeding': {
        const s: BreastfeedingSession = {
          ...base,
          type: 'breastfeeding',
          side: row.side ?? undefined,
        };
        return s;
      }
      case 'bottle': {
        const amount = row.amount != null ? parseFloat(String(row.amount)) : undefined;
        if (amount == null || !row.unit) return null; // defensive
        const s: BottleFeedingSession = {
          ...base,
          type: 'bottle',
          amount,
          unit: row.unit as 'ml' | 'oz',
        };
        // Bottle entries should not have duration; ensure it's undefined locally
        delete (s as any).duration;
        return s;
      }
      case 'sleeping': {
        const s: SleepingSession = {
          ...base,
          type: 'sleeping',
          environment: row.environment ?? undefined,
        };
        return s;
      }
      case 'diaper': {
        const s: DiaperSession = {
          ...base,
          type: 'diaper',
          diaperType: row.diapertype,
          amount: row.diaperamount ?? undefined,
          color: row.diapercolor ?? undefined,
          texture: row.diapertexture ?? undefined,
          mood: row.diapermood ?? undefined,
          openAirAccident: !!row.openairaccident,
          diaperLeak: !!row.diaperleak,
        };
        // Diaper entries should not have duration; ensure it's undefined locally
        delete (s as any).duration;
        return s;
      }
      default:
        return null;
    }
  }, []);

  const completeBreastfeeding = useCallback(async (timerTimeMs: number, notes?: string) => {
    if (timerTimeMs === 0) return;

    try {
      const now = new Date();
      const durationSeconds = Math.floor(timerTimeMs / 1000);
      const startTime = new Date(now.getTime() - timerTimeMs);

      const url = prefixPath('/api/sessions', basePath);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionType: 'breastfeeding',
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          duration: durationSeconds,
          notes: notes || null,
          // side: optional in future
        }),
      });
      if (!res.ok) throw new Error(`POST /api/sessions failed: ${res.status}`);
      const json = await res.json();
      const created = mapApiToSession(json.session);
      if (created) setSessions(prev => [created, ...prev]);

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
    } catch (e: any) {
      console.error('Failed to save breastfeeding session:', e);
      toast.error('Failed to save breastfeeding session');
      setError(e?.message || 'Failed to save breastfeeding session');
    }
  }, [basePath, mapApiToSession]);

  const recordBottleFeeding = useCallback(async (amount: string, unit: 'ml' | 'oz', notes?: string) => {
    if (!amount) return;

    try {
      const now = new Date();
      const url = prefixPath('/api/sessions', basePath);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionType: 'bottle',
          startTime: now.toISOString(),
          endTime: now.toISOString(),
          notes: notes || null,
          amount: parseFloat(amount),
          unit,
        }),
      });
      if (!res.ok) throw new Error(`POST /api/sessions failed: ${res.status}`);
      const json = await res.json();
      const created = mapApiToSession(json.session);
      if (created) setSessions(prev => [created, ...prev]);

      const displayAmount = unit === 'ml' 
        ? `${amount}ml` 
        : `${amount}oz (${mlToOz(parseFloat(amount))}ml)`;
      
      toast.success(`Bottle Feeding recorded: ${displayAmount} 🍼`, {
        duration: 3000,
        position: 'top-center',
      });
    } catch (e: any) {
      console.error('Failed to save bottle feeding session:', e);
      toast.error('Failed to save bottle feeding');
      setError(e?.message || 'Failed to save bottle feeding');
    }
  }, [basePath, mapApiToSession]);

  const completeSleeping = useCallback(async (timerTimeMs: number, notes?: string) => {
    if (timerTimeMs === 0) return;

    try {
      const now = new Date();
      const durationSeconds = Math.floor(timerTimeMs / 1000);
      const startTime = new Date(now.getTime() - timerTimeMs);

      const url = prefixPath('/api/sessions', basePath);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionType: 'sleeping',
          startTime: startTime.toISOString(),
          endTime: now.toISOString(),
          duration: durationSeconds,
          notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error(`POST /api/sessions failed: ${res.status}`);
      const json = await res.json();
      const created = mapApiToSession(json.session);
      if (created) setSessions(prev => [created, ...prev]);

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
    } catch (e: any) {
      console.error('Failed to save sleep session:', e);
      toast.error('Failed to save sleep session');
      setError(e?.message || 'Failed to save sleep session');
    }
  }, [basePath, mapApiToSession]);

  const recordDiaperChange = useCallback(async (input: DiaperRecordInput) => {
    const { dateTime, notes, ...rest } = input;
    const now = dateTime ?? new Date();

    try {
      const url = prefixPath('/api/sessions', basePath);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionType: 'diaper',
          startTime: now.toISOString(),
          endTime: now.toISOString(),
          notes: notes || null,
          diaperType: rest.diaperType,
          diaperAmount: rest.amount || null,
          diaperColor: rest.color || null,
          diaperTexture: rest.texture || null,
          diaperMood: rest.mood || null,
          openAirAccident: !!rest.openAirAccident,
          diaperLeak: !!rest.diaperLeak,
        }),
      });
      if (!res.ok) throw new Error(`POST /api/sessions failed: ${res.status}`);
      const json = await res.json();
      const created = mapApiToSession(json.session);
      if (created) setSessions(prev => [created, ...prev]);

      toast.success('Diaper change recorded 👶', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (e: any) {
      console.error('Failed to save diaper record:', e);
      toast.error('Failed to save diaper record');
      setError(e?.message || 'Failed to save diaper record');
    }
  }, [basePath, mapApiToSession]);

  const refreshSessions = useCallback(async () => {
    if (refreshingRef.current) return; // prevent re-entry
    try {
      refreshingRef.current = true;
      setLoading(true);
      setError(null);
      const url = prefixPath('/api/sessions?limit=50', basePath);
      const res = await fetch(url, { credentials: 'include' });
      if (res.status === 401) {
        setSessions([]);
        return;
      }
      if (!res.ok) throw new Error(`GET /api/sessions failed: ${res.status}`);
      const json = await res.json();
      const rows: any[] = json.sessions || [];
      const mapped: FeedingSession[] = rows
        .map(mapApiToSession)
        .filter((x: any): x is FeedingSession => !!x);
      setSessions(mapped);
    } catch (e: any) {
      console.error('Failed to refresh sessions:', e);
      setError(e?.message || 'Failed to refresh sessions');
    } finally {
      setLoading(false);
      refreshingRef.current = false;
    }
  }, [basePath, mapApiToSession]);

  return {
    sessions,
    loading,
    error,
    refreshSessions,
    completeBreastfeeding,
    recordBottleFeeding,
    completeSleeping,
    recordDiaperChange
  };
}
