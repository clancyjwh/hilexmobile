import React from 'react';

interface IndicatorGridProps {
  indicators: any;
  type?: string;
}

const getIndicatorColor = (score: number) => {
  if (score >= 4) return 'text-green-400 border-green-500/30 bg-green-500/10';
  if (score >= 1) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  if (score >= -4) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  return 'text-red-400 border-red-500/30 bg-red-500/10';
};

export default function IndicatorGrid({ indicators, type }: IndicatorGridProps) {
  const financeMapping: Record<string, string> = {
    'SMA': 'SMA',
    'RSI': 'RSI',
    'Bollinger': 'BOLL',
    'CCI': 'CCI',
    'MACD': 'MACD',
    'ROC': 'ROC'
  };

  const sportsMapping: Record<string, string> = {
    'win_pct': 'WIN %',
    'last_10': 'L10',
    'home_away': 'H/A',
    'streak': 'STRK',
    'fg_pct': 'FG %',
    'three_pt_pct': '3PT %'
  };

  const mapping = type === 'sport' ? sportsMapping : financeMapping;
  const displayIndicators = Object.keys(mapping).map(key => {
    const val = indicators?.[key];
    const score = typeof val === 'number' ? val : (parseFloat(val?.signal || '0'));
    return { name: mapping[key], score };
  });

  return (
    <div className="grid grid-cols-2 gap-2">
      {displayIndicators.map((ind, i) => (
        <div 
          key={i}
          className={`flex items-center justify-between p-3 rounded-xl border ${getIndicatorColor(ind.score)}`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{ind.name}</span>
          <span className="text-xs font-black italic">
            {ind.score > 0 ? '+' : ''}{ind.score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
