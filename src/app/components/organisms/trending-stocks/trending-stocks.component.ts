import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Stock } from '../../../core/interfaces';
import { StockCardComponent } from '../../molecules/stock-card/stock-card.component';

@Component({
  selector: 'app-trending-stocks',
  standalone: true,
  imports: [CommonModule, IonicModule, StockCardComponent],
  templateUrl: './trending-stocks.component.html',
})
export class TrendingStocksComponent {
  @Input() stocks: Stock[] = [];
  @Input() title = 'Trending stocks';
  @Input() showSeeAll = true;
  @Input() showChangePill = true;
  @Input() showChangeText = true;
  @Input() showTypePill = false;
  @Output() stockClick = new EventEmitter<string>();
  @Output() seeAllClick = new EventEmitter<void>();

  onStockClick(symbol: string) {
    this.stockClick.emit(symbol);
  }

  onSeeAllClick() {
    this.seeAllClick.emit();
  }
}
