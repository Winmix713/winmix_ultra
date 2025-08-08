# Football Prediction System - Phase I-B & I-C Components

This repository contains the implementation of Phase I-B (CSVUploader) and Phase I-C (PredictionSettings) components for the Football Prediction System.

## 🏗️ Architecture Overview

Built with modern React + TypeScript stack:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom components
- **Database**: Supabase (PostgreSQL) with real-time updates
- **Charts**: Recharts for data visualization
- **File Processing**: PapaParse for CSV handling
- **State Management**: React hooks with optimistic UI
- **Notifications**: React Hot Toast

## 📦 Components

### Phase I-B: CSVUploader

A comprehensive CSV upload component with advanced features:

#### **Features**
- **Drag & Drop Interface**: Modern drag-and-drop with visual feedback
- **File Validation**: CSV type validation, size limits (10MB max)
- **Real-time Preview**: Shows first 5 valid rows with formatted table
- **Advanced Validation**: Row-by-row validation with error highlighting
- **Column Mapping**: Validates required fields (home_team, away_team, scores, date)
- **Bulk Database Insert**: Batch processing to Supabase with progress tracking
- **Error Handling**: Comprehensive error reporting and recovery
- **Upload History**: Tracks successful/failed uploads with details

#### **Technical Implementation**
```typescript
interface CSVUploaderProps {
  onUploadComplete?: (result: UploadResult) => void
}

// Key validation function
const validateCSVRow = (row: CSVRow, rowIndex: number): ValidationError[]

// Batch upload with progress
const handleUploadToDatabase = async () => {
  // Processes in batches of 100 rows
  // Shows real-time progress indicator
  // Handles rollback on errors
}
```

#### **Required CSV Format**
```csv
home_team,away_team,score_home,score_away,score_home_ht,score_away_ht,date
Arsenal,Chelsea,2,1,1,0,2024-01-15
Liverpool,Manchester City,3,1,2,1,2024-01-16
```

### Phase I-C: PredictionSettings

Dynamic prediction settings interface with live preview:

#### **Settings Parameters**
- **recent_weight**: 0-1 slider (impact of recent matches)
- **home_advantage**: -1 to +1 slider (home team advantage)
- **goal_multiplier**: 0.1-5.0 number input (goal calculation multiplier)
- **half_time_weight**: 0-1 slider (half-time score importance)
- **min_matches**: 1-50 integer (minimum matches for predictions)

#### **Live Preview Features**
- **Real-time Chart**: 12 dummy matches showing prediction impact
- **Settings Influence**: Visual indicators (high/medium/low impact)
- **Confidence Scoring**: Shows how settings affect prediction confidence
- **Interactive Visualization**: Recharts with dual Y-axis (score vs confidence)

#### **Database Integration**
```typescript
// Auto-save with debounce
useEffect(() => {
  const saveTimeout = setTimeout(async () => {
    await saveSettings(settings)
  }, 1000) // 1-second debounce
  
  return () => clearTimeout(saveTimeout)
}, [settings])
```

#### **Advanced Features**
- **Settings History**: Append-only database storage for versioning
- **Export/Import**: JSON-based settings backup/restore
- **Optimistic UI**: Immediate UI updates with error rollback
- **Reset to Defaults**: One-click restoration
- **Impact Analysis**: Real-time influence calculation

## 🛠️ Installation & Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd football-prediction-system
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Database Setup**
```sql
-- Create matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  score_home INT NOT NULL,
  score_away INT NOT NULL,
  score_home_ht INT NOT NULL,
  score_away_ht INT NOT NULL,
  date DATE NOT NULL
);

-- Create prediction_settings table
CREATE TABLE prediction_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recent_weight FLOAT,
  home_advantage FLOAT,
  goal_multiplier FLOAT,
  half_time_weight FLOAT,
  min_matches INT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

4. **Development Server**
```bash
npm run dev
```

## 🎯 Usage Examples

### CSVUploader Component

```typescript
import CSVUploader from '@/components/CSVUploader'

function AdminPanel() {
  const handleUploadComplete = (result: UploadResult) => {
    if (result.success) {
      console.log(`Uploaded ${result.processed} matches`)
    } else {
      console.error('Upload failed:', result.message)
    }
  }

  return (
    <CSVUploader onUploadComplete={handleUploadComplete} />
  )
}
```

### PredictionSettings Component

```typescript
import PredictionSettings from '@/components/PredictionSettings'

