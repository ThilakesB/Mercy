import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertOctagon,
  CalendarClock,
  Clock3,
  Gavel,
  Hourglass,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
  PlusCircle,
  GitBranch,
  AlertTriangle,
  Scale,
  Zap,
  Briefcase,
  User,
  Shield,
  FileCheck2,
} from 'lucide-react'
import {
  ageBuckets,
  alerts,
  cases,
  causeList,
  delayReasons,
  findCase,
  kpis,
  priorityQueue,
  TODAY_LABEL,
  type Status,
} from '../data'
import {
  Button,
  Card,
  CardHeader,
  cn,
  ErrorState,
  PageHeader,
  PageSkeleton,
  StatusChip,
  Tag,
  useApp,
  useLoad,
} from '../ui'

const tipStyle = {
  contentStyle: {
    background: '#121316',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#f4f4f6',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
    padding: '6px 10px',
  },
  itemStyle: {
    color: '#f4f4f6',
  },
}

// Stage breakdown data for the pendency pipeline (Monochrome scale)
const stagePendency = [
  { stage: 'Investigation & FIR', count: 312, pct: 24.3, avgDays: 42, bottleneck: false },
  { stage: 'Framing of Charges', count: 245, pct: 19.1, avgDays: 68, bottleneck: false },
  { stage: 'Witness Deposition & Evidence', count: 480, pct: 37.4, avgDays: 194, bottleneck: true },
  { stage: 'Final Arguments', count: 158, pct: 12.3, avgDays: 55, bottleneck: false },
  { stage: 'Reserved for Judgment', count: 89, pct: 6.9, avgDays: 21, bottleneck: false },
]

// Category breakdown data (Monochrome scale)
const categoryPendency = [
  { name: 'Criminal Sessions', count: 702, pct: 54.7, desc: 'BNS & IPC Matters' },
  { name: 'Matrimonial & Family', count: 241, pct: 18.8, desc: 'Custody & Mediation' },
  { name: 'POCSO Special Court', count: 188, pct: 14.6, desc: 'Fast-Track In-Camera' },
  { name: 'Civil & Commercial', count: 153, pct: 11.9, desc: 'Injunctions & Suits' },
]

// Charge categories for visual case grouping
const chargeCategories = [
  { label: 'All Bench Charges', count: 8, filter: '' },
  { label: 'Robbery & Arms Act', count: 1, filter: 'Arms' },
  { label: 'Child Protection (POCSO)', count: 2, filter: 'POCSO' },
  { label: 'Murder & Homicide', count: 1, filter: '103' },
  { label: 'Financial Fraud & Cheating', count: 1, filter: '318' },
  { label: 'Narcotics (NDPS)', count: 1, filter: 'NDPS' },
  { label: 'Family & Matrimonial', count: 2, filter: 'HMA' },
]

