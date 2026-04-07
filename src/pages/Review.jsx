import { useEffect, useState, useRef } from 'react'
import api from '../api'
import ReviewCard from '../components/ReviewCard'
import toast from 'react-hot-toast'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          className={`text-2xl transition-colors ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >★</button>
      ))}
    </div>
  )
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [books, setBooks]     = useState([])
  const [search, setSearch]   = useState('')
  const [filtered, setFiltered] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [form, setForm] = useState({ book_id: '', rating: 0, body: '' })
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const dropRef = useRef(null)

  useEffect(() => {
    api.get('/reviews/mine').then(r => { setReviews(r.data); setLoading(false) }).catch(() => setLoading(false))
    api.get('/books').then(r => setBooks(r.data)).catch(() => {})
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

  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.book_id) { toast.error('Pilih buku'); return }
    if (!form.rating)  { toast.error('Berikan rating'); return }
    if (!form.body.trim()) { toast.error('Tulis ulasanmu'); return }
    try {
      const { data } = await api.post('/reviews', form)
      setReviews(prev => {
        const exists = prev.find(r => r.book_id === data.book_id)
        return exists ? prev.map(r => r.book_id === data.book_id ? data : r) : [data, ...prev]
      })
      setForm({ book_id: '', rating: 0, body: '' })
      setSearch('')
      setSelectedBook(null)
      toast.success('Review tersimpan! ⭐')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan review')
    }
  }

  const deleteReview = async id => {
    if (!confirm('Hapus review ini?')) return
    try {
      await api.delete(`/reviews/${id}`)
      setReviews(prev => prev.filter(r => r.id !== id))
      toast.success('Review dihapus')
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif font-bold text-brown-800">⭐ Review Buku</h1>

      {/* Form */}
      <div className="card">
        <h2 className="font-semibold text-brown-800 mb-4">Tulis Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div ref={dropRef} className="relative">
            <label className="block text-sm font-medium text-brown-700 mb-1">Buku</label>
            <input
              className="input"
              placeholder="Cari judul atau penulis..."
              value={search}
              onChange={e => { setSearch(e.target.value); setForm(f => ({ ...f, book_id: '' })); setSelectedBook(null) }}
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-brown-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
                {filtered.map(b => (
                  <button key={b.id} type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-brown-50 border-b border-brown-50 last:border-0"
                    onClick={() => { setSelectedBook(b); setForm(f => ({ ...f, book_id: b.id })); setSearch(b.title); setShowDropdown(false) }}
                  >
                    <span className="font-medium text-sm text-brown-800">{b.title}</span>
                    <span className="text-xs text-brown-500 ml-2">{b.author}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">Rating</label>
            <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">Ulasan</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Bagaimana pendapatmu tentang buku ini?"
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn-primary">Simpan Review</button>
        </form>
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="font-semibold text-brown-800 mb-3">Review Kamu ({reviews.length})</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-brown-300 border-t-brown-600 rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-brown-400 text-center py-8">Belum ada review. Tulis yang pertama!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => <ReviewCard key={r.id} review={r} onDelete={deleteReview} />)}
          </div>
        )}
      </div>
    </div>
  )
}
