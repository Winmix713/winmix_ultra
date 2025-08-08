# WinMix Football Prediction System - Phase I Foundation

Modern React + Supabase + FastAPI admin panel for the Hungarian football prediction platform winmix.hu.

## 🚀 Overview

This is Phase I of the complete system migration from PHP/JSON to modern stack:
- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Future:** FastAPI + ML Pipeline (Phase II)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Git

## 🛠️ Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the entire content from `supabase-schema.sql`
4. Run the SQL to create all tables, indexes, RLS policies, and triggers
5. Note your project URL and anon key from Settings > API

### 2. Local Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd winmix-admin-panel
npm install
```

2. **Environment configuration:**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=WinMix Admin Panel
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=true
```

3. **Start development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Admin User Setup

To create an admin user:

1. Sign up a user through Supabase Auth UI or manually create in auth.users
2. Run this SQL in Supabase SQL Editor to grant admin role:
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'your-user-uuid-here';
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main header with user info
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── ProtectedRoute.tsx # Auth guard component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication & user management
├── hooks/             # Custom React hooks
│   └── use-toast.ts   # Toast notification system
├── lib/              # Utilities and configurations
│   ├── supabase.ts   # Supabase client & types
│   └── utils.ts      # Helper functions
├── pages/            # Main page components
│   ├── admin/        # Admin panel pages
│   │   ├── Overview.tsx          # Dashboard overview
│   │   ├── MatchUpload.tsx       # CSV upload interface
│   │   ├── PredictionSettings.tsx # ML parameters config
│   │   ├── ModelManagement.tsx   # Model training & versions
│   │   └── SystemLogs.tsx        # Event logs & monitoring
│   ├── Dashboard.tsx # Main admin dashboard layout
│   └── Login.tsx     # Authentication page
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🗄️ Database Schema

### Core Tables

- **matches** - Football match results with full-time and half-time scores
- **prediction_settings** - ML model parameters (weights, thresholds)
- **model_versions** - ML model deployment tracking
- **system_logs** - Audit trail and event logging
- **user_roles** - Admin access control

### Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-only access policies
- Automatic user role creation on signup
- Audit logging for all admin actions

## 🎯 Phase I Features

### ✅ Completed
- [x] Complete Supabase PostgreSQL schema
- [x] React admin panel with responsive design
- [x] Authentication with admin role protection
- [x] CSV match upload with validation
- [x] Prediction settings management
- [x] Model version tracking (UI ready)
- [x] System logs and monitoring
- [x] Dark theme with lime green accents
- [x] Toast notifications system
- [x] Type-safe database operations

### 📊 Admin Panel Pages

1. **Overview** - System statistics and quick actions
2. **Match Upload** - CSV file upload with validation and preview
3. **Prediction Settings** - ML model parameter configuration
4. **Model Management** - Model training and version control
5. **System Logs** - Event monitoring and audit trails

## 🔮 Next Phases

### Phase II - ML Integration
- FastAPI microservice for predictions
- XGBoost/LightGBM model training
- Feature engineering pipeline
- Automated model retraining
- Prediction API endpoints

### Phase III - Advanced Features
- SHAP explainability
- Prediction audit trail
- Data quality monitoring
- Advanced export capabilities
- Performance dashboards

## 🔒 Security

- All admin routes protected by authentication
- Row-level security policies in Supabase
- Admin role verification for sensitive operations
- Audit logging for all user actions
- Input validation and sanitization
- HTTPS enforcement in production

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

## 📖 Development Guidelines

- Follow TypeScript strict mode
- Use shadcn/ui components for consistency
- Implement proper error boundaries
- Add loading states for async operations
- Follow React 18+ best practices
- Maintain responsive design principles
- Write descriptive commit messages

## 🐛 Troubleshooting

### Common Issues

1. **Supabase connection errors:**
   - Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Check network connectivity
   - Ensure RLS policies are correctly applied

2. **Authentication issues:**
   - Verify user has admin role in user_roles table
   - Check if user exists in auth.users
   - Clear browser local storage if needed

3. **Build errors:**
   - Run `npm install` to ensure all dependencies
   - Check TypeScript errors with `npm run type-check`
   - Verify all environment variables are set

## 📞 Support

For questions or issues:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check React/Vite documentation for build issues

## 📄 License

Private project for WinMix Football Prediction System.

---

**Version:** Phase I v1.0.0  
**Last Updated:** August 2024  
**Stack:** React + TypeScript + Supabase + shadcn/ui
