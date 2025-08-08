 phase1-modern-football-prediction-system-migration-foundation
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/ui/loading-spinner'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
=======
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import CSVUploader from './components/CSVUploader'
import PredictionSettings from './components/PredictionSettings'
import { UploadResult, PredictionSettings as SettingsType } from './types'

type Tab = 'upload' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [uploadHistory, setUploadHistory] = useState<UploadResult[]>([])
  const [currentSettings, setCurrentSettings] = useState<SettingsType | null>(null)

  const handleUploadComplete = (result: UploadResult) => {
    setUploadHistory(prev => [result, ...prev])
  }

  const handleSettingsChange = (settings: SettingsType) => {
    setCurrentSettings(settings)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
        }}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Football Prediction System
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Admin Panel - Phase I-B & I-C Components
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {currentSettings && (
                  <span>
                    Settings: Recent {(currentSettings.recent_weight * 100).toFixed(0)}% • 
                    Home Adv {currentSettings.home_advantage.toFixed(1)} • 
                    Goal Mult {currentSettings.goal_multiplier.toFixed(1)}x
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>CSV Upload</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Prediction Settings</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <CSVUploader onUploadComplete={handleUploadComplete} />
            
            {/* Upload History */}
            {uploadHistory.length > 0 && (
              <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload History</h3>
                  <div className="space-y-3">
                    {uploadHistory.slice(0, 5).map((result, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 ${
                          result.success 
                            ? 'bg-green-50 border-green-400' 
                            : 'bg-red-50 border-red-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-medium ${
                              result.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {result.message}
                            </p>
                            {result.errors.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {result.errors.length} validation errors found
                              </p>
                            )}
                          </div>
                          <span className={`text-sm ${
                            result.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {result.processed} processed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <PredictionSettings onSettingsChange={handleSettingsChange} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              <p>Football Prediction System v1.0.0</p>
              <p>Phase I-B & I-C Components Demo</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Online</span>
              </div>
              <div>
                Database: {currentSettings ? 'Connected' : 'Initializing'}
              </div>
            </div>
          </div>
        </div>
      </footer>
 main
    </div>
  )
}

export default App