function Kpi({
  label,
  value,
  context,
  icon: Icon,
  variant = 'default',
}: {
  label: string
  value: number
  context?: string
  icon: typeof Gavel
  variant?: 'default' | 'bad' | 'warn' | 'ok' | 'blue'
}) {
  const styles = {
    default: 'border-border bg-card text-foreground',
    bad: 'border-white/40 bg-zinc-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.06)]',
    warn: 'border-white/25 bg-zinc-900/90 text-zinc-200',
    ok: 'border-white/20 bg-zinc-900/60 text-zinc-200',
    blue: 'border-white/20 bg-zinc-900/80 text-zinc-100',
  }[variant]

  return (
    <div className={cn('rounded-xl border p-4 transition-all duration-150', styles)}>
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-mono text-[10.5px] uppercase tracking-wider">{label}</span>
        <Icon className="size-4 text-zinc-300" />
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold tracking-tight tabular-nums text-foreground">
        {value.toLocaleString('en-IN')}
      </div>
      {context && (
        <div className="mt-1 font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          {context}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const loading = useLoad()
  const [sp] = useSearchParams()
  const { role, toast } = useApp()
  const [pendencyMode, setPendencyMode] = useState<'stage' | 'category' | 'aging'>('stage')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedCharge, setSelectedCharge] = useState('All Bench Charges')
  const [alertFilter, setAlertFilter] = useState<'all' | Status>('all')

  if (loading) return <PageSkeleton />
  if (sp.get('state') === 'error')
    return <ErrorState onRetry={() => (window.location.href = '/')} />

  const totalPending = kpis.pending

  // Filter priority queue based on interactive selection
  const filteredPriority = selectedFilter
    ? priorityQueue.filter((p) => {
        const c = findCase(p.caseId)
        if (!c) return false
        if (selectedFilter === 'POCSO') return c.type === 'POCSO'
        if (selectedFilter === 'Criminal') return c.type === 'Criminal'
        if (selectedFilter === 'Matrimonial') return c.type === 'Matrimonial'
        if (selectedFilter === 'Evidence') return c.stage.toLowerCase().includes('evidence') || c.stage.toLowerCase().includes('trial')
        if (selectedFilter === 'Overdue') return p.severity === 'overdue'
        return true
      })
    : priorityQueue

  // Filter cases for the visual case matrix by statutory charge
  const displayedCases = selectedCharge === 'All Bench Charges'
    ? cases
    : cases.filter((cs) => {
        const match = chargeCategories.find((c) => c.label === selectedCharge)
        if (!match || !match.filter) return true
        return (
          cs.acts.some((a) => a.includes(match.filter)) ||
          cs.type.includes(match.filter) ||
          cs.number.includes(match.filter)
        )
      })

  return (
    <>
      <PageHeader
        title={role === 'Judge' ? 'Good morning, Your Honour' : 'Sessions Court Bench Dashboard'}
        sub={`${TODAY_LABEL} · Principal Sessions Court, Chennai (Courtroom 04) · Mercy Decision Support`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/summary">
              <Button variant="primary" size="sm">
                <Sparkles className="size-3.5" /> AI Case Digest
              </Button>
            </Link>
            <Link to="/cases">
              <Button variant="outline" size="sm">
                <PlusCircle className="size-3.5" /> View All Cases
              </Button>
            </Link>
            <Link to="/timeline">
              <Button variant="outline" size="sm">
                <GitBranch className="size-3.5" /> Master Timeline Tree
              </Button>
            </Link>
            <Link to="/alerts">
              <Button variant="danger" size="sm">
                <AlertOctagon className="size-3.5" /> 108 Overdue
              </Button>
            </Link>
          </div>
        }
      />

      {/* 1. EXECUTIVE PENDENCY VISUALIZER (Monochrome Theme) */}
      <Card line className="mb-6 p-5 md:p-6 bg-card border-border">
        {/* Top Header Strip with Live Metrics and Perspective Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-white animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Judicial Pendency Visualizer · Principal Sessions Roster
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3 mt-1">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                1,284 Cases Pending Adjudication
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                (76% On-Schedule · 16% Under Notice · 8% Critical Delay)
              </span>
            </div>
          </div>

          {/* Perspective View Switcher Buttons (Monochrome) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-[#0d0e11] p-1">
            <button
              onClick={() => { setPendencyMode('stage'); setSelectedFilter(null) }}
              className={cn(
                'px-3.5 py-1.5 rounded font-mono text-xs transition-colors cursor-pointer',
                pendencyMode === 'stage'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              By Procedural Stage
            </button>
            <button
              onClick={() => { setPendencyMode('category'); setSelectedFilter(null) }}
              className={cn(
                'px-3.5 py-1.5 rounded font-mono text-xs transition-colors cursor-pointer',
                pendencyMode === 'category'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              By Roster Category
            </button>
            <button
              onClick={() => { setPendencyMode('aging'); setSelectedFilter(null) }}
              className={cn(
                'px-3.5 py-1.5 rounded font-mono text-xs transition-colors cursor-pointer',
                pendencyMode === 'aging'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              By Pendency Aging
            </button>
          </div>
        </div>

        {/* PERSPECTIVE 1: BY PROCEDURAL STAGE (Where cases are stuck) */}
        {pendencyMode === 'stage' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Judicial Stage Pipeline Flow (1,284 Matters Distributed Across 5 Statutory Stages)</span>
              <span className="text-zinc-200 font-semibold flex items-center gap-1 border border-white/20 bg-white/5 px-2 py-0.5 rounded">
                <AlertTriangle className="size-3" /> Major Bottleneck: Witness Examination (480 cases)
              </span>
            </div>

            {/* Stage Flow Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stagePendency.map((st, idx) => {
                const isSelected = selectedFilter === (idx === 2 ? 'Evidence' : null)
                return (
                  <div
                    key={st.stage}
                    onClick={() => {
                      if (idx === 2) setSelectedFilter(selectedFilter === 'Evidence' ? null : 'Evidence')
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
                      st.bottleneck
                        ? 'border-white/40 bg-zinc-900/90 hover:border-white hover:bg-zinc-800'
                        : 'border-border bg-[#0d0e11] hover:border-border-hover hover:bg-[#131418]',
                      isSelected && 'ring-2 ring-white border-transparent',
                    )}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>Stage 0{idx + 1}</span>
                      <span className="font-semibold text-foreground">{st.pct}%</span>
                    </div>

                    <div className="mt-2 font-serif text-2xl font-bold text-foreground tabular-nums">
                      {st.count}
                    </div>

                    <div className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                      {st.stage}
                    </div>

                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Avg: {st.avgDays} days</span>
                      {st.bottleneck && (
                        <span className="px-1.5 py-0.5 rounded bg-white text-black font-semibold">
                          Chokepoint
                        </span>
                      )}
                    </div>

                    {/* Monochrome Progress Fill Line */}
                    <div className="mt-2.5 h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-white"
                        style={{ width: `${(st.count / 480) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PERSPECTIVE 2: BY ROSTER CATEGORY */}
        {pendencyMode === 'category' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Jurisdictional Bench Breakdown</span>
              <span>Total Active Docket: 1,284 Matters</span>
            </div>

            {/* Monochrome Segmented Proportional Bar */}
            <div className="h-3.5 w-full rounded-md bg-[#131418] border border-border flex overflow-hidden">
              <div
                style={{ width: `${(702 / totalPending) * 100}%` }}
                className="bg-white hover:brightness-90 transition-all cursor-pointer"
                title="Criminal: 702 cases"
                onClick={() => setSelectedFilter(selectedFilter === 'Criminal' ? null : 'Criminal')}
              />
              <div
                style={{ width: `${(241 / totalPending) * 100}%` }}
                className="bg-zinc-400 hover:brightness-110 transition-all cursor-pointer"
                title="Matrimonial: 241 cases"
                onClick={() => setSelectedFilter(selectedFilter === 'Matrimonial' ? null : 'Matrimonial')}
              />
              <div
                style={{ width: `${(188 / totalPending) * 100}%` }}
                className="bg-zinc-600 hover:brightness-125 transition-all cursor-pointer"
                title="POCSO Special: 188 cases"
                onClick={() => setSelectedFilter(selectedFilter === 'POCSO' ? null : 'POCSO')}
              />
              <div
                style={{ width: `${(153 / totalPending) * 100}%` }}
                className="bg-zinc-800 hover:brightness-150 transition-all cursor-pointer"
                title="Civil: 153 cases"
              />
            </div>

            {/* Category Cards (Monochrome) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categoryPendency.map((cat) => {
                const isSelected = selectedFilter === (cat.name.includes('Criminal') ? 'Criminal' : cat.name.includes('POCSO') ? 'POCSO' : cat.name.includes('Matrimonial') ? 'Matrimonial' : null)
                return (
                  <div
                    key={cat.name}
                    onClick={() => {
                      if (cat.name.includes('Criminal')) setSelectedFilter(selectedFilter === 'Criminal' ? null : 'Criminal')
                      else if (cat.name.includes('POCSO')) setSelectedFilter(selectedFilter === 'POCSO' ? null : 'POCSO')
                      else if (cat.name.includes('Matrimonial')) setSelectedFilter(selectedFilter === 'Matrimonial' ? null : 'Matrimonial')
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer',
                      isSelected
                        ? 'border-white bg-zinc-900 ring-1 ring-white/50'
                        : 'border-border bg-[#0d0e11] hover:border-border-hover hover:bg-[#131418]',
                    )}
                  >
                    <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      <span>{cat.name.split(' ')[0]}</span>
                      <span className="text-foreground font-semibold">{cat.pct}%</span>
                    </div>
                    <div className="mt-1 font-serif text-2xl font-bold text-white tabular-nums">
                      {cat.count}
                    </div>
                    <div className="font-mono text-[10.5px] text-muted-foreground mt-0.5 truncate">
                      {cat.desc}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PERSPECTIVE 3: BY AGING & STATUTORY LIMITATION */}
        {pendencyMode === 'aging' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Statutory Limitation & Pendency Duration Distribution</span>
              <span className="text-white font-semibold">108 Matters Exceeding 2-Year Statutory Norm</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-white/10 bg-[#0d0e11]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Under 90 Days</span>
                <div className="mt-1 font-serif text-2xl font-bold text-white tabular-nums">412</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">Fresh Filings (32.1%)</div>
              </div>
              <div className="p-3.5 rounded-xl border border-white/15 bg-[#0d0e11]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-300">90 - 365 Days</span>
                <div className="mt-1 font-serif text-2xl font-bold text-white tabular-nums">577</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">Trial Active (44.9%)</div>
              </div>
              <div className="p-3.5 rounded-xl border border-white/25 bg-[#0d0e11]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-200">1 - 2 Years</span>
                <div className="mt-1 font-serif text-2xl font-bold text-white tabular-nums">187</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">Extended Trial (14.6%)</div>
              </div>
              <div
                onClick={() => setSelectedFilter(selectedFilter === 'Overdue' ? null : 'Overdue')}
                className={cn(
                  'p-3.5 rounded-xl border border-white/50 bg-zinc-900 cursor-pointer transition-all hover:bg-zinc-850',
                  selectedFilter === 'Overdue' && 'ring-2 ring-white',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white font-semibold">Over 2 Years</span>
                  <span className="px-1.5 py-0.2 rounded bg-white text-black font-mono text-[9px] font-bold">Critical</span>
                </div>
                <div className="mt-1 font-serif text-2xl font-bold text-white tabular-nums">108</div>
                <div className="font-mono text-[10px] text-zinc-400 mt-0.5">Statutory Audit Flag (8.4%)</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Ribbon with Monochrome High-Impact Buttons */}
        <div className="mt-5 pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {selectedFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs bg-white text-black font-semibold">
                Filter: <strong>{selectedFilter}</strong>
                <button onClick={() => setSelectedFilter(null)} className="ml-1 hover:opacity-70 font-bold cursor-pointer">✕</button>
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              Direct Registry Interventions:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast('Witness summons expedite notices generated for 480 pending matters', 'ok')}
            >
              <Zap className="size-3.5" /> Auto-Expedite Summons (480)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast('142 FSL Forensic Lab compliance reminders dispatched to Crime Branch', 'info')}
            >
              <FileSpreadsheet className="size-3.5" /> FSL Forensic Notices (142)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast('Chief Justice High Court Pendency Census exported to PDF', 'ok')}
            >
              <Scale className="size-3.5" /> Export Pendency Census
            </Button>
            <Link to="/timeline">
              <Button variant="outline" size="sm">
                <GitBranch className="size-3.5" /> Open Visual Tree
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. ALL COURT CASES: VISUAL DOCKET CLASSIFIED BY STATUTORY CHARGE */}
      <Card line className="mb-6 p-5 md:p-6 bg-card border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-white" />
              <h2 className="font-serif text-xl font-bold text-foreground">
                All Courtroom Cases: Visual Docket Classified by Statutory Charge
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any case to inspect its complete roadmap: investigating officer, victim, accused, police evidence, and target hearing.
            </p>
          </div>

          {/* Statutory Charge Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {chargeCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCharge(cat.label)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer',
                  selectedCharge === cat.label
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-[#0d0e11] text-muted-foreground hover:text-foreground border border-border hover:border-white/30',
                )}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Visual Case Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {displayedCases.map((cs) => {
            const crim = cs.type !== 'Matrimonial'
            const actsLabel = cs.acts.length > 0 ? cs.acts.join(', ') : 'Special Act Filing'
            const ioLabel = cs.io || 'Insp. S. Murugan (Anna Nagar)'
            const station = cs.policeStation || 'Principal Sessions Court'

            return (
              <div
                key={cs.id}
                className="p-4 rounded-xl border border-white/15 bg-[#0d0e11] hover:border-white/40 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Top Bar with Number and Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-zinc-900 border border-white/20">
                      {cs.number}
                    </span>
                    <StatusChip s={cs.status} />
                  </div>

                  {/* Statutory Penal Charges Badge */}
                  <div className="mt-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Statutory Charge:
                    </span>
                    <div className="inline-block px-2 py-0.5 rounded bg-white text-black font-mono text-xs font-bold">
                      {actsLabel}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-white transition-colors">
                    {cs.title}
                  </h3>

                  {/* Parties & Entities Preview */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                      <User className="size-3 text-zinc-400 mt-0.5 shrink-0" />
                      <div className="truncate">
                        <span className="text-zinc-400 font-mono text-[10px]">Accused:</span>{' '}
                        <strong className="text-white">
                          {cs.accused.length > 0 ? cs.accused[0].name : cs.parties[1]?.name || 'Accused Person'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Shield className="size-3 text-zinc-400 mt-0.5 shrink-0" />
                      <div className="truncate">
                        <span className="text-zinc-400 font-mono text-[10px]">Victim:</span>{' '}
                        <strong className="text-zinc-200">
                          {cs.victims.list.length > 0 ? cs.victims.list[0].masked : cs.parties[2]?.name || 'Complainant'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Briefcase className="size-3 text-zinc-400 mt-0.5 shrink-0" />
                      <div className="truncate">
                        <span className="text-zinc-400 font-mono text-[10px]">IO:</span>{' '}
                        <span className="text-zinc-300">{ioLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10.5px]">
                    <span className="text-muted-foreground">{cs.stage}</span>
                    <span className="text-white font-semibold">{cs.nextHearing}</span>
                  </div>

                  <Link to={`/cases/${cs.id}?tab=Case+Roadmap+Flowchart`}>
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Open Case Roadmap Flowchart <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 3. KPI METRIC TILES */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-5">
        <Kpi
          label="Pending Matters"
          value={kpis.pending}
          context="Full court roster"
          icon={Hourglass}
          variant="default"
        />
        <Kpi
          label="Hearings Today"
          value={kpis.today}
          context="6 on morning roll"
          icon={Gavel}
          variant="ok"
        />
        <Kpi
          label="Statutory Overdue"
          value={kpis.overdue}
          context="Immediate judicial review"
          icon={AlertOctagon}
          variant="bad"
        />
        <Kpi
          label="Deadlines (7 Days)"
          value={kpis.deadlines7}
          context="FSL reports due"
          icon={CalendarClock}
          variant="warn"
        />
        <Kpi
          label="Idle (30+ Days)"
          value={kpis.inactive30}
          context="Remand extension check"
          icon={Clock3}
          variant="default"
        />
      </div>

      {/* 4. BENTO: PRIORITY REVIEW QUEUE & TODAY'S CAUSE LIST */}
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card line>
          <CardHeader
            num="01"
            title={selectedFilter ? `Priority Queue (${selectedFilter} Filter Applied)` : "Priority Judicial Review Queue"}
            sub="Ranked by statutory limitation period and inactivity index."
            action={
              selectedFilter ? (
                <Button variant="outline" size="sm" onClick={() => setSelectedFilter(null)}>
                  Clear Filter
                </Button>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white font-mono text-[10.5px] font-semibold">
                  <ShieldAlert className="size-3" />
                  Statutory Audit Flagged
                </span>
              )
            }
          />
          <ol className="divide-y divide-border/60">
            {filteredPriority.map((p, i) => {
              const c = findCase(p.caseId)!
              return (
                <li key={p.caseId}>
                  <Link
                    to={`/cases/${c.id}?tab=Case+Roadmap+Flowchart`}
                    className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="mt-0.5 font-mono text-xs font-semibold text-zinc-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-xs text-foreground font-semibold">
                          {c.number}
                        </span>
                        <span className="rounded border border-border bg-[#141519] px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {c.type}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-foreground truncate">
                        {c.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground leading-normal">
                        {p.reason}
                      </span>
                    </span>
                    <StatusChip s={p.severity} />
                  </Link>
                </li>
              )
            })}
          </ol>
        </Card>

        <Card>
          <CardHeader
            num="02"
            title="Today's Cause List"
            sub="6 scheduled hearings on the morning roll."
            action={
              <Link
                to="/cases"
                className="font-mono text-xs text-white hover:underline flex items-center gap-1 font-semibold"
              >
                All 14 hearings <ArrowRight className="size-3" />
              </Link>
            }
          />
          <ul className="divide-y divide-border/60">
            {causeList.map((h) => {
              const c = findCase(h.caseId)!
              return (
                <li
                  key={h.time}
                  className="flex items-center gap-3.5 px-5 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="w-14 shrink-0 font-mono text-xs font-semibold text-white">
                    {h.time}
                  </span>
                  <Link to={`/cases/${c.id}?tab=Case+Roadmap+Flowchart`} className="min-w-0 flex-1 hover:underline">
                    <span className="block truncate font-mono text-xs text-foreground font-medium">
                      {c.number}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {h.stage}
                    </span>
                  </Link>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 border border-border px-1.5 py-0.5 rounded">
                    Court 04
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {/* 5. VISUAL CHARTS: AGE BUCKETS & DELAY BOTTLENECKS (Monochrome) */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Pendency Duration Buckets"
            sub="Roster breakdown by how long matters have been registered"
          />
          <div className="h-64 px-2 py-3" role="img" aria-label="Bar chart of pending cases by age">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageBuckets}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#8a8d98' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8a8d98' }}
                  axisLine={false}
                  tickLine={false}
                  width={34}
                />
                <Tooltip {...tipStyle} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                <Bar dataKey="cases" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-3 font-mono text-[11px] text-muted-foreground flex justify-between border-t border-border/60 pt-2">
            <span>&lt; 90 Days: 412 (32%)</span>
            <span>1-2 Years: 187 (15%)</span>
            <span className="text-white font-semibold">2+ Years: 108 (8%)</span>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Primary Bottlenecks Causing Delay"
            sub="Recorded procedural impediments from court diary logs"
          />
          <div
            className="h-64 px-2 py-3"
            role="img"
            aria-label="Horizontal bar chart of delay reasons"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayReasons} layout="vertical">
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#8a8d98' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="reason"
                  type="category"
                  tick={{ fontSize: 11, fill: '#8a8d98' }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip {...tipStyle} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                <Bar dataKey="cases" fill="#a1a1aa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-3 font-mono text-[11px] text-muted-foreground border-t border-border/60 pt-2 flex items-center justify-between">
            <span>Primary Cause: Forensic Ballistics Backlog</span>
            <span className="text-zinc-200 font-medium">38% of all recorded delays</span>
          </div>
        </Card>
      </div>

      {/* 6. BENCH PROCEDURAL ALERTS */}
      <Card line>
        <CardHeader
          title="Bench Procedural Alerts"
          sub="Statutory compliance notices generated from case lifecycle tracking"
          action={
            <div className="flex items-center gap-1">
              {(['all', 'overdue', 'warning', 'ontrack'] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={alertFilter === s ? 'primary' : 'outline'}
                  onClick={() => setAlertFilter(s)}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          }
        />
        <ul className="divide-y divide-border/60">
          {alerts
            .filter((a) => alertFilter === 'all' || a.sev === alertFilter)
            .map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 size-2 rounded-full shrink-0',
                      a.sev === 'overdue'
                        ? 'bg-white ring-2 ring-white/40'
                        : a.sev === 'warning'
                          ? 'bg-zinc-400'
                          : 'bg-zinc-600',
                    )}
                  />
                  <div>
                    <div className="text-xs font-medium text-foreground">{a.text}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      Triggered {a.time} · Courtroom 04 Bench Registry
                    </div>
                  </div>
                </div>
                <StatusChip s={a.sev} />
              </li>
            ))}
        </ul>
      </Card>
    </>
  )
}
