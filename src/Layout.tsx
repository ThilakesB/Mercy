import { useEffect, useRef, useState } from "react"
import { NavLink, Navigate, Outlet, useNavigate } from "react-router"
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
  FileCheck,
  Plus,
  Shield,
  Sun,
  Moon,
  AlertTriangle,
  User,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { judicialStore } from "./lib/judicialStore"
import { isSupabaseConfigured } from "./lib/supabase"
import { cn, useApp, Button } from "./ui"

const navGeneral = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schedule", label: "Schedule", icon: History },
  { to: "/cases", label: "Case Files", icon: Briefcase },
  { to: "/criminals", label: "Criminals", icon: Users2 },
  { to: "/lawyers", label: "Lawyers", icon: Scale },
]

const navTools = [
  { to: "/research", label: "AI Precedents", icon: Sparkles },
  { to: "/law-reference", label: "Law Reference", icon: BookOpenText },
  { to: "/judgments", label: "Judgments", icon: Gavel },
  { to: "/documents", label: "Documents", icon: FileText },
  {
    to: "/cases/final-judgment",
    label: "Final Judgment Case",
    icon: FileCheck,
  },
  { to: "/settings", label: "Settings", icon: Settings },
]

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) =>
      ref.current && !ref.current.contains(e.target as Node) && close()
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [close])
  return ref
}

