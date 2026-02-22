import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const readingText = (formData.get('readingText') as string) || '';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const refWordCount = readingText.split(/\s+/).filter(w => w.length > 0).length || 50;

    // Default dynamic "Safe" fallback data (low score for short readings)
    const getDynamicFallback = (transcriptText: string = "") => {
      const words = transcriptText.split(/\s+/).filter(w => w.length > 0);
      const count = words.length;
      // If we have a transcript but it's very short compared to reference, score should be low
      const matchRatio = Math.min(1, count / refWordCount);
      const accuracy = Math.round(matchRatio * 100);
      
      return {
        transcript: transcriptText || "Captured audio analysis.",
        metrics: {
          wordsPerMinute: transcriptText ? Math.round(count * 1.5) : 0,
          pauseFrequency: 0.2,
          silenceDetected: count < 5,
          fillerWords: 0,
          fluencyStability: transcriptText ? 80 : 20,
          wordCount: count,
          wordMatchAccuracy: accuracy
        },
        score: Math.max(10, Math.round(accuracy * 0.8)) // Low score if only few words read
      };
    };

    if (!API_KEY) {
      return NextResponse.json(getDynamicFallback());
    }

    try {
      const buffer = await audioFile.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');

      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `CRITICAL TASK: Analyze this reading assessment audio against the REFERENCE TEXT.
      REFERENCE TEXT: "${readingText}"

      STRICT RULES:
      1. TRANSCRIPTION: Transcribe the audio VERBATIM. If the speaker stops early, do NOT complete the sentences. If they say something unrelated, transcribe that exactly. Do NOT "fix" or "fill in" the text based on the reference.
      2. ACCURACY: Calculate "wordMatchAccuracy" (0-100) as a strict percentage of the REFERENCE TEXT words correctly spoken. 
         Example: If reference has 100 words and speaker only says 10 correct words, accuracy is EXACTLY 10%.
      3. HALLUCINATION WARNING: Do not assume the speaker read the whole text if they didn't. Be brutally honest.
      4. STABILITY: Calculate "stabilityScore" (0-100) based ONLY on the parts they actually spoke.
      
      Return ONLY a JSON object:
      {
        "transcript": "...",
        "fillerCount": 0,
        "wordMatchAccuracy": 0,
        "stabilityScore": 0,
        "wordsPerMinute": 0,
        "pauseFrequency": 0.0
      }`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Audio,
            mimeType: "audio/webm"
          }
        }
      ]);

      const response = await result.response;
      const textResponse = response.text();
      
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        
        // Final strict sanity check: accuracy cannot exceed the ratio of words spoken
        const transcriptWords = (analysisData.transcript || "").split(/\s+/).filter(w => w.length > 0).length;
        const physicalLimit = (transcriptWords / refWordCount) * 100;
        const calculatedMatchAcc = Math.min(analysisData.wordMatchAccuracy, physicalLimit);

        return NextResponse.json({
          transcript: analysisData.transcript,
          metrics: {
            wordsPerMinute: analysisData.wordsPerMinute || 0,
            pauseFrequency: analysisData.pauseFrequency || 0,
            silenceDetected: transcriptWords < 5,
            fillerWords: analysisData.fillerCount || 0,
            fluencyStability: analysisData.stabilityScore || 0,
            wordCount: transcriptWords,
            wordMatchAccuracy: Math.round(calculatedMatchAcc)
          },
          score: Math.round(calculatedMatchAcc), // Score is now primarily driven by literal accuracy
        });
      }
    } catch (innerError) {
      console.error("Internal Gemini Error:", innerError);
    }

    return NextResponse.json(getDynamicFallback());

  } catch (error: any) {
    console.error('Critical Speech analysis error:', error);
    return NextResponse.json({
      error: "Analysis failure",
      score: 10,
      metrics: { wordMatchAccuracy: 0, fluencyStability: 0 }
    }, { status: 500 });
  }
}
