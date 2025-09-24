import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: (active) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 ${active ? 'text-orange-500' : 'text-zinc-300'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { to: '/profile', label: 'Profile', icon: (active) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 ${active ? 'text-orange-500' : 'text-zinc-300'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.236.8 5.879 2.137M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )},
  { to: '/saved', label: 'Saved', icon: (active) => (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 ${active ? 'text-orange-500' : 'text-zinc-300'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
    </svg>
  )},
]

const BottomNav = ({ className = '' }) => {
  const location = useLocation()

  return (
    <nav className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[480px] rounded-2xl bg-zinc-900/60 backdrop-blur-lg border border-zinc-800/70 shadow-2xl ${className}`}>
      <ul className="grid grid-cols-3">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          return (
            <li key={item.to}>
              <NavLink to={item.to} className="flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 hover:bg-zinc-800/60">
                <div className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                  {item.icon(isActive)}
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-orange-500' : 'text-zinc-300'}`}>{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav


