import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Group from './pages/Group'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/g/:groupId" element={<Group />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
