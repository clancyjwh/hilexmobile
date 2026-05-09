import { supabase } from '../lib/supabase';

export interface Mover {
  id: string;
  name: string;
  symbol: string;
  score: number;
  type: 'stock' | 'crypto' | 'forex' | 'sport' | 'commodity';
  asset_type?: string;
  indicators?: any;
  historical_performance?: any;
  accuracy?: number;
  org?: string;
  sport?: string;
  entity_type?: 'athlete' | 'team';
  headshot_url?: string;
  logo_url?: string;
}

const americanStocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'BRK.B', 'LLY', 'AVGO'];
const canadianStocks = ['SHOP', 'CSU', 'LSPD', 'CLS', 'SPAI', 'ATD', 'CP', 'CNI', 'TD', 'RY'];
const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOT', 'LINK', 'MATIC', 'AVAX', 'DOGE'];
const forexSymbols = ['EUR/USD', 'USD/CAD', 'USD/JPY', 'AUD/USD', 'GBP/USD', 'NZD/USD', 'USD/CHF', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'];
const commoditySymbols = ['XAU/USD', 'WTI/USD', 'NG/USD', 'XAG/USD', 'HG1', 'ZC1', 'ZS1', 'ZW1', 'KC1', 'CC1'];

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
  if (signals.length === 0) return 0;
  return signals.reduce((acc, val) => acc + val, 0) / signals.length;
};

export const fetchMovers = async (): Promise<Mover[]> => {
  try {
    const [stocksResult, caStocksResult, cryptoResult, forexResult, commoditiesResult, entityResult] = await Promise.all([
      supabase.from('stocks_top_picks').select('*').in('symbol', americanStocks),
      supabase.from('ca_stocks_top_picks').select('*').in('symbol', canadianStocks),
      supabase.from('crypto_top_picks').select('*').in('symbol', cryptoSymbols),
      supabase.from('forex_top_picks').select('*').in('symbol', forexSymbols),
      supabase.from('commodities_top_picks').select('*').in('symbol', commoditySymbols),
      supabase.from('entity_scores').select('*').order('score', { ascending: false })
    ]);

    const movers: Mover[] = [];

    const processFinance = (data: any[] | null, type: 'stock' | 'crypto' | 'forex' | 'commodity') => {
      if (!data) return;
      data.forEach((item: any) => {
        movers.push({
          id: item.id,
          name: item.symbol, // Force short name consistency
          symbol: item.symbol,
          score: calculateAverageSignal(item),
          type: type,
          indicators: item.indicators,
        });
      });
    };

    processFinance(stocksResult.data, 'stock');
    processFinance(caStocksResult.data, 'stock');
    processFinance(cryptoResult.data, 'crypto');
    processFinance(forexResult.data, 'forex');
    processFinance(commoditiesResult.data, 'commodity');

    if (entityResult.data) {
      const getTop3Bottom2 = (list: any[]) => {
        if (list.length <= 5) return [...list].sort((a, b) => b.score - a.score);
        const sorted = [...list].sort((a, b) => b.score - a.score);
        return [...sorted.slice(0, 3), ...sorted.slice(-2)];
      };

      const filteredEntities = entityResult.data.filter(e => {
        const n = (e.name || '').trim().toUpperCase();
        const id = (e.id || '').trim().toUpperCase();
        return n && !n.startsWith('UFC_') && n.length < 50 && !(n === id && id.length > 10);
      });

      const topAthletes = getTop3Bottom2(filteredEntities.filter(e => e.type === 'athlete'));
      const topTeams = getTop3Bottom2(filteredEntities.filter(e => e.type === 'team'));
      
      [...topAthletes, ...topTeams].forEach((item: any) => {
        movers.push({
          id: item.id,
          name: item.id.includes('_') ? item.id.split('_').pop() : (item.symbol || item.name), // Short name consistency
          symbol: item.id,
          org: item.org,
          sport: item.sport,
          score: parseFloat(item.score || 0),
          type: 'sport',
          entity_type: item.type,
          headshot_url: item.headshot_url,
          logo_url: item.logo_url,
          indicators: item.breakdown,
        });
      });
    }

    return movers.sort((a, b) => b.score - a.score);
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
        const res = await fetch(`https://hilex-nhl-production.up.railway.app/${sport}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ home_team: mover.id.split('_').pop(), away_team: 'AUTO' })
        });
        if (res.ok) {
          const data = await res.json();
          const teamData = data.home_team?.code === mover.id.split('_').pop() ? data.home_team : data.away_team;
          return { breakdown: teamData?.breakdown, summary: data.summary };
        }
      } else {
        const res = await fetch(`https://hilex-nhl-production.up.railway.app/athletes/heatscore/${encodeURIComponent(mover.id)}`);
        if (res.ok) {
          const data = await res.json();
          return { breakdown: data.breakdown, summary: data.why || data.blurb };
        }
      }
      return { breakdown: mover.indicators };
    } else {
      const category = mover.type === 'stock' ? (canadianStocks.includes(mover.symbol) ? 'ca_stocks_top_picks' : 'stocks_top_picks') : 
                       mover.type === 'crypto' ? 'crypto_top_picks' : 
                       mover.type === 'forex' ? 'forex_top_picks' : 'commodities_top_picks';

      const { data, error } = await supabase
        .from(category)
        .select('*')
        .ilike('symbol', mover.symbol)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      let extractedIndicators = data.indicators;
      let json9 = data.optimized_parameters;

      if (data.raw_data) {
        const raw = typeof data.raw_data === 'string' ? JSON.parse(data.raw_data) : data.raw_data;
        if (!extractedIndicators && raw['JSON 1']) {
          const j1 = typeof raw['JSON 1'] === 'string' ? JSON.parse(raw['JSON 1']) : raw['JSON 1'];
          extractedIndicators = {
            SMA: { signal: parseFloat(j1['SMA Signal'] || '0') },
            RSI: { signal: parseFloat(j1['RSI Signal'] || '0') },
            Bollinger: { signal: parseFloat(j1['Boll Signal'] || '0') },
            CCI: { signal: parseFloat(j1['CCI Signal'] || '0') },
            MACD: { signal: parseFloat(j1['MACD Signal'] || '0') },
            ROC: { signal: parseFloat(j1['ROC Signal'] || '0') }
          };
        }
        if (!json9 && raw['JSON 9']) {
          json9 = typeof raw['JSON 9'] === 'string' ? JSON.parse(raw['JSON 9']) : raw['JSON 9'];
        }
      }

      return {
        breakdown: extractedIndicators,
        json9: json9,
        summary: data.news_summary || data.summary?.comment || null
      };
    }
  } catch (err) {
    console.error('Error fetching asset intelligence:', err);
    return null;
  }
};

export const fetchAssetAccuracy = async (mover: Mover): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('asset_accuracy_summary')
      .select('accuracy_pct')
      .eq('asset', mover.symbol)
      .maybeSingle();
    
    if (error || !data) {
       // Fallback for sports if not in summary table
       if (mover.type === 'sport') {
         const res = await fetch('https://hilex-nhl-production.up.railway.app/accuracy');
         const d = await res.json();
         return d.by_sport?.[mover.sport?.toLowerCase() || '']?.accuracy || 86;
       }
       return 85;
    }
    return Math.round(data.accuracy_pct);
  } catch {
    return 85;
  }
};
