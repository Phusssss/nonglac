# Material-UI to Ant Design Migration Mapping

## Common Components Mapping

### Buttons & Actions
- `Button` (MUI) → `Button` (Antd)
- `IconButton` (MUI) → `Button` with `type="text"` and `icon` prop (Antd)
- `Fab` (MUI) → `Button` with `shape="circle"` (Antd)

### Layout & Containers
- `Box` (MUI) → `div` with Tailwind classes or `Space` (Antd)
- `Paper` (MUI) → `Card` (Antd)
- `Card` (MUI) → `Card` (Antd)
- `CardContent` (MUI) → `Card` body (Antd)
- `Grid` (MUI) → `Row` and `Col` (Antd)

### Typography
- `Typography` (MUI) → `Typography.Title`, `Typography.Text`, `Typography.Paragraph` (Antd)

### Form Controls
- `TextField` (MUI) → `Input` (Antd)
- `Select` (MUI) → `Select` (Antd)
- `MenuItem` (MUI) → `Select.Option` (Antd)
- `FormControl` (MUI) → Form wrapper (Antd)
- `InputLabel` (MUI) → Built into Antd components
- `Autocomplete` (MUI) → `AutoComplete` (Antd)

### Feedback
- `Alert` (MUI) → `Alert` (Antd)
- `CircularProgress` (MUI) → `Spin` (Antd)
- `LinearProgress` (MUI) → `Progress` (Antd)
- `Skeleton` (MUI) → `Skeleton` (Antd)

### Navigation
- `Menu` (MUI) → `Menu` (Antd)
- `MenuItem` (MUI) → `Menu.Item` (Antd)

### Data Display
- `List` (MUI) → `List` (Antd)
- `ListItem` (MUI) → `List.Item` (Antd)
- `ListItemIcon` (MUI) → Icon in `List.Item` (Antd)
- `ListItemText` (MUI) → Text in `List.Item` (Antd)
- `Avatar` (MUI) → `Avatar` (Antd)
- `Chip` (MUI) → `Tag` (Antd)
- `Badge` (MUI) → `Badge` (Antd)

### Overlays
- `Dialog` (MUI) → `Modal` (Antd)
- `DialogTitle` (MUI) → Modal `title` prop (Antd)
- `DialogContent` (MUI) → Modal content (Antd)
- `DialogActions` (MUI) → Modal `footer` prop (Antd)

### Icons
- `@mui/icons-material` → `@ant-design/icons` or `lucide-react`

## Migration Priority
1. **High Priority**: Layout components (Box, Paper, Card, Grid)
2. **Medium Priority**: Form components (TextField, Select, Button)
3. **Low Priority**: Complex components (DataGrid, specialized components)