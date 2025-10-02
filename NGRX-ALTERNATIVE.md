# NgRx Alternative - Migrating Your Stock App

## What You Have Now vs NgRx

### Current Architecture (Service + BehaviorSubject)

```typescript
// portfolio.service.ts - Your current approach
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private portfolioSubject = new BehaviorSubject<Portfolio | null>(null);
  public portfolio$ = this.portfolioSubject.asObservable();

  addStock(stock: Stock, quantity: number): void {
    const current = this.getCurrentPortfolio();
    // ... do calculations ...
    this.portfolioSubject.next(newPortfolio);
  }
}

// Component
export class InvestPage {
  ngOnInit() {
    this.portfolioService.portfolio$.subscribe(portfolio => {
      this.portfolio = portfolio;
    });
  }

  buyStock(stock: Stock, quantity: number) {
    this.portfolioService.addStock(stock, quantity);
  }
}
```

**Pros:**
- ✅ Simple and straightforward
- ✅ Less boilerplate
- ✅ Easy to understand
- ✅ Perfect for small apps

**Cons:**
- ❌ No time-travel debugging
- ❌ Hard to track state changes
- ❌ Services can become bloated
- ❌ No enforced immutability
- ❌ State mutations are scattered

## What NgRx Offers

NgRx is like a **strict rulebook** for state management:

1. **Single source of truth** - One central store for all state
2. **Immutable state** - Can't accidentally modify state
3. **Predictable updates** - State only changes through Actions → Reducers
4. **DevTools** - Time-travel debugging, state inspection
5. **Side effects isolation** - All async operations in Effects

## The NgRx Flow

```
Component
   ↓ dispatches
Action ("ADD_STOCK")
   ↓ intercepted by
Effect (async operations like HTTP)
   ↓ dispatches new Action
Action ("ADD_STOCK_SUCCESS")
   ↓ processed by
Reducer (pure function)
   ↓ returns new state
Store (immutable state)
   ↓ emits via
Selector
   ↓ subscribes
Component (gets updated)
```

## Migrating Your Portfolio Service to NgRx

### Step 1: Define Actions

**Before (your current way):**
```typescript
// Just call service methods
this.portfolioService.addStock(stock, quantity);
this.portfolioService.removeStock(stockId);
```

**After (NgRx way):**
```typescript
// src/app/store/portfolio/portfolio.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Portfolio, Stock } from '../../core/interfaces';

export const PortfolioActions = createActionGroup({
  source: 'Portfolio',
  events: {
    // Action to load portfolio
    'Load Portfolio': emptyProps(),
    'Load Portfolio Success': props<{ portfolio: Portfolio }>(),
    'Load Portfolio Failure': props<{ error: string }>(),

    // Action to add stock
    'Add Stock': props<{ stock: Stock; quantity: number }>(),
    'Add Stock Success': props<{ portfolio: Portfolio }>(),
    'Add Stock Failure': props<{ error: string }>(),

    // Action to remove stock
    'Remove Stock': props<{ stockSymbol: string }>(),
    'Remove Stock Success': props<{ portfolio: Portfolio }>(),
  }
});

// Usage in component:
this.store.dispatch(PortfolioActions.addStock({ stock, quantity }));
```

**Why Actions?**
- Actions describe **what happened** (events)
- They're logged in DevTools (audit trail)
- They're serializable (can save/replay)
- They separate intent from implementation

### Step 2: Define State Shape

```typescript
// src/app/store/portfolio/portfolio.state.ts
import { Portfolio } from '../../core/interfaces';

export interface PortfolioState {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
}

export const initialState: PortfolioState = {
  portfolio: null,
  loading: false,
  error: null
};
```

### Step 3: Create Reducer (Pure State Transitions)

**Before (your current way - mutable):**
```typescript
addStock(stock: Stock, quantity: number): void {
  const current = this.getCurrentPortfolio();

  // Direct mutation
  currentPortfolio.holdings.push(newHolding);
  currentPortfolio.totalEquity += purchaseValue;

  this.portfolioSubject.next({ ...currentPortfolio });
}
```

**After (NgRx way - immutable):**
```typescript
// src/app/store/portfolio/portfolio.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { PortfolioActions } from './portfolio.actions';
import { initialState } from './portfolio.state';

export const portfolioReducer = createReducer(
  initialState,

  // Loading portfolio
  on(PortfolioActions.loadPortfolio, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PortfolioActions.loadPortfolioSuccess, (state, { portfolio }) => ({
    ...state,
    portfolio,
    loading: false,
    error: null
  })),

  on(PortfolioActions.loadPortfolioFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Adding stock
  on(PortfolioActions.addStock, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PortfolioActions.addStockSuccess, (state, { portfolio }) => ({
    ...state,
    portfolio, // Entire new portfolio from backend
    loading: false,
    error: null
  })),

  on(PortfolioActions.addStockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
```

