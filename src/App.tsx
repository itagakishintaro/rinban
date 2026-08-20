import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Group from './pages/Group'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-xl px-8 py-3">
          <Link to="/" className="text-lg font-bold text-blue-700">
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
