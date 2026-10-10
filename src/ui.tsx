import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, FileText, Info, Sparkles, X, XCircle } from 'lucide-react'
import type { Src, Status } from './data'
import { statusLabel } from './data'

export type Role = 'Judge' | 'Clerk' | 'Admin'
export interface UserProfile {
  name: string
  email: string
  photoURL?: string | null
}
type Toast = { id: number; msg: string; kind: 'ok' | 'info' | 'bad' }

export const AUTHORIZED_EMAILS = ['thilakesb@gmail.com', 'bthilakes@gmail.com']

interface Ctx {
  role: Role
  setRole: (r: Role) => void
  user: UserProfile | null
  setUser: (u: UserProfile | null) => void
  logout: () => void
  toast: (msg: string, kind?: Toast['kind']) => void
  revealed: boolean
  setRevealed: (v: boolean) => void
  authed: boolean
  setAuthed: (v: boolean) => void
  isAuthReady: boolean
  theme: 'swiss-light' | 'tactical-dark'
  setTheme: (t: 'swiss-light' | 'tactical-dark') => void
}

const AppCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Judge')
  const [revealed, setRevealed] = useState(false)
  const [authed, setAuthedState] = useState<boolean>(false)
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [theme, setThemeState] = useState<'swiss-light' | 'tactical-dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mercy_theme_mode')
      if (saved === 'tactical-dark' || saved === 'swiss-light') return saved
    }
    return 'swiss-light'
  })

  // Real-time Firebase Authentication listener & Strict Email Enforcement
  useEffect(() => {
    let unsub = () => {}
    import('./lib/firebase').then(({ auth, onAuthStateChanged, signOutFromFirebase }) => {
      unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && fbUser.email) {
          const email = fbUser.email.trim().toLowerCase()
          if (AUTHORIZED_EMAILS.includes(email)) {
            const profile: UserProfile = {
              name: fbUser.displayName || email.split('@')[0],
              email: fbUser.email,
              photoURL: fbUser.photoURL,
            }
            setAuthedState(true)
            setUserState(profile)
            if (typeof window !== 'undefined') {
              localStorage.setItem('mercy_authed', 'true')
              localStorage.setItem('mercy_user', JSON.stringify(profile))
            }
          } else {
            // Unwhitelisted account: forcefully sign out and clear credentials
            signOutFromFirebase().catch(() => {})
            setAuthedState(false)
            setUserState(null)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('mercy_authed')
              localStorage.removeItem('mercy_user')
            }
          }
        } else {
          // Check if valid passkey session exists
          const savedAuthed = typeof window !== 'undefined' ? localStorage.getItem('mercy_authed') : null
          const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('mercy_user') : null
          if (savedAuthed === 'true' && savedUserStr) {
            try {
              const parsed = JSON.parse(savedUserStr)
              if (parsed?.email && AUTHORIZED_EMAILS.includes(parsed.email.toLowerCase().trim())) {
                setAuthedState(true)
                setUserState(parsed)
              } else {
                setAuthedState(false)
                setUserState(null)
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('mercy_authed')
                  localStorage.removeItem('mercy_user')
                }
              }
            } catch {
              setAuthedState(false)
              setUserState(null)
            }
          } else {
            setAuthedState(false)
            setUserState(null)
          }
        }
        setIsAuthReady(true)
      })
    })

    return () => unsub()
  }, [])

  const setAuthed = (v: boolean) => {
    setAuthedState(v)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_authed', v ? 'true' : 'false')
    }
  }

  const setUser = (u: UserProfile | null) => {
    setUserState(u)
    if (typeof window !== 'undefined') {
      if (u) localStorage.setItem('mercy_user', JSON.stringify(u))
      else {
        localStorage.removeItem('mercy_user')
        localStorage.removeItem('nyayadesk_user')
      }
    }
  }

  const logout = () => {
    setAuthed(false)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mercy_authed')
      localStorage.removeItem('nyayadesk_authed')
      localStorage.removeItem('mercy_user')
      localStorage.removeItem('nyayadesk_user')
    }
    import('./lib/firebase').then(({ signOutFromFirebase }) => {
      signOutFromFirebase().catch(() => {})
    })
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_theme_mode', theme)
      if (theme === 'tactical-dark') {
        document.documentElement.setAttribute('data-theme', 'tactical-dark')
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.setAttribute('data-theme', 'swiss-light')
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])

  const setTheme = (t: 'swiss-light' | 'tactical-dark') => {
    setThemeState(t)
  }

  const toast = useCallback((msg: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <AppCtx.Provider
      value={{
        role,
        setRole: (r) => {
          setRole(r)
          if (r !== 'Judge') setRevealed(false)
        },
        user,
        setUser,
        logout,
        toast,
        revealed,
        setRevealed,
        authed,
        setAuthed,
        isAuthReady,
        theme,
        setTheme,
      }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 font-sans" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="slidein flex max-w-sm items-center gap-3 rounded-2xl border border-black/8 bg-white/95 backdrop-blur-md px-4 py-3 text-xs text-zinc-900 shadow-xl"
          >
            {t.kind === 'ok' ? (
              <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] shrink-0">✓</span>
            ) : t.kind === 'bad' ? (
              <span className="grid size-6 place-items-center rounded-full bg-rose-100 text-rose-700 font-bold text-[11px] shrink-0">!</span>
            ) : (
              <span className="grid size-6 place-items-center rounded-full bg-amber-100 text-amber-700 font-bold text-[11px] shrink-0">i</span>
            )}
            <span className="font-medium leading-relaxed">{t.msg}</span>
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  )
}

export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'hazard' | 'secondary' | 'coral'
  size?: 'sm' | 'md' | 'lg'
}) {
  const v = {
    primary: 'bg-[#141518] text-white hover:bg-black font-semibold shadow-sm active:scale-[0.98]',
    hazard: 'bg-[#FF5C5C] text-white hover:bg-[#EE4B4B] font-semibold shadow-sm active:scale-[0.98]',
    coral: 'bg-[#FF5C5C] text-white hover:bg-[#EE4B4B] font-semibold shadow-sm active:scale-[0.98]',
    danger: 'bg-[#FF5C5C] text-white hover:bg-[#EE4B4B] font-semibold shadow-sm active:scale-[0.98]',
    secondary: 'bg-[#F0EDE4] text-zinc-900 hover:bg-[#E5E1D5] font-semibold active:scale-[0.98]',
    outline: 'border border-black/10 bg-white text-zinc-900 hover:bg-zinc-50 font-semibold active:scale-[0.98] shadow-xs',
    ghost: 'text-zinc-600 hover:text-black hover:bg-black/5 font-medium',
  }[variant]

  const s = {
    sm: 'h-8 px-3.5 text-xs rounded-full',
    md: 'h-9.5 px-4.5 text-xs rounded-full',
    lg: 'h-11 px-6 text-sm rounded-full',
  }[size]

  return (
    <button
      {...p}
      className={cn(
        'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 select-none disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap',
        s,
        v,
        className,
      )}
    />
  )
}

export function Card({
  className,
  children,
  ...p
}: React.HTMLAttributes<HTMLElement> & {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      {...p}
      className={cn(
        'rounded-3xl border border-black/[0.06] bg-white text-card-foreground card-shadow transition-all',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  sub,
  action,
  num,
}: {
  title: string
  sub?: string
  action?: ReactNode
  num?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.05] px-6 py-4.5">
      <div>
        <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          {num && (
            <span className="grid size-5.5 place-items-center rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold">
              {num}
            </span>
          )}
          <span>{title}</span>
        </h2>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string
  sub?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {sub && <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
    </div>
  )
}

export function StatusChip({ s }: { s: Status }) {
  const m = {
    ontrack: ['bg-emerald-50 text-emerald-700 border-emerald-200/60', 'On track'],
    warning: ['bg-amber-50 text-amber-700 border-amber-200/60', 'Warning'],
    overdue: ['bg-rose-50 text-rose-700 border-rose-200/60 font-bold', 'Overdue'],
  } as const
  const [cls, label] = m[s]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border',
        cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function Tag({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-black/8 bg-zinc-100/80 px-3 py-1 text-xs font-semibold text-zinc-800',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[11px] font-bold text-pink-700">
      <Sparkles className="size-3 text-pink-500" aria-hidden />
      AI Precedent Assistant
    </span>
  )
}

export function Citation({ src }: { src: Src }) {
  const { toast } = useApp()
  return (
    <button
      onClick={() => toast(`Opening docket: ${src.doc}, page ${src.page}`, 'info')}
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-800 hover:border-black transition-colors cursor-pointer"
    >
      <FileText className="size-3 text-zinc-500 shrink-0" aria-hidden />
      <span>{src.doc}</span>
      <span className="text-zinc-400">p.{src.page}</span>
    </button>
  )
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={cn(
        'h-10 w-full rounded-2xl border border-black/10 bg-white px-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-black focus:ring-2 focus:ring-black/5',
        p.className,
      )}
    />
  )
}

export function Select({
  children,
  className,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      className={cn(
        'h-10 rounded-2xl border border-black/10 bg-white px-4 text-xs font-medium text-foreground transition-all focus:border-black cursor-pointer',
        className,
      )}
    >
      {children}
    </select>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[]
  value: string
  onChange: (t: string) => void
}) {
  return (
    <div role="tablist" className="flex gap-2 overflow-x-auto p-1.5 bg-[#EFECE3]/70 rounded-full">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={cn(
            'whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer',
            value === t
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-black hover:bg-white/40',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'h-6.5 w-12 rounded-full p-1 transition-colors cursor-pointer',
        checked ? 'bg-[#FF5C5C]' : 'bg-zinc-300',
      )}
    >
      <div
        className={cn(
          'size-4.5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5.5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  if (!open) return null
  const sz = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className={cn('w-full rounded-3xl border border-black/10 bg-white text-card-foreground shadow-2xl slidein overflow-hidden', sz)}>
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4.5">
          <h3 className="text-sm font-bold text-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-black transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="grid place-items-center p-12 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-full bg-zinc-100 text-zinc-400">
        <FileText className="size-6" />
      </div>
      <div className="text-sm font-bold text-foreground">{title}</div>
      {text && <p className="mt-1 max-w-md text-xs text-muted-foreground">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Th({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'border-b border-black/[0.06] bg-zinc-50/70 px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td
      className={cn(
        'border-b border-black/[0.04] px-5 py-3.5 text-xs font-medium text-foreground',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-zinc-200/70', className)} />
}

export function useLoad(delayMs = 250) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs)
    return () => clearTimeout(t)
  }, [delayMs])
  return loading
}