**Why Reducers?**
- Pure functions (same input → same output)
- Testable (no side effects)
- Predictable (can't modify state directly)
- Time-travel capable (can replay actions)

### Step 4: Create Selectors (Query State)

```typescript
// src/app/store/portfolio/portfolio.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PortfolioState } from './portfolio.state';

// Get the entire portfolio state slice
export const selectPortfolioState = createFeatureSelector<PortfolioState>('portfolio');

// Select specific pieces of state (memoized!)
export const selectPortfolio = createSelector(
  selectPortfolioState,
  (state) => state.portfolio
);

export const selectPortfolioLoading = createSelector(
  selectPortfolioState,
  (state) => state.loading
);

export const selectPortfolioError = createSelector(
  selectPortfolioState,
  (state) => state.error
);

// Derived selectors (computed values)
export const selectTotalEquity = createSelector(
  selectPortfolio,
  (portfolio) => portfolio?.totalEquity ?? 0
);

export const selectHoldings = createSelector(
  selectPortfolio,
  (portfolio) => portfolio?.holdings ?? []
);

export const selectHoldingsCount = createSelector(
  selectHoldings,
  (holdings) => holdings.length
);

// Complex derived state
export const selectTopHoldings = createSelector(
  selectHoldings,
  (holdings) => holdings
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
);
```

**Why Selectors?**
- **Memoization**: Only recalculates when dependencies change
- **Composable**: Build complex selectors from simple ones
- **Testable**: Pure functions
- **Performance**: Prevents unnecessary recalculations

### Step 5: Create Effects (Side Effects)

```typescript
// src/app/store/portfolio/portfolio.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { PortfolioActions } from './portfolio.actions';
import { MockDataService } from '../../core/services/mock-data.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable()
export class PortfolioEffects {
  constructor(
    private actions$: Actions,
    private mockDataService: MockDataService,
    private errorHandler: ErrorHandlerService
  ) {}

  // Listen for loadPortfolio action
  loadPortfolio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.loadPortfolio),
      mergeMap(() =>
        // Call service to get data
        of(this.mockDataService.getMockPortfolio()).pipe(
          map(portfolio => PortfolioActions.loadPortfolioSuccess({ portfolio })),
          catchError(error =>
            of(PortfolioActions.loadPortfolioFailure({ error: error.message }))
          )
        )
      )
    )
  );

  // Listen for addStock action
  addStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.addStock),
      mergeMap(({ stock, quantity }) => {
        // In real app, this would be an HTTP call
        // For now, we'll do the calculation here
        try {
          const currentPortfolio = this.mockDataService.getMockPortfolio();

          // Calculate new portfolio (your existing logic)
          const purchaseValue = stock.price * quantity;
          const existingHolding = currentPortfolio.holdings.find(
            h => h.stock.symbol === stock.symbol
          );

          if (existingHolding) {
            // Update existing holding
            const oldValue = existingHolding.quantity * existingHolding.averagePrice;
            const newValue = oldValue + purchaseValue;
            const newTotalShares = existingHolding.quantity + quantity;
            const newAveragePrice = newValue / newTotalShares;

            existingHolding.quantity = newTotalShares;
            existingHolding.averagePrice = newAveragePrice;
            existingHolding.totalValue = stock.price * newTotalShares;
            existingHolding.gainLoss = (stock.price - newAveragePrice) * newTotalShares;
            existingHolding.gainLossPercent =
              ((stock.price - newAveragePrice) / newAveragePrice) * 100;
          } else {
            // Add new holding
            currentPortfolio.holdings.push({
              stock,
              quantity,
              averagePrice: stock.price,
              totalValue: purchaseValue,
              gainLoss: purchaseValue * 0.0001,
              gainLossPercent: 0.01
            });
          }

          currentPortfolio.totalEquity += purchaseValue;

          return of(PortfolioActions.addStockSuccess({ portfolio: currentPortfolio }));
        } catch (error) {
          return of(PortfolioActions.addStockFailure({ error: error.message }));
        }
      })
    )
  );

  // Side effect: Show error toast
  handleError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PortfolioActions.loadPortfolioFailure,
          PortfolioActions.addStockFailure
        ),
        tap(({ error }) => {
          this.errorHandler.handleError(new Error(error));
        })
      ),
    { dispatch: false } // Don't dispatch another action
  );
}
```

**Why Effects?**
- Isolate async operations (HTTP, localStorage, timers)
- Testable side effects
- Centralized error handling
- Can trigger multiple actions from one event

### Step 6: Register Store in App

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { portfolioReducer } from './store/portfolio/portfolio.reducer';
import { PortfolioEffects } from './store/portfolio/portfolio.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    // Register reducers
    provideStore({
      portfolio: portfolioReducer,
      // modal: modalReducer,  // Add more feature states
      // stocks: stocksReducer
    }),

    // Register effects
    provideEffects([PortfolioEffects]),

    // DevTools (only in development)
    provideStoreDevtools({
      maxAge: 25, // Keep last 25 state changes
      logOnly: false, // Allow time-travel debugging
    })
  ]
};
```

### Step 7: Use in Components

**Before (your current way):**
```typescript
export class InvestPage implements OnInit {
  portfolio: Portfolio | null = null;

