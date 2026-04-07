import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReadingLog from './pages/ReadingLog'
import Collection from './pages/Collection'
import Reviews from './pages/Reviews'
import Referral from './pages/Referral'
import Communities from './pages/Communities'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/"             element={<Landing />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/log"          element={<ProtectedRoute><ReadingLog /></ProtectedRoute>} />
            <Route path="/collection"   element={<ProtectedRoute><Collection /></ProtectedRoute>} />
            <Route path="/reviews"      element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/referral"     element={<ProtectedRoute><Referral /></ProtectedRoute>} />
            <Route path="/communities"  element={<Communities />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
