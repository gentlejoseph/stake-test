import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockHolding } from '../../../core/interfaces';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { StockAvatarComponent } from '../../molecules/stock-avatar/stock-avatar.component';

@Component({
  selector: 'app-holdings-list',
  standalone: true,
  imports: [CommonModule, ChipComponent, StockAvatarComponent],
  templateUrl: './holdings-list.component.html',
})
export class HoldingsListComponent {
  @Input() holdings: StockHolding[] = [];
  @Output() holdingClick = new EventEmitter<string>();

  onHoldingClick(symbol: string) {
    this.holdingClick.emit(symbol);
  }
}
