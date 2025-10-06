// WARNING: This client-side implementation is for demonstration purposes only.
// In a real-world application, API keys should be kept on a secure backend server
// to prevent them from being exposed to users

import { GoogleGenAI, Type } from "@google/genai";
import { ExplanationResponse, ExplanationError } from '../types';

// --- API Keys (DEMO ONLY) ---
// The Gemini API key is loaded from the `API_KEY` environment variable.
// Other API keys are hardcoded for demonstration purposes.
const TMDB_API_KEY = '7c379299472df03000b8f7377cb5d19d';
const IMGFLIP_USER = 'MohammedFazil1';
const IMGFLIP_PASS = 'Mohammedfazil2000';

// --- Gemini API Configuration ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are ExplainerBot, a helpful assistant for learning programming. Your ONLY function is to explain programming-related topics. For a given 'topic', produce 5 types of coding explanations: meme, hollywood analogy, cartoon/anime analogy, sports analogy, and a formal MDN-style explanation. Critically evaluate the user's input topic. If it is NOT a specific programming concept, algorithm, data structure, software engineering principle, or a related technical term, you MUST refuse to answer. In that case, return ONLY this exact JSON object: {"error":"This app is for coding study purposes only. Please ask a programming-related topic."} Do not explain random words, non-technical subjects, or general knowledge questions.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    meme: {
      type: Type.OBJECT,
      properties: {
        template_hint: { 
            type: Type.STRING,
            description: "A hint to find a popular meme template on Imgflip. Use concise, well-known names like 'Drake Hotline Bling', 'Distracted Boyfriend', 'Two Buttons', or 'Woman Yelling at a Cat'."
        },
        caption: { 
            type: Type.STRING,
            description: "A witty, short caption for the meme. Use a '|' character to separate the top text from the bottom text."
        },
      },
      required: ["template_hint", "caption"]
    },
    hollywood: {
      type: Type.OBJECT,
      properties: {
        title_hint: { type: Type.STRING },
        analogy: { type: Type.STRING },
      },
      required: ["title_hint", "analogy"]
    },
    anime: {
      type: Type.OBJECT,
      properties: {
        analogy: { type: Type.STRING },
      },
      required: ["analogy"]
    },
    sports: {
      type: Type.OBJECT,
      properties: {
        analogy: { type: Type.STRING },
      },
      required: ["analogy"]
    },
    serious: {
      type: Type.OBJECT,
      properties: {
        definition: { type: Type.STRING },
        code_example: { type: Type.STRING },
        common_pitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
        best_practices: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["definition", "code_example", "common_pitfalls", "best_practices"]
    },
  },
   required: ["topic", "meme", "hollywood", "anime", "sports", "serious"]
};


// --- Helper Functions for External APIs ---

let memeTemplates: { id: string; name: string }[] | null = null;

async function getMemeTemplates() {
  if (memeTemplates) return memeTemplates;
  try {
    const response = await fetch('https://api.imgflip.com/get_memes');
    const json = await response.json();
    if (json.success) {
      memeTemplates = json.data.memes;
      return memeTemplates;
    }
  } catch (e) {
    console.error("Failed to fetch Imgflip templates", e);
  }
  return [];
}

export async function generateMeme(templateHint: string, caption: string): Promise<string | null> {
    if (!IMGFLIP_USER || !IMGFLIP_PASS || !templateHint || !caption) return null;
    try {
        const templates = await getMemeTemplates();
        if (!templates || templates.length === 0) {
            console.error("Imgflip templates could not be fetched.");
            return null;
        }

        const hintLower = templateHint.toLowerCase().replace(/[^a-z0-9\s]/gi, '');
        let foundTemplate = templates.find(t => t.name.toLowerCase() === hintLower);

        if (!foundTemplate) {
            foundTemplate = templates.find(t => t.name.toLowerCase().includes(hintLower));
        }

        if (!foundTemplate) {
            const hintKeywords = hintLower.split(' ').filter(k => k.length > 3);
            if (hintKeywords.length > 0) {
                const scoredTemplates = templates.map(t => {
                    const nameLower = t.name.toLowerCase();
                    const score = hintKeywords.reduce((acc, keyword) => {
                        return nameLower.includes(keyword) ? acc + 1 : acc;
                    }, 0);
                    return { ...t, score };
                }).filter(t => t.score > 0);

                if (scoredTemplates.length > 0) {
                    scoredTemplates.sort((a, b) => b.score - a.score);
                    foundTemplate = scoredTemplates[0];
                }
            }
        }

        if (!foundTemplate) {
            console.warn(`No Imgflip template found for hint: "${templateHint}"`);
            return null;
        }

        console.log(`Matched hint "${templateHint}" to template "${foundTemplate.name}" (ID: ${foundTemplate.id})`);

        const params = new URLSearchParams({
            template_id: foundTemplate.id,
            username: IMGFLIP_USER,
            password: IMGFLIP_PASS,
            text0: caption.split(/;|\|/)[0]?.trim() || caption,
            text1: caption.split(/;|\|/)[1]?.trim() || ''
        });

        const response = await fetch('https://api.imgflip.com/caption_image', { method: 'POST', body: params });
        const json = await response.json();
        
        if (!json.success) {
            console.error("Imgflip API error:", json.error_message);
            return null;
        }

        return json.data.url;
    } catch (error) {
        console.error("Error generating meme:", error);
        return null;
    }
}


