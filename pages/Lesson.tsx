
import React, { useState, useEffect, useRef } from 'react';
import { DEMO_LESSON } from '../constants';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { addXp } from '../services/storage';

const Lesson: React.FC = () => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [errorCharIndex, setErrorCharIndex] = useState<number | null>(null);
  const [stats, setStats] = useState({ correctKeystrokes: 0, totalKeystrokes: 0, startTime: 0 });
  const [isCompleted, setIsCompleted] = useState(false);

  // Focus management
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWordData = DEMO_LESSON.words[currentWordIdx];
  const targetWord = currentWordData.text;

  useEffect(() => {
    // Reset input on word change
    setInput('');
    setErrorCharIndex(null);
    if (containerRef.current) containerRef.current.focus();
  }, [currentWordIdx]);

  useEffect(() => {
    // Initialize start time on mount
    setStats(s => ({ ...s, startTime: Date.now() }));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCompleted) return;
    
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
          if (currentWordIdx < DEMO_LESSON.words.length - 1) {
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

  const progressPercent = Math.round(((currentWordIdx) / DEMO_LESSON.words.length) * 100);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-brand-yellow text-center max-w-lg">
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
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-brand-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition"
          >
            Review Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full max-w-5xl mx-auto focus:outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={containerRef}
    >
      {/* Top Section: Multimedia & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Placeholder Video Player */}
        <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-lg group">
           {/* Fake Play Button */}
           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition cursor-pointer">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
           </div>
           <div className="absolute bottom-4 left-4 text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">
              Unit 1: Describing People
           </div>
        </div>

        {/* Word Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-brand-yellow text-xs font-bold px-3 py-1 rounded-bl-xl text-yellow-900">
             Word {currentWordIdx + 1}/{DEMO_LESSON.words.length}
           </div>
           
           <h3 className="text-4xl font-display font-bold text-gray-800 mb-2">{currentWordData.text}</h3>
           
           <div className="flex items-baseline gap-3 mb-4">
             <span className="font-mono text-gray-500 text-lg">{currentWordData.phonetic}</span>
             <span className="bg-blue-100 text-brand-blue px-2 py-0.5 rounded text-sm font-bold">{currentWordData.type}</span>
           </div>
           
           <div className="space-y-2">
             <p className="text-xl font-bold text-gray-700">{currentWordData.translation}</p>
             <p className="text-gray-500 italic">"{currentWordData.example}"</p>
           </div>
        </div>
      </div>

      {/* Middle: Typing Area (The "Blackboard") */}
      <div className="flex-1 bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
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
         <div className="flex gap-1 md:gap-2 mb-12">
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
