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
  if (!indicators) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  let displayIndicators: { name: string; score: number }[] = [];

  if (type === 'sport') {
    // Parity with desktop sports indicator labels
    const sportsMapping: Record<string, string> = {
      'win_pct': 'WIN %',
      'last_10': 'L10',
      'fg_pct': 'FG %',
      'three_pt_pct': '3PT %',
      'streak': 'STRK',
      'home_away': 'H/A',
      'rebounding': 'REB',
      'striking_accuracy': 'STRK',
      'finish_rate': 'FINISH',
      'rebound_rate': 'REB'
    };

    displayIndicators = Object.keys(sportsMapping)
      .filter(key => indicators[key] !== undefined)
      .map(key => ({
        name: sportsMapping[key],
        score: typeof indicators[key] === 'number' ? indicators[key] : (parseFloat(indicators[key]?.signal || '0'))
      }))
      .slice(0, 6);
  } else {
    // Parity with desktop financial indicator labels
    const financeMapping: Record<string, string> = {
      'SMA': 'SMA',
      'RSI': 'RSI',
      'Bollinger': 'BOLL',
      'CCI': 'CCI',
      'MACD': 'MACD',
      'ROC': 'ROC'
    };

    displayIndicators = Object.keys(financeMapping)
      .filter(key => indicators[key] !== undefined)
      .map(key => ({
        name: financeMapping[key],
        score: typeof indicators[key]?.signal === 'number' ? indicators[key].signal : parseFloat(indicators[key]?.signal || '0')
      }))
      .slice(0, 6);
  }

  if (displayIndicators.length === 0) return null;

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
