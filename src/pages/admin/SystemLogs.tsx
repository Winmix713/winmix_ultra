import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import LoadingSpinner from '../../components/ui/loading-spinner'
import { supabase, SystemLog } from '../../lib/supabase'
import { useToast } from '../../hooks/use-toast'
import { 
  FileTextIcon, 
  FilterIcon, 
  RefreshCwIcon, 
  DownloadIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon
} from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

const EVENT_TYPES = [
  { value: 'all', label: 'Minden esemény' },
  { value: 'csv_upload', label: 'CSV feltöltés' },
  { value: 'prediction_settings_update', label: 'Beállítások módosítás' },
  { value: 'model_training', label: 'Modell tanítás' },
  { value: 'user_login', label: 'Bejelentkezés' },
  { value: 'user_logout', label: 'Kijelentkezés' },
  { value: 'error', label: 'Hiba események' }
]

export default function SystemLogs() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState({
    eventType: 'all',
    searchTerm: '',
    limit: 50
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    const isInitialLoad = loading
    if (!isInitialLoad) setRefreshing(true)

    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters.limit)

      // Apply event type filter
      if (filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType)
      }

      // Apply search filter
      if (filters.searchTerm) {
        query = query.or(`event_type.ilike.%${filters.searchTerm}%,event_data::text.ilike.%${filters.searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setLogs(data || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Naplók betöltési hiba",
        description: error.message,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadLogs()
  }

  const handleExportLogs = () => {
    const csvContent = [
      'Dátum,Esemény típus,Felhasználó,IP cím,Részletek',
      ...logs.map(log => [
        formatDateTime(log.created_at),
        log.event_type,
        log.user_id || 'Rendszer',
        log.ip_address || 'N/A',
        JSON.stringify(log.event_data || {})
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export sikeres!",
      description: "A rendszer naplók CSV fájlba mentve.",
    })
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'csv_upload':
      case 'model_training':
      case 'prediction_settings_update':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <InfoIcon className="h-4 w-4 text-blue-500" />
    }
  }

  const getEventTypeLabel = (eventType: string) => {
    const type = EVENT_TYPES.find(t => t.value === eventType)
    return type?.label || eventType
  }

  const formatEventData = (eventData: any) => {
    if (!eventData) return null
    
    return Object.entries(eventData).map(([key, value]) => (
      <div key={key} className="text-xs">
        <span className="text-muted-foreground">{key}:</span>{' '}
        <span className="font-mono">{JSON.stringify(value)}</span>
      </div>
    ))
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
        <h1 className="text-3xl font-bold text-foreground">Rendszer naplók</h1>
        <p className="text-muted-foreground mt-2">
          Rendszer események, felhasználói műveletek és hibanaplók monitorozása
        </p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilterIcon className="mr-2 h-5 w-5" />
            Szűrők és műveletek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Esemény típus</label>
              <select
                className="w-full p-2 border border-input bg-background rounded-md text-sm"
                value={filters.eventType}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Keresés</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Keresés a naplókban..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Limit</label>
              <select
                className="p-2 border border-input bg-background rounded-md text-sm"
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                size="sm"
                variant="outline"
              >
                {refreshing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                )}
                Frissítés
              </Button>

              <Button
                onClick={handleExportLogs}
                size="sm"
                variant="outline"
                disabled={logs.length === 0}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileTextIcon className="mr-2 h-5 w-5" />
              Rendszer események ({logs.length})
            </div>
            <div className="text-sm text-muted-foreground">
              Utolsó {filters.limit} esemény
            </div>
          </CardTitle>
          <CardDescription>
            Részletes esemény naplók időrendi sorrendben
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nincsenek naplóbejegyzések</p>
              <p className="text-sm text-muted-foreground mt-1">
                A szűrők módosítása vagy frissítés segíthet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-border rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(log.event_type)}
                      <div>
                        <h4 className="font-medium text-foreground">
                          {getEventTypeLabel(log.event_type)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      {log.user_id && (
                        <div>Felhasználó: {log.user_id.slice(-8)}</div>
                      )}
                      {log.ip_address && (
                        <div>IP: {log.ip_address}</div>
                      )}
                    </div>
                  </div>

                  {/* Event Data */}
                  {log.event_data && Object.keys(log.event_data).length > 0 && (
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <h5 className="text-sm font-medium mb-2">Esemény részletek:</h5>
                      {formatEventData(log.event_data)}
                    </div>
                  )}

                  {/* User Agent */}
                  {log.user_agent && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        User Agent (kattintson a megjelenítéshez)
                      </summary>
                      <div className="mt-2 font-mono bg-muted/30 p-2 rounded">
                        {log.user_agent}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {logs.filter(l => l.event_type === 'csv_upload').length}
            </div>
            <p className="text-sm text-muted-foreground">CSV feltöltések</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {logs.filter(l => l.event_type === 'model_training').length}
            </div>
            <p className="text-sm text-muted-foreground">Modell tanítások</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {logs.filter(l => l.event_type === 'error').length}
            </div>
            <p className="text-sm text-muted-foreground">Hiba események</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
