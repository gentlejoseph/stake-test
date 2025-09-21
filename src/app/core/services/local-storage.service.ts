import { Injectable } from '@angular/core';
import { Stock } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly RECENT_SEARCHES_KEY = 'stake_recent_searches';
  private readonly MAX_RECENT_SEARCHES = 5;

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
      if (recentSearches.length > this.MAX_RECENT_SEARCHES) {
        recentSearches = recentSearches.slice(0, this.MAX_RECENT_SEARCHES);
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
