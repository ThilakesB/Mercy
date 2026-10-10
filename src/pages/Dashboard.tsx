import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Search,
  Gavel,
  Calendar,
  AlertTriangle,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  Plus,
  CheckCircle2,
  User,
  Scale,
  FileText,
  Activity,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react'
import {
  judicialStore,
  type CriminalRecord,
  type FullCaseRecord,
  type HearingRecord,
} from '../lib/judicialStore'
import {
  Button,
  Card,
  useApp,
} from '../ui'
import DateSection from '../components/DateSection'

export default function Dashboard() {
  const { toast } = useApp()
  const navigate = useNavigate()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const cases = judicialStore.getCases()
  const hearings = judicialStore.getHearings()
  const criminals = judicialStore.getCriminals()
  const alarms = judicialStore.getAlarms()

  // Selected case for docket preview
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '')
  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0]

  // Filter for cause list
  const [filterStage, setFilterStage] = useState<string>('All')

  // Selected date from DateSection (defaulting to Oct 12, 2026)
  const [activeDateStr, setActiveDateStr] = useState<string>('2026-10-12')

  // Filter hearings for the cause list
  const activeHearings = hearings.filter((h) => {
    if (activeDateStr && h.date !== activeDateStr) return false
    if (filterStage !== 'All' && !h.stage.toLowerCase().includes(filterStage.toLowerCase())) return false
    return true
  })

  // Fallback to all hearings if none match selected day
  const displayHearings = activeHearings.length > 0 ? activeHearings : hearings.slice(0, 5)

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Welcoming Hero Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/10 text-xs font-bold text-zinc-700 mb-2 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chamber Registry · Online</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome to MERCY
          </h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500 max-w-2xl leading-relaxed">
            Your unified legal intelligence and case management workspace. 14 listed proceedings, 3 statutory compliance alarms, and 42 evidentiary records actively monitored.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/about">
            <button
              type="button"
              className="px-3.5 py-2 rounded-full bg-white border border-black/10 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Info className="size-3.5 text-zinc-400" />
              <span>About Platform</span>
            </button>
          </Link>

          <Link to="/cases/new">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-[#141518] text-white text-xs font-bold hover:bg-black transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Intake Case</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Bento Key Metrics Bar (4 Pastel Aesthetic Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bento 1: Warm Yellow (Hearings Overview) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FEF08A] p-5 text-amber-950 transition-all hover:shadow-md border border-amber-300/40">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-amber-900/80">
            <span>Today's Hearings</span>
            <span className="text-[11px] bg-amber-200/90 px-2 py-0.5 rounded-full font-bold">14 Listed</span>
          </div>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-black block">8</span>
              <span className="text-[11px] font-semibold opacity-75">Forenoon</span>
            </div>
            <div>
              <span className="text-2xl font-black block">6</span>
              <span className="text-[11px] font-semibold opacity-75">Afternoon</span>
            </div>
            <div>
              <span className="text-2xl font-black block">2</span>
              <span className="text-[11px] font-semibold opacity-75">In-Camera</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between gap-1 h-8 pt-1">
            {[35, 55, 80, 100, 65, 45, 25].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full ${i === 3 ? 'bg-amber-950' : 'bg-amber-900/20'}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Bento 2: Light Blue (Active Docket) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#BFDBFE] p-5 text-blue-950 transition-all hover:shadow-md border border-blue-300/40">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-blue-900/80">
            <span>Active Dockets</span>
            <span className="text-[11px] bg-blue-200/90 px-2 py-0.5 rounded-full font-bold">{cases.length} Total</span>
          </div>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-black block">11</span>
              <span className="text-[11px] font-semibold opacity-75">Trial Stage</span>
            </div>
            <div>
              <span className="text-2xl font-black block">5</span>
              <span className="text-[11px] font-semibold opacity-75">Charge Sheet</span>
            </div>
            <div>
              <span className="text-2xl font-black block">3</span>
              <span className="text-[11px] font-semibold opacity-75">Disposed</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-blue-300/60 flex items-center justify-between text-[11px] font-bold">
            <span>Average Pendency</span>
            <span>4.2 Months</span>
          </div>
        </div>

        {/* Bento 3: Mint Green (Evidentiary Security) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#BBF7D0] p-5 text-emerald-950 transition-all hover:shadow-md border border-emerald-300/40">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-emerald-900/80">
            <span>Evidence Chain</span>
            <span className="text-[11px] bg-emerald-200/90 px-2 py-0.5 rounded-full font-bold">SHA-256 OK</span>
          </div>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-black block">38</span>
              <span className="text-[11px] font-semibold opacity-75">Seized Items</span>
            </div>
            <div>
              <span className="text-2xl font-black block">12</span>
              <span className="text-[11px] font-semibold opacity-75">Ballistics</span>
            </div>
            <div>
              <span className="text-2xl font-black block">0</span>
              <span className="text-[11px] font-semibold opacity-75">Breaches</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-emerald-300/60 flex items-center justify-between text-[11px] font-bold">
            <span>Custodian Status</span>
            <span>Malkhana Verified</span>
          </div>
        </div>

        {/* Bento 4: Rose Pink (Statutory Alarms) */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FBCFE8] p-5 text-pink-950 transition-all hover:shadow-md border border-pink-300/40">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-pink-900/80">
            <span>Statutory Alarms</span>
            <span className="text-[11px] bg-pink-200/90 px-2 py-0.5 rounded-full font-bold">3 Pending</span>
          </div>
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-black block">2</span>
              <span className="text-[11px] font-semibold opacity-75">Remand Limit</span>
            </div>
            <div>
              <span className="text-2xl font-black block">1</span>
              <span className="text-[11px] font-semibold opacity-75">Bail Hearing</span>
            </div>
            <div>
              <span className="text-2xl font-black block">100%</span>
              <span className="text-[11px] font-semibold opacity-75">Notified</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-pink-300/60 flex items-center justify-between text-[11px] font-bold">
            <span>Critical Compliance</span>
            <span className="text-[#FF5C5C]">Review Today</span>
          </div>
        </div>
      </div>

      {/* 3. Main Operational Layout: Left (Cause List & Dossier) + Right (New DateSection & Timeline) */}
      <div className="grid gap-6 xl:grid-cols-[1.9fr_1.1fr]">
        {/* Left Column: Cause List & Selected Case Dossier Preview */}
        <div className="space-y-6">
          {/* Daily Cause List Card */}
          <Card className="p-5.5 space-y-4 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                  Daily Cause List // Bench 04
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Select a matter below to inspect evidentiary telemetry &amp; legal docket.
                </p>
              </div>

              {/* Stage Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-full border border-black/10 text-[11px] font-bold">
                {['All', 'Examination', 'Arguments', 'Bail'].map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setFilterStage(stage)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      filterStage === stage
                        ? 'bg-[#141518] text-white shadow-xs'
                        : 'text-zinc-600 hover:text-foreground'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Listed Hearings Grid */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {displayHearings.map((h, idx) => {
                const isSelected = selectedCaseId === h.caseId
                const pastelColors = [
                  'bg-[#FEF9C3] text-amber-950 border-amber-200/80',
                  'bg-[#DBEAFE] text-blue-950 border-blue-200/80',
                  'bg-[#DCFCE7] text-emerald-950 border-emerald-200/80',
                  'bg-[#FCE7F3] text-pink-950 border-pink-200/80',
                ]
                const colorClass = pastelColors[idx % pastelColors.length]

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedCaseId(h.caseId)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${colorClass} ${
                      isSelected ? 'ring-2 ring-[#141518] shadow-md scale-[1.01]' : 'hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-full bg-white font-extrabold text-[11px] shadow-xs">
                          {idx + 1}
                        </span>
                        <div className="font-mono text-[11px] font-bold tracking-tight">
                          {h.caseNumber}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/80 text-[10.5px] font-bold shadow-xs">
                        {h.time}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs leading-snug line-clamp-1">
                        {h.caseTitle}
                      </div>
                      <div className="text-[11px] opacity-75 font-semibold mt-0.5">
                        {h.stage} · {h.courtHall || 'Court Hall 04'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Selected Case Dossier Preview Card */}
          {selectedCase && (
            <Card className="p-6 bg-white border border-black/[0.08] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF5C5C]">
                    INSPECTING BENCH DOCKET
                  </span>
                  <h3 className="text-base font-extrabold text-foreground mt-0.5">
                    {selectedCase.title}
                  </h3>
                  <div className="font-mono text-xs text-zinc-500 mt-0.5">
                    Docket No: {selectedCase.number} · Police Station: {selectedCase.policeStation}
                  </div>
                </div>

                <Link to={`/cases/${selectedCase.id}`}>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-[#141518] text-white text-xs font-bold hover:bg-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open Case Dossier</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </Link>
              </div>

              {/* Attributes Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                  {selectedCase.checkedDocCategories?.length || 0} of 8 Doc Categories Checked
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[11px]">
                  {selectedCase.type}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                  {selectedCase.stage}
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 font-bold text-[11px]">
                  IO: {selectedCase.io?.name || 'Assigned'}
                </span>
              </div>

              {/* Seized Weapons / Telemetry highlight */}
              {selectedCase.weapons?.[0] && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-950 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-rose-600" />
                    <div>
                      <span className="font-bold">Seized Evidentiary Weapon: </span>
                      <span>{selectedCase.weapons[0].makeModel} (Serial: {selectedCase.weapons[0].serialNumber})</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-200/80 font-bold text-[10px]">
                    Ballistics Verified
                  </span>
                </div>
              )}

              {/* Quick Action Dock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-black/[0.06]">
                <Link to={`/cases/${selectedCase.id}`}>
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF7F0] hover:bg-[#F0EDE4] text-zinc-800 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    Evidence Log
                  </button>
                </Link>
                <Link to={`/print/${selectedCase.id}`}>
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF7F0] hover:bg-[#F0EDE4] text-zinc-800 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    Print Decree
                  </button>
                </Link>
                <Link to="/research">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF7F0] hover:bg-[#F0EDE4] text-zinc-800 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    AI Precedents
                  </button>
                </Link>
                <Link to="/law-reference">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF7F0] hover:bg-[#F0EDE4] text-zinc-800 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    BNS / CrPC Code
                  </button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Rebuilt Interactive DateSection & Timeline Stream */}
        <div className="space-y-6">
          {/* 1. Rebuilt Dynamic DateSection */}
          <DateSection
            onSelectDate={(d) => {
              setActiveDateStr(d)
              toast(`Cause list synchronized to ${d}`, 'info')
            }}
            onSelectHearing={(h) => setSelectedCaseId(h.caseId)}
          />

          {/* 2. Today's Chronological Courtroom Flow */}
          <Card className="p-5.5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Courtroom Stream // Today
                </h3>
                <span className="text-[11px] text-zinc-400">Order of business in Session</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10.5px] font-bold text-zinc-600">
                Bench 04
              </span>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              <div className="relative flex items-start gap-3 pl-1">
                <div className="size-5 rounded-full bg-[#FF5C5C] text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs">
                  •
                </div>
                <div className="flex-1 p-3 rounded-2xl bg-rose-50 border border-rose-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-950">Remand Production</span>
                    <span className="text-[10px] font-bold text-rose-700">10:30 AM</span>
                  </div>
                  <p className="text-[11px] text-rose-800/90 mt-0.5">S.C. 214/2025 · Video Conf from Tihar Central Jail</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3 pl-1">
                <div className="size-5 rounded-full bg-blue-500 text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs">
                  •
                </div>
                <div className="flex-1 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-950">In-Camera Deposition</span>
                    <span className="text-[10px] font-bold text-blue-700">11:45 AM</span>
                  </div>
                  <p className="text-[11px] text-blue-800/90 mt-0.5">Spl.S.C. 38/2025 · Child Friendly Hearing Room 02</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3 pl-1">
                <div className="size-5 rounded-full bg-amber-500 text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs">
                  •
                </div>
                <div className="flex-1 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-950">IO Cross Examination</span>
                    <span className="text-[10px] font-bold text-amber-700">02:00 PM</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">DL-CR-2026-0481 · Presiding Officer Bench Hall</p>
                </div>
              </div>
            </div>

            <Link to="/schedule" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                View Full Monthly Roster &rarr;
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
