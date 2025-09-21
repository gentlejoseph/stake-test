export interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  logo?: string;
}

export interface StockHolding {
  stock: Stock;
  quantity: number;
  averagePrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface SearchResult {
  stocks: Stock[];
  totalResults: number;
  page: number;
  pageSize: number;
}

export interface TrendingStock {
  stock: Stock;
  rank: number;
  reason: 'volume' | 'gainers' | 'losers' | 'active';
}
