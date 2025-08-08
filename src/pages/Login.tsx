import { useState, FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import LoadingSpinner from '../components/ui/loading-spinner'
import { useToast } from '../hooks/use-toast'

export default function Login() {
  const { signIn, user, loading } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Bejelentkezési hiba",
          description: error.message === 'Invalid login credentials' 
            ? 'Helytelen email cím vagy jelszó.'
            : 'Hiba történt a bejelentkezés során.',
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bejelentkezési hiba",
        description: "Váratlan hiba történt.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-primary-foreground">⚽</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">WinMix Admin</h1>
          <p className="text-muted-foreground mt-2">Football Prediction System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bejelentkezés</CardTitle>
            <CardDescription>
              Adja meg bejelentkezési adatait az admin panel eléréséhez.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email cím</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@winmix.hu"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Jelszó</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !formData.email || !formData.password}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Bejelentkezés...
                  </>
                ) : (
                  'Bejelentkezés'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Fejlesztői környezet v1.0.0</p>
          <p className="mt-1">React + Supabase + FastAPI</p>
        </div>
      </div>
    </div>
  )
}
