import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '📖', title: 'Log Baca Harian', desc: 'Catat buku yang kamu baca setiap hari dan share hasilnya ke Instagram.' },
  { icon: '📚', title: 'Koleksi Buku', desc: 'Simpan semua buku yang pernah kamu baca dalam satu tempat.' },
  { icon: '⭐', title: 'Review & Rating', desc: 'Tulis ulasanmu dan bantu pembaca lain menemukan buku bagus.' },
  { icon: '🔗', title: 'Racun Buku', desc: 'Bagikan buku ke teman dengan link khusus dan track siapa yang tertarik.' },
  { icon: '🏘️', title: 'Direktori Komunitas', desc: 'Temukan komunitas baca di kotamu dan bergabung bersama.' },
]

export default function Landing() {
  const { user } = useAuth()
  return (
    <div>
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-serif font-bold text-brown-800 mb-4">
          Ruang Baca <span className="text-brown-500">Indonesia</span>
        </h1>
        <p className="text-lg text-brown-600 max-w-xl mx-auto mb-8">
          Platform untuk pembaca buku Indonesia — catat bacaanmu, bagikan ulasan, temukan komunitas, dan tumbuh bersama.
        </p>
        <div className="flex gap-3 justify-center">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-base px-8 py-3">Ke Dashboard →</Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary  text-base px-8 py-3">Mulai Gratis</Link>
              <Link to="/login"    className="btn-secondary text-base px-8 py-3">Masuk</Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 py-8">
        {features.map(f => (
          <div key={f.title} className="card hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-brown-800 mb-1">{f.title}</h3>
            <p className="text-sm text-brown-600">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center py-12">
        <div className="bg-brown-700 text-white rounded-2xl p-10">
          <h2 className="text-2xl font-serif font-bold mb-3">Mulai perjalanan literasimu</h2>
          <p className="text-brown-200 mb-6">Gratis selamanya. Tidak perlu kartu kredit.</p>
          {!user && (
            <Link to="/register" className="bg-white text-brown-700 font-semibold px-8 py-3 rounded-xl hover:bg-brown-50 transition">
              Daftar Sekarang
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
