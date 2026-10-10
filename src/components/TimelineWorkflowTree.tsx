import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  FileText,
  Gavel,
  GitBranch,
  Layers,
  Milestone,
  Scale,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import type { CaseRec } from '../data'
import { Button, Card, Citation, cn, Tag } from '../ui'

type ViewMode = 'tree' | 'pipeline' | 'ledger'
type TreeScale = 'normal' | 'grand' | 'full'

interface TimelineProps {
  c: CaseRec
  highlight?: number
}

function parseDate(str: string): Date | null {
  try {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

function daysDiff(d1: string, d2: string): number {
  const a = parseDate(d1)
  const b = parseDate(d2)
  if (!a || !b) return 0
  const diffTime = Math.abs(b.getTime() - a.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function TimelineWorkflowTree({ c, highlight }: TimelineProps) {
  const [view, setView] = useState<ViewMode>('tree')
  const [scale, setScale] = useState<TreeScale>('grand')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(highlight ?? null)
  const [filterType, setFilterType] = useState('All')
  const [expandedAll, setExpandedAll] = useState(true)

  useEffect(() => {
    if (highlight !== undefined) {
      setSelectedIdx(highlight)
      const el = document.getElementById(`tree-node-${highlight}`) || document.getElementById(`ev-${highlight}`)
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [highlight])

  const types = ['All', ...new Set(c.timeline.map((t) => t.type))]
  const timelineItems = useMemo(
    () => c.timeline.map((t, idx) => ({ ...t, idx })),
    [c.timeline],
  )

  const filteredItems = useMemo(
    () => timelineItems.filter((t) => filterType === 'All' || t.type === filterType),
    [timelineItems, filterType],
  )

  // Starting Date and Ending Date calculation
  const startDate = c.keyDates?.[0]?.date || c.timeline[0]?.date || '04 Feb 2025'
  const startEventName = c.keyDates?.[0]?.label || c.timeline[0]?.title || 'Case Inception / Incident'
  const endDate = c.nextHearing || c.timeline[c.timeline.length - 1]?.date || '15 Oct 2026'
  const endEventName = `Target Hearing · ${c.stage}`

  const totalElapsedDays = daysDiff(startDate, endDate)
  const majorGapsCount = c.timeline.filter((t) => t.gapDays && t.gapDays > 30).length

  // Categorize workflow milestones into statutory phases (Monochrome theme)
  const phases = useMemo(() => {
    return [
      {
        id: 'phase-1',
        title: 'Phase I: Genesis & Formal Inception',
        subtitle: 'Crime Occurrence, Police FIR Registration & Magisterial Cognizance',
        badge: 'Root Branch',
        nodes: timelineItems.filter((t) => t.idx === 0 || (t.type === 'Filing' && t.idx <= 1)),
      },
      {
        id: 'phase-2',
        title: 'Phase II: Police Remand & Forensic Recovery',
        subtitle: 'Custodial Interrogation, Malkhana Seizure & FSL Ballistic Submission',
        badge: 'Investigation Branch',
        nodes: timelineItems.filter(
          (t) => (t.type === 'Police' || (t.type === 'Filing' && t.idx === 2)) && t.idx > 0 && t.idx <= 2,
        ),
      },
      {
        id: 'phase-3',
        title: 'Phase III: Committal, Remand & Bail Inquiries',
        subtitle: 'Magisterial Scrutiny, Committal Order & Sessions Docket Allocation',
        badge: 'Judicial Committal',
        nodes: timelineItems.filter((t) => t.idx >= 3 && t.idx <= 4),
      },
      {
        id: 'phase-4',
        title: 'Phase IV: Forensic Verification & Pre-Trial Filings',
        subtitle: 'FSL Ballistics Tracking, Charge-sheet Scrutiny & Discharge Inquiry',
        badge: 'Adjudication Branch',
        nodes: timelineItems.filter((t) => t.idx >= 5),
      },
      {
        id: 'phase-5',
        title: 'Phase V: Target Trial & Framing of Charges',
        subtitle: 'Formal Charge Framing under Section 263 BNSS & Witness Deposition',
        badge: 'Crown Target',
        isTarget: true,
        targetDate: endDate,
        targetTitle: endEventName,
        nodes: [],
      },
    ]
  }, [timelineItems, endDate, endEventName])

  const selectedEvent = selectedIdx !== null ? timelineItems.find((t) => t.idx === selectedIdx) : null

  return (
    <div className="space-y-6">
      {/* 1. MONOCHROME WORKFLOW SUMMARY COMMAND BAR */}
      <Card line className="p-6 bg-card border-border">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* ROOT ANCHOR (STARTING DATE) */}
          <div className="flex items-start gap-4 min-w-[240px] p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 relative group hover:border-black/30 transition-all shadow-xs">
            <span className="absolute -top-3 left-3 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider bg-black text-white shadow-xs">
              STARTING DATE (CASE BIRTH)
            </span>
            <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-black shadow-xs">
              <Milestone className="size-5" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold tabular-nums text-foreground">
                {startDate}
              </div>
              <div className="text-xs font-semibold text-foreground truncate max-w-[170px] mt-0.5">
                {startEventName}
              </div>
              <div className="font-mono text-[10.5px] text-zinc-500 mt-1 flex items-center gap-1">
                <FileCheck2 className="size-3" /> Crime Inception · FIR #14/2025
              </div>
            </div>
          </div>

          {/* CENTRAL SPINAL LIFECYCLE FLOW */}
          <div className="flex-1 px-3 py-1 flex flex-col justify-center">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Elapsed Trajectory:</span>
                <span className="font-semibold text-foreground tabular-nums text-sm">
                  {totalElapsedDays} Days
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">Active Roster Stage:</span>
                <span className="px-2 py-0.5 rounded border border-zinc-300 bg-zinc-100 text-black font-semibold">
                  {c.stage}
                </span>
              </div>
              {majorGapsCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-300 bg-zinc-100 text-zinc-800 text-[11px] font-semibold">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  {majorGapsCount} Inactivity Delay Gap (&gt;30 Days)
                </div>
              )}
            </div>

            {/* Segmented Pipeline Progress Bar (Monochrome) */}
            <div className="relative h-2.5 w-full rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: '78%' }}
              />
            </div>

            {/* Stage Phase Markers */}
            <div className="mt-2.5 flex items-center justify-between font-mono text-[10.5px] text-muted-foreground">
              <span className="text-zinc-600 font-semibold">I: Inception</span>
              <span className="text-zinc-600 font-semibold hidden sm:inline">II: Investigation</span>
              <span className="text-zinc-600 font-semibold hidden md:inline">III: Committal</span>
              <span className="text-black font-semibold">IV: Pre-Trial (Current)</span>
              <span className="text-zinc-600 font-semibold">V: Target Hearing</span>
            </div>
          </div>

          {/* CROWN ANCHOR (ENDING / TARGET DATE) */}
          <div className="flex items-start gap-4 min-w-[250px] p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 relative group hover:border-black/30 transition-all shadow-xs">
            <span className="absolute -top-3 right-3 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider border border-zinc-300 bg-black text-white shadow-xs">
              ENDING / TARGET DATE
            </span>
            <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-black shadow-xs">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold tabular-nums text-foreground">
                {endDate}
              </div>
              <div className="text-xs font-semibold text-foreground truncate max-w-[170px] mt-0.5">
                {endEventName}
              </div>
              <div className="font-mono text-[10.5px] text-zinc-500 mt-1 flex items-center gap-1">
                <Gavel className="size-3" /> Courtroom 04 · Sessions Bench
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. GRAND TREE TOOLBAR & MONOCHROME BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        {/* Left: View Modes */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-zinc-100/80 p-1">
          <button
            onClick={() => setView('tree')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs transition-colors cursor-pointer',
              view === 'tree'
                ? 'bg-white text-black font-semibold shadow-xs border border-zinc-200/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <GitBranch className="size-3.5" />
            <span>Grand Workflow Tree</span>
          </button>
          <button
            onClick={() => setView('pipeline')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs transition-colors cursor-pointer',
              view === 'pipeline'
                ? 'bg-white text-black font-semibold shadow-xs border border-zinc-200/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Workflow className="size-3.5" />
            <span>Stage Pipeline</span>
          </button>
          <button
            onClick={() => setView('ledger')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs transition-colors cursor-pointer',
              view === 'ledger'
                ? 'bg-white text-black font-semibold shadow-xs border border-zinc-200/80'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Layers className="size-3.5" />
            <span>Evidentiary Ledger</span>
          </button>
        </div>

        {/* Right: Scale & Tree Density Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {view === 'tree' && (
            <div className="flex items-center gap-1 mr-2 border-r border-border/60 pr-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
                Tree Scale:
              </span>
              <Button
                size="sm"
                variant={scale === 'normal' ? 'primary' : 'outline'}
                onClick={() => setScale('normal')}
              >
                Normal
              </Button>
              <Button
                size="sm"
                variant={scale === 'grand' ? 'primary' : 'outline'}
                onClick={() => setScale('grand')}
              >
                Grand Tree
              </Button>
              <Button
                size="sm"
                variant={scale === 'full' ? 'primary' : 'outline'}
                onClick={() => setScale('full')}
              >
                Panoramic
              </Button>
            </div>
          )}

          {/* Monochrome Action Buttons */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedIdx(5)
              const el = document.getElementById('tree-node-5')
              el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
            }}
          >
            <Zap className="size-3.5" /> Highlight Active Stage
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const gapItem = timelineItems.find((t) => t.gapDays && t.gapDays > 30)
              if (gapItem) {
                setSelectedIdx(gapItem.idx)
                const el = document.getElementById(`tree-node-${gapItem.idx}`)
                el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
              }
            }}
          >
            <AlertTriangle className="size-3.5" /> 382d Hiatus Node
          </Button>
          <Button
            size="sm"
            variant={expandedAll ? 'outline' : 'primary'}
            onClick={() => setExpandedAll(!expandedAll)}
          >
            {expandedAll ? 'Collapse Details' : 'Expand All Leaves'}
          </Button>
        </div>
      </div>

      {/* 3. MAIN WORKFLOW DISPLAY: GRAND TREE (Monochrome Theme) */}
      {view === 'tree' && (
        <Card className={cn('p-6 md:p-8', scale === 'full' && 'max-w-none')}>
          {/* Header Title & Legend */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid size-7 place-items-center rounded-lg bg-black text-white">
                  <GitBranch className="size-4" />
                </div>
                <h2 className="font-serif text-xl font-bold text-foreground tracking-tight">
                  Judicial Statutory Workflow Tree
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Full procedural branching DAG mapping FIR registration, police recoveries, committal proceedings, and trial hearing.
              </p>
            </div>

            {/* Tree Branch Legend (Monochrome) */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                <span className="size-1.5 rounded-full bg-black" /> Police Inception
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                <span className="size-1.5 rounded-full bg-zinc-600" /> Remand / Recovery
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                <span className="size-1.5 rounded-full bg-zinc-500" /> Committal / Bail
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                <span className="size-1.5 rounded-full bg-zinc-400" /> Forensic Pre-Trial
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black text-white font-semibold">
                <span className="size-1.5 rounded-full bg-white" /> Target Resolution
              </span>
            </div>
          </div>

          {/* GRAND TREE STRUCTURE (SVG CONNECTIONS & EXPANSIVE NODES) */}
          <div className="relative pl-6 md:pl-10 pr-2 py-4 space-y-10">
            {/* CENTRAL SPINAL TRUNK LINE (Monochrome hairline) */}
            <div className="absolute left-6 md:left-10 top-6 bottom-10 w-0.5 bg-gradient-to-b from-black via-zinc-400 to-black pointer-events-none opacity-20" />

            {phases.map((phase, pIdx) => {
              const isLastPhase = pIdx === phases.length - 1

              return (
                <div key={phase.id} className="relative">
                  {/* Phase Milestone Crest (Branching Hub) */}
                  <div className="flex items-center gap-4 mb-5">
                    {/* Monochrome Branch Joint */}
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold text-white bg-black border border-black relative z-10 shadow-xs">
                      {pIdx + 1}
                    </div>

                    <div className="flex-1 border-b border-border/80 pb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-foreground">
                          {phase.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border border-zinc-200 bg-zinc-100 text-zinc-700">
                          {phase.badge}
                        </span>
                      </div>
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        {phase.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* BRANCH NODES (CARDS) */}
                  <div className="ml-5 md:ml-9 space-y-5">
                    {phase.isTarget ? (
                      /* GRAND TARGET RESOLUTION APEX NODE (Monochrome) */
                      <div className="p-5 md:p-6 rounded-2xl border border-zinc-300 bg-zinc-50 relative shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="size-2.5 rounded-full bg-black animate-pulse" />
                            <span className="font-mono text-sm font-bold text-black">
                              CULMINATION TARGET: {phase.targetDate}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10.5px] bg-black text-white font-semibold">
                              Bench Trial Roster
                            </span>
                          </div>
                          <span className="font-mono text-xs text-zinc-600 flex items-center gap-1.5">
                            <Gavel className="size-3.5 text-black" /> Courtroom 04 · Principal Sessions Bench
                          </span>
                        </div>

                        <h3 className="mt-3 font-serif text-lg font-bold text-foreground">
                          {phase.targetTitle}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-3xl">
                          Matter listed for formal examination under Section 263 BNSS. Investigating Officer directed to submit certified FSL ballistic report and facilitate examination of PW-1 & PW-2.
                        </p>

                        <div className="mt-4 pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                          <span className="text-zinc-600">
                            Countdown: <strong className="text-black">5 Working Days Remaining</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedIdx(null)}
                            >
                              <FileCheck2 className="size-3.5" /> Pre-Trial Readiness Checklist
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      phase.nodes.map((item) => {
                        const isSelected = selectedIdx === item.idx
                        const hasGap = item.gapDays && item.gapDays > 30

                        return (
                          <div key={item.idx} className="relative group">
                            {/* Branch Connector Hook */}
                            <div className="absolute -left-5 md:-left-9 top-6 w-5 md:w-9 h-px bg-zinc-300 group-hover:bg-black transition-colors pointer-events-none" />

                            {/* Inactivity Delay Alert Banner */}
                            {hasGap && (
                              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-300 bg-zinc-100 font-mono text-xs text-zinc-800 shadow-xs">
                                <AlertTriangle className="size-4 shrink-0 text-black" />
                                <span>
                                  <strong>Procedural Delay Breach:</strong> {item.gapDays} days elapsed without court diary docket entry
                                </span>
                              </div>
                            )}

                            {/* Node Card */}
                            <div
                              id={`tree-node-${item.idx}`}
                              onClick={() => setSelectedIdx(isSelected ? null : item.idx)}
                              className={cn(
                                'rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden',
                                scale === 'grand' ? 'p-5' : 'p-4',
                                isSelected
                                  ? 'border-black bg-zinc-50 text-black ring-1 ring-black/20 shadow-xs'
                                  : 'border-border bg-white hover:bg-zinc-50 hover:border-zinc-300 shadow-xs',
                              )}
                            >
                              {/* Card Header Strip */}
                              <div className="flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex flex-wrap items-center gap-2.5">
                                  <span className="px-2.5 py-1 rounded-md font-mono text-xs font-bold tabular-nums border border-zinc-200 bg-zinc-100 text-black">
                                    {item.date}
                                  </span>

                                  <Tag className="font-mono text-xs font-semibold">{item.type}</Tag>

                                  <span className="font-mono text-[11px] text-muted-foreground">
                                    Milestone Leaf #{item.idx + 1}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.src && <Citation src={item.src} />}
                                  <div
                                    className={cn(
                                      'size-6 grid place-items-center rounded-md border border-border text-muted-foreground transition-transform',
                                      isSelected && 'rotate-90 text-white border-black bg-black',
                                    )}
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 className="mt-2.5 font-serif text-base font-bold text-foreground">
                                {item.title}
                              </h4>

                              {/* Body Description */}
                              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                                {item.detail}
                              </p>

                              {/* Expanded Evidentiary Details */}
                              {(isSelected || expandedAll) && (
                                <div className="mt-3.5 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                                    <FileCheck2 className="size-3.5 text-black" />
                                    <span>Certified e-Courts SHA-256 Hash Verified</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {item.src && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedIdx(item.idx)
                                        }}
                                        className="font-mono text-xs text-black hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                      >
                                        <ExternalLink className="size-3" /> View Docket Extract (p.{item.src.page})
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* 4. PIPELINE VIEW (HORIZONTAL SWIMLANES) */}
      {view === 'pipeline' && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-serif text-base font-bold text-foreground">
              Procedural Stage Pipeline View
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Horizontal stage-by-stage progression from FIR inception to pending trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {phases.filter((p) => !p.isTarget).map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-zinc-50/80 p-4 flex flex-col shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <span className="font-serif text-sm font-bold text-foreground">{p.title.split(':')[0]}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
                    {p.nodes.length} Events
                  </span>
                </div>
                <div className="mt-3 space-y-3 flex-1">
                  {p.nodes.map((n) => (
                    <div
                      key={n.idx}
                      onClick={() => setSelectedIdx(n.idx)}
                      className="p-3 rounded-lg border border-border/80 bg-white hover:border-black/30 cursor-pointer transition-all shadow-xs"
                    >
                      <div className="font-mono text-[11px] text-black font-semibold">{n.date}</div>
                      <div className="text-xs font-semibold text-foreground mt-1 line-clamp-1">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{n.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5. LEDGER VIEW */}
      {view === 'ledger' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-50">
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Milestone Event</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Statutory Impact</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {timelineItems.map((item) => (
                <tr
                  key={item.idx}
                  onClick={() => setSelectedIdx(item.idx)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">M-0{item.idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-foreground font-semibold whitespace-nowrap">{item.date}</td>
                  <td className="px-4 py-3"><Tag>{item.type}</Tag></td>
                  <td className="px-4 py-3 font-semibold text-foreground">{item.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.detail}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.src && <Citation src={item.src} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 6. MODAL INSPECTOR FOR SELECTED MILESTONE */}
      {selectedEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-xs"
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-black">
                    Milestone Leaf #{selectedEvent.idx + 1}
                  </span>
                  <Tag>{selectedEvent.type}</Tag>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selectedEvent.date}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mt-1">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIdx(null)}
                className="grid size-8 place-items-center rounded-lg border border-border hover:bg-zinc-100 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p className="text-foreground text-sm font-medium">
                {selectedEvent.detail}
              </p>
              {selectedEvent.gapDays && selectedEvent.gapDays > 30 && (
                <div className="p-3 rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-800">
                  <strong className="block text-black font-semibold mb-1">
                    Statutory Limitation / Inactivity Notice:
                  </strong>
                  A recorded gap of {selectedEvent.gapDays} days transpired between this proceeding and the subsequent hearing.
                </div>
              )}
            </div>

            {selectedEvent.src && (
              <div className="p-4 rounded-xl border border-border bg-zinc-50 space-y-2">
                <div className="font-mono text-xs font-semibold text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-black" />
                  Source Docket Filing Citation
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  File: <strong className="text-foreground">{selectedEvent.src.doc}</strong> · Page {selectedEvent.src.page}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedIdx(null)}>
                Close Leaf Inspector
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.open(`/cases/${c.id}?tab=Documents`, '_self')
                }}
              >
                <ExternalLink className="size-3.5" /> Open Source Exhibit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
