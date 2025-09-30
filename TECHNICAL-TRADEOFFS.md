# Technical Trade-offs & Design Decisions

## Overview
This document explains the key technical trade-offs made during implementation, the alternatives considered, and the reasoning behind each decision.

---

## 1. Dollar-Based vs Share-Based Purchase System

### Decision: Dollar-Based
Users enter a dollar amount → system calculates shares

### Why Dollar-Based?
✅ **More intuitive UX** - "I want to invest $100" vs "I want 0.948 shares"
✅ **Matches modern trading apps** (Robinhood, Stake, Webull)
✅ **Enables fractional investing** - accessible to users with small amounts
✅ **Better for diversification** - spread $100 across 5 stocks easily

### Trade-offs
❌ **Requires fractional share support** - more complex calculations
❌ **Precision issues** - need to handle decimals carefully (0.9484 shares)
❌ **Less transparent pricing** - users don't immediately see cost per share

### Alternative: Share-Based
User enters number of shares → system calculates cost
- Simpler math (no fractions needed)
- More traditional approach
- But: Less accessible, harder to budget

**Verdict:** Dollar-based better for consumer trading app

---

## 2. Weighted Average vs FIFO/LIFO Cost Basis

### Decision: Weighted Average
When buying same stock multiple times, average the purchase prices

### Formula
```typescript
newAvgPrice = (oldQuantity × oldAvgPrice + newQuantity × newPrice) / totalQuantity
```

### Why Weighted Average?
✅ **Industry standard** for retail investing
✅ **Simpler for users** - one average price vs multiple tax lots
✅ **Accurate P&L** - reflects true blended cost basis
✅ **No need to track purchase order** - all shares treated equally

### Trade-offs
❌ **More complex calculation** - need to recalculate on each purchase
❌ **Can't optimize tax loss harvesting** - no lot-level control
❌ **Loses purchase history** - can't see individual buy prices

### Alternatives

**FIFO (First In, First Out)**
- Sells oldest shares first
- Good for tax optimization
- But: More complex to implement and explain

**LIFO (Last In, First Out)**
- Sells newest shares first
- Tax advantages in some scenarios
- But: Confusing for average users

**Specific Lot Identification**
- User chooses which shares to sell
- Maximum tax flexibility
- But: Too complex for this app's target users

**Verdict:** Weighted average best for simplicity and user understanding

---

## 3. RxJS Observables vs Simple State Variables

### Decision: RxJS BehaviorSubject
Manage portfolio state using reactive observables

### Implementation
```typescript
private portfolioSubject = new BehaviorSubject<Portfolio | null>(null);
public portfolio$ = this.portfolioSubject.asObservable();
```

### Why RxJS?
✅ **Reactive updates** - components auto-update when portfolio changes
✅ **Angular best practice** - idiomatic Angular state management
✅ **Decoupled architecture** - components don't need to poll for changes
✅ **Multiple subscribers** - many components can listen to same data
✅ **Built-in to Angular** - no additional libraries needed

### Trade-offs
❌ **Learning curve** - RxJS can be complex for beginners
❌ **Memory management** - must unsubscribe to prevent leaks
❌ **Debugging difficulty** - async streams harder to trace than simple variables
❌ **Overkill for small apps** - simpler solutions might work

### Alternatives

**Plain Service Variables**
```typescript
private portfolio: Portfolio;
getPortfolio() { return this.portfolio; }
```
- Simpler to understand
- But: No reactivity, manual updates needed

**Angular Signals (Angular 16+)**
```typescript
portfolio = signal<Portfolio | null>(null);
```
- Modern reactive primitive
- But: Too new, less ecosystem support

**NgRx/Akita (Full State Management)**
- Centralized store, time-travel debugging
- But: Massive overkill for this app size

**Verdict:** RxJS strikes best balance for Angular app of this size

---

## 4. Mock Data vs Real API Integration

### Decision: Mock Data Service
Hard-coded data, no backend calls

