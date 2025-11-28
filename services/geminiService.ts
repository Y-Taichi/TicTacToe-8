import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure key is picked up
const ai = new GoogleGenAI({ apiKey });

export const getBestMove = async (
  playerMoves: number[],
  cpuMoves: number[]
): Promise<number> => {
  
  // If we have no key, return a random available move (fallback)
  if (!apiKey) {
    console.warn("No API Key found, using random move");
    const taken = new Set([...playerMoves, ...cpuMoves]);
    const available = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !taken.has(i));
    return available[Math.floor(Math.random() * available.length)];
  }

  const model = "gemini-2.5-flash";

  const prompt = `
    You are playing a variant of Tic-Tac-Toe called "Infinite Tic-Tac-Toe".
    
    RULES:
    1. The board is a 3x3 grid (indices 0-8).
    2. Each player can only have 3 marks on the board at a time.
    3. If a player places a 4th mark, their 1st (oldest) mark DISAPPEARS properly.
    4. You are the CPU (O). The opponent is the PLAYER (X).
    5. Your goal is to get 3 in a row.
    
    CURRENT STATE:
    - Player's moves (in order, oldest to newest): ${JSON.stringify(playerMoves)}
    - Your (CPU) moves (in order, oldest to newest): ${JSON.stringify(cpuMoves)}
    
    CRITICAL STRATEGY:
    - If you have 3 marks, placing a new one will remove your mark at index ${cpuMoves.length === 3 ? cpuMoves[0] : 'N/A'}. DO NOT break your own potential winning line by removing a crucial piece unless necessary.
    - If the Player has 3 marks, their next move will remove their mark at index ${playerMoves.length === 3 ? playerMoves[0] : 'N/A'}. You might not need to block a line if one of its pieces is about to vanish!
    
    TASK:
    Analyze the board and choose the absolute best move index (0-8) to win or prevent the player from winning. The move must be an empty cell.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            move: { type: Type.INTEGER, description: "The index (0-8) of the best move." },
            reasoning: { type: Type.STRING, description: "Short explanation of the strategy." }
          },
          required: ["move"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    
    // Validate move is legal
    const taken = new Set([...playerMoves, ...cpuMoves]);
    if (json.move !== undefined && !taken.has(json.move) && json.move >= 0 && json.move <= 8) {
      return json.move;
    } else {
      // Fallback if AI hallucinates an invalid move
      const available = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !taken.has(i));
      return available[0];
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback logic
    const taken = new Set([...playerMoves, ...cpuMoves]);
    const available = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !taken.has(i));
    return available[Math.floor(Math.random() * available.length)];
  }
};