import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import LoadingSpinner from '../../components/ui/loading-spinner'
import { supabase, Match } from '../../lib/supabase'
import { useToast } from '../../hooks/use-toast'
import { UploadIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
import Papa from 'papaparse'

interface ParsedMatch {
  home_team: string
  away_team: string
  score_home: number
  score_away: number
  score_home_ht: number
  score_away_ht: number
  date: string
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export default function MatchUpload() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedMatch[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [uploadStats, setUploadStats] = useState<{
    total: number
    successful: number
    errors: number
  } | null>(null)

  const requiredFields = [
    'home_team', 'away_team', 'score_home', 'score_away',
    'score_home_ht', 'score_away_ht', 'date'
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Hibás fájl formátum",
        description: "Kérjük, csak CSV fájlokat töltsön fel.",
      })
      return
    }

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as Record<string, any>[]
        const errors: ValidationError[] = []
        const parsed: ParsedMatch[] = []

        data.forEach((row, index) => {
          // Check for required fields
          const missingFields = requiredFields.filter(field => !row[field] || row[field].toString().trim() === '')
          
          if (missingFields.length > 0) {
            missingFields.forEach(field => {
              errors.push({
                row: index + 1,
                field,
                message: `Hiányzó kötelező mező: ${field}`
              })
            })
            return
          }

          // Validate and parse data
          try {
            const scoreHome = parseInt(row.score_home)
            const scoreAway = parseInt(row.score_away)
            const scoreHomeHt = parseInt(row.score_home_ht)
            const scoreAwayHt = parseInt(row.score_away_ht)

            // Validation checks
            if (isNaN(scoreHome) || scoreHome < 0) {
              errors.push({
                row: index + 1,
                field: 'score_home',
                message: 'A hazai gólszám érvényes pozitív szám kell hogy legyen'
              })
            }

            if (isNaN(scoreAway) || scoreAway < 0) {
              errors.push({
                row: index + 1,
                field: 'score_away',
                message: 'A vendég gólszám érvényes pozitív szám kell hogy legyen'
              })
            }

            if (isNaN(scoreHomeHt) || scoreHomeHt < 0) {
              errors.push({
                row: index + 1,
                field: 'score_home_ht',
                message: 'A hazai félidős gólszám érvényes pozitív szám kell hogy legyen'
              })
            }

            if (isNaN(scoreAwayHt) || scoreAwayHt < 0) {
              errors.push({
                row: index + 1,
                field: 'score_away_ht',
                message: 'A vendég félidős gólszám érvényes pozitív szám kell hogy legyen'
              })
            }

            // Check halftime scores are not greater than fulltime
            if (scoreHomeHt > scoreHome) {
              errors.push({
                row: index + 1,
                field: 'score_home_ht',
                message: 'A félidős gólszám nem lehet nagyobb a véglső eredménynél'
              })
            }

            if (scoreAwayHt > scoreAway) {
              errors.push({
                row: index + 1,
                field: 'score_away_ht',
                message: 'A félidős gólszám nem lehet nagyobb a véglső eredménynél'
              })
            }

            // Validate date
            const matchDate = new Date(row.date)
            if (isNaN(matchDate.getTime())) {
              errors.push({
                row: index + 1,
                field: 'date',
                message: 'Érvénytelen dátum formátum (használja: YYYY-MM-DD)'
              })
            }

            if (errors.filter(e => e.row === index + 1).length === 0) {
              parsed.push({
                home_team: row.home_team.trim(),
                away_team: row.away_team.trim(),
                score_home: scoreHome,
                score_away: scoreAway,
                score_home_ht: scoreHomeHt,
                score_away_ht: scoreAwayHt,
                date: matchDate.toISOString().split('T')[0]
              })
            }
          } catch (error) {
            errors.push({
              row: index + 1,
              field: 'general',
              message: `Adatfeldolgozási hiba: ${error}`
            })
          }
        })

        setParsedData(parsed)
        setValidationErrors(errors)
        setUploadStats(null)
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "CSV feldolgozási hiba",
          description: error.message,
        })
      }
    })
  }

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      toast({
        variant: "destructive",
        title: "Nincs feltöltendő adat",
        description: "Kérjük válasszon ki egy érvényes CSV fájlt.",
      })
      return
    }

    setIsUploading(true)

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert(parsedData)
        .select()

      if (error) {
        throw error
      }

      const stats = {
        total: parsedData.length,
        successful: data?.length || 0,
        errors: parsedData.length - (data?.length || 0)
      }

      setUploadStats(stats)

      // Log the upload
      await supabase.from('system_logs').insert({
        event_type: 'csv_upload',
        event_data: {
          matches_uploaded: stats.successful,
          total_rows: stats.total,
          errors: stats.errors
        }
      })

      toast({
        title: "Feltöltés sikeres!",
        description: `${stats.successful} meccs sikeresen feltöltve.`,
      })

      // Reset form
      setParsedData([])
      setValidationErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Feltöltési hiba",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meccs adatok feltöltése</h1>
        <p className="text-muted-foreground mt-2">
          Töltse fel a meccs eredményeket CSV formátumban
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UploadIcon className="mr-2 h-5 w-5" />
            CSV fájl feltöltés
          </CardTitle>
          <CardDescription>
            Válassza ki a meccs adatokat tartalmazó CSV fájlt. A fájlnak tartalmaznia kell az alábbi oszlopokat:
            home_team, away_team, score_home, score_away, score_home_ht, score_away_ht, date
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV fájl</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {parsedData.length} érvényes meccs adatok
                </span>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || validationErrors.length > 0}
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Feltöltés...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Feltöltés adatbázisba
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircleIcon className="mr-2 h-5 w-5" />
              Validációs hibák ({validationErrors.length})
            </CardTitle>
            <CardDescription>
              Az alábbi hibákat javítsa ki a feltöltés előtt:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm p-2 bg-destructive/10 rounded border-l-4 border-destructive">
                  <span className="font-medium">Sor {error.row}:</span> {error.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {parsedData.length > 0 && validationErrors.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileIcon className="mr-2 h-5 w-5" />
              Adatok előnézete
            </CardTitle>
            <CardDescription>
              Az első 5 meccs adatok előnézete (összesen {parsedData.length} meccs)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Hazai csapat</th>
                    <th className="text-left p-2">Vendég csapat</th>
                    <th className="text-center p-2">Eredmény</th>
                    <th className="text-center p-2">Félidő</th>
                    <th className="text-left p-2">Dátum</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((match, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="p-2 font-medium">{match.home_team}</td>
                      <td className="p-2">{match.away_team}</td>
                      <td className="p-2 text-center">
                        {match.score_home} - {match.score_away}
                      </td>
                      <td className="p-2 text-center">
                        {match.score_home_ht} - {match.score_away_ht}
                      </td>
                      <td className="p-2">{match.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadStats && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <CheckCircleIcon className="mr-2 h-5 w-5" />
              Feltöltés eredménye
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{uploadStats.total}</div>
                <div className="text-sm text-muted-foreground">Összes sor</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{uploadStats.successful}</div>
                <div className="text-sm text-muted-foreground">Sikeres</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{uploadStats.errors}</div>
                <div className="text-sm text-muted-foreground">Hibás</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
