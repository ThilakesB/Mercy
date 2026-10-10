import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, ArrowRight, Check, FlaskConical, ImageIcon, Search, X } from 'lucide-react'
import { cases, type Admission, type CaseRec, type EvKind, type Evidence, type LabStatus } from '../data'
import { AIBadge, Button, Card, CardHeader, Citation, cn, EmptyState, Input, PageHeader, Select, Tag, Td, Th, useApp } from '../ui'

const KIND_LABEL: Record<EvKind, string> = {
  Circumstantial: 'Circumstantial',
  Forensic: 'Forensic',
  Chemical: 'Chemical',
  Documentary: 'Documentary',
  Witness: 'Witness',
  Digital: 'Digital / Cyber',
}
const KINDS = Object.keys(KIND_LABEL) as EvKind[]

const tone = {
  ok: 'border-white/20 bg-zinc-900 text-zinc-200',
  warn: 'border-white/30 bg-zinc-800 text-white',
  bad: 'border-white bg-white text-black font-semibold',
  blue: 'border-white/15 bg-zinc-900 text-zinc-300',
  gray: 'border-border bg-white/[0.04] text-muted-foreground',
}

export const Pill = ({ t, children }: { t: keyof typeof tone; children: string }) => (
  <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider', tone[t])}>
    {children}
  </span>
)

const labPill = (l: LabStatus) => (
  <Pill t={l === 'pending' ? 'warn' : l === 'received' ? 'ok' : l === 'disputed' ? 'bad' : 'gray'}>
    {l === 'n/a' ? 'Not req.' : l}
  </Pill>
)

const admPill = (a: Admission) => (
  <Pill t={a === 'admitted' ? 'ok' : a === 'rejected' ? 'bad' : a === 'marked' ? 'blue' : 'gray'}>
    {a}
  </Pill>
)

const hasGap = (e: Evidence) => e.chain.some((c) => c.gap)

type Row = { c: CaseRec; e: Evidence }
type Jump = (caseId: string, eventIdx: number) => void

function Stat({ label, value, bad }: { label: string; value: number; bad?: boolean }) {
  return (
    <Card line className={cn('p-4', bad && 'border-[#451f24] bg-bad-bg/60')}>
      <div className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('mt-2 font-serif text-3xl font-semibold tabular-nums', bad ? 'text-bad' : 'text-foreground')}>
        {value}
      </div>
    </Card>
  )
}

