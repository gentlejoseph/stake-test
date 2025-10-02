# Stake Interview Preparation Guide

## 📚 Technical Deep Dive - Key Concepts

### 1. Frontend System Design - Handling Scale

**Horizontal scaling strategies:**
- **CDN with edge caching**: Distribute static assets across PoPs, reduce origin server load, lower TTFB
- **WebSocket connection pooling**: Maintain persistent bi-directional connections, eliminate HTTP overhead, reduce latency from 100-300ms to <10ms
- **Virtual scrolling with intersection observer**: Render only visible DOM nodes, reduce memory footprint from O(n) to O(visible_items)

**Implementation details:**
```typescript
// Bad - O(n) DOM nodes, memory leak potential
<ion-item *ngFor="let stock of allStocks"> // 10k items = 10k DOM nodes

// Good - O(1) DOM nodes, constant memory
<ion-virtual-scroll [items]="stocks" [itemHeight]="60" [headerFn]="headerFn">
  // Only ~20 items rendered at once
</ion-virtual-scroll>

// Advanced: Windowing with dynamic heights
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

// Track scroll position, pre-render buffer zones
this.viewport.scrolledIndexChange.subscribe(index => {
  // Lazy load data as user scrolls
  if (index > this.stocks.length - 10) {
    this.loadMoreStocks();
  }
});
```

### 2. State Management: BehaviorSubject vs NgRx

**Architectural comparison:**

| Aspect | BehaviorSubject | NgRx |
|--------|----------------|------|
| **Pattern** | Observer/Observable | Flux/Redux (unidirectional data flow) |
| **Boilerplate** | Minimal (~10 LOC) | High (~100 LOC per feature) |
| **Time-travel** | Not supported | DevTools integration |
| **Immutability** | Manual enforcement | Enforced by reducers |
| **Side effects** | Mixed with logic | Isolated in Effects |
| **Bundle size** | ~0 KB (RxJS already included) | ~100 KB (NgRx + DevTools) |
| **Learning curve** | Low (RxJS knowledge) | High (Redux paradigm) |

**Current implementation (service-based state):**
```typescript
@Injectable({ providedIn: 'root' })
export class StockService {
  // State container with initial value
  private holdingsSubject = new BehaviorSubject<Holding[]>([]);

  // Expose as observable (read-only stream)
  holdings$ = this.holdingsSubject.asObservable();

  // State mutations are encapsulated in service methods
  addHolding(holding: Holding) {
    const current = this.holdingsSubject.value; // Direct state access
    this.holdingsSubject.next([...current, holding]); // Manual immutability
  }

  // Derived state with RxJS operators
  totalValue$ = this.holdings$.pipe(
    map(holdings => holdings.reduce((sum, h) => sum + h.shares * h.quantity, 0)),
    shareReplay(1) // Cache calculation for multiple subscribers
  );
}
```

**NgRx equivalent (when complexity justifies overhead):**
```typescript
// 1. Actions (typed events)
export const StockActions = createActionGroup({
  source: 'Stock',
  events: {
    'Add Holding': props<{ holding: Holding }>(),
    'Remove Holding': props<{ id: string }>(),
    'Load Holdings Success': props<{ holdings: Holding[] }>()
  }
});

// 2. Reducer (pure state transitions)
export const stockReducer = createReducer(
  initialState,
  on(StockActions.addHolding, (state, { holding }) => ({
    ...state,
    holdings: [...state.holdings, holding] // Immutability enforced
  })),
  on(StockActions.removeHolding, (state, { id }) => ({
    ...state,
    holdings: state.holdings.filter(h => h.id !== id)
  }))
);

// 3. Selectors (memoized state queries)
export const selectStockState = createFeatureSelector<StockState>('stock');
export const selectHoldings = createSelector(
  selectStockState,
  state => state.holdings
);
export const selectTotalValue = createSelector(
  selectHoldings,
  holdings => holdings.reduce((sum, h) => sum + h.shares * h.quantity, 0)
  // Memoized - only recalculates when holdings reference changes
);

// 4. Effects (async side effects)
@Injectable()
export class StockEffects {
  loadHoldings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadHoldings),
      switchMap(() =>
        this.api.getHoldings().pipe(
          map(holdings => StockActions.loadHoldingsSuccess({ holdings })),
          catchError(error => of(StockActions.loadHoldingsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private api: ApiService) {}
}

// 5. Component usage
export class StockComponent {
  holdings$ = this.store.select(selectHoldings);
  totalValue$ = this.store.select(selectTotalValue);

  constructor(private store: Store) {}

  addHolding(holding: Holding) {
    this.store.dispatch(StockActions.addHolding({ holding }));
  }
}
```

