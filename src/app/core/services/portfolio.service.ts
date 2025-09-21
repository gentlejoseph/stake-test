import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';
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

      if (quantity < APP_CONSTANTS.MIN_QUANTITY || quantity > APP_CONSTANTS.MAX_QUANTITY) {
        throw new Error(
          `Quantity must be between ${APP_CONSTANTS.MIN_QUANTITY} and ${APP_CONSTANTS.MAX_QUANTITY}`
        );
      }

      const currentPortfolio = this.getCurrentPortfolio();
      if (!currentPortfolio) {
        throw new Error('Portfolio not initialized');
      }

      // Check if stock already exists in holdings
      const existingHolding = currentPortfolio.holdings.find(h => h.stock.symbol === stock.symbol);

      if (existingHolding) {
        // Update existing holding
        const newTotalShares = existingHolding.quantity + quantity;
        const newTotalValue =
          existingHolding.quantity * existingHolding.averagePrice + quantity * stock.price;
        const newAveragePrice = newTotalValue / newTotalShares;

        existingHolding.quantity = newTotalShares;
        existingHolding.averagePrice = newAveragePrice;
        existingHolding.totalValue = stock.price * newTotalShares;
        existingHolding.gainLoss = (stock.price - newAveragePrice) * newTotalShares;
        existingHolding.gainLossPercent = (stock.price - newAveragePrice) / newAveragePrice;
      } else {
        // Create new holding
        const newHolding: StockHolding = {
          stock: stock,
          quantity: quantity,
          averagePrice: stock.price,
          totalValue: stock.price * quantity,
          gainLoss: stock.change * quantity, // Use the stock's change value
          gainLossPercent: stock.changePercent, // Use the stock's change percentage
        };

        currentPortfolio.holdings.push(newHolding);
      }

      // Update portfolio totals
      currentPortfolio.totalEquity = currentPortfolio.holdings.reduce(
        (sum, holding) => sum + holding.totalValue,
        0
      );
      currentPortfolio.totalValue = currentPortfolio.totalEquity + currentPortfolio.totalCash;
      currentPortfolio.dayChange = currentPortfolio.holdings.reduce(
        (sum, holding) => sum + holding.gainLoss,
        0
      );
      currentPortfolio.dayChangePercent =
        currentPortfolio.dayChange / (currentPortfolio.totalEquity - currentPortfolio.dayChange);

      // Emit updated portfolio
      this.portfolioSubject.next({ ...currentPortfolio });

      // Show success message
      this.errorHandler.showSuccessToast(
        `Successfully added ${quantity} shares of ${stock.symbol}`
      );
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    }
  }

  refreshPortfolio(): void {
    // In a real app, this would fetch from an API
    // For now, just emit the current state
    const current = this.getCurrentPortfolio();
    if (current) {
      this.portfolioSubject.next({ ...current });
    }
  }
}
