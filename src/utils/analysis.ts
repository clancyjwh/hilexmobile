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
}

const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA'];
const americanStocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'];
const forexSymbols = ['EUR/USD', 'USD/CAD', 'USD/JPY', 'AUD/USD', 'GBP/USD'];
const commoditySymbols = ['XAU/USD', 'WTI/USD', 'NG/USD', 'XAG/USD', 'HG1'];
const canadianStocks = ['SHOP', 'CSU', 'LSPD', 'CLS', 'SPAI'];

export const fetchMovers = async (): Promise<Mover[]> => {
  try {
    const [stocksResult, caStocksResult, cryptoResult, forexResult, commoditiesResult, entityResult] = await Promise.all([
      supabase.from('stocks_top_picks').select('*').in('symbol', americanStocks),
      supabase.from('ca_stocks_top_picks').select('*').in('symbol', canadianStocks),
      supabase.from('crypto_top_picks').select('*').in('symbol', cryptoSymbols),
      supabase.from('forex_top_picks').select('*').in('symbol', forexSymbols),
      supabase.from('commodities_top_picks').select('*').in('symbol', commoditySymbols),
      supabase.from('entity_scores').select('*').gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).order('score', { ascending: false }).limit(20)
    ]);

    const movers: Mover[] = [];

    const processFinance = (data: any[] | null, type: 'stock' | 'crypto' | 'forex' | 'commodity') => {
      if (!data) return;
      data.forEach((item: any) => {
        movers.push({
          id: item.id,
          name: item.stock_name || item.crypto_name || item.pair_name || item.commodity_name || item.symbol,
          symbol: item.symbol,
          score: parseFloat(item.signal || 0),
          type: type,
          indicators: item.indicators,
          historical_performance: item.historical_performance,
        });
      });
    };

    processFinance(stocksResult.data, 'stock');
    processFinance(caStocksResult.data, 'stock');
    processFinance(cryptoResult.data, 'crypto');
    processFinance(forexResult.data, 'forex');
    processFinance(commoditiesResult.data, 'commodity');

    if (entityResult.data) {
      entityResult.data.forEach((item: any) => {
        movers.push({
          id: item.id,
          name: item.name,
          symbol: item.org || item.sport,
          score: parseFloat(item.score || 0),
          type: 'sport',
          indicators: null,
          historical_performance: null,
        });
      });
    }

    // Sort by HeatScore (descending) like desktop
    return movers.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.error('Error fetching movers:', err);
    return [];
  }
};

export const fetchAssetAccuracy = async (symbol: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('asset_daily_analysis')
      .select('accuracy_score')
      .eq('symbol', symbol)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return data?.accuracy_score || null;
  } catch {
    return null;
  }
};
