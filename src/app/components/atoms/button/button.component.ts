import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="getClasses()" [disabled]="disabled" [type]="type" (click)="onClick()">
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'text' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;

  getClasses(): string {
    const baseClasses = 'rounded-full font-bold transition-colors duration-200';
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    const variantClasses = {
      primary: 'bg-custom-black text-white hover:bg-gray-900 disabled:bg-gray-300',
      secondary:
        'bg-white text-custom-black border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100',
      text: 'bg-transparent text-custom-black hover:bg-gray-50 disabled:text-gray-400',
    };
    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${widthClass}`;
  }

  onClick(): void {
    // Button click logic if needed
  }
}
