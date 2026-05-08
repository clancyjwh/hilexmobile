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

export const fetchMovers = async (): Promise<Mover[]> => {
  const financeAssets = [
    { table: 'stocks_top_picks', type: 'stock' as const },
    { table: 'ca_stocks_top_picks', type: 'stock' as const },
    { table: 'crypto_top_picks', type: 'crypto' as const },
    { table: 'forex_top_picks', type: 'forex' as const },
    { table: 'commodities_top_picks', type: 'commodity' as const },
  ];

  try {
    const results = await Promise.all([
      ...financeAssets.map(fa => supabase.from(fa.table).select('*').order('updated_at', { ascending: false }).limit(20)),
      supabase.from('entity_scores').select('*').order('score', { ascending: false }).limit(20)
    ]);

    const movers: Mover[] = [];

    // Process Finance
    financeAssets.forEach((fa, index) => {
      const data = results[index].data;
      if (data) {
        data.forEach((item: any) => {
          movers.push({
            id: item.id,
            name: item.stock_name || item.crypto_name || item.pair_name || item.commodity_name || item.symbol,
            symbol: item.symbol,
            score: parseFloat(item.signal || 0),
            type: fa.type,
            indicators: item.indicators,
            historical_performance: item.historical_performance,
          });
        });
      }
    });

    // Process Sports
    const sportsData = results[financeAssets.length].data;
    if (sportsData) {
      sportsData.forEach((item: any) => {
        movers.push({
          id: item.id,
          name: item.name,
          symbol: item.org || item.sport,
          score: parseFloat(item.score || 0),
          type: 'sport',
          indicators: null, // Sports might not have the same indicator grid
          historical_performance: null,
        });
      });
    }

    // Sort by absolute score to show top movers (highest impact)
    return movers.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
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
