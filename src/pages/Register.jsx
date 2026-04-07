import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Akun berhasil dibuat! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="card">
        <h1 className="text-2xl font-serif font-bold text-brown-800 mb-6 text-center">Buat Akun Bukuku</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'username', label: 'Username', type: 'text', placeholder: 'si_pembaca' },
            { key: 'email',    label: 'Email',    type: 'email', placeholder: 'kamu@email.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 karakter' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-brown-700 mb-1">{label}</label>
              <input
                type={type}
                className="input"
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Mendaftar...' : 'Buat Akun'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-brown-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-brown-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