### Implementation
```typescript
getMockPortfolio(): Portfolio {
  return { /* hard-coded data */ };
}
```

### Why Mock Data?
✅ **Fast development** - no API integration needed
✅ **No backend required** - reduces project scope
✅ **Predictable testing** - consistent data every time
✅ **Works offline** - no network dependency
✅ **Meets take-home requirements** - demonstrates UI/UX skills

### Trade-offs
❌ **Not production-ready** - can't persist data across sessions
❌ **No real-time prices** - stocks don't update
❌ **Limited realism** - can't test error scenarios
❌ **Scalability concerns** - doesn't show API handling skills

### Alternatives

**Real API (IEX Cloud, Alpha Vantage, Finnhub)**
- Real stock data
- But: API keys, rate limits, costs, complexity

**JSON Server / Mock Backend**
- Simulates REST API
- But: Extra setup, still not real data

**LocalStorage Persistence**
- Survives page refresh
- But: Still not multi-device, limited storage

**Verdict:** Mock data appropriate for take-home test scope

---

## 5. Component Architecture: Standalone vs Module-Based

### Decision: Standalone Components
Each component self-contained with its own imports

### Implementation
```typescript
@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, ...]
})
```

### Why Standalone?
✅ **Modern Angular approach** (v14+)
✅ **Simpler mental model** - no NgModule configuration
✅ **Better tree-shaking** - unused components automatically excluded
✅ **Easier testing** - no module setup needed
✅ **Future-proof** - Angular moving toward standalone by default

### Trade-offs
❌ **Verbose imports** - each component lists all dependencies
❌ **Repetition** - common imports duplicated across components
❌ **Not compatible with older Angular** - requires v14+

### Alternative: NgModule-Based
```typescript
@NgModule({
  declarations: [OrderModalComponent],
  imports: [CommonModule, IonicModule]
})
```
- Traditional Angular approach
- Shared imports in module
- But: More boilerplate, being phased out

**Verdict:** Standalone is Angular's future, better to use now

---

## 6. Form Handling: Reactive Forms vs Template-Driven

### Decision: Reactive Forms
FormBuilder-based form management

### Implementation
```typescript
orderForm = this.fb.group({
  amount: [0, [Validators.required, Validators.min(0.01)]]
});
```

### Why Reactive Forms?
✅ **Type safety** - better TypeScript support
✅ **Testable** - can test form logic in isolation
✅ **Complex validation** - easier to add custom validators
✅ **Programmatic control** - can manipulate form in code
✅ **Better for dynamic forms** - add/remove fields easily

### Trade-offs
❌ **More boilerplate** - requires FormBuilder, FormGroup setup
❌ **Less intuitive** - indirection between template and logic
❌ **Learning curve** - more concepts to understand

### Alternative: Template-Driven Forms
```html
<input [(ngModel)]="amount" required>
```
- Simpler syntax
- Good for basic forms
- But: Harder to test, less powerful

**Verdict:** Reactive forms better for production apps

---

## 7. Swipe-to-Buy Interaction Pattern

### Decision: Custom swipe implementation
Manual drag/touch event handling

### Why Custom Implementation?
✅ **Unique UX** - matches Stake app design requirements
✅ **Full control** - can customize behavior precisely
✅ **No library dependency** - keeps bundle size small
✅ **Touch + mouse support** - works on all devices

### Trade-offs
❌ **Complex code** - 100+ lines for swipe logic
❌ **Edge cases** - need to handle touch/mouse differences
❌ **Accessibility concerns** - harder for users with motor disabilities
❌ **Testing difficulty** - hard to unit test touch events

### Alternatives

**Standard Button Click**
- Much simpler
- But: Doesn't match design requirements

**HammerJS (Gesture Library)**
- Built-in gesture recognition
- But: Large bundle size, deprecated in Angular

**Ionic Gesture Controller**
- Framework-provided gestures
- But: Still requires custom implementation

**Confirmation Dialog**
- Standard pattern
- But: Extra click, interrupts flow