  ngOnInit() {
    this.portfolioService.portfolio$.subscribe(portfolio => {
      this.portfolio = portfolio;
    });
  }

  buyStock(stock: Stock, quantity: number) {
    this.portfolioService.addStock(stock, quantity);
  }
}
```

**After (NgRx way):**
```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Portfolio } from '../../core/interfaces';
import { PortfolioActions } from '../../store/portfolio/portfolio.actions';
import {
  selectPortfolio,
  selectPortfolioLoading,
  selectTotalEquity,
  selectHoldingsCount
} from '../../store/portfolio/portfolio.selectors';

export class InvestPage implements OnInit {
  // Observables from store (no manual subscription needed!)
  portfolio$: Observable<Portfolio | null>;
  loading$: Observable<boolean>;
  totalEquity$: Observable<number>;
  holdingsCount$: Observable<number>;

  constructor(private store: Store) {
    // Select slices of state
    this.portfolio$ = this.store.select(selectPortfolio);
    this.loading$ = this.store.select(selectPortfolioLoading);
    this.totalEquity$ = this.store.select(selectTotalEquity);
    this.holdingsCount$ = this.store.select(selectHoldingsCount);
  }

  ngOnInit() {
    // Dispatch action to load portfolio
    this.store.dispatch(PortfolioActions.loadPortfolio());
  }

  buyStock(stock: Stock, quantity: number) {
    // Dispatch action to add stock
    this.store.dispatch(PortfolioActions.addStock({ stock, quantity }));
  }
}
```

**Template (using async pipe):**
```html
<!-- Before -->
<div *ngIf="portfolio">
  <h2>{{ portfolio.totalEquity | currency }}</h2>
  <p>Holdings: {{ portfolio.holdings.length }}</p>
</div>

<!-- After -->
<div *ngIf="portfolio$ | async as portfolio">
  <h2>{{ totalEquity$ | async | currency }}</h2>
  <p>Holdings: {{ holdingsCount$ | async }}</p>
  <app-loading *ngIf="loading$ | async"></app-loading>
</div>
```

## Complete File Structure

```
src/app/
├── store/
│   ├── portfolio/
│   │   ├── portfolio.actions.ts      # All portfolio actions
│   │   ├── portfolio.reducer.ts      # State transitions
│   │   ├── portfolio.selectors.ts    # State queries
│   │   ├── portfolio.effects.ts      # Side effects
│   │   ├── portfolio.state.ts        # State interface
│   │   └── index.ts                  # Public API
│   ├── modal/
│   │   ├── modal.actions.ts
│   │   ├── modal.reducer.ts
│   │   └── modal.selectors.ts
│   └── index.ts                      # Root state
├── core/
│   └── services/
│       └── mock-data.service.ts      # Data fetching only
└── pages/
    └── invest/
        └── invest.page.ts            # Dispatch actions, select state
```

## Comparison: Your App vs NgRx

### Your Current Approach (Service + BehaviorSubject)

**Lines of code for portfolio feature: ~100**

```typescript
// portfolio.service.ts (all in one file)
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private portfolioSubject = new BehaviorSubject<Portfolio | null>(null);
  public portfolio$ = this.portfolioSubject.asObservable();

  addStock(stock: Stock, quantity: number): void {
    const current = this.getCurrentPortfolio();
    // ... business logic ...
    this.portfolioSubject.next(newPortfolio);
  }

  removeStock(symbol: string): void {
    // ... business logic ...
    this.portfolioSubject.next(newPortfolio);
  }
}
```

### NgRx Approach

**Lines of code for portfolio feature: ~400**

```
portfolio.actions.ts      (50 lines)  - Action definitions
portfolio.reducer.ts      (100 lines) - State transitions
portfolio.selectors.ts    (80 lines)  - State queries
portfolio.effects.ts      (120 lines) - Side effects
portfolio.state.ts        (20 lines)  - State interface
Component usage           (30 lines)  - Dispatch & select
```

## When to Use What?

### Stick with BehaviorSubject (Your Current Approach) If:

- ✅ App has < 10 screens
- ✅ Simple state (1-3 entities)
- ✅ Solo developer or small team
- ✅ Rapid prototyping
- ✅ State changes are simple
- ✅ No audit trail needed

**Your stock app fits this perfectly!**

### Migrate to NgRx If:

- ✅ App grows to 20+ screens
- ✅ Complex state relationships
- ✅ Large team (need enforced patterns)
- ✅ Need time-travel debugging
- ✅ Compliance/audit requirements
- ✅ Complex async workflows
- ✅ State changes from many sources

## NgRx Benefits You'd Get

### 1. Time-Travel Debugging

```
Redux DevTools shows:
─────────────────────────
[00:01] LOAD_PORTFOLIO
[00:03] ADD_STOCK (AAPL, 10 shares)
[00:05] ADD_STOCK (TSLA, 5 shares)
[00:07] REMOVE_STOCK (AAPL)
─────────────────────────

