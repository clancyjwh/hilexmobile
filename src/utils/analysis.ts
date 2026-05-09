import { supabase } from '../lib/supabase';

export interface Mover {
  id: string;
  name: string;
  symbol: string;
  score: number;
  type: 'stock' | 'crypto' | 'forex' | 'sport' | 'commodity';
  asset_type?: string;
  indicators?: any;
  accuracy?: number;
  org?: string;
  sport?: string;
  entity_type?: 'athlete' | 'team';
  headshot_url?: string;
  logo_url?: string;
  prefetchedBreakdown?: any;
}

const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA'];
const americanStocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'];
const forexSymbols = ['EUR/USD', 'USD/CAD', 'USD/JPY', 'AUD/USD', 'GBP/USD'];
const commoditySymbols = ['XAU/USD', 'WTI/USD', 'NG/USD', 'XAG/USD', 'HG1'];
const canadianStocks = ['SHOP', 'CSU', 'LSPD', 'CLS', 'SPAI'];

const calculateAverageSignal = (asset: any): number => {
  if (asset.signal !== undefined && asset.signal !== null) {
    return typeof asset.signal === 'string' ? parseFloat(asset.signal) : asset.signal;
  }
  const signals: number[] = [];
  if (asset.roc_signal !== undefined && asset.roc_signal !== null) signals.push(parseFloat(asset.roc_signal));
  if (asset.indicators) {
    Object.values(asset.indicators).forEach((indicator: any) => {
      if (indicator.signal !== undefined) signals.push(parseFloat(indicator.signal));
    });
  }
  return signals.length === 0 ? 0 : signals.reduce((acc, val) => acc + val, 0) / signals.length;
};

export const fetchMovers = async (): Promise<Mover[]> => {
  try {
    const [stocks, caStocks, crypto, forex, commodities, entityResult] = await Promise.all([
      supabase.from('stocks_top_picks').select('*').in('symbol', americanStocks),
      supabase.from('ca_stocks_top_picks').select('*').in('symbol', canadianStocks),
      supabase.from('crypto_top_picks').select('*').in('symbol', cryptoSymbols),
      supabase.from('forex_top_picks').select('*').in('symbol', forexSymbols),
      supabase.from('commodities_top_picks').select('*').in('symbol', commoditySymbols),
      supabase.from('entity_scores').select('*').order('score', { ascending: false })
    ]);

    const movers: Mover[] = [];

    const process = (data: any[] | null, type: any) => {
      data?.forEach(item => {
        movers.push({
          id: item.id,
          name: item.symbol, 
          symbol: item.symbol,
          score: calculateAverageSignal(item),
          type
        });
      });
    };

    process(stocks.data, 'stock');
    process(caStocks.data, 'stock');
    process(crypto.data, 'crypto');
    process(forex.data, 'forex');
    process(commodities.data, 'commodity');

    if (entityResult.data) {
      const getTop3Bottom2 = (list: any[]) => {
        if (list.length <= 5) return [...list].sort((a, b) => b.score - a.score);
        const sorted = [...list].sort((a, b) => b.score - a.score);
        return [...sorted.slice(0, 3), ...sorted.slice(-2)];
      };

      const rawEntities = entityResult.data.filter(e => {
        const n = (e.name || '').trim().toUpperCase();
        const id = (e.id || '').trim().toUpperCase();
        const matchesLongId = n === id && id.length > 10;
        return n && !n.startsWith('UFC_') && n !== 'GHOST' && n.length < 50 && !matchesLongId;
      });

      const athletes = getTop3Bottom2(rawEntities.filter(e => e.type === 'athlete'));
      const teams = getTop3Bottom2(rawEntities.filter(e => e.type === 'team'));
      const topEntities = [...athletes, ...teams];
      
      topEntities.forEach(item => {
        let displayName = item.name || '';
        const nameU = displayName.toUpperCase();
        if (nameU.includes('PARIS SAINT-GERMAIN')) displayName = 'PSG';
        else if (nameU.includes('REAL MADRID')) displayName = 'REAL';
        else if (nameU.includes('BAYERN')) displayName = 'BAYERN';

        movers.push({
          id: item.id,
          name: displayName.toUpperCase(),
          symbol: item.id,
          org: item.org,
          sport: item.sport,
          score: parseFloat(item.score || 0),
          type: 'sport',
          entity_type: item.type,
          headshot_url: item.headshot_url,
          logo_url: item.logo_url,
          // CRITICAL FIX: PRE-LOAD THE BREAKDOWN FROM THE DATABASE
          prefetchedBreakdown: item.breakdown || null
        });
      });
    }

    const sortedMovers = movers.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 30);

    // ONLY fetch if missing prefetched data
    await Promise.all(sortedMovers.filter(m => m.type === 'sport' && !m.prefetchedBreakdown).map(async m => {
      try {
        const intel = await fetchAssetIntelligence(m);
        if (intel) m.prefetchedBreakdown = intel.breakdown;
      } catch {}
    }));

    return sortedMovers;
  } catch (err) {
    console.error('Error fetching movers:', err);
    return [];
  }
};

