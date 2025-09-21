export const APP_CONSTANTS = {
  // UI Constants
  SLIDE_THRESHOLD: 0.8,
  MAX_QUANTITY: 1000,
  MIN_QUANTITY: 1,

  // Animation Durations
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_RECENT_SEARCHES: 5,

  // API Endpoints (for future use)
  API_BASE_URL: 'https://api.stake.com',
  STOCK_QUOTE_ENDPOINT: '/api/v1/stocks/quote',
  PORTFOLIO_ENDPOINT: '/api/v1/portfolio',

  // Local Storage Keys
  STORAGE_KEYS: {
    RECENT_SEARCHES: 'recent_searches',
    PORTFOLIO: 'portfolio',
    USER_PREFERENCES: 'user_preferences',
  },

  // Currency
  DEFAULT_CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',

  // Colors (matching Tailwind config)
  COLORS: {
    POSITIVE: 'figma-green',
    NEGATIVE: 'danger-500',
    NEUTRAL: 'gray-500',
    PRIMARY: 'custom-black',
    SECONDARY: 'white',
  },
} as const;

export const ORDER_CONSTANTS = {
  TYPES: {
    MARKET: 'market',
    LIMIT: 'limit',
  },
  SIDES: {
    BUY: 'buy',
    SELL: 'sell',
  },
  STATUS: {
    PENDING: 'pending',
    EXECUTED: 'executed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  },
} as const;

export const UI_CONSTANTS = {
  BREAKPOINTS: {
    MOBILE: '640px',
    TABLET: '768px',
    DESKTOP: '1024px',
  },
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px',
  },
  BORDER_RADIUS: {
    SM: '4px',
    MD: '8px',
    LG: '16px',
    XL: '24px',
  },
} as const;
