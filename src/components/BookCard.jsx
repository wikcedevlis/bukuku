const COVERS = [
  '[images.unsplash.com](https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80)',
  '[images.unsplash.com](https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80)',
  '[images.unsplash.com](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80)',
]

export default function BookCard({ book, action }) {
  const fallback = COVERS[book.id % COVERS.length]
  return (
    <div className="card flex gap-4 items-start">
      <img
        src={book.cover_url || fallback}
        alt={book.title}
        className="w-16 h-24 object-cover rounded-lg shadow flex-shrink-0 bg-brown-100"
        onError={e => { e.target.src = fallback }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-brown-900 truncate">{book.title}</h3>
        <p className="text-sm text-brown-500">{book.author}</p>
        {book.genre && <span className="inline-block mt-1 text-xs bg-brown-100 text-brown-600 px-2 py-0.5 rounded-full">{book.genre}</span>}
        {action}
      </div>
    </div>
  )
}
