import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stock } from '../../../core/interfaces';
import { StockAvatarComponent } from '../stock-avatar/stock-avatar.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, StockAvatarComponent],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() stock!: Stock;
  @Input() showDataSection: boolean = true;
  @Input() clickable: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showFooter: boolean = false; // New prop to control footer display
  @Output() cardClick = new EventEmitter<string>();

  onCardClick() {
    if (this.clickable) {
      this.cardClick.emit(this.stock.symbol);
    }
  }

  getCardClasses(): string {
    const baseClasses =
      'bg-white box-border content-stretch flex flex-col items-start relative rounded cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0';

    switch (this.size) {
      case 'small':
        return `${baseClasses} w-48 px-3 py-3`; // 192px - compact for trending stocks
      case 'large':
        return `${baseClasses} w-96 px-3.5 py-4`; // 384px - more spacious
      default: // medium
        return `${baseClasses} w-80 px-3.5 py-4`; // 320px - standard spacing
    }
  }

  getContentClasses(): string {
    const baseClasses = 'flex flex-col items-start relative shrink-0 w-full';

    switch (this.size) {
      case 'small':
        return `${baseClasses} gap-2`; // Compact spacing for small cards
      case 'large':
        return `${baseClasses} gap-4`; // More spacious for large cards
      default: // medium
        return `${baseClasses} gap-4`; // Standard spacing for medium cards
    }
  }
}
