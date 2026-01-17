---
inclusion: always
---

# Design System Rules - Nonglac Social

## UI Framework & Architecture

### Primary Framework
- **Ant Design (antd) v5.27.6** - Main UI component library
- **Tailwind CSS v3.0** - Utility-first CSS framework
- **React 18.2** - Component framework
- **Framer Motion v10.18** - Animation library

### Component Organization
```
src/components/
├── common/          # Shared utility components
├── enhanced/        # Enhanced/wrapper components
├── filters/         # Filter-related components
├── Login/           # Authentication components
├── Registration/    # User registration components
├── marketplace/     # E-commerce components
├── Mission/         # Mission/task components
└── demo/           # Demo/example components
```

## Design System Guidelines

### Component Hierarchy
1. **Ant Design Components** - Use as base components
2. **Enhanced Components** - Wrap antd components with custom logic
3. **Custom Components** - Build only when antd doesn't provide solution

### Styling Approach
- **Primary**: Ant Design's built-in styling and theming
- **Secondary**: Tailwind utilities for spacing, layout, and custom styling
- **Custom CSS**: Only for complex animations or unique designs

### Color System
- Follow Ant Design's color palette and semantic colors
- Use antd's `theme` configuration for brand colors
- Leverage CSS custom properties for consistent theming

### Typography
- Use Ant Design's Typography components (`Typography.Title`, `Typography.Text`, etc.)
- Maintain consistent font hierarchy through antd's predefined sizes
- Apply Tailwind utilities for fine-tuning when needed

### Spacing & Layout
- **Grid System**: Use Ant Design's `Row` and `Col` components
- **Spacing**: Prefer antd's built-in spacing (margins, paddings)
- **Responsive**: Utilize antd's responsive breakpoints
- **Tailwind**: Use for micro-adjustments and utility spacing

### Icons
- **Primary**: `@ant-design/icons` for UI icons
- **Secondary**: `lucide-react` for additional icon needs
- Maintain consistent icon sizing and styling

### Form Components
- Use Ant Design's Form components exclusively
- Leverage antd's validation and form handling
- Apply consistent form layouts and spacing

### Interactive Components
- Buttons: Use antd's Button component with consistent variants
- Inputs: Stick to antd's Input, Select, DatePicker, etc.
- Navigation: Use antd's Menu, Breadcrumb, Pagination components

### Animation Guidelines
- **Framer Motion**: For complex animations and page transitions
- **Ant Design**: Use built-in animations for component states
- Keep animations subtle and performance-conscious

## Component Development Rules

### When Creating New Components
1. **Check Ant Design first** - Use existing antd components when possible
2. **Enhance, don't replace** - Wrap antd components with additional functionality
3. **Follow naming conventions** - Use PascalCase for component names
4. **Maintain consistency** - Follow established patterns in existing components

### File Structure
```javascript
// Component structure example
import { Button, Card, Typography } from 'antd';
import { motion } from 'framer-motion';
import './ComponentName.css'; // Only if custom CSS needed

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <Card className="custom-card">
      <Typography.Title level={3}>Title</Typography.Title>
      <Button type="primary">Action</Button>
    </Card>
  );
};

export default ComponentName;
```

### Props and API Design
- Follow Ant Design's prop naming conventions
- Use TypeScript-style prop documentation
- Maintain backward compatibility when updating components

### Responsive Design
- Mobile-first approach using antd's responsive utilities
- Test on multiple screen sizes
- Use antd's Grid system for layout responsiveness

## Performance Considerations
- **Tree Shaking**: Import antd components individually
- **Bundle Size**: Monitor antd component usage
- **Lazy Loading**: Use React.lazy for large components
- **Image Optimization**: Use OptimizedImage component for media

## Accessibility Standards
- Follow Ant Design's built-in accessibility features
- Ensure proper ARIA labels and roles
- Maintain keyboard navigation support
- Test with screen readers

## Quality Assurance
- **Component Testing**: Test antd component integration
- **Visual Regression**: Compare with design mockups
- **Cross-browser**: Ensure antd compatibility
- **Performance**: Monitor component render performance