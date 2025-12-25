
import React, { useState, useEffect, useRef } from 'react';
import { WordLibrary, Word, Course } from '../types';
import { explainWord } from '../services/gemini';
import { addXp } from '../services/storage';
import { CourseService } from '../services/CourseService';
import VirtualKeyboard from '../components/VirtualKeyboard';
import CourseSelector from '../components/CourseSelector';

interface TypingProps {
  libraries: WordLibrary[];
  onFinish: () => void;
  initialLibraryId?: string | null;
}

const Typing: React.FC<TypingProps> = ({ libraries, onFinish, initialLibraryId }) => {
  // Mode State
  const [isCourseMode, setIsCourseMode] = useState(false);
  
  // Standard Library State
  const [activeLibraryId, setActiveLibraryId] = useState<string>('');
  
  // Course Mode State
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(-1); // -1 means All
  
  // Game State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiHint, setAiHint] = useState<{definition: string, sentence: string} | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Initialization & Data Fetching ---
  
  useEffect(() => {
    // Load available courses on mount
    CourseService.getAvailableCourses().then(setAvailableCourses);
  }, []);

  useEffect(() => {
    const init = async () => {
        if (initialLibraryId) {
            // Check if it matches a course
            const course = await CourseService.getCourseContent(initialLibraryId);
            if (course) {
                setCourseData(course);
                setIsCourseMode(true);
                setActiveCategoryIdx(-1);
            } else {
                // Fallback to standard library
                setActiveLibraryId(initialLibraryId);
                setIsCourseMode(false);
            }
        } else {
            // Default: First standard library if no initial ID
             if (libraries.length > 0) {
                 setActiveLibraryId(libraries[0].id);
                 setIsCourseMode(false);
             }
        }
        setCurrentWordIndex(0);
        setUserInput('');
    };
    init();
  }, [initialLibraryId, libraries]);

  // Handle Course Switching within the page
  const handleCourseSelect = async (courseId: string) => {
      const course = await CourseService.getCourseContent(courseId);
      if (course) {
          setCourseData(course);
          setActiveCategoryIdx(-1);
          setCurrentWordIndex(0);
          setUserInput('');
          setAiHint(null);
      }
  };

  // --- Derived Data: Current Word List ---

  let activeWords: Word[] = [];
  let title = "";
  let subTitle = "";

  if (isCourseMode && courseData) {
      title = courseData.name;
      subTitle = activeCategoryIdx === -1 
        ? "全部单词" 
        : courseData.categories[activeCategoryIdx].name;

      if (activeCategoryIdx === -1) {
          // Flatten all categories
          courseData.categories.forEach(cat => {
              cat.words.forEach(w => {
                  activeWords.push({ 
                      id: w.en, 
                      text: w.en, 
                      translation: w.cn, 
                      difficulty: 1 
                  });
              });
          });
      } else {
          // Specific category
          activeWords = courseData.categories[activeCategoryIdx].words.map(w => ({
              id: w.en,
              text: w.en,
              translation: w.cn,
              difficulty: 1
          }));
      }
  } else {
      // Standard Library Mode
      const lib = libraries.find(l => l.id === activeLibraryId);
      if (lib) {
          activeWords = lib.words;
          title = lib.name;
          subTitle = "自由练习";
      }
  }

  const currentWord = activeWords[currentWordIndex];

  // --- Game Logic ---

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentWordIndex, activeLibraryId, courseData, activeCategoryIdx]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    if (currentWord && val.toLowerCase() === currentWord.text.toLowerCase()) {
      setFeedback('correct');
      setTimeout(nextWord, 800);
    } else if (currentWord && !currentWord.text.toLowerCase().startsWith(val.toLowerCase())) {
      setFeedback('wrong');
    } else {
      setFeedback('neutral');
    }
  };

  const nextWord = () => {
    addXp(10);
    setUserInput('');
    setFeedback('neutral');
    setAiHint(null);
    
    if (currentWordIndex < activeWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentWordIndex(0);
        onFinish(); 
      }, 3000);
    }
  };

  const fetchAiHint = async () => {
    if (!currentWord || loadingHint) return;
    setLoadingHint(true);
    const hint = await explainWord(currentWord.text);
    setAiHint(hint);
    setLoadingHint(false);
  };

  if (activeWords.length === 0) {
     return <div className="text-center p-10 text-white">正在加载课程数据...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start h-full max-w-4xl mx-auto space-y-6 pt-4">
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 pointer-events-none">
          <div className="text-6xl animate-bounce">🎉 太棒了！ 🎉</div>
        </div>
      )}

      {/* --- HEADER & SELECTOR --- */}
      <div className="w-full">
         {isCourseMode && courseData ? (
             <CourseSelector 
                courses={availableCourses}
                selectedCourseId={courseData.id}
                onSelectCourse={handleCourseSelect}
                categories={courseData.categories}
                selectedCategoryIndex={activeCategoryIdx}
                onSelectCategory={(idx) => {
                    setActiveCategoryIdx(idx);
                    setCurrentWordIndex(0);
                    setUserInput('');
                }}
             />
         ) : (
            <div className="w-full flex justify-between items-end border-b pb-4 border-gray-200/20 mb-6">
                <div>
                    <h2 className="text-white text-lg font-bold opacity-80">📝 自由跟打练习</h2>
                    <h1 className="text-3xl md:text-4xl text-brand-yellow font-display font-bold drop-shadow-md">
                        {title}
                    </h1>
                </div>
                <div className="w-64">
                    <select 
                    value={activeLibraryId} 
                    onChange={(e) => {
                        setActiveLibraryId(e.target.value);
                        setCurrentWordIndex(0);
                        setUserInput('');
                    }}
                    className="w-full p-2 rounded-lg border-2 border-gray-200 text-sm font-bold bg-white focus:border-brand-blue outline-none"
                    >
                    {libraries.filter(l => !l.id.startsWith('pep_')).map(lib => ( // Filter out flattened official libs if any
                        <option key={lib.id} value={lib.id}>{lib.name}</option>
                    ))}
                    </select>
                </div>
            </div>
         )}
      </div>

      {/* --- GAME CARD --- */}
      <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-gray-200 animate-slide-in">
        <div 
             className="p-8 text-center text-white relative overflow-hidden transition-colors duration-500"
             style={{ backgroundColor: isCourseMode ? '#ea580c' : '#4D96FF' }} 
        >
          {/* Progress Bar Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-black/10">
            <div 
              className="h-full bg-yellow-300 transition-all duration-500" 
              style={{ width: `${((currentWordIndex) / activeWords.length) * 100}%` }}
            />
          </div>
          
          <h2 className="text-6xl md:text-8xl font-display font-bold mb-4 drop-shadow-md tracking-wider">
            {currentWord.text}
          </h2>
          <div className="flex justify-center items-center gap-4 text-blue-100">
             <span className="text-xl font-mono opacity-80">{currentWord.phonetic || '//'}</span>
             <span className="bg-white/20 px-3 py-1 rounded-full text-lg font-bold text-white">{currentWord.translation}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="在这里输入单词..."
              className={`w-full text-center text-4xl font-bold p-6 rounded-2xl border-4 outline-none transition-all duration-300 placeholder-gray-300
                ${feedback === 'correct' ? 'border-brand-green bg-green-50 text-brand-green' : 
                  feedback === 'wrong' ? 'border-brand-orange bg-red-50 text-brand-orange animate-pulse' : 
                  'border-gray-200 focus:border-brand-blue'}`}
              autoComplete="off"
            />
            {feedback === 'correct' && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl">✅</span>
            )}
          </div>

           {/* Virtual Keyboard Integration */}
           <div className="transform scale-90 md:scale-100 transition-transform origin-top">
             <VirtualKeyboard activeChar={currentWord.text[userInput.length] || ''} />
           </div>

          {/* AI Hint Section */}
          <div className="min-h-[80px] flex items-center justify-center">
            {!aiHint ? (
              <button 
                onClick={fetchAiHint}
                disabled={loadingHint}
                className="flex items-center gap-2 text-gray-400 hover:text-brand-purple font-bold transition-colors"
              >
                {loadingHint ? (
                  <span className="animate-spin">🌀</span>
                ) : (
                  <>
                    <span>💡 需要 AI 老师提示吗？</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center animate-fade-in w-full">
                <p className="text-indigo-900 font-bold mb-1">"{aiHint.definition}"</p>
                <p className="text-indigo-600 italic">Example: {aiHint.sentence}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-gray-400 text-sm font-bold uppercase tracking-wider">
            <span>Progress: {currentWordIndex + 1} / {activeWords.length}</span>
            <span>{isCourseMode ? subTitle : '自由练习'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Typing;