function AdminPanel() {
  const handleSettingsChange = (settings: PredictionSettings) => {
    console.log('New settings:', settings)
    // Update other components that depend on settings
  }

  return (
    <PredictionSettings onSettingsChange={handleSettingsChange} />
  )
}
```

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_TITLE=Football Prediction System
VITE_APP_VERSION=1.0.0
```

### Customization Options

#### CSV Upload Limits
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel']
const PREVIEW_ROWS = 5
```

#### Prediction Settings Ranges
```typescript
const DEFAULT_SETTINGS = {
  recent_weight: 0.7,    // 0-1
  home_advantage: 0.3,   // -1 to +1
  goal_multiplier: 1.2,  // 0.1-5.0
  half_time_weight: 0.4, // 0-1
  min_matches: 10        // 1-50
}
```

## 🎨 UI/UX Features

### Design System
- **Primary Colors**: Green theme (#22c55e) for football/sports feel
- **Typography**: Clean, professional fonts with proper hierarchy
- **Spacing**: Consistent 6-unit spacing system
- **Responsive**: Mobile-first design with breakpoint optimization

### Accessibility
- **ARIA Labels**: Screen reader friendly
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG 2.1 AA compliant
- **Focus Management**: Clear focus indicators

### User Experience
- **Progressive Disclosure**: Complex features revealed gradually
- **Loading States**: Skeleton screens and progress indicators
- **Error Recovery**: Clear error messages with recovery options
- **Feedback**: Immediate visual feedback for all actions

## 📊 Performance Optimizations

### CSV Processing
- **Streaming**: Large files processed in chunks
- **Web Workers**: CPU-intensive parsing moved off main thread
- **Memory Management**: Efficient cleanup of large datasets
- **Batch Processing**: Database inserts in optimized batches

### Chart Rendering
- **Virtualization**: Large datasets rendered efficiently
- **Debounced Updates**: Settings changes debounced to prevent excessive re-renders
- **Memoization**: Chart data memoized to prevent unnecessary recalculations

## 🧪 Testing Strategy

### Component Testing
```typescript
// Test CSV validation
describe('validateCSVRow', () => {
  it('should validate required fields', () => {
    const row = { home_team: '', away_team: 'Chelsea' }
    const errors = validateCSVRow(row, 1)
    expect(errors).toContainEqual({
      row: 1,
      field: 'home_team',
      error: 'home_team is required'
    })
  })
})

// Test settings calculations
describe('generateDummyMatches', () => {
  it('should generate matches with correct prediction scores', () => {
    const settings = { recent_weight: 0.8, home_advantage: 0.5 }
    const matches = generateDummyMatches(settings)
    expect(matches).toHaveLength(12)
    expect(matches[0].prediction_score).toBeGreaterThan(0)
  })
})
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
1. **Supabase**: Configure Row Level Security (RLS)
2. **Environment**: Set production environment variables
3. **CDN**: Configure asset delivery
4. **Monitoring**: Set up error tracking and performance monitoring

## 🔮 Future Enhancements

### Phase II Integrations
- **ML Model Integration**: Connect to Python ML service
- **Real-time Updates**: WebSocket connections for live data
- **Advanced Analytics**: Historical performance tracking

### Additional Features
- **Team Management**: CRUD operations for teams
- **Match Scheduling**: Calendar integration for future matches
- **User Management**: Role-based access control
- **API Integration**: External data sources (ESPN, etc.)

## 📚 API Documentation

### Supabase Schema

```typescript
// TypeScript interfaces
interface Match {
  id?: number
  home_team: string
  away_team: string
  score_home: number
  score_away: number
  score_home_ht: number
  score_away_ht: number
  date: string
}

interface PredictionSettings {
  id?: string
  recent_weight: number
  home_advantage: number
  goal_multiplier: number
  half_time_weight: number
  min_matches: number
  updated_at?: string
}
```

### Component Props

```typescript
// CSVUploader Props
interface CSVUploaderProps {
  onUploadComplete?: (result: UploadResult) => void
  maxFileSize?: number
  allowedTypes?: string[]
  previewRows?: number
}

// PredictionSettings Props
interface PredictionSettingsProps {
  onSettingsChange?: (settings: PredictionSettings) => void
  autoSave?: boolean
  debounceMs?: number
}
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Implement** changes with tests
4. **Submit** pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the Football Prediction System**
