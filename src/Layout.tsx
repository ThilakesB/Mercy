import { useEffect, useRef, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
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
  TimerReset,
  Users2,
  X,
  Globe,
  FlaskConical,
  History,
  Siren,
  Command,
} from 'lucide-react'
import { alerts, cases } from './data'
import { cn, useApp, type Role } from './ui'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: Briefcase },
  { to: '/evidence', label: 'Evidence Tracker', icon: FlaskConical },
  { to: '/timeline', label: 'Timeline', icon: History },
  { to: '/police', label: 'Police Activity', icon: Siren },
  { to: '/alerts', label: 'Alerts', icon: TimerReset },
  { to: '/summary', label: 'AI Case Digest', icon: Sparkles },
  { to: '/research', label: 'Legal Research', icon: BookOpenText, soon: true },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
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
  const [open, setOpen] = useState(false)
  const navTo = useNavigate()
  const ref = useOutside(() => setOpen(false))

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const res = q.trim()
    ? cases
        .filter((c) =>
          (c.number + c.title + c.parties.map((p) => (p.masked ? '' : p.name)).join(' '))
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .slice(0, 5)
    : []

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        aria-label="Search cases by number or party"
        placeholder="Search case no. or party..."
        className="h-8.5 w-full rounded-lg border border-border bg-zinc-100 pl-8.5 pr-14 text-xs text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-black focus:bg-white"
      />
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9.5px] text-muted-foreground">
        <Command className="size-2.5" /> K
      </div>
      {open && q.trim() && (
        <ul className="slidein absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-border bg-elevated shadow-2xl">
          {res.length === 0 && (
            <li className="px-4 py-3 text-xs text-muted-foreground">No case matches "{q}"</li>
          )}
          {res.map((c) => (
            <li key={c.id}>
              <button
                className="block w-full px-4 py-2.5 text-left border-b border-border/50 last:border-0 hover:bg-white/[0.04] cursor-pointer"
                onClick={() => {
                  navTo(`/cases/${c.id}`)
                  setOpen(false)
                  setQ('')
                }}
              >
                <div className="font-mono text-[11px] text-accent">{c.number} · {c.type}</div>
                <div className="text-xs font-medium text-foreground truncate">{c.title}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  const dot = { overdue: 'bg-white', warning: 'bg-zinc-400', ontrack: 'bg-zinc-600' }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative grid size-8.5 place-items-center rounded-lg border border-border bg-[#0d0e11] hover:bg-white/[0.05] cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="size-3.5" />
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-white" />
      </button>
      {open && (
        <div className="slidein absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-elevated shadow-2xl">
          <div className="border-b border-border px-4 py-3 font-serif text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Alerts & Notifications</span>
            <span className="font-mono text-[10px] text-muted-foreground">5 active</span>
          </div>
          <ul className="max-h-72 overflow-auto divide-y divide-border/60">
            {alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="flex gap-2.5 px-4 py-2.5 hover:bg-white/[0.02]">
                <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', dot[a.sev])} />
                <div>
                  <p className="text-xs text-foreground leading-snug">{a.text}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const { role, setRole, setAuthed, toast } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useOutside(() => setOpen(false))
  const navTo = useNavigate()
  const name =
    role === 'Judge'
      ? 'Hon. R. Venkataraman'
      : role === 'Clerk'
      ? 'M. Kalaivani'
      : 'D. Anandhi'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8.5 items-center gap-2 rounded-lg border border-border bg-[#12151c] pl-1.5 pr-2.5 hover:bg-white/[0.05] cursor-pointer transition-colors"
      >
        <span className="grid size-6 place-items-center rounded bg-secondary text-[10px] font-semibold text-foreground">
          {name.split(' ').pop()![0]}
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-xs font-medium text-foreground">{name}</span>
        </span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      {open && (
        <div
          role="menu"
          className="slidein absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-elevated p-1.5 shadow-2xl"
        >
          <p className="px-2.5 pb-1 pt-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Switch Bench Role
          </p>
          {(['Judge', 'Clerk', 'Admin'] as Role[]).map((r) => (
            <button
              key={r}
              role="menuitemradio"
              aria-checked={role === r}
              onClick={() => {
                setRole(r)
                toast(`Viewing as ${r}`, 'info')
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs hover:bg-white/[0.05] cursor-pointer',
                role === r ? 'font-medium text-foreground bg-white/[0.03]' : 'text-muted-foreground',
              )}
            >
              <span>{r}</span>
              {role === r && <span className="size-1 rounded-full bg-accent" />}
            </button>
          ))}
          <div className="my-1 h-px bg-border/70" />
          <button
            onClick={() => {
              setOpen(false)
              navTo('/settings')
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] cursor-pointer"
          >
            <Settings className="size-3.5" /> Bench settings
          </button>
          <button
            onClick={() => {
              setAuthed(false)
              navTo('/login')
            }}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-bad hover:bg-bad-bg cursor-pointer"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { authed, role } = useApp()
  const [drawer, setDrawer] = useState(false)
  const loc = useLocation()
  useEffect(() => setDrawer(false), [loc.pathname])

  if (!authed) return <Navigate to="/login" replace />

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-foreground border-r border-border/80">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/60">
        <div className="grid size-8.5 place-items-center rounded-lg border border-border bg-black text-white">
          <Scale className="size-4.5" />
        </div>
        <div>
          <div className="font-serif text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
            Mercy
          </div>
          <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground">
            Court Decision Support
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3" aria-label="Primary Navigation">
        {nav.map((n, i) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer',
                isActive || (n.to === '/cases' && loc.pathname.startsWith('/cases'))
                  ? 'bg-black font-semibold text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-zinc-100 hover:text-foreground border border-transparent',
              )
            }
          >
            <span className="w-4 font-mono text-[10px] text-muted-foreground/80">
              {String(i + 1).padStart(2, '0')}
            </span>
            <n.icon className="size-3.5 shrink-0" />
            <span className="flex-1 truncate">{n.label}</span>
            {n.soon && (
              <span className="rounded border border-border bg-muted px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border/60 space-y-2">
        <NavLink
          to="/public"
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-zinc-100 hover:text-foreground transition-colors"
        >
          <Globe className="size-3.5 shrink-0" />
          <span>Citizen case status preview</span>
        </NavLink>
        <div className="rounded-lg border border-border/70 bg-zinc-100 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <Gavel className="mb-1 size-3.5 text-black" />
          Decision support only. Mercy never recommends guilt, innocence or legal outcomes.
        </div>
        <div className="flex items-center justify-between px-1 text-[10.5px] text-muted-foreground font-mono">
          <span>Active Role</span>
          <span className="text-foreground font-semibold">{role}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>
      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDrawer(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      )}
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/80 bg-white/90 px-4 py-2.5 backdrop-blur-md md:px-8">
          <button
            className="grid size-8.5 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
            onClick={() => setDrawer(!drawer)}
            aria-label="Toggle navigation menu"
          >
            {drawer ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-zinc-100 px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-black" />
              Bench: {role}
            </span>
            <Notifications />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <footer className="border-t border-border/70 px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
          <span className="font-serif font-medium text-foreground">
            AI assists the judge. Final adjudication is strictly human.
          </span>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">
            Mercy · Sessions Court Chennai · Audit logged
          </span>
        </footer>
      </div>
    </div>
  )
}
