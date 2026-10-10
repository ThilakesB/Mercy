import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Gavel,
  History,
  Calendar,
  Filter,
  BarChart3,
  Scale,
  Award,
  FileText,
  DollarSign,
  TrendingUp,
  Shield,
} from 'lucide-react'
import {
  judicialStore,
  type PunishmentRecord,
  type PunishmentType,
} from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Tag,
  Th,
  Td,
  Select,
  useApp,
} from '../ui'

export default function Judgments() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const punishments = judicialStore.getPunishments()
  const countsByType = judicialStore.getPunishmentCountsByType()

  const [viewMode, setViewMode] = useState<'LIFETIME' | 'MONTHLY'>('LIFETIME')
  const [selectedMonth, setSelectedMonth] = useState('2026-10')
  const [filterType, setFilterType] = useState<string>('ALL')

  // Total fines calculated
  const totalFinesLifetime = punishments.reduce((acc, p) => acc + p.fineAmountInr, 0)

  // Filtered by Month if in Monthly mode
  const displayedPunishments = punishments.filter((p) => {
    const matchesMonth =
      viewMode === 'LIFETIME' ? true : p.pronouncementDate.startsWith(selectedMonth)
    const matchesType = filterType === 'ALL' || p.type === filterType
    return matchesMonth && matchesType
  })

  const typeConfig: Record<PunishmentType, { label: string; bg: string; text: string; tag: string }> = {
    CAPITAL: { label: 'Capital (Death)', bg: 'bg-[#FEE2E2]', text: 'text-rose-950', tag: 'bg-rose-200/60 text-rose-800' },
    LIFE_IMPRISONMENT: { label: 'Life Imprisonment', bg: 'bg-[#FEF3C7]', text: 'text-amber-950', tag: 'bg-amber-200/60 text-amber-800' },
    RIGOROUS_IMPRISONMENT: { label: 'Rigorous Prison', bg: 'bg-[#DBEAFE]', text: 'text-blue-950', tag: 'bg-blue-200/60 text-blue-800' },
    SIMPLE_IMPRISONMENT: { label: 'Simple Custody', bg: 'bg-[#E0E7FF]', text: 'text-indigo-950', tag: 'bg-indigo-200/60 text-indigo-800' },
    PENAL_FINE: { label: 'Penal Fine Only', bg: 'bg-[#DCFCE7]', text: 'text-emerald-950', tag: 'bg-emerald-200/60 text-emerald-800' },
    PROBATION: { label: 'Probation / Bond', bg: 'bg-[#F3E8FF]', text: 'text-purple-950', tag: 'bg-purple-200/60 text-purple-800' },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Judgment & Punishment Pronouncement History"
        sub="Longitudinal judicial sentencing repository. Punishments catalogued by statutory category across the presiding judge's career lifetime and month-by-month dockets."
        actions={
          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-black/[0.06] shadow-xs">
            <button
              onClick={() => setViewMode('LIFETIME')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'LIFETIME'
                  ? 'bg-[#121316] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Career Lifetime View
            </button>
            <button
              onClick={() => setViewMode('MONTHLY')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'MONTHLY'
                  ? 'bg-[#121316] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Monthly Recorder
            </button>
          </div>
        }
      />

      {/* Top 6 Pastel Bento Cards (Matching Image 4 Jewellery Dashboard) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {(Object.keys(countsByType) as PunishmentType[]).map((type) => {
          const cfg = typeConfig[type]
          const isSelected = filterType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(filterType === type ? 'ALL' : type)}
              className={`p-4 rounded-3xl text-left transition-all cursor-pointer relative overflow-hidden group shadow-xs ${cfg.bg} ${
                isSelected ? 'ring-2 ring-black scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text} opacity-80`}>
                  {cfg.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.tag}`}>
                  {((countsByType[type] / punishments.length) * 100).toFixed(0)}%
                </span>
              </div>
              <div className={`text-2xl font-black ${cfg.text}`}>
                {countsByType[type]}
              </div>
              <div className="text-[10.5px] font-medium text-zinc-600 mt-1">
                Decrees sealed
              </div>
            </button>
          )
        })}
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 bg-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {viewMode === 'LIFETIME' ? 'Total Convictions Pronounced' : `Total Sentences (${selectedMonth})`}
            </div>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {displayedPunishments.length} Decrees
            </div>
            <div className="text-xs text-zinc-500 font-medium mt-0.5">
              Across active bench term
            </div>
          </div>
          <div className="size-12 rounded-full bg-[#FEF08A] text-amber-950 grid place-items-center">
            <Gavel className="size-5" />
          </div>
        </Card>

        <Card className="p-5 bg-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Life &amp; Capital Sentences
            </div>
            <div className="text-2xl font-black text-zinc-900 mt-1">
              {countsByType.CAPITAL + countsByType.LIFE_IMPRISONMENT} Decrees
            </div>
            <div className="text-xs text-zinc-500 font-medium mt-0.5">
              {countsByType.CAPITAL} Capital · {countsByType.LIFE_IMPRISONMENT} Life
            </div>
          </div>
          <div className="size-12 rounded-full bg-[#FBCFE8] text-pink-950 grid place-items-center">
            <Scale className="size-5" />
          </div>
        </Card>

        <Card className="p-5 bg-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Cumulative Penal Fines
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              ₹{totalFinesLifetime.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 font-medium mt-0.5">
              Victim Compensation Fund
            </div>
          </div>
          <div className="size-12 rounded-full bg-[#BBF7D0] text-emerald-950 grid place-items-center">
            <DollarSign className="size-5" />
          </div>
        </Card>
      </div>

      {/* Month Filter Selector (if in Monthly mode) */}
      {viewMode === 'MONTHLY' && (
        <Card className="p-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-700">Select Month Recap:</span>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 text-xs rounded-full"
            >
              <option value="2026-10">October 2026 (Current Term)</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-04">April 2026</option>
            </Select>
          </div>
          <span className="text-xs font-bold text-zinc-500">
            {displayedPunishments.length} pronouncements in {selectedMonth}
          </span>
        </Card>
      )}

      {/* Table of Pronouncements */}
      <Card className="bg-white overflow-hidden">
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Pronouncement Records ({displayedPunishments.length} Entries)
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Official decrees with convict details, statutory sentence, fine imposition, and operative snippets.
            </p>
          </div>
          {filterType !== 'ALL' && (
            <button
              onClick={() => setFilterType('ALL')}
              className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            >
              Clear Filter ({filterType})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#F7F4EB]/50">
                <Th>DATE</Th>
                <Th>CASE NUMBER &amp; TITLE</Th>
                <Th>CONVICT NAME &amp; ID</Th>
                <Th>SENTENCE CATEGORY</Th>
                <Th>DURATION</Th>
                <Th>FINE AMOUNT</Th>
                <Th>OPERATIVE DECREE</Th>
              </tr>
            </thead>
            <tbody>
              {displayedPunishments.map((p) => {
                const cfg = typeConfig[p.type]
                return (
                  <tr key={p.id} className="hover:bg-[#F7F4EB]/30 transition-colors border-b border-black/[0.04]">
                    <Td className="text-xs font-bold text-zinc-400 whitespace-nowrap">
                      {p.pronouncementDate}
                    </Td>
                    <Td>
                      <Link
                        to={`/cases/${p.caseId}`}
                        className="font-bold text-xs text-[#FF5C5C] hover:underline"
                      >
                        {p.caseNumber}
                      </Link>
                      <div className="text-xs font-medium text-zinc-700 truncate max-w-xs mt-0.5">
                        {p.caseTitle}
                      </div>
                    </Td>
                    <Td>
                      <div className="font-bold text-xs text-zinc-900">
                        {p.convictName}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium">
                        ID: {p.crimId}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </Td>
                    <Td className="text-xs font-bold text-zinc-800 whitespace-nowrap">
                      {p.durationDescription}
                    </Td>
                    <Td className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                      ₹{p.fineAmountInr.toLocaleString()}
                    </Td>
                    <Td className="text-xs text-zinc-600 max-w-xs truncate font-medium">
                      "{p.operativeOrderSnippet}"
                    </Td>
                  </tr>
                )
              })}

              {displayedPunishments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-zinc-400">
                    No pronouncements found for current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
