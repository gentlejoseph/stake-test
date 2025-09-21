import { Injectable, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingController = inject(LoadingController);

  private loadingElement: HTMLIonLoadingElement | null = null;

  constructor() {}

  async show(message = 'Loading...'): Promise<void> {
    if (this.loadingElement) {
      await this.hide();
    }

    this.loadingElement = await this.loadingController.create({
      message,
      spinner: 'crescent',
      translucent: true,
      backdropDismiss: false,
    });

    await this.loadingElement.present();
  }

  async hide(): Promise<void> {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
  }
}
