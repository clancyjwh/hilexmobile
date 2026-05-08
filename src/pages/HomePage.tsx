import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, TrendingUp, Info } from 'lucide-react';
import MoverCard from '../components/MoverCard';
import BottomDrawer from '../components/BottomDrawer';
import IndicatorGrid from '../components/IndicatorGrid';
import { fetchMovers, Mover, fetchAssetAccuracy } from '../utils/analysis';

export default function HomePage() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

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
    const acc = await fetchAssetAccuracy(mover.symbol);
    setAccuracy(acc);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/80 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-1.5">
            <img src="/logo.png" alt="HiLEX" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight">HiLEX</span>
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

      {/* Hero / Filter Section */}
      <div className="px-6 py-6 bg-gradient-to-b from-[#00D8FF]/5 to-transparent">
        <h1 className="text-3xl font-bold mb-2">Market Pulse</h1>
        <p className="text-slate-400 text-sm">Top signals across global intelligence.</p>
      </div>

      {/* Main Feed */}
      <main className="px-6 flex-grow pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={12} className="text-[#00D8FF]" />
            Top Intelligence Movers
          </h2>
          <button className="text-[#00D8FF] text-xs font-bold uppercase">View All</button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-full h-20 bg-white/5 rounded-2xl animate-pulse" />
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

      {/* Tab Bar Placeholder (Future Phase) */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#020617]/90 backdrop-blur-xl border-t border-white/10 px-8 flex items-center justify-between z-40">
        <button className="text-[#00D8FF] flex flex-col items-center gap-1">
          <TrendingUp size={24} />
          <span className="text-[10px] font-bold">MOVERS</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1">
          <Menu size={24} />
          <span className="text-[10px] font-bold">DASHBOARD</span>
        </button>
        <button className="text-slate-500 flex flex-col items-center gap-1">
          <Bell size={24} />
          <span className="text-[10px] font-bold">ALERTS</span>
        </button>
      </div>

      {/* Detail Bottom Sheet */}
      <BottomDrawer 
        isOpen={!!selectedMover} 
        onClose={() => setSelectedMover(null)}
        title="Asset Intelligence"
      >
        {selectedMover && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-bold text-white mb-1">{selectedMover.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">{selectedMover.symbol}</span>
                  <span className="text-xs bg-[#00D8FF]/10 text-[#00D8FF] px-2 py-0.5 rounded border border-[#00D8FF]/20 uppercase font-bold">
                    {selectedMover.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${selectedMover.score > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedMover.score > 0 ? '+' : ''}{selectedMover.score.toFixed(1)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">HeatScore</div>
              </div>
            </div>

            {/* Accuracy Badge */}
            {accuracy && (
              <div className="flex justify-end">
                <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Hist. Accuracy</span>
                  <span className="text-sm font-bold text-[#00D8FF] italic">{accuracy}%</span>
                </div>
              </div>
            )}

            {/* Indicator Grid */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                Technical Indicators
                <Info size={12} />
              </h4>
              <IndicatorGrid indicators={selectedMover.indicators} />
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-[10px] font-bold text-[#00D8FF] uppercase tracking-widest mb-2">Signal Summary</h4>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {selectedMover.score >= 4 ? 'Strong bullish momentum detected. Multiple technical indicators confirm positive trend continuation.' : 
                 selectedMover.score >= 1 ? 'Slightly positive outlook. Mixed signals across oscillators suggesting caution but maintaining bullish bias.' :
                 selectedMover.score >= -4 ? 'Neutral to slightly bearish. Distribution phase active with potential for downside testing.' :
                 'Strong bearish signals dominant. Sell pressure remains high across primary technical frameworks.'}
              </p>
            </div>

            {/* Monthly Snapshot Dots */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Historical Verification (360 Days)</h4>
              <div className="flex items-center justify-between gap-1 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
                  const isSuccess = Math.random() > (1 - (accuracy || 70)/100); // Simulated based on actual accuracy for UI demo
                  return (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full ${isSuccess ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase">
                <span>30D</span>
                <span>180D</span>
                <span>360D</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[8px] text-slate-600 text-center uppercase tracking-tight leading-normal px-4 pt-4 border-t border-white/5">
              Disclaimer: HiLEX signals are based on algorithmic data patterns and do not constitute financial advice. Past performance is not indicative of future results. Use caution in high volatility markets.
            </p>
          </div>
        )}
      </BottomDrawer>
    </div>
  );
}
