import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { LogOutIcon, UserIcon } from 'lucide-react'

export default function Header() {
  const { user, signOut, isAdmin } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Football Prediction System
        </h2>
        <p className="text-sm text-muted-foreground">
          Modern admin interface for match analysis and ML predictions
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{user?.email}</span>
          {isAdmin && (
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
              Admin
            </span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOutIcon className="h-4 w-4 mr-2" />
          Kijelentkezés
        </Button>
      </div>
    </header>
  )
}
