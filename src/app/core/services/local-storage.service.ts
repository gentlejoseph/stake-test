import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';
import { Stock } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly RECENT_SEARCHES_KEY = 'stake_recent_searches';

  getRecentSearches(): Stock[] {
    try {
      const stored = localStorage.getItem(this.RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading recent searches:', error);
      return [];
    }
  }

  addRecentSearch(stock: Stock): void {
    try {
      let recentSearches = this.getRecentSearches();

      // Remove if already exists
      recentSearches = recentSearches.filter(s => s.symbol !== stock.symbol);

      // Add to beginning
      recentSearches.unshift(stock);

      // Keep only max items
      if (recentSearches.length > APP_CONSTANTS.MAX_RECENT_SEARCHES) {
        recentSearches = recentSearches.slice(0, APP_CONSTANTS.MAX_RECENT_SEARCHES);
      }

      localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(this.RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }
}
