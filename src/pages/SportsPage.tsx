import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Calendar, MapPin } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { formatScore, getScoreColorHex } from '../utils/format';

type Sport = 'NHL' | 'NBA' | 'UFC' | 'Soccer';

interface Game {
  id: string;
  home_team: string;
  away_team: string;
  home_team_shorthand: string;
  away_team_shorthand: string;
  analysis?: {
    home_score: number;
    away_score: number;
  };
  loading?: boolean;
}

interface UFCEvent {
  name: string;
  date: string;
  location: string;
  main_event: {
    fighter_1: { name: string };
    fighter_2: { name: string };
    is_title_fight: boolean;
  } | null;
}

export default function SportsPage() {
  const [activeSport, setActiveSport] = useState<Sport | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [ufcEvents, setUfcEvents] = useState<UFCEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const sports: Sport[] = ['NHL', 'NBA', 'UFC', 'Soccer'];

  useEffect(() => {
    if (activeSport === 'NHL' || activeSport === 'NBA') {
      fetchSchedule();
    } else if (activeSport === 'UFC') {
      fetchUFCEvents();
    }
  }, [activeSport]);

  const fetchSchedule = async () => {
    setLoading(true);
    setGames([]);
    try {
      const sportLower = activeSport?.toLowerCase();
      const res = await fetch(`https://hilex-nhl-production.up.railway.app/${sportLower}/schedule`);
      if (res.ok) {
        const data = await res.json();
        const gamesList = (data.games || data || []).map((g: any, i: number) => ({
          id: g.id || i.toString(),
          home_team: g.home_team,
          away_team: g.away_team,
          home_team_shorthand: g.home_team_shorthand || g.home_team,
          away_team_shorthand: g.away_team_shorthand || g.away_team
        }));
        setGames(gamesList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUFCEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://hilex-nhl-production.up.railway.app/ufc/events');
      if (res.ok) {
        const data = await res.json();
        setUfcEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (gameIndex: number) => {
    const game = games[gameIndex];
    if (!game) return;

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
      console.error(err);
    } finally {
      newGames[gameIndex].loading = false;
      setGames([...newGames]);
    }
  };

  if (!activeSport) {
    return (
      <div className="min-h-screen bg-[#020617] p-6 pb-32 flex flex-col">
        <div className="mb-12 pt-16"> {/* Padded for new header */}
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Sports</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Institutional Hub</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between px-8 group active:scale-95 transition-all duration-300"
            >
              <span className="text-2xl font-black italic uppercase tracking-tight text-white group-hover:text-[#00d4aa] transition-colors">{sport}</span>
              <Trophy size={20} className="text-slate-700 group-hover:text-[#00d4aa] transition-colors" />
            </button>
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 pb-32 animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="pt-16">
        <button onClick={() => setActiveSport(null)} className="flex items-center gap-2 text-[#00d4aa] mb-8 active:opacity-50 transition-opacity">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
        </button>

        {activeSport === 'Soccer' ? (
          <div className="h-[60vh] flex items-center justify-center">
            <p className="text-slate-600 font-bold italic text-lg">Coming soon</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-black italic uppercase text-white">{activeSport}</h2>
              <div className="h-[1px] w-12 bg-[#00d4aa] mt-2" />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : activeSport === 'UFC' ? (
              <div className="space-y-4">
                {ufcEvents.map((event, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black italic uppercase text-white leading-tight">{event.name}</h3>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={12} className="text-[#00d4aa]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={12} className="text-[#00d4aa]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{event.location}</span>
                        </div>
                      </div>

                      {event.main_event && (
                        <div className="pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black italic text-[#f1f5f9] uppercase tracking-tight">
                              {event.main_event.fighter_1.name} <span className="text-slate-600 px-1 opacity-50">vs</span> {event.main_event.fighter_2.name}
                            </span>
                            {event.main_event.is_title_fight && <span className="text-sm">🏆</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {games.map((game, i) => (
                  <div key={game.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between h-10">
                      <span className="text-lg font-black italic uppercase tracking-tighter text-white">
                        {game.away_team_shorthand} <span className="text-slate-600 px-2 opacity-50">@</span> {game.home_team_shorthand}
                      </span>
                      
                      {game.loading ? (
                        <div className="w-16 h-8 bg-white/5 rounded-xl animate-pulse" />
                      ) : game.analysis ? (
                        <div className="flex items-center gap-4 animate-in fade-in duration-300">
                          <span className="text-xl font-black italic" style={{ color: getScoreColorHex(game.analysis.away_score) }}>
                            {game.analysis.away_score > 0 ? '+' : ''}{formatScore(game.analysis.away_score)}
                          </span>
                          <div className="w-[1px] h-4 bg-white/10" />
                          <span className="text-xl font-black italic" style={{ color: getScoreColorHex(game.analysis.home_score) }}>
                            {game.analysis.home_score > 0 ? '+' : ''}{formatScore(game.analysis.home_score)}
                          </span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAnalyze(i)}
                          className="bg-white/5 border border-[#00d4aa]/30 text-[#00d4aa] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >
                          Analyze
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      <BottomNav />
    </div>
  );
}
