import React from 'react';
import { X, Circle } from 'lucide-react';

interface CellProps {
  index: number;
  value: 'PLAYER' | 'CPU' | null;
  onClick: () => void;
  disabled: boolean;
  isFading: boolean; // Is this cell about to disappear?
  isNewest: boolean; // Is this the most recently placed mark?
  isWinning: boolean;
  isVisible: boolean; // Controls the 3D flip state (true = Front/Game, false = Back/Dark)
}

const Cell: React.FC<CellProps> = ({ 
  index,
  value, 
  onClick, 
  disabled, 
  isFading, 
  isNewest,
  isWinning,
  isVisible
}) => {
  
  // Base styles for the button (Front Face)
  const baseClasses = "w-full h-full rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300";
  
  // State specific styles for Front Face
  let colorClasses = "bg-slate-900 border-2 border-slate-800 hover:bg-slate-800";
  if (value === 'PLAYER') colorClasses = "bg-slate-900 border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]";
  if (value === 'CPU') colorClasses = "bg-slate-900 border-2 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]";
  if (isWinning && value === 'PLAYER') colorClasses = "bg-cyan-900/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]";
  if (isWinning && value === 'CPU') colorClasses = "bg-rose-900/30 border-2 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]";

  // Interaction styles
  const cursorClass = disabled || value ? "cursor-default" : "cursor-pointer active:scale-95 hover:border-slate-600";

  // Animation delay based on index for the sequential flip effect
  const transitionDelay = `${index * 60}ms`;

  return (
    <div className="w-full h-full perspective-1000">
      <div 
        className={`w-full h-full relative preserve-3d transition-transform duration-500 ease-in-out ${isVisible ? 'rotate-y-0' : 'rotate-y-180'}`}
        style={{ transitionDelay }}
      >
        {/* FRONT FACE (Game Board) */}
        <div className="absolute inset-0 backface-hidden">
          <button
            onClick={onClick}
            disabled={disabled || value !== null || !isVisible}
            className={`${baseClasses} ${colorClasses} ${cursorClass} ${isFading ? 'animate-fade-pulse opacity-60' : ''}`}
            aria-label={value ? `Cell occupied by ${value}` : "Empty cell"}
          >
            <div className={`w-full h-full flex items-center justify-center transition-all duration-500 ${isNewest ? 'scale-110' : 'scale-100'}`}>
              {value === 'PLAYER' && (
                <X 
                  className={`w-[60%] h-[60%] text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]`} 
                  strokeWidth={2.5}
                />
              )}
              {value === 'CPU' && (
                <Circle 
                  className={`w-[50%] h-[50%] text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]`} 
                  strokeWidth={3}
                />
              )}
            </div>
          </button>
        </div>

        {/* BACK FACE (Dark / "Turned Over") */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full bg-slate-950 rounded-xl md:rounded-2xl border border-slate-900/50 flex items-center justify-center shadow-inner">
             {/* Optional: Add a subtle logo or pattern here if desired, currently plain dark as requested */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cell;