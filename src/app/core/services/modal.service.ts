import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Stock } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private orderModalVisible = new BehaviorSubject<boolean>(false);
  private selectedStock = new BehaviorSubject<Stock | null>(null);

  // Observables
  orderModalVisible$ = this.orderModalVisible.asObservable();
  selectedStock$ = this.selectedStock.asObservable();

  // Methods
  openOrderModal(stock: Stock) {
    this.selectedStock.next(stock);
    this.orderModalVisible.next(true);
  }

  closeOrderModal() {
    this.orderModalVisible.next(false);
    // Don't clear the stock data here as it might be needed for updates
  }

  updateStockAfterOrder() {
    // First close the modal
    this.orderModalVisible.next(false);

    // Then update the stock data
    const currentStock = this.selectedStock.value;
    if (currentStock) {
      const updatedStock: Stock = {
        ...currentStock,
        change: 0,
        changePercent: 0,
      };
      this.selectedStock.next(updatedStock);
    }

    // Clear the selected stock
    this.selectedStock.next(null);
  }

  // Force close modal (useful for external events)
  forceCloseOrderModal() {
    this.closeOrderModal();
  }
}
