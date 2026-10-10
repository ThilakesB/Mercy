import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Download, Plus, FilterX, Search, Crosshair, ArrowUpDown, ArrowRight } from 'lucide-react'
import { judicialStore, type FullCaseRecord } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  PageHeader,
  Select,
  StatusChip,
  Tag,
  Td,
  Th,
  useApp,
} from '../ui'

export default function Cases() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const cases = judicialStore.getCases()

  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<'number' | 'hearing' | 'filing'>('number')

  const rows = useMemo(() => {
    let r = cases.filter((c) => {
      const query = q.trim().toLowerCase()
      if (
        query &&
        !(c.number + c.title + c.court + c.policeStation + c.io.name).toLowerCase().includes(query)
      ) {
        return false
      }
      if (type && c.type !== type) return false
      if (status === 'closed' && !c.isClosed) return false
      if (status === 'active' && c.isClosed) return false
      return true
    })

    r = [...r].sort((a, b) => {
      if (sort === 'number') return a.number.localeCompare(b.number)
      if (sort === 'filing') return b.filingDate.localeCompare(a.filingDate)
      return a.nextHearing.localeCompare(b.nextHearing)
    })

    return r
  }, [cases, q, type, status, sort])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bench Case Dossiers & Trial Registry"
        sub="Primary case repository. Find cases by number or title, review investigating officer manifests, evidence chain-of-custody, and closed judgments."
        actions={
          <Link to="/cases/new">
            <button className="px-5 py-2.5 rounded-full bg-[#121316] text-white hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs">
              <Plus className="size-4 text-[#FF5C5C]" />
              Ingest New Case (Auto-Numbering)
            </button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by case no. (e.g. S.C. 214/2025), party, IO, or police station..."
              className="pl-12 pr-5 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
            />
          </div>

          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-13 text-xs sm:text-sm font-semibold rounded-full border-black/10"
          >
            <option value="">All Case Types</option>
            <option value="Criminal">Criminal Sessions</option>
            <option value="POCSO">POCSO Special Court</option>
            <option value="Matrimonial">Matrimonial / Family</option>
            <option value="Civil">Civil Suit</option>
          </Select>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-13 text-xs sm:text-sm font-semibold rounded-full border-black/10"
          >
            <option value="">All Trial Statuses</option>
            <option value="active">Active In Trial</option>
            <option value="closed">Closed &amp; Disposed</option>
          </Select>
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="bg-white overflow-hidden">
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Registered Cases ({rows.length} Recorded)
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Select any matter to open the 4-quadrant trial dossier
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#F7F4EB]/50">
                <Th>CASE NUMBER</Th>
                <Th>STANDARDIZED CAUSE TITLE</Th>
                <Th>TYPE</Th>
                <Th>LEAD IO &amp; POLICE STATION</Th>
                <Th>SECTIONS CITED</Th>
                <Th>TRIAL STAGE</Th>
                <Th>NEXT HEARING</Th>
                <Th>STATUS</Th>
                <Th>ACTION</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-xs text-zinc-400">
                    <div className="space-y-2 max-w-sm mx-auto">
                      <p className="font-extrabold text-sm text-zinc-700">No Cases Found in Registry</p>
                      <p className="text-[11px] text-zinc-400">Your judicial database is clean. Click below to intake the first case.</p>
                      <Link to="/cases/new" className="inline-block pt-2">
                        <Button variant="coral" size="sm">
                          + Intake New Case
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F4EB]/30 transition-colors border-b border-black/[0.04]">
                  <Td className="whitespace-nowrap">
                    <Link
                      to={`/cases/${c.id}`}
                      className="font-black text-xs text-[#FF5C5C] hover:underline"
                    >
                      {c.number}
                    </Link>
                  </Td>

                  <Td>
                    <div className="font-extrabold text-xs text-zinc-900 max-w-sm truncate">
                      {c.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                      FIR: {c.fir.no} ({c.fir.date}) · {c.weapons.length} Weapons Admitted
                    </div>
                  </Td>

                  <Td className="whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-zinc-100 text-zinc-700">
                      {c.type}
                    </span>
                  </Td>

                  <Td className="text-xs">
                    <div className="font-bold text-zinc-900">{c.io.name}</div>
                    <div className="text-[11px] text-zinc-400 font-medium truncate max-w-xs">
                      {c.policeStation}
                    </div>
                  </Td>

                  <Td className="text-[11px] text-zinc-600 font-medium max-w-xs truncate">
                    {c.acts.join(', ')}
                  </Td>

                  <Td className="text-xs font-bold text-zinc-800 whitespace-nowrap">
                    {c.stage}
                  </Td>

                  <Td className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
                    {c.nextHearing}
                  </Td>

                  <Td className="whitespace-nowrap">
                    {c.isClosed ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                        Closed
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-bold">
                        {c.status}
                      </span>
                    )}
                  </Td>

                  <Td className="whitespace-nowrap">
                    <Link to={`/cases/${c.id}`}>
                      <button className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1">
                        Dossier
                        <ArrowRight className="size-3" />
                      </button>
                    </Link>
                  </Td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
