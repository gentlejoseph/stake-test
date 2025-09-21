import { Injectable } from '@angular/core';
import { Portfolio, Stock, StockHolding } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  getMockStocks(): Stock[] {
    return [
      {
        symbol: 'AAPL',
        companyName: 'Apple Inc.',
        price: 105.44,
        change: 24.12,
        changePercent: 0.229,
        volume: 68544000,
        logo: 'assets/icon/brand/figma.svg', // Using Figma logo as placeholder
      },
      {
        symbol: 'TSLA',
        companyName: 'Tesla Inc.',
        price: 105.44,
        change: 24.12,
        changePercent: 0.229,
        volume: 85430000,
        logo: 'assets/icon/brand/figma.svg', // Using Figma logo as placeholder
      },
      {
        symbol: 'TIK',
        companyName: 'TikTok Inc.',
        price: 105.44,
        change: 24.12,
        changePercent: 0.229,
        volume: 32100000,
        logo: 'assets/icon/brand/figma.svg', // Using Figma logo as placeholder
      },
      {
        symbol: 'FIG',
        companyName: 'Figma Inc',
        price: 131.04,
        change: -2.85,
        changePercent: -0.0213,
        volume: 32100000,
        logo: 'assets/icon/brand/figma.svg',
      },
      {
        symbol: 'ABNB',
        companyName: 'Airbnb, Inc.',
        price: 109.8,
        change: 1.25,
        changePercent: 0.0115,
        volume: 28900000,
        logo: 'assets/icon/brand/airbnb.svg',
      },
      {
        symbol: 'BABA',
        companyName: 'Alibaba Group',
        price: 87.45,
        change: -1.15,
        changePercent: -0.013,
        volume: 42300000,
        logo: 'assets/icon/brand/ababa.svg',
      },
    ];
  }

  getMockPortfolio(): Portfolio {
    const stocks = this.getMockStocks();
    const holdings: StockHolding[] = [
      {
        stock: stocks[0]!, // AAPL
        quantity: 3.0282,
        averagePrice: 81.32, // Calculated to get +22.90% gain
        totalValue: stocks[0]!.price * 3.0282, // $105.44 * 3.0282 = $319.25
        gainLoss: (stocks[0]!.price - 81.32) * 3.0282, // Gain of ~$73.12
        gainLossPercent: 0.229, // +22.90%
      },
      {
        stock: stocks[1]!, // TSLA
        quantity: 3.0282,
        averagePrice: 81.32, // Same as AAPL for consistency
        totalValue: stocks[1]!.price * 3.0282, // $105.44 * 3.0282 = $319.25
        gainLoss: (stocks[1]!.price - 81.32) * 3.0282, // Gain of ~$73.12
        gainLossPercent: 0.229, // +22.90%
      },
      {
        stock: stocks[2]!, // TIK
        quantity: 3.0282,
        averagePrice: 81.32, // Same as others for consistency
        totalValue: stocks[2]!.price * 3.0282, // $105.44 * 3.0282 = $319.25
        gainLoss: (stocks[2]!.price - 81.32) * 3.0282, // Gain of ~$73.12
        gainLossPercent: 0.229, // +22.90%
      },
    ];

    // Set total equity to match Figma: $8,036
    const totalEquity = 8036.0;
    const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);

    return {
      totalEquity,
      dayChange: totalGainLoss,
      dayChangePercent: totalGainLoss / (totalEquity - totalGainLoss),
      holdings,
    };
  }

  getTrendingStocks(): Stock[] {
    // Return mix of trending stocks: FIG, ABNB, BABA (duplicated for infinite scroll effect)
    const baseStocks = [
      {
        symbol: 'FIG',
        companyName: 'Figma Inc',
        price: 131.04,
        change: -2.85,
        changePercent: -0.0213,
        volume: 32100000,
        logo: 'assets/icon/brand/figma.svg',
      },
      {
        symbol: 'ABNB',
        companyName: 'Airbnb, Inc.',
        price: 105.64,
        change: 2.3,
        changePercent: 0.0223,
        volume: 68544000,
        logo: 'assets/icon/brand/airbnb.svg',
      },
      {
        symbol: 'BABA',
        companyName: 'Alibaba Group',
        price: 87.45,
        change: -1.15,
        changePercent: -0.013,
        volume: 42300000,
        logo: 'assets/icon/brand/ababa.svg',
      },
    ];

    // Duplicate the stocks to create more content for scrolling (5 sets for better infinite scroll effect)
    return [...baseStocks, ...baseStocks, ...baseStocks, ...baseStocks, ...baseStocks];
  }
}
