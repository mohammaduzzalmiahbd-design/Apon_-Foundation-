import { GoogleGenAI } from "@google/genai";

// Safe access to process.env for browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    // Ignore reference errors
  }
  return '';
};

// Removed top-level initialization to prevent loading crashes
// const ai = new GoogleGenAI({ apiKey: apiKey }); 

export const generateConstitutionContent = async (topic: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key not configured.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a formal and professional constitution clause for a non-profit foundation regarding: "${topic}". 
      
      Rules:
      1. Language: Standard Bengali (প্রমিত চলিত ভাষা). Do NOT use Sadhu bhasha.
      2. Structure: Use 'ধারা [number]:' for main articles and 'উপধারা [number]:' for sub-articles.
      3. Tone: Legalistic but clear.
      
      Output format example:
      ধারা ১: সাধারণ সভা
      উপধারা ১.১: বছরে অন্তত একবার সাধারণ সভা অনুষ্ঠিত হবে।
      উপধারা ১.২: সকল সদস্যের উপস্থিতিতে কোরাম পূর্ণ হবে।`,
    });
    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content. Please check your API key.";
  }
};

export const analyzeFinancials = async (summaryData: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key not configured.";

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following financial summary for our foundation and provide 3 key insights or suggestions in Bengali: 
      ${summaryData}`,
    });
    return response.text || "Could not analyze data.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error analyzing data.";
  }
};