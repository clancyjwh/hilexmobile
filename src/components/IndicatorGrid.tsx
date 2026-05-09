import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface IndicatorGridProps {
  indicators: any;
  type?: string;
  sport?: string;
  entityType?: 'athlete' | 'team';
}

const DEFINITIONS: Record<string, string> = {
  'SMA': 'Simple Moving Average: A trend-following indicator based on the average price over a specific period.',
  'RSI': 'Relative Strength Index: Measures the speed and change of price movements to identify overbought or oversold conditions.',
  'BOLL': 'Bollinger Bands: Volatility indicator consisting of a moving average and two standard deviation lines.',
  'CCI': 'Commodity Channel Index: Identifies new trends or warns of extreme conditions by measuring price relative to average.',
  'MACD': 'Moving Average Convergence Divergence: A trend-following momentum indicator that shows the relationship between two moving averages.',
  'ROC': 'Rate of Change: Measures the percentage change in price between the current price and a past price.',
  'POINTS %': 'Points Percentage: Reflects the team\'s overall season success rate based on possible points earned.',
  'LAST 10': 'Recent Form: Measures performance over the last 10 games to identify current momentum trends.',
  'GOAL DIFF': 'Goal Differential: A strong predictor of long-term success, measuring the gap between goals scored and conceded.',
  'VENUE EDGE': 'Venue Performance: Adjusts the forecast based on the team\'s specific success rate at home vs. on the road.',
  'STREAK': 'Streak Factor: Accounts for the psychological and statistical impact of current winning or losing streaks.',
  'GOALIE': 'Goaltending Matchup: Analyzes the starting goaltender\'s save percentage and recent consistency.',
  'H2H HISTORY': 'Head-to-Head: Factors in historical performance and matchup dynamics between specific franchises.',
  'REST EDGE': 'Schedule & Rest: Analyzes the fatigue factor based on days since the last game and back-to-back situations.',
  'SERIES FACTOR': 'Series Context: Accounts for the current series score and pressure dynamics in multi-game series.',
  'GWG': 'Game Winning Goals: Measures an athlete\'s ability to provide the deciding score in competitive matchups.',
  'PLAYOFF PPG': 'Post-season Points Per Game: Scoring efficiency in high-pressure playoff scenarios.',
  'LAST 3 P': 'Recent Scoring Momentum: Total points earned by the athlete over their last three active games.',
  'REGULAR PPG': 'Regular Season Points Per Game: Baseline scoring efficiency and consistency over the full season.',
  'WIN %': 'Win Percentage: The ratio of total wins to total games played for the current season.',
  'FORM': 'Recent Momentum: A combined score reflecting performance and results over the most recent stretch of games.',
  'STRK ACC': 'Striking Accuracy: The percentage of significant strikes that successfully land on the target.',
  'STRK DEF': 'Striking Defense: The percentage of opponent significant strikes avoided or blocked.',
  'TD DEF': 'Takedown Defense: The success rate in preventing opponent takedown attempts.',
  'FINISH': 'Finish Rate: The percentage of victories achieved by knockout or submission rather than decision.',
  'FG %': 'Field Goal Percentage: The efficiency of an athlete or team in converting shot attempts into points.',
  '3PT %': 'Three-Point Percentage: Specific efficiency from beyond the arc, a key indicator in modern spacing analytics.'
};

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
  const [activeDef, setActiveDef] = useState<{ name: string; def: string } | null>(null);

  const financeMapping: Record<string, string> = {
    'SMA': 'SMA',
    'RSI': 'RSI',
    'Bollinger': 'BOLL',
    'CCI': 'CCI',
    'MACD': 'MACD',
    'ROC': 'ROC'
  };

  const nhlTeamMapping: Record<string, string> = {
    'points_pct': 'POINTS %',
    'last_10': 'LAST 10',
    'goal_diff': 'GOAL DIFF',
    'home_away': 'VENUE EDGE',
    'streak': 'STREAK',
    'goalie': 'GOALIE',
    'h2h': 'H2H HISTORY',
    'rest': 'REST EDGE',
    'series': 'SERIES FACTOR'
  };

  const nhlAthleteMapping: Record<string, string> = {
    'gwg': 'GWG',
    'playoff_ppg': 'PLAYOFF PPG',
    'last3_points': 'LAST 3 P',
    'regular_ppg': 'REGULAR PPG'
  };

  const nbaMapping: Record<string, string> = {
    'win_rate': 'WIN %',
    'recent_form': 'LAST 10',
    'home_away': 'VENUE EDGE',
    'streak': 'STREAK',
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
    'goal_difference': 'GOAL DIFF',
    'home_away': 'VENUE EDGE',
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
    <>
      <div className={`grid ${displayIndicators.length > 6 ? 'grid-cols-2' : (displayIndicators.length <= 4 ? 'grid-cols-1' : 'grid-cols-2')} gap-2.5 overflow-x-hidden w-full`}>
        {displayIndicators.map((ind, i) => {
          const colorClass = getIndicatorColor(ind.score);
          const isGold = ind.score >= 9;
          
          return (
            <button 
              key={i}
              onClick={() => setActiveDef({ name: ind.name, def: DEFINITIONS[ind.name] || 'Institutional-grade metric used in HiLEX algorithmic forecasting.' })}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 shadow-lg ${colorClass} min-w-0 active:scale-95 group relative`}
            >
              <div className="flex flex-col items-start overflow-hidden">
                <span className={`text-[7.5px] font-black uppercase tracking-wider mr-2 shrink-0 ${isGold ? 'text-black/50' : 'opacity-60'}`}>
                  {ind.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black italic shrink-0">
                  {ind.score > 0 ? '+' : ''}{ind.score.toFixed(1)}
                </span>
                <Info size={10} className={`opacity-0 group-hover:opacity-40 transition-opacity ${isGold ? 'text-black' : 'text-white'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Definition Modal */}
      {activeDef && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setActiveDef(null)}>
          <div 
            className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setActiveDef(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00D8FF]/10 rounded-xl flex items-center justify-center border border-[#00D8FF]/20">
                  <Info className="text-[#00D8FF]" size={20} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{activeDef.name}</h3>
              </div>
              
              <div className="h-[2px] w-12 bg-[#00D8FF]" />
              
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                {activeDef.def}
              </p>
              
              <button 
                onClick={() => setActiveDef(null)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
