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
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Crosshair,
  User,
  Activity,
  Heart,
  Scale,
  FileText,
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
  CardHeader,
  Tag,
  StatusChip,
  useApp,
} from '../ui'

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

  // Selected case for the bottom preview card
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '')
  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0]

  // Calendar day state
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(12)

  // Today's Date (2026-10-12)
  const todayDateStr = '2026-10-12'
  const todayHearings = hearings.filter((h) => h.date === todayDateStr)

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner (Matching Image 2 "Good morning, Dr. Olivia") */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Good morning, Hon. Justice Venkataraman
          </h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500 max-w-2xl">
            NyayaDesk wishes you a fair and decisive day. 14 judicial matters are listed for your bench today. You also have 3 statutory compliance events on calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/cases/new">
            <Button variant="primary" size="md">
              <Plus className="size-4" />
              <span>Intake New Case</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Main 3-Column Layout: Left Bento & Lists (2 cols) + Right Calendar & Timeline (1 col) */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Left Column: 4 Pastel Bento Metric Cards + Cases & Dossier Lists */}
        <div className="space-y-6">
          {/* 4 Pastel Bento Cards (Matching Image 2) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bento Card 1: Warm Yellow (Hearings Summary & Bar Graph) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#FEF08A] p-5.5 text-amber-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Today's Hearings:</span>
                <span className="text-xs bg-amber-200/80 px-2.5 py-0.5 rounded-full font-semibold">14 Listed</span>
              </div>
              <div className="mt-3 flex items-baseline gap-4 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">8</span>
                  <span className="text-[11px] opacity-75">Forenoon</span>
                </div>
                <div>
                  <span className="text-lg font-black block">6</span>
                  <span className="text-[11px] opacity-75">Afternoon</span>
                </div>
                <div>
                  <span className="text-lg font-black block">2</span>
                  <span className="text-[11px] opacity-75">POCSO In-Camera</span>
                </div>
              </div>

              {/* Mini rounded bar chart visualization */}
              <div className="mt-5 flex items-end justify-between gap-1.5 h-16 pt-2">
                {[30, 45, 75, 95, 60, 40, 20].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-full transition-all ${
                        i === 3 ? 'bg-amber-950' : 'bg-amber-900/25'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[10px] opacity-70 font-medium">
                <span>10:00 a.m.</span>
                <span>12:30 p.m.</span>
                <span>04:30 p.m.</span>
              </div>
            </div>

            {/* Bento Card 2: Soft Pink (Disposal Rate & Curve) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#FBCFE8] p-5.5 text-pink-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Disposal &amp; Closure:</span>
                <span className="text-xs bg-pink-200/80 px-2.5 py-0.5 rounded-full font-semibold">92% On-Time</span>
              </div>
              <div className="mt-3 flex items-baseline gap-4 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">24 min</span>
                  <span className="text-[11px] opacity-75">Avg Duration</span>
                </div>
                <div>
                  <span className="text-lg font-black block">3 Cases</span>
                  <span className="text-[11px] opacity-75">Judgment Reserved</span>
                </div>
                <div>
                  <span className="text-lg font-black block">100%</span>
                  <span className="text-[11px] opacity-75">Cloud Synced</span>
                </div>
              </div>

              {/* Smooth trend curve SVG */}
              <div className="mt-4 relative h-16">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" fill="none">
                  <path
                    d="M 0,45 Q 35,50 70,30 T 140,20 T 200,38"
                    stroke="#831843"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Highlighted point */}
                  <circle cx="140" cy="20" r="4.5" fill="#831843" />
                  <line x1="140" y1="20" x2="140" y2="60" stroke="#831843" strokeDasharray="3 3" opacity="0.5" />
                </svg>
              </div>
              <div className="mt-1 flex justify-between text-[10px] opacity-70 font-medium">
                <span>10:30</span>
                <span>11:30</span>
                <span>12:00</span>
                <span>13:30</span>
              </div>
            </div>

            {/* Bento Card 3: Fresh Sage Green (Categories) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#BBF7D0] p-5.5 text-emerald-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>By Case Category:</span>
                <span className="text-xs bg-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold">Active Roster</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">702</span>
                  <span className="text-[10.5px] opacity-75">Criminal BNS</span>
                </div>
                <div>
                  <span className="text-lg font-black block">188</span>
                  <span className="text-[10.5px] opacity-75">POCSO Court</span>
                </div>
                <div>
                  <span className="text-lg font-black block">241</span>
                  <span className="text-[10.5px] opacity-75">Family / Civil</span>
                </div>
              </div>

              <div className="mt-5 flex gap-1.5 text-[10.5px] font-bold">
                <span className="bg-emerald-900/10 px-2.5 py-1 rounded-full">14 IN TRIAL</span>
                <span className="bg-emerald-900/10 px-2.5 py-1 rounded-full">5 EVIDENCE</span>
                <span className="bg-emerald-900/10 px-2.5 py-1 rounded-full">2 BAIL</span>
              </div>
            </div>

            {/* Bento Card 4: Soft Sky Blue (Session Stats) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#BFDBFE] p-5.5 text-blue-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Bench Session Allocation:</span>
                <span className="text-xs bg-blue-200/80 px-2.5 py-0.5 rounded-full font-semibold">Today</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">04:30 h</span>
                  <span className="text-[10.5px] opacity-75">In Bench</span>
                </div>
                <div>
                  <span className="text-lg font-black block">02:00 h</span>
                  <span className="text-[10.5px] opacity-75">Chambers</span>
                </div>
                <div>
                  <span className="text-lg font-black block">00:45 min</span>
                  <span className="text-[10.5px] opacity-75">Order Signing</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] font-semibold opacity-85">
                <span>Lead IO Appearances: 6 Officers</span>
                <span className="bg-blue-900/15 px-2.5 py-0.5 rounded-full font-bold">Bench 04</span>
              </div>
            </div>
          </div>

          {/* Listed Matters & Dossier Split Grid (Matching Bottom of Image 2) */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Active Matters List (styled like Patient's list in Image 2) */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Today's Hearing Matters</h3>
                  <p className="text-xs text-zinc-500">Click to preview case docket</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                  {todayHearings.length} Listed
                </span>
              </div>

              <div className="space-y-2.5">
                {todayHearings.map((h, idx) => {
                  const isSelected = h.caseId === selectedCaseId
                  const pastelBgs = [
                    'bg-[#FCE7F3] text-pink-950 hover:bg-[#FBCFE8]',
                    'bg-[#DBEAFE] text-blue-950 hover:bg-[#BFDBFE]',
                    'bg-[#FEF3C7] text-amber-950 hover:bg-[#FDE68A]',
                    'bg-[#DCFCE7] text-emerald-950 hover:bg-[#BBF7D0]',
                  ]
                  const currentBg = pastelBgs[idx % pastelBgs.length]

                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedCaseId(h.caseId)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${currentBg} ${
                        isSelected ? 'ring-2 ring-black/40 shadow-sm' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-full bg-white/80 shadow-xs font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-snug truncate max-w-44">
                            {h.caseTitle}
                          </div>
                          <div className="text-[11px] opacity-75 mt-0.5 font-medium truncate">
                            {h.caseNumber} · {h.stage}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/70">
                          {h.time}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Right: Selected Case Dossier Preview (Matching Visit details in Image 2 & 4) */}
            {selectedCase ? (
              <Card className="p-5.5 space-y-4 bg-white">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Selected Case Docket
                    </span>
                    <h3 className="text-sm font-extrabold text-foreground mt-0.5">
                      {selectedCase.number}
                    </h3>
                  </div>
                  <Link to={`/cases/${selectedCase.id}`}>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-full bg-[#121316] text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
                    >
                      Open Case Report
                    </button>
                  </Link>
                </div>

                {/* Case Attributes & Tags */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-400 text-[11px] font-medium block mb-1">Standardized Title:</span>
                    <div className="font-bold text-foreground text-xs leading-snug">
                      {selectedCase.title}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                      {selectedCase.checkedDocCategories?.length || 0} of 8 Doc Categories Checked
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-[10.5px]">
                      {selectedCase.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10.5px]">
                      {selectedCase.stage}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10.5px]">
                      {selectedCase.policeStation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 bg-[#FAF7F0] p-3 rounded-2xl text-[11px]">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Lead IO:</span>
                      <span className="font-bold text-zinc-900">{selectedCase.io?.name || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">FIR Ref:</span>
                      <span className="font-bold text-zinc-900">{selectedCase.fir?.no || 'N/A'} ({selectedCase.fir?.date || 'N/A'})</span>
                    </div>
                  </div>

                  {selectedCase.weapons?.[0] && (
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-2xl text-[11px] text-rose-950">
                      <span className="font-bold text-[10.5px] uppercase block mb-0.5">Seized Weapon at Scene:</span>
                      <span>{selectedCase.weapons[0].makeModel} (Serial: {selectedCase.weapons[0].serialNumber})</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-black/5">
                    <span className="text-zinc-500 text-[11px]">Next hearing: {selectedCase.nextHearing}</span>
                    <Link to={`/cases/${selectedCase.id}`}>
                      <span className="text-xs font-bold text-[#FF5C5C] hover:underline flex items-center gap-1">
                        View Full Dossier <ArrowRight className="size-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center space-y-3 bg-white flex flex-col items-center justify-center min-h-[280px]">
                <Scale className="size-10 text-zinc-300 stroke-[1.5]" />
                <h3 className="font-extrabold text-sm text-foreground">Registry Empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  No judicial cases registered in the database yet. Click below to intake your client's first case.
                </p>
                <Link to="/cases/new">
                  <Button variant="primary" size="sm" className="mt-2">
                    <Plus className="size-3.5" />
                    <span>Intake New Case</span>
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Calendar Widget & Today's Timeline (Matching Right Side of Image 2) */}
        <div className="space-y-6">
          <Card className="p-5.5 space-y-4">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between font-bold text-sm text-foreground">
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold">
                October 2026
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toast('Displaying current term October 2026', 'info')}
                  className="grid size-7 place-items-center rounded-full hover:bg-zinc-100 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toast('November 2026 docket pending gazette', 'info')}
                  className="grid size-7 place-items-center rounded-full hover:bg-zinc-100 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 text-center text-[10.5px] font-bold text-zinc-400">
              <div>MO</div>
              <div>TU</div>
              <div>WE</div>
              <div>TH</div>
              <div>FR</div>
              <div>SA</div>
              <div>SU</div>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold gap-y-1">
              {/* Padding */}
              <div className="text-zinc-300 py-1">28</div>
              <div className="text-zinc-300 py-1">29</div>
              <div className="text-zinc-300 py-1">30</div>
              <div className="py-1">1</div>
              <div className="py-1">2</div>
              <div className="text-zinc-400 py-1">3</div>
              <div className="text-zinc-400 py-1">4</div>

              <div className="py-1">5</div>
              <div className="py-1">6</div>
              <div className="py-1">7</div>
              <div className="py-1">8</div>
              <div className="py-1">9</div>
              <div className="text-zinc-400 py-1">10</div>
              <div className="text-zinc-400 py-1">11</div>

              {/* Day 12 Highlighted in Pink Pill (Like Day 15 in Image 2) */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setSelectedCalendarDay(12)}
                  className="size-7 rounded-full bg-[#FF5C5C] text-white font-bold grid place-items-center mx-auto shadow-xs cursor-pointer"
                >
                  12
                </button>
              </div>
              <div className="py-1 cursor-pointer" onClick={() => setSelectedCalendarDay(13)}>13</div>
              <div className="py-1 cursor-pointer" onClick={() => setSelectedCalendarDay(14)}>14</div>
              <div className="py-1 cursor-pointer" onClick={() => setSelectedCalendarDay(15)}>15</div>
              <div className="py-1 cursor-pointer" onClick={() => setSelectedCalendarDay(16)}>16</div>
              <div className="text-zinc-400 py-1">17</div>
              <div className="text-zinc-400 py-1">18</div>

              <div className="py-1">19</div>
              <div className="py-1">20</div>
              <div className="py-1">21</div>
              <div className="py-1">22</div>
              <div className="py-1">23</div>
              <div className="text-zinc-400 py-1">24</div>
              <div className="text-zinc-400 py-1">25</div>
            </div>

            {/* Add Event / Hearing Button (Solid Black Pill like Image 2) */}
            <Link to="/schedule" className="block pt-1">
              <button
                type="button"
                className="w-full h-10.5 rounded-full bg-[#141518] text-white font-semibold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="size-3.5" />
                <span>Add Hearing / Adjourn</span>
              </button>
            </Link>

            {/* Today's Timeline Section (Matching Image 2) */}
            <div className="pt-4 border-t border-black/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Oct 12 · Today's timeline</h4>
                  <span className="text-[11px] text-zinc-400">Chronological courtroom flow</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  All
                </span>
              </div>

              {/* Vertical timeline items with connecting lines */}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
                {/* Timeline Item 1 */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className="size-5 rounded-full bg-[#FF5C5C] text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs">
                    •
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-rose-50 border border-rose-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-950">Remand Production</span>
                      <span className="text-[10px] font-semibold text-rose-700">10:30 AM</span>
                    </div>
                    <p className="text-[11px] text-rose-800/80 mt-0.5">S.C. 214/2025 · Video Conf from Tihar</p>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className="size-5 rounded-full bg-blue-500 text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs">
                    •
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-950">In-Camera Deposition</span>
                      <span className="text-[10px] font-semibold text-blue-700">11:45 AM</span>
                    </div>
                    <p className="text-[11px] text-blue-800/80 mt-0.5">Spl.S.C. 38/2025 · Child Friendly Room 02</p>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative flex items-start gap-3 pl-1">
                  <div className="size-5 rounded-full bg-amber-500 text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs">
                    •
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-950">IO Cross Examination</span>
                      <span className="text-[10px] font-semibold text-amber-700">02:00 PM</span>
                    </div>
                    <p className="text-[11px] text-amber-800/80 mt-0.5">DL-CR-2026-0481 · Court Hall 04</p>
                  </div>
                </div>
              </div>

              {/* View all button */}
              <Link to="/schedule" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Full Monthly Docket
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
