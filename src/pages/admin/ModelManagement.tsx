import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import LoadingSpinner from '../../components/ui/loading-spinner'
import { supabase, ModelVersion } from '../../lib/supabase'
import { useToast } from '../../hooks/use-toast'
import { 
  BrainIcon, 
  PlayIcon, 
  HistoryIcon, 
  DownloadIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  TrendingUpIcon
} from 'lucide-react'

export default function ModelManagement() {
  const { toast } = useToast()
  const [models, setModels] = useState<ModelVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('model_versions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setModels(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Modellek betöltési hiba",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTrainModel = async () => {
    setTraining(true)

    try {
      // Simulate model training process
      // In Phase II, this will call the FastAPI endpoint
      await new Promise(resolve => setTimeout(resolve, 3000))

      const newModel: Omit<ModelVersion, 'id' | 'created_at'> = {
        version_name: `v${models.length + 1}.0.0`,
        model_type: 'xgboost',
        accuracy: 0.75 + Math.random() * 0.2, // Simulated accuracy
        training_data_count: Math.floor(Math.random() * 1000) + 500,
        model_file_path: `/models/model_v${models.length + 1}.pkl`,
        feature_importance: {
          'recent_form': 0.35,
          'home_advantage': 0.25,
          'head_to_head': 0.20,
          'goal_average': 0.15,
          'season_position': 0.05
        },
        hyperparameters: {
          'max_depth': 6,
          'learning_rate': 0.1,
          'n_estimators': 100,
          'subsample': 0.8
        },
        is_active: true,
        trained_by: undefined
      }

      // Deactivate current active model
      await supabase
        .from('model_versions')
        .update({ is_active: false })
        .eq('is_active', true)

      // Insert new model
      const { data, error } = await supabase
        .from('model_versions')
        .insert(newModel)
        .select()
        .single()

      if (error) throw error

      // Log the training
      await supabase.from('system_logs').insert({
        event_type: 'model_training',
        event_data: {
          model_version: data.version_name,
          training_data_count: newModel.training_data_count,
          accuracy: newModel.accuracy
        }
      })

      await loadModels()

      toast({
        title: "Modell tanítás sikeres!",
        description: `Új modell (${data.version_name}) sikeresen betanítva ${(newModel.accuracy * 100).toFixed(1)}% pontossággal.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Modell tanítási hiba",
        description: error.message,
      })
    } finally {
      setTraining(false)
    }
  }

  const handleActivateModel = async (modelId: string) => {
    try {
      // Deactivate all models
      await supabase
        .from('model_versions')
        .update({ is_active: false })
        .neq('id', 'none')

      // Activate selected model
      await supabase
        .from('model_versions')
        .update({ is_active: true })
        .eq('id', modelId)

      await loadModels()

      toast({
        title: "Modell aktiválva!",
        description: "A kiválasztott modell mostantól aktív.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Aktiválási hiba",
        description: error.message,
      })
    }
  }

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'text-muted-foreground'
    if (accuracy < 0.6) return 'text-red-500'
    if (accuracy < 0.75) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getAccuracyLabel = (accuracy?: number) => {
    if (!accuracy) return 'Ismeretlen'
    if (accuracy < 0.6) return 'Gyenge'
    if (accuracy < 0.75) return 'Közepes'
    return 'Jó'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const activeModel = models.find(m => m.is_active)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Modell kezelés</h1>
        <p className="text-muted-foreground mt-2">
          Gépi tanulási modellek tanítása, verziók kezelése és teljesítmény monitorozás
        </p>
      </div>

      {/* Active Model Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={activeModel ? "border-primary" : "border-orange-500"}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {activeModel ? (
                <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangleIcon className="mr-2 h-5 w-5 text-orange-500" />
              )}
              Aktív modell állapot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeModel ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Verzió:</span>
                  <span className="font-medium">{activeModel.version_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Típus:</span>
                  <span className="font-medium capitalize">{activeModel.model_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pontosság:</span>
                  <span className={`font-medium ${getAccuracyColor(activeModel.accuracy)}`}>
                    {activeModel.accuracy ? `${(activeModel.accuracy * 100).toFixed(1)}%` : 'N/A'} 
                    ({getAccuracyLabel(activeModel.accuracy)})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tanítva:</span>
                  <span className="font-medium">
                    {new Date(activeModel.created_at).toLocaleDateString('hu-HU')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Adatok:</span>
                  <span className="font-medium">
                    {activeModel.training_data_count?.toLocaleString() || 'N/A'} meccs
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nincs aktív modell</p>
                <p className="text-sm text-orange-500 mt-1">
                  Tanítson be egy új modellt a folytatáshoz
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlayIcon className="mr-2 h-5 w-5" />
              Gyors műveletek
            </CardTitle>
            <CardDescription>
              Modell tanítás és kezelési műveletek
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleTrainModel}
              disabled={training}
              className="w-full justify-start"
              variant={activeModel ? "outline" : "default"}
            >
              {training ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Modell tanítása folyamatban...
                </>
              ) : (
                <>
                  <BrainIcon className="mr-2 h-4 w-4" />
                  Új modell tanítása
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={!activeModel}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Modell exportálása
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={!activeModel}
            >
              <TrendingUpIcon className="mr-2 h-4 w-4" />
              Teljesítmény riport
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Model History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HistoryIcon className="mr-2 h-5 w-5" />
            Modell történet
          </CardTitle>
          <CardDescription>
            Minden betanított modell verzió és teljesítmény adatok
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <div className="text-center py-8">
              <BrainIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Még nincsenek betanított modellek</p>
              <p className="text-sm text-muted-foreground mt-1">
                Kezdjen el egy új modell tanításával
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id} className={`p-4 border rounded-lg ${
                  model.is_active ? 'border-primary bg-primary/5' : 'border-border'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${
                        model.is_active ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <h4 className="font-medium">{model.version_name}</h4>
                      {model.is_active && (
                        <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                          Aktív
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!model.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivateModel(model.id)}
                        >
                          Aktiválás
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Típus:</span>
                      <div className="font-medium capitalize">{model.model_type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pontosság:</span>
                      <div className={`font-medium ${getAccuracyColor(model.accuracy)}`}>
                        {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tanító adatok:</span>
                      <div className="font-medium">
                        {model.training_data_count?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Létrehozva:</span>
                      <div className="font-medium">
                        {new Date(model.created_at).toLocaleDateString('hu-HU')}
                      </div>
                    </div>
                  </div>

                  {/* Feature Importance */}
                  {model.feature_importance && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="text-sm font-medium mb-2">Feature fontosság:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {Object.entries(model.feature_importance).map(([feature, importance]) => (
                          <div key={feature} className="flex justify-between">
                            <span className="text-muted-foreground">{feature}:</span>
                            <span className="font-medium">{(importance * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
