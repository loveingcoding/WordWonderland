import { UserProgress, WordLibrary } from '../types';
import { INITIAL_LIBRARIES } from '../constants';

const KEYS = {
  PROGRESS: 'ww_progress',
  LIBRARIES: 'ww_libraries',
};

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  stars: 0,
  wordsLearned: [],
  streakDays: 1,
  lastLoginDate: new Date().toISOString().split('T')[0],
};

export const getUserProgress = (): UserProgress => {
  const stored = localStorage.getItem(KEYS.PROGRESS);
  if (!stored) return DEFAULT_PROGRESS;
  return JSON.parse(stored);
};

export const saveUserProgress = (progress: UserProgress) => {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
};

export const getLibraries = (): WordLibrary[] => {
  const stored = localStorage.getItem(KEYS.LIBRARIES);
  if (!stored) {
    localStorage.setItem(KEYS.LIBRARIES, JSON.stringify(INITIAL_LIBRARIES));
    return INITIAL_LIBRARIES;
  }
  return JSON.parse(stored);
};

export const saveLibrary = (library: WordLibrary) => {
  const libs = getLibraries();
  const index = libs.findIndex(l => l.id === library.id);
  if (index >= 0) {
    libs[index] = library;
  } else {
    libs.push(library);
  }
  localStorage.setItem(KEYS.LIBRARIES, JSON.stringify(libs));
};

export const deleteLibrary = (id: string) => {
  const libs = getLibraries().filter(l => l.id !== id);
  localStorage.setItem(KEYS.LIBRARIES, JSON.stringify(libs));
};

export const addXp = (amount: number): UserProgress => {
  const current = getUserProgress();
  current.xp += amount;
  current.stars += Math.floor(amount / 10); // 1 star per 10 XP
  // Simple level up logic
  const nextLevelXp = current.level * 100;
  if (current.xp >= nextLevelXp) {
    current.level += 1;
  }
  saveUserProgress(current);
  return current;
};