**Decision matrix:**
- **Use BehaviorSubject when**: <10 components share state, simple CRUD, single developer
- **Use NgRx when**: Complex state dependencies, need undo/redo, large team, audit trail required

### 3. Ionic vs React Native vs Flutter - Architecture Trade-offs

**Rendering architecture:**

| Framework | Rendering | Bridge | Performance | Bundle Size |
|-----------|-----------|--------|-------------|-------------|
| **Ionic** | WebView (DOM) | Capacitor (JS→Native) | 60fps max, 16ms frame budget | ~2MB initial |
| **React Native** | Native components | JS Bridge (async) | Near-native, some bridge overhead | ~5MB initial |
| **Flutter** | Skia canvas (direct GPU) | No bridge (Dart AOT) | Native 120fps on ProMotion | ~4MB initial |

**Ionic/Capacitor Plugin Architecture:**
```typescript
// Capacitor provides a unified API across platforms
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

async takePictureAdvanced() {
  try {
    // Camera.getPhoto internally:
    // - Web: Uses <input type="file" accept="image/*"> or MediaDevices API
    // - iOS: Calls UIImagePickerController
    // - Android: Calls Intent.ACTION_IMAGE_CAPTURE
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera, // vs CameraSource.Photos
      width: 1200,
      height: 1200
    });

    // Save to filesystem with platform abstraction
    const savedFile = await Filesystem.writeFile({
      path: `photos/${Date.now()}.jpeg`,
      data: photo.base64String!,
      directory: Directory.Data // Maps to platform-specific paths
    });

    return savedFile.uri;
  } catch (error) {
    // Handle permission denied, camera unavailable, etc.
    if (error.message.includes('User cancelled')) {
      // Handle cancellation
    }
  }
}

// Advanced: Custom plugin for missing functionality
import { registerPlugin } from '@capacitor/core';

interface BiometricPlugin {
  authenticate(options: { reason: string }): Promise<{ success: boolean }>;
}

const Biometric = registerPlugin<BiometricPlugin>('Biometric');

// Implement native code in Swift/Kotlin
```

**Responsive design with Ionic's grid system:**
```html
<!-- Breakpoints: xs(<576), sm(≥576), md(≥768), lg(≥992), xl(≥1200) -->
<ion-grid>
  <ion-row>
    <!-- Mobile: 12/12, Tablet: 6/12, Desktop: 4/12 -->
    <ion-col size="12" size-sm="6" size-lg="4">
      <ion-card>
        <!-- Adaptive card layout -->
      </ion-card>
    </ion-col>
  </ion-row>
</ion-grid>

<!-- Programmatic responsive handling -->
@Component({...})
export class StockComponent implements OnInit {
  constructor(private platform: Platform) {}

  ngOnInit() {
    // Detect platform capabilities
    if (this.platform.is('ios')) {
      // iOS-specific styling (safe area insets)
    }

    // Breakpoint detection
    this.platform.resize.subscribe(() => {
      const width = this.platform.width();
      if (width < 768) {
        // Mobile layout
      } else {
        // Tablet/Desktop layout
      }
    });

    // Platform detection for feature availability
    if (this.platform.is('capacitor')) {
      // Native features available
      this.enablePushNotifications();
    } else {
      // Web fallbacks
      this.enableWebNotifications();
    }
  }
}
```

**Performance optimization strategies:**
```typescript
// 1. OnPush change detection (reduce CD cycles)
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-list>
      <!-- trackBy prevents unnecessary re-renders -->
      <ion-item *ngFor="let stock of stocks; trackBy: trackBySymbol">
        {{ stock.symbol }} - {{ stock.price }}
      </ion-item>
    </ion-list>
  `
})
export class StockListComponent {
  trackBySymbol(index: number, stock: Stock) {
    return stock.symbol; // Identity function for change detection
  }
}