function Drawer({ row, onClose, onJump }: { row: Row; onClose: () => void; onJump: Jump }) {
  const { c, e } = row
  const { toast } = useApp()
  const [note, setNote] = useState(e.notes ?? '')

  useEffect(() => {
    const h = (ev: KeyboardEvent) => ev.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Evidence ${e.id}`}
        onClick={(x) => x.stopPropagation()}
        className="slidein absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-border bg-elevated shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-elevated/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="font-mono text-xs text-accent">
              {c.number} · Exhibit {e.id}
            </div>
            <h2 className="font-serif text-lg font-semibold text-foreground tracking-tight">{e.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 hover:bg-white/10 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5 text-xs">
          <div className="flex flex-wrap gap-2">
            <Tag>{KIND_LABEL[e.kind]}</Tag>
            {labPill(e.lab)}
            {admPill(e.adm)}
            {hasGap(e) && <Pill t="bad">Chain gap flagged</Pill>}
          </div>

          <section>
            <h3 className="mb-1 font-serif text-sm font-semibold text-foreground">Exhibit Narrative & Recovery</h3>
            <p className="text-muted-foreground leading-relaxed">{e.detail}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
              <div>
                <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">Recovery Officer</dt>
                <dd className="mt-0.5 font-medium text-foreground">{e.by}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">Date & Location</dt>
                <dd className="mt-0.5 font-mono text-foreground">{e.date}, {e.place}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">Linked Persons</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {e.linked.map((l) => (
                    <Tag key={l}>{l}</Tag>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-3">
              <Citation src={e.src} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-serif text-sm font-semibold text-foreground">Photographic & Digital Extraction</h3>
            <div className="grid h-32 place-items-center rounded-lg border border-dashed border-border bg-[#10131a] text-muted-foreground">
              <div className="text-center font-mono text-[11px]">
                <ImageIcon className="mx-auto mb-1 size-5 text-muted-foreground/60" />
                Exhibit Photomicrograph / Hash Extract
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">Malkhana & Forensic Chain of Custody</h3>
            {e.chain.length === 0 ? (
              <p className="rounded-lg border border-border bg-[#10131a] px-4 py-3 text-muted-foreground">
                No intermediate transfers logged for this exhibit.
              </p>
            ) : (
              <ol className="ml-2 border-l border-border/80 space-y-4">
                {e.chain.map((s, i) => (
                  <li key={i} className="relative pl-5">
                    <span
                      className={cn(
                        'absolute -left-[5px] top-1 size-2 rounded-full ring-4 ring-[#181c24]',
                        s.gap ? 'bg-bad' : 'bg-accent',
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-1.5 font-medium text-foreground">
                      <span>{s.from}</span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span>{s.to}</span>
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">{s.date}</div>
                    {s.gap && (
                      <div className="mt-1.5 flex items-start gap-1.5 rounded-md border border-[#451f24] bg-bad-bg px-2.5 py-1.5 font-mono text-[11px] text-bad">
                        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                        Custody gap: {s.gap}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h3 className="mb-1 font-serif text-sm font-semibold text-foreground">Forensic Lab Findings</h3>
            <p className="text-muted-foreground leading-relaxed">
              {e.labSummary ??
                (e.lab === 'n/a'
                  ? 'No forensic examination required for this documentary record.'
                  : e.lab === 'pending'
                  ? 'Forensic Science Laboratory examination pending dispatch.'
                  : 'Report awaiting registry docketing.')}
            </p>
          </section>

          {e.statements && (
            <section>
              <h3 className="mb-1 font-serif text-sm font-semibold text-foreground">Corroborating Witness Statements</h3>
              <ul className="list-disc space-y-1 pl-4 text-muted-foreground leading-relaxed">
                {e.statements.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="mb-1 font-serif text-sm font-semibold text-foreground">Confidential Judicial Observation</h3>
            <textarea
              value={note}
              onChange={(x) => setNote(x.target.value)}
              rows={3}
              placeholder="Record judicial notes regarding admissibility..."
              className="w-full rounded-lg border border-border bg-[#10131a] p-3 text-xs text-foreground focus:border-border-hover focus:outline-none"
            />
            <Button size="sm" variant="outline" className="mt-2" onClick={() => toast('Judicial note saved')}>
              Save Observation
            </Button>
          </section>

          {e.eventIdx !== undefined && (
            <Button className="w-full" onClick={() => onJump(c.id, e.eventIdx!)}>
              Inspect on Chronological Timeline
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </div>
      </aside>
    </div>
  )
}

export function Conflicts({ cs }: { cs: CaseRec[] }) {
  const items = cs.flatMap((c) => c.contradictions.map((x) => ({ key: c.id + x.summary, c, x })))
  const [state, setState] = useState<Record<string, 'reviewed' | 'dismissed'>>({})
  const { toast } = useApp()

  const act = (k: string, v: 'reviewed' | 'dismissed') => {
    setState((s) => ({ ...s, [k]: v }))
    toast(v === 'reviewed' ? 'Conflict marked as reviewed' : 'Flag dismissed. Logged with judicial ID.', 'info')
  }

  return (
    <Card line className="border-border">
      <CardHeader
        title="Detected Record Contradictions"
        sub="Textual inconsistencies between witness statements and forensic exhibits."
        action={<AIBadge />}
      />
      {items.length === 0 ? (
        <EmptyState
          title="No contradictions detected"
          text="Cross-record analysis verified no conflicting statements."
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map(({ key, c, x }) => {
            const st = state[key]
            return (
              <li key={key} className={cn('px-5 py-4 transition-opacity', st && 'opacity-50')}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-sm font-semibold text-foreground">
                    <span className="mr-2 font-mono text-xs text-accent font-normal">{c.number}</span>
                    {x.summary}
                  </h3>
                  <div className="flex items-center gap-2">
                    {st ? (
                      <Pill t={st === 'reviewed' ? 'ok' : 'gray'}>{st}</Pill>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => act(key, 'reviewed')}>
                          <Check className="size-3" /> Mark Reviewed
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => act(key, 'dismissed')}>
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    [x.a, x.srcA, 'Source Testimony A'],
                    [x.b, x.srcB, 'Source Record B'],
                  ].map(([t, s, l]) => (
                    <blockquote
                      key={l as string}
                      className="rounded-lg border border-border bg-[#10131a] p-3 text-xs"
                    >
                      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {l as string}
                      </div>
                      <p className="text-foreground leading-relaxed italic">"{t as string}"</p>
                      <div className="mt-2.5">
                        <Citation src={s as { doc: string; page: number }} />
                      </div>
                    </blockquote>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export function EvidencePanel({ cs, onJump }: { cs: CaseRec[]; onJump: Jump }) {
  const multi = cs.length > 1
  const rows: Row[] = useMemo(() => cs.flatMap((c) => c.evidence.map((e) => ({ c, e }))), [cs])
  const [kind, setKind] = useState<EvKind | 'All'>('All')
  const [q, setQ] = useState('')
  const [adm, setAdm] = useState('')
  const [by, setBy] = useState('')
  const [open, setOpen] = useState<Row | null>(null)

  const collectors = [...new Set(rows.map((r) => r.e.by))]
  const shown = rows.filter(
    ({ c, e }) =>
      (kind === 'All' || e.kind === kind) &&
      (!adm || e.adm === adm) &&
      (!by || e.by === by) &&
      (!q || (e.title + e.id + e.linked.join(' ') + c.number).toLowerCase().includes(q.toLowerCase())),
  )
  const count = (f: (e: Evidence) => boolean) => rows.filter((r) => f(r.e)).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
        <Stat label="Total Exhibits" value={rows.length} />
        <Stat label="Formally Admitted" value={count((e) => e.adm === 'admitted')} />
        <Stat label="Marked / Pending" value={count((e) => e.adm === 'pending' || e.adm === 'marked')} />
        <Stat label="Lab Reports Awaited" value={count((e) => e.lab === 'pending')} />
        <Stat label="Chain Custody Gaps" value={count(hasGap)} bad />
      </div>

      <Card>
        <div className="space-y-3 border-b border-border/80 p-4">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Evidence type">
            {(['All', ...KINDS] as const).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={kind === k ? 'primary' : 'outline'}
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
              >
                {k === 'All' ? 'All categories' : KIND_LABEL[k]}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8.5"
                placeholder="Search Exhibit ID, title, person..."
                aria-label="Search evidence"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select
              aria-label="Admission status"
              value={adm}
              onChange={(e) => setAdm(e.target.value)}
            >
              <option value="">All Admission Statuses</option>
              <option value="pending">Pending</option>
              <option value="marked">Marked</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Rejected</option>
            </Select>
            <Select aria-label="Collected by" value={by} onChange={(e) => setBy(e.target.value)}>
              <option value="">Recovery Officer: Anyone</option>
              {collectors.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="size-5" />}
            title="No exhibits match filter criteria"
            text="Adjust category chips or reset query parameters."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setKind('All')
                  setQ('')
                  setAdm('')
                  setBy('')
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-xs">
              <thead>
                <tr>
                  <Th>Exhibit ID</Th>
                  <Th>Description & Title</Th>
                  <Th>Classification</Th>
                  <Th>Recovery Officer</Th>
                  <Th>Date & Place</Th>
                  <Th>Linked Persons</Th>
                  <Th>Forensic Lab</Th>
                  <Th>Court Admission</Th>
                  <Th>Dossier Citation</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {shown.map((r) => (
                  <tr key={r.c.id + r.e.id} className="hover:bg-white/[0.02]">
                    <Td className="font-mono text-accent">
                      {multi && <div className="text-muted-foreground">{r.c.number}</div>}
                      {r.e.id}
                    </Td>
                    <Td className="max-w-[240px]">
                      <button
                        onClick={() => setOpen(r)}
                        className="text-left font-medium text-foreground hover:text-accent hover:underline cursor-pointer block truncate"
                      >
                        {r.e.title}
                      </button>
                      {hasGap(r.e) && (
                        <div className="mt-1">
                          <Pill t="bad">Chain gap</Pill>
                        </div>
                      )}
                    </Td>
                    <Td>
                      <Tag>{KIND_LABEL[r.e.kind]}</Tag>
                    </Td>
                    <Td className="max-w-[160px] text-muted-foreground truncate">{r.e.by}</Td>
                    <Td className="max-w-[170px] text-muted-foreground">
                      <div className="text-foreground font-mono">{r.e.date}</div>
                      <div className="truncate">{r.e.place}</div>
                    </Td>
                    <Td className="max-w-[170px] text-muted-foreground truncate">
                      {r.e.linked.join(', ')}
                    </Td>
                    <Td>{labPill(r.e.lab)}</Td>
                    <Td>{admPill(r.e.adm)}</Td>
                    <Td>
                      <Citation src={r.e.src} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Conflicts cs={cs} />
      {open && (
        <Drawer
          row={open}
          onClose={() => setOpen(null)}
          onJump={(id, i) => {
            setOpen(null)
            onJump(id, i)
          }}
        />
      )}
    </div>
  )
}

export default function EvidenceTrackerPage() {
  const nav = useNavigate()
  const [sel, setSel] = useState('all')
  const detailed = cases.filter((c) => c.detailed)
  const cs = sel === 'all' ? detailed : detailed.filter((c) => c.id === sel)

  return (
    <>
      <PageHeader
        title="Evidence & Exhibits Registry"
        sub="Chain-of-custody tracking, forensic laboratory analysis, and court marking status."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Case:</span>
            <Select aria-label="Case" value={sel} onChange={(e) => setSel(e.target.value)}>
              <option value="all">All Detailed Maters</option>
              {detailed.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      <EvidencePanel key={sel} cs={cs} onJump={(id, i) => nav(`/cases/${id}?tab=Timeline&event=${i}`)} />
    </>
  )
}
