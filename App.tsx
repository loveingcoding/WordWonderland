import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Typing from './pages/Typing';
import VideoGenerator from './components/VideoGenerator';
import LibraryManager from './components/LibraryManager';
import { 
  UserProgress, 
  GameMode, 
  WordLibrary 
} from './types';
import { 
  getUserProgress, 
  saveUserProgress, 
  getLibraries, 
  saveLibrary,
  deleteLibrary
} from './services/storage';
import { chatWithTutor } from './services/gemini';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProgress>(getUserProgress());
  const [libraries, setLibraries] = useState<WordLibrary[]>(getLibraries());
  const [currentMode, setCurrentMode] = useState<string>('HOME');
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', parts: [{text: string}]}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Sync state to local storage on change
    saveUserProgress(user);
  }, [user]);

  const refreshData = () => {
    setUser(getUserProgress());
    setLibraries(getLibraries());
  };

  const handleNavigate = (mode: string) => {
    setCurrentMode(mode);
  };

  const handleAddLibrary = (lib: WordLibrary) => {
    saveLibrary(lib);
    setLibraries(getLibraries());
  };

  const handleDeleteLibrary = (id: string) => {
    deleteLibrary(id);
    setLibraries(getLibraries());
  };

  const handleDeductStars = (amount: number) => {
    const newUser = { ...user, stars: user.stars - amount };
    setUser(newUser);
  };

  // AI Chat Handler
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    const userMsg = chatInput;
    setChatInput('');
    
    // Optimistic update
    const newHistory = [
        ...chatHistory, 
        { role: 'user' as const, parts: [{ text: userMsg }] }
    ];
    setChatHistory(newHistory);

    try {
        const response = await chatWithTutor(newHistory, userMsg);
        setChatHistory([
            ...newHistory,
            { role: 'model' as const, parts: [{ text: response }] }
        ]);
    } catch (e) {
        setChatHistory([
            ...newHistory,
            { role: 'model' as const, parts: [{ text: "Sorry, I'm taking a nap. Try again later!" }] }
        ]);
    } finally {
        setChatLoading(false);
    }
  };

  return (
    <Layout user={user} onNavigate={handleNavigate} currentMode={currentMode}>
      {currentMode === 'HOME' && (
         <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-display font-bold text-gray-800">
               Hello, <span className="text-brand-blue">Explorer!</span> 👋
            </h2>
            <p className="text-xl text-gray-500 max-w-lg">
               Ready to learn some new words today? Choose a game from the menu to start your adventure!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
               <button onClick={() => setCurrentMode(GameMode.TYPING)} className="p-8 bg-brand-yellow rounded-3xl shadow-lg hover:scale-105 transition transform text-left">
                  <span className="text-4xl block mb-2">⌨️</span>
                  <span className="text-2xl font-bold text-gray-800">Typing Game</span>
                  <p className="opacity-70">Practice spelling words!</p>
               </button>
               <button onClick={() => setCurrentMode(GameMode.VIDEO_MAKER)} className="p-8 bg-brand-orange rounded-3xl shadow-lg hover:scale-105 transition transform text-left">
                  <span className="text-4xl block mb-2">🎬</span>
                  <span className="text-2xl font-bold text-white">Magic Studio</span>
                  <p className="text-white opacity-80">Make videos with stars!</p>
               </button>
            </div>
         </div>
      )}

      {currentMode === GameMode.TYPING && (
        <Typing libraries={libraries} onFinish={refreshData} />
      )}

      {currentMode === GameMode.VIDEO_MAKER && (
        <VideoGenerator user={user} onDeductStars={handleDeductStars} />
      )}

      {currentMode === 'LIBRARY' && (
        <LibraryManager 
            libraries={libraries} 
            onAddLibrary={handleAddLibrary} 
            onDeleteLibrary={handleDeleteLibrary}
        />
      )}

      {currentMode === GameMode.AI_CHAT && (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-brand-purple p-4 text-white font-bold flex items-center gap-2">
                <span>🤖</span> AI Teacher
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">Say "Hello" to start practicing!</div>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {chatLoading && <div className="text-gray-400 text-sm ml-4">Teacher is typing...</div>}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                <input 
                    className="flex-1 p-3 rounded-xl border border-gray-300 outline-none focus:border-brand-purple"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Type a message..."
                />
                <button onClick={handleChat} disabled={chatLoading} className="bg-brand-purple text-white px-6 rounded-xl font-bold">Send</button>
            </div>
        </div>
      )}
    </Layout>
  );
};

export default App;