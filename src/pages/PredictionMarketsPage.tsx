import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ChevronDown, Zap, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface MarketItem {
  question: string;
  slug: string;
  event_score: number;
  yes_prob: number;
  polymarket_yes_prob: number | null;
  polymarket_week_change: number | null;
  gap: number | null;
  misprice_flag: boolean;
  breakdown?: any;
}

const getScoreColor = (score: number) => {
  if (score >= 7) return 'text-[#00d4aa]';
  if (score >= 4) return 'text-[#00d4aa] opacity-80';
  if (score >= 1) return 'text-[#00d4aa] opacity-60';
  if (score > -1) return 'text-slate-500';
  if (score >= -4) return 'text-[#ef4444] opacity-60';
  if (score >= -7) return 'text-[#ef4444] opacity-80';
  return 'text-[#ef4444]';
};

export default function PredictionMarketsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [questions, setQuestions] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const trackEvent = (description: string, slug: string | null = null) => {
    // IDENTICAL WEBHOOK TARGET & DATA STRUCTURE
    fetch('https://hook.us2.make.com/5qbkt4iyi3e52o8auyjssk4bxar6f8ay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_description: description,
        query: description,
        slug: slug === 'null' ? null : slug,
        source: 'mobile'
      })
    }).catch(() => {}); // Fire and forget as requested
  };

  const parseMarketItem = (raw: string): MarketItem => {
    let cleaned = raw.trim();
    if (cleaned.startsWith('[TRENDING] ')) cleaned = cleaned.replace('[TRENDING] ', '');
    
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleaned);
        const score = parseFloat(parsed.event_score || parsed["Event Score"] || 0);
        return {
          question: parsed.question || parsed.q || 'Unknown Event',
          slug: parsed.slug || parsed.id || '',
          event_score: Math.round(score * 10),
          yes_prob: Math.round(((score + 1) / 2) * 100),
          polymarket_yes_prob: parsed.polymarket_yes_prob ? Math.round(parseFloat(parsed.polymarket_yes_prob) * 100) : (parsed.yes_prob ? Math.round(parseFloat(parsed.yes_prob) * 100) : null),
          polymarket_week_change: parsed.polymarket_week_change !== undefined ? parseFloat(parsed.polymarket_week_change) : (parsed.week_change !== undefined ? parseFloat(parsed.week_change) : null),
          gap: parsed.gap ? Math.round(parseFloat(parsed.gap) * 100) : null,
          misprice_flag: parsed.misprice_flag === "true" || parsed.misprice_flag === true,
          breakdown: parsed
        };
      } catch (e) { console.error(e); }
    }
    return { question: cleaned, slug: '', event_score: 0, yes_prob: 50, polymarket_yes_prob: null, polymarket_week_change: null, gap: null, misprice_flag: false };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('event_forecasting_examples')
        .select('question')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        setQuestions(data.map(row => parseMarketItem(row.question)));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      trackEvent(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleAnalyze = (item: MarketItem) => {
    trackEvent(item.question, item.slug);
  };

  const toggleExpand = (item: MarketItem) => {
    const id = item.question;
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-32">
      {/* Header & Search */}
      <div className="px-6 pt-12 pb-8 bg-gradient-to-b from-[#00d4aa]/10 to-transparent">
        <div className="mb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Prediction Markets</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Institutional Event Analysis</p>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00d4aa] transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-[#00d4aa] focus:ring-4 focus:ring-[#00d4aa]/10 transition-all text-sm font-bold shadow-2xl text-white placeholder:text-slate-600"
          />
        </form>
      </div>

      {/* Trending Section */}
      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2">
            <Sparkles size={12} className="text-[#00d4aa]" />
            Trending Signals
          </h2>
          <div className="h-[1px] flex-1 bg-white/5 ml-4" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((item) => {
              const isExpanded = expandedId === item.question;
              const change = item.polymarket_week_change;
              const isUp = change !== null && change > 0;
              
              return (
                <div 
                  key={item.question} 
                  className={`bg-[#0a0e1a] border ${item.misprice_flag ? 'border-[#00d4aa]/30 shadow-[0_0_20px_rgba(0,212,170,0.05)]' : 'border-white/10'} rounded-2xl overflow-hidden transition-all duration-500 shadow-xl`}
                >
                  <div className="p-6">
                    <div 
                      onClick={() => toggleExpand(item)}
                      className="flex flex-col gap-4 active:opacity-60 transition-opacity"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-lg leading-tight text-white flex-1">{item.question}</h3>
                        <ChevronDown size={20} className={`text-slate-600 transition-transform duration-500 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {item.polymarket_yes_prob !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[#00d4aa] font-black text-xl italic">{item.polymarket_yes_prob}% YES</span>
                              <Info size={12} className="text-slate-600" />
                            </div>
                          ) : (
                            <span className="text-slate-600 font-bold italic text-xs uppercase tracking-widest">Market Unavailable</span>
                          )}

                          {change !== null && change !== 0 && (
                            <div className="flex items-center gap-1.5 ml-2">
                              {isUp ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                              <span className={`font-black text-xl italic ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {Math.abs(change * 100).toFixed(1)}%
                              </span>
                              <Info size={12} className="text-slate-600" />
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAnalyze(item); }}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-[#00d4aa] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[#00d4aa]/20 active:scale-95"
                        >
                          ANALYZE →
                        </button>
                      </div>
                    </div>

                    {/* Expandable Breakdown */}
                    {isExpanded && (
                      <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-2 duration-500">
                        <div className="space-y-8">
                          <div className="flex items-center justify-around">
                            <div className="text-center">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">HeatScore</span>
                              <span className={`text-4xl font-black italic tracking-tighter ${getScoreColor(item.event_score)}`}>
                                {item.event_score > 0 ? '+' : ''}{item.event_score}
                              </span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="text-center">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 block">HiLEX Prob</span>
                              <span className="text-3xl font-black text-white italic">{item.yes_prob}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Sentiment</div>
                              <div className="text-xl font-black text-white italic">{(parseFloat(item.breakdown?.["News & Sentiment score"] || 0) * 10).toFixed(1)}</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Momentum</div>
                              <div className="text-xl font-black text-white italic">{(parseFloat(item.breakdown?.["Recent Momentum"] || 0) * 10).toFixed(1)}</div>
                            </div>
                          </div>

                          <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/10 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle size={14} className="text-[#00d4aa]" />
                              <span className="text-[10px] font-black text-[#00d4aa] uppercase tracking-[0.2em]">HiLEX Valuation Verdict</span>
                            </div>
                            <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                              Polymarket appears <span className={item.yes_prob > (item.polymarket_yes_prob || 0) ? 'text-[#00d4aa]' : 'text-red-500'}>
                                {item.yes_prob > (item.polymarket_yes_prob || 0) ? 'UNDERVALUED' : 'OVERVALUED'}
                              </span> relative to institutional intelligence. Divergence Gap: {Math.abs(item.gap || 0)}pp.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
