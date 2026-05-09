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
      const filtered = entityResult.data.filter(e => {
        const n = (e.name || '').trim().toUpperCase();
        return n && !n.startsWith('UFC_') && n !== 'GHOST' && n.length < 50;
      });

      const topEntities = filtered.sort((a, b) => b.score - a.score).slice(0, 10);
      
      topEntities.forEach(item => {
        let displayName = item.name?.toUpperCase().split(' ').pop() || item.name;
        if (item.name?.toUpperCase().includes('PARIS SAINT-GERMAIN')) displayName = 'PSG';
        if (item.name?.toUpperCase().includes('REAL MADRID')) displayName = 'REAL';
        if (item.name?.toUpperCase().includes('BAYERN')) displayName = 'BAYERN';

        movers.push({
          id: item.id,
          name: displayName,
          symbol: item.id,
          org: item.org,
          sport: item.sport,
          score: parseFloat(item.score || 0),
          type: 'sport',
          entity_type: item.type,
          headshot_url: item.headshot_url,
          logo_url: item.logo_url
        });
      });
    }

    return movers.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 30);
  } catch (err) {
    console.error('Error fetching movers:', err);
    return [];
  }
};

export const fetchAssetIntelligence = async (mover: Mover): Promise<any> => {
  try {
    if (mover.type === 'sport') {
      const sport = mover.sport?.toLowerCase();
      if (mover.entity_type === 'team') {
        const res = await fetch(`https://hilex-nhl-production.up.railway.app/${sport === 'soccer' ? 'ucl' : sport}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ home_team: mover.id.split('_').pop(), away_team: 'AUTO' })
        });
        if (res.ok) {
          const data = await res.json();
          const teamData = data.home_team || data.away_team;
          return { breakdown: teamData?.breakdown };
        }
      } else {
        const res = await fetch(`https://hilex-nhl-production.up.railway.app/athletes/heatscore/${encodeURIComponent(mover.id)}`);
        if (res.ok) {
          const data = await res.json();
          return { breakdown: data.breakdown };
        }
      }
      return { breakdown: null };
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
          // Force override with JSON 1 if missing or 0, matching main app logic
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
  } catch { return null; }
};

export const fetchAssetAccuracy = async (mover: Mover): Promise<number | null> => {
  try {
    if (mover.type === 'sport') return null;

    const { data } = await supabase.from('asset_accuracy_summary').select('accuracy_pct').eq('asset', mover.symbol).maybeSingle();
    return data ? Math.round(data.accuracy_pct) : null;
  } catch { return null; }
};
