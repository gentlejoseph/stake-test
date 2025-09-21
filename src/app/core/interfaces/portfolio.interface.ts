import { StockHolding } from './stock.interface';

export interface Portfolio {
  /** Total market value of all stock holdings in the portfolio */
  totalEquity: number;
  /** Absolute change in portfolio value for the current day in dollars */
  dayChange: number;
  /** Percentage change in portfolio value for the current day (as decimal, e.g., 0.05 for 5%) */
  dayChangePercent: number;
  /** List of individual stock holdings in the portfolio */
  holdings: StockHolding[];
}

/**
 * Represents an order request from the order modal.
 * Currently only used for buy orders in the mock implementation.
 */
export interface OrderRequest {
  /** Stock symbol to trade */
  symbol: string;

  /** Quantity of shares to trade */
  quantity: number;

  /** Price per share for the order (currently always uses market price) */
  price?: number;
}
