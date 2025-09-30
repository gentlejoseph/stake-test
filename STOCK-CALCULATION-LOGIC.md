# Stock Calculation Logic - Technical Implementation

## Overview
This document explains the stock trading and portfolio calculation logic implemented in this Ionic/Angular application, covering the key algorithms and business rules used.

---

## 📊 Core Data Models

### Stock Interface
```typescript
interface Stock {
  symbol: string;        // e.g., "AAPL"
  companyName: string;   // e.g., "Apple Inc."
  price: number;         // Current market price
  change: number;        // Dollar change from previous close
  changePercent: number; // Percentage change
  volume: number;        // Trading volume
  logo?: string;         // Company logo URL
}
```

### StockHolding Interface
```typescript
interface StockHolding {
  stock: Stock;          // Reference to the stock
  quantity: number;      // Number of shares owned (can be fractional)
  averagePrice: number;  // Weighted average purchase price
  totalValue: number;    // Current market value (price × quantity)
  gainLoss: number;      // Total profit/loss in dollars
  gainLossPercent: number; // Total profit/loss as percentage
}
```

### Portfolio Interface
```typescript
interface Portfolio {
  totalEquity: number;      // Sum of all holding values
  dayChange: number;        // Total dollar change today
  dayChangePercent: number; // Percentage change today
  holdings: StockHolding[]; // Array of stock holdings
}
```

---

## 🧮 Key Calculation Algorithms

### 1. Dollar-Based Share Purchase
**Location:** `order-modal.component.ts:103-108`

Users enter a dollar amount, system calculates shares:
```typescript
calculatedShares = amount / stock.price
```

**Example:**
- Amount: $100
- Stock Price: $105.44
- Shares: 100 ÷ 105.44 = 0.9484 shares

**Validation:**
- Minimum: $0.01
- Maximum: $1,000,000

---

### 2. Weighted Average Price Calculation
**Location:** `portfolio.service.ts:52-63`

When adding to an existing position:

```typescript
// Calculate weighted average
const oldValue = existingQuantity × existingAvgPrice
const newValue = oldValue + purchaseValue
const newTotalShares = existingQuantity + newQuantity
const newAveragePrice = newValue / newTotalShares
```

**Example:**
```
Existing: 2 shares @ $100 avg = $200
New Purchase: 1 share @ $110 = $110
Combined: $310 ÷ 3 shares = $103.33 new average
```

---

### 3. Gain/Loss Calculation
**Location:** `portfolio.service.ts:62-63`

```typescript
gainLoss = (currentPrice - averagePrice) × quantity
gainLossPercent = ((currentPrice - averagePrice) / averagePrice) × 100
```

**Example:**
```
Current Price: $110
Average Price: $103.33
Quantity: 3 shares
Gain: ($110 - $103.33) × 3 = $20.01
Gain %: (6.67 / 103.33) × 100 = 6.45%
```

---

### 4. Portfolio Day Change
**Location:** `portfolio.service.ts:82-92`

```typescript
// Sum each stock's day change × quantity
dayChange = Σ(stock.change × holding.quantity)

// Calculate percentage based on yesterday's value
portfolioYesterdayValue = totalEquity - dayChange
dayChangePercent = (dayChange / portfolioYesterdayValue) × 100
```

**Example:**
```
AAPL: +$5 change × 2 shares = +$10
TSLA: -$3 change × 1 share = -$3
Total Day Change: +$7
```

---

## 🔧 Implementation Details

### Purchase Flow
**Location:** `order-modal.component.ts:269-304`

1. **User enters dollar amount** → Calculates shares in real-time
2. **User swipes to confirm** → Triggers purchase
3. **System validates:**
   - Amount between $0.01 and $1,000,000
   - Stock data is valid
4. **System updates portfolio:**
   - If new stock: Create holding with initial 0.01% gain
   - If existing: Recalculate weighted average price
5. **System recalculates portfolio metrics:**
   - Total equity
   - Day change
   - Day change percentage
6. **Navigates to portfolio page** → Shows updated holdings

### New Position Initialization
**Location:** `portfolio.service.ts:66-75`

