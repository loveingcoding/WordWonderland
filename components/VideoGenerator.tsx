
import React, { useState } from 'react';
import { generateVideoScript, generateRewardVideo } from '../services/gemini';
import { UserProgress, VideoScript } from '../types';

interface VideoGeneratorProps {
  user: UserProgress;
  onDeductStars: (amount: number) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ user, onDeductStars }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [videoData, setVideoData] = useState<{url: string, script: VideoScript} | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);

  const COST = 5; // Stars cost

  const getAIStudio = () => (window as any).aistudio;

  const checkApiKey = async () => {
    const aistudio = getAIStudio();
    if (aistudio) {
        try {
           await aistudio.openSelectKey();
           setApiKeyReady(true);
        } catch(e) {
            console.error("Key selection failed", e);
            setStatusMsg("无法选择 API Key。");
        }
    } else {
        setStatusMsg("未检测到 AI Studio 环境。");
    }
  };

  const handleGenerate = async () => {
    if (user.stars < COST) {
      setStatusMsg(`星星不够啦！你需要 ${COST} 颗星星。快去背单词吧！`);
      return;
    }
    if (!userInput.trim()) {
      setStatusMsg("请告诉我想看什么视频哦！");
      return;
    }

    const aistudio = getAIStudio();
    if (!apiKeyReady && aistudio) {
        await checkApiKey();
    }

    setLoading(true);
    setVideoData(null);
    onDeductStars(COST);
    setStatusMsg("正在召唤 AI 导演...");

    try {
      // Step 1: Generate Script
      const script = await generateVideoScript(userInput);
      setStatusMsg(`导演设计好了：${script.topic}... 开始拍摄！`);

      // Step 2: Generate Video
      const url = await generateRewardVideo(script.visualPrompt, (msg) => setStatusMsg(msg));
      
      if (url) {
          setVideoData({ url, script });
          setStatusMsg("视频制作完成！🎉");
      }
    } catch (error: any) {
      console.error(error);
      setStatusMsg("哎呀！出了一点小问题: " + (error.message || '请稍后再试'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold text-brand-orange">🎬 魔法视频工坊</h2>
        <p className="text-gray-600 text-lg">
          花费 <span className="font-bold text-brand-yellow bg-black/5 px-2 rounded">5 颗星星</span>，
          把你学到的单词变成动画片！
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
        <div className="space-y-4">
            <label className="block font-bold text-gray-700 text-lg">你想看什么故事？</label>
            <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="例如：一只猫在月球上吃西瓜..."
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-brand-orange outline-none h-32 resize-none text-lg"
                disabled={loading}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-gray-500">
                    我的星星: <span className="font-bold text-brand-yellow text-xl">{user.stars}</span>
                </div>
                
                {!apiKeyReady && getAIStudio() && (
                     <button 
                        onClick={checkApiKey}
                        className="text-xs text-blue-500 underline"
                     >
                        配置 API Key (需要付费项目)
                     </button>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading || user.stars < COST}
                    className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2
                        ${loading || user.stars < COST ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-orange shadow-orange-200 shadow-xl'}`}
                >
                    {loading ? '正在施展魔法...' : `✨ 生成视频 (-${COST} ⭐)`}
                </button>
            </div>
            
            {statusMsg && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-center font-medium animate-pulse border border-blue-100">
                    {statusMsg}
                </div>
            )}
        </div>
      </div>

      {videoData && (
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl animate-fade-in border-4 border-brand-yellow relative group">
            <video 
                src={videoData.url} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video"
            />
            {/* Subtitle/Caption Box */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 text-white text-center">
                <p className="text-xl md:text-2xl font-bold font-display text-yellow-300 drop-shadow-md mb-2">
                    "{videoData.script.captionEnglish}"
                </p>
                <p className="text-lg md:text-xl font-sans text-white/90">
                    {videoData.script.captionChinese}
                </p>
            </div>
        </div>
      )}

      {videoData && (
         <div className="text-center">
             <a href={videoData.url} download="magic-video.mp4" className="inline-block bg-brand-blue text-white px-6 py-2 rounded-full font-bold hover:bg-blue-600 transition">
                 ⬇️ 下载我的视频
             </a>
         </div>
      )}
      
      <div className="text-center text-xs text-gray-400">
          技术支持：Google Veo。生成视频需要使用付费的 Google Cloud 项目。
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline"> 查看计费文档</a>
      </div>
    </div>
  );
};

export default VideoGenerator;
