import React from 'react';
import { Mover } from '../utils/analysis';

interface MoverCardProps {
  mover: Mover;
  onClick: () => void;
}

const getCardStyle = (score: number) => {
  if (score >= 7) return 'bg-[#22c55e] border-[#4ade80]';
  if (score >= 4) return 'bg-[#16a34a] border-[#22c55e]';
  if (score >= 1) return 'bg-[#4ade80] border-[#86efac] text-[#064e3b]';
  if (score >= -1) return 'bg-[#475569] border-[#64748b]';
  if (score >= -4) return 'bg-[#fb923c] border-[#fdba74]';
  if (score >= -7) return 'bg-[#f97316] border-[#fb923c]';
  return 'bg-[#dc2626] border-[#ef4444]';
};

export default function MoverCard({ mover, onClick }: MoverCardProps) {
  const cardStyle = getCardStyle(mover.score);
  const isLight = mover.score >= 1 && mover.score < 4;

  return (
    <button 
      onClick={onClick}
      className={`w-full aspect-[16/10] rounded-xl p-3 flex flex-col justify-between active:scale-[0.96] transition-all text-left overflow-hidden relative border shadow-lg ${cardStyle} ${isLight ? 'text-[#064e3b]' : 'text-white'}`}
    >
      <div className="flex items-start justify-between w-full">
        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isLight ? 'bg-black/10 border-black/10' : 'bg-black/20 border-white/20'} border`}>
          {mover.type === 'sport' ? (mover.entity_type === 'athlete' ? 'PLAYER' : 'TEAM') : mover.type}
        </span>
        {(mover.headshot_url || mover.logo_url) && (
          <div className="relative">
             <img 
              src={mover.headshot_url || mover.logo_url} 
              alt="" 
              className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-md bg-black/10"
            />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between w-full mt-auto">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-black text-xs leading-none truncate uppercase italic tracking-tighter">
            {mover.name}
          </span>
        </div>
        <span className="text-lg font-black italic drop-shadow-sm whitespace-nowrap ml-1">
          {mover.score > 0 ? '+' : ''}{mover.score.toFixed(1)}
        </span>
      </div>
    </button>
  );
}
