
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Typing from './pages/Typing';
import Fingering from './pages/Fingering';
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
            { role: 'model' as const, parts: [{ text: "不好意思，老师现在有点累，请稍后再试！" }] }
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
               你好, <span className="text-brand-blue">小探险家!</span> 👋
            </h2>
            <p className="text-xl text-gray-500 max-w-lg">
               准备好学习新单词了吗？从菜单中选择一个游戏开始冒险吧！
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
               <button onClick={() => setCurrentMode(GameMode.FINGERING)} className="p-8 bg-brand-purple rounded-3xl shadow-lg hover:scale-105 transition transform text-left">
                  <span className="text-4xl block mb-2">🖐️</span>
                  <span className="text-2xl font-bold text-white">指法闯关</span>
                  <p className="text-white opacity-80">从零开始学打字！</p>
               </button>
               <button onClick={() => setCurrentMode(GameMode.TYPING)} className="p-8 bg-brand-yellow rounded-3xl shadow-lg hover:scale-105 transition transform text-left">
                  <span className="text-4xl block mb-2">⌨️</span>
                  <span className="text-2xl font-bold text-gray-800">单词拼写</span>
                  <p className="opacity-70">练习拼写，赢取星星！</p>
               </button>
               <button onClick={() => setCurrentMode(GameMode.VIDEO_MAKER)} className="p-8 bg-brand-orange rounded-3xl shadow-lg hover:scale-105 transition transform text-left">
                  <span className="text-4xl block mb-2">🎬</span>
                  <span className="text-2xl font-bold text-white">魔法视频</span>
                  <p className="text-white opacity-80">用星星制作你的专属动画！</p>
               </button>
            </div>
         </div>
      )}

      {currentMode === GameMode.FINGERING && (
        <Fingering />
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
            <div className="bg-brand-green p-4 text-white font-bold flex items-center gap-2">
                <span>🤖</span> AI 英语老师
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">说 "Hello" 开始练习吧！</div>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-green text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {chatLoading && <div className="text-gray-400 text-sm ml-4">老师正在输入...</div>}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                <input 
                    className="flex-1 p-3 rounded-xl border border-gray-300 outline-none focus:border-brand-green"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="输入消息..."
                />
                <button onClick={handleChat} disabled={chatLoading} className="bg-brand-green text-white px-6 rounded-xl font-bold">发送</button>
            </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
