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

    // Use a very stable model identifier
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
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

    if (!text) {
      throw new Error("Empty response from AI model");
    }

    return NextResponse.json({ text });
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
