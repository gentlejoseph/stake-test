import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Stock } from '../../../core/interfaces';
import { StockAvatarComponent } from '../stock-avatar/stock-avatar.component';

@Component({
  selector: 'app-stock-card',
  standalone: true,
  imports: [CommonModule, IonicModule, StockAvatarComponent],
  templateUrl: './stock-card.component.html',
})
export class StockCardComponent {
  @Input() stock!: Stock;
  @Input() videoButton = false;
  @Input() ipoPlacement = false;
  @Input() showLogo = true;
  @Input() endDate = false;
  @Input() showStatus = false;
  @Input() size: 'Small' | 'Medium' | 'Large' = 'Small';
  @Input() showChangePill = true;
  @Input() showChangeText = true;
  @Input() showTypePill = true;
  @Output() cardClick = new EventEmitter<string>();

  onCardClick() {
    this.cardClick.emit(this.stock.symbol);
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
