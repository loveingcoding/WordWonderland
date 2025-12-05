import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word, WordLibrary } from '../types';
import { explainWord } from '../services/gemini';
import { addXp } from '../services/storage';

interface TypingProps {
  libraries: WordLibrary[];
  onFinish: () => void;
}

const Typing: React.FC<TypingProps> = ({ libraries, onFinish }) => {
  const [activeLibraryId, setActiveLibraryId] = useState<string>(libraries[0]?.id || '');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiHint, setAiHint] = useState<{definition: string, sentence: string} | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const activeLibrary = libraries.find(l => l.id === activeLibraryId);
  const currentWord = activeLibrary?.words[currentWordIndex];
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentWordIndex, activeLibraryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    if (currentWord && val.toLowerCase() === currentWord.text.toLowerCase()) {
      setFeedback('correct');
      // Play success sound (simulated)
      setTimeout(nextWord, 800);
    } else if (currentWord && !currentWord.text.toLowerCase().startsWith(val.toLowerCase())) {
      setFeedback('wrong');
    } else {
      setFeedback('neutral');
    }
  };

  const nextWord = () => {
    addXp(10); // Reward
    setUserInput('');
    setFeedback('neutral');
    setAiHint(null);
    
    if (activeLibrary && currentWordIndex < activeLibrary.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentWordIndex(0); // Loop for now or show summary
        onFinish(); // Callback to refresh stats
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

  if (!activeLibrary || !currentWord) {
    return <div className="text-center p-10">Please select a library to start!</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
      {showConfetti && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 pointer-events-none">
          <div className="text-6xl animate-bounce">🎉 AWESOME! 🎉</div>
        </div>
      )}

      {/* Library Selector */}
      <div className="mb-8 w-full">
        <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Choose Word Pack</label>
        <select 
          value={activeLibraryId} 
          onChange={(e) => {
            setActiveLibraryId(e.target.value);
            setCurrentWordIndex(0);
            setUserInput('');
            setAiHint(null);
          }}
          className="w-full p-4 rounded-2xl border-2 border-gray-200 text-lg font-bold bg-white focus:border-brand-blue focus:ring-0 transition-colors"
        >
          {libraries.map(lib => (
            <option key={lib.id} value={lib.id}>{lib.name} ({lib.words.length} words)</option>
          ))}
        </select>
      </div>

      {/* Game Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-gray-200">
        <div className="bg-brand-blue p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-black/10">
            <div 
              className="h-full bg-brand-yellow transition-all duration-500" 
              style={{ width: `${((currentWordIndex) / activeLibrary.words.length) * 100}%` }}
            />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-4 drop-shadow-md tracking-wider">
            {currentWord.text}
          </h2>
          <div className="flex justify-center items-center gap-4 text-blue-100">
             <span className="text-xl font-mono opacity-80">{currentWord.phonetic || '//'}</span>
             <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{currentWord.translation}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type the word here..."
              className={`w-full text-center text-3xl font-bold p-6 rounded-2xl border-4 outline-none transition-all duration-300 placeholder-gray-300
                ${feedback === 'correct' ? 'border-brand-green bg-green-50 text-brand-green' : 
                  feedback === 'wrong' ? 'border-brand-orange bg-red-50 text-brand-orange animate-pulse' : 
                  'border-gray-200 focus:border-brand-blue'}`}
              autoComplete="off"
            />
            {feedback === 'correct' && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl">✅</span>
            )}
          </div>

          {/* AI Hint Section */}
          <div className="min-h-[100px] flex items-center justify-center">
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
                    <span>💡 Need a hint?</span>
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
            <span>Word {currentWordIndex + 1} of {activeLibrary.words.length}</span>
            <span>Typing Practice</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Typing;