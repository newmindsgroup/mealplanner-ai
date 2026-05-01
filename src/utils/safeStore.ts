/**
 * Safe store access utilities to prevent crashes
 */

import { useStore } from '../store/useStore';

/**
 * Safely get store value with fallback
 */
export function safeGetStore<T>(getter: () => T, fallback: T): T {
  try {
    return getter();
  } catch (error) {
    console.warn('Store access error, using fallback:', error);
    return fallback;
  }
}

/**
 * Clear all app storage
 */
export function clearAppStorage() {
  try {
    localStorage.removeItem('meal-plan-assistant-storage');
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
}

/**
 * Check if store is initialized
 */
export function isStoreInitialized(): boolean {
  try {
    const store = useStore.getState();
    return store !== null && store !== undefined;
  } catch {
    return false;
  }
}

