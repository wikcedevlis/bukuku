import { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Referral() {
  const { user }  = useAuth()
  const [refs, setRefs]     = useState([])
  const [books, setBooks]   = useState([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const baseUrl = window.location.origin

  useEffect(() => {
    api.get('/referrals/mine').then(r => { setRefs(r.data); setLoading(false) }).catch(() => setLoading(false))
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

  const createRef = async () => {
    if (!selectedBook) { toast.error('Pilih buku dulu'); return }
    try {
      const { data } = await api.post('/referrals', { book_id: selectedBook.id })
      setRefs(prev => prev.find(r => r.id === data.id) ? prev : [{ ...data, title: selectedBook.title, author: selectedBook.author, cover_url: selectedBook.cover_url }, ...prev])
      setSearch('')
      setSelectedBook(null)
      setFiltered([])
      toast.success('Link racun berhasil dibuat! 🔗')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membuat link')
    }
  }

  const copyLink = (refLink) => {
    const url = `${baseUrl}/api/referrals/r/${refLink}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link disalin! 📋'))
  }

  const shareToIG = (ref) => {
    const text = encodeURIComponent(`Kamu harus baca "${ref.title}"! 📚\n${baseUrl}/api/referrals/r/${ref.ref_link}`)
    window.open(`[instagram.com](https://www.instagram.com/?text=${text})`, '_blank')
  }

  const COVERS = [
    '[images.unsplash.com](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80)',
    '[images.unsplash.com](https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80)',
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-brown-800">🔗 Racun Buku</h1>
        <p className="text-sm text-brown-500 mt-1">Bagikan buku favoritmu dengan link khusus dan track siapa yang penasaran.</p>
      </div>

      {/* Create */}
      <div className="card">
        <h2 className="font-semibold text-brown-800 mb-3">Buat Link Racun Baru</h2>
        <div className="relative mb-3">
          <input
            className="input"
            placeholder="Cari buku yang mau kamu racunkan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedBook(null) }}
          />
          {filtered.length > 0 && (
            <div className="absolute z-20 w-full bg-white border border-brown-200 rounded-xl shadow-lg mt-1 max-h-52 overflow-y-auto">
              {filtered.map(b => (
                <button key={b.id} type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-brown-50 border-b border-brown-50 last:border-0"
                  onClick={() => { setSelectedBook(b); setSearch(b.title); setFiltered([]) }}
                >
                  <span className="font-medium text-sm text-brown-800">{b.title}</span>
                  <span className="text-xs text-brown-500 ml-2">{b.author}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedBook && (
          <div className="flex items-center gap-3 p-3 bg-brown-50 rounded-xl mb-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-medium text-brown-800 text-sm">{selectedBook.title}</p>
              <p className="text-xs text-brown-500">{selectedBook.author}</p>
            </div>
          </div>
        )}
        <button onClick={createRef} className="btn-primary">Buat Link</button>
      </div>

      {/* List */}
      <div>
        <h2 className="font-semibold text-brown-800 mb-3">Link Aktif ({refs.length})</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-brown-300 border-t-brown-600 rounded-full animate-spin" />
          </div>
        ) : refs.length === 0 ? (
          <p className="text-brown-400 text-center py-8">Belum ada link. Mulai racunkan buku favoritmu!</p>
        ) : (
          <div className="space-y-4">
            {refs.map(ref => {
              const fallback = COVERS[ref.book_id % COVERS.length]
              const url = `${baseUrl}/api/referrals/r/${ref.ref_link}`
              return (
                <div key={ref.id} className="card">
                  <div className="flex gap-4 items-start">
                    <img
                      src={ref.cover_url || fallback}
                      alt={ref.title}
                      className="w-14 h-20 object-cover rounded-lg shadow flex-shrink-0"
                      onError={e => { e.target.src = fallback }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brown-900">{ref.title}</h3>
                      <p className="text-sm text-brown-500">{ref.author}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-2xl font-bold text-brown-700">{ref.clicks}</span>
                        <span className="text-sm text-brown-500">klik</span>
                      </div>
                      <p className="text-xs text-brown-400 mt-1 truncate font-mono">{url}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button onClick={() => copyLink(ref.ref_link)} className="btn-secondary text-xs py-1.5 px-3">
                          📋 Salin Link
                        </button>
                        <button onClick={() => shareToIG(ref)} className="btn-secondary text-xs py-1.5 px-3">
                          📸 Share ke IG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
