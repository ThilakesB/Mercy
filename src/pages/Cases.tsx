import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Download, EyeOff, FilterX, FolderSearch, ArrowUpDown } from 'lucide-react'
import { cases, type CaseType } from '../data'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  StatusChip,
  Tag,
  Td,
  Th,
  Skeleton,
  useApp,
  useLoad,
} from '../ui'

export const maskedTitle = (type: CaseType, title: string, revealed: boolean) => {
  if (type === 'Matrimonial' && revealed)
    return title
      .replace('Party A', 'Divya R.')
      .replace('Party B', 'Karthik S.')
      .replace('Party C', 'Anitha M.')
      .replace('Party D', 'Prakash M.')
  return title
}

const toDate = (s: string) => new Date(s)

export default function Cases() {
  const loading = useLoad(400)
  const [sp] = useSearchParams()
  const { revealed, toast } = useApp()
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [section, setSection] = useState('')
  const [officer, setOfficer] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<'hearing' | 'idle' | 'number'>('hearing')

  const officers = [...new Set(cases.map((c) => c.io).filter((o) => o !== 'N/A'))]

  const rows = useMemo(() => {
    let r = cases.filter((c) => {
      if (q && !(c.number + c.title + c.court).toLowerCase().includes(q.toLowerCase())) return false
      if (type && c.type !== type) return false
      if (status && c.status !== status) return false
      if (section && !c.acts.join(' ').toLowerCase().includes(section.toLowerCase())) return false
      if (officer && c.io !== officer) return false
      if (from && toDate(c.nextHearing) < new Date(from)) return false
      if (to && toDate(c.nextHearing) > new Date(to)) return false
      return true
    })
    r = [...r].sort((a, b) =>
      sort === 'idle'
        ? b.idle - a.idle
        : sort === 'number'
        ? a.number.localeCompare(b.number)
        : +toDate(a.nextHearing) - +toDate(b.nextHearing),
    )
    return r
  }, [q, type, status, section, officer, from, to, sort])

  const reset = () => {
    setQ('')
    setType('')
    setStatus('')
    setSection('')
    setOfficer('')
    setFrom('')
    setTo('')
  }

  const exportCsv = () => {
    const head =
      'Case number,Title,Type,Court,Acts,Stage,Next hearing,Officer,Status,Idle days'
    const body = rows.map((c) =>
      [
        c.number,
        maskedTitle(c.type, c.title, false),
        c.type,
        c.court,
        c.acts.join('; '),
        c.stage,
        c.nextHearing,
        c.io,
        c.status,
        c.idle,
      ]
        .map((v) => `"${v}"`)
        .join(','),
    )
    const url = URL.createObjectURL(
      new Blob([[head, ...body].join('\n')], { type: 'text/csv' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'mercy-cases-roster.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast(`Exported ${rows.length} cases (identities masked per law)`)
  }

  if (sp.get('state') === 'error')
    return <ErrorState onRetry={() => (window.location.href = '/cases')} />

  return (
    <>
      <PageHeader
        title="Case Registry Roster"
        sub="Assigned roster matters. POCSO and matrimonial party names are masked automatically."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-3.5" /> Export Clean CSV
          </Button>
        }
      />

      {/* Filter Bento */}
      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            aria-label="Search cases"
            placeholder="Search number, title, court..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select
            aria-label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Classification Types</option>
            <option>Criminal</option>
            <option>POCSO</option>
            <option>Matrimonial</option>
          </Select>
          <Select
            aria-label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Procedural Statuses</option>
            <option value="ontrack">On track</option>
            <option value="warning">Warning</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Input
            aria-label="Section or act"
            placeholder="Statute / Section (e.g. s.35 POCSO)"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
          <Select
            aria-label="Officer"
            value={officer}
            onChange={(e) => setOfficer(e.target.value)}
          >
            <option value="">All Investigating Officers</option>
            {officers.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
          <Input
            type="date"
            aria-label="Hearing from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            type="date"
            aria-label="Hearing to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <div className="flex gap-2">
            <Select
              aria-label="Sort"
              className="flex-1"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="hearing">Sort: Earliest hearing</option>
              <option value="idle">Sort: Most idle days</option>
              <option value="number">Sort: Case number</option>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              aria-label="Reset filters"
              className="px-3"
            >
              <FilterX className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Roster Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FolderSearch className="size-5" />}
            title="No matching registry matters found"
            text="Refine your search terms or adjust date filters."
            action={
              <Button variant="outline" size="sm" onClick={reset}>
                Reset All Filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-xs">
              <thead>
                <tr>
                  <Th>Case Identifier</Th>
                  <Th>Matter Title</Th>
                  <Th>Type</Th>
                  <Th>Courtroom</Th>
                  <Th>Sections / Statutes</Th>
                  <Th>Trial Stage</Th>
                  <Th>Next Hearing</Th>
                  <Th>Investigating Officer</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Idle Duration</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors focus-within:bg-white/[0.03]"
                  >
                    <Td>
                      <Link
                        to={`/cases/${c.id}`}
                        className="font-mono text-xs font-medium text-accent hover:underline block"
                      >
                        {c.number}
                      </Link>
                    </Td>
                    <Td className="max-w-[240px]">
                      <span className="font-medium text-foreground block truncate">
                        {maskedTitle(c.type, c.title, revealed)}
                      </span>
                      {c.type !== 'Criminal' && !(c.type === 'Matrimonial' && revealed) && (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground mt-0.5">
                          <EyeOff className="size-2.5" /> identity masked
                        </span>
                      )}
                    </Td>
                    <Td>
                      <Tag>{c.type}</Tag>
                    </Td>
                    <Td className="max-w-[180px] text-muted-foreground truncate">
                      {c.court}
                    </Td>
                    <Td className="font-mono text-[11px] text-muted-foreground">
                      {c.acts.map((a) => (
                        <div key={a}>{a}</div>
                      ))}
                    </Td>
                    <Td className="font-medium text-foreground">{c.stage}</Td>
                    <Td className="font-mono tabular-nums whitespace-nowrap text-muted-foreground">
                      {c.nextHearing}
                    </Td>
                    <Td className="max-w-[170px] text-muted-foreground truncate">
                      {c.io}
                    </Td>
                    <Td>
                      <StatusChip s={c.status} />
                    </Td>
                    <Td className="text-right font-mono tabular-nums text-muted-foreground">
                      {c.idle > 30 ? (
                        <span className="font-semibold text-warn">{c.idle}d</span>
                      ) : (
                        `${c.idle}d`
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
