# Implementation Details

## Architecture and Project Structure

### Atomic Design Pattern

The project follows the Atomic Design methodology for component organization:

```typescript path=/Users/gentle/Projects/Interview - take home tests/stake-test/stake-ionic-app/src start=null
src/
  app/
    components/
      atoms/              # Basic building blocks
        button/           # Base button component
        chip/             # Price change indicator
        input/            # Base input component
        toaster/          # Toast notifications
        index.ts          # Barrel exports

      molecules/          # Combinations of atoms
        card/             # Base card component
        main-price/       # Price display with formatting
        stock-avatar/     # Stock logo/symbol display
        stock-card/       # Stock display card
        swipe-button/     # Custom swipe to confirm button
        index.ts          # Barrel exports

      organisms/          # Complex components
        holdings-list/    # Portfolio holdings display
        order-modal/      # Stock purchase modal
        search-bar/       # Search input with results
        trending-stocks/  # Trending stocks carousel
        index.ts          # Barrel exports

      index.ts            # Main component exports

    pages/                # Full page components
      discover/           # Search and discovery page
      invest/             # Main dashboard/portfolio page

    tabs/                 # Ionic Tab navigation container
      tabs.page.ts        # Main tab container
      tabs.routes.ts      # Tab routing configuration

    core/                 # Business logic and services
      constants/          # Application constants
        app.constants.ts  # App-wide constants

      interfaces/         # TypeScript interfaces
        index.ts          # Interface exports
        portfolio.interface.ts
        stock.interface.ts

      services/           # Business logic services
        error-handler.service.ts
        loading.service.ts
        local-storage.service.ts # LocalStorage wrapper service storing recent searches
        mock-data.service.ts # Provides mock stock/portfolio data
        modal.service.ts
        portfolio.service.ts

    app.component.ts     # Root component
    app.routes.ts        # Application routing

  assets/                # Static assets
    icon/
      brand/             # Company logos (figma.svg, airbnb.svg, etc.)
      arrow.svg
      circle-dollar.svg
      search.svg

  theme/                 # Styling
    variables.scss       # CSS custom properties and theming (not used with Tailwind)

  global.scss            # Global styles
  main.ts               # Application bootstrap
```

This structure was chosen because:

- Promotes reusability and consistency
- Makes components easy to find and maintain
- Scales well as the application grows
- Facilitates component-driven development
- Matches the design system approach

### Code Quality Tools

#### Husky Hooks

Pre-commit and pre-push hooks are configured to:

- Run linting before commits
- Run tests before pushing
- Ensure consistent code style
- Prevent broken code from reaching the repository

#### ESLint and Prettier

- Strict TypeScript rules enabled
- Consistent code formatting
- Angular-specific rules
- Import ordering rules
- Helps maintain code quality across the team

## Features and User Experience

### Main Flow

1. **Dashboard/Invest Page**
   - Displays total equity and day's performance (Just thought I'd add this in there too)
   - Shows current holdings with real-time updates (non clickable but we could add the ability to click and open the order modal if needed)
   - Lists trending stocks for quick access (clickable to open order modal)

2. **Discover Section**
   - Search functionality
     - Search input for finding stocks (Keyboard navigation supported for accessibility)
     - Recent searches history
     - Clear search history option (on focus of input)
   - Top Volume Stocks
     - Shows top 3 stocks by trading volume
     - Each stock shows:
       - Company logo and symbol
       - Current price
       - Daily change percentage
   - Search Results
     - Dynamic filtering as user types
     - Displays matched stocks with relevant details
     - Shows "No results found" state when applicable

3. **Holdings Section**
   - Current portfolio holdings
   - Each holding shows:
     - Stock symbol and shares owned
     - Current price
     - Performance metrics
   - Non-clickable by design to prevent accidental orders
   - Updates automatically with new purchases

### Order Flow

1. **Stock Selection**
   - Click on any trending stock card
   - Opens the order modal (bottom sheet style)
   - Displays current stock price and symbol

2. **Order Modal**
   - Amount-based investment entry
     - Users enter desired investment amount
     - Share quantity auto-calculated based on current price
     - Example: $500 in FIG ($131.04) = 3.8156 shares
   - Real-time updates
     - Share calculation updates as amount changes
     - Clear validation feedback
   - Swipe-to-buy mechanism
     - Ionic esture-based confirmation/form submit (Prevents accidental submissions)
   - Clean state
     - Form resets on each open

### Portfolio Management

#### Value Calculations

- Total Equity: Sums up current value of all holdings
- Purchase Processing: Adds new purchase value to existing equity
- Day Change: Calculated per holding based on stock's daily change
- Change Percentage: Properly calculated against base value

```typescript
// Example of purchase value calculation
const purchaseValue = stock.price * quantity;
currentPortfolio.totalEquity += purchaseValue;

// Day change calculation
currentPortfolio.dayChange = holdings.reduce(
  (sum, holding) => sum + holding.stock.change * holding.quantity,
  0
);
```

#### Validation Rules

- **Purchase Amount**
  - Minimum: $0.01
  - Maximum: $1,000,000
  - Validates total purchase value rather than share quantity

```typescript
if (purchaseValue < 0.01 || purchaseValue > 1000000) {
  throw new Error('Purchase amount must be between $0.01 and $1,000,000');
}
```

### State Management

#### Portfolio Service

- Maintains portfolio state using `BehaviorSubject<Portfolio>`
- Handles all portfolio calculations and updates
- Preserves initial mock data while allowing new purchases

#### Modal Service

- Controls order modal visibility
- Manages selected stock state
- Ensures clean state between sessions

### Data Structure

#### Stock Holding

```typescript
interface StockHolding {
  stock: Stock;
  quantity: number;
  averagePrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}
```

#### Portfolio

```typescript
interface Portfolio {
  totalEquity: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: StockHolding[];
}
```

## Technical Decisions

### Precision Handling

- Share quantities displayed to 4 decimal places
- Currency values shown with 2 decimal places
- Percentages displayed with 1 decimal place

### Form Management

- Reactive forms for validation and state management
- Auto-calculation of shares based on amount input
- Form reset on modal open for clean state

### Portfolio Updates

- Atomic updates to maintain data consistency
- Proper calculation of averages for existing holdings
- Small initial gain (0.01%) for new holdings for visual feedback

## Future Improvements

1. **Real-time Data Integration**
   - Replace mock data with live market feeds
   - Implement WebSocket for price updates
   - Add real-time portfolio valuation

2. **Enhanced Validation**
   - Add buying power validation
   - Implement market hours trading restrictions
   - Add order types (limit, stop, etc.)

3. **User Experience**
   - Add confirmation dialog for large orders
   - Implement order preview with fees
   - Add portfolio performance charts

4. **Portfolio Management**
   - Add selling functionality
   - Implement position averaging
   - Add portfolio analytics

## Testing Considerations

### Unit Tests Needed

- Portfolio value calculations
- Order validation logic
- Share quantity calculations
- State management

### Integration Tests Needed

- Order flow completion
- Portfolio updates
- Modal interactions
- Form validation

## Known Limitations

1. Mock data only - no real market integration
2. Limited order types (market orders only)
3. No selling functionality
4. Basic portfolio analytics
5. No real-time price updates

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Run tests: `npm test`

## Code Review Notes

Key areas to review:

1. Portfolio calculation logic in `PortfolioService`
2. Order form handling in `OrderModalComponent`
3. State management implementation
4. Mock data structure and usage
5. Input validation and error handling
