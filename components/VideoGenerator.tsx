import React, { useState } from 'react';
import { generateRewardVideo } from '../services/gemini';
import { UserProgress } from '../types';

interface VideoGeneratorProps {
  user: UserProgress;
  onDeductStars: (amount: number) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ user, onDeductStars }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);

  const COST = 5; // Stars cost

  const getAIStudio = () => (window as any).aistudio;

  const checkApiKey = async () => {
    const aistudio = getAIStudio();
    if (aistudio) {
        // Optimistic check per guidelines
        try {
           await aistudio.openSelectKey();
           setApiKeyReady(true);
        } catch(e) {
            console.error("Key selection failed", e);
            setStatusMsg("Could not select API key.");
        }
    } else {
        setStatusMsg("AI Studio environment not detected.");
    }
  };

  const handleGenerate = async () => {
    if (user.stars < COST) {
      setStatusMsg(`Not enough stars! You need ${COST} stars.`);
      return;
    }
    if (!prompt.trim()) {
      setStatusMsg("Please write something for the video!");
      return;
    }

    // Ensure key is ready if required
    const aistudio = getAIStudio();
    if (!apiKeyReady && aistudio) {
        await checkApiKey();
        // Don't return, proceed assuming success per guidelines
    }

    setLoading(true);
    setVideoUrl(null);
    onDeductStars(COST);

    try {
      const url = await generateRewardVideo(prompt, (msg) => setStatusMsg(msg));
      setVideoUrl(url);
      setStatusMsg("Video ready! 🎉");
    } catch (error: any) {
      setStatusMsg("Oops! Something went wrong. " + (error.message || ''));
      // Refund? Maybe in a real app.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold text-brand-orange">Magic Video Maker 🎬</h2>
        <p className="text-gray-600 text-lg">Spend <span className="font-bold text-brand-yellow bg-black/5 px-2 rounded">5 Stars</span> to make your own cartoon video!</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100">
        <div className="space-y-4">
            <label className="block font-bold text-gray-700">What do you want to see?</label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A blue cat flying a spaceship to the moon..."
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-brand-orange outline-none h-32 resize-none text-lg"
                disabled={loading}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-gray-500">
                    Your Stars: <span className="font-bold text-brand-yellow text-xl">{user.stars}</span>
                </div>
                
                {/* Check for billing capability UI if needed, usually handled by window.aistudio modal */}
                {!apiKeyReady && getAIStudio() && (
                     <button 
                        onClick={checkApiKey}
                        className="text-xs text-blue-500 underline"
                     >
                        Configure API Key (Paid Project Required)
                     </button>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={loading || user.stars < COST}
                    className={`px-8 py-4 rounded-xl font-bold text-white text-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2
                        ${loading || user.stars < COST ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-orange shadow-orange-200 shadow-xl'}`}
                >
                    {loading ? 'Magic happening...' : `✨ Create Video (-${COST} ⭐)`}
                </button>
            </div>
            
            {statusMsg && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-center font-medium animate-pulse">
                    {statusMsg}
                </div>
            )}
        </div>
      </div>

      {videoUrl && (
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl animate-fade-in border-4 border-brand-yellow">
            <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video"
            />
            <div className="p-4 bg-gray-900 text-center">
                <a href={videoUrl} download="magic-video.mp4" className="text-white font-bold hover:text-brand-yellow">⬇️ Download Video</a>
            </div>
        </div>
      )}
      
      <div className="text-center text-xs text-gray-400">
          Powered by Google Veo. Requires a paid billing project for video generation. 
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline"> Billing Docs</a>
      </div>
    </div>
  );
};

export default VideoGenerator;