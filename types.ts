export interface Word {
  id: string;
  text: string;
  translation: string;
  phonetic?: string;
  exampleSentence?: string;
  difficulty: 1 | 2 | 3; // 1: Easy, 2: Medium, 3: Hard
}

export interface WordLibrary {
  id: string;
  name: string;
  description: string;
  words: Word[];
  isCustom: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  stars: number;
  wordsLearned: string[]; // IDs
  streakDays: number;
  lastLoginDate: string;
}

export interface VideoGenerationState {
  isGenerating: boolean;
  progressMessage: string;
  videoUrl: string | null;
  error: string | null;
}

export enum GameMode {
  TYPING = 'TYPING',
  FLASHCARD = 'FLASHCARD',
  AI_CHAT = 'AI_CHAT',
  VIDEO_MAKER = 'VIDEO_MAKER'
}