import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  @Input() placeholder = 'Search stocks';
  @Input() searchQuery = '';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() searchFocus = new EventEmitter<void>();
  @Output() searchClear = new EventEmitter<void>();

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchQueryChange.emit(this.searchQuery);
  }

  onSearchFocus() {
    this.searchFocus.emit();
  }

  onSearchClear() {
    this.searchQuery = '';
    this.searchQueryChange.emit('');
    this.searchClear.emit();
  }
}
