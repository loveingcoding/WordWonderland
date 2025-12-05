import { GoogleGenAI, Type } from "@google/genai";

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
      contents: `Explain the word "${word}" to a 7-year-old child. Provide a very short definition and one simple example sentence.`,
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
 * Generates a reward video using Veo.
 */
export const generateRewardVideo = async (
  prompt: string, 
  onProgress: (msg: string) => void
): Promise<string | null> => {
  try {
    // Re-instantiate to capture latest key if needed (though env var is static in this context, 
    // real implementation might use dynamic key injection).
    const ai = getAI(); 
    
    onProgress("Dreaming up the video... (This takes a moment)");

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A cute, colorful, 3d animation style video suitable for children: ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    onProgress("Rendering magic...");
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      onProgress("Still painting the pixels...");
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
export const chatWithTutor = async (history: {role: 'user' | 'model', parts: [{text: string}]}[], message: string) => {
    const ai = getAI();
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are a friendly, encouraging English teacher for elementary school students. Keep answers short, use simple words, and use emojis."
        },
        history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text;
}