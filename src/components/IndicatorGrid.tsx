import React from 'react';

interface Indicator {
  name: string;
  score: number;
}

interface IndicatorGridProps {
  indicators: any;
}

const getIndicatorColor = (score: number) => {
  if (score >= 7) return 'text-green-400 border-green-500/30 bg-green-500/10';
  if (score >= 1) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  if (score >= -4) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  return 'text-red-400 border-red-500/30 bg-red-500/10';
};

export default function IndicatorGrid({ indicators }: IndicatorGridProps) {
  // Mapping from data keys to display names
  const mapping: Record<string, string> = {
    'CCI': 'CCI',
    'RSI': 'RSI',
    'SMA': 'SMA',
    'Bollinger': 'BOLL',
    'MACD': 'MACD',
    'Rate_of_Change': 'ROC',
    'ROC': 'ROC'
  };

  const displayIndicators = Object.keys(mapping).map(key => {
    const data = indicators?.[key];
    return {
      name: mapping[key],
      score: data?.signal || 0
    };
  });

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayIndicators.map((ind, i) => (
        <div 
          key={i}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${getIndicatorColor(ind.score)}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">{ind.name}</span>
          <span className="text-lg font-bold">
            {ind.score > 0 ? '+' : ''}{ind.score.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}
