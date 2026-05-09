import React from 'react';

interface IndicatorGridProps {
  indicators: any;
  type?: string;
  sport?: string;
  entityType?: 'athlete' | 'team';
}

const getIndicatorColor = (score: number) => {
  if (score >= 9) return 'bg-gradient-to-br from-[#FFFDF5] via-[#EBD48E] to-[#C9A43B] border-yellow-400 text-black shadow-[0_0_15px_rgba(201,164,59,0.4)]';
  if (score >= 7) return 'bg-green-900 border-green-700 text-green-300';
  if (score >= 4) return 'bg-green-700 border-green-600 text-green-200';
  if (score >= 1) return 'bg-green-500 border-green-400 text-white';
  if (score > -1) return 'bg-slate-700 border-slate-600 text-slate-300';
  if (score >= -4) return 'bg-orange-500 border-orange-400 text-white';
  if (score >= -7) return 'bg-red-600 border-red-500 text-white';
  if (score <= -9) return 'bg-gradient-to-br from-red-900 to-red-950 border-red-600 text-red-200';
  return 'bg-red-900 border-red-700 text-red-300';
};

export default function IndicatorGrid({ indicators, type, sport, entityType }: IndicatorGridProps) {
  const financeMapping: Record<string, string> = {
    'SMA': 'SMA',
    'RSI': 'RSI',
    'Bollinger': 'BOLL',
    'CCI': 'CCI',
    'MACD': 'MACD',
    'ROC': 'ROC'
  };

  const nhlTeamMapping: Record<string, string> = {
    'points_pct': 'Points %',
    'last_10': 'Last 10',
    'goal_diff': 'Goal Diff',
    'home_away': 'Venue Edge',
    'streak': 'Streak',
    'goalie': 'Goalie',
    'h2h': 'H2H History',
    'rest': 'Rest Edge',
    'series': 'Series Factor'
  };

  const nhlAthleteMapping: Record<string, string> = {
    'gwg': 'GWG',
    'playoff_ppg': 'Playoff PPG',
    'last3_pts': 'Last 3 P',
    'regular_ppg': 'Regular PPG'
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
    'finish_rate': 'FINISH'
  };

  const soccerMapping: Record<string, string> = {
    'recent_form': 'FORM',
    'goal_difference': 'GD',
    'home_away': 'H/A',
    'win_rate': 'WIN %'
  };

  let mapping = financeMapping;
  const s = sport?.toLowerCase();
  
  if (type === 'sport') {
    if (s === 'nhl') {
      mapping = entityType === 'athlete' ? nhlAthleteMapping : nhlTeamMapping;
    }
    else if (s === 'nba') mapping = nbaMapping;
    else if (s === 'ufc' || s === 'mma') mapping = ufcMapping;
    else if (s === 'soccer' || s === 'ucl' || s === 'football') mapping = soccerMapping;
    else mapping = nbaMapping;
  }

  const displayIndicators = Object.keys(mapping).map(key => {
    const val = indicators?.[key];
    const score = typeof val === 'number' ? val : (parseFloat(val?.signal || '0'));
    return { name: mapping[key], score };
  });

  return (
    <div className={`grid ${displayIndicators.length > 6 ? 'grid-cols-2' : (displayIndicators.length <= 4 ? 'grid-cols-1' : 'grid-cols-2')} gap-2.5`}>
      {displayIndicators.map((ind, i) => {
        const colorClass = getIndicatorColor(ind.score);
        const isGold = ind.score >= 9;
        
        return (
          <div 
            key={i}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-500 shadow-lg ${colorClass}`}
          >
            <span className={`text-[9px] font-black uppercase tracking-widest ${isGold ? 'text-black/50' : 'opacity-60'}`}>{ind.name}</span>
            <span className="text-sm font-black italic">
              {ind.score > 0 ? '+' : ''}{ind.score.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
