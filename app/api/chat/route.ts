import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `You are the NeuroCare AI Assistant. 
Keep your responses very brief and concise. Reply directly using clear sentences and numbered lists for organization. 
Do NOT use bullet points or "pointers". Avoid long paragraphs. Focus on:
1. NeuroCare navigation.
2. Screening process help.
3. Quick technical guidance.
Be direct and helpful.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json();

    if (!API_KEY) {
      console.error("Chat API Error: GEMINI_API_KEY is missing.");
      return NextResponse.json({ error: "Server configuration error: API Key missing." }, { status: 500 });
    }

    // List of models to try in order of preference (Confirmed working names)
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      // Retry logic for 503 errors (Overloaded)
      const MAX_RETRIES = 3;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: SYSTEM_INSTRUCTION
          });

          // Format history for the generateContent call
          const contents = [
            ...(history || []).map((msg: any) => ({
              role: msg.role === 'model' ? 'model' : 'user',
              parts: msg.parts
            })),
            { role: 'user', parts: [{ text: prompt }] }
          ];

          const result = await model.generateContent({
            contents,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          });

          const response = await result.response;
          const text = response.text();

          if (text) {
            return NextResponse.json({ text });
          }
        } catch (error: any) {
          lastError = error;
          
          // If it's a 503 (Overloaded) or 429 (Quota), wait and retry or switch model
          const isRetryable = error.message?.includes("503") || error.message?.includes("429") || error.message?.includes("quota");
          
          if (isRetryable) {
            if (attempt < MAX_RETRIES - 1 && (error.message?.includes("503"))) {
              console.warn(`Model ${modelName} overloaded (503), retrying attempt ${attempt + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Wait 1s, then 2s
              continue;
            }
            console.warn(`Model ${modelName} failed or exhausted, trying next model string...`);
            break; // Try next model in the list
          }
          
          throw error; // Other errors (like 401/404) are fatal
        }
      }
    }

    throw lastError || new Error("All models failed to respond");
  } catch (error: any) {
    console.error('DETAILED Chat API Error:', error);
    
    // Return the actual error message to help the user debug (e.g., "API_KEY_INVALID" or "MODEL_NOT_FOUND")
    const errorMessage = error.message || "Unknown AI Error";
    return NextResponse.json({ 
      error: errorMessage,
      details: "Check server logs for full stack trace."
    }, { status: 500 });
  }
}
