import React from 'react';
import { Mover } from '../utils/analysis';

interface MoverCardProps {
  mover: Mover;
  onClick: () => void;
}

export default function MoverCard({ mover, onClick }: MoverCardProps) {
  const signalPercent = ((mover.score + 10) / 20) * 100;
  const isPositive = mover.score > 0;
  const scoreColor = isPositive ? 'text-green-400' : 'text-red-400';
  const barColor = isPositive ? 'bg-green-500' : 'bg-red-500';

  return (
    <button 
      onClick={onClick}
      className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] active:bg-white/10 transition-all text-left overflow-hidden relative"
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-white text-lg truncate max-w-[150px]">{mover.name}</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/5">
            {mover.type}
          </span>
        </div>
        <div className="flex flex-col gap-1 pr-12">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${signalPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono tracking-tighter">SIGNAL STRENGTH</span>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {isPositive ? '+' : ''}{mover.score.toFixed(1)}
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase">HeatScore</span>
      </div>
    </button>
  );
}