// 2. Web Workers for heavy computation (avoid blocking UI thread)
// calculation.worker.ts
addEventListener('message', ({ data }) => {
  const result = heavyCalculation(data);
  postMessage(result);
});

// component.ts
const worker = new Worker(new URL('./calculation.worker', import.meta.url));
worker.postMessage({ holdings: this.holdings });
worker.onmessage = ({ data }) => {
  this.totalValue = data;
};

// 3. Image optimization
<ion-img
  [src]="stock.logoUrl"
  alt="Stock logo"
  loading="lazy"  <!-- Intersection Observer API -->
  [style.width.px]="100"
  [style.height.px]="100"
></ion-img>

// 4. Route lazy loading (reduce initial bundle)
const routes: Routes = [
  {
    path: 'stocks',
    loadChildren: () => import('./stocks/stocks.module').then(m => m.StocksModule)
    // Only loads when route is accessed
  }
];
```

### 4. Angular Change Detection - Zone.js vs Signals

**Zone.js monkey-patching mechanism:**
```typescript
// Zone.js patches async APIs globally to trigger CD
// setTimeout, setInterval, Promise, XHR, addEventListener, etc.

// When this runs, Zone.js intercepts and triggers CD
setTimeout(() => {
  this.stockPrice = 150; // CD runs automatically after callback
}, 1000);

// Default CD strategy: Check entire component tree (O(n))
// 1. Compare all bindings in current component
// 2. Recursively check all child components
// 3. Update DOM if changes detected

// Problem: Unnecessary checks even when data hasn't changed
```

**OnPush optimization (skip subtrees):**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush, // Opt into OnPush
  template: `
    <div>{{ stock.price }}</div>
    <child-component [data]="childData"></child-component>
  `
})
export class StockComponent {
  @Input() stock: Stock; // Only checks when input reference changes

  // CD only runs when:
  // 1. @Input reference changes (===)
  // 2. Event from template (click, etc.)
  // 3. Observable emits via async pipe
  // 4. Manual: this.cdr.markForCheck()

  constructor(private cdr: ChangeDetectorRef) {}

  updateStockMutably(newPrice: number) {
    this.stock.price = newPrice; // ❌ Won't trigger CD (same reference)
  }

  updateStockImmutably(newPrice: number) {
    this.stock = { ...this.stock, price: newPrice }; // ✅ New reference, CD runs
  }

  forceCheck() {
    this.cdr.markForCheck(); // Manually mark for CD
    this.cdr.detectChanges(); // Run CD immediately (use sparingly)
  }

  detachFromCD() {
    this.cdr.detach(); // Stop automatic CD (manual control)
  }
}
```

**Angular Signals (v16+) - fine-grained reactivity:**
```typescript
// Signals provide granular dependency tracking without Zone.js
import { signal, computed, effect } from '@angular/core';

@Component({
  template: `
    <!-- Auto-subscribes to signal changes -->
    <div>{{ stockPrice() }}</div>
    <div>{{ totalValue() }}</div>
  `
})
export class StockComponent {
  // Writable signal
  stockPrice = signal(100);

  // Computed signal (memoized)
  totalValue = computed(() => this.stockPrice() * this.shares());
  // Only recalculates when dependencies change

  // Effect (side effects)
  constructor() {
    effect(() => {
      console.log('Price changed:', this.stockPrice());
      // Runs whenever stockPrice changes
    });
  }

  updatePrice(newPrice: number) {
    this.stockPrice.set(newPrice); // Set value
    // Or: this.stockPrice.update(old => old + 10); // Update based on current
  }
}

// Migration path: BehaviorSubject → Signal
// Before:
private priceSubject = new BehaviorSubject(100);
price$ = this.priceSubject.asObservable();

// After:
price = signal(100);
// Template: {{ price() }} instead of {{ price$ | async }}
```

### 5. RxJS Operators - Advanced Stream Composition

**Search debouncing (your implementation):**
```typescript
this.searchControl.valueChanges.pipe(
  debounceTime(300), // Wait 300ms after last keystroke (throttles API calls)
  distinctUntilChanged(), // Only emit if value actually changed (prevents duplicate calls)
  switchMap(term => this.searchStocks(term)) // Cancel previous search, start new one
).subscribe(results => this.searchResults = results);

// Problem solved: User types "AAPL"
// Without operators: 4 API calls (A, AP, APP, APPL)
// With operators: 1 API call (AAPL after 300ms pause)
```

