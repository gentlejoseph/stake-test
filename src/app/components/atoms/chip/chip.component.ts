import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type ChipVariant = 'positive' | 'negative' | 'neutral' | 'info';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './chip.component.html',
})
export class ChipComponent {
  @Input() variant: ChipVariant = 'neutral';
  @Input() value?: number;

  getVariantClasses(): string {
    if (this.value !== undefined) {
      if (this.value > 0) {
        return 'bg-figma-green border-figma-green';
      } else if (this.value < 0) {
        return 'bg-red-500 border-red-500';
      } else {
        return 'bg-gray-100 border-gray-300 text-gray-700';
      }
    }

    switch (this.variant) {
      case 'positive':
        return 'bg-figma-green border-figma-green';
      case 'negative':
        return 'bg-red-500 border-red-500';
      case 'info':
        return 'bg-blue-100 border-blue-200 text-blue-700';
      case 'neutral':
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  }
}
