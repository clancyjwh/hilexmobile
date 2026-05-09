import React from 'react';
import { Mover } from '../utils/analysis';

interface MoverCardProps {
  mover: Mover;
  onClick: () => void;
}

const getCardStyle = (score: number) => {
  // +7 to +10: bright green
  if (score >= 7) return 'bg-[#22c55e] border-[#4ade80]';
  // +4 to +6.9: medium green
  if (score >= 4) return 'bg-[#16a34a] border-[#22c55e]';
  // +1 to +3.9: light green
  if (score >= 1) return 'bg-[#4ade80] border-[#86efac]';
  // -1 to +0.9: dark grey/neutral
  if (score >= -1) return 'bg-[#475569] border-[#64748b]';
  // -1 to -3.9: light orange
  if (score >= -4) return 'bg-[#fb923c] border-[#fdba74]';
  // -4 to -6.9: orange
  if (score >= -7) return 'bg-[#f97316] border-[#fb923c]';
  // -7 to -10: red
  return 'bg-[#dc2626] border-[#ef4444]';
};

export default function MoverCard({ mover, onClick }: MoverCardProps) {
  const cardStyle = getCardStyle(mover.score);

  return (
    <button 
      onClick={onClick}
      className={`w-full h-[56px] rounded-xl px-4 flex items-center justify-between active:scale-[0.98] transition-all text-left overflow-hidden relative border-l-4 shadow-lg ${cardStyle} text-white`}
    >
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm truncate max-w-[200px] tracking-tight uppercase italic">
            {mover.name}
          </span>
          <span className="text-[7px] font-black uppercase tracking-widest px-1 py-0.5 rounded bg-black/20 border border-white/20">
            {mover.type}
          </span>
        </div>
        <span className="text-[9px] font-bold opacity-60 tracking-widest uppercase">
          {mover.symbol.length > 15 ? mover.symbol.substring(0, 15) + '...' : mover.symbol}
        </span>
      </div>

      <div className="flex items-center">
        <span className="text-2xl font-black italic drop-shadow-md">
          {mover.score > 0 ? '+' : ''}{mover.score.toFixed(1)}
        </span>
      </div>
    </button>
  );
}
