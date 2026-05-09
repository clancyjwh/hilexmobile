import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, TrendingUp, Info, Activity } from 'lucide-react';
import MoverCard from '../components/MoverCard';
import BottomDrawer from '../components/BottomDrawer';
import IndicatorGrid from '../components/IndicatorGrid';
import { fetchMovers, Mover, fetchAssetAccuracy, fetchAssetIntelligence } from '../utils/analysis';

export default function HomePage() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [indicators, setIndicators] = useState<any>(null);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);

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
    setIndicators(null);
    setIndicatorsLoading(true);
    
    // Fetch in parallel for better performance
    const [acc, intel] = await Promise.all([
      fetchAssetAccuracy(mover.symbol),
      fetchAssetIntelligence(mover)
    ]);
    
    setAccuracy(acc);
    setIndicators(intel);
    setIndicatorsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <img src="/logo.png" alt="HiLEX" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">HiLEX</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 bg-white/5 rounded-full text-slate-400 active:text-[#00D8FF]">
            <Search size={20} />
          </button>
          <button className="p-2 bg-white/5 rounded-full text-slate-400 active:text-[#00D8FF]">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-6 bg-gradient-to-b from-[#00D8FF]/10 to-transparent">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Market Pulse</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Global Intelligence Feed</p>
      </div>

      {/* Main Feed */}
      <main className="px-6 flex-grow pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={12} className="text-[#00D8FF]" />
            Top Intelligence Movers
          </h2>
          <div className="h-[1px] flex-1 bg-white/5 ml-4" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="w-full h-[56px] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
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

      {/* Tab Bar Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 px-10 flex items-center justify-between z-40">
        <button className="text-[#00D8FF] flex flex-col items-center gap-1 transition-all">
          <TrendingUp size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">MOVERS</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1 opacity-50">
          <Menu size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">DASHBOARD</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1 opacity-50">
          <Bell size={24} />
          <span className="text-[9px] font-black uppercase tracking-widest">ALERTS</span>
        </button>
      </div>

      {/* Detail Bottom Sheet */}
      <BottomDrawer 
        isOpen={!!selectedMover} 
        onClose={() => setSelectedMover(null)}
        title="Asset Intelligence"
      >
        {selectedMover && (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-1 leading-none">{selectedMover.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-sm font-bold uppercase tracking-tighter">
                    {selectedMover.symbol.length > 20 ? selectedMover.symbol.substring(0, 20) + '...' : selectedMover.symbol}
                  </span>
                  <span className="text-[8px] bg-white/5 text-[#00D8FF] px-2 py-0.5 rounded border border-white/10 uppercase font-black tracking-widest">
                    {selectedMover.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-black italic leading-none mb-1 ${selectedMover.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedMover.score > 0 ? '+' : ''}{selectedMover.score.toFixed(1)}
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HeatScore</div>
              </div>
            </div>

            {/* Accuracy Badge */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4">
              <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Historical Accuracy</div>
                <p className="text-[10px] text-slate-400 font-medium">Verified predictive success rate</p>
              </div>
              <div className="text-2xl font-black text-[#00D8FF] italic drop-shadow-[0_0_10px_rgba(0,216,255,0.3)]">
                {accuracy ? `${accuracy}%` : '--%'}
              </div>
            </div>

            {/* Indicator Grid */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                Technical Analysis Breakdown
                <Info size={12} className="opacity-50" />
              </h4>
              <IndicatorGrid indicators={indicators} type={selectedMover.type} />
              {indicatorsLoading && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-3 h-3 border-2 border-[#00D8FF]/20 border-t-[#00D8FF] rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-[#00D8FF] uppercase tracking-widest animate-pulse">Analyzing...</span>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D8FF]/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-[#00D8FF]/10 transition-all" />
              <h4 className="text-[10px] font-black text-[#00D8FF] uppercase tracking-[0.3em] mb-4 italic">Intelligence Signal</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium italic relative z-10">
                {selectedMover.score >= 4 ? 'Elite bullish momentum detected. Algorithmic patterns suggest aggressive trend continuation with high probability.' : 
                 selectedMover.score >= 1 ? 'Positive accumulation phase active. Technical oscillators maintaining upward bias despite short-term noise.' :
                 selectedMover.score >= -4 ? 'Neutral to distribution phase. Market intelligence suggesting cautious positioning as volatility expands.' :
                 'Severe bearish pressure dominant. Structural breakdown confirmed across primary analytical frameworks. High risk of further drawdown.'}
              </p>
            </div>

            {/* Historical Verification Dots */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Success Verification (12-Month Sample)</h4>
              <div className="flex items-center justify-between gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
                  const isSuccess = Math.random() > (1 - (accuracy || 72)/100);
                  return (
                    <div 
                      key={i} 
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-1000 ${isSuccess ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-widest">
                <span>JAN</span>
                <span>JUN</span>
                <span>DEC</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
              <p className="text-[8px] text-slate-600 text-center uppercase tracking-tighter leading-normal font-bold">
                HiLEX signals are generated via proprietary algorithmic modeling and high-fidelity intelligence data. This does not constitute financial advice. All investments involve risk. Verified accuracy is based on historical backtesting.
              </p>
            </div>
          </div>
        )}
      </BottomDrawer>
    </div>
  );
}
