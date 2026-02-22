import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// EXACT names from your confirmed list
const MODELS = [
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-pro-latest",
];

const SYSTEM_INSTRUCTION = `You are the NeuroCare AI Assistant. 
Keep your responses very brief and concise. Reply directly using clear sentences and numbered lists for organization. 
Do NOT use bullet points or "pointers". Avoid long paragraphs. Focus on:
1. NeuroCare navigation.
2. Screening process help.
3. Quick technical guidance.
Be direct and helpful.`;

export async function findWorkingModel() {
  // Default to 2.0-flash as it's the most capable stable version
  return "gemini-2.0-flash";
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

export async function streamChatResponse(modelName: string, prompt: string, history: any[], onChunk: (text: string) => void) {
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION
  });

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

  const result = await chat.sendMessageStream(prompt);
  let fullText = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(fullText);
  }
  return fullText;
}
