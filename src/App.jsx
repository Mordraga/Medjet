import { Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import JournalPage from './pages/JournalPage'
import TarotPage from './pages/TarotPage'
import GuidePage from './pages/GuidePage'
import './App.css'

const NAV = [
  { to: '/',        label: 'Home',    end: true  },
  { to: '/journal', label: 'Journal', end: false },
  { to: '/tarot',   label: 'Tarot',   end: false },
  { to: '/guide',   label: 'Guide',   end: false }
]

function NavLinks() {
  return NAV.map(({ to, label, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) => `tab-link${isActive ? ' active' : ''}`}
    >
      {label}
    </NavLink>
  ))
}

function App() {
  return (
    <div>
      <header className="app-header">
        <span className="app-brand">Medjet</span>
        <nav className="app-header-nav">
          <NavLinks />
        </nav>
      </header>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/tarot"   element={<TarotPage />} />
        <Route path="/guide"   element={<GuidePage />} />
      </Routes>
      <nav className="app-tabs">
        <NavLinks />
      </nav>
    </div>
  )
}

export default App
