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

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this reading assessment audio against the REFERENCE TEXT.
      REFERENCE TEXT: "${readingText}"

      Tasks:
      1. Transcribe the audio exactly.
      2. Calculate "wordMatchAccuracy" (0-100): How many words from the REFERENCE TEXT were actually read correctly? If they only read a few words, this MUST be very low.
      3. Calculate "stabilityScore" (0-100) based on clarity and pacing.
      4. Count filler words (um, uh, like).
      5. Estimate Words Per Minute (WPM).
      
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
        
        // Final sanity check on accuracy
        const transcriptWords = (analysisData.transcript || "").split(/\s+/).length;
        // If Gemini is hallucinating a high accuracy for a short transcript, we override it
        const calculatedMatchAcc = Math.min(analysisData.wordMatchAccuracy, (transcriptWords / refWordCount) * 110);

        return NextResponse.json({
          transcript: analysisData.transcript,
          metrics: {
            wordsPerMinute: analysisData.wordsPerMinute || 130,
            pauseFrequency: analysisData.pauseFrequency || 0.1,
            silenceDetected: transcriptWords < 5,
            fillerWords: analysisData.fillerCount || 0,
            fluencyStability: analysisData.stabilityScore || 85,
            wordCount: transcriptWords,
            wordMatchAccuracy: Math.round(calculatedMatchAcc)
          },
          score: Math.round((Math.min(100, calculatedMatchAcc) * 0.7) + ((analysisData.stabilityScore || 85) * 0.3)),
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
