import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-avatar.component.html',
})
export class StockAvatarComponent {
  @Input() symbol!: string;
  @Input() logo?: string | undefined;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get sizeClasses(): string {
    const sizeMap = {
      sm: 'w-8 h-8 bg-gray-100',
      md: 'w-10 h-10 bg-gray-100',
      lg: 'w-12 h-12 bg-gray-100',
      xl: 'w-16 h-16 bg-gray-100',
    };
    return sizeMap[this.size];
  }

  get textSizeClasses(): string {
    const textSizeMap = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl',
    };
    return textSizeMap[this.size];
  }

  get logoSizeClasses(): string {
    const logoSizeMap = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
      xl: 'w-12 h-12',
    };
    return logoSizeMap[this.size];
  }
}
