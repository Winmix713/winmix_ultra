import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase, TABLES } from '@/lib/supabase'
import { PredictionSettings as SettingsType, DummyMatch, ChartDataPoint, SettingsInfluence } from '@/types'

interface PredictionSettingsProps {
  onSettingsChange?: (settings: SettingsType) => void
}

const DEFAULT_SETTINGS: SettingsType = {
  recent_weight: 0.7,
  home_advantage: 0.3,
  goal_multiplier: 1.2,
  half_time_weight: 0.4,
  min_matches: 10
}

export default function PredictionSettings({ onSettingsChange }: PredictionSettingsProps) {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [dummyMatches, setDummyMatches] = useState<DummyMatch[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [settingsInfluence, setSettingsInfluence] = useState<SettingsInfluence[]>([])

  // Generate dummy match data based on current settings
  const generateDummyMatches = useCallback((currentSettings: SettingsType): DummyMatch[] => {
    const teams = [
      'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United', 'Tottenham',
      'Newcastle', 'Brighton', 'Aston Villa', 'West Ham', 'Crystal Palace', 'Wolves'
    ]

    const matches: DummyMatch[] = []
    
    for (let i = 0; i < 12; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)]
      let awayTeam = teams[Math.floor(Math.random() * teams.length)]
      while (awayTeam === homeTeam) {
        awayTeam = teams[Math.floor(Math.random() * teams.length)]
      }

      // Simulate prediction score calculation based on settings
      const baseScore = Math.random() * 2 + 1 // Base prediction between 1-3
      const recentForm = (Math.random() - 0.5) * currentSettings.recent_weight
      const homeAdvantage = currentSettings.home_advantage * 0.5
      const goalFactor = currentSettings.goal_multiplier * (Math.random() - 0.5)
      const halfTimeWeight = currentSettings.half_time_weight * (Math.random() - 0.5)
      
      const predictionScore = Math.max(0.1, Math.min(5.0, 
        baseScore + recentForm + homeAdvantage + goalFactor + halfTimeWeight
      ))
      
      const confidence = Math.min(100, Math.max(10, 
        (predictionScore * 25) + (currentSettings.recent_weight * 30)
      ))

      matches.push({
        home_team: homeTeam,
        away_team: awayTeam,
        prediction_score: parseFloat(predictionScore.toFixed(2)),
        confidence: parseFloat(confidence.toFixed(1))
      })
    }

    return matches.sort((a, b) => b.prediction_score - a.prediction_score)
  }, [])

  // Generate chart data for visualization
  const generateChartData = useCallback((matches: DummyMatch[]): ChartDataPoint[] => {
    return matches.map((match) => ({
      name: `${match.home_team.substring(0, 3)} vs ${match.away_team.substring(0, 3)}`,
      prediction_score: match.prediction_score,
      confidence: match.confidence / 100 // Normalize to 0-1 for chart
    }))
  }, [])

  // Calculate settings influence
  const calculateInfluence = useCallback((currentSettings: SettingsType): SettingsInfluence[] => {
    return [
      {
        parameter: 'recent_weight',
        influence: currentSettings.recent_weight > 0.8 ? 'high' : currentSettings.recent_weight > 0.5 ? 'medium' : 'low',
        description: 'Impact of recent match results on predictions'
      },
      {
        parameter: 'home_advantage',
        influence: Math.abs(currentSettings.home_advantage) > 0.5 ? 'high' : Math.abs(currentSettings.home_advantage) > 0.2 ? 'medium' : 'low',
        description: 'Advantage given to home teams'
      },
      {
        parameter: 'goal_multiplier',
        influence: Math.abs(currentSettings.goal_multiplier - 1) > 0.5 ? 'high' : Math.abs(currentSettings.goal_multiplier - 1) > 0.2 ? 'medium' : 'low',
        description: 'Multiplier for goal-based calculations'
      },
      {
        parameter: 'half_time_weight',
        influence: currentSettings.half_time_weight > 0.6 ? 'high' : currentSettings.half_time_weight > 0.3 ? 'medium' : 'low',
        description: 'Weight of half-time scores in predictions'
      },
      {
        parameter: 'min_matches',
        influence: currentSettings.min_matches > 20 ? 'high' : currentSettings.min_matches > 10 ? 'medium' : 'low',
        description: 'Minimum matches required for accurate predictions'
      }
    ]
  }, [])

  // Update dummy data when settings change
  useEffect(() => {
    const matches = generateDummyMatches(settings)
    const chart = generateChartData(matches)
    const influence = calculateInfluence(settings)
    
    setDummyMatches(matches)
    setChartData(chart)
    setSettingsInfluence(influence)
  }, [settings, generateDummyMatches, generateChartData, calculateInfluence])

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.PREDICTION_SETTINGS)
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)

        if (error) throw error

        if (data && data.length > 0) {
          setSettings(data[0])
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Auto-save settings to database with debounce
  useEffect(() => {
    if (isLoading) return

    const saveTimeout = setTimeout(async () => {
      await saveSettings(settings)
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(saveTimeout)
  }, [settings, isLoading])

  const saveSettings = async (settingsToSave: SettingsType) => {
    setIsSaving(true)
    
    try {
      // Insert new settings record (append-only for history)
      const { error } = await supabase
        .from(TABLES.PREDICTION_SETTINGS)
        .insert([settingsToSave])

      if (error) throw error

      onSettingsChange?.(settingsToSave)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
    toast.success('Settings reset to defaults')
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prediction-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Settings exported successfully')
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setSettings({ ...DEFAULT_SETTINGS, ...imported })
        toast.success('Settings imported successfully')
      } catch (error) {
        toast.error('Invalid settings file')
      }
    }
    reader.readAsText(file)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Prediction Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Adjust parameters to fine-tune the prediction algorithm
            {isSaving && <span className="ml-2 text-blue-600">• Saving...</span>}
          </p>
        </div>
        <div className="flex space-x-2">
          <input
            type="file"
            accept="application/json"
            onChange={importSettings}
            className="hidden"
            id="import-settings"
          />
          <label
            htmlFor="import-settings"
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Import
          </label>
          <button
            onClick={exportSettings}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Parameters</h3>
          
          <div className="space-y-6">
            {/* Recent Weight */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Recent Weight</label>
                <span className="text-sm text-gray-500">{(settings.recent_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.recent_weight}
                onChange={(e) => updateSetting('recent_weight', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <p className="text-xs text-gray-500 mt-1">
                How much recent matches influence predictions (0-100%)
              </p>
            </div>

            {/* Home Advantage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Home Advantage</label>
                <span className="text-sm text-gray-500">{settings.home_advantage.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={settings.home_advantage}
                onChange={(e) => updateSetting('home_advantage', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <p className="text-xs text-gray-500 mt-1">
                Advantage/disadvantage for home teams (-1 to +1)
              </p>
            </div>

            {/* Goal Multiplier */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Goal Multiplier</label>
                <span className="text-sm text-gray-500">{settings.goal_multiplier.toFixed(1)}</span>
              </div>
              <input
                type="number"
                min="0.1"
                max="5.0"
                step="0.1"
                value={settings.goal_multiplier}
                onChange={(e) => updateSetting('goal_multiplier', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Multiplier for goal-based calculations (0.1-5.0)
              </p>
            </div>

            {/* Half Time Weight */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Half Time Weight</label>
                <span className="text-sm text-gray-500">{(settings.half_time_weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.half_time_weight}
                onChange={(e) => updateSetting('half_time_weight', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <p className="text-xs text-gray-500 mt-1">
                Weight of half-time scores in predictions (0-100%)
              </p>
            </div>

            {/* Min Matches */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Minimum Matches</label>
                <span className="text-sm text-gray-500">{settings.min_matches}</span>
              </div>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.min_matches}
                onChange={(e) => updateSetting('min_matches', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum matches required for accurate predictions (1-50)
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Live Prediction Preview</h3>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" domain={[0, 5]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'prediction_score' ? value.toFixed(2) : (value * 100).toFixed(1) + '%',
                    name === 'prediction_score' ? 'Prediction Score' : 'Confidence'
                  ]}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="prediction_score" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <span className="inline-block w-3 h-3 bg-primary-500 rounded mr-2"></span>
              Prediction Score (0-5 scale)
            </p>
            <p>
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
              Confidence Level (percentage)
            </p>
          </div>
        </div>
      </div>

      {/* Settings Influence */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Settings Impact Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {settingsInfluence.map((item) => (
            <div key={item.parameter} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 capitalize">
                  {item.parameter.replace('_', ' ')}
                </h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.influence === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : item.influence === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {item.influence}
                </span>
              </div>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dummy Match Results */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Prediction Samples (Based on Current Settings)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyMatches.slice(0, 6).map((match, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{match.home_team}</div>
                  <div className="text-gray-500">vs</div>
                  <div className="font-medium text-gray-900">{match.away_team}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {match.prediction_score}
                  </div>
                  <div className="text-xs text-gray-500">
                    {match.confidence}% conf.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
