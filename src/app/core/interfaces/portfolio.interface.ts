import { StockHolding } from './stock.interface';

export interface Portfolio {
  totalEquity: number;
  totalCash: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: StockHolding[];
}

export interface Order {
  id: string;
  symbol: string;
  companyName: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number; // undefined for market orders
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  executedAt?: Date;
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface OrderRequest {
  symbol: string;
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
}
