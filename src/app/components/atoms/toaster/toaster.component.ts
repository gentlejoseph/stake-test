import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div *ngIf="isVisible" [class]="toastClasses" [@slideIn] (click)="dismiss()">
      <span>{{ message }}</span>
    </div>
  `,
  animations: [
    // You can add custom animations here if needed
  ],
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent implements OnChanges, OnDestroy {
  @Input() message = '';
  @Input() type: ToastType = 'info';
  @Input() duration = 3000; // Auto dismiss after 3 seconds
  @Input() dismissible = true;
  @Input() isVisible = false;

  @Output() dismissed = new EventEmitter<void>();

  private timeoutId: number | undefined;

  get toastClasses(): string {
    return `toast-container cursor-pointer ${this.type}`;
  }

  get iconName(): string {
    const icons = {
      success: 'checkmark-circle',
      error: 'alert-circle',
      info: 'information-circle',
      warning: 'warning',
    };
    return icons[this.type];
  }

  ngOnChanges(): void {
    if (this.isVisible && this.duration > 0) {
      this.startAutoDismissTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearAutoDismissTimer();
  }

  dismiss(): void {
    this.isVisible = false;
    this.dismissed.emit();
    this.clearAutoDismissTimer();
  }

  private startAutoDismissTimer(): void {
    this.clearAutoDismissTimer();
    this.timeoutId = window.setTimeout(() => {
      this.dismiss();
    }, this.duration);
  }

  private clearAutoDismissTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
