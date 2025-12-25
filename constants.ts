
import { WordLibrary, FingeringLesson, Lesson, Course } from './types';

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

export const OFFICIAL_LIBRARIES: WordLibrary[] = [
  {
    id: 'pep_grade1_vol1_flat',
    name: '人教版一年级上册 (全)',
    description: 'Primary English Grade 1 Vol.1 (PEP)',
    isCustom: false,
    words: [] // Simplified placeholder for backward compatibility
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: "pep_grade1_vol1",
    name: "人教版 (PEP) 一年级上册",
    description: "Primary English Grade 1 Vol.1",
    isOfficial: true,
    categories: [
      { 
        name: "文具类 (Stationery)", 
        words: [
          { en: "book", cn: "书" }, 
          { en: "ruler", cn: "尺子" }, 
          { en: "pencil", cn: "铅笔" }, 
          { en: "eraser", cn: "橡皮" }, 
          { en: "schoolbag", cn: "书包" }, 
          { en: "pencil case", cn: "铅笔盒" }, 
          { en: "pen", cn: "钢笔" }
        ] 
      },
      { 
        name: "身体部位 (Body)", 
        words: [
          { en: "face", cn: "脸" }, 
          { en: "ear", cn: "耳朵" }, 
          { en: "eye", cn: "眼睛" }, 
          { en: "nose", cn: "鼻子" }, 
          { en: "mouth", cn: "嘴" }, 
          { en: "hand", cn: "手" }, 
          { en: "leg", cn: "腿" }, 
          { en: "arm", cn: "手臂" }, 
          { en: "foot", cn: "脚" }
        ] 
      },
      { 
        name: "动物类 (Animals)", 
        words: [
          { en: "cat", cn: "猫" }, 
          { en: "dog", cn: "狗" }, 
          { en: "bird", cn: "鸟" }, 
          { en: "tiger", cn: "老虎" }, 
          { en: "monkey", cn: "猴子" }, 
          { en: "rabbit", cn: "兔子" }, 
          { en: "chicken", cn: "鸡" }, 
          { en: "duck", cn: "鸭" }, 
          { en: "panda", cn: "熊猫" }, 
          { en: "elephant", cn: "大象" }, 
          { en: "fish", cn: "鱼" }
        ] 
      },
      { 
        name: "数字 (Numbers)", 
        words: [
          { en: "one", cn: "一" }, 
          { en: "two", cn: "二" }, 
          { en: "three", cn: "三" }, 
          { en: "four", cn: "四" }, 
          { en: "five", cn: "五" }, 
          { en: "six", cn: "六" }, 
          { en: "seven", cn: "七" }, 
          { en: "eight", cn: "八" }, 
          { en: "nine", cn: "九" }, 
          { en: "ten", cn: "十" }
        ] 
      },
      { 
        name: "颜色 (Colors)", 
        words: [
          { en: "red", cn: "红色" }, 
          { en: "yellow", cn: "黄色" }, 
          { en: "blue", cn: "蓝色" }, 
          { en: "green", cn: "绿色" }, 
          { en: "black", cn: "黑色" }, 
          { en: "white", cn: "白色" }, 
          { en: "purple", cn: "紫色" }, 
          { en: "orange", cn: "橙色" }, 
          { en: "pink", cn: "粉红色" }, 
          { en: "brown", cn: "棕色" }
        ] 
      },
      { 
        name: "水果 (Fruits)", 
        words: [
          { en: "apple", cn: "苹果" }, 
          { en: "banana", cn: "香蕉" }, 
          { en: "pear", cn: "梨" }, 
          { en: "orange", cn: "橙子" }, 
          { en: "peach", cn: "桃" }, 
          { en: "grape", cn: "葡萄" }, 
          { en: "strawberry", cn: "草莓" }, 
          { en: "pineapple", cn: "菠萝" }, 
          { en: "watermelon", cn: "西瓜" }
        ] 
      }
    ]
  }
];

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 5000];

export const FINGERING_LESSONS: FingeringLesson[] = [
  {
    id: 'lesson_1_home',
    title: '第1关：基准键位 (Home Row)',
    description: '把手指放在 ASDF 和 JKL 上，保持不动哦！',
    content: 'aaa sss ddd fff jjj kkk lll dad sad lad',
    difficulty: 1
  },
  {
    id: 'lesson_2_top',
    title: '第2关：上排键位 (Top Row)',
    description: '手指向上伸展，去按上面的键。',
    content: 'qqq www eee rrr ttt yyy uuu iii ooo ppp top pot',
    difficulty: 1
  },
  {
    id: 'lesson_3_bottom',
    title: '第3关：下排键位 (Bottom Row)',
    description: '手指向下，按底部的字母。',
    content: 'zzz xxx ccc vvv bbb nnn mmm van cab ban',
    difficulty: 2
  },
  {
    id: 'lesson_4_alphabet',
    title: '第4关：字母表大挑战 (A-Z)',
    description: '按顺序打出26个字母，你可以的！',
    content: 'abcdefghijklmnopqrstuvwxyz',
    difficulty: 2
  },
  {
    id: 'lesson_5_words',
    title: '第5关：简单单词 (Words)',
    description: '尝试拼写一些简单的单词。',
    content: 'apple banana cat dog egg fish girl hat',
    difficulty: 3
  },
  {
    id: 'game_spider',
    title: '🏆 挑战：蜘蛛射击 (Boss)',
    description: '保护你的蛋糕！击落蜘蛛！',
    content: '', // Game mode
    difficulty: 4
  }
];

export const DEMO_LESSON: Lesson = {
  id: 'unit_1',
  title: 'Unit 1: Describing People',
  videoId: 'placeholder',
  words: [
    { text: 'tall', phonetic: '/tɔːl/', translation: '高的', type: 'adj.', example: 'He is very tall.' },
    { text: 'short', phonetic: '/ʃɔːrt/', translation: '矮的; 短的', type: 'adj.', example: 'The pencil is short.' },
    { text: 'young', phonetic: '/jʌŋ/', translation: '年轻的', type: 'adj.', example: 'The baby is young.' },
    { text: 'old', phonetic: '/oʊld/', translation: '老的; 旧的', type: 'adj.', example: 'My grandpa is old.' },
    { text: 'funny', phonetic: '/ˈfʌn.i/', translation: '有趣的', type: 'adj.', example: 'The clown is funny.' },
    { text: 'smart', phonetic: '/smɑːrt/', translation: '聪明的', type: 'adj.', example: 'She is a smart student.' }
  ]
};
