import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import ShareCard from '../components/ShareCard'
import toast from 'react-hot-toast'

export default function ReadingLog() {
  const { user }  = useAuth()
  const [books, setBooks]   = useState([])
  const [logs, setLogs]     = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [form, setForm] = useState({ book_id: '', notes: '', pages_read: '', read_date: new Date().toISOString().split('T')[0] })
  const [selectedBook, setSelectedBook] = useState(null)
  const dropRef = useRef(null)

  useEffect(() => {
    fetchLogs()
    fetchToday()
    api.get('/books').then(r => setBooks(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    fetchLogs(1)
    setPage(1)
  }, [])

  useEffect(() => {
    if (search.length > 1) {
      setFiltered(books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8))
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [search, books])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchLogs = async (p = page) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/reading-logs?page=${p}&limit=10`)
      setLogs(data.logs)
      setTotal(data.total)
    } catch {
      toast.error('Gagal memuat log')
    } finally {
      setLoading(false)
    }
  }

  const fetchToday = async () => {
    try {
      const { data } = await api.get('/reading-logs/today')
      setTodayLogs(data)
    } catch {}
  }

  const selectBook = book => {
    setSelectedBook(book)
    setForm(f => ({ ...f, book_id: book.id }))
    setSearch(book.title)
    setShowDropdown(false)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.book_id) { toast.error('Pilih buku terlebih dahulu'); return }
    try {
      await api.post('/reading-logs', {
        ...form,
        pages_read: Number(form.pages_read) || 0,
      })
      toast.success('Log baca berhasil disimpan! 📖')
      setForm({ book_id: '', notes: '', pages_read: '', read_date: new Date().toISOString().split('T')[0] })
      setSearch('')
      setSelectedBook(null)
      fetchLogs(1)
      fetchToday()
      setPage(1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan log')
    }
  }

  const deleteLog = async id => {
    if (!confirm('Hapus log ini?')) return
    try {
      await api.delete(`/reading-logs/${id}`)
      toast.success('Log dihapus')
      fetchLogs(page)
      fetchToday()
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const totalPages = Math.ceil(total / 10)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif font-bold text-brown-800">📖 Log Baca</h1>

      {/* Form */}
      <div className="card">
        <h2 className="font-semibold text-brown-800 mb-4">Catat baca hari ini</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Book search */}
          <div ref={dropRef} className="relative">
            <label className="block text-sm font-medium text-brown-700 mb-1">Buku</label>
            <input
              className="input"
              placeholder="Cari judul atau penulis..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setForm(f => ({ ...f, book_id: '' }))
                setSelectedBook(null)
              }}
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-brown-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filtered.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-brown-50 border-b border-brown-50 last:border-0"
                    onClick={() => selectBook(b)}
                  >
                    <span className="font-medium text-brown-800 text-sm">{b.title}</span>
                    <span className="text-brown-500 text-xs ml-2">{b.author}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">Halaman dibaca</label>
              <input
                type="number"
                min="0"
                className="input"
                placeholder="0"
                value={form.pages_read}
                onChange={e => setForm(f => ({ ...f, pages_read: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1">Tanggal</label>
              <input
                type="date"
                className="input"
                value={form.read_date}
                onChange={e => setForm(f => ({ ...f, read_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">Catatan (opsional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Apa yang kamu baca hari ini?"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn-primary">Simpan Log</button>
        </form>
      </div>

      {/* Today card + share */}
      {todayLogs.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-brown-800 mb-1">Baca hari ini — {today}</h2>
          <p className="text-sm text-brown-500 mb-4">{todayLogs.length} buku tercatat</p>
          <ShareCard logs={todayLogs} username={user?.username} date={new Date().toLocaleDateString('id-ID')} />
        </div>
      )}

      {/* Log history */}
      <div>
        <h2 className="font-semibold text-brown-800 mb-3">Riwayat ({total} log)</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-brown-300 border-t-brown-600 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-brown-400 text-center py-8">Belum ada log. Yuk mulai mencatat! 📖</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="card flex gap-4 items-start">
                <div className="w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-brown-100">
                  {log.cover_url && (
                    <img src={log.cover_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brown-800 truncate">{log.title}</p>
                  <p className="text-sm text-brown-500">{log.author}</p>
                  {log.pages_read > 0 && (
                    <p className="text-xs text-brown-400 mt-0.5">{log.pages_read} halaman</p>
                  )}
                  {log.notes && <p className="text-sm text-brown-600 mt-1 italic">"{log.notes}"</p>}
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="text-xs text-brown-400">{new Date(log.read_date).toLocaleDateString('id-ID')}</p>
                  <button onClick={() => deleteLog(log.id)} className="text-xs text-red-400 hover:text-red-600 block">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => { setPage(p); fetchLogs(p) }}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-brown-600 text-white' : 'bg-brown-100 text-brown-600 hover:bg-brown-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
