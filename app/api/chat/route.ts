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
    const { modelName, prompt, history } = await req.json();

    if (!API_KEY) {
      return NextResponse.json({ error: "API Key not configured on server" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: modelName || "gemini-flash-latest",
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const chat = model.startChat({
      history: (history || []).map((msg: any) => ({
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
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
