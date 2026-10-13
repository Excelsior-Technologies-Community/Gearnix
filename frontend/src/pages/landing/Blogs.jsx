import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBlogs } from '../../api/catalogApi'
import { formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBlogs(true).then(setBlogs).catch(() => setBlogs([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Blog</h1>
      <p className="mt-2 text-slate-400">News, guides and reviews from the Gearnix team.</p>

      {loading ? (
        <Spinner label="Loading posts…" />
      ) : blogs.length === 0 ? (
        <p className="py-20 text-center text-slate-400">No posts yet.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Link
              key={b.id}
              to={`/blog/${b.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border card transition hover:border-fuchsia-500/60"
            >
              <div className="aspect-video bg-slate-800">
                {b.featured_image && (
                  <img src={b.featured_image} alt={b.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs text-slate-500">{formatDate(b.created_at)} · {b.author || 'Gearnix'}</span>
                <h2 className="mt-1 font-semibold text-slate-100 group-hover:text-white">{b.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-400">{b.excerpt}</p>
                <span className="mt-3 text-sm font-medium text-fuchsia-400">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
