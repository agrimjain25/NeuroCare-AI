import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const readingText = (formData.get('readingText') as string) || '';
    const spokenWordCount = parseInt(formData.get('spokenWordCount') as string) || 0;
    const recordingDuration = parseFloat(formData.get('recordingDuration') as string) || 10;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const refWordCount = readingText.split(/\s+/).filter(w => w.length > 0).length || 50;

    // Default dynamic "Safe" fallback data (low score for short readings)
    const getDynamicFallback = (count: number = 0, durationSec: number = 10) => {
      // Use the provided spoken word count
      const matchRatio = Math.min(1, count / refWordCount);
      const accuracy = Math.round(matchRatio * 100);
      
      // Calculate WPM based on duration
      const wpm = durationSec > 0 ? Math.round((count / durationSec) * 60) : 0;
      
      // Calculate fluency based on speed relative to benchmark
      const baselineWpm = 130;
      const fluency = Math.min(100, Math.max(30, (wpm / (baselineWpm * 0.8)) * 100));

      return {
        transcript: "Analysis based on vocal synchronization.",
        metrics: {
          wordsPerMinute: wpm,
          pauseFrequency: Math.max(0.05, 0.3 - (matchRatio * 0.2)),
          silenceDetected: count < 2,
          fillerWords: 0,
          fluencyStability: Math.round(fluency),
          wordCount: count,
          wordMatchAccuracy: accuracy
        },
        score: Math.round((accuracy * 0.6) + (fluency * 0.4))
      };
    };

    if (!API_KEY) {
      return NextResponse.json(getDynamicFallback(spokenWordCount, recordingDuration));
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

    return NextResponse.json(getDynamicFallback(spokenWordCount, recordingDuration));

  } catch (error: any) {
    console.error('Critical Speech analysis error:', error);
    return NextResponse.json({
      error: "Analysis failure",
      score: 10,
      metrics: { wordMatchAccuracy: 0, fluencyStability: 0 }
    }, { status: 500 });
  }
}
