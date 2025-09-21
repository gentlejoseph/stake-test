import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { OrderModalComponent, StockCardComponent } from '../../components';
import { StockAvatarComponent } from '../../components/molecules/stock-avatar/stock-avatar.component';
import { Stock } from '../../core/interfaces';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    OrderModalComponent,
    StockAvatarComponent,
    StockCardComponent,
  ],
  templateUrl: './discover.page.html',
})
export class DiscoverPage implements OnInit {
  private mockDataService = inject(MockDataService);
  private localStorageService = inject(LocalStorageService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  searchQuery = '';
  isSearching = false;
  isSearchFocused = false;
  searchResults: Stock[] = [];
  recentSearches: Stock[] = [];
  topVolumeStocks: Stock[] = [];
  selectedSearchIndex = -1; // Track currently selected search result

  // Modal state
  isOrderModalVisible = false;
  selectedStock: Stock | null = null;

  constructor() {}

  ngOnInit() {
    this.loadData();
    this.subscribeToModal();
  }

  private loadData() {
    // Clear existing recent searches and populate with mock data
    this.localStorageService.clearRecentSearches();

    // Add some mock recent searches to populate the list
    const allStocks = this.mockDataService.getMockStocks();
    this.recentSearches = [
      allStocks[0], // AAPL
      allStocks[1], // TSLA
      allStocks[2], // TIK
      allStocks[3], // FIG
      allStocks[4], // GOOG
    ].filter(stock => stock !== undefined) as Stock[];

    // Store these mock searches in localStorage for persistence
    this.recentSearches.forEach(stock => {
      this.localStorageService.addRecentSearch(stock);
    });

    this.topVolumeStocks = this.mockDataService.getTrendingStocks().slice(0, 3);
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.isSearching = query.length > 0;

    if (this.isSearching) {
      this.performSearch(query);
    } else {
      this.searchResults = [];
    }
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onSearchChange(target.value);
    // Reset selection when input changes
    this.selectedSearchIndex = -1;
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    this.isSearching = true;
  }

  onSearchBlur() {
    // Don't hide results immediately to allow for click events
    setTimeout(() => {
      if (!this.searchQuery) {
        this.isSearchFocused = false;
        this.isSearching = false;
      }
    }, 200);
  }

  onSearchKeyDown(event: KeyboardEvent) {
    if (!this.searchResults.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSearchIndex = Math.min(
          this.selectedSearchIndex + 1,
          this.searchResults.length - 1
        );
        this.scrollToSelectedResult();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedSearchIndex = Math.max(this.selectedSearchIndex - 1, -1);
        this.scrollToSelectedResult();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedSearchIndex >= 0) {
          const selectedStock = this.searchResults[this.selectedSearchIndex];
          if (selectedStock) {
            this.navigateToStock(selectedStock.symbol);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.onCancelSearch();
        break;
    }
  }

  private scrollToSelectedResult() {
    if (this.selectedSearchIndex >= 0) {
      const selectedElement = document.querySelector(
        `[data-search-index="${this.selectedSearchIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }

  onSearchClear() {
    this.searchQuery = '';
    this.isSearching = false;
    this.isSearchFocused = false;
    this.searchResults = [];
  }

  onCancelSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.isSearchFocused = false;
    this.searchResults = [];
  }

  private performSearch(query: string) {
    // Mock search implementation
    const allStocks = this.mockDataService.getMockStocks();
    this.searchResults = allStocks.filter(
      stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(query.toLowerCase())
    );
  }

  navigateToStock(symbol: string) {
    // This method is used for search results - add to recent searches
    const allStocks = this.mockDataService.getMockStocks();
    const stock = allStocks.find(s => s.symbol === symbol);
    if (stock) {
      this.localStorageService.addRecentSearch(stock);
      this.recentSearches = this.localStorageService.getRecentSearches();

      // Open modal instead of navigating
      this.modalService.openOrderModal(stock);
    }
  }

  navigateToRecentStock(symbol: string) {
    // This method is used for recent searches - don't add to recent searches again
    const allStocks = this.mockDataService.getMockStocks();
    const stock = allStocks.find(s => s.symbol === symbol);
    if (stock) {
      // Just open modal, don't add to recent searches
      this.modalService.openOrderModal(stock);
    }
  }

  private subscribeToModal() {
    this.modalService.orderModalVisible$.subscribe(visible => {
      this.isOrderModalVisible = visible;
    });

    this.modalService.selectedStock$.subscribe(stock => {
      this.selectedStock = stock;
    });
  }

  onOrderModalClosed() {
    this.modalService.closeOrderModal();
  }

  onOrderCompleted() {
    // Update the stock data to show zero change after successful order
    this.modalService.updateStockAfterOrder();

    // Update the relevant stock lists that contain this stock
    // Use selectedStock from the component since it's synchronized with the modal service
    if (this.selectedStock) {
      // Update in top volume stocks if present
      this.topVolumeStocks = this.topVolumeStocks.map(stock =>
        stock.symbol === this.selectedStock!.symbol ? this.selectedStock! : stock
      );

      // Update in recent searches if present
      this.recentSearches = this.recentSearches.map(stock =>
        stock.symbol === this.selectedStock!.symbol ? this.selectedStock! : stock
      );

      // Update in search results if present
      this.searchResults = this.searchResults.map(stock =>
        stock.symbol === this.selectedStock!.symbol ? this.selectedStock! : stock
      );
    }
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
