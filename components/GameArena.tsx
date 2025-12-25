
import React, { useState, useEffect } from 'react';
import SpiderGame from './SpiderGame';
import { addXp } from '../services/storage';

interface GameArenaProps {
  vocabularyList: string[];
  onExit: () => void;
}

const GameArena: React.FC<GameArenaProps> = ({ vocabularyList, onExit }) => {
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'SUMMARY'>('INTRO');
  const [countDown, setCountDown] = useState(3);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (gameState === 'INTRO') {
      const timer = setInterval(() => {
        setCountDown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('PLAYING');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    // Sync points
    addXp(Math.floor(score / 5)); // 1 XP per 5 points in game
    onExit(); // For now, just exit, or we could show a summary card here too.
    // Ideally we exit to let Lesson handle the summary view, but SpiderGame has a Game Over screen now.
    // The SpiderGame calls onGameOver when "Continue" is clicked in its internal menu.
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
       {/* Close Button */}
       <button 
         onClick={onExit} 
         className="absolute top-6 right-6 text-white/50 hover:text-white text-xl font-bold z-50"
       >
         ✖ CLOSE
       </button>

       {gameState === 'INTRO' && (
         <div className="text-center animate-bounce-in">
            <h2 className="text-8xl font-display font-bold text-brand-yellow drop-shadow-lg mb-4">
              {countDown}
            </h2>
            <p className="text-white text-2xl font-bold uppercase tracking-widest">Get Ready!</p>
            <div className="mt-8 text-gray-400">
               Type the words to protect your web!
            </div>
         </div>
       )}

       {gameState === 'PLAYING' && (
         <div className="w-full max-w-5xl aspect-video h-[80vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
            <SpiderGame 
              mode="WORD"
              customWords={vocabularyList}
              onGameOver={handleGameOver}
              onExit={onExit}
            />
         </div>
       )}
    </div>
  );
};

export default GameArena;
