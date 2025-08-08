import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import MatchUpload from './admin/MatchUpload'
import PredictionSettings from './admin/PredictionSettings'
import ModelManagement from './admin/ModelManagement'
import SystemLogs from './admin/SystemLogs'
import Overview from './admin/Overview'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="/upload" element={<MatchUpload />} />
            <Route path="/settings" element={<PredictionSettings />} />
            <Route path="/models" element={<ModelManagement />} />
            <Route path="/logs" element={<SystemLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
