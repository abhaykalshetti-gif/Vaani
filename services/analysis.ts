
import { GoogleGenAI, Type } from '@google/genai';
import { TranscriptItem, SessionAnalysis } from '../types';

export const generateSessionAnalysis = async (
  transcript: TranscriptItem[], 
  agentRole: string,
  customRequirements?: string
): Promise<SessionAnalysis> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  
  const ai = new GoogleGenAI({ apiKey });

  const conversationText = transcript
    .map(t => `${t.speaker === 'user' ? 'User' : 'Agent'}: ${t.text}`)
    .join('\n');

  // Determine if we are running a "Default" or "Custom" analysis
  const isCustom = customRequirements && customRequirements.trim().length > 0;
  
  const prompt = `
    Analyze this conversation between a User and an AI Agent ("${agentRole}").
    
    ${isCustom ? `
    SPECIAL USER REQUIREMENTS FOR THIS REPORT:
    "${customRequirements}"
    Your "customInsights" section MUST specifically address these requirements in detail.
    ` : `
    DEFAULT ANALYSIS:
    Provide general professional insights in the "customInsights" section about the interaction quality.
    `}

    Provide a JSON response with:
    1. "summary": Concise session overview.
    2. "sentiment": Positive, Neutral, Negative, or Mixed.
    3. "tone": User's emotional adjectives.
    4. "speakingStyle": Fluency and delivery notes.
    5. "scores": Integer 1-10 for fluency, clarity, engagement, vocabulary.
    6. "feedback": Practical advice for the user.
    7. "customInsights": ${isCustom ? "Detailed findings based on the SPECIAL USER REQUIREMENTS." : "A general analysis of the conversation's success and key takeaways."}

    Conversation:
    ${conversationText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            tone: { type: Type.STRING },
            speakingStyle: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                fluency: { type: Type.INTEGER },
                clarity: { type: Type.INTEGER },
                engagement: { type: Type.INTEGER },
                vocabulary: { type: Type.INTEGER },
              },
              required: ['fluency', 'clarity', 'engagement', 'vocabulary']
            },
            feedback: { type: Type.STRING },
            customInsights: { type: Type.STRING }
          },
          required: ['summary', 'sentiment', 'tone', 'speakingStyle', 'scores', 'feedback', 'customInsights']
        }
      }
    });

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Analysis engine failed:", error);
    return {
      summary: "Detailed analysis unavailable.",
      sentiment: 'Neutral',
      tone: 'Unknown',
      speakingStyle: 'Unknown',
      scores: { fluency: 0, clarity: 0, engagement: 0, vocabulary: 0 },
      feedback: "Check connection and retry.",
      customInsights: "Could not process analysis requirements at this time."
    };
  }
};
