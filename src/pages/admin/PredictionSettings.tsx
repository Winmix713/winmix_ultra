import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import LoadingSpinner from '../../components/ui/loading-spinner'
import { supabase, PredictionSettings } from '../../lib/supabase'
import { useToast } from '../../hooks/use-toast'
import { SettingsIcon, SaveIcon, RotateCcwIcon } from 'lucide-react'

export default function PredictionSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<PredictionSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    recent_weight: 0.7,
    home_advantage: 0.1,
    goal_multiplier: 1.0,
    half_time_weight: 0.3,
    min_matches: 5
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('prediction_settings')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setSettings(data)
        setFormData({
          recent_weight: data.recent_weight,
          home_advantage: data.home_advantage,
          goal_multiplier: data.goal_multiplier,
          half_time_weight: data.half_time_weight,
          min_matches: data.min_matches
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Beállítások betöltési hiba",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      // Deactivate current settings
      if (settings) {
        await supabase
          .from('prediction_settings')
          .update({ is_active: false })
          .eq('id', settings.id)
      }

      // Insert new settings
      const { data, error } = await supabase
        .from('prediction_settings')
        .insert({
          ...formData,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setSettings(data)

      // Log the change
      await supabase.from('system_logs').insert({
        event_type: 'prediction_settings_update',
        event_data: {
          old_settings: settings,
          new_settings: formData
        }
      })

      toast({
        title: "Beállítások mentve!",
        description: "A prediction beállítások sikeresen frissültek.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Mentési hiba",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFormData({
      recent_weight: 0.7,
      home_advantage: 0.1,
      goal_multiplier: 1.0,
      half_time_weight: 0.3,
      min_matches: 5
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
        <h1 className="text-3xl font-bold text-foreground">Prediction beállítások</h1>
        <p className="text-muted-foreground mt-2">
          A gépi tanulási modell paramétereinek testreszabása
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              Modell paraméterek
            </CardTitle>
            <CardDescription>
              Állítsa be a prediction algoritmus súlyozási paramétereit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recent Weight */}
            <div className="space-y-2">
              <Label htmlFor="recent_weight">
                Közelmúlt súly (0-1)
              </Label>
              <Input
                id="recent_weight"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.recent_weight}
                onChange={(e) => handleInputChange('recent_weight', parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Mennyire súlyozza a közelmúltbeli eredményeket (magasabb = újabb meccsek fontosabbak)
              </p>
            </div>

            {/* Home Advantage */}
            <div className="space-y-2">
              <Label htmlFor="home_advantage">
                Hazai pálya előny (-1 - +1)
              </Label>
              <Input
                id="home_advantage"
                type="number"
                min="-1"
                max="1"
                step="0.1"
                value={formData.home_advantage}
                onChange={(e) => handleInputChange('home_advantage', parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                A hazai csapat előnyének súlyozása (0 = nincs előny, 1 = maximális előny)
              </p>
            </div>

            {/* Goal Multiplier */}
            <div className="space-y-2">
              <Label htmlFor="goal_multiplier">
                Gól szorzó
              </Label>
              <Input
                id="goal_multiplier"
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={formData.goal_multiplier}
                onChange={(e) => handleInputChange('goal_multiplier', parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                A gólok fontosságának súlyozása az előrejelzésben
              </p>
            </div>

            {/* Half Time Weight */}
            <div className="space-y-2">
              <Label htmlFor="half_time_weight">
                Félidős súly (0-1)
              </Label>
              <Input
                id="half_time_weight"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.half_time_weight}
                onChange={(e) => handleInputChange('half_time_weight', parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                A félidős eredmények súlyozása a végleges eredményhez képest
              </p>
            </div>

            {/* Min Matches */}
            <div className="space-y-2">
              <Label htmlFor="min_matches">
                Minimum meccsek száma
              </Label>
              <Input
                id="min_matches"
                type="number"
                min="1"
                max="20"
                step="1"
                value={formData.min_matches}
                onChange={(e) => handleInputChange('min_matches', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Minimum hány meccs szükséges egy csapat statisztikájához
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Mentés...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Beállítások mentése
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcwIcon className="mr-2 h-4 w-4" />
                Alapértelmezett
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview/Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Beállítások hatása</CardTitle>
            <CardDescription>
              Az aktuális paraméterek hatásának vizuális előnézete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Settings Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Közelmúlt súly:</span>
                <span className="text-sm font-medium">{formData.recent_weight}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Hazai pálya előny:</span>
                <span className="text-sm font-medium">{formData.home_advantage}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Gól szorzó:</span>
                <span className="text-sm font-medium">{formData.goal_multiplier}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Félidős súly:</span>
                <span className="text-sm font-medium">{formData.half_time_weight}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm">Min. meccsek:</span>
                <span className="text-sm font-medium">{formData.min_matches}</span>
              </div>
            </div>

            {/* Current Status */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Aktuális állapot</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {settings ? (
                    <>
                      Utolsó módosítás: {new Date(settings.updated_at).toLocaleDateString('hu-HU')}
                    </>
                  ) : (
                    'Még nincsenek mentett beállítások'
                  )}
                </p>
                <p>
                  Állapot: <span className="text-green-500 font-medium">Aktív konfiguráció</span>
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Megjegyzések</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• A beállítások azonnal érvényesülnek a mentés után</li>
                <li>• A korábbi konfigurációk automatikusan archiválódnak</li>
                <li>• A modell újratanítását javasolva a módosítások után</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
