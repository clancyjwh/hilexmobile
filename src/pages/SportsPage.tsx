import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Zap, Clock, Shield } from 'lucide-react';
import BottomNav from '../components/BottomNav';

type Sport = 'NHL' | 'NBA' | 'UFC' | 'Soccer';

interface Game {
  id: string;
  home_team_shorthand: string;
  away_team_shorthand: string;
  home_team: string;
  away_team: string;
  analysis?: {
    home_score: number;
    away_score: number;
  };
  loading?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 7) return 'text-green-400';
  if (score >= 4) return 'text-green-500';
  if (score >= 1) return 'text-green-600';
  if (score > -1) return 'text-slate-400';
  if (score >= -4) return 'text-orange-400';
  if (score >= -7) return 'text-red-500';
  return 'text-red-400';
};

export default function SportsPage() {
  const [activeSport, setActiveSport] = useState<Sport | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const sports: Sport[] = ['NHL', 'NBA', 'UFC', 'Soccer'];

  useEffect(() => {
    if (activeSport === 'NHL' || activeSport === 'NBA') {
      fetchSchedule();
    }
  }, [activeSport]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const sportLower = activeSport?.toLowerCase();
      const res = await fetch(`https://hilex-nhl-production.up.railway.app/${sportLower}/schedule`);
      if (res.ok) {
        const data = await res.json();
        const gamesList = (data.games || data).map((g: any, i: number) => ({
          id: g.id || i.toString(),
          home_team_shorthand: g.home_team_shorthand || g.home_team || 'HOME',
          away_team_shorthand: g.away_team_shorthand || g.away_team || 'AWAY',
          home_team: g.home_team,
          away_team: g.away_team
        }));
        setGames(gamesList);
      }
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (gameIndex: number) => {
    const game = games[gameIndex];
    const newGames = [...games];
    newGames[gameIndex].loading = true;
    setGames(newGames);

    try {
      const sportLower = activeSport?.toLowerCase();
      const res = await fetch(`https://hilex-nhl-production.up.railway.app/${sportLower}/lite/analyze?home=${encodeURIComponent(game.home_team)}&away=${encodeURIComponent(game.away_team)}`);
      if (res.ok) {
        const data = await res.json();
        newGames[gameIndex].analysis = {
          home_score: data.home_score,
          away_score: data.away_score
        };
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      newGames[gameIndex].loading = false;
      setGames([...newGames]);
    }
  };

  if (!activeSport) {
    return (
      <div className="min-h-screen bg-[#020617] p-6 animate-in fade-in duration-500 pb-32">
        <div className="mb-12 pt-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Sports Hub</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Live Institutional Analysis</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-8 group active:scale-95 transition-all duration-300"
            >
              <span className="text-2xl font-black italic uppercase tracking-tight text-white group-hover:text-[#00D8FF] transition-colors">{sport}</span>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-slate-600 group-hover:text-[#00D8FF] transition-colors" />
              </div>
            </button>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (activeSport === 'UFC' || activeSport === 'Soccer') {
    return (
      <div className="min-h-screen bg-[#020617] p-6 animate-in slide-in-from-right duration-500 pb-32">
        <button onClick={() => setActiveSport(null)} className="flex items-center gap-2 text-[#00D8FF] mb-8 active:opacity-50">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Sports</span>
        </button>

        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-[#00D8FF]/5 rounded-3xl flex items-center justify-center border border-[#00D8FF]/10">
            <Clock className="text-[#00D8FF]" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase text-white">Coming Soon</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Integration in progress</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 animate-in slide-in-from-right duration-500 pb-32">
      <button onClick={() => setActiveSport(null)} className="flex items-center gap-2 text-[#00D8FF] mb-8 active:opacity-50">
        <ChevronLeft size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Back to Sports</span>
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-black italic uppercase text-white">{activeSport} Schedule</h2>
        <div className="h-[1px] w-12 bg-[#00D8FF] mt-2" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game, i) => (
            <div key={game.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all duration-500">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black italic uppercase tracking-tighter text-white">
                  {game.away_team_shorthand} <span className="text-slate-600 px-2 opacity-50">@</span> {game.home_team_shorthand}
                </span>
                <button 
                  onClick={() => handleAnalyze(i)}
                  disabled={game.loading}
                  className="bg-[#00D8FF] text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                  {game.loading ? '...' : 'Analyze'}
                </button>
              </div>

              {game.analysis && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-around animate-in slide-in-from-top-2 duration-300">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{game.away_team_shorthand}</p>
                    <p className={`text-2xl font-black italic ${getScoreColor(game.analysis.away_score)}`}>
                      {game.analysis.away_score > 0 ? '+' : ''}{game.analysis.away_score.toFixed(1)}
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10" />
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{game.home_team_shorthand}</p>
                    <p className={`text-2xl font-black italic ${getScoreColor(game.analysis.home_score)}`}>
                      {game.analysis.home_score > 0 ? '+' : ''}{game.analysis.home_score.toFixed(1)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {games.length === 0 && (
            <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-20">No active games found</p>
          )}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
