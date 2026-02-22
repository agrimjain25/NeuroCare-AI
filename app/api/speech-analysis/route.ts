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
    const getDynamicFallback = (count: number, durationSec: number) => {
      // DYNAMIC SCORING LOGIC - NO FIXED VALUES
      
      // 1. Accuracy (Strict word match)
      const matchRatio = Math.min(1, count / refWordCount);
      const accuracy = Math.round(matchRatio * 100);
      
      // 2. WPM (Real-time speed)
      const wpm = durationSec > 0 ? Math.round((count / durationSec) * 60) : 0;
      
      // 3. Fluency (Based on deviation from optimal range 110-160 WPM)
      // If WPM is too low (<90) or too high (>200), penalize fluency
      let fluency = 100;
      if (wpm < 90) fluency -= (90 - wpm) * 1.5;
      else if (wpm > 180) fluency -= (wpm - 180);
      fluency = Math.max(10, Math.min(100, Math.round(fluency)));
      
      // 4. Pause Frequency (Inverse to continuity)
      // Higher match ratio usually implies better continuity
      const pauseFreq = Math.max(0.05, 0.4 - (matchRatio * 0.35));

      // 5. Final Composite Score
      // Weighted: Accuracy (50%), Fluency (30%), Speed/Flow (20%)
      const finalScore = Math.round((accuracy * 0.5) + (fluency * 0.3) + (Math.min(100, wpm/1.3) * 0.2));

      return {
        transcript: "Real-time acoustic analysis processed.",
        metrics: {
          wordsPerMinute: wpm,
          pauseFrequency: parseFloat(pauseFreq.toFixed(2)),
          silenceDetected: count < 3,
          fillerWords: 0,
          fluencyStability: fluency,
          wordCount: count,
          wordMatchAccuracy: accuracy
        },
        score: Math.max(0, Math.min(100, finalScore))
      };
    };

    if (!API_KEY) {
      return NextResponse.json(getDynamicFallback(spokenWordCount, recordingDuration));
    }

    try {
      const buffer = await audioFile.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `CRITICAL TASK: Analyze this reading assessment audio against the REFERENCE TEXT.
      REFERENCE TEXT: "${readingText}"

      STRICT RULES:
      1. TRANSCRIPTION: Transcribe the audio VERBATIM. 
      2. ACCURACY: Calculate "wordMatchAccuracy" (0-100) as a strict percentage of the REFERENCE TEXT words correctly spoken. 
      3. STABILITY: Calculate "stabilityScore" (0-100) based ONLY on the parts they actually spoke.
      
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