**Flattening operators (critical differences):**
```typescript
// switchMap: Cancel previous inner observable
searchControl.valueChanges.pipe(
  switchMap(term => this.http.get(`/search?q=${term}`))
  // User types "A" → "AP" → "APP"
  // Cancels /search?q=A and /search?q=AP requests
  // Only /search?q=APP completes
  // Use for: Search, typeahead, latest value matters
)

// mergeMap (flatMap): Don't cancel, run all in parallel
button.click$.pipe(
  mergeMap(() => this.http.post('/analytics', data))
  // All clicks send analytics, none cancelled
  // Use for: Fire-and-forget operations
)

// concatMap: Queue and run sequentially
uploadQueue$.pipe(
  concatMap(file => this.http.post('/upload', file))
  // Waits for upload 1 to complete before starting upload 2
  // Use for: Ordered operations, prevent race conditions
)

// exhaustMap: Ignore new emissions while inner observable is active
saveButton.click$.pipe(
  exhaustMap(() => this.http.post('/save', data))
  // Ignore clicks while save is in progress
  // Use for: Prevent duplicate submissions
)
```

**Combination operators:**
```typescript
// combineLatest: Emit when ANY observable emits (needs all to emit at least once)
combineLatest([
  this.stocks$,
  this.watchlist$,
  this.searchTerm$
]).pipe(
  map(([stocks, watchlist, term]) => {
    // Filter stocks by watchlist and search term
    return stocks.filter(s =>
      watchlist.includes(s.symbol) &&
      s.symbol.includes(term)
    );
  })
)
// Emits whenever stocks, watchlist, OR searchTerm changes

// withLatestFrom: Only emit when source emits, include latest from others
button.click$.pipe(
  withLatestFrom(this.stocks$, this.settings$),
  map(([clickEvent, stocks, settings]) => {
    // Only emits on button click, includes latest stocks + settings
  })
)
// Use for: Actions that need current state snapshot

// forkJoin: Wait for ALL to complete (like Promise.all)
forkJoin({
  stocks: this.http.get('/stocks'),
  user: this.http.get('/user'),
  settings: this.http.get('/settings')
}).subscribe(({ stocks, user, settings }) => {
  // All 3 requests completed
})
// Use for: Parallel requests, need all results

// race: First observable to emit wins
race([
  this.http.get('/api-primary'),
  this.http.get('/api-backup')
]).subscribe(result => {
  // Uses whichever responds first
})
```

**Error handling and retry:**
```typescript
this.http.get('/stocks').pipe(
  retry({ count: 3, delay: 1000 }), // Retry 3 times with 1s delay
  catchError(error => {
    if (error.status === 404) {
      return of([]); // Return fallback value
    }
    return throwError(() => new Error('Failed to load'));
  }),
  finalize(() => this.loading = false) // Always runs (like finally)
).subscribe({
  next: stocks => this.stocks = stocks,
  error: err => this.showError(err)
});

// Exponential backoff
retryWhen(errors =>
  errors.pipe(
    mergeMap((error, index) => {
      if (index >= 3) return throwError(() => error);
      return timer(Math.pow(2, index) * 1000); // 1s, 2s, 4s
    })
  )
)
```

**Memory leak prevention:**
```typescript
export class StockComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // takeUntil: Unsubscribe when destroy$ emits
    this.stockService.stocks$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(stocks => this.stocks = stocks);

    // Multiple subscriptions
    merge(
      this.stream1$,
      this.stream2$,
      this.stream3$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Alternative: async pipe (auto-unsubscribes)
// Or use takeUntilDestroyed() in Angular 16+
```

**Multicasting and caching:**
```typescript
// shareReplay: Cache and replay to new subscribers
const stocks$ = this.http.get('/stocks').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
  // bufferSize: Number of emissions to cache
  // refCount: Unsubscribe from source when no subscribers
);

// share: Multicast but don't cache
const prices$ = this.websocket.connect().pipe(
  share() // Multiple subscribers share same WebSocket connection
);
```

### 6. Subjects Explained Like Coffee Shop Orders

