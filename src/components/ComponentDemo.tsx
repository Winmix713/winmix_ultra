import { useState } from 'react'
import CSVUploader from './CSVUploader'
import PredictionSettings from './PredictionSettings'
import { UploadResult, PredictionSettings as SettingsType } from '@/types'

/**
 * Demo component showcasing both Phase I-B and I-C components
 * This demonstrates the integration and usage of both components
 */
export default function ComponentDemo() {
  const [demoMode, setDemoMode] = useState<'both' | 'upload' | 'settings'>('both')
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [currentSettings, setCurrentSettings] = useState<SettingsType | null>(null)

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResults(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 results
  }

  const handleSettingsChange = (settings: SettingsType) => {
    setCurrentSettings(settings)
  }

  const generateSampleCSV = () => {
    const sampleData = [
      'home_team,away_team,score_home,score_away,score_home_ht,score_away_ht,date',
      'Arsenal,Chelsea,2,1,1,0,2024-01-15',
      'Liverpool,Manchester City,3,1,2,1,2024-01-16',
      'Tottenham,Manchester United,1,2,0,1,2024-01-17',
      'Brighton,Aston Villa,2,2,1,1,2024-01-18',
      'West Ham,Newcastle,0,3,0,2,2024-01-19'
    ].join('\n')

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample-matches.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Component Demo - Phase I-B & I-C
              </h1>
              <p className="text-sm text-gray-500">
                Interactive demonstration of CSVUploader and PredictionSettings components
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={generateSampleCSV}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                📥 Download Sample CSV
              </button>
              
              <select
                value={demoMode}
                onChange={(e) => setDemoMode(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="both">Both Components</option>
                <option value="upload">CSV Upload Only</option>
                <option value="settings">Settings Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Component Display */}
      <div className="py-8">
        {(demoMode === 'both' || demoMode === 'upload') && (
          <div className="mb-12">
            <div className="max-w-4xl mx-auto px-6 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Phase I-B: CSVUploader Component
                </h2>
                <p className="text-blue-800 text-sm">
                  Upload CSV files with match data. Features drag & drop, validation, 
                  real-time preview, and batch database insertion with progress tracking.
                </p>
              </div>
            </div>
            
            <CSVUploader onUploadComplete={handleUploadComplete} />
            
            {/* Upload Results Summary */}
            {uploadResults.length > 0 && (
              <div className="max-w-4xl mx-auto px-6 mt-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Upload Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          result.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className={`font-medium ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {result.success ? '✅' : '❌'} {result.processed} matches
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {result.errors.length} errors
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(demoMode === 'both' || demoMode === 'settings') && (
          <div>
            <div className="max-w-6xl mx-auto px-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-900 mb-2">
                  Phase I-C: PredictionSettings Component
                </h2>
                <p className="text-green-800 text-sm">
                  Configure prediction algorithm parameters with live preview. 
                  Features real-time charts, settings impact analysis, and auto-save functionality.
                </p>
              </div>
            </div>
            
            <PredictionSettings onSettingsChange={handleSettingsChange} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">Components Loaded</span>
              </div>
              
              <div className="text-gray-500">
                Uploads: {uploadResults.filter(r => r.success).length} successful
              </div>
              
              {currentSettings && (
                <div className="text-gray-500">
                  Settings: Recent {(currentSettings.recent_weight * 100).toFixed(0)}%, 
                  Home +{currentSettings.home_advantage.toFixed(1)}, 
                  Goal ×{currentSettings.goal_multiplier.toFixed(1)}
                </div>
              )}
            </div>
            
            <div className="text-gray-400">
              Demo Mode: {demoMode.charAt(0).toUpperCase() + demoMode.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
