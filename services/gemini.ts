
import { GoogleGenAI, Type } from "@google/genai";
import { VideoScript } from "../types";

// Ensure API Key presence check is handled in components or env check
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a helpful explanation and example sentence for a word.
 */
export const explainWord = async (word: string): Promise<{ definition: string; sentence: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain the word "${word}" to a 7-year-old child using simple English. Provide a very short definition and one simple example sentence.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: { type: Type.STRING },
            sentence: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return { definition: "Learning is fun!", sentence: `Let's practice the word ${word}.` };
  }
};

/**
 * Step 1: Generate a script and visual description for the video.
 * This ensures the video is relevant and educational.
 */
export const generateVideoScript = async (userPrompt: string): Promise<VideoScript> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are an educational video director for children. 
    Based on the user's input: "${userPrompt}", create a plan for a 6-second educational video.
    
    Return a JSON object with:
    1. 'visualPrompt': A highly detailed, vivid description for an AI video generator (like Veo). It should be cute, colorful, 3D animation style, suitable for kids.
    2. 'captionEnglish': A simple English sentence describing the scene or teaching a related word.
    3. 'captionChinese': The Chinese translation of that sentence.
    4. 'topic': A 2-3 word summary of the topic.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualPrompt: { type: Type.STRING },
          captionEnglish: { type: Type.STRING },
          captionChinese: { type: Type.STRING },
          topic: { type: Type.STRING }
        },
        required: ["visualPrompt", "captionEnglish", "captionChinese", "topic"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("Failed to generate script");
}

/**
 * Step 2: Generate the actual video using Veo based on the refined prompt.
 */
export const generateRewardVideo = async (
  visualPrompt: string, 
  onProgress: (msg: string) => void
): Promise<string | null> => {
  try {
    const ai = getAI(); 
    
    onProgress("正在构思画面... (需要一点时间)");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: visualPrompt, // Use the refined prompt from Gemini Flash
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    onProgress("正在渲染魔法...");
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      onProgress("还在努力绘制像素...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to return a URI");

    // Construct final URL with API key
    return `${downloadLink}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error("Veo Error:", error);
    throw error;
  }
};

/**
 * Chat with the AI Tutor
 */
export const chatWithTutor = async (history: {role: 'user' | 'model', parts: {text: string}[]}[], message: string) => {
    const ai = getAI();
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "你是一位友善、耐心的小学英语老师。请用简单、鼓励性的语言回复学生。如果是英语练习，请纠正错误。如果学生用中文提问，你可以用中文回答，但尽量引导他们学英语。多用表情符号。"
        },
        history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}
