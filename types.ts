export type Player = 'PLAYER' | 'CPU';

export interface GameState {
  playerMoves: number[]; // Array of cell indices (0-8)
  cpuMoves: number[];    // Array of cell indices (0-8)
  turn: Player;
  winner: Player | 'DRAW' | null;
  winningLine: number[] | null;
}

export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];