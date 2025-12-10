
import React, { useState, useEffect } from 'react';
import { FINGERING_LESSONS } from '../constants';
import VirtualKeyboard from '../components/VirtualKeyboard';
import SpiderGame from '../components/SpiderGame';
import { addXp } from '../services/storage';

const Fingering: React.FC = () => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100 });

  const activeLesson = FINGERING_LESSONS.find(l => l.id === selectedLessonId);

  // If Boss level is selected
  if (selectedLessonId === 'game_spider') {
      return (
          <SpiderGame 
            onGameOver={(score) => {
                addXp(Math.floor(score / 5));
            }}
            onExit={() => setSelectedLessonId(null)}
          />
      );
  }

  const handleKeyDown = (e: KeyboardEvent) => {
     if (completed || !activeLesson) return;

     // Ignore modifiers
     if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
     
     // Start timer on first key
     if (!startTime) setStartTime(Date.now());

     // Backspace handling
     if (e.key === 'Backspace') {
         setInput(prev => prev.slice(0, -1));
         return;
     }

     if (e.key.length === 1) {
         const nextInput = input + e.key;
         setInput(nextInput);

         // Check completion
         if (nextInput.length >= activeLesson.content.length) {
             finishLesson(nextInput, activeLesson.content);
         }
     }
  };

  const finishLesson = (finalInput: string, target: string) => {
      setCompleted(true);
      const timeMin = (Date.now() - (startTime || Date.now())) / 60000;
      
      // Calculate WPM (standard: 5 chars = 1 word)
      const wpm = Math.round((finalInput.length / 5) / (timeMin || 0.01));
      
      // Accuracy
      let correct = 0;
      for(let i=0; i<target.length; i++) {
          if (finalInput[i] === target[i]) correct++;
      }
      const accuracy = Math.round((correct / target.length) * 100);

      setStats({ wpm, accuracy });
      addXp(20); // Reward
  };

  // Attach listener
  useEffect(() => {
      if (selectedLessonId) {
          window.addEventListener('keydown', handleKeyDown);
      }
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLessonId, input, startTime, completed]);


  const renderTextOverlay = () => {
      if (!activeLesson) return null;
      return (
          <div className="text-4xl md:text-5xl font-mono tracking-widest text-gray-400 mb-8 break-all leading-relaxed relative">
              {activeLesson.content.split('').map((char, idx) => {
                  let colorClass = "text-gray-300";
                  let borderClass = "";
                  
                  if (idx < input.length) {
                      // Already typed
                      colorClass = input[idx] === char ? "text-gray-800" : "text-red-500 bg-red-100";
                  } else if (idx === input.length) {
                      // Current cursor
                      colorClass = "text-brand-blue";
                      borderClass = "border-b-4 border-brand-blue pb-1";
                  }

                  return (
                      <span key={idx} className={`${colorClass} ${borderClass} inline-block mx-[1px]`}>
                          {char === ' ' ? '␣' : char}
                      </span>
                  );
              })}
          </div>
      );
  };

  // Main Menu View
  if (!selectedLessonId) {
      return (
          <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                  <h2 className="text-4xl font-display font-bold text-gray-800">🖐️ 指法闯关</h2>
                  <p className="text-gray-500 mt-2">学会正确的手指姿势，打字就像飞一样快！</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {FINGERING_LESSONS.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setInput('');
                            setStartTime(null);
                            setCompleted(false);
                        }}
                        className={`
                            relative group p-6 rounded-2xl text-left border-b-4 transition-transform hover:-translate-y-1 active:translate-y-0
                            ${lesson.id === 'game_spider' 
                                ? 'bg-slate-800 text-white border-slate-950 hover:bg-slate-700' 
                                : 'bg-white text-gray-800 border-gray-200 hover:border-brand-blue'}
                        `}
                      >
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-2xl font-bold">{lesson.id === 'game_spider' ? '🕷️' : '🎓'}</span>
                              <div className="flex gap-1">
                                  {[...Array(lesson.difficulty)].map((_,i) => (
                                      <span key={i} className="text-yellow-400">★</span>
                                  ))}
                              </div>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                          <p className={`text-sm ${lesson.id === 'game_spider' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {lesson.description}
                          </p>
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  // Lesson View
  return (
      <div className="flex flex-col h-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setSelectedLessonId(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-brand-blue font-bold"
              >
                  ⬅️ 返回菜单
              </button>
              <h2 className="text-xl font-bold text-gray-700">{activeLesson.title}</h2>
          </div>

          {/* Typing Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
               {!completed ? (
                   <>
                        {renderTextOverlay()}
                        <div className="mt-12 w-full">
                            <VirtualKeyboard activeChar={activeLesson.content[input.length] || ''} />
                        </div>
                   </>
               ) : (
                   <div className="bg-white p-10 rounded-3xl shadow-xl text-center animate-bounce-in">
                       <h3 className="text-4xl font-bold text-brand-blue mb-6">🎉 闯关成功！</h3>
                       <div className="flex gap-8 justify-center mb-8">
                           <div>
                               <div className="text-gray-400 text-sm uppercase font-bold">速度</div>
                               <div className="text-5xl font-display font-bold text-gray-800">{stats.wpm} <span className="text-xl">WPM</span></div>
                           </div>
                           <div>
                               <div className="text-gray-400 text-sm uppercase font-bold">正确率</div>
                               <div className="text-5xl font-display font-bold text-green-500">{stats.accuracy}%</div>
                           </div>
                       </div>
                       <button 
                           onClick={() => setSelectedLessonId(null)}
                           className="bg-brand-yellow text-gray-900 px-8 py-4 rounded-xl font-bold text-xl hover:bg-yellow-400"
                       >
                           继续下一关
                       </button>
                   </div>
               )}
          </div>
      </div>
  );
};

export default Fingering;
