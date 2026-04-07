import { useRef } from 'react'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

export default function ShareCard({ logs, username, date }) {
  const cardRef = useRef(null)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true })
      const link = document.createElement('a')
      link.download = `bukuku-${date}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Card berhasil diunduh! Siap share ke IG 📸')
    } catch {
      toast.error('Gagal membuat card')
    }
  }

  if (!logs || logs.length === 0) return null

  return (
    <div className="mt-4">
      {/* Shareable card */}
      <div
        ref={cardRef}
        className="w-80 bg-gradient-to-br from-brown-700 to-brown-900 text-white rounded-2xl p-6 mx-auto shadow-xl"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <div className="text-center mb-4">
          <p className="text-brown-200 text-xs tracking-widest uppercase">Bukuku · Baca Hari Ini</p>
          <p className="text-brown-300 text-sm mt-1">{date}</p>
        </div>
        <div className="space-y-3">
          {logs.slice(0, 3).map(log => (
            <div key={log.id} className="flex items-center gap-3">
              <div className="w-10 h-14 bg-brown-600 rounded flex-shrink-0 overflow-hidden">
                {log.cover_url && (
                  <img src={log.cover_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">{log.title}</p>
                <p className="text-brown-300 text-xs">{log.author}</p>
                {log.pages_read > 0 && (
                  <p className="text-brown-400 text-xs">{log.pages_read} halaman</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-brown-600 pt-3 text-center">
          <p className="text-brown-300 text-xs">@{username} · bukuku.id</p>
          <p className="text-brown-400 text-xs mt-0.5">Bergabung di Bukuku 📚</p>
        </div>
      </div>

      <div className="text-center mt-4">
        <button onClick={handleDownload} className="btn-primary">
          📸 Download Card untuk IG
        </button>
      </div>
    </div>
  )
}