When buying a stock for the first time:
```typescript
newHolding = {
  quantity: calculatedShares,
  averagePrice: currentPrice,
  totalValue: purchaseAmount,
  gainLoss: purchaseAmount × 0.0001,  // 0.01% gain
  gainLossPercent: 0.01
}
```

**Rationale:** Small positive gain prevents showing $0.00/0% which could confuse users

### Existing Position Update
**Location:** `portfolio.service.ts:52-63`

When adding to an existing position:
1. Calculate old total invested: `oldQuantity × oldAvgPrice`
2. Add new purchase value
3. Divide by new total shares
4. Recalculate gain/loss based on new average

---

## 🧮 Quick Reference: Formula Summary

### Single Holding Calculations

| Metric | Formula | Code Location |
|--------|---------|---------------|
| **Shares Purchased** | `amount ÷ price` | `order-modal.component.ts:103` |
| **Total Value** | `currentPrice × quantity` | `portfolio.service.ts:61` |
| **Gain/Loss ($)** | `(currentPrice - avgPrice) × quantity` | `portfolio.service.ts:62` |
| **Gain/Loss (%)** | `((currentPrice - avgPrice) ÷ avgPrice) × 100` | `portfolio.service.ts:63` |
| **New Average Price** | `(oldValue + newValue) ÷ totalShares` | `portfolio.service.ts:54-57` |

### Portfolio Calculations

| Metric | Formula | Code Location |
|--------|---------|---------------|
| **Total Equity** | `Σ(holding.totalValue)` | Calculated by summing holdings |
| **Day Change ($)** | `Σ(stock.change × quantity)` | `portfolio.service.ts:82-85` |
| **Day Change (%)** | `(dayChange ÷ yesterdayValue) × 100` | `portfolio.service.ts:88-92` |

---

## 🎯 Key Technical Decisions

### 1. Dollar-Based Purchase System
**Why:** More intuitive UX - users think in dollars, not shares
**Implementation:** Real-time calculation in order modal
**Trade-off:** Requires fractional share support

### 2. Weighted Average Cost Basis
**Why:** Industry standard for accurate P&L tracking
**Implementation:** Recalculated on each purchase using total cost ÷ total shares
**Trade-off:** More complex than FIFO/LIFO, but more accurate

### 3. RxJS Observable Pattern
**Why:** Reactive updates to portfolio across components
**Implementation:** `BehaviorSubject` for portfolio state management
**Benefit:** Automatic UI updates when portfolio changes

### 4. Initial 0.01% Gain on New Positions
**Why:** UX decision - prevents confusing "$0.00 (0%)" on fresh purchases
**Implementation:** `gainLoss = purchaseAmount × 0.0001`
**Trade-off:** Technically inaccurate but better UX

### 5. Validation Limits
**Min:** $0.01 | **Max:** $1,000,000
**Why:** Prevent input errors and edge cases
**Implementation:** Form validators in order modal

---

## 📝 Interview Talking Points

### Architecture
- **Services:** `PortfolioService` (state management), `MockDataService` (data)
- **Components:** `OrderModalComponent` (purchase flow), Portfolio/Discover pages (display)
- **State Management:** RxJS Observables with BehaviorSubject pattern
- **Data Flow:** Unidirectional - Service → Observable → Components

### Calculation Logic Highlights
1. **Weighted average** prevents inaccurate P&L from FIFO/LIFO
2. **Day change** uses stock's price delta × quantity owned
3. **Portfolio percentage** calculated against yesterday's value (today's value - today's change)
4. **Fractional shares** enable dollar-amount investing (modern trading app pattern)

### UX Considerations
- **Swipe-to-buy** pattern for purchase confirmation
- **Real-time share calculation** as user types dollar amount
- **Auto-navigation** to portfolio after purchase for immediate feedback
- **Color coding** (green/red) for instant performance understanding
- **Dual metrics** (day change vs total gain) for complete picture

### Error Handling
- Input validation (min/max amounts)
- Toast notifications for success/errors
- Loading states during async operations
- Defensive checks (null portfolio, invalid stock data)

### Potential Improvements
- Persist portfolio to localStorage/backend
- Add sell functionality
- Historical performance charts
- Real-time price updates via WebSocket
- Tax lot tracking for advanced users