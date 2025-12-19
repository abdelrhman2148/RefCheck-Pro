import { GoogleGenAI, Type } from "@google/genai";
import { Reference, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

export const generateCandidateAnalysis = async (candidateName: string, role: string, references: Reference[]): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare the data for the prompt
  const refData = references.map((ref, index) => {
    return `
    Referee ${index + 1} (${ref.relationship}):
    ${ref.responses.map(r => `- Q: ${r.questionText}\n  A: ${r.answer}`).join('\n')}
    `;
  }).join('\n---\n');

  const prompt = `
    You are an expert HR consultant analyzing reference checks for a candidate named ${candidateName} applying for the role of ${role}.
    
    Analyze the following reference responses:
    ${refData}

    Provide a structured analysis focusing on:
    1. A concise executive summary.
    2. Key strengths identified across references.
    3. Potential weaknesses or areas for improvement.
    4. Any discrepancies between referees (if they exist).
    5. A calculated hiring recommendation score (0-100) based on the sentiment and ratings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            discrepancies: { type: Type.STRING },
            score: { type: Type.NUMBER, description: "A score between 0 and 100" }
          },
          required: ["summary", "strengths", "weaknesses", "score"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AIAnalysisResult;

  } catch (error) {
    console.error("Error generating analysis:", error);
    throw error;
  }
};
