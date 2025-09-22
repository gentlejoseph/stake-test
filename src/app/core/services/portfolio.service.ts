import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Portfolio, Stock, StockHolding } from '../interfaces';
import { ErrorHandlerService } from './error-handler.service';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private mockDataService = inject(MockDataService);
  private errorHandler = inject(ErrorHandlerService);

  private portfolioSubject = new BehaviorSubject<Portfolio | null>(null);
  public portfolio$ = this.portfolioSubject.asObservable();

  constructor() {
    // Initialize with mock portfolio
    try {
      const portfolio = this.mockDataService.getMockPortfolio();
      this.portfolioSubject.next(portfolio);
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    }
  }

  getCurrentPortfolio(): Portfolio | null {
    return this.portfolioSubject.value;
  }

  addStock(stock: Stock, quantity: number): void {
    try {
      // Validate inputs
      if (!stock || !stock.symbol) {
        throw new Error('Invalid stock data');
      }

      const currentPortfolio = this.getCurrentPortfolio();
      if (!currentPortfolio) {
        throw new Error('Portfolio not initialized');
      }

      // Calculate and validate the purchase value
      const purchaseValue = stock.price * quantity;
      if (purchaseValue < 0.01 || purchaseValue > 1000000) {
        throw new Error('Purchase amount must be between $0.01 and $1,000,000');
      }

      // Check if stock already exists in holdings
      const existingHolding = currentPortfolio.holdings.find(h => h.stock.symbol === stock.symbol);

      if (existingHolding) {
        // Update existing holding
        const oldValue = existingHolding.quantity * existingHolding.averagePrice;
        const newValue = oldValue + purchaseValue;
        const newTotalShares = existingHolding.quantity + quantity;
        const newAveragePrice = newValue / newTotalShares;

        existingHolding.quantity = newTotalShares;
        existingHolding.averagePrice = newAveragePrice;
        existingHolding.totalValue = stock.price * newTotalShares;
        existingHolding.gainLoss = (stock.price - newAveragePrice) * newTotalShares;
        existingHolding.gainLossPercent = ((stock.price - newAveragePrice) / newAveragePrice) * 100;
      } else {
        // Create new holding
        const newHolding: StockHolding = {
          stock: stock,
          quantity: quantity,
          averagePrice: stock.price,
          totalValue: purchaseValue,
          gainLoss: purchaseValue * 0.0001, // Small positive gain (0.01%)
          gainLossPercent: 0.01, // Start with 0.01% gain
        };

        currentPortfolio.holdings.push(newHolding);
      }

      // Add the new purchase value to total equity
      currentPortfolio.totalEquity += purchaseValue;

      // Recalculate total day change based on all holdings
      currentPortfolio.dayChange = currentPortfolio.holdings.reduce((sum, holding) => {
        const dayChangeForHolding = holding.stock.change * holding.quantity;
        return sum + dayChangeForHolding;
      }, 0);

      // Update day change percentage
      const portfolioWithoutChange = currentPortfolio.totalEquity - currentPortfolio.dayChange;
      currentPortfolio.dayChangePercent =
        portfolioWithoutChange !== 0
          ? (currentPortfolio.dayChange / portfolioWithoutChange) * 100
          : 0;

      // Emit updated portfolio
      this.portfolioSubject.next({ ...currentPortfolio });
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    }
  }
}
