import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'

export default function Communities() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [provinces, setProvinces] = useState([])
  const [province, setProvince] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', province: '', description: '', website: '', instagram: '', contact: ''
  })

  useEffect(() => {
    api.get('/communities/provinces').then(r => setProvinces(r.data)).catch(() => {})
    fetchCommunities()
  }, [])

  const fetchCommunities = async (prov = '', q = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (prov) params.set('province', prov)
      if (q)    params.set('q', q)
      const { data } = await api.get(`/communities?${params}`)
      setCommunities(data)
    } catch {
      toast.error('Gagal memuat komunitas')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (prov) => {
    setProvince(prov)
    fetchCommunities(prov, search)
  }

  const handleSearch = (q) => {
    setSearch(q)
    fetchCommunities(province, q)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await api.post('/communities', form)
      toast.success('Komunitas berhasil disubmit! Akan ditinjau oleh admin. 🏘️')
      setShowForm(false)
      setForm({ name: '', city: '', province: '', description: '', website: '', instagram: '', contact: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal submit')
    }
  }

  // Group by province
  const grouped = communities.reduce((acc, c) => {
    if (!acc[c.province]) acc[c.province] = []
    acc[c.province].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-800">🏘️ Komunitas Baca</h1>
          <p className="text-sm text-brown-500 mt-1">Direktori komunitas literasi di seluruh Indonesia</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(s => !s)} className="btn-primary">+ Submit Komunitas</button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="input flex-1 min-w-48"
          placeholder="Cari nama, kota, deskripsi..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <select
          className="input w-auto"
          value={province}
          onChange={e => handleFilter(e.target.value)}
        >
          <option value="">Semua Provinsi</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="card">
          <h2 className="font-semibold text-brown-800 mb-4">Submit Komunitas Baru</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'name',        label: 'Nama Komunitas*', placeholder: 'Forum Baca Jakarta' },
              { key: 'city',        label: 'Kota*',           placeholder: 'Jakarta Selatan' },
              { key: 'province',    label: 'Provinsi*',       placeholder: 'DKI Jakarta' },
              { key: 'instagram',   label: 'Instagram',       placeholder: '@namaakun' },
              { key: 'website',     label: 'Website',         placeholder: 'https://...' },
              { key: 'contact',     label: 'Kontak',          placeholder: 'Email / WhatsApp' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-brown-700 mb-1">{label}</label>
                <input
                  className="input"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required={label.endsWith('*')}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brown-700 mb-1">Deskripsi</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ceritakan tentang komunitas kamu..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Communities */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-brown-300 border-t-brown-600 rounded-full animate-spin" />
        </div>
      ) : communities.length === 0 ? (
        <p className="text-brown-400 text-center py-8">Tidak ada komunitas ditemukan.</p>
      ) : (
        Object.entries(grouped).map(([prov, comms]) => (
          <div key={prov}>
            <h2 className="text-lg font-semibold text-brown-700 mb-3 flex items-center gap-2">
              📍 {prov}
              <span className="text-sm font-normal text-brown-400">({comms.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {comms.map(c => (
                <div key={c.id} className="card hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-brown-900">{c.name}</h3>
                  <p className="text-sm text-brown-500">📍 {c.city}, {c.province}</p>
                  {c.description && <p className="text-sm text-brown-700 mt-2">{c.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {c.instagram && (
                      <a href={`[instagram.com](https://instagram.com/${c.instagram.replace()'@','')}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full hover:bg-pink-100 transition">
                        {c.instagram}
                      </a>
                    )}
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full hover:bg-blue-100 transition">
                        🌐 Website
                      </a>
                    )}
                    {c.contact && (
                      <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                        {c.contact}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
