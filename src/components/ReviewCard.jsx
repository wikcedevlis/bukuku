function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  )
}

export default function ReviewCard({ review, onDelete }) {
  const COVERS = [
    '[images.unsplash.com](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80)',
    '[images.unsplash.com](https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80)',
  ]
  const fallback = COVERS[review.book_id % COVERS.length]

  return (
    <div className="card">
      <div className="flex gap-4">
        {review.cover_url !== undefined && (
          <img
            src={review.cover_url || fallback}
            alt={review.title}
            className="w-14 h-20 object-cover rounded-lg shadow flex-shrink-0"
            onError={e => { e.target.src = fallback }}
          />
        )}
        <div className="flex-1 min-w-0">
          {review.title && <h3 className="font-semibold text-brown-900">{review.title}</h3>}
          {review.author && <p className="text-sm text-brown-500 mb-1">{review.author}</p>}
          <Stars rating={review.rating} />
          <p className="mt-2 text-sm text-brown-700 leading-relaxed">{review.body}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-brown-400">
              {review.username ? `@${review.username} · ` : ''}
              {new Date(review.created_at).toLocaleDateString('id-ID')}
            </span>
            {onDelete && (
              <button onClick={() => onDelete(review.id)} className="text-xs text-red-400 hover:text-red-600">Hapus</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
