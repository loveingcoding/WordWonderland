
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

export interface VideoScript {
  visualPrompt: string; // The prompt sent to Veo
  captionEnglish: string; // Educational sentence
  captionChinese: string; // Translation
  topic: string;
}

export interface VideoGenerationState {
  isGenerating: boolean;
  progressMessage: string;
  videoUrl: string | null;
  script: VideoScript | null;
  error: string | null;
}

export enum GameMode {
  TYPING = 'TYPING',
  FINGERING = 'FINGERING',
  FLASHCARD = 'FLASHCARD',
  AI_CHAT = 'AI_CHAT',
  VIDEO_MAKER = 'VIDEO_MAKER',
  CLASSROOM = 'CLASSROOM'
}

export interface FingeringLesson {
  id: string;
  title: string;
  description: string;
  content: string; // The text to type
  difficulty: number;
}

export interface LessonWord {
  text: string;
  phonetic: string;
  translation: string;
  example: string;
  type: string; // e.g., 'adj.', 'v.'
}

export interface Lesson {
  id: string;
  title: string;
  videoId: string; // Placeholder for video source
  words: LessonWord[];
}
