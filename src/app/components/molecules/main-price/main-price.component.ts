import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Portfolio } from '../../../core/interfaces';

@Component({
  selector: 'app-main-price',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-price.component.html',
})
export class MainPriceComponent {
  @Input() portfolio!: Portfolio;

  getChangeClasses(change: number): string {
    if (change > 0) {
      return 'text-success-500';
    } else if (change < 0) {
      return 'text-danger-500';
    }
    return 'text-gray-500';
  }
}