export async function getMoviePoster(titleHint: string): Promise<string | null> {
    if (!TMDB_API_KEY || !titleHint) return null;
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(titleHint)}`);
        const json = await response.json();
        if (json.results?.[0]?.poster_path) {
            return `https://image.tmdb.org/t/p/w400${json.results[0].poster_path}`;
        }
        return null;
    } catch (error) {
        console.error("Error fetching movie poster:", error);
        return null;
    }
}

// --- Main Service Function (Gemini) ---

export const generateTextExplanations = async (topic: string): Promise<ExplanationResponse | ExplanationError> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Input topic: "${topic}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          thinkingConfig: { thinkingBudget: 0 }, // Added for lower latency
        },
    });

    const jsonText = response.text.trim();
    let parsedJson = JSON.parse(jsonText);

    if (parsedJson.error) {
        return { error: parsedJson.error };
    }
    
    // Create a new object to ensure type correctness, returning only AI data
    let result: ExplanationResponse = {
        topic: parsedJson.topic,
        meme: { ...parsedJson.meme, image_url: null },
        hollywood: { ...parsedJson.hollywood, poster_url: null },
        anime: parsedJson.anime,
        sports: parsedJson.sports,
        serious: parsedJson.serious,
    };

    return result;

  } catch (error) {
    console.error("Error processing explanation generation with Gemini:", error);
    if (error instanceof SyntaxError) {
        return { error: "Failed to parse a malformed JSON response from the AI." };
    }
    return { error: "Failed to get explanation from the AI service. Check the console for details." };
  }
};

/*
// --- OpenAI API Configuration (Alternative - UNCOMMENT TO USE) ---

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

const openAISystemPrompt = `You are ExplainerBot, a helpful assistant for learning programming. Your ONLY function is to explain programming-related topics. For a given 'topic', produce 5 types of coding explanations: meme, hollywood analogy, cartoon/anime analogy, sports analogy, and a formal MDN-style explanation.
Return ONLY a valid JSON object with the following schema:
{
  "topic": "string",
  "meme": { "template_hint": "A hint to find a popular meme template on Imgflip. Use concise, well-known names like 'Drake Hotline Bling', 'Distracted Boyfriend', or 'Two Buttons'.", "caption": "A witty, short caption for the meme. Use a '|' character to separate top and bottom text." },
  "hollywood": { "title_hint": "string", "analogy": "string" },
  "anime": { "analogy": "string" },
  "sports": { "analogy": "string" },
  "serious": { "definition": "string", "code_example": "A short, valid code example, preferably in JavaScript, enclosed in markdown backticks.", "common_pitfalls": ["string"], "best_practices": ["string"] }
}
Critically evaluate the user's input topic. If it is NOT a specific programming concept, algorithm, data structure, software engineering principle, or a related technical term, you MUST refuse to answer. In that case, return ONLY this exact JSON object: {"error":"This app is for coding study purposes only. Please ask a programming-related topic."} Do not explain random words, non-technical subjects, or general knowledge questions.`;


export const generateExplanationsWithOpenAI = async (topic: string): Promise<ExplanationResponse | ExplanationError> => {
    if (OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE" || !OPENAI_API_KEY) {
        return { error: "OpenAI API key is not configured. Please add your key to services/geminiService.ts." };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: 'system', content: openAISystemPrompt },
                    { role: 'user', content: `Input topic: "${topic}"` }
                ],
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            throw new Error(errorData.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        const jsonText = data.choices[0].message.content;
        let parsedJson = JSON.parse(jsonText);

        if (parsedJson.error) {
            return { error: parsedJson.error };
        }

        let result: ExplanationResponse = {
            topic: parsedJson.topic,
            meme: { ...parsedJson.meme, image_url: null },
            hollywood: { ...parsedJson.hollywood, poster_url: null },
            anime: parsedJson.anime,
            sports: parsedJson.sports,
            serious: parsedJson.serious,
        };

        const [memeUrl, posterUrl] = await Promise.all([
            generateMeme(result.meme.template_hint!, result.meme.caption!),
            getMoviePoster(result.hollywood.title_hint!),
        ]);
        
        result.meme.image_url = memeUrl;
        result.hollywood.poster_url = posterUrl;

        return result;

    } catch (error) {
        console.error("Error processing explanation generation with OpenAI:", error);
        if (error instanceof SyntaxError) {
            return { error: "Failed to parse a malformed JSON response from the AI." };
        }
        return { error: `Failed to get explanation from OpenAI. ${error.message}` };
    }
};
*/
