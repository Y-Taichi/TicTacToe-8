import { WINNING_COMBINATIONS } from '../types';

export const checkWinner = (moves: number[]): number[] | null => {
  if (moves.length < 3) return null;
  
  const currentMoves = new Set(moves);

  for (const combo of WINNING_COMBINATIONS) {
    if (combo.every(index => currentMoves.has(index))) {
      return combo;
    }
  }
  return null;
};

// Internal helper for minimax boolean check
const hasWon = (moves: number[]): boolean => {
  if (moves.length < 3) return false;
  const currentMoves = new Set(moves);
  return WINNING_COMBINATIONS.some(combo => combo.every(index => currentMoves.has(index)));
};

// Minimax Algorithm with Alpha-Beta Pruning
const MAX_DEPTH = 8;

const evaluateBoard = (cpuMoves: number[], playerMoves: number[]): number => {
    if (hasWon(cpuMoves)) return 100;
    if (hasWon(playerMoves)) return -100;
    return 0;
};

const minimax = (
    cpuMoves: number[],
    playerMoves: number[],
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number
): number => {
    const score = evaluateBoard(cpuMoves, playerMoves);
    if (score === 100) return score - depth; // Prefer faster wins
    if (score === -100) return score + depth; // Prefer slower losses
    if (depth >= MAX_DEPTH) return 0;

    const taken = new Set([...cpuMoves, ...playerMoves]);
    const available = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !taken.has(i));

    if (available.length === 0) return 0; // Should not happen in infinite variant

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of available) {
            const nextCpuMoves = [...cpuMoves, move];
            if (nextCpuMoves.length > 3) nextCpuMoves.shift();

            // Optimization: Immediate win check
            if (hasWon(nextCpuMoves)) {
                return 100 - depth;
            }

            const evalScore = minimax(nextCpuMoves, playerMoves, depth + 1, false, alpha, beta);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of available) {
            const nextPlayerMoves = [...playerMoves, move];
            if (nextPlayerMoves.length > 3) nextPlayerMoves.shift();

            // Optimization: Immediate loss check
            if (hasWon(nextPlayerMoves)) {
                return -100 + depth;
            }

            const evalScore = minimax(cpuMoves, nextPlayerMoves, depth + 1, true, alpha, beta);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getBestMove = (playerMoves: number[], cpuMoves: number[]): number => {
    // 1. Initial move optimization
    if (playerMoves.length === 0 && cpuMoves.length === 0) return 4; // Take center
    if (cpuMoves.length === 0 && !playerMoves.includes(4)) return 4; // Take center if available

    const taken = new Set([...playerMoves, ...cpuMoves]);
    const available = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !taken.has(i));
    
    // 2. Check for immediate win (Correction: Minimax handles this, but explicit check is faster)
    for (const move of available) {
        const nextCpu = [...cpuMoves, move];
        if (nextCpu.length > 3) nextCpu.shift();
        if (hasWon(nextCpu)) return move;
    }

    // 3. Check for immediate block
    for (const move of available) {
        const nextPlayer = [...playerMoves, move];
        if (nextPlayer.length > 3) nextPlayer.shift();
        if (hasWon(nextPlayer)) return move;
    }

    let bestScore = -Infinity;
    let bestMove = available[0];

    // 4. Minimax search
    for (const move of available) {
        const nextCpuMoves = [...cpuMoves, move];
        if (nextCpuMoves.length > 3) nextCpuMoves.shift();

        const score = minimax(nextCpuMoves, playerMoves, 0, false, -Infinity, Infinity);
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
};
