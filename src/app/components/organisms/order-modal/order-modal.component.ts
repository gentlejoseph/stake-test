import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { APP_CONSTANTS } from '../../../core/constants/app.constants';
import { Stock } from '../../../core/interfaces';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ModalService } from '../../../core/services/modal.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InputComponent } from '../../atoms/input/input.component';
import { SwipeButtonComponent } from '../../molecules/swipe-button/swipe-button.component';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, SwipeButtonComponent, ReactiveFormsModule, InputComponent],
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
export class OrderModalComponent implements OnInit, OnChanges {
  private portfolioService = inject(PortfolioService);
  private errorHandler = inject(ErrorHandlerService);
  private loadingService = inject(LoadingService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private modalService = inject(ModalService);

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

  constructor() {
    this.orderForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      shares: [{ value: 0, disabled: true }],
    });
  }

  get amount() {
    return this.orderForm.get('amount')?.value ?? 0;
  }

  get calculatedShares() {
    if (this.stock && this.stock.price > 0) {
      return this.amount / this.stock.price;
    }
    return 0;
  }

  ngOnInit() {
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reset form when modal becomes visible
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.resetForm();
    }
  }

  private resetForm() {
    this.orderForm.reset({
      amount: 0,
      shares: { value: 0, disabled: true },
    });
    this.totalAmount = 0;
  }

  private setupFormSubscriptions() {
    this.orderForm.get('amount')?.valueChanges.subscribe(() => {
      this.calculateShares();
    });
  }

  // Close modal on escape key
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(_event: KeyboardEvent) {
    if (this.isVisible) {
      this.closeModal();
    }
  }

  private calculateShares() {
    if (this.stock && this.stock.price > 0) {
      const shares = this.amount / this.stock.price;
      this.totalAmount = this.amount;
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
    // Emit event first so parent can update visibility
    this.modalClosed.emit();

    // Close through the service
    this.modalService.closeOrderModal();

    // Reset local state
    this.currentDragX = 0;
    this.isDragging = false;
    this.isAnimating = false;
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
      this.errorHandler.handleError(new Error('No stock selected for purchase.'));
      return;
    }

    // Remove focus from any active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    await this.loadingService.show('Processing purchase...');

    try {
      // Add the stock to portfolio first
      this.portfolioService.addStock(this.stock, this.calculatedShares);

      // First emit completion to trigger parent updates
      this.orderCompleted.emit();

      // Show success toast
      const stockName = this.stock?.symbol || 'Stock';
      await this.errorHandler.showSuccessToast(`${stockName} successfully purchased`);

      // If we're not on the invest page, navigate
      if (this.router.url !== '/tabs/invest') {
        // Wait a bit for the toast to be visible
        await new Promise(resolve => setTimeout(resolve, 300));
        await this.router.navigate(['/tabs/invest']);
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    } finally {
      this.loadingService.hide();
    }
  }

  async onSwipeBuy() {
    if (!this.orderForm.valid) {
      this.errorHandler.handleError(new Error('Please fill in all required fields correctly.'));
      return;
    }
    await this.completePurchase();
  }
}