```typescript
// Subject: Only get new orders after you arrive
const subject = new Subject<string>();
subject.next('Coffee'); // Nobody gets this
const customer1 = subject.subscribe(order => console.log(order));
subject.next('Tea'); // customer1 gets 'Tea'

// BehaviorSubject: Get the last order when you arrive (YOU USE THIS!)
const behavior = new BehaviorSubject<string>('Coffee');
const customer2 = behavior.subscribe(order => console.log(order)); // Gets 'Coffee' immediately!
behavior.next('Tea'); // customer2 gets 'Tea'

// ReplaySubject: Get last N orders when you arrive
const replay = new ReplaySubject<string>(2); // Remember last 2
replay.next('Coffee');
replay.next('Tea');
const customer3 = replay.subscribe(order => console.log(order)); // Gets both 'Coffee' and 'Tea'
```

### 7. Dependency Injection (How Services are Shared)

```typescript
// Service - created ONCE and shared everywhere
@Injectable({
  providedIn: 'root' // Singleton - only one instance
})
export class StockService {
  private holdings = [];
}

// Both components get THE SAME service instance
export class Component1 {
  constructor(private stockService: StockService) {}
  addHolding() {
    this.stockService.addHolding({...});
  }
}

export class Component2 {
  constructor(private stockService: StockService) {} // Same instance!
  getHoldings() {
    return this.stockService.holdings$; // Sees the holding from Component1
  }
}
```

### 8. Lifecycle Hooks (Component Life Stages)

```typescript
export class StockComponent {
  // 1. ngOnInit - "Component just born, set up your stuff"
  ngOnInit() {
    this.loadStocks(); // Load data once
  }

  // 2. ngOnChanges - "Your @Input changed"
  ngOnChanges(changes: SimpleChanges) {
    if (changes['stockSymbol']) {
      this.loadStockDetails();
    }
  }

  // 3. ngAfterViewInit - "Your HTML is ready"
  ngAfterViewInit() {
    this.chart.render(); // Now safe to manipulate DOM
  }

  // 4. ngOnDestroy - "Component about to die, clean up!"
  ngOnDestroy() {
    this.subscription.unsubscribe(); // Prevent memory leaks
  }
}
```

### 9. async Pipe (Automatic Subscription)

```typescript
// Manual way (BAD - memory leak if you forget to unsubscribe)
export class StockComponent {
  stocks: Stock[];
  subscription: Subscription;

  ngOnInit() {
    this.subscription = this.stockService.stocks$.subscribe(
      stocks => this.stocks = stocks
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Must remember this!
  }
}
```

```html
<!-- Template -->
<div *ngFor="let stock of stocks">{{stock.name}}</div>
```

```typescript
// Async pipe way (GOOD - auto cleanup!)
export class StockComponent {
  stocks$ = this.stockService.stocks$; // Just expose the observable
}
```

```html
<!-- Template - pipe handles subscribe/unsubscribe -->
<div *ngFor="let stock of stocks$ | async">{{stock.name}}</div>
```

### 10. Testing Simple Example

```typescript
// Your calculation function
calculateTotalValue(holdings: Holding[]): number {
  return holdings.reduce((total, h) => total + (h.shares * h.quantity), 0);
}

// Test it
describe('StockService', () => {
  it('should calculate total value correctly', () => {
    const holdings = [
      { symbol: 'AAPL', shares: 10, quantity: 150 }, // 10 × 150 = 1500
      { symbol: 'GOOGL', shares: 5, quantity: 100 }   // 5 × 100 = 500
    ];

    const total = service.calculateTotalValue(holdings);
    expect(total).toBe(2000); // 1500 + 500
  });
});
```

### 11. Security Example

```typescript
// HTTP Interceptor - automatically adds auth token to every request
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get token from storage
    const token = localStorage.getItem('authToken');

    if (token) {
      // Clone request and add Authorization header
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}

// Now ALL your HTTP requests automatically include the token!
this.http.get('/api/stocks') // Token added automatically
this.http.post('/api/holdings', data) // Token added automatically
```

### 12. Interview Communication Tips

**If asked something you don't know:**
❌ Don't: "I don't know" (and stop)
✅ Do: "I haven't used that specifically, but I understand the concept is similar to X, which I've used for Y"

**Example:**
"I haven't implemented WebSockets before, but I understand they maintain a persistent connection for real-time updates, similar to how I used RxJS subscriptions to keep my stock data reactive in this project."

