import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { 
  UploadIcon, 
  SettingsIcon, 
  BrainIcon, 
  FileTextIcon, 
  BarChart3Icon,
  HomeIcon
} from 'lucide-react'

const navigation = [
  { name: 'Áttekintés', href: '/', icon: HomeIcon },
  { name: 'Meccs feltöltés', href: '/upload', icon: UploadIcon },
  { name: 'Prediction beállítások', href: '/settings', icon: SettingsIcon },
  { name: 'Modell kezelés', href: '/models', icon: BrainIcon },
  { name: 'Rendszer naplók', href: '/logs', icon: FileTextIcon },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">W</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">WinMix</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <BarChart3Icon className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Phase I Foundation
          </span>
        </div>
      </div>
    </div>
  )
}
