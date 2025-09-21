# Stake Trading App

A modern Ionic Angular application for stock trading and portfolio management, built with Tailwind CSS and comprehensive tooling.

## 🚀 Features

### Trading Features

#### Stock Discovery

Location: `src/app/pages/discover/discover.page.ts`

- Mock stock search functionality (filters static data)
- Recent search history with LocalStorage
- Top volume stocks display (mock data)
- Keyboard navigation in search results

#### Portfolio Management

Location: `src/app/pages/invest/invest.page.ts`

- Current portfolio overview (mock data)
- Static holdings list with calculated values
- Basic performance tracking (simulated)
- Portfolio value calculations

#### Order Processing

Location: `src/app/components/organisms/order-modal/order-modal.component.ts`

- Interactive swipe-to-confirm UI
- Static price display (mock data)
- Basic order validation
- Success/error simulation

### Core Technologies

- **Ionic 8** - Latest Ionic framework with Angular integration
- **Angular 20** - Latest Angular with standalone components
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Strict mode enabled with enhanced type safety
- **Capacitor** - Native runtime for mobile apps

### Development Tools

- **ESLint** - Advanced linting with Angular-specific rules
- **Prettier** - Code formatting with Angular template support
- **Husky** - Git hooks for pre-commit quality checks
- **lint-staged** - Run linters on staged files
- **Angular CDK** - Headless/unstyled component library

### Code Quality

- **Strict TypeScript** - Enhanced type safety and error detection
- **Comprehensive ESLint** - Angular, TypeScript, and accessibility rules
- **Pre-commit Hooks** - Automatic linting and formatting
- **Path Mapping** - Clean import statements with @ aliases

## 📦 Installation

```bash
# Install dependencies
npm install

# Install Ionic CLI globally (if not already installed)
npm install -g @ionic/cli
```

## 🛠️ Development

### Start Development Server

```bash
npm start
# or
ionic serve
```

### Build for Production

```bash
npm run build
# or
ionic build
```

### Code Quality Commands

```bash
# Lint TypeScript and templates
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting without modifying files
npm run format:check
```

### Testing

```bash
npm test
```

## 📱 Mobile Development

### Add Platforms

```bash
# Add iOS platform
ionic capacitor add ios

# Add Android platform
ionic capacitor add android
```

### Build and Run

```bash
# Build and run on iOS
ionic capacitor run ios

# Build and run on Android
ionic capacitor run android
```

## 🎨 Styling

### Tailwind CSS

This project uses Tailwind CSS v4 with custom configuration for Ionic compatibility:

- **Preflight disabled** - Preserves Ionic's CSS reset
- **Custom colors** - Extended palette that works with Ionic themes
- **Responsive utilities** - Full Tailwind responsive system
- **Dark mode support** - Automatic dark mode with Ionic's system

### Usage Example

```html
<div class="max-w-md p-6 mx-auto bg-white shadow-lg rounded-xl">
  <ion-button class="mt-4 bg-primary-600"> Styled Button </ion-button>
</div>
```

## 🔧 Configuration

### TypeScript Paths

The project includes path mapping for cleaner imports:

```typescript
import { SomeService } from '@core/services/some.service';
import { SharedComponent } from '@shared/components/shared.component';
import { FeatureModule } from '@app/feature/feature.module';
```

### ESLint Rules

Comprehensive linting configuration includes:

- Angular-specific rules
- TypeScript strict checking
- Accessibility guidelines
- Code complexity limits
- Import organization

### Pre-commit Hooks

Automatic quality checks run before each commit:

- ESLint with auto-fix
- Prettier formatting
- Staged file processing only

## 📁 Project Structure

```
src/
├── app/
│   ├── core/          # Singleton services, guards, interceptors
│   ├── shared/        # Reusable components, pipes, directives
│   ├── features/      # Feature modules
│   └── ...           # Generated Ionic structure
├── assets/           # Static assets
├── theme/           # Ionic theme variables
└── global.scss      # Global styles with Tailwind imports
```

## 🎯 Best Practices

### Component Development

- Use standalone components by default
- Implement OnPush change detection for performance
- Follow Angular style guide conventions
- Use TypeScript strict mode features

### Styling Approach

- Prefer Tailwind utilities over custom CSS
- Use Ionic components for mobile-specific UI
- Maintain consistent spacing and typography
- Test dark mode compatibility

### Code Quality

- Write self-documenting code with clear naming
- Add JSDoc comments for complex functions
- Keep components focused and single-purpose
- Use Angular CDK for advanced interactions

## 🔍 VS Code Integration

The project includes comprehensive VS Code settings:

- Auto-formatting on save
- ESLint integration with auto-fix
- TypeScript enhanced support
- Tailwind CSS IntelliSense
- Recommended extensions list

## 🚀 Deployment

### Web Deployment

```bash
ionic build --prod
# Deploy the www/ folder to your hosting service
```

### Mobile App Store

```bash
# Build for production
ionic build --prod

# Sync with Capacitor
ionic capacitor sync

# Open in Xcode (iOS)
ionic capacitor open ios

# Open in Android Studio
ionic capacitor open android
```

## 🤝 Contributing

1. Follow the established code style (enforced by ESLint/Prettier)
2. Write meaningful commit messages
3. Test on both web and mobile platforms
4. Ensure all pre-commit hooks pass

## 📄 License

This project is licensed under the MIT License.
