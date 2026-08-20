import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Group from './pages/Group'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <header>
        <div className="mx-auto max-w-xl px-6 py-4">
          <Link to="/" className="font-maru text-xl font-bold text-wakaba">
            Rinban
          </Link>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/g/:groupId" element={<Group />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
