
import { WordLibrary, FingeringLesson } from './types';

export const INITIAL_LIBRARIES: WordLibrary[] = [
  {
    id: 'lib_animals',
    name: '🐶 Animals Level 1',
    description: 'Basic animals found in the farm and wild.',
    isCustom: false,
    words: [
      { id: 'cat', text: 'cat', translation: '猫', difficulty: 1, phonetic: '/kæt/' },
      { id: 'dog', text: 'dog', translation: '狗', difficulty: 1, phonetic: '/dɔɡ/' },
      { id: 'elephant', text: 'elephant', translation: '大象', difficulty: 2, phonetic: '/ˈel.ɪ.fənt/' },
      { id: 'tiger', text: 'tiger', translation: '老虎', difficulty: 2, phonetic: '/ˈtaɪ.ɡər/' },
      { id: 'zebra', text: 'zebra', translation: '斑马', difficulty: 2, phonetic: '/ˈzeb.rə/' },
    ]
  },
  {
    id: 'lib_fruits',
    name: '🍎 Fruits & Veggies',
    description: 'Delicious healthy food items.',
    isCustom: false,
    words: [
      { id: 'apple', text: 'apple', translation: '苹果', difficulty: 1 },
      { id: 'banana', text: 'banana', translation: '香蕉', difficulty: 2 },
      { id: 'orange', text: 'orange', translation: '橙子', difficulty: 1 },
      { id: 'watermelon', text: 'watermelon', translation: '西瓜', difficulty: 3 },
    ]
  },
  {
    id: 'lib_actions',
    name: '🏃 Action Verbs',
    description: 'Things we do every day.',
    isCustom: false,
    words: [
      { id: 'run', text: 'run', translation: '跑', difficulty: 1 },
      { id: 'jump', text: 'jump', translation: '跳', difficulty: 1 },
      { id: 'sleep', text: 'sleep', translation: '睡觉', difficulty: 1 },
      { id: 'eat', text: 'eat', translation: '吃', difficulty: 1 },
      { id: 'dance', text: 'dance', translation: '跳舞', difficulty: 2 },
    ]
  }
];

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 5000];

export const FINGERING_LESSONS: FingeringLesson[] = [
  {
    id: 'lesson_1_home',
    title: '第1关：基准键位 (Home Row)',
    description: '把手指放在 ASDF 和 JKL; 上，不要移动哦！',
    content: 'fff jjj ddd kkk sss lll aaa ;;; fjdksl a;sldkfj',
    difficulty: 1
  },
  {
    id: 'lesson_2_top',
    title: '第2关：上排键位 (Top Row)',
    description: '手指向上伸展，去够上面的键。',
    content: 'rrr uuu eee iii www ooo qqq ppp rug pie top out',
    difficulty: 1
  },
  {
    id: 'lesson_3_bottom',
    title: '第3关：下排键位 (Bottom Row)',
    description: '手指向下弯曲，小心不要按错。',
    content: 'vvv mmm ccc ,,, xxx ... zzz /// van man cab zen',
    difficulty: 2
  },
  {
    id: 'lesson_4_mixed',
    title: '第4关：综合练习 (Mixed)',
    description: '这是最后的特训，准备好了吗？',
    content: 'the quick brown fox jumps over the lazy dog',
    difficulty: 3
  },
  {
    id: 'game_spider',
    title: '🏆 挑战：蜘蛛射击 (Boss)',
    description: '保护你的蛋糕！击落掉下来的字母蜘蛛！',
    content: '', // Game mode
    difficulty: 4
  }
];
