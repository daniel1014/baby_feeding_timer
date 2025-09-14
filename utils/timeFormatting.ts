/**
 * Centralized time formatting utilities
 */

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeFromSeconds(seconds: number): string {
  return formatTime(seconds * 1000);
}

// Mobile-first human readable duration, e.g. "15 mins", "1 hr 5 mins"
export function formatDurationHuman(seconds: number): string {
  if (!seconds || seconds < 0) return '0 sec';
  // Show exact seconds when under 1 minute
  if (seconds < 60) {
    const s = Math.round(seconds);
    return `${s} ${s === 1 ? 'sec' : 'secs'}`;
  }
  let hrs = Math.floor(seconds / 3600);
  let mins = Math.round((seconds % 3600) / 60);
  if (mins === 60) { hrs += 1; mins = 0; }

  const hrPart = hrs > 0 ? `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}` : '';
  const minPart = mins > 0 ? `${mins} ${mins === 1 ? 'min' : 'mins'}` : (hrs === 0 ? '0 min' : '');

  return [hrPart, minPart].filter(Boolean).join(' ');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
