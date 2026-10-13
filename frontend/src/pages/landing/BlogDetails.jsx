import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBlogBySlug } from '../../api/catalogApi'
import { formatDate } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

export default function BlogDetails() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getBlogBySlug(slug)
      .then(setBlog)
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Spinner label="Loading post…" />
  if (notFound || !blog)
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-fuchsia-400 hover:text-fuchsia-300">← Back to blog</Link>
      </div>
    )

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/blog" className="text-sm text-fuchsia-400 hover:text-fuchsia-300">← Back to blog</Link>
      <h1 className="mt-4 text-4xl font-extrabold text-white">{blog.title}</h1>
      <p className="mt-3 text-sm text-slate-500">{formatDate(blog.created_at)} · {blog.author || 'Gearnix'}</p>

      {blog.featured_image && (
        <img src={blog.featured_image} alt={blog.title} className="mt-6 w-full rounded-xl border border-[var(--border)] object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
      )}

      <div className="mt-8 whitespace-pre-line leading-relaxed text-slate-300">
        {blog.content}
      </div>
    </article>
  )
}
