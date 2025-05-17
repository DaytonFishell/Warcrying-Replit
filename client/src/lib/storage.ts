/**
 * Local storage utilities for the Warcry Companion app
 * Provides type-safe wrappers around localStorage functions
 */

/**
 * Get data from localStorage
 * @param key Storage key
 * @returns Parsed data or null if not found
 */
export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(`warcry_${key}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
}

/**
 * Save data to localStorage
 * @param key Storage key
 * @param data Data to store
 */
export function setLocalStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`warcry_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

/**
 * Remove data from localStorage
 * @param key Storage key
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`warcry_${key}`);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

/**
 * Sync data between localStorage and the API
 * When offline, changes are stored locally
 * When online, those changes are synced with the API
 */
export function syncWithLocalStorage(data: any, type: 'warbands' | 'fighters' | 'battles'): void {
  setLocalStorage(type, data);
}

/**
 * Initialize the app's localStorage with data from the API
 * This is useful when the user first loads the app
 */
export function initializeLocalStorageFromApi(
  warbands: any[],
  fighters: any[],
  battles: any[]
): void {
  if (warbands?.length) setLocalStorage('warbands', warbands);
  if (fighters?.length) setLocalStorage('fighters', fighters);
  if (battles?.length) setLocalStorage('battles', battles);
}

/**
 * Backup all app data to a single JSON object
 * @returns Object containing all app data
 */
export function backupAllData() {
  return {
    warbands: getLocalStorage('warbands') || [],
    fighters: getLocalStorage('fighters') || [],
    battles: getLocalStorage('battles') || [],
    battleFighterStats: getLocalStorage('battleFighterStats') || []
  };
}

/**
 * Restore app data from a backup
 * @param backupData Backup data object
 * @returns Success status
 */
export function restoreFromBackup(backupData: any): boolean {
  try {
    if (backupData.warbands) setLocalStorage('warbands', backupData.warbands);
    if (backupData.fighters) setLocalStorage('fighters', backupData.fighters);
    if (backupData.battles) setLocalStorage('battles', backupData.battles);
    if (backupData.battleFighterStats) setLocalStorage('battleFighterStats', backupData.battleFighterStats);
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
}

/**
 * Check if local data exists
 * @returns True if any local data exists
 */
export function hasLocalData(): boolean {
  return !!(
    getLocalStorage('warbands') ||
    getLocalStorage('fighters') ||
    getLocalStorage('battles')
  );
}
