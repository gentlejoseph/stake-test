## Mock Data Implementation and State Management

### Data Sources

All data in the app is currently provided by the `MockDataService` which serves static data:

- `getMockStocks()`: Provides a static list of stocks (AAPL, TSLA, TIK, etc.)
- `getTrendingStocks()`: Returns a static list of trending stocks, duplicated for infinite scroll
- `getMockPortfolio()`: Returns a static portfolio with predefined holdings

### State Management

The app uses RxJS BehaviorSubjects for state management:

#### Portfolio State (`PortfolioService`)

- Maintains portfolio state using `BehaviorSubject<Portfolio>`
- Initialized with static mock data
- Updates through `addStock()` method with static calculations
- No real-time updates - `refreshPortfolio()` just re-emits current state

```typescript
// Example of static portfolio update
refreshPortfolio(): void {
  // In a real app, this would fetch from an API
  // For now, just emit the current state
  const current = this.getCurrentPortfolio();
  if (current) {
    this.portfolioSubject.next({ ...current });
  }
}
```

#### Modal State (`ModalService`)

- Manages order modal visibility and selected stock
- Uses `BehaviorSubject` for reactive state updates
- Stock data remains static after orders

### Data Flow

1. Initial Load:
   - Mock portfolio data loaded on app start
   - Static stock list provided for search/discovery
   - Trending stocks duplicated for UI purposes

2. User Actions:
   - Stock searches filter existing mock data
   - Portfolio updates calculate new totals with static prices
   - No real-time price updates or WebSocket integration

3. Order Processing:
   - Orders update portfolio with static calculations
   - No actual trade execution or market integration
   - Success/error handling simulated

### Mock Data Structure

#### Stocks

```typescript
interface Stock {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  logo?: string;
}
```

#### Portfolio

```typescript
interface Portfolio {
  totalValue: number;
  totalEquity: number;
  totalCash: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: StockHolding[];
}
```

### Future Improvements

To implement real market data:

1. Replace `MockDataService` with real API integration
2. Add WebSocket connection for real-time price updates
3. Implement proper order execution system
4. Add real portfolio value calculation
5. Integrate actual market data providers

### Current Limitations

1. No real-time data updates
2. Static stock prices and changes
3. Simulated portfolio calculations
4. No actual trade execution
5. Limited stock universe (mock data only)
