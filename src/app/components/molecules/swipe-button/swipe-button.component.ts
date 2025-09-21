import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { GestureController } from '@ionic/angular';

@Component({
  selector: 'app-swipe-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swipe-button.component.html',
  styleUrls: ['./swipe-button.component.scss'],
})
export class SwipeButtonComponent implements AfterViewInit, OnDestroy {
  private gestureCtrl = inject(GestureController);

  @Input() label = 'Swipe to buy';
  @Input() disabled = false;
  @Input() threshold = 0.8; // Threshold for completing the swipe
  @Output() swiped = new EventEmitter<void>();

  @ViewChild('button', { static: false }) button!: ElementRef<HTMLButtonElement>;
  @ViewChild('swipeBall', { static: false }) swipeBall!: ElementRef<HTMLDivElement>;

  private gesture: any;
  private maxTranslate = 0;
  private currentTranslateX = 0;
  private isCompleted = false;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeGesture();
  }

  ngOnDestroy(): void {
    if (this.gesture) {
      this.gesture.destroy();
    }
  }

  private initializeGesture(): void {
    if (!this.swipeBall?.nativeElement || !this.button?.nativeElement) {
      return;
    }

    const ballElement = this.swipeBall.nativeElement;
    const buttonElement = this.button.nativeElement;

    // Calculate maximum translate distance
    this.maxTranslate = buttonElement.offsetWidth - ballElement.offsetWidth - 4; // 4px for padding

    this.gesture = this.gestureCtrl.create({
      el: ballElement,
      threshold: 0,
      gestureName: 'swipe-button',
      onStart: () => {
        if (this.disabled || this.isCompleted) return;
        ballElement.style.transition = 'none';
      },
      onMove: ev => {
        if (this.disabled || this.isCompleted) return;

        // Constrain movement within button bounds
        this.currentTranslateX = Math.max(0, Math.min(ev.deltaX, this.maxTranslate));
        ballElement.style.transform = `translateX(${this.currentTranslateX}px)`;

        // Check if threshold is reached
        if (this.currentTranslateX >= this.maxTranslate * this.threshold) {
          this.completeSwipe();
        }
      },
      onEnd: () => {
        if (this.disabled || this.isCompleted) return;

        ballElement.style.transition = 'transform 0.3s ease-out';

        // If not completed, reset position
        if (this.currentTranslateX < this.maxTranslate * this.threshold) {
          this.resetPosition();
        }
      },
    });

    this.gesture.enable(true);
  }

  private completeSwipe(): void {
    if (this.isCompleted || this.disabled) return;

    this.isCompleted = true;
    const ballElement = this.swipeBall.nativeElement;

    // Animate to complete position
    ballElement.style.transition = 'transform 0.2s ease-out';
    ballElement.style.transform = `translateX(${this.maxTranslate}px)`;

    // Emit the swiped event
    setTimeout(() => {
      this.swiped.emit();

      // Reset after a delay
      setTimeout(() => {
        this.resetPosition();
      }, 1000);
    }, 200);
  }

  private resetPosition(): void {
    const ballElement = this.swipeBall.nativeElement;
    ballElement.style.transition = 'transform 0.3s ease-out';
    ballElement.style.transform = 'translateX(0px)';
    this.currentTranslateX = 0;

    setTimeout(() => {
      this.isCompleted = false;
      ballElement.style.transition = 'none';
    }, 300);
  }
}
