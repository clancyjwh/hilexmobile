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
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  let displayIndicators: { name: string; score: number }[] = [];

  if (type === 'sport') {
    // Mapping for sports indicators
    const sportsMapping: Record<string, string> = {
      'win_pct': 'WIN%',
      'last_10': 'L10',
      'fg_pct': 'FG%',
      'three_pt_pct': '3PT%',
      'rebounding': 'REB',
      'streak': 'STRK',
      'striking_accuracy': 'STRK',
      'grappling': 'GRAP',
      'finish_rate': 'FINISH'
    };

    displayIndicators = Object.keys(sportsMapping)
      .filter(key => indicators[key] !== undefined)
      .slice(0, 6)
      .map(key => ({
        name: sportsMapping[key],
        score: typeof indicators[key] === 'number' ? indicators[key] : (indicators[key]?.signal || 0)
      }));
  } else {
    // Mapping for financial indicators
    const financeMapping: Record<string, string> = {
      'CCI': 'CCI',
      'RSI': 'RSI',
      'SMA': 'SMA',
      'Bollinger': 'BOLL',
      'MACD': 'MACD',
      'ROC': 'ROC',
      'Rate_of_Change': 'ROC'
    };

    displayIndicators = Object.keys(financeMapping)
      .filter(key => indicators[key] !== undefined)
      .slice(0, 6)
      .map(key => ({
        name: financeMapping[key],
        score: indicators[key]?.signal !== undefined ? indicators[key].signal : (typeof indicators[key] === 'number' ? indicators[key] : 0)
      }));
  }

  // Fallback if no indicators matched
  if (displayIndicators.length === 0) {
    displayIndicators = [
      { name: 'CCI', score: 0 },
      { name: 'RSI', score: 0 },
      { name: 'SMA', score: 0 },
      { name: 'BOLL', score: 0 },
      { name: 'MACD', score: 0 },
      { name: 'ROC', score: 0 }
    ];
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayIndicators.map((ind, i) => (
        <div 
          key={i}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-500 ${getIndicatorColor(ind.score)}`}
        >
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">{ind.name}</span>
          <span className="text-sm font-black italic">
            {ind.score > 0 ? '+' : ''}{ind.score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