export const fetchAssetIntelligence = async (mover: Mover): Promise<any> => {
  try {
    if (mover.prefetchedBreakdown) return { breakdown: mover.prefetchedBreakdown };

    if (mover.type === 'sport') {
      const sport = mover.sport?.toLowerCase();
      const cleanId = mover.id.split('_').pop() || mover.id;
      const dateStr = new Date().toISOString().split('T')[0];

      if (mover.entity_type === 'team') {
        const endpoint = (sport === 'soccer' || sport === 'football' || sport === 'ucl') ? 'ucl' : sport;
        const url = `https://hilex-nhl-production.up.railway.app/${endpoint}/analyze`;
        
        const body = (endpoint === 'ucl') 
          ? { home_team_id: cleanId, away_team_id: 'AUTO', date: dateStr }
          : { home_team: cleanId, away_team: 'AUTO', date: dateStr };
        
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (res.ok) {
          const data = await res.json();
          const teamData = data.home_team || data.away_team;
          return { breakdown: teamData?.breakdown || {} };
        }
      } else {
        const res = await fetch(`https://hilex-nhl-production.up.railway.app/athletes/heatscore/${encodeURIComponent(mover.id)}`);
        if (res.ok) {
          const data = await res.json();
          const breakdown: any = data.breakdown || data || {};
          
          if (sport === 'nhl') {
            if (data.playoffs) {
               breakdown.gwg = data.playoffs.gwg || 0;
               breakdown.playoff_ppg = data.playoffs.ppg || 0;
               breakdown.last3_pts = data.playoffs.last3_points || 0;
            }
            if (data.regular_season) {
               breakdown.regular_ppg = data.regular_season.ppg || 0;
            }
          }
          return { breakdown };
        }
      }
      return { breakdown: {} };
    } else {
      const category = mover.type === 'stock' ? (canadianStocks.includes(mover.symbol) ? 'ca_stocks_top_picks' : 'stocks_top_picks') : 
                       mover.type === 'crypto' ? 'crypto_top_picks' : 
                       mover.type === 'forex' ? 'forex_top_picks' : 'commodities_top_picks';

      const { data } = await supabase.from(category).select('*').ilike('symbol', mover.symbol).order('date', { ascending: false }).limit(1).maybeSingle();
      if (!data) return null;

      let indicators = data.indicators || {};
      let json9 = data.optimized_parameters;

      if (data.raw_data) {
        const raw = typeof data.raw_data === 'string' ? JSON.parse(data.raw_data) : data.raw_data;
        const j1 = typeof raw['JSON 1'] === 'string' ? JSON.parse(raw['JSON 1']) : raw['JSON 1'];
        
        if (j1) {
          const map = {
            SMA: 'SMA Signal',
            RSI: 'RSI Signal',
            Bollinger: 'Boll Signal',
            CCI: 'CCI Signal',
            MACD: 'MACD Signal',
            ROC: 'ROC Signal'
          };
          
          Object.entries(map).forEach(([key, j1Key]) => {
            if (!indicators[key] || parseFloat(indicators[key].signal || '0') === 0) {
              if (j1[j1Key] !== undefined) {
                indicators[key] = { signal: parseFloat(j1[j1Key]) };
              }
            }
          });
        }
        
        if (!json9 && raw['JSON 9']) json9 = typeof raw['JSON 9'] === 'string' ? JSON.parse(raw['JSON 9']) : raw['JSON 9'];
      }
      return { breakdown: indicators, json9 };
    }
  } catch { return { breakdown: {} }; }
};

export const fetchAssetAccuracy = async (mover: Mover): Promise<number | null> => {
  try {
    if (mover.type === 'sport') return null;

    const { data } = await supabase.from('asset_accuracy_summary').select('accuracy_pct').eq('asset', mover.symbol).maybeSingle();
    return data ? Math.round(data.accuracy_pct) : null;
  } catch { return null; }
};
