import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { Stock } from '../../../core/interfaces';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoadingService } from '../../../core/services/loading.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InputComponent } from '../../atoms/input';
import { ToasterComponent } from '../../atoms/toaster/toaster.component';
import { SwipeButtonComponent } from '../swipe-button/swipe-button.component';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    InputComponent,
    SwipeButtonComponent,
    ToasterComponent,
  ],
  templateUrl: './order-modal.component.html',
  styles: [
    `
      .slide-complete {
        @apply bg-success-500;
      }

      .swipe-button {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }

      .swipe-button:active {
        transform: scale(0.98);
      }

      .swipe-ball {
        transition:
          left 0.1s ease-out,
          transform 0.1s ease-out;
        will-change: left, transform;
      }

      .swipe-ball:active {
        transform: scale(1.05);
      }

      .swipe-ball:hover {
        transform: scale(1.02);
      }
    `,
  ],
})
export class OrderModalComponent implements OnInit, OnDestroy {
  private portfolioService = inject(PortfolioService);
  private errorHandler = inject(ErrorHandlerService);
  private loadingService = inject(LoadingService);
  private fb = inject(FormBuilder);

  @Input() isVisible = false;
  @Input() stock: Stock | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() orderCompleted = new EventEmitter<void>();

  orderForm: FormGroup;
  totalAmount = 0;
  isAnimating = false;

  // Swipe functionality
  isDragging = false;
  dragStartX = 0;
  currentDragX = 0;
  maxDragDistance = 0;
  swipeThreshold = 0.8; // 80% of the button width
  isBallHovered = false;

  // Expose constants for template
  APP_CONSTANTS = APP_CONSTANTS;

  // Toast properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'success';

  constructor() {
    this.orderForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      shares: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  private valueChangesSubscription: Subscription | null = null;

  ngOnInit() {
    // Subscribe to form value changes to update total amount
    const sharesControl = this.orderForm.get('shares');
    if (sharesControl) {
      this.valueChangesSubscription = sharesControl.valueChanges.subscribe(() => {
        this.calculateTotalAmount();
      });
    }
  }

  ngOnDestroy() {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  // Close modal on escape key
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(_event: KeyboardEvent) {
    if (this.isVisible) {
      this.closeModal();
    }
  }

  private calculateTotalAmount() {
    if (this.stock && this.orderForm.get('shares')?.value) {
      this.totalAmount = this.stock.price * this.orderForm.get('shares')?.value;
    }
  }

  onOverlayClick(event: Event) {
    // Only close if clicking directly on the overlay (not on modal content)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onModalContentClick(event: Event) {
    // Prevent clicks inside modal from closing it
    event.stopPropagation();
  }

  closeModal() {
    this.modalClosed.emit();
  }

  // Ball hover handlers
  onBallMouseEnter() {
    this.isBallHovered = true;
  }

  onBallMouseLeave() {
    this.isBallHovered = false;
  }

  // Touch/Mouse event handlers for dragging
  onDragStart(event: TouchEvent | MouseEvent) {
    this.isDragging = true;
    this.isBallHovered = true; // Hide text when dragging starts
    this.dragStartX = this.getClientX(event);
    this.currentDragX = 0;

    // Calculate max drag distance (button width minus ball width minus initial padding)
    const buttonElement = (event.target as HTMLElement).closest('.swipe-button');
    if (buttonElement) {
      this.maxDragDistance = buttonElement.clientWidth - 40 - 2; // 40px is ball width, 2px initial padding
    }

    event.preventDefault();
    event.stopPropagation();
  }

  onDragMove(event: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;

    const currentX = this.getClientX(event);
    const deltaX = currentX - this.dragStartX;

    // Constrain dragging to button bounds
    this.currentDragX = Math.max(0, Math.min(deltaX, this.maxDragDistance));

    event.preventDefault();
    event.stopPropagation();
  }

  onDragEnd(event: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.isBallHovered = false; // Show text again when dragging ends

    // Check if dragged far enough to trigger purchase
    const dragPercentage = this.currentDragX / this.maxDragDistance;

    if (dragPercentage >= this.swipeThreshold) {
      this.triggerSwipeAnimation();
      setTimeout(() => {
        this.completePurchase();
      }, 300); // Wait for animation to complete
    } else {
      // Reset position with smooth animation
      setTimeout(() => {
        this.currentDragX = 0;
      }, 50); // Small delay for smooth reset
    }

    event.preventDefault();
    event.stopPropagation();
  }

  private getClientX(event: TouchEvent | MouseEvent): number {
    if (
      event instanceof TouchEvent &&
      event.touches &&
      event.touches.length > 0 &&
      event.touches[0]
    ) {
      return event.touches[0].clientX;
    }
    if (event instanceof MouseEvent) {
      return event.clientX;
    }
    return 0;
  }

  getBallPositionPx(): number {
    // Add initial left padding of 2px to match Figma design
    return this.currentDragX + 2;
  }

  private triggerSwipeAnimation() {
    this.isAnimating = true;
    this.currentDragX = this.maxDragDistance;

    setTimeout(() => {
      this.isAnimating = false;
      this.currentDragX = 0; // Reset after animation
    }, 300);
  }

  private async completePurchase() {
    if (!this.stock) {
      this.showErrorToast('No stock selected for purchase.');
      return;
    }

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.showErrorToast('Please fill in all required fields correctly.');
      return;
    }

    await this.loadingService.show('Processing purchase...');
    try {
      const shares = this.orderForm.get('shares')?.value;
      this.portfolioService.addStock(this.stock, shares);

      // Show success toast
      this.showSuccessToast(`${this.stock.companyName} successfully purchased`);

      this.orderCompleted.emit();

      setTimeout(() => {
        this.closeModal();
      }, 2000); // Give time to see success message
    } catch (error) {
      this.showErrorToast('Purchase failed. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      this.loadingService.hide();
    }
  }

  private showSuccessToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'success';
    this.showToast = true;
  }

  private showErrorToast(message: string): void {
    this.toastMessage = message;
    this.toastType = 'error';
    this.showToast = true;
  }

  onToastDismissed(): void {
    this.showToast = false;
  }

  async onSwipeBuy() {
    console.log('Swipe buy triggered!');
    await this.completePurchase();
  }
}
