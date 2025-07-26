// Gentle baby-friendly notification sounds
export function playNotificationSound() {
  // Create a gentle chime using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a gentle bell-like sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Gentle frequency progression (like a soft bell)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    // Soft envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.type = 'sine'; // Softer sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
    
  } catch (error) {
    console.warn('Could not play notification sound:', error);
    // Fallback to system notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCSGH1/LCeSsFJWW78uGXS');
    } catch (fallbackError) {
      console.warn('Could not play fallback sound:', fallbackError);
    }
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied');
  }
  
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico', // You might want to create a bottle icon
    badge: '/favicon.ico',
    tag: 'baby-feeding-timer',
    requireInteraction: false,
    silent: false,
  });
  
  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000);
}

export function triggerHapticFeedback() {
  if ('vibrate' in navigator) {
    // Gentle vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
    navigator.vibrate([200, 100, 200]);
  }
}