**Verdict:** Custom swipe matches design spec, worth the complexity

---

## 8. Error Handling Strategy

### Decision: Centralized ErrorHandlerService
Single service for all error/success messages

### Implementation
```typescript
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleError(error: Error) { /* show toast */ }
  showSuccessToast(message: string) { /* show success */ }
}
```

### Why Centralized?
✅ **Consistent UX** - all errors shown the same way
✅ **Single responsibility** - one place for error logic
✅ **Easier updates** - change error format once
✅ **Logging ready** - can add analytics/monitoring here

### Trade-offs
❌ **Generic handling** - all errors treated similarly
❌ **Context loss** - harder to show context-specific messages
❌ **Dependency** - every component needs to inject service

### Alternative: Try-Catch in Components
```typescript
try { /* action */ }
catch (e) { alert(e.message); }
```
- More flexible per-component
- But: Inconsistent, repetitive, hard to change

**Verdict:** Centralized better for consistency

---

## 9. Validation Limits ($0.01 - $1,000,000)

### Decision: Hard min/max limits on purchase amounts

### Why These Limits?
✅ **Prevent input errors** - no $0 or negative purchases
✅ **Reasonable range** - covers 99.9% of retail trades
✅ **Performance** - prevents extreme numbers from breaking UI
✅ **Security** - limits potential abuse

### Trade-offs
❌ **Arbitrary limits** - some users might want $1M+ trades
❌ **Different user needs** - retail vs institutional
❌ **Currency dependent** - assumes USD

### Alternatives

**No upper limit**
- Maximum flexibility
- But: Could cause display issues, security risks

**Dynamic limits based on account balance**
- More sophisticated
- But: Requires account system, more complexity

**Configurable limits**
- Admin can adjust
- But: Overkill for this scope

**Verdict:** Fixed limits appropriate for consumer app

---

## 10. Initial 0.01% Gain on New Purchases

### Decision: Show small positive gain on fresh purchases

### Implementation
```typescript
gainLoss: purchaseAmount × 0.0001,  // $0.10 on $1000
gainLossPercent: 0.01               // 0.01%
```

### Why Fake Initial Gain?
✅ **Better UX** - avoids confusing "$0.00 (0.00%)" display
✅ **Visual feedback** - green color indicates successful purchase
✅ **Psychological** - users feel positive about purchase
✅ **Common pattern** - some trading apps do this

### Trade-offs
❌ **Technically inaccurate** - not true market gain
❌ **Misleading** - could confuse sophisticated users
❌ **Ethical concerns** - borderline manipulative
❌ **Inconsistent** - real-time price updates will override quickly

### Alternatives

**Show exactly $0.00 (0.00%)**
- Most accurate
- But: Visually confusing with gray/neutral color

**Hide gain/loss until price changes**
- Accurate and clean
- But: Empty space looks broken

**Show "Just Purchased" badge**
- Clear communication
- But: Extra UI complexity

**Verdict:** Small fake gain is acceptable UX compromise (though controversial)

---

## Summary: Key Takeaways

### What Worked Well
1. **Dollar-based investing** - Intuitive UX
2. **Weighted average** - Standard industry practice
3. **RxJS observables** - Clean reactive architecture
4. **Standalone components** - Modern, future-proof Angular

### What Could Be Improved
1. **Mock data** → Real API for production
2. **No persistence** → Add localStorage or backend
3. **Initial fake gain** → Better solution for "just purchased" state
4. **Limited error handling** → More granular error types
5. **No undo** → Add purchase history and reversal

### Architecture Wins
- Clean separation of concerns (services vs components)
- Reactive data flow (observables)
- Type safety throughout (TypeScript interfaces)
- Reusable components (atomic design hints)

### If Starting Over
- Would add **localStorage persistence** early
- Would consider **Angular Signals** instead of RxJS (simpler)
- Would implement **proper state machine** for purchase flow
- Would add **unit tests** from the start