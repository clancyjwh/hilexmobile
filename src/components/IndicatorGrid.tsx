import React from 'react';

interface IndicatorGridProps {
  indicators: any;
  type?: string;
  sport?: string;
}

const getIndicatorColor = (score: number) => {
  if (score >= 4) return 'text-green-400 border-green-500/30 bg-green-500/10';
  if (score >= 1) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  if (score >= -4) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  return 'text-red-400 border-red-500/30 bg-red-500/10';
};

export default function IndicatorGrid({ indicators, type, sport }: IndicatorGridProps) {
  const financeMapping: Record<string, string> = {
    'SMA': 'SMA',
    'RSI': 'RSI',
    'Bollinger': 'BOLL',
    'CCI': 'CCI',
    'MACD': 'MACD',
    'ROC': 'ROC'
  };

  const nbaMapping: Record<string, string> = {
    'win_rate': 'WIN %',
    'recent_form': 'L10',
    'home_away': 'H/A',
    'streak': 'STRK',
    'fg_pct': 'FG %',
    'three_pt_pct': '3PT %'
  };

  const ufcMapping: Record<string, string> = {
    'recent_form': 'FORM',
    'striking_accuracy': 'STRK ACC',
    'striking_defense': 'STRK DEF',
    'takedown_defense': 'TD DEF',
    'finish_rate': 'FINISH',
    'grappling_accuracy': 'GRAP ACC'
  };

  const soccerMapping: Record<string, string> = {
    'recent_form': 'FORM',
    'goal_difference': 'GD',
    'home_away': 'H/A',
    'win_rate': 'WIN %',
    'clean_sheets': 'CS',
    'rest_days': 'REST'
  };

  let mapping = financeMapping;
  const s = sport?.toLowerCase();
  if (type === 'sport') {
    if (s === 'nba') mapping = nbaMapping;
    else if (s === 'ufc' || s === 'mma') mapping = ufcMapping;
    else if (s === 'soccer' || s === 'ucl' || s === 'football') mapping = soccerMapping;
    else mapping = nbaMapping; // Fallback to generic sports
  }

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
          className={`flex items-center justify-between p-3 rounded-xl border ${getIndicatorColor(ind.score)} transition-colors duration-500`}
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
