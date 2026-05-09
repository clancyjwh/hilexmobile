import React from 'react';
import { Sparkles, TrendingUp, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function HomeDashboard() {
  const navigate = useNavigate();

  const fastActions = [
    { label: 'Finance Intelligence', icon: TrendingUp, path: '/finance', color: 'text-[#00D8FF]', bg: 'bg-[#00D8FF]/10' },
    { label: 'Sports Analysis', icon: Trophy, path: '/sports', color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Prediction Markets', icon: BarChart3, path: '/prediction-markets', color: 'text-purple-400', bg: 'bg-purple-400/10' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans pb-32 flex flex-col">
      {/* Hero */}
      <div className="px-6 pt-24 pb-12 bg-gradient-to-b from-[#00D8FF]/10 to-transparent">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-4">
          Institutional <br/> Intelligence
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-[280px] leading-relaxed">
          High-conviction signal processing for global assets and events.
        </p>
      </div>

      <main className="px-6 space-y-12">
        {/* Fast Actions */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
            <Sparkles size={12} className="text-[#00D8FF]" />
            Active Portals
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {fastActions.map((action) => (
              <button 
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center`}>
                    <action.icon size={24} className={action.color} />
                  </div>
                  <span className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-[#00D8FF] transition-colors">
                    {action.label}
                  </span>
                </div>
                <ArrowRight size={20} className="text-slate-700 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </section>

        {/* Global Signal Summary placeholder */}
        <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D8FF]/5 blur-[60px] rounded-full -mr-16 -mt-16" />
          <div className="relative z-10 space-y-4">
            <h3 className="text-[10px] font-black text-[#00D8FF] uppercase tracking-[0.4em]">Signal Status</h3>
            <p className="text-xl font-black italic uppercase text-white tracking-tight">
              All production nodes are active. <br/> Processing 1.2M events/sec.
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