function GlobalSearch() {
  const [q, setQ] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [open, setOpen] = useState(false)
  const navTo = useNavigate()
  const ref = useOutside(() => setOpen(false))

  const cases = judicialStore.getCases()

  const matchedCriminals = q.trim()
    ? judicialStore.searchCriminals(q).slice(0, 4)
    : []

  const matchedCases = q.trim()
    ? cases
        .filter((c) =>
          (c.number + " " + c.title).toLowerCase().includes(q.toLowerCase()),
        )
        .slice(0, 4)
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
          {["Criminals", "Cases", "Law"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                filterType === cat
                  ? "bg-zinc-900 text-white font-bold shadow-xs"
                  : "hover:bg-zinc-100 text-zinc-600"
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
                    setQ("")
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 place-items-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                      {crm.photoPlaceholder}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-900">
                        {crm.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {crm.crimId} · {crm.custodyStatus}
                      </div>
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
                    setQ("")
                  }}
                >
                  <div>
                    <div className="font-bold text-xs text-[#FF5C5C]">
                      {c.number}
                    </div>
                    <div className="text-[11px] text-zinc-700 truncate max-w-xs">
                      {c.title}
                    </div>
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
          <div
            key={a.id}
            className="p-3.5 rounded-2xl border border-black/5 bg-zinc-50/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.urgency === "STATUTORY_CRITICAL"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {a.urgency.replace(/_/g, " ")}
              </span>
              <span className="text-[10.5px] text-zinc-400 font-mono">
                {a.triggerTime}
              </span>
            </div>
            <div className="font-bold text-xs text-foreground">{a.title}</div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {a.message}
            </p>
            <div className="pt-1 flex items-center justify-between">
              {a.caseNumber && (
                <span className="text-[11px] text-[#FF5C5C] font-semibold">
                  {a.caseNumber}
                </span>
              )}
              {!a.isAcknowledged && (
                <button
                  onClick={() => {
                    judicialStore.acknowledgeAlarm(a.id)
                    toast("Alarm acknowledged", "info")
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
  const {
    authed,
    setAuthed,
    user,
    logout,
    isAuthReady,
    role,
    theme,
    setTheme,
  } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [alarmsOpen, setAlarmsOpen] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mercy_sidebar_hidden") === "true"
    }
    return false
  })
  const [, setTick] = useState(0)

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem("mercy_sidebar_hidden", String(next))
      }
      return next
    })
  }

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const alarms = judicialStore.getAlarms()
  const unreadAlarms = alarms.filter((a) => !a.isAcknowledged).length

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#F7F4EB] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-14 rounded-2xl bg-[#121316] text-white grid place-items-center shadow-xl animate-pulse">
          <Scale className="size-7 text-[#FF5C5C]" />
        </div>
        <div className="mt-4 font-sans font-bold text-base text-zinc-900 tracking-tight">
          Verifying Judicial Security Credentials...
        </div>
        <div className="text-xs text-zinc-400 font-mono mt-1">
          Mercy High-Security Terminal · Bench 04
        </div>
      </div>
    )
  }

  if (!authed) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex p-2 md:p-3.5 transition-colors duration-200">
      {/* Sleek Dark Rounded Sidebar with Smooth Hardware-Accelerated Transition */}
      <aside
        className={`bg-[#121316] text-white rounded-[28px] shrink-0 flex flex-col justify-between shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none z-40 ${
          mobileMenuOpen
            ? "fixed inset-y-3 left-3 z-50 w-64 p-4.5 translate-x-0 opacity-100"
            : sidebarHidden
              ? "w-0 opacity-0 -translate-x-12 p-0 m-0 pointer-events-none overflow-hidden border-0"
              : "hidden md:flex w-60 opacity-100 translate-x-0 p-4.5 overflow-hidden"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo with Coral Pill Dot */}
          <div className="flex items-center justify-between px-2 pt-1">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white font-sans">
                Mercy
              </span>
              <span className="size-2 rounded-full bg-[#FF5C5C]" />
            </NavLink>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
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
                end={item.to === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#222328] text-white shadow-xs font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
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
                      ? "bg-[#222328] text-white shadow-xs font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
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
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="size-8 rounded-full object-cover ring-1 ring-white/20 shrink-0"
              />
            ) : (
              <div className="size-8 rounded-full bg-[#FF5C5C] text-white font-bold text-xs grid place-items-center shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || "Hon. Judge"}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {user?.email || "Bench 04 · Sessions"}
              </div>
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

      {/* Creative Brutalist Intersecting Seam Tab Button (Desktop) */}
      <div className="hidden md:flex items-center relative z-50 self-center -ml-3 mr-1">
        <button
          type="button"
          onClick={toggleSidebar}
          className={`group relative flex flex-col items-center justify-center py-4 px-1.5 rounded-full border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#FF5C5C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
            sidebarHidden
              ? "bg-black text-white hover:bg-zinc-900 ring-2 ring-black/20"
              : "bg-[#FAF8F2] text-black hover:bg-white"
          }`}
          title={
            sidebarHidden
              ? "Expand Terminal Sidebar (Ctrl+B)"
              : "Hide Terminal Sidebar (Ctrl+B)"
          }
        >
          <div className="flex flex-col items-center gap-1.5 text-[9px] font-mono font-black">
            <span
              className={`size-1.5 rounded-full ${
                sidebarHidden ? "bg-[#FF5C5C] animate-pulse" : "bg-emerald-500"
              }`}
            />
            {sidebarHidden ? (
              <ChevronRight className="size-3 text-[#FF5C5C] group-hover:scale-125 transition-transform" />
            ) : (
              <ChevronLeft className="size-3 text-black group-hover:scale-125 transition-transform" />
            )}
            <span className="size-1 rounded-full bg-zinc-400" />
          </div>
        </button>
      </div>

      {/* Main Content Area with Smooth Fluid Transition */}
      <div className="flex-1 flex flex-col min-w-0 px-2 md:px-5 py-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* Top Floating Utility Header */}
        <header className="min-h-20 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid size-11 place-items-center rounded-full bg-white border border-black/10 text-zinc-800 shadow-sm md:hidden cursor-pointer"
            >
              <Menu className="size-5" />
            </button>

            {/* Creative Swiss Brutalist Sidebar Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className={`hidden md:inline-flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-black font-mono font-black text-xs transition-all cursor-pointer shadow-[3px_3px_0px_#121316] hover:shadow-[4px_4px_0px_#FF5C5C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 ${
                sidebarHidden
                  ? "bg-black text-white hover:bg-zinc-900 ring-1 ring-black"
                  : "bg-[#FAF8F2] text-black hover:bg-white"
              }`}
              title={
                sidebarHidden
                  ? "Expand Terminal Sidebar (Ctrl+B)"
                  : "Collapse Terminal Sidebar (Ctrl+B)"
              }
            >
              <span
                className={`size-2 rounded-full ${
                  sidebarHidden
                    ? "bg-[#FF5C5C] animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              {sidebarHidden ? (
                <>
                  <PanelLeftOpen className="size-4 text-[#FF5C5C]" />
                  <span className="tracking-wider">[ ☵ SHOW SIDEBAR ]</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="size-4 text-zinc-700" />
                  <span className="tracking-wider">[ ◀ FOLD SIDEBAR ]</span>
                </>
              )}
            </button>

            {/* Brand Logo when sidebar is hidden on desktop, or always on mobile */}
            <div
              className={`items-center gap-2 ${
                sidebarHidden ? "flex" : "flex md:hidden"
              }`}
            >
              <NavLink to="/" className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-foreground font-sans">
                  Mercy
                </span>
                <span className="size-2 rounded-full bg-[#FF5C5C]" />
              </NavLink>
            </div>
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
                  ? "border-black/10 text-emerald-800"
                  : "border-amber-300 text-amber-900 bg-amber-50/50"
              }`}
            >
              <span
                className={`size-2.5 rounded-full ${
                  isSupabaseConfigured()
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              <span>
                {isSupabaseConfigured()
                  ? "Supabase: Connected"
                  : "DB: Setup API Key"}
              </span>
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
              <AlarmsDrawer
                open={alarmsOpen}
                onClose={() => setAlarmsOpen(false)}
              />
            </div>

            {/* Theme Toggle (Bigger) */}
            <button
              onClick={() =>
                setTheme(
                  theme === "swiss-light" ? "tactical-dark" : "swiss-light",
                )
              }
              className="grid size-12 sm:size-12.5 place-items-center rounded-full bg-white border border-black/10 text-zinc-800 hover:bg-zinc-50 shadow-sm hover:border-black/25 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === "swiss-light" ? (
                <Moon className="size-5.5 text-zinc-700" />
              ) : (
                <Sun className="size-5.5 text-amber-500" />
              )}
            </button>

            {/* Profile Avatar Pill Button with Google User & Sign Out */}
            <div className="flex items-center gap-2">
              <NavLink
                to="/settings"
                className="flex items-center gap-3 pl-2 sm:pl-2.5 pr-3.5 sm:pr-4 py-1.5 sm:py-2 rounded-full bg-white border border-black/10 shadow-sm hover:border-black/25 transition-all cursor-pointer"
                title={
                  user?.email
                    ? `${user.name} (${user.email})`
                    : "Settings & Profile"
                }
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="size-8 sm:size-9 rounded-full object-cover ring-1 ring-black/10"
                  />
                ) : (
                  <div className="size-8 sm:size-9 rounded-full bg-zinc-950 text-white font-black text-xs sm:text-sm grid place-items-center shadow-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "VR"}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="text-xs sm:text-sm font-black text-zinc-900 block leading-tight truncate max-w-[120px]">
                    {user?.name || "Judge"}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium block truncate max-w-[120px]">
                    {user?.email || "Sessions Court"}
                  </span>
                </div>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  logout()
                  window.location.href = "/login"
                }}
                className="grid size-10 sm:size-11 place-items-center rounded-full bg-white border border-black/10 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 shadow-sm hover:border-rose-200 transition-all cursor-pointer"
                title="Sign out of Bench Terminal"
              >
                <LogOut className="size-4.5" />
              </button>
            </div>
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
