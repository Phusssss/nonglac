# Home Feature

This feature contains all components, services, hooks, and constants related to the home page functionality.

## Structure

```
home/
├── components/     # Home-specific components
│   ├── HomePage.js           # Main home page component (254 lines)
│   ├── CreatePostForm.js     # Post creation form (156 lines)
│   ├── CategoryFilter.js     # Category filtering (73 lines)
│   ├── PostsList.js          # Posts list with pagination (111 lines)
│   ├── RightSidebar.js       # Sidebar with trending topics (147 lines)
│   └── index.js              # Components exports
├── pages/          # Home page wrapper (6 lines)
├── services/       # Home-related API services
├── hooks/          # Custom hooks for home functionality
├── constants/      # Home feature constants
└── index.js        # Feature exports
```

## Components

### Pages
- **Home** - Simple wrapper component that renders HomePage

### Components
- **HomePage** - Main home page component with layout and state management
- **CreatePostForm** - Form for creating new posts with image upload
- **CategoryFilter** - Category filtering buttons with post counts
- **PostsList** - Posts list with loading states and pagination
- **RightSidebar** - Sidebar with weather, prices, trending topics, and top contributors

## Hooks

- **useHomePosts** - Manages posts loading, pagination, and refresh
- **useHomeSearch** - Handles search functionality

## Services

- **homeService** - API services for post CRUD operations and interactions

## Constants

- **HOME_CONSTANTS** - Configuration constants (posts per page, refresh interval, etc.)
- **POST_CATEGORIES** - Available post categories
- **SORT_OPTIONS** - Post sorting options

## Usage

```javascript
// Import the main component
import { Home } from '../features/home';

// Import specific components
import { HomePage, CreatePostForm, CategoryFilter } from '../features/home';

// Import hooks and services
import { useHomePosts, homeService, HOME_CONSTANTS } from '../features/home';
```

## File Size Optimization

All components are kept under 300 lines:
- HomePage: 254 lines
- CreatePostForm: 156 lines  
- RightSidebar: 147 lines
- PostsList: 111 lines
- CategoryFilter: 73 lines
- Home (wrapper): 6 lines

## Dependencies

This feature depends on:
- Shared components from `src/components/`
- Firebase configuration from `src/firebase/`
- Authentication hooks from `src/hooks/`
- Analytics utilities from `src/utils/`