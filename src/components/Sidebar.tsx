import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events', icon: CalendarDays, label: 'Eventos' },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col w-64 bg-[#07202f] text-white min-h-screen">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">LocalHero</h1>
        <p className="text-sm text-white/60 mt-1">Partners</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-[#f87c29] flex items-center justify-center text-sm font-bold">
            {user?.first_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 mt-2 w-full rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  )
}
