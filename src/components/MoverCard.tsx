import React from 'react';
import { Mover } from '../utils/analysis';

interface MoverCardProps {
  mover: Mover;
  onClick: () => void;
}

const getCardStyle = (score: number) => {
  // Positive Scale
  if (score >= 7) return 'bg-[#22c55e] border-[#4ade80]'; // bright green
  if (score >= 4) return 'bg-[#16a34a] border-[#22c55e]'; // medium green
  if (score >= 1) return 'bg-[#14532d] border-[#166534]'; // light green (darker shade for intensity)
  
  // Neutral Scale
  if (score >= -1) return 'bg-[#334155] border-[#475569]'; // dark grey/neutral
  
  // Negative Scale
  if (score >= -4) return 'bg-[#fb923c] border-[#fdba74]'; // light orange
  if (score >= -7) return 'bg-[#ea580c] border-[#f97316]'; // orange
  return 'bg-[#dc2626] border-[#ef4444]'; // red
};

export default function MoverCard({ mover, onClick }: MoverCardProps) {
  const cardStyle = getCardStyle(mover.score);

  return (
    <button 
      onClick={onClick}
      className={`w-full h-20 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all text-left overflow-hidden relative border ${cardStyle}`}
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-xl truncate max-w-[200px] drop-shadow-sm">
            {mover.name}
          </span>
          <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-black/20 text-white/80 border border-white/10">
            {mover.type}
          </span>
        </div>
        <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase mt-1">
          {mover.symbol}
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-3xl font-black text-white drop-shadow-md">
          {mover.score > 0 ? '+' : ''}{mover.score.toFixed(1)}
        </span>
        <span className="text-[8px] font-black text-white/70 uppercase tracking-tighter">HeatScore</span>
      </div>
    </button>
  );
}
