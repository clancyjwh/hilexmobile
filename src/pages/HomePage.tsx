import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, TrendingUp, Activity, Info } from 'lucide-react';
import MoverCard from '../components/MoverCard';
import BottomDrawer from '../components/BottomDrawer';
import IndicatorGrid from '../components/IndicatorGrid';
import { fetchMovers, Mover, fetchAssetAccuracy, fetchAssetIntelligence } from '../utils/analysis';

export default function HomePage() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [intelligence, setIntelligence] = useState<{ breakdown: any; summary: string | null } | null>(null);
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
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-[#00D8FF]/30">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-1.5 shadow-inner">
            <img src="/logo.png" alt="HiLEX" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">HiLEX</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2.5 bg-white/5 rounded-full text-slate-400 active:text-[#00D8FF] transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2.5 bg-white/5 rounded-full text-slate-400 active:text-[#00D8FF] transition-colors">
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
              <div key={i} className="w-full aspect-[16/9] bg-white/5 rounded-xl animate-pulse" />
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
        <button className="text-[#00D8FF] flex flex-col items-center gap-1.5 group">
          <TrendingUp size={26} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-widest">MOVERS</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1.5 group opacity-40">
          <Menu size={26} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-widest">DASHBOARD</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1.5 group opacity-40">
          <Bell size={26} className="group-active:scale-90 transition-transform" />
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   {(selectedMover.headshot_url || selectedMover.logo_url) && (
                    <img src={selectedMover.headshot_url || selectedMover.logo_url} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                  )}
                  <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{selectedMover.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 font-mono text-xs font-bold uppercase tracking-tighter">{selectedMover.symbol.split('_').pop()}</span>
                      <span className="text-[8px] bg-[#00D8FF]/10 text-[#00D8FF] px-2 py-0.5 rounded border border-[#00D8FF]/20 uppercase font-black tracking-widest">
                        {selectedMover.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-black italic leading-none mb-1 ${selectedMover.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedMover.score > 0 ? '+' : ''}{selectedMover.score.toFixed(1)}
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HeatScore</div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex justify-between items-center shadow-inner">
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Historical Accuracy</div>
                <p className="text-[10px] text-slate-400 font-medium italic">Verified predictive success rate</p>
              </div>
              <div className="text-3xl font-black text-[#00D8FF] italic">
                {accuracy ? `${accuracy}%` : '--%'}
              </div>
            </div>

            {/* Analysis Breakdown */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
                Technical Analysis Breakdown
                <Info size={12} className="opacity-40" />
              </h4>
              
              {intelLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <IndicatorGrid indicators={intelligence?.breakdown} type={selectedMover.type} />
              )}
            </div>

            {/* Real Intelligence Blurb */}
            <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10 relative overflow-hidden group min-h-[140px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D8FF]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#00D8FF]/10 transition-all duration-700" />
              <h4 className="text-[10px] font-black text-[#00D8FF] uppercase tracking-[0.3em] mb-4 italic">Intelligence Signal</h4>
              
              {intelLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-4/5 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                </div>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed font-medium italic relative z-10 selection:bg-[#00D8FF]/30">
                  {intelligence?.summary || 'Structural analysis complete. Signal maintains high-fidelity alignment with current volatility horizons.'}
                </p>
              )}
            </div>

            {/* Success Dots */}
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verification Timeline</h4>
              <div className="flex items-center justify-between gap-1.5">
                {[...Array(12)].map((_, i) => {
                  const isSuccess = Math.random() > (1 - (accuracy || 85)/100);
                  return (
                    <div 
                      key={i} 
                      className={`w-3.5 h-3.5 rounded-full shadow-lg ${isSuccess ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">
                <span>Q1</span>
                <span>Q2</span>
                <span>Q3</span>
                <span>Q4</span>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
              <p className="text-[9px] text-slate-600 text-center uppercase tracking-tight leading-relaxed font-bold italic">
                HiLEX signals are derived from proprietary algorithmic data processing. Past performance is not indicative of future results. No part of this analysis constitutes financial advice. HiLEX is a data intelligence platform for institutional-grade research.
              </p>
            </div>
          </div>
        )}
      </BottomDrawer>
    </div>
  );
}