You can:
- Click any action to see state at that time
- Replay actions
- Skip actions
- Import/export state
```

### 2. Enforced Immutability

```typescript
// Current way - can accidentally mutate
const portfolio = this.getCurrentPortfolio();
portfolio.totalEquity += 100; // Whoops, mutated!

// NgRx way - TypeScript error if you try to mutate
on(PortfolioActions.addStock, (state) => {
  state.portfolio.totalEquity += 100; // ❌ ERROR: Cannot assign to read-only property
  return { ...state }; // ✅ Must return new object
});
```

### 3. Predictable State Flow

```
Your current way:
- Component calls service method
- Service updates subject
- All subscribers notified
- But where did the change originate?

NgRx way:
- Component dispatches action (logged)
- Effect handles async (logged)
- Reducer updates state (logged)
- Selector notifies component (logged)
- Complete audit trail!
```

### 4. Testability

```typescript
// Testing reducer (pure function - easy!)
describe('portfolioReducer', () => {
  it('should add stock to portfolio', () => {
    const initialState = { portfolio: null };
    const action = PortfolioActions.addStockSuccess({ portfolio: mockPortfolio });
    const newState = portfolioReducer(initialState, action);

    expect(newState.portfolio).toEqual(mockPortfolio);
  });
});

// Testing selector (pure function - easy!)
describe('selectTotalEquity', () => {
  it('should return total equity', () => {
    const state = { portfolio: { totalEquity: 1000 } };
    const result = selectTotalEquity.projector(state.portfolio);

    expect(result).toBe(1000);
  });
});

// Testing effect (observable stream)
describe('loadPortfolio$', () => {
  it('should load portfolio successfully', (done) => {
    const action = PortfolioActions.loadPortfolio();
    const outcome = PortfolioActions.loadPortfolioSuccess({ portfolio: mockPortfolio });

    actions$ = of(action);
    effects.loadPortfolio$.subscribe(result => {
      expect(result).toEqual(outcome);
      done();
    });
  });
});
```

## Migration Path (If You Decide to Migrate)

### Phase 1: Add NgRx Infrastructure
1. Install NgRx: `npm install @ngrx/store @ngrx/effects @ngrx/store-devtools`
2. Create store folder structure
3. Set up root state and store module

### Phase 2: Migrate One Feature at a Time
1. Start with Portfolio (most important)
2. Create actions, reducer, selectors, effects
3. Update components to use store
4. Keep old service as facade temporarily
5. Test thoroughly

### Phase 3: Migrate Remaining Features
1. Modal state → NgRx
2. Stock search → NgRx
3. Remove old services

### Phase 4: Add Advanced Features
1. Router state integration
2. Entity adapters for collections
3. Optimistic updates
4. Offline support

## Hybrid Approach (Middle Ground)

You can combine both approaches:

```typescript
// Keep simple state in services
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this.themeSubject.asObservable();

  toggle() {
    this.themeSubject.next(this.theme === 'light' ? 'dark' : 'light');
  }
}

// Use NgRx for complex state
@Injectable()
export class PortfolioEffects {
  // Complex portfolio operations in NgRx
}
```

## Conclusion

**For your current stock app:**
- ✅ BehaviorSubject approach is perfect
- ✅ Clean, simple, maintainable
- ✅ Easy for others to understand
- ✅ Fast development

**Consider NgRx when:**
- App grows significantly (20+ screens)
- Team grows (5+ developers)
- Need debugging/audit capabilities
- State becomes complex and hard to manage

**Best practice:**
- Start simple (BehaviorSubject)
- Migrate to NgRx if complexity warrants it
- Don't over-engineer early

Your current architecture is production-ready and appropriate for the app's size!