**Talking about your code:**
- Focus on WHY you made decisions
- Acknowledge trade-offs honestly
- Show you can think about scale even if you didn't implement it

---

## Frontend System Design Questions

### Scalability & Performance

**Q: How would you handle millions of concurrent users accessing stock data?**
- Implement CDN for static assets
- Add service workers for offline caching
- Use Redis for caching frequently accessed stock data
- Implement WebSocket connections for real-time updates instead of polling
- Add rate limiting on client side to prevent API abuse
- Consider virtual scrolling for large lists (already using Ionic's virtual scroll)
- Implement lazy loading for routes and components

**Q: How would you optimize the app for slow network conditions?**
- Implement optimistic UI updates
- Add request debouncing/throttling (already doing with search)
- Cache stock data with stale-while-revalidate strategy
- Compress API responses (gzip/brotli)
- Implement progressive image loading
- Show skeleton screens instead of loading spinners
- Add offline mode with service workers

**Q: How would you handle real-time stock price updates for thousands of stocks?**
- Use WebSockets instead of HTTP polling
- Implement Server-Sent Events (SSE) for one-way updates
- Subscribe only to visible/watchlist stocks
- Batch updates and apply them in requestAnimationFrame
- Use virtual scrolling to render only visible items
- Implement delta updates (only changed values)

### Architecture & Patterns

**Q: Why didn't you use a state management library like NgRx?**
Current approach:
- App is small with limited shared state
- BehaviorSubject provides reactive state with minimal overhead
- Reduces bundle size and complexity
- Easier to understand for new developers

When NgRx makes sense:
- Complex state interactions across many components
- Need for time-travel debugging
- Large team needing enforced patterns
- Heavy async side effects requiring sophisticated orchestration

**Q: How would you refactor this app for a larger team?**
- Introduce NgRx for predictable state management
- Implement feature modules with lazy loading
- Add strict TypeScript config
- Implement Nx monorepo for code sharing
- Add comprehensive E2E tests (Playwright/Cypress)
- Implement design system with Storybook
- Add code ownership with CODEOWNERS file
- Implement conventional commits and semantic versioning

**Q: How would you structure the app if it grew to 50+ features?**
```
src/
├── core/                 # Singleton services, guards, interceptors
├── shared/               # Shared components, directives, pipes
├── features/
│   ├── stocks/
│   │   ├── state/       # NgRx store, effects, selectors
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   └── stocks.module.ts
│   ├── portfolio/
│   ├── analytics/
│   └── ...
├── layouts/             # App shells, headers, footers
└── app.module.ts
```

### Data Management

**Q: How would you handle data consistency across tabs?**
- Use BroadcastChannel API for cross-tab communication
- Implement SharedWorker for shared state
- Use localStorage events to sync state
- Consider IndexedDB for larger datasets

**Q: How would you implement undo/redo functionality?**
- Implement Command pattern
- Store action history in array
- Use Immer for immutable state updates
- Consider event sourcing for complex scenarios

## Ionic-Specific Questions

### Mobile Development

**Q: Why did you choose Ionic over React Native or Flutter?**
Advantages:
- Single codebase for web + mobile
- Uses web technologies (Angular, already our stack)
- Access to native features via Capacitor
- Easier for web developers to adopt
- Progressive Web App capabilities

Trade-offs:
- Performance not as good as native (React Native/Flutter)
- UI might not feel 100% native
- Limited access to some platform-specific features

**Q: How would you optimize Ionic app performance?**
- Enable production mode
- Use Ionic's virtual scrolling for large lists
- Implement lazy loading for pages
- Optimize images (WebP, lazy loading)
- Use trackBy in *ngFor
- Minimize DOM manipulation
- Use OnPush change detection strategy
- Profile with Chrome DevTools
- Use Web Workers for heavy computations

**Q: How would you handle native device features?**
Use Capacitor plugins:
```typescript
// Camera
import { Camera, CameraResultType } from '@capacitor/camera';

// Local notifications
import { LocalNotifications } from '@capacitor/local-notifications';

// Haptics
import { Haptics } from '@capacitor/haptics';

// Biometrics
import { BiometricAuth } from '@capacitor/biometric-auth';
```

**Q: How do you handle different screen sizes and orientations?**
- Use Ionic's responsive grid system
- Implement CSS media queries
- Use Ionic's breakpoint utilities
- Test on multiple devices/orientations
- Consider tablet-specific layouts (split-pane)

### Deployment & Distribution

**Q: How would you deploy this to iOS and Android?**
```bash
# Add platforms
ionic capacitor add ios
ionic capacitor add android

# Build web assets
ionic build --prod

# Sync to native projects
ionic capacitor sync

# Open in native IDE
ionic capacitor open ios
ionic capacitor open android
```

Then:
- iOS: Xcode → Archive → Upload to App Store Connect
- Android: Android Studio → Generate Signed APK/Bundle → Upload to Play Console

**Q: How would you implement OTA (Over-The-Air) updates?**
- Use Ionic Appflow or Capacitor Live Updates
- Implement CodePush alternative
- Update web assets without app store approval
- Native code changes still require store updates

## Angular-Specific Questions

### Core Concepts

**Q: Explain Angular's change detection. How would you optimize it?**
- Zone.js triggers change detection on async events
- Default strategy checks entire component tree
- OnPush only checks when @Input changes or events fire

Optimization:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockListComponent {
  // Use immutable data patterns
  // Manually trigger with ChangeDetectorRef when needed
}
```

**Q: What's the difference between Subject, BehaviorSubject, and ReplaySubject?**
- **Subject**: No initial value, only emits new values
- **BehaviorSubject**: Has initial value, emits last value to new subscribers (used in your app)
- **ReplaySubject**: Replays N previous values to new subscribers
- **AsyncSubject**: Only emits last value when completed

**Q: How does dependency injection work in Angular?**
- Hierarchical injector tree
- Providers at module, component, or directive level
- Services are singletons by default (providedIn: 'root')
- Can create multiple instances at component level

**Q: Explain Angular's lifecycle hooks.**
- ngOnChanges: When @Input changes
- ngOnInit: Component initialization (used for setup)
- ngDoCheck: Custom change detection
- ngAfterViewInit: After view initialized
- ngOnDestroy: Cleanup (unsubscribe observables)

### RxJS & Reactive Programming

**Q: Why use async pipe instead of manual subscription?**
```typescript
// Manual (need to unsubscribe)
ngOnInit() {
  this.subscription = this.stocks$.subscribe(s => this.stocks = s);
}
ngOnDestroy() {
  this.subscription.unsubscribe();
}

// Async pipe (automatic cleanup)
<ion-list>
  <ion-item *ngFor="let stock of stocks$ | async">
```

**Q: Explain common RxJS operators you'd use.**
- **map**: Transform values
- **filter**: Filter values based on condition
- **switchMap**: Cancel previous, switch to new observable (used in search)
- **debounceTime**: Wait for pause in events (used in search)
- **combineLatest**: Combine multiple observables
- **shareReplay**: Share and cache observable results
- **catchError**: Handle errors gracefully
- **retry**: Retry failed requests

**Q: How would you handle multiple API calls in parallel?**
```typescript
forkJoin({
  stocks: this.http.get('/api/stocks'),
  user: this.http.get('/api/user'),
  settings: this.http.get('/api/settings')
}).subscribe(({ stocks, user, settings }) => {
  // All completed
});
```

### Testing

**Q: How would you test this application?**
Unit tests:
```typescript
describe('StockService', () => {
  it('should calculate total shares correctly', () => {
    const holdings = [
      { shares: 10, quantity: 100 },
      { shares: 5, quantity: 200 }
    ];
    expect(service.calculateTotal(holdings)).toBe(2000);
  });
});
```

Integration tests:
- Test component + service interaction
- Mock HTTP calls with HttpClientTestingModule

E2E tests:
```typescript
// Cypress/Playwright
it('should add stock to watchlist', () => {
  cy.visit('/stocks');
  cy.get('[data-test="search"]').type('AAPL');
  cy.contains('Apple Inc.').click();
  cy.get('[data-test="add-to-watchlist"]').click();
  cy.get('[data-test="watchlist"]').should('contain', 'AAPL');
});
```

### Security

**Q: How would you secure this application?**
- Implement JWT authentication
- Add HTTP interceptor for auth tokens
- Implement route guards (AuthGuard)
- Sanitize user inputs (Angular does by default)
- Use HTTPS only
- Implement CSRF protection
- Add Content Security Policy headers
- Validate on backend (never trust client)
- Store sensitive data securely (Capacitor SecureStorage)

**Q: How would you handle authentication?**
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

## Your Implementation - Defense Questions

### Q: Why use BehaviorSubject instead of Signals (Angular 16+)?
- Project started with Angular's older APIs
- BehaviorSubject is well-understood and battle-tested
- Signals would be better for new projects (simpler, better performance)

Migration path:
```typescript
// Current
private stocksSubject = new BehaviorSubject<Stock[]>([]);
stocks$ = this.stocksSubject.asObservable();

// With Signals
stocks = signal<Stock[]>([]);
// Components can directly read: stocks()
```

### Q: Why calculate totals in the service instead of a pipe?
- Calculations are state transformations, not view transformations
- Allows reuse across multiple components
- Easier to test business logic in isolation
- Pipes should be pure view transforms

### Q: How would you add error handling?
```typescript
// Service
getStocks(): Observable<Stock[]> {
  return this.http.get<Stock[]>('/api/stocks').pipe(
    retry(3),
    catchError(error => {
      this.errorHandler.handle(error);
      return of([]); // Return empty array as fallback
    })
  );
}

// Component
this.stockService.getStocks().subscribe({
  next: stocks => this.stocks = stocks,
  error: err => this.showError(err),
  complete: () => this.loading = false
});
```

### Q: How would you implement infinite scroll?
```typescript
<ion-infinite-scroll (ionInfinite)="loadMore($event)">
  <ion-infinite-scroll-content></ion-infinite-scroll-content>
</ion-infinite-scroll>

loadMore(event: any) {
  this.stockService.loadMoreStocks().subscribe(() => {
    event.target.complete();
  });
}
```

## Behavioral Questions

### Technical Decisions

**Q: Tell me about a time you had to make a trade-off in your code.**
Your example: Chose BehaviorSubject over NgRx
- Reason: App complexity didn't justify NgRx overhead
- Trade-off: Less structure, but simpler and faster to implement
- Result: Delivered working app quickly, can migrate later if needed

**Q: How do you stay updated with Angular/Ionic changes?**
- Follow Angular blog and changelogs
- Watch Angular community standups
- Read Ionic documentation and release notes
- Follow key developers on Twitter/GitHub
- Participate in forums/Discord
- Experiment with new features in side projects

### Problem Solving

**Q: Describe your debugging process.**
1. Reproduce the issue consistently
2. Check console for errors
3. Use debugger/breakpoints
4. Check network tab for API issues
5. Verify data flow with RxJS tap operator
6. Isolate the problem (binary search approach)
7. Review recent changes (git diff)
8. Search documentation/Stack Overflow
9. Ask teammates/community

**Q: How do you approach learning new technologies?**
1. Read official documentation first
2. Build small proof-of-concept
3. Follow tutorials/courses
4. Read source code of popular libraries
5. Build real project to practice
6. Join community forums
7. Teach others (write blog/give talks)

## Questions to Ask Them

### Technical
- What's your tech stack beyond Angular/Ionic?
- How do you handle state management at scale?
- What's your deployment process?
- How do you ensure app performance?
- What testing strategies do you use?

### Team & Process
- What does a typical sprint look like?
- How do you handle technical debt?
- What's your code review process?
- How do you onboard new developers?
- What's the biggest technical challenge your team faces?

### Growth
- What learning opportunities are available?
- How do you support professional development?
- What does career growth look like here?

## Key Takeaways

**Your Strengths:**
- Clean, readable code structure
- Good use of TypeScript types
- Proper reactive patterns with RxJS
- Functional approach to calculations
- Reasonable architectural decisions for app size

**Areas to Emphasize:**
- Made pragmatic choices (BehaviorSubject vs NgRx)
- Implemented proper search debouncing
- Separated concerns (service/component)
- Used Ionic components effectively
- Code is testable and maintainable

**Be Honest About:**
- Limited Ionic/mobile experience (but show eagerness to learn)
- Could add more error handling
- Would use NgRx for larger apps
- Testing could be more comprehensive

**Confidence Builders:**
- You understand the fundamentals well
- Your code is production-quality for this app size
- You can articulate trade-offs clearly
- You know when to add complexity vs keep it simple