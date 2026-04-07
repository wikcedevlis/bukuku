import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brown-600' : 'text-brown-500 hover:text-brown-700'}`

  return (
    <nav className="bg-white border-b border-brown-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl font-bold text-brown-700 flex items-center gap-2">
          📚 Bukuku
        </Link>

        <div className="hidden md:flex items-center gap-5">
          <NavLink to="/communities" className={navClass}>Komunitas</NavLink>
          {user && (
            <>
              <NavLink to="/dashboard"  className={navClass}>Dashboard</NavLink>
              <NavLink to="/log"        className={navClass}>Log Baca</NavLink>
              <NavLink to="/collection" className={navClass}>Koleksi</NavLink>
              <NavLink to="/reviews"    className={navClass}>Review</NavLink>
              <NavLink to="/referral"   className={navClass}>Racun Buku</NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-sm font-medium text-brown-700 hover:text-brown-900"
              >
                <span className="w-8 h-8 rounded-full bg-brown-200 flex items-center justify-center text-brown-700 font-bold text-xs">
                  {user.username?.[0]?.toUpperCase()}
                </span>
                <span className="hidden md:inline">{user.username}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-brown-100 py-1 z-50">
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-brown-700 hover:bg-brown-50">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Masuk</Link>
              <Link to="/register" className="btn-primary  text-sm py-2 px-4">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
