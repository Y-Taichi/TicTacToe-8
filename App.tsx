import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { checkWinner, getBestMove } from './utils/gameLogic';
import Cell from './components/Cell';
import { User, Cpu } from 'lucide-react';

const INITIAL_STATE: GameState = {
  playerMoves: [],
  cpuMoves: [],
  turn: 'PLAYER',
  winner: null,
  winningLine: null,
};

// SELECT: Choosing turn
// PLAYING: Game in progress
// GAME_OVER_VIEW: Game finished, showing result, waiting for click
// EXITING: Board is flipping over to dark
type AppStatus = 'SELECT' | 'PLAYING' | 'GAME_OVER_VIEW' | 'EXITING';

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [status, setStatus] = useState<AppStatus>('SELECT');
  const [isThinking, setIsThinking] = useState(false);
  const [isBoardVisible, setIsBoardVisible] = useState(false);

  const startGame = (startTurn: 'PLAYER' | 'CPU') => {
    setGameState({
      ...INITIAL_STATE,
      turn: startTurn
    });
    setStatus('PLAYING');
    
    // Trigger entrance animation (Flip In)
    // Small delay ensures component is mounted before state change for transition
    requestAnimationFrame(() => {
        setIsBoardVisible(true);
    });
  };

  const handlePlayerMove = useCallback((index: number) => {
    if (gameState.winner || isThinking || gameState.turn !== 'PLAYER' || status !== 'PLAYING') return;
    
    const allMoves = new Set([...gameState.playerMoves, ...gameState.cpuMoves]);
    if (allMoves.has(index)) return;

    setGameState(prev => {
      const newPlayerMoves = [...prev.playerMoves, index];
      if (newPlayerMoves.length > 3) {
        newPlayerMoves.shift();
      }

      const winLine = checkWinner(newPlayerMoves);
      const isWin = winLine !== null;
      
      if (isWin) setStatus('GAME_OVER_VIEW');

      return {
        ...prev,
        playerMoves: newPlayerMoves,
        winner: isWin ? 'PLAYER' : null,
        winningLine: winLine,
        turn: isWin ? 'PLAYER' : 'CPU', 
      };
    });
  }, [gameState.winner, isThinking, gameState.turn, gameState.playerMoves, gameState.cpuMoves, status]);

  // CPU Turn Effect
  useEffect(() => {
    if (status === 'PLAYING' && gameState.turn === 'CPU' && !gameState.winner) {
      setIsThinking(true);
      
      const timer = setTimeout(() => {
        const moveIndex = getBestMove(gameState.playerMoves, gameState.cpuMoves);
        
        setGameState(prev => {
          const newCpuMoves = [...prev.cpuMoves, moveIndex];
          if (newCpuMoves.length > 3) {
            newCpuMoves.shift();
          }

          const winLine = checkWinner(newCpuMoves);
          const isWin = winLine !== null;

          if (isWin) setStatus('GAME_OVER_VIEW');

          return {
            ...prev,
            cpuMoves: newCpuMoves,
            winner: isWin ? 'CPU' : null,
            winningLine: winLine,
            turn: isWin ? 'CPU' : 'PLAYER',
          };
        });
        setIsThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.winner, gameState.playerMoves, gameState.cpuMoves, status]);

  // Handle Game Over Click -> Start Exit Animation
  const handleGameOverClick = () => {
    setStatus('EXITING');
    setIsBoardVisible(false); // Triggers Flip Out
  };

  // Handle Return to Menu after Exit Animation
  useEffect(() => {
    if (status === 'EXITING') {
      // Wait for flip animations (last index 8 * 60ms + duration 500ms + buffer)
      const timeout = setTimeout(() => {
        setGameState(INITIAL_STATE);
        setStatus('SELECT');
        setIsThinking(false);
      }, 1200); 

      return () => clearTimeout(timeout);
    }
  }, [status]);

  const fadingIndex = (() => {
    if (gameState.winner) return null;
    if (gameState.turn === 'PLAYER' && gameState.playerMoves.length === 3) return gameState.playerMoves[0];
    if (gameState.turn === 'CPU' && gameState.cpuMoves.length === 3) return gameState.cpuMoves[0];
    return null;
  })();

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-rose-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Game Board Container */}
      {/* Explicit aspect ratio enforcement: width and height match the smallest dimension of the viewport */}
      <div 
        className={`relative z-10 grid grid-cols-3 gap-3 md:gap-4
          transition-all duration-300
          ${status === 'GAME_OVER_VIEW' ? 'cursor-pointer' : ''}
        `}
        style={{
          width: 'min(85vw, 85vh)',
          height: 'min(85vw, 85vh)',
        }}
        onClick={status === 'GAME_OVER_VIEW' ? handleGameOverClick : undefined}
      >
        {/* Render cells only when not in SELECT mode (or when exiting) to keep layout stable */}
        {status !== 'SELECT' && [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
          const isPlayer = gameState.playerMoves.includes(index);
          const isCpu = gameState.cpuMoves.includes(index);
          const value = isPlayer ? 'PLAYER' : isCpu ? 'CPU' : null;
          const isFading = index === fadingIndex;
          
          const isNewest = 
              (isPlayer && gameState.playerMoves[gameState.playerMoves.length - 1] === index) ||
              (isCpu && gameState.cpuMoves[gameState.cpuMoves.length - 1] === index);
          
          const isWinning = gameState.winningLine?.includes(index) ?? false;

          return (
            <Cell
              key={index}
              index={index}
              value={value}
              onClick={() => handlePlayerMove(index)}
              disabled={gameState.winner !== null || gameState.turn === 'CPU' || isThinking}
              isFading={isFading}
              isNewest={isNewest}
              isWinning={isWinning}
              isVisible={isBoardVisible}
            />
          );
        })}
      </div>

      {/* Turn Selection Overlay */}
      {status === 'SELECT' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center animate-in zoom-in fade-in duration-700 delay-300 fill-mode-backwards">
           <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <button 
                onClick={() => startGame('PLAYER')}
                className="group flex flex-col items-center justify-center w-36 h-36 md:w-48 md:h-48 bg-slate-900 rounded-3xl border-2 border-slate-800 hover:border-cyan-500 hover:bg-slate-800 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/20 active:scale-95"
              >
                 <User size={40} className="text-slate-500 group-hover:text-cyan-400 mb-3 transition-colors md:w-12 md:h-12" strokeWidth={1.5} />
                 <span className="text-slate-500 group-hover:text-cyan-400 text-lg font-bold tracking-widest uppercase">1st</span>
              </button>

              <button 
                onClick={() => startGame('CPU')}
                className="group flex flex-col items-center justify-center w-36 h-36 md:w-48 md:h-48 bg-slate-900 rounded-3xl border-2 border-slate-800 hover:border-rose-500 hover:bg-slate-800 transition-all duration-300 shadow-2xl hover:shadow-rose-500/20 active:scale-95"
              >
                 <Cpu size={40} className="text-slate-500 group-hover:text-rose-400 mb-3 transition-colors md:w-12 md:h-12" strokeWidth={1.5} />
                 <span className="text-slate-500 group-hover:text-rose-400 text-lg font-bold tracking-widest uppercase">2nd</span>
              </button>
           </div>
        </div>
      )}

      {/* Game Over View Layer - Invisible catcher to detect click anywhere */}
      {status === 'GAME_OVER_VIEW' && (
        <div className="absolute inset-0 z-50 cursor-pointer" onClick={handleGameOverClick} />
      )}

    </div>
  );
}

export default App;