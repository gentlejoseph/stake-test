export interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
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
