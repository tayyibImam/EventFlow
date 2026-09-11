// NotFound — 404 error page displayed when no route matches.
// Provides a back-to-home link and a friendly error message.
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        {/* Question mark icon */}
        <div className="not-found-icon"><FileQuestion size={28} /></div>
        {/* Error code */}
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>This page is not available yet or the address may be incorrect.</p>
        {/* Back to home link */}
        <a className="not-found-link" href="/">
          <ArrowLeft size={15} /> Back to EventFlow
        </a>
      </div>
    </main>
  )
}
