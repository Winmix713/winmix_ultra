import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import LoadingSpinner from '../../components/ui/loading-spinner'
import { supabase } from '../../lib/supabase'
import { 
  DatabaseIcon, 
  SettingsIcon, 
  BrainIcon, 
  TrendingUpIcon,
  CalendarIcon,
  UsersIcon
} from 'lucide-react'

interface SystemStats {
  totalMatches: number
  activeSettings: number
  activeModels: number
  lastUpload?: string
}

export default function Overview() {
  const [stats, setStats] = useState<SystemStats>({
    totalMatches: 0,
    activeSettings: 0,
    activeModels: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemStats()
  }, [])

  const loadSystemStats = async () => {
    try {
      // Get total matches
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

      // Get active prediction settings
      const { count: settingsCount } = await supabase
        .from('prediction_settings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get active models
      const { count: modelsCount } = await supabase
        .from('model_versions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get last upload date
      const { data: lastMatch } = await supabase
        .from('matches')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setStats({
        totalMatches: matchCount || 0,
        activeSettings: settingsCount || 0,
        activeModels: modelsCount || 0,
        lastUpload: lastMatch?.created_at
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Összes meccs',
      value: stats.totalMatches.toLocaleString(),
      description: 'Feltöltött meccsek száma',
      icon: DatabaseIcon,
      color: 'text-blue-500'
    },
    {
      title: 'Aktív beállítások',
      value: stats.activeSettings,
      description: 'Prediction paraméterek',
      icon: SettingsIcon,
      color: 'text-green-500'
    },
    {
      title: 'Aktív modellek',
      value: stats.activeModels,
      description: 'ML prediction modellek',
      icon: BrainIcon,
      color: 'text-purple-500'
    },
    {
      title: 'Utolsó feltöltés',
      value: stats.lastUpload 
        ? new Date(stats.lastUpload).toLocaleDateString('hu-HU')
        : 'Nincs adat',
      description: 'Legfrissebb meccs adatok',
      icon: CalendarIcon,
      color: 'text-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Áttekintés</h1>
        <p className="text-muted-foreground mt-2">
          WinMix Football Prediction System admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUpIcon className="mr-2 h-5 w-5 text-primary" />
              Gyors műveletek
            </CardTitle>
            <CardDescription>
              A leggyakoribb admin feladatok egyszerű elérése
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <DatabaseIcon className="mr-2 h-4 w-4" />
              Új meccs adatok feltöltése
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Prediction beállítások módosítása
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BrainIcon className="mr-2 h-4 w-4" />
              Modell újratanítása
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5 text-primary" />
              Rendszer állapot
            </CardTitle>
            <CardDescription>
              Az aktuális rendszer konfigurációja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Supabase kapcsolat</span>
              <span className="text-sm font-medium text-green-500">Aktív</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Autentikáció</span>
              <span className="text-sm font-medium text-green-500">Aktív</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">RLS politikák</span>
              <span className="text-sm font-medium text-green-500">Engedélyezve</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Verzió</span>
              <span className="text-sm font-medium">Phase I v1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Architektúra információ</CardTitle>
          <CardDescription>
            A rendszer aktuális technikai állapota és tervezett fejlesztések
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium text-foreground mb-2">Phase I - Foundation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Supabase PostgreSQL schema</li>
                <li>✅ React admin panel</li>
                <li>✅ Autentikáció és jogosultságok</li>
                <li>✅ Alapvető CRUD műveletek</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Phase II - ML Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>🔄 Feature engineering pipeline</li>
                <li>🔄 FastAPI prediction service</li>
                <li>🔄 Model training & versioning</li>
                <li>🔄 Automated retraining</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Phase III - Advanced</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>⏳ SHAP explainability</li>
                <li>⏳ Prediction audit trail</li>
                <li>⏳ Data quality monitoring</li>
                <li>⏳ Export capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
