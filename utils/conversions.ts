/**
 * Unit conversion utilities
 */

export function mlToOz(ml: number): string {
  return (ml * 0.033814).toFixed(1);
}

export function ozToMl(oz: number): number {
  return Math.round(oz * 29.5735);
}

export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}