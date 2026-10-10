import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, FileText, Inbox, Info, Sparkles, X, XCircle } from 'lucide-react'
import type { Src, Status } from './data'
import { statusLabel } from './data'

export type Role = 'Judge' | 'Clerk' | 'Admin'
type Toast = { id: number; msg: string; kind: 'ok' | 'info' | 'bad' }

interface Ctx {
  role: Role
  setRole: (r: Role) => void
  toast: (msg: string, kind?: Toast['kind']) => void
  revealed: boolean
  setRevealed: (v: boolean) => void
  authed: boolean
  setAuthed: (v: boolean) => void
}

const AppCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Judge')
  const [revealed, setRevealed] = useState(false)
  const [authed, setAuthed] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, kind: Toast['kind'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  return (
    <AppCtx.Provider
      value={{
        role,
        setRole: (r) => {
          setRole(r)
          if (r !== 'Judge') setRevealed(false)
        },
        toast,
        revealed,
        setRevealed,
        authed,
        setAuthed,
      }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="slidein flex max-w-sm items-start gap-3 rounded-lg border border-border bg-elevated px-4 py-3 text-sm text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          >
            {t.kind === 'ok' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />
            ) : t.kind === 'bad' ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-bad" />
            ) : (
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
            )}
            <span className="text-xs leading-relaxed">{t.msg}</span>
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
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'amber' | 'blue' | 'emerald' | 'purple' | 'cyan'
  size?: 'sm' | 'md'
}) {
  const v = {
    primary:
      'bg-black text-white font-semibold hover:bg-zinc-800 shadow-sm active:scale-[0.98]',
    blue:
      'bg-black text-white font-semibold hover:bg-zinc-800 shadow-sm active:scale-[0.98]',
    emerald:
      'bg-zinc-900 text-white font-semibold hover:bg-black shadow-sm active:scale-[0.98]',
    purple:
      'bg-zinc-900 text-white hover:bg-black border border-zinc-800 active:scale-[0.98]',
    gold:
      'bg-black text-white font-semibold hover:bg-zinc-800 shadow-sm active:scale-[0.98]',
    amber:
      'border border-zinc-300 bg-zinc-100 text-black hover:bg-zinc-200 active:scale-[0.98]',
    cyan:
      'bg-zinc-100 text-black hover:bg-zinc-200 border border-zinc-300 active:scale-[0.98]',
    danger:
      'border border-black bg-black text-white font-semibold hover:bg-zinc-800 active:scale-[0.98]',
    outline:
      'border border-zinc-300 bg-white text-black hover:bg-zinc-100 hover:border-zinc-400 active:scale-[0.98]',
    ghost:
      'text-zinc-600 hover:text-black hover:bg-zinc-100 active:scale-[0.98]',
  }[variant]

  return (
    <button
      {...p}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-xs font-semibold',
        v,
        className,
      )}
    />
  )
}

export function Card({
  className,
  children,
  line,
  ...p
}: React.HTMLAttributes<HTMLElement> & {
  className?: string
  children: ReactNode
  line?: boolean
}) {
  return (
    <section
      {...p}
      className={cn(
        'relative rounded-xl border border-border bg-card text-card-foreground transition-colors',
        line && 'overflow-hidden',
        className,
      )}
    >
      {line && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-3.5">
      <div>
        <h2 className="font-serif text-[15px] font-semibold text-foreground tracking-tight flex items-center">
          {num && (
            <span className="mr-2 font-mono text-[10px] text-muted-foreground font-normal border border-border px-1.5 py-0.5 rounded">
              {num}
            </span>
          )}
          {title}
        </h2>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground leading-normal">{sub}</p>}
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-border/80 pb-5">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Chennai Judicial Registry · Court 04
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {sub && <p className="mt-1 max-w-2xl text-xs md:text-sm text-muted-foreground">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  )
}

export function StatusChip({ s }: { s: Status }) {
  const m = {
    ontrack: ['bg-zinc-100 text-zinc-800 border-zinc-300', CheckCircle2, 'bg-zinc-600'],
    warning: ['bg-zinc-200 text-zinc-900 border-zinc-400', AlertTriangle, 'bg-zinc-800'],
    overdue: ['bg-black text-white border-black font-bold', AlertCircle, 'bg-white'],
  } as const
  const [cls, Icon, dot] = m[s]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold border uppercase tracking-wider',
        cls,
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', dot)} />
      <Icon className="size-3 shrink-0" aria-hidden />
      {statusLabel[s]}
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
        'inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-black/10 bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-700">
      <Sparkles className="size-3 text-black" aria-hidden />
      AI-generated · Source linked
    </span>
  )
}

export function Citation({ src }: { src: Src }) {
  const { toast } = useApp()
  return (
    <button
      onClick={() => toast(`Opening ${src.doc}, page ${src.page}`, 'info')}
      className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-zinc-700 transition-colors hover:border-black hover:text-black"
    >
      <FileText className="size-3 text-black shrink-0" aria-hidden />
      <span>{src.doc}</span>
      <span className="text-muted-foreground">p.{src.page}</span>
    </button>
  )
}

export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={cn(
        'h-9 w-full rounded-lg border border-border bg-white px-3 text-xs text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-black focus:bg-white',
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
        'h-9 rounded-lg border border-border bg-white px-3 text-xs text-foreground transition-all focus:border-black focus:bg-white',
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
      <span className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
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
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border/80">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={cn(
            '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer',
            value === t
              ? 'border-accent text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
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
        'relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer',
        checked ? 'bg-accent' : 'bg-[#272b35]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all',
          checked ? 'left-[18px]' : 'left-0.5',
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
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="slidein w-full max-w-md rounded-xl border border-border bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-zinc-100 cursor-pointer">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{children}</div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

export function EmptyState({
  title,
  text,
  action,
  icon,
}: {
  title: string
  text: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <div className="mb-3 grid size-10 place-items-center rounded-full border border-border bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-4" />}
      </div>
      <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle className="size-4 text-bad" />}
      title="Court registry connection failed"
      text="The case registry service did not respond. Your records remain secure. Please retry."
      action={<Button onClick={onRetry}>Retry connection</Button>}
    />
  )
}

export function useLoad(ms = 400) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loading
}

export const Th = ({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) => (
  <th
    scope="col"
    className={cn(
      'whitespace-nowrap border-b border-border bg-[#10131a] px-4 py-2.5 text-left font-mono text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground',
      className,
    )}
  >
    {children}
  </th>
)

export const Td = ({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) => (
  <td className={cn('border-b border-border px-4 py-3 align-top text-xs', className)}>
    {children}
  </td>
)
