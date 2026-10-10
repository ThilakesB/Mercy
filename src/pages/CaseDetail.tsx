import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  FilePlus2,
  FileText,
  Gavel,
  ImageIcon,
  Lock,
  StickyNote,
  UserRound,
} from 'lucide-react'
import { findCase, type CaseRec } from '../data'
import {
  AIBadge,
  Button,
  Card,
  CardHeader,
  Citation,
  cn,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Skeleton,
  StatusChip,
  Tabs,
  Tag,
  Td,
  Th,
  useApp,
  useLoad,
} from '../ui'
import { maskedTitle } from './Cases'
import { EvidencePanel, Pill } from './EvidenceTracker'
import { TimelineWorkflowTree } from '../components/TimelineWorkflowTree'
import { CaseRoadmapFlowchart } from '../components/CaseRoadmapFlowchart'

const TABS = ['Case Roadmap Flowchart', 'Overview', 'Timeline', 'Evidence', 'Police Activity', 'People', 'Documents', 'Deadlines']

const revealName = (n: string, role: string) => {
  const map: Record<string, string> = {
    Petitioner: 'Divya Ramesh',
    Respondent: 'Karthik Subramani',
    Child: 'Aadhya K.',
  }
  return map[role.split(' ')[0]] ?? n
}

function Overview({ c }: { c: CaseRec }) {
  const { revealed } = useApp()
  const crim = c.type !== 'Matrimonial'
  const poscoVictim = (p: { masked?: boolean; role: string }) => c.type === 'POCSO' && p.masked

  const detail: [string, React.ReactNode][] = [
    ['Case number', <span className="font-mono text-accent">{c.number}</span>],
    ['Courtroom', c.court],
    ['Classification', c.type],
    ['Sections / Acts', c.acts.join(', ')],
    ['Investigating officer', c.io],
    ['Police station', c.policeStation],
    ['FIR registration', c.fir.no === 'N/A' ? 'Not applicable' : `${c.fir.no} · ${c.fir.date}`],
    ['Current trial stage', c.stage],
    ['Next bench hearing', c.nextHearing],
  ]

  const custodyTone = {
    'In custody': 'blue',
    'On bail': 'gray',
    Absconding: 'bad',
    'Not applicable': 'gray',
  } as const

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <div className="space-y-6">
        <Card line>
          <CardHeader title="AI Record Summary & Digest" action={<AIBadge />} />
          <div className="space-y-2.5 px-5 py-4 text-xs md:text-sm leading-relaxed text-foreground">
            <p>
              {c.type === 'Criminal' && (
                <>
                  The prosecution alleges an armed robbery at a jewellery store on 03 Feb 2025 involving three persons. One pistol was recovered under disclosure. Charges are yet to be framed; the ballistic examination report remains pending. <Citation src={{ doc: 'Chargesheet.pdf', page: 4 }} />
                </>
              )}
              {c.type === 'POCSO' && (
                <>
                  The chargesheet alleges offences under POCSO ss.6 and 10 against a minor victim. Victim examination has not been recorded and the 30-day statutory limit has elapsed. <Citation src={{ doc: 'Chargesheet_POCSO.pdf', page: 3 }} />
                </>
              )}
              {c.type === 'Matrimonial' && (
                <>
                  The petitioner seeks dissolution of marriage on the ground of cruelty. Interim maintenance was awarded and parties are currently referred to high-court mediation. <Citation src={{ doc: 'Petition_HMOP67.pdf', page: 1 }} />
                </>
              )}
            </p>
            <p className="font-mono text-[10.5px] text-muted-foreground">
              Synthesized from court docket filings · Source documents verified · Final determination strictly human
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={crim ? 'Accused Persons' : 'Respondent'}
            action={
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {c.accused.length} listed
              </span>
            }
          />
          <ul className="divide-y divide-border/60">
            {c.accused.map((a) => (
              <li
                key={a.name}
                className="grid gap-3 px-5 py-3.5 sm:grid-cols-[1fr_auto] hover:bg-white/[0.02]"
              >
                <div>
                  <p className="font-serif font-medium text-foreground">
                    {revealed && a.fullName ? a.fullName : a.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Age {a.age} · Alias: {a.alias}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{a.address}</p>
                </div>
                <div>
                  <Pill t={custodyTone[a.custody]}>{a.custody}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Parties to Proceeding" />
          <ul className="divide-y divide-border/60">
            {c.parties.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  {p.masked && !(revealed && !poscoVictim(p)) && (
                    <EyeOff className="size-3 text-muted-foreground" aria-label="masked" />
                  )}
                  <span className="text-xs font-medium text-foreground">
                    {p.masked && revealed && !poscoVictim(p) ? revealName(p.name, p.role) : p.name}
                  </span>
                </div>
                <Tag>{p.role}</Tag>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Counsels & Advocates on Record" />
          <ul className="divide-y divide-border/60">
            {c.lawyers.map((l) => (
              <li
                key={l.name}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs"
              >
                <span className="font-medium text-foreground">{l.name}</span>
                <span className="text-muted-foreground font-mono">
                  {l.side} · {l.enrol}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card line className="p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                {crim ? 'Victims on Record' : 'Aggrieved Parties'}
              </div>
              <div className="mt-1 font-serif text-4xl font-semibold text-accent tabular-nums">
                {c.victims.total}
              </div>
            </div>
            <div className="text-right text-xs font-mono text-muted-foreground">
              <div>{c.victims.minors} minor{c.victims.minors === 1 ? '' : 's'}</div>
              <div>{c.victims.adults} adult{c.victims.adults === 1 ? '' : 's'}</div>
            </div>
          </div>
          <ul className="mt-4 space-y-2 border-t border-border/80 pt-3 text-xs">
            {c.victims.list.map((v) => (
              <li key={v.masked} className="flex items-center gap-2 font-mono text-muted-foreground">
                {!(revealed && !v.minor) && <EyeOff className="size-3 text-muted-foreground" />}
                <span className="text-foreground">
                  {revealed && !v.minor ? v.full : v.masked}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10px] text-muted-foreground leading-relaxed">
            Statutory privacy notice: Minor identities under POCSO s.23 can never be unmasked.
          </p>
        </Card>

        <Card>
          <CardHeader title="Registry Metadata" />
          <dl className="px-5 py-2 divide-y divide-border/50">
            {detail.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[130px_1fr] gap-3 py-2.5 text-xs last:border-0"
              >
                <dt className="text-muted-foreground font-mono text-[11px]">{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Statutory Calendar Milestones" />
          <ul className="px-5 py-2 divide-y divide-border/50 text-xs">
            {c.keyDates.map((k) => (
              <li key={k.label} className="flex justify-between gap-3 py-2.5">
                <span className="text-muted-foreground">{k.label}</span>
                <span className="font-mono tabular-nums text-foreground">{k.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export function Timeline({ c, highlight }: { c: CaseRec; highlight?: number }) {
  return <TimelineWorkflowTree c={c} highlight={highlight} />
}

export function Police({ c }: { c: CaseRec }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Police Station Diary & Malkhana Log" sub={c.policeStation} />
        <ul className="divide-y divide-border/60">
          {c.police.map((p, i) => (
            <li key={i} className="flex gap-4 px-5 py-3 text-xs">
              <span className="w-24 shrink-0 font-mono text-muted-foreground">{p.date}</span>
              <span className="text-foreground leading-relaxed">{p.entry}</span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader title="Remand & Judicial Custody Status" />
          <div className="px-5 py-4 text-xs space-y-1">
            <p className="font-semibold text-foreground">{c.custody.status}</p>
            <p className="text-muted-foreground leading-relaxed">{c.custody.detail}</p>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader title="Outstanding Forensic Lab Reports" />
          <table className="w-full text-xs">
            <thead>
              <tr>
                <Th>Examination</Th>
                <Th>Target Due</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {c.pendingReports.map((r) => (
                <tr key={r.name} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div className="text-[10.5px] font-mono text-muted-foreground">
                      Requested {r.requested}
                    </div>
                  </Td>
                  <Td className="font-mono text-muted-foreground">{r.due}</Td>
                  <Td>
                    <StatusChip s={r.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

function People({ c }: { c: CaseRec }) {
  const { revealed } = useApp()
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {c.people.map((p) => {
        const show = !(p.masked && !(revealed && c.type === 'Matrimonial'))
        return (
          <Card key={p.name} className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg border border-border bg-[#151922] text-muted-foreground">
                {show ? <UserRound className="size-4" /> : <EyeOff className="size-3.5" />}
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-foreground">
                  {!show ? p.name : p.masked ? revealName(p.name, p.role) : p.name}
                </h3>
                <p className="font-mono text-[10.5px] text-muted-foreground">{p.role}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{p.note}</p>
            {p.links.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
                <span className="font-mono text-[10px] text-muted-foreground">Linked:</span>
                {p.links.map((l) => (
                  <Tag key={l} className="font-mono text-[10.5px]">
                    {l}
                  </Tag>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function Documents({ c }: { c: CaseRec }) {
  const [sel, setSel] = useState(c.documents[0]?.name)
  const d = c.documents.find((x) => x.name === sel)
  const { toast } = useApp()

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader title="Court Docket Exhibits" sub={`${c.documents.length} files filed`} />
        <ul className="divide-y divide-border/60">
          {c.documents.map((x) => (
            <li key={x.name}>
              <button
                onClick={() => setSel(x.name)}
                className={cn(
                  'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer',
                  sel === x.name ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]',
                )}
              >
                <FileText className="size-4 text-accent shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs font-medium text-foreground truncate">
                    {x.name}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {x.kind} · {x.pages} pp · {x.size} · {x.date}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 flex flex-col justify-between">
        {d ? (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-mono text-xs font-semibold text-foreground">{d.name}</h3>
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  Filed on {d.date} · {d.pages} pages
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast(`Downloading ${d.name}`, 'info')}
              >
                <Download className="size-3" /> Download
              </Button>
            </div>
            <div className="my-5 grid aspect-[3/4] max-h-[360px] place-items-center rounded-lg border border-dashed border-border bg-[#10131a] text-center text-xs text-muted-foreground">
              <div>
                <ImageIcon className="mx-auto mb-2 size-6 text-muted-foreground/60" />
                <p className="font-mono">Page 1 of {d.pages}</p>
                <p className="mt-1 text-[11px]">Court Document Preview Service</p>
              </div>
            </div>
            <div className="font-mono text-[10.5px] text-muted-foreground text-center">
              SHA-256 e-Courts Certified Digital Hash Verified
            </div>
          </>
        ) : (
          <EmptyState title="No exhibit chosen" text="Select a document on the left." />
        )}
      </Card>
    </div>
  )
}

function Deadlines({ c }: { c: CaseRec }) {
  return (
    <Card className="overflow-x-auto">
      <CardHeader title="Statutory Limitations & Procedural Mandates" sub="Rule-based countdowns" />
      <table className="w-full min-w-[640px] text-xs">
        <thead>
          <tr>
            <Th>Statutory Rule Mandate</Th>
            <Th>Limitation Deadline</Th>
            <Th>Status Index</Th>
            <Th>Compliance</Th>
            <Th>Legal Authority</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {c.deadlines.map((d) => (
            <tr key={d.rule} className="hover:bg-white/[0.02]">
              <Td className="font-medium text-foreground">{d.rule}</Td>
              <Td className="font-mono tabular-nums text-muted-foreground">{d.due}</Td>
              <Td
                className={cn(
                  'font-mono tabular-nums text-xs',
                  d.days < 0 ? 'font-semibold text-bad' : 'text-muted-foreground',
                )}
              >
                {d.days < 0 ? `${-d.days} days overdue` : d.days === 0 ? 'Today' : `in ${d.days} days`}
              </Td>
              <Td>
                <StatusChip s={d.status} />
              </Td>
              <Td>
                <Citation src={d.src} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default function CaseDetail() {
  const { id } = useParams()
  const c = findCase(id)
  const loading = useLoad(400)
  const { role, revealed, setRevealed, toast } = useApp()
  const [sp] = useSearchParams()
  const tabParam = sp.get('tab')
  const initialTab =
    tabParam === 'Roadmap'
      ? 'Case Roadmap Flowchart'
      : tabParam && TABS.includes(tabParam)
        ? tabParam
        : 'Case Roadmap Flowchart'
  const [tab, setTab] = useState(initialTab)
  const [hl, setHl] = useState<number | undefined>(
    sp.get('event') ? Number(sp.get('event')) : undefined,
  )
  const [modal, setModal] = useState<null | 'order' | 'note' | 'export' | 'reveal'>(null)
  const [text, setText] = useState('')
  const [reason, setReason] = useState('')

  if (!c)
    return (
      <Card>
        <EmptyState
          title="Case file not found"
          text="This case identifier does not exist or access has been restricted."
          action={
            <Link to="/cases">
              <Button>Return to Registry</Button>
            </Link>
          }
        />
      </Card>
    )

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    )

  if (!c.detailed)
    return (
      <>
        <Link
          to="/cases"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Return to cases
        </Link>
        <PageHeader title={c.number} sub={c.title} />
        <Card>
          <EmptyState
            title="Sample docket loaded in summary mode"
            text="Comprehensive 7-tab forensic breakdown is available for sample matters: S.C. 214/2025, Spl.S.C. (POCSO) 38/2025 and H.M.O.P. 67/2025."
            action={
              <Link to="/cases/sc-214-2025">
                <Button>Open Featured Criminal Matter</Button>
              </Link>
            }
          />
        </Card>
      </>
    )

  const close = () => {
    setModal(null)
    setText('')
    setReason('')
  }
  const canReveal = role === 'Judge'

  return (
    <>
      <Link
        to="/cases"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Return to case registry
      </Link>

      {/* Case Header Banner */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-accent">{c.number}</span>
              <Tag>{c.type}</Tag>
              <StatusChip s={c.status} />
            </div>
            <h1 className="mt-2 font-serif text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              {maskedTitle(c.type, c.title, revealed)}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{c.court}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canReveal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (revealed ? setRevealed(false) : setModal('reveal'))}
              >
                {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {revealed ? 'Re-mask Identities' : 'Reveal Identities'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={role !== 'Judge'}
              title={role !== 'Judge' ? 'Only a Judge can enter orders' : ''}
              onClick={() => setModal('order')}
            >
              <Gavel className="size-3.5" /> Enter Bench Order
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModal('note')}>
              <StickyNote className="size-3.5" /> Judicial Note
            </Button>
            <Button size="sm" onClick={() => setModal('export')}>
              <Download className="size-3.5" /> Export Certified Record
            </Button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-border/80 pt-4 sm:grid-cols-3 text-xs">
          <div>
            <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Next Hearing Session
            </dt>
            <dd className="mt-1 font-serif text-base font-semibold text-foreground">
              {c.nextHearing}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Assigned Bench
            </dt>
            <dd className="mt-1 text-foreground font-medium">{c.judge}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Inactivity Duration
            </dt>
            <dd
              className={cn(
                'mt-1 font-mono tabular-nums text-sm font-semibold',
                c.idle >= 30 ? 'text-bad' : 'text-foreground',
              )}
            >
              {c.idle} days
            </dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
          {[
            ['Accused', c.accused.length],
            ['Victims', c.victims.total],
            ['Witnesses', c.witnesses],
            ['Evidence Items', c.evidence.length],
            ['Pending Lab Reports', c.evidence.filter((e) => e.lab === 'pending').length],
          ].map(([l, v]) => (
            <div key={l as string} className="bg-card px-4 py-3">
              <div className="font-serif text-2xl font-semibold tabular-nums text-foreground">
                {v}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <div className="mt-6" role="tabpanel">
        {tab === 'Case Roadmap Flowchart' && <CaseRoadmapFlowchart c={c} />}
        {tab === 'Overview' && <Overview c={c} />}
        {tab === 'Timeline' && <Timeline c={c} highlight={hl} />}
        {tab === 'Evidence' && (
          <EvidencePanel
            cs={[c]}
            onJump={(_, i) => {
              setHl(i)
              setTab('Timeline')
            }}
          />
        )}
        {tab === 'Police Activity' && <Police c={c} />}
        {tab === 'People' && <People c={c} />}
        {tab === 'Documents' && <Documents c={c} />}
        {tab === 'Deadlines' && <Deadlines c={c} />}
      </div>

      {/* Bench Modals */}
      <Modal
        open={modal === 'order' || modal === 'note'}
        onClose={close}
        title={modal === 'order' ? 'Enter Operative Bench Order' : 'Private Judicial Note'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!text.trim()}
              onClick={() => {
                toast(
                  modal === 'order'
                    ? 'Operative order committed to official docket'
                    : 'Confidential note logged',
                )
                close()
              }}
            >
              <FilePlus2 className="size-3.5" /> Save Record
            </Button>
          </>
        }
      >
        <Field label={modal === 'order' ? 'Operative Order Text' : 'Confidential Note'}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-[#10131a] p-3 text-xs text-foreground focus:border-border-hover focus:outline-none"
            placeholder={
              modal === 'order'
                ? 'Enter operative order dictation. Presiding judge authorization logged.'
                : 'Confidential judicial observations (strictly private).'
            }
          />
        </Field>
      </Modal>

      <Modal
        open={modal === 'export'}
        onClose={close}
        title="Export Certified Bench Dossier"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast('Certified PDF summary exported. Audit hash generated.')
                close()
              }}
            >
              Generate Certified PDF
            </Button>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          Generates a verified judicial dossier containing procedural summaries, chronological
          timeline, forensic custody chain, and citations. Masking rules for vulnerable parties
          are preserved.
        </p>
      </Modal>

      <Modal
        open={modal === 'reveal'}
        onClose={close}
        title="Reveal Masked Party Identities"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={reason.trim().length < 5}
              onClick={() => {
                setRevealed(true)
                toast('Adult identities revealed. Access logged to registry audit.', 'info')
                close()
              }}
            >
              <Lock className="size-3.5" /> Unmask and Record in Audit
            </Button>
          </>
        }
      >
        <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
          Unmasking party identities is restricted to the presiding Judge. A valid judicial
          purpose must be recorded. Minor identities under POCSO remain permanently masked.
        </p>
        <Field label="Statutory Justification / Reason">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Dictation of final judgment and formal notice"
          />
        </Field>
      </Modal>
    </>
  )
}
