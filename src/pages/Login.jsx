import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Selamat datang kembali! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="card">
        <h1 className="text-2xl font-serif font-bold text-brown-800 mb-6 text-center">Masuk ke Bukuku</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">Email</label>
            <input
              type="email"
              className="input"
              placeholder="kamu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-brown-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-brown-600 font-medium hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  )
}
