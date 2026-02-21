import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// EXACT names from your list-models test
const MODELS = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-pro-latest",
  "gemini-2.5-flash",
];

const SYSTEM_INSTRUCTION = `You are the NeuroCare AI Assistant. 
Keep your responses very brief and concise. Use bullet points for clarity. 
Avoid long paragraphs. Focus on:
1. NeuroCare navigation.
2. Screening process help.
3. Quick technical guidance.
Be direct and helpful.`;

export async function findWorkingModel() {
  // Default to flash-latest as it's the most stable free tier
  return "gemini-flash-latest";
}

export async function generateChatResponse(modelName: string, prompt: string, history: any[]) {
  const attemptRequest = async (m: string) => {
    // We use the SDK here for better error handling and stability
    const model = genAI.getGenerativeModel({ 
      model: m,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // Format history for the SDK
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts
      })),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  };

  try {
    console.log(`Trying model: ${modelName}`);
    return await attemptRequest(modelName);
  } catch (error: any) {
    console.warn(`Model ${modelName} failed:`, error.message);
    
    // Fallback logic for 429 (Quota) or 404 (Not Found)
    for (const fallback of MODELS) {
      if (fallback === modelName) continue;
      try {
        console.log(`Trying fallback: ${fallback}`);
        return await attemptRequest(fallback);
      } catch (e: any) {
        console.warn(`Fallback ${fallback} failed:`, e.message);
        continue;
      }
    }
    
    // Provide a helpful error message if everything fails
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      throw new Error("API Quota exceeded. Please wait a minute before trying again or check your Google AI Studio plan.");
    }
    throw error;
  }
}
