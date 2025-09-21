import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import {
  HoldingsListComponent,
  MainPriceComponent,
  OrderModalComponent,
  StockCardComponent,
} from '../../components';
import { Portfolio, Stock } from '../../core/interfaces';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { LoadingService } from '../../core/services/loading.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { ModalService } from '../../core/services/modal.service';
import { PortfolioService } from '../../core/services/portfolio.service';

@Component({
  selector: 'app-invest',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    MainPriceComponent,
    HoldingsListComponent,
    OrderModalComponent,
    StockCardComponent,
  ],
  templateUrl: './invest.page.html',
})
export class InvestPage implements OnInit {
  private mockDataService = inject(MockDataService);
  private portfolioService = inject(PortfolioService);
  private loadingService = inject(LoadingService);
  private errorHandler = inject(ErrorHandlerService);
  private modalService = inject(ModalService);
  router = inject(Router);

  portfolio: Portfolio | null = null;
  trendingStocks: Stock[] = [];
  isLoading = false;

  // Modal state
  isOrderModalVisible = false;
  selectedStock: Stock | null = null;

  constructor() {}

  async ngOnInit() {
    await this.loadData();
    this.subscribeToPortfolio();
    this.subscribeToModal();
  }

  private async loadData() {
    try {
      this.isLoading = true;
      await this.loadingService.show('Loading portfolio...');

      this.trendingStocks = this.mockDataService.getTrendingStocks();
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    } finally {
      this.isLoading = false;
      await this.loadingService.hide();
    }
  }

  private subscribeToPortfolio() {
    this.portfolioService.portfolio$.subscribe({
      next: portfolio => {
        if (portfolio) {
          this.portfolio = portfolio;
        }
      },
      error: error => {
        this.errorHandler.handleError(error);
      },
    });
  }

  private subscribeToModal() {
    this.modalService.orderModalVisible$.subscribe(visible => {
      this.isOrderModalVisible = visible;
    });

    this.modalService.selectedStock$.subscribe(stock => {
      this.selectedStock = stock;
    });
  }

  navigateToStock(symbol: string) {
    // Find the stock and open modal instead of navigating
    const allStocks = this.mockDataService.getMockStocks();
    const stock = allStocks.find(s => s.symbol === symbol);
    if (stock) {
      this.modalService.openOrderModal(stock);
    }
  }

  onOrderModalClosed() {
    this.modalService.closeOrderModal();
  }

  async onOrderCompleted() {
    // First update the modal state
    this.isOrderModalVisible = false;
    this.selectedStock = null;

    // Then update the stock data
    this.modalService.updateStockAfterOrder();

    // Force a refresh of the portfolio data
    await this.loadData();
  }

  getChangeClasses(change: number): string {
    if (change > 0) {
      return 'text-success-500';
    } else if (change < 0) {
      return 'text-danger-500';
    }
    return 'text-gray-500';
  }
}
