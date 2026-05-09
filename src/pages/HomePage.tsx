import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, TrendingUp, Activity, Info } from 'lucide-react';
import MoverCard from '../components/MoverCard';
import BottomDrawer from '../components/BottomDrawer';
import IndicatorGrid from '../components/IndicatorGrid';
import MonthlySnapshots from '../components/MonthlySnapshots';
import { fetchMovers, Mover, fetchAssetAccuracy, fetchAssetIntelligence } from '../utils/analysis';

export default function HomePage() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [intelligence, setIntelligence] = useState<{ breakdown: any; json9?: any } | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);

  useEffect(() => {
    loadMovers();
  }, []);

  const loadMovers = async () => {
    setLoading(true);
    const data = await fetchMovers();
    setMovers(data);
    setLoading(false);
  };

  const handleMoverClick = async (mover: Mover) => {
    setSelectedMover(mover);
    setAccuracy(null);
    setIntelligence(null);
    setIntelLoading(true);
    
    try {
      const [acc, intel] = await Promise.all([
        fetchAssetAccuracy(mover),
        fetchAssetIntelligence(mover)
      ]);
      setAccuracy(acc);
      setIntelligence(intel);
    } catch (err) {
      console.error('Error loading intelligence:', err);
    } finally {
      setIntelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-[#00D8FF]/30 overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-1.5">
            <img src="/logo.png" alt="HiLEX" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic text-white">HiLEX</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2.5 bg-white/5 rounded-full text-slate-400 active:text-[#00D8FF]">
            <Search size={20} />
          </button>
          <button className="p-2.5 bg-white/5 rounded-full text-slate-400 active:text-[#00D8FF]">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 py-8 bg-gradient-to-b from-[#00D8FF]/10 to-transparent">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-1 text-white">Market Pulse</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Global Intelligence Feed</p>
      </div>

      {/* Main Grid */}
      <main className="px-6 flex-grow pb-32">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
            <Activity size={12} className="text-[#00D8FF]" />
            Top Intelligence Movers
          </h2>
          <div className="h-[1px] flex-1 bg-white/5 ml-4" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="w-full aspect-[16/10] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {movers.map((mover) => (
              <MoverCard 
                key={mover.id} 
                mover={mover} 
                onClick={() => handleMoverClick(mover)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#020617]/95 backdrop-blur-2xl border-t border-white/10 px-12 flex items-center justify-between z-40">
        <button className="text-[#00D8FF] flex flex-col items-center gap-1.5">
          <TrendingUp size={26} />
          <span className="text-[9px] font-black uppercase tracking-widest">MOVERS</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1.5 opacity-40">
          <Menu size={26} />
          <span className="text-[9px] font-black uppercase tracking-widest">DASHBOARD</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1.5 opacity-40">
          <Bell size={26} />
          <span className="text-[9px] font-black uppercase tracking-widest">ALERTS</span>
        </button>
      </nav>

      {/* Intelligence Sheet */}
      <BottomDrawer 
        isOpen={!!selectedMover} 
        onClose={() => setSelectedMover(null)}
        title="Asset Intelligence"
      >
        {selectedMover && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            {/* Header section - FIXED OVERLAP */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {(selectedMover.headshot_url || selectedMover.logo_url) && (
                  <img src={selectedMover.headshot_url || selectedMover.logo_url} className="w-16 h-16 rounded-full border-2 border-white/10 bg-black/40 shadow-2xl shrink-0" alt="" />
                )}
                <div className="min-w-0 overflow-hidden">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none truncate">{selectedMover.name}</h3>
                  <div className="mt-2">
                    <span className="text-[9px] bg-[#00D8FF]/10 text-[#00D8FF] px-2.5 py-1 rounded border border-[#00D8FF]/20 uppercase font-black tracking-[0.2em]">
                      {selectedMover.type === 'sport' ? (selectedMover.entity_type === 'athlete' ? 'ATHLETE' : 'TEAM') : selectedMover.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-4xl font-black italic leading-none mb-1 ${selectedMover.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedMover.score > 0 ? '+' : ''}{selectedMover.score.toFixed(1)}
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HeatScore</div>
              </div>
            </div>

            {/* Accuracy Section - Replaced with HeatScore for Sports */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex justify-between items-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D8FF]/20 to-transparent" />
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                  {selectedMover.type === 'sport' ? 'Signal Strength' : 'Historical Accuracy'}
                </div>
                {selectedMover.type === 'sport' && (
                  <p className="text-[9px] text-slate-400 italic uppercase tracking-widest">Optimized Intelligence</p>
                )}
              </div>
              <div className="text-4xl font-black text-[#00D8FF] italic drop-shadow-[0_0_15px_rgba(0,216,255,0.3)]">
                {selectedMover.type === 'sport' ? selectedMover.score.toFixed(1) : (accuracy ? `${accuracy}%` : '--%')}
              </div>
            </div>

            {/* Analysis Breakdown */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
                Technical Analysis Breakdown
                <Info size={12} className="opacity-40" />
              </h4>
              <IndicatorGrid 
                indicators={intelligence?.breakdown} 
                type={selectedMover.type} 
                sport={selectedMover.sport} 
              />
            </div>

            {/* Monthly Snapshots - Re-designed compact version */}
            {intelligence?.json9 && (
              <MonthlySnapshots json9={intelligence.json9} />
            )}

            {/* Compliance Footer */}
            <div className="pt-6 border-t border-white/5">
              <p className="text-[9px] text-slate-700 text-center uppercase tracking-tight leading-relaxed font-bold italic">
                Proprietary algorithmic data processing. Past performance is not indicative of future results. No part of this analysis constitutes financial advice. Institutional-grade research.
              </p>
            </div>
          </div>
        )}
      </BottomDrawer>
    </div>
  );
}
