import { useEffect, useRef, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router'
import {
  Bell,
  BookOpenText,
  Briefcase,
  ChevronDown,
  Gavel,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users2,
  X,
  History,
  Clock,
  Cloud,
  FileText,
  Plus,
  Shield,
  Sun,
  Moon,
  AlertTriangle,
  User,
  SlidersHorizontal,
} from 'lucide-react'
import { judicialStore } from './lib/judicialStore'
import { isSupabaseConfigured } from './lib/supabase'
import { cn, useApp, Button } from './ui'

const navGeneral = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/schedule', label: 'Schedule', icon: History },
  { to: '/cases', label: 'Case Files', icon: Briefcase },
  { to: '/criminals', label: 'Criminals', icon: Users2 },
  { to: '/lawyers', label: 'Lawyers', icon: Scale },
]

const navTools = [
  { to: '/research', label: 'AI Precedents', icon: Sparkles },
  { to: '/law-reference', label: 'Law Reference', icon: BookOpenText },
  { to: '/judgments', label: 'Judgments', icon: Gavel },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/cases/new', label: 'Intake Case', icon: Plus },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [close])
  return ref
}

function GlobalSearch() {
  const [q, setQ] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [open, setOpen] = useState(false)
  const navTo = useNavigate()
  const ref = useOutside(() => setOpen(false))

  const cases = judicialStore.getCases()

  const matchedCriminals = q.trim()
    ? judicialStore.searchCriminals(q).slice(0, 4)
    : []

  const matchedCases = q.trim()
    ? cases.filter((c) =>
        (c.number + ' ' + c.title).toLowerCase().includes(q.toLowerCase())
      ).slice(0, 4)
    : []

  return (
    <div ref={ref} className="relative w-full max-w-2xl lg:max-w-3xl">
      <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white/95 backdrop-blur-md px-5 py-2.5 shadow-sm transition-all focus-within:border-black focus-within:bg-white focus-within:shadow-md">
        <Search className="size-5 text-zinc-500 shrink-0 ml-0.5" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search criminals by name, ID or case no (e.g. Rahul Verma, S.C. 214)..."
          className="h-9 w-full bg-transparent text-sm sm:text-[15px] font-semibold text-foreground placeholder:text-zinc-400 focus:outline-none"
        />

        {/* Category Pills (Like in Image 2 header) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 shrink-0 border-l border-zinc-200 pl-3">
          <span className="text-[11px] text-zinc-400 font-bold">In:</span>
          {['Criminals', 'Cases', 'Law'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                filterType === cat ? 'bg-zinc-900 text-white font-bold shadow-xs' : 'hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {open && q.trim() && (
        <div className="slidein absolute left-0 right-0 top-14 z-50 rounded-2xl border border-black/10 bg-white p-3.5 shadow-2xl space-y-2 max-h-96 overflow-y-auto">
          {matchedCriminals.length === 0 && matchedCases.length === 0 && (
            <div className="p-4 text-center text-xs text-zinc-400">
              No results match "{q}"
            </div>
          )}

          {matchedCriminals.length > 0 && (
            <div>
              <div className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                Criminal Record Dossiers
              </div>
              {matchedCriminals.map((crm) => (
                <button
                  key={crm.id}
                  className="w-full p-2.5 rounded-xl text-left hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => {
                    navTo(`/criminals/${crm.id}`)
                    setOpen(false)
                    setQ('')
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 place-items-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                      {crm.photoPlaceholder}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900">{crm.name}</div>
                      <div className="text-[11px] text-zinc-500">{crm.crimId} · {crm.custodyStatus}</div>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold">
                    {(crm.recidivismScore * 100).toFixed(0)}% Risk
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedCases.length > 0 && (
            <div className="pt-1 border-t border-zinc-100">
              <div className="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                Active Cases
              </div>
              {matchedCases.map((c) => (
                <button
                  key={c.id}
                  className="w-full p-2.5 rounded-xl text-left hover:bg-zinc-50 flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => {
                    navTo(`/cases/${c.id}`)
                    setOpen(false)
                    setQ('')
                  }}
                >
                  <div>
                    <div className="font-bold text-xs text-[#FF5C5C]">{c.number}</div>
                    <div className="text-[11px] text-zinc-700 truncate max-w-xs">{c.title}</div>
                  </div>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    {c.stage}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlarmsDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const ref = useOutside(onClose)
  const alarms = judicialStore.getAlarms()
  const { toast } = useApp()

  if (!open) return null

  return (
    <div
      ref={ref}
      className="slidein absolute right-0 top-12 z-50 w-96 rounded-3xl border border-black/8 bg-white p-5 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <Bell className="size-4 text-[#FF5C5C]" />
          <span>Statutory Alarms &amp; Schedule</span>
        </div>
        <button
          onClick={onClose}
          className="grid size-7 place-items-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 text-xs cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {alarms.map((a) => (
          <div key={a.id} className="p-3.5 rounded-2xl border border-black/5 bg-zinc-50/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.urgency === 'STATUTORY_CRITICAL'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {a.urgency.replace(/_/g, ' ')}
              </span>
              <span className="text-[10.5px] text-zinc-400 font-mono">{a.triggerTime}</span>
            </div>
            <div className="font-bold text-xs text-foreground">{a.title}</div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">{a.message}</p>
            <div className="pt-1 flex items-center justify-between">
              {a.caseNumber && (
                <span className="text-[11px] text-[#FF5C5C] font-semibold">{a.caseNumber}</span>
              )}
              {!a.isAcknowledged && (
                <button
                  onClick={() => {
                    judicialStore.acknowledgeAlarm(a.id)
                    toast('Alarm acknowledged', 'info')
                  }}
                  className="text-[10.5px] px-2.5 py-1 rounded-full bg-white border border-black/10 hover:bg-zinc-100 font-medium cursor-pointer"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Layout() {
  const { authed, setAuthed, role, theme, setTheme } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alarmsOpen, setAlarmsOpen] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const alarms = judicialStore.getAlarms()
  const unreadAlarms = alarms.filter((a) => !a.isAcknowledged).length

  if (!authed) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-foreground flex p-2 md:p-3.5">
      {/* Sleek Dark Rounded Sidebar (Matching Images 2 & 3) */}
      <aside
        className={`w-56 bg-[#121316] text-white rounded-[28px] shrink-0 flex flex-col justify-between p-4.5 shadow-2xl transition-all ${
          mobileMenuOpen ? 'fixed inset-y-3 left-3 z-50 w-64' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo with Coral Pill Dot */}
          <div className="flex items-center justify-between px-2 pt-1">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans lowercase">
                nyayadesk
              </span>
              <span className="size-2 rounded-full bg-[#FF5C5C]" />
            </NavLink>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* General Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              General
            </div>
            {navGeneral.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#222328] text-white shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Tools Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Court Tools
            </div>
            {navTools.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#222328] text-white shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Profile / Exit */}
        <div className="border-t border-white/10 pt-4 px-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-[#FF5C5C] text-white font-bold text-xs grid place-items-center shrink-0">
              VR
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">Hon. Justice Venkataraman</div>
              <div className="text-[10px] text-zinc-400">Bench 04 · Sessions</div>
            </div>
          </div>

          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 px-2 md:px-5 py-1">
        {/* Top Floating Utility Header */}
        <header className="min-h-20 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid size-11 place-items-center rounded-full bg-white border border-black/10 text-zinc-800 shadow-sm"
            >
              <Menu className="size-5" />
            </button>
            <span className="font-black text-lg tracking-tight text-foreground lowercase">
              nyayadesk
            </span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl lg:max-w-3xl">
            <GlobalSearch />
          </div>

          {/* Right Action Icons (Enlarged per user request) */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Supabase Cloud Connection status badge (Bigger) */}
            <NavLink
              to="/settings"
              className={`hidden lg:flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white border text-xs sm:text-sm font-bold shadow-sm hover:border-black/25 transition-all ${
                isSupabaseConfigured()
                  ? 'border-black/10 text-emerald-800'
                  : 'border-amber-300 text-amber-900 bg-amber-50/50'
              }`}
            >
              <span
                className={`size-2.5 rounded-full ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span>{isSupabaseConfigured() ? 'Supabase: Connected' : 'DB: Setup API Key'}</span>
            </NavLink>

            {/* Notification Bell with Badge (Bigger) */}
            <div className="relative">
              <button
                onClick={() => setAlarmsOpen(!alarmsOpen)}
                className="grid size-12 sm:size-12.5 place-items-center rounded-full bg-white border border-black/10 text-zinc-800 hover:bg-zinc-50 shadow-sm hover:border-black/25 transition-all cursor-pointer"
                title="Statutory Alarms"
              >
                <Bell className="size-5.5 text-zinc-700" />
                {unreadAlarms > 0 && (
                  <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-[#FF5C5C] ring-2 ring-white" />
                )}
              </button>
              <AlarmsDrawer open={alarmsOpen} onClose={() => setAlarmsOpen(false)} />
            </div>

            {/* Theme Toggle (Bigger) */}
            <button
              onClick={() => setTheme(theme === 'swiss-light' ? 'tactical-dark' : 'swiss-light')}
              className="grid size-12 sm:size-12.5 place-items-center rounded-full bg-white border border-black/10 text-zinc-800 hover:bg-zinc-50 shadow-sm hover:border-black/25 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'swiss-light' ? (
                <Moon className="size-5.5 text-zinc-700" />
              ) : (
                <Sun className="size-5.5 text-amber-500" />
              )}
            </button>

            {/* Profile Avatar Pill Button (Bigger) */}
            <NavLink
              to="/settings"
              className="flex items-center gap-3 pl-2.5 pr-4.5 py-2 rounded-full bg-white border border-black/10 shadow-sm hover:border-black/25 transition-all cursor-pointer"
            >
              <div className="size-9 sm:size-9.5 rounded-full bg-zinc-950 text-white font-black text-xs sm:text-sm grid place-items-center shadow-xs">
                VR
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-sm font-black text-zinc-900 block leading-tight">
                  Judge
                </span>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
