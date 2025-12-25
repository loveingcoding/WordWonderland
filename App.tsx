
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Typing from './pages/Typing';
import Fingering from './pages/Fingering';
import Lesson from './pages/Lesson';
import VideoGenerator from './components/VideoGenerator';
import LibraryManager from './components/LibraryManager';
import PlanetMap from './components/PlanetMap';
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
import { OFFICIAL_LIBRARIES } from './constants';
import { chatWithTutor } from './services/gemini';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProgress>(getUserProgress());
  const [libraries, setLibraries] = useState<WordLibrary[]>(getLibraries());
  const [currentMode, setCurrentMode] = useState<string>('HOME');
  
  // Specific state for navigating to a specific library (e.g. Official Textbooks)
  const [targetLibraryId, setTargetLibraryId] = useState<string | null>(null);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
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
    if (mode !== GameMode.TYPING) {
        setTargetLibraryId(null);
    }
  };

  const handleAddLibrary = (lib: WordLibrary) => {
    saveLibrary(lib);
    setLibraries(getLibraries());
  };

  const handleDeleteLibrary = (id: string) => {
    deleteLibrary(id);
    setLibraries(getLibraries());
  };

  // Handle "Start" click from Library Manager (for Official or Custom books)
  const handleStartLibrary = (id: string) => {
      setTargetLibraryId(id);
      setCurrentMode(GameMode.TYPING);
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
            { role: 'model' as const, parts: [{ text: "不好意思，老师现在有点累，请稍后再试！" }] }
        ]);
    } finally {
        setChatLoading(false);
    }
  };

  return (
    <Layout user={user} onNavigate={handleNavigate} currentMode={currentMode}>
      {currentMode === 'HOME' && (
         <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center mb-4 z-10">
               <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  选择你的 <span className="text-brand-blue">目的地</span>
               </h2>
               <p className="text-blue-200 mt-2">点击星球开始挑战</p>
            </div>
            <PlanetMap onSelectPlanet={(mode) => setCurrentMode(mode)} />
         </div>
      )}

      {currentMode === GameMode.FINGERING && (
        <Fingering />
      )}

      {/* Drill Mode / Legacy Typing Mode */}
      {currentMode === GameMode.TYPING && (
        <Typing 
            libraries={[...libraries, ...OFFICIAL_LIBRARIES]} 
            onFinish={refreshData} 
            initialLibraryId={targetLibraryId}
        />
      )}

      {/* New Classroom Mode */}
      {currentMode === GameMode.CLASSROOM && (
        <Lesson libraries={libraries} />
      )}

      {currentMode === GameMode.VIDEO_MAKER && (
        <VideoGenerator user={user} onDeductStars={handleDeductStars} />
      )}

      {currentMode === 'LIBRARY' && (
        <LibraryManager 
            libraries={libraries} 
            onAddLibrary={handleAddLibrary} 
            onDeleteLibrary={handleDeleteLibrary}
            onStartLibrary={handleStartLibrary}
        />
      )}

      {currentMode === GameMode.AI_CHAT && (
        <div className="flex flex-col h-[70vh]">
            <div className="bg-brand-purple p-4 text-white font-bold flex items-center gap-2 rounded-t-xl">
                <span>🤖</span> SENTENTIA - AI 语言实验室
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <div className="text-4xl mb-2">👋</div>
                        准备好了吗？用英语和我聊天吧！
                        <br/>Try saying: "Hello! Teach me about space."
                    </div>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {chatLoading && <div className="text-gray-400 text-sm ml-4 animate-pulse">信号接收中...</div>}
            </div>
            <div className="p-4 bg-white border-t border-gray-200 flex gap-2 rounded-b-xl">
                <input 
                    className="flex-1 p-3 rounded-xl border border-gray-300 outline-none focus:border-brand-purple"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="输入英语..."
                />
                <button onClick={handleChat} disabled={chatLoading} className="bg-brand-purple text-white px-6 rounded-xl font-bold hover:bg-purple-600 transition">发送</button>
            </div>
        </div>
      )}
    </Layout>
  );
};

export default App;