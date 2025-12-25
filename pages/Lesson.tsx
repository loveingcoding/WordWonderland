
import React, { useState, useEffect, useRef } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import GameArena from '../components/GameArena';
import CourseSelector from '../components/CourseSelector';
import { addXp } from '../services/storage';
import { CourseService } from '../services/CourseService';
import { WordLibrary, Course, LessonWord } from '../types';

interface LessonProps {
  libraries: WordLibrary[];
}

const Lesson: React.FC<LessonProps> = ({ libraries }) => {
  // Data selection state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState<number>(-1);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Lesson state
  const [activeWords, setActiveWords] = useState<LessonWord[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [errorCharIndex, setErrorCharIndex] = useState<number | null>(null);
  const [stats, setStats] = useState({ correctKeystrokes: 0, totalKeystrokes: 0, startTime: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGame, setShowGame] = useState(false);

  // Focus management
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 1. Load Data ---
  useEffect(() => {
    const loadData = async () => {
      setLoadingCourses(true);
      // Fetch official courses
      const officialCourses = await CourseService.getAvailableCourses();
      
      // Adapt custom libraries to "Course" format for the selector
      const customCourses: Course[] = libraries.map(lib => ({
        id: lib.id,
        name: `📚 ${lib.name}`, // Add icon to distinguish
        description: lib.description,
        isOfficial: false,
        categories: [{ 
            name: "默认列表", 
            words: lib.words.map(w => ({ en: w.text, cn: w.translation })) 
        }]
      }));

      const allCourses = [...officialCourses, ...customCourses];
      setCourses(allCourses);
      
      // Default selection
      if (allCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(allCourses[0].id);
      }
      setLoadingCourses(false);
    };
    loadData();
  }, [libraries]);

  // --- 2. Update Active Lesson Words when selection changes ---
  useEffect(() => {
    if (!selectedCourseId) return;
    
    const course = courses.find(c => c.id === selectedCourseId);
    if (!course) return;

    let words: {en: string, cn: string}[] = [];

    if (selectedCategoryIdx === -1) {
        // All words flattened
        course.categories.forEach(cat => {
            words = [...words, ...cat.words];
        });
    } else {
        // Specific category
        if (course.categories[selectedCategoryIdx]) {
            words = course.categories[selectedCategoryIdx].words;
        }
    }

    // Convert to LessonWord format
    const lessonWords: LessonWord[] = words.map(w => ({
        text: w.en,
        translation: w.cn,
        phonetic: '', // Placeholder, ideally fetch or store
        type: '',
        example: ''
    }));

    setActiveWords(lessonWords);
    handleRestart(); // Reset progress when course changes
  }, [selectedCourseId, selectedCategoryIdx, courses]);

  // --- 3. Lesson Logic ---
  const currentWordData = activeWords[currentWordIdx];
  const targetWord = currentWordData?.text || '';

  useEffect(() => {
    // Reset input on word change
    setInput('');
    setErrorCharIndex(null);
    if (containerRef.current && !showGame) containerRef.current.focus();
  }, [currentWordIdx, isCompleted, showGame, activeWords]); 

  useEffect(() => {
    // Initialize start time on mount
    setStats(s => ({ ...s, startTime: Date.now() }));
  }, []);

  const handleRestart = () => {
    setCurrentWordIdx(0);
    setInput('');
    setErrorCharIndex(null);
    setStats({ correctKeystrokes: 0, totalKeystrokes: 0, startTime: Date.now() });
    setIsCompleted(false);
    setShowGame(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCompleted || showGame || !targetWord) return;
    
    // Ignore modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;

    const targetChar = targetWord[input.length];
    
    setStats(prev => ({ ...prev, totalKeystrokes: prev.totalKeystrokes + 1 }));

    if (e.key === targetChar) {
      // Correct input
      const newInput = input + e.key;
      setInput(newInput);
      setStats(prev => ({ ...prev, correctKeystrokes: prev.correctKeystrokes + 1 }));
      setErrorCharIndex(null);

      // Check Word Completion
      if (newInput === targetWord) {
        // Delay slightly for visual satisfaction
        setTimeout(() => {
          if (currentWordIdx < activeWords.length - 1) {
            setCurrentWordIdx(prev => prev + 1);
          } else {
            handleLessonComplete();
          }
        }, 200);
      }
    } else {
      // Wrong input - trigger shake effect on the specific character
      setErrorCharIndex(input.length);
      // Reset error state after animation
      setTimeout(() => setErrorCharIndex(null), 500);
    }
  };

  const handleLessonComplete = () => {
    setIsCompleted(true);
    addXp(50); // Big reward for lesson completion
  };

  // Calculate stats
  const timeMinutes = (Date.now() - stats.startTime) / 60000;
  const wpm = timeMinutes > 0 ? Math.round((stats.correctKeystrokes / 5) / timeMinutes) : 0;
  const accuracy = stats.totalKeystrokes > 0 
    ? Math.round((stats.correctKeystrokes / stats.totalKeystrokes) * 100) 
    : 100;

  const progressPercent = activeWords.length > 0 ? Math.round(((currentWordIdx) / activeWords.length) * 100) : 0;

  // --- GAME ARENA OVERLAY ---
  if (showGame) {
    return (
      <GameArena 
        vocabularyList={activeWords.map(w => w.text)}
        onExit={() => {
          setShowGame(false);
        }}
      />
    );
  }

  // --- LESSON COMPLETE VIEW ---
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in relative z-10">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-brand-yellow text-center max-w-lg w-full">
          <h2 className="text-4xl font-display font-bold text-brand-blue mb-4">Unit Complete! 🎓</h2>
          <div className="grid grid-cols-2 gap-8 mb-8">
             <div className="bg-blue-50 p-4 rounded-xl">
               <div className="text-xs text-gray-400 font-bold uppercase">WPM</div>
               <div className="text-4xl font-bold text-brand-blue">{wpm}</div>
             </div>
             <div className="bg-green-50 p-4 rounded-xl">
               <div className="text-xs text-gray-400 font-bold uppercase">Accuracy</div>
               <div className="text-4xl font-bold text-brand-green">{accuracy}%</div>
             </div>
          </div>
          
          <div className="space-y-4">
              <button 
                onClick={() => setShowGame(true)} 
                className="w-full bg-brand-purple text-white font-bold py-4 rounded-xl hover:bg-purple-600 transition shadow-lg shadow-purple-200 flex items-center justify-center gap-2 text-xl animate-pulse-slow"
              >
                <span>⚔️</span> Start Challenge
              </button>
              
              <button 
                onClick={handleRestart} 
                className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Review Lesson
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeWords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
             {loadingCourses ? "Loading curriculum..." : "No words found in this course."}
        </div>
      );
  }

  // --- STANDARD DRILL MODE ---
  const currentCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div 
      className="flex flex-col h-full max-w-5xl mx-auto focus:outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={containerRef}
    >
      {/* Selector Section */}
      <CourseSelector 
         courses={courses}
         selectedCourseId={selectedCourseId}
         onSelectCourse={setSelectedCourseId}
         categories={currentCourse ? currentCourse.categories : []}
         selectedCategoryIndex={selectedCategoryIdx}
         onSelectCategory={setSelectedCategoryIdx}
         loading={loadingCourses}
      />

      {/* Top Section: Multimedia & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Placeholder Video Player */}
        <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-lg group border border-slate-700">
           {/* Fake Play Button */}
           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition cursor-pointer">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
           </div>
           <div className="absolute bottom-4 left-4 text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">
              {currentCourse?.name}
           </div>
        </div>

        {/* Word Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-brand-yellow text-xs font-bold px-3 py-1 rounded-bl-xl text-yellow-900">
             Word {currentWordIdx + 1}/{activeWords.length}
           </div>
           
           <h3 className="text-4xl font-display font-bold text-gray-800 mb-2">{currentWordData.text}</h3>
           
           {(currentWordData.phonetic || currentWordData.type) && (
               <div className="flex items-baseline gap-3 mb-4">
                {currentWordData.phonetic && <span className="font-mono text-gray-500 text-lg">{currentWordData.phonetic}</span>}
                {currentWordData.type && <span className="bg-blue-100 text-brand-blue px-2 py-0.5 rounded text-sm font-bold">{currentWordData.type}</span>}
               </div>
           )}
           
           <div className="space-y-2">
             <p className="text-xl font-bold text-gray-700">{currentWordData.translation}</p>
             {currentWordData.example && <p className="text-gray-500 italic">"{currentWordData.example}"</p>}
           </div>
        </div>
      </div>

      {/* Middle: Typing Area (The "Blackboard") */}
      <div className="flex-1 bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-inner overflow-hidden border-4 border-slate-700">
         {/* Progress Bar */}
         <div className="absolute top-0 left-0 w-full h-2 bg-slate-700">
            <div className="h-full bg-brand-green transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
         </div>

         {/* Stats overlay */}
         <div className="absolute top-4 right-4 flex gap-4 text-slate-400 font-mono text-sm">
            <div>WPM: <span className="text-white">{wpm}</span></div>
            <div>ACC: <span className="text-white">{accuracy}%</span></div>
         </div>

         {/* The Big Text */}
         <div className="flex gap-1 md:gap-2 mb-12 flex-wrap justify-center">
            {targetWord.split('').map((char, idx) => {
               // Determine state
               const isTyped = idx < input.length;
               const isCurrent = idx === input.length;
               const isError = errorCharIndex === idx;

               let baseClasses = "w-12 h-16 md:w-16 md:h-20 flex items-center justify-center text-4xl md:text-5xl font-mono font-bold rounded-lg transition-all duration-100";
               
               if (isTyped) {
                  return (
                    <div key={idx} className={`${baseClasses} bg-green-500 text-white shadow-[0_4px_0_#15803d] transform translate-y-1`}>
                      {char}
                    </div>
                  );
               }
               
               if (isCurrent) {
                  return (
                    <div key={idx} className={`${baseClasses} bg-slate-100 text-slate-900 border-b-4 border-brand-blue animate-pulse ${isError ? 'bg-red-500 text-white animate-shake border-red-700' : ''}`}>
                      {char}
                    </div>
                  );
               }

               // Pending
               return (
                 <div key={idx} className={`${baseClasses} bg-slate-700 text-slate-500 border-2 border-slate-600 border-dashed opacity-50`}>
                   {char}
                 </div>
               );
            })}
         </div>

         {/* Virtual Keyboard Integration */}
         <div className="w-full max-w-3xl transform scale-75 md:scale-90 origin-bottom">
            <VirtualKeyboard activeChar={targetWord[input.length] || ''} />
         </div>
      </div>
      
      <div className="text-center mt-4 text-gray-400 text-sm">
        Keep your eyes on the screen! Type the highlighted letter.
      </div>
    </div>
  );
};

export default Lesson;