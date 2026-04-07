import { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

const STATUS_LABELS = { read: '✅ Sudah Baca', reading: '📖 Sedang Baca', want: '🔖 Mau Baca' }

export default function Collection() {
  const [items, setItems]   = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [books, setBooks]   = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ book_id: '', status: 'read' })
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    fetchCollection()
    api.get('/books').then(r => setBooks(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (search.length > 1) {
      setFiltered(books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8))
    } else {
      setFiltered([])
    }
  }, [search, books])

  const fetchCollection = async () => {
    try {
      const { data } = await api.get('/collections')
      setItems(data)
    } catch {
      toast.error('Gagal memuat koleksi')
    } finally {
      setLoading(false)
    }
  }

  const removeBook = async bookId => {
    if (!confirm('Hapus dari koleksi?')) return
    try {
      await api.delete(`/collections/${bookId}`)
      setItems(prev => prev.filter(i => i.book_id !== bookId))
      toast.success('Dihapus dari koleksi')
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const addToCollection = async e => {
    e.preventDefault()
    if (!addForm.book_id) { toast.error('Pilih buku'); return }
    try {
      const { data } = await api.post('/collections', addForm)
      setItems(prev => {
        const exists = prev.find(i => i.book_id === data.book_id)
        return exists ? prev.map(i => i.book_id === data.book_id ? data : i) : [data, ...prev]
      })
      setShowAdd(false)
      setSearch('')
      setAddForm({ book_id: '', status: 'read' })
      toast.success('Ditambahkan ke koleksi!')
    } catch {
      toast.error('Gagal menambahkan')
    }
  }

  const displayed = filter === 'all' ? items : items.filter(i => i.status === filter)
  const COVERS = [
    '[images.unsplash.com](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80)',
    '[images.unsplash.com](https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80)',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-serif font-bold text-brown-800">📚 Koleksi Buku</h1>
        <button onClick={() => setShowAdd(s => !s)} className="btn-primary">+ Tambah Buku</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <h2 className="font-semibold text-brown-800 mb-3">Tambah ke Koleksi</h2>
          <form onSubmit={addToCollection} className="space-y-3">
            <div className="relative">
              <input
                className="input"
                placeholder="Cari buku..."
                value={search}
                onChange={e => { setSearch(e.target.value); setAddForm(f => ({ ...f, book_id: '' })) }}
              />
              {filtered.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-brown-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
                  {filtered.map(b => (
                    <button key={b.id} type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-brown-50 border-b border-brown-50 last:border-0"
                      onClick={() => { setAddForm(f => ({ ...f, book_id: b.id })); setSearch(b.title); setFiltered([]) }}
                    >
                      <span className="font-medium text-sm text-brown-800">{b.title}</span>
                      <span className="text-xs text-brown-500 ml-2">{b.author}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              className="input"
              value={addForm.status}
              onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="read">✅ Sudah Baca</option>
              <option value="reading">📖 Sedang Baca</option>
              <option value="want">🔖 Mau Baca</option>
            </select>
            <button type="submit" className="btn-primary">Simpan</button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'read', 'reading', 'want'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-brown-600 text-white' : 'bg-brown-100 text-brown-600 hover:bg-brown-200'}`}
          >
            {s === 'all' ? `Semua (${items.length})` : `${STATUS_LABELS[s]} (${items.filter(i => i.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-brown-300 border-t-brown-600 rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <p className="text-brown-400 text-center py-8">Koleksi kosong. Tambahkan buku pertamamu!</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayed.map(item => {
            const fallback = COVERS[item.book_id % COVERS.length]
            return (
              <div key={item.book_id} className="card flex gap-4">
                <img
                  src={item.cover_url || fallback}
                  alt={item.title}
                  className="w-14 h-20 object-cover rounded-lg shadow flex-shrink-0"
                  onError={e => { e.target.src = fallback }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brown-900 truncate">{item.title}</h3>
                  <p className="text-sm text-brown-500">{item.author}</p>
                  {item.genre && <span className="text-xs bg-brown-100 text-brown-600 px-2 py-0.5 rounded-full">{item.genre}</span>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs">{STATUS_LABELS[item.status]}</span>
                    {item.my_rating && <span className="text-xs text-yellow-500">{'★'.repeat(item.my_rating)}</span>}
                  </div>
                  <button onClick={() => removeBook(item.book_id)} className="mt-1 text-xs text-red-400 hover:text-red-600">Hapus</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
