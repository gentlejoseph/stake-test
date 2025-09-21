import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square } from 'ionicons/icons';
import { Router, NavigationEnd } from '@angular/router';
import { ModalService } from '../core/services/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  styles: [
    `
      .tab-button {
        @apply text-gray-500 transition-colors duration-200;
      }

      .tab-button.tab-selected {
        @apply text-custom-black;
      }

      .tab-icon {
        @apply text-inherit;
      }

      .tab-label {
        @apply text-inherit font-medium transition-all duration-200;
      }

      .tab-button.tab-selected .tab-label {
        @apply font-bold;
      }
    `,
  ],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  private router = inject(Router);
  private modalService = inject(ModalService);

  constructor() {
    addIcons({ triangle, ellipse, square });
  }

  ngOnInit() {
    // Close modal on navigation changes
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.modalService.forceCloseOrderModal();
    });
  }
}
