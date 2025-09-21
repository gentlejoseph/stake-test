import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private toastController = inject(ToastController);

  constructor() {}

  async handleError(error: Error, showToast = true): Promise<void> {
    console.error('Application Error:', error);

    if (showToast) {
      await this.showErrorToast(error.message || 'An unexpected error occurred');
    }
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle',
    });

    await toast.present();
  }

  async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
      cssClass: 'toast-container success',
      animated: true,
    });

    await toast.present();

    // Wait for the toast to dismiss
    await toast.onDidDismiss();
  }
}
