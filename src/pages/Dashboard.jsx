import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [stats, setStats]   = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm]     = useState({ bio: '', avatar_url: '' })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [logs, collections, reviews, referrals] = await Promise.all([
          api.get('/reading-logs?limit=5'),
          api.get('/collections'),
          api.get('/reviews/mine'),
          api.get('/referrals/mine'),
        ])
        setStats({
          recentLogs:  logs.data.logs,
          totalLogs:   logs.data.total,
          collections: collections.data.length,
          reviews:     reviews.data.length,
          referrals:   referrals.data,
          totalClicks: referrals.data.reduce((s, r) => s + r.clicks, 0),
        })
      } catch {
        // silent
      }
    }
    fetchStats()
    if (user) setForm({ bio: user.bio || '', avatar_url: user.avatar_url || '' })
  }, [user])

  const saveProfile = async e => {
    e.preventDefault()
    try {
      const { data } = await api.patch('/auth/me', form)
      updateUser(data)
      setEditMode(false)
      toast.success('Profil diperbarui!')
    } catch {
      toast.error('Gagal menyimpan profil')
    }
  }

  if (!stats) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-brown-300 border-t-brown-600 rounded-full animate-spin" />
    </div>
  )

  const statCards = [
    { label: 'Total Log Baca', value: stats.totalLogs,   icon: '📖', href: '/log' },
    { label: 'Koleksi Buku',   value: stats.collections, icon: '📚', href: '/collection' },
    { label: 'Review Ditulis', value: stats.reviews,     icon: '⭐', href: '/reviews' },
    { label: 'Klik Racun',     value: stats.totalClicks, icon: '🔗', href: '/referral' },
  ]

  return (
    <div className="space-y-8">
      {/* Profile */}
      <div className="card flex gap-5 items-start">
        <div className="w-16 h-16 rounded-full bg-brown-200 flex items-center justify-center text-2xl font-bold text-brown-700 flex-shrink-0 overflow-hidden">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : user?.username?.[0]?.toUpperCase()
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-brown-800">{user?.username}</h2>
            <span className="text-xs bg-brown-100 text-brown-600 px-2 py-0.5 rounded-full font-mono">
              Ref: {user?.ref_code}
            </span>
          </div>
          <p className="text-sm text-brown-500 mt-0.5">{user?.email}</p>
          {user?.bio && <p className="mt-2 text-sm text-brown-700">{user.bio}</p>}
          <button onClick={() => setEditMode(e => !e)} className="mt-2 text-sm text-brown-500 hover:text-brown-700 underline">
            {editMode ? 'Batal' : 'Edit profil'}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editMode && (
        <div className="card">
          <h3 className="font-semibold text-brown-800 mb-4">Edit Profil</h3>
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">Bio</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ceritakan tentang dirimu..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">URL Avatar</label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={form.avatar_url}
                onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-primary">Simpan</button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Link key={s.label} to={s.href} className="card hover:shadow-md transition-shadow text-center group">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-brown-700 group-hover:text-brown-900">{s.value}</div>
            <div className="text-xs text-brown-500 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      {stats.recentLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-brown-800">Aktivitas Terakhir</h3>
            <Link to="/log" className="text-sm text-brown-500 hover:underline">Lihat semua →</Link>
          </div>
          <div className="space-y-3">
            {stats.recentLogs.map(log => (
              <div key={log.id} className="card flex items-center gap-4">
                <span className="text-2xl">📖</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brown-800 truncate">{log.title}</p>
                  <p className="text-sm text-brown-500">{log.author}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-brown-400">{new Date(log.read_date).toLocaleDateString('id-ID')}</p>
                  {log.pages_read > 0 && <p className="text-xs text-brown-500">{log.pages_read} hal</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="card">
        <h3 className="font-semibold text-brown-800 mb-3">Aksi Cepat</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/log"         className="btn-primary">📖 Catat Baca</Link>
          <Link to="/reviews"     className="btn-secondary">⭐ Tulis Review</Link>
          <Link to="/referral"    className="btn-secondary">🔗 Buat Link Racun</Link>
          <Link to="/communities" className="btn-secondary">🏘️ Cari Komunitas</Link>
        </div>
      </div>
    </div>
  )
}
