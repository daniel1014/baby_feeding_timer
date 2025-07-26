import { useState, useCallback } from 'react';
import { Scripture, TimerPreferences } from '../types';
import { SCRIPTURES } from '../data/scriptures';
import { useLocalStorage } from './useLocalStorage';

export function useScripture() {
  const [preferences] = useLocalStorage<TimerPreferences>('timerPreferences', {
    defaultDuration: 30 * 60,
    soundEnabled: true,
    vibrationEnabled: true,
    scriptureEnabled: true,
  });

  const [currentScripture, setCurrentScripture] = useState<Scripture | null>(null);
  const [favoriteScriptures, setFavoriteScriptures] = useLocalStorage<string[]>('favoriteScriptures', []);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const getRandomScripture = useCallback((theme?: Scripture['theme']): Scripture => {
    let availableScriptures = SCRIPTURES;
    
    if (theme) {
      availableScriptures = SCRIPTURES.filter(scripture => scripture.theme === theme);
    }
    
    if (availableScriptures.length === 0) {
      availableScriptures = SCRIPTURES;
    }
    
    const randomIndex = Math.floor(Math.random() * availableScriptures.length);
    return availableScriptures[randomIndex];
  }, []);

  const showScripture = useCallback((theme?: Scripture['theme']) => {
    if (!preferences.scriptureEnabled) {
      return;
    }

    const scripture = getRandomScripture(theme);
    setCurrentScripture(scripture);
    setIsPopupVisible(true);
  }, [preferences.scriptureEnabled, getRandomScripture]);

  const hideScripture = useCallback(() => {
    setIsPopupVisible(false);
    // Clear current scripture after animation completes
    setTimeout(() => setCurrentScripture(null), 300);
  }, []);

  const nextScripture = useCallback(() => {
    const newScripture = getRandomScripture();
    setCurrentScripture(newScripture);
  }, [getRandomScripture]);

  const addToFavorites = useCallback((scriptureId: string) => {
    setFavoriteScriptures(prev => {
      if (prev.includes(scriptureId)) {
        return prev;
      }
      return [...prev, scriptureId];
    });
  }, [setFavoriteScriptures]);

  const removeFromFavorites = useCallback((scriptureId: string) => {
    setFavoriteScriptures(prev => prev.filter(id => id !== scriptureId));
  }, [setFavoriteScriptures]);

  const isFavorite = useCallback((scriptureId: string) => {
    return favoriteScriptures.includes(scriptureId);
  }, [favoriteScriptures]);

  const getFavoriteScriptures = useCallback((): Scripture[] => {
    return SCRIPTURES.filter(scripture => favoriteScriptures.includes(scripture.id));
  }, [favoriteScriptures]);

  // Timer completion scripture trigger
  const onTimerComplete = useCallback(() => {
    if (!preferences.scriptureEnabled) {
      return;
    }

    // Determine context-aware theme based on time of day
    const hour = new Date().getHours();
    let theme: Scripture['theme'] | undefined;
    
    if (hour >= 22 || hour <= 6) {
      // Night feeding - show peaceful/encouraging verses
      theme = Math.random() > 0.5 ? 'peace' : 'encouragement';
    } else if (hour >= 6 && hour <= 12) {
      // Morning feeding - show strength/encouragement
      theme = Math.random() > 0.5 ? 'strength' : 'encouragement';
    } else {
      // Daytime feeding - random theme
      theme = undefined;
    }

    showScripture(theme);
  }, [preferences.scriptureEnabled, showScripture]);

  // Random interval scripture trigger (for long timers)
  const onRandomInterval = useCallback(() => {
    if (!preferences.scriptureEnabled) {
      return;
    }

    // 15% chance to show scripture
    if (Math.random() < 0.15) {
      showScripture('encouragement');
    }
  }, [preferences.scriptureEnabled, showScripture]);

  return {
    currentScripture,
    isPopupVisible,
    favoriteScriptures: getFavoriteScriptures(),
    showScripture,
    hideScripture,
    nextScripture,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    onTimerComplete,
    onRandomInterval,
  };
}