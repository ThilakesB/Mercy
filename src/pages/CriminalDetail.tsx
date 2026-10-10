import { useState } from 'react'
import { useParams, Link } from 'react-router'
import {
  ArrowLeft,
  ShieldAlert,
  Fingerprint,
  Calendar,
  AlertTriangle,
  History,
  FileText,
  ExternalLink,
  Search,
  Phone,
  Mail,
  MapPin,
  User,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import { judicialStore, type CriminalOffense } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Tag,
  EmptyState,
  useApp,
} from '../ui'

export default function CriminalDetail() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useApp()

  const criminal = judicialStore.getCriminal(id || '')

  const [crimeSearch, setCrimeSearch] = useState('')

  if (!criminal) {
    return (
      <Card className="m-6 p-8">
        <EmptyState
          title="Criminal record not found"
          text={`No dossier matches identifier "${id}" in the national criminal registry.`}
          action={
            <Link to="/criminals">
              <Button variant="coral" size="sm">Return to Criminal Registry</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  const filteredCrimes = criminal.crimes.filter((crm) => {
    const q = crimeSearch.trim().toLowerCase()
    if (!q) return true
    return (
      crm.date.toLowerCase().includes(q) ||
      crm.firCourt.toLowerCase().includes(q) ||
      crm.charges.some((c) => c.toLowerCase().includes(q)) ||
      crm.verdict.toLowerCase().includes(q) ||
      crm.sentence.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/criminals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black">
          <ArrowLeft className="size-4" />
          <span>Return to Criminal Index</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/60">
          Confidential Dossier
        </span>
      </div>

      {/* Top Profile Summary Bento (Styled after Image 4) */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_2fr]">
        {/* Left: Person Identity Profile Card (Matching Image 4 Right Card) */}
        <Card className="p-6 space-y-6 bg-white">
          <div className="flex flex-col items-center text-center">
            {/* Round Avatar with Initial */}
            <div className="size-20 rounded-full bg-[#FEF08A] text-amber-900 font-extrabold text-2xl grid place-items-center shadow-xs border-2 border-amber-200">
              {criminal.photoPlaceholder}
            </div>
            <h2 className="text-xl font-extrabold text-foreground mt-3">
              {criminal.name}
            </h2>
            <div className="text-xs font-semibold text-[#FF5C5C] mt-0.5">
              {criminal.crimId}
            </div>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              Alias: {criminal.aliases.join(', ') || 'None Recorded'}
            </p>

            {/* Quick Action Pill Icons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => toast(`Biometrics verified for ${criminal.crimId}`, 'ok')}
                className="grid size-9 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                title="Verify Fingerprint Hash"
              >
                <Fingerprint className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => toast(`Audit trail recorded for dossier view`, 'info')}
                className="grid size-9 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                title="Audit Trail Log"
              >
                <ShieldCheck className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => toast(`Custody alert memo dispatched`, 'info')}
                className="grid size-9 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                title="Custody Memo"
              >
                <FileText className="size-4" />
              </button>
            </div>
          </div>

          {/* Detailed Attributes (Matching Image 4) */}
          <div className="space-y-3 pt-4 border-t border-black/[0.06] text-xs">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider text-zinc-400">
              Detailed Information
            </h3>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F0]">
              <span className="text-zinc-500">Custody Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                criminal.custodyStatus === 'In custody'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {criminal.custodyStatus}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F0]">
              <span className="text-zinc-500">Date of Birth / Age</span>
              <span className="font-semibold text-zinc-900">{criminal.dob} ({criminal.age} Yrs)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F0]">
              <span className="text-zinc-500">Biometric Hash</span>
              <span className="font-mono text-[11px] text-zinc-800">{criminal.biometricHash}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F0] space-y-1">
              <span className="text-zinc-500 block">Registered Address</span>
              <span className="font-medium text-zinc-900 leading-snug block">{criminal.address}</span>
            </div>
          </div>

          {/* Recidivism Score Card */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950">
              <span>Recidivism Index:</span>
              <span>{(criminal.recidivismScore * 100).toFixed(0)}% High Risk</span>
            </div>
            <div className="h-2 w-full bg-amber-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full"
                style={{ width: `${criminal.recidivismScore * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Based on {criminal.crimes.length} prior judicial convictions and history of firearm offenses.
            </p>
          </div>

          {criminal.activeCaseNumber && (
            <div className="p-4 rounded-2xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 text-xs">
              <span className="font-bold text-[#FF5C5C] block mb-1">
                Active Bench Trial Case:
              </span>
              <div className="font-extrabold text-foreground">{criminal.activeCaseNumber}</div>
              <Link to={`/cases/${criminal.activeCaseId}`} className="block mt-2.5">
                <Button variant="coral" size="sm" className="w-full">
                  Open Active Case Report
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Right: Chronological Offense Ledger (Matching Image 4 Bento + Table) */}
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 rounded-3xl bg-[#FEF08A] text-amber-950">
              <div className="text-xs font-bold opacity-80">Documented Offenses</div>
              <div className="text-2xl font-black mt-1">{criminal.crimes.length} Crimes</div>
              <div className="text-[11px] opacity-75 mt-0.5">8-Year Incident Window</div>
            </div>

            <div className="p-4 rounded-3xl bg-[#FBCFE8] text-pink-950">
              <div className="text-xs font-bold opacity-80">Convictions Secured</div>
              <div className="text-2xl font-black mt-1">
                {criminal.crimes.filter((c) => c.verdict === 'CONVICTED').length} Sentenced
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">Appellate finality</div>
            </div>

            <div className="p-4 rounded-3xl bg-[#BFDBFE] text-blue-950">
              <div className="text-xs font-bold opacity-80">Current Status</div>
              <div className="text-2xl font-black mt-1">Under Trial</div>
              <div className="text-[11px] opacity-75 mt-0.5">Bench 04 Proceeding</div>
            </div>
          </div>

          {/* Offense Ledger Card */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Chronological Offense Ledger
                </h3>
                <p className="text-xs text-zinc-500">Historical FIR records, trial judgments, and prison sentences</p>
              </div>

              <div className="relative w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={crimeSearch}
                  onChange={(e) => setCrimeSearch(e.target.value)}
                  placeholder="Filter charges or court..."
                  className="pl-8.5 h-8.5 text-xs rounded-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredCrimes.map((crm, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/[0.04] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900">{crm.firCourt}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white border border-black/8 text-[11px] font-bold text-zinc-700">
                      {crm.date}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[#FF5C5C]">
                      {crm.charges.join(' · ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                      crm.verdict === 'CONVICTED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {crm.verdict}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600">
                    <span className="font-semibold text-zinc-900">Sentence Imposed: </span>
                    {crm.sentence}
                  </div>

                  {crm.notes && (
                    <p className="text-[11px] text-zinc-500 border-l-2 border-zinc-300 pl-2 mt-1">
                      {crm.notes}
                    </p>
                  )}
                </div>
              ))}

              {filteredCrimes.length === 0 && (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No offenses match your search filter.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
