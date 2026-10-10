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
  Plus,
  Trash2,
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
  Modal,
  PageHeader,
  Tag,
  Th,
  Td,
  Input,
  Field,
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
  const cases = judicialStore.getCases()
  const criminals = judicialStore.getCriminals()

  const [viewMode, setViewMode] = useState<'LIFETIME' | 'MONTHLY'>('LIFETIME')
  const [selectedMonth, setSelectedMonth] = useState('2026-10')
  const [filterType, setFilterType] = useState<string>('ALL')

  // Add Judgment Modal State
  const [isAddJudgmentOpen, setIsAddJudgmentOpen] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '')
  const [caseNumber, setCaseNumber] = useState<string>(cases[0]?.number || 'SC/ND-2026/0411')
  const [caseTitle, setCaseTitle] = useState<string>(cases[0]?.title || 'State of NCT v. Accused')
  const [convictName, setConvictName] = useState<string>('Venkatesh Rao')
  const [crimId, setCrimId] = useState<string>('CRIM-2026-7712')
  const [sentenceType, setSentenceType] = useState<PunishmentType>('RIGOROUS_IMPRISONMENT')
  const [durationDescription, setDurationDescription] = useState<string>('10 Years Rigorous Imprisonment')
  const [durationMonths, setDurationMonths] = useState<string>('120')
  const [fineAmountInr, setFineAmountInr] = useState<string>('50000')
  const [pronouncementDate, setPronouncementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [operativeText, setOperativeText] = useState<string>(
    'The convict is hereby sentenced to rigorous custody and directed to pay the penal fine into the Victim Compensation Fund.'
  )
  const [judge, setJudge] = useState<string>('Hon. Justice R. Venkataraman')

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

  // Handle Case change in modal
  const handleCaseSelect = (cId: string) => {
    setSelectedCaseId(cId)
    const found = cases.find((c) => c.id === cId)
    if (found) {
      setCaseNumber(found.number)
      setCaseTitle(found.title)
      if (found.judge) setJudge(found.judge)
      if (found.parties && found.parties.length > 0) {
        const accused = found.parties.find((p) => p.role.toLowerCase().includes('accused'))
        if (accused) {
          setConvictName(accused.name)
          if (accused.crimId) setCrimId(accused.crimId)
        }
      }
    }
  }

  const handleRecordJudgment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!convictName.trim()) {
      toast('Please specify convict name', 'bad')
      return
    }
    if (!caseNumber.trim()) {
      toast('Please specify case number', 'bad')
      return
    }

    judicialStore.addPunishment({
      caseId: selectedCaseId || 'custom-case',
      caseNumber: caseNumber.trim(),
      caseTitle: caseTitle.trim(),
      convictName: convictName.trim(),
      crimId: crimId.trim() || `CRIM-${Math.floor(1000 + Math.random() * 9000)}`,
      judge: judge.trim(),
      type: sentenceType,
      durationMonths: Number(durationMonths) || 0,
      durationDescription: durationDescription.trim(),
      fineAmountInr: Number(fineAmountInr) || 0,
      pronouncementDate: pronouncementDate || new Date().toISOString().split('T')[0],
      operativeText: operativeText.trim() || 'Official decree pronounced and sealed.',
    })

    toast('Judgment decree pronounced and saved to database!', 'ok')
    setIsAddJudgmentOpen(false)
  }

  const handleDeletePunishment = (p: PunishmentRecord) => {
    if (window.confirm(`Delete pronouncement decree for ${p.convictName} (${p.caseNumber})?`)) {
      judicialStore.deletePunishment(p.id)
      toast('Decree removed from pronouncement registry', 'ok')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Judgment & Punishment Pronouncement History"
        sub="Longitudinal judicial sentencing repository. Punishments catalogued by statutory category across the presiding judge's career lifetime and month-by-month dockets."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setIsAddJudgmentOpen(true)}
              className="rounded-full shadow-sm flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Record Judgment</span>
            </Button>
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
          </div>
        }
      />

      {/* Top 6 Pastel Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {(Object.keys(countsByType) as PunishmentType[]).map((type) => {
          const cfg = typeConfig[type]
          const isSelected = filterType === type
          const percentage = punishments.length > 0
            ? Math.round((countsByType[type] / punishments.length) * 100)
            : 0

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
                  {percentage}%
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
                <Th className="text-right">ACTIONS</Th>
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
                      {p.durationDescription || (p.durationMonths ? `${p.durationMonths} Months` : 'Statutory Order')}
                    </Td>
                    <Td className="text-xs font-bold text-emerald-700 whitespace-nowrap">
                      ₹{p.fineAmountInr.toLocaleString()}
                    </Td>
                    <Td className="text-xs text-zinc-600 max-w-xs truncate font-medium">
                      "{p.operativeOrderSnippet || p.operativeText || 'Decree sealed'}"
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeletePunishment(p)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete pronouncement decree"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </Td>
                  </tr>
                )
              })}

              {displayedPunishments.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-zinc-400">
                    No pronouncements found for current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Judgment Modal */}
      <Modal
        open={isAddJudgmentOpen}
        onClose={() => setIsAddJudgmentOpen(false)}
        title="Record New Judgment & Punishment Decree"
      >
        <form onSubmit={handleRecordJudgment} className="space-y-4">
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs text-amber-900">
            <strong>Judicial Decree Pronouncement:</strong> Enter the convict decree details. The sentencing will be recorded in the live registry and synchronized with the Supabase database.
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Associated Case">
              <Select
                value={selectedCaseId}
                onChange={(e) => handleCaseSelect(e.target.value)}
                className="w-full"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number} - {c.title.slice(0, 30)}
                  </option>
                ))}
                <option value="custom-case">-- Other / Unlisted Docket --</option>
              </Select>
            </Field>

            <Field label="Case Number">
              <Input
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="SC/ND-2026/0411"
                required
              />
            </Field>
          </div>

          <Field label="Case Title / Proceeding Style">
            <Input
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="State of NCT v. Accused"
              required
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Convict Full Name">
              <Input
                value={convictName}
                onChange={(e) => setConvictName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
            </Field>

            <Field label="Convict Dossier ID">
              <Input
                value={crimId}
                onChange={(e) => setCrimId(e.target.value)}
                placeholder="CRIM-2026-7712"
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Sentence Statutory Category">
              <Select
                value={sentenceType}
                onChange={(e) => setSentenceType(e.target.value as PunishmentType)}
                className="w-full"
              >
                <option value="CAPITAL">Capital (Death Sentence)</option>
                <option value="LIFE_IMPRISONMENT">Life Imprisonment</option>
                <option value="RIGOROUS_IMPRISONMENT">Rigorous Imprisonment</option>
                <option value="SIMPLE_IMPRISONMENT">Simple Custody</option>
                <option value="PENAL_FINE">Penal Fine Only</option>
                <option value="PROBATION">Probation / Peace Bond</option>
              </Select>
            </Field>

            <Field label="Duration Description">
              <Input
                value={durationDescription}
                onChange={(e) => setDurationDescription(e.target.value)}
                placeholder="e.g. 10 Years Rigorous Imprisonment"
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Field label="Duration (Months)">
              <Input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="120"
              />
            </Field>

            <Field label="Fine Imposition (₹ INR)">
              <Input
                type="number"
                value={fineAmountInr}
                onChange={(e) => setFineAmountInr(e.target.value)}
                placeholder="50000"
              />
            </Field>

            <Field label="Pronouncement Date">
              <Input
                type="date"
                value={pronouncementDate}
                onChange={(e) => setPronouncementDate(e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Presiding Judge">
            <Input
              value={judge}
              onChange={(e) => setJudge(e.target.value)}
              placeholder="Hon. Justice R. Venkataraman"
            />
          </Field>

          <Field label="Operative Order Snippet / Dictum">
            <textarea
              value={operativeText}
              onChange={(e) => setOperativeText(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-white p-3 text-xs font-medium text-foreground transition-all focus:border-black resize-none"
              placeholder="Operative sentence dictum and bench pronouncement snippet..."
              required
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddJudgmentOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Pronounce &amp; Save Decree
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
