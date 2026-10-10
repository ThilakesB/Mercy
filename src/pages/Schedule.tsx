import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  Gavel,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRight,
  FileText,
  Building2,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  User,
  Scale,
} from 'lucide-react'
import {
  judicialStore,
  type HearingRecord,
  type FullCaseRecord,
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
  Field,
  Input,
  Select,
  useApp,
} from '../ui'

export default function Schedule() {
  const { toast } = useApp()
  const navigate = useNavigate()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const hearings = judicialStore.getHearings()
  const hearingCounts = judicialStore.getHearingCountByDate()
  const cases = judicialStore.getCases()

  // Selected date state (defaults to 2026-10-12)
  const [selectedDate, setSelectedDate] = useState('2026-10-12')
  const [viewScope, setViewScope] = useState<'selected' | 'all'>('selected')
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  // Quick Dossier Preview Modal
  const [selectedDossierCase, setSelectedDossierCase] = useState<FullCaseRecord | null>(null)

  // Adjourn / Edit Notes Modal
  const [adjournTargetHearing, setAdjournTargetHearing] = useState<HearingRecord | null>(null)
  const [adjournDate, setAdjournDate] = useState('')
  const [adjournTime, setAdjournTime] = useState('')
  const [adjournStage, setAdjournStage] = useState('')
  const [adjournHall, setAdjournHall] = useState('')
  const [adjournNotes, setAdjournNotes] = useState('')

  // New hearing form state
  const [targetCaseId, setTargetCaseId] = useState(cases[0]?.id || '')
  const [newDate, setNewDate] = useState('2026-10-16')
  const [newTime, setNewTime] = useState('11:00')
  const [newStage, setNewStage] = useState('Evidence & Witness Examination')
  const [newHall, setNewHall] = useState('Hall 04 (Main Sessions)')
  const [newNotes, setNewNotes] = useState('')
  const [attachAlarm, setAttachAlarm] = useState(true)
  const [alarmUrgency, setAlarmUrgency] = useState<'INFO' | 'WARNING' | 'STATUTORY_CRITICAL'>('WARNING')

  // Calendar matrix generator for October 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1
    const dayStr = String(day).padStart(2, '0')
    const fullDate = `2026-10-${dayStr}`
    const count = hearingCounts[fullDate] || 0
    return {
      day,
      fullDate,
      count,
      isCurrentMonth: true,
    }
  })

  const padDaysBefore = [
    { day: 28, fullDate: '2026-09-28', count: 0, isCurrentMonth: false },
    { day: 29, fullDate: '2026-09-29', count: 0, isCurrentMonth: false },
    { day: 30, fullDate: '2026-09-30', count: 0, isCurrentMonth: false },
  ]
  const padDaysAfter = [
    { day: 1, fullDate: '2026-11-01', count: 0, isCurrentMonth: false },
  ]

  const calendarGrid = [...padDaysBefore, ...daysInMonth, ...padDaysAfter]

  const selectedDateHearings = hearings.filter((h) => h.date === selectedDate)
  const displayedHearings = viewScope === 'selected' ? selectedDateHearings : hearings

  const handleCreateHearing = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCaseId) {
      toast('Please select a valid case', 'bad')
      return
    }

    const created = judicialStore.scheduleHearing({
      caseId: targetCaseId,
      date: newDate,
      time: newTime,
      stage: newStage,
      courtHall: newHall,
      judge: 'Hon. Justice R. Venkataraman',
      notes: newNotes,
      setAlarm: attachAlarm,
      alarmUrgency,
    })

    toast(`Hearing scheduled for ${created.caseNumber} on ${created.date}`, 'ok')
    setSelectedDate(newDate)
    setScheduleModalOpen(false)
  }

  const handleSaveAdjournment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjournTargetHearing) return

    judicialStore.updateHearing(adjournTargetHearing.id, {
      date: adjournDate,
      time: adjournTime,
      stage: adjournStage,
      courtHall: adjournHall,
      benchNotes: adjournNotes,
    })

    toast(`Updated hearing order for ${adjournTargetHearing.caseNumber}`, 'ok')
    setAdjournTargetHearing(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courtroom Schedule & Roster"
        sub="Monthly judicial calendar with per-day hearing counts, session time slots, statutory deadline alarms, and comprehensive docket matters."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="coral"
              size="md"
              onClick={() => setScheduleModalOpen(true)}
            >
              <Plus className="size-4" />
              <span>Schedule Hearing</span>
            </Button>
          </div>
        }
      />

      {/* Main Grid: Calendar Left, Selected Day Docket Right (Adjusted for generous docket width) */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        {/* Left: Monthly Calendar Card */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-4">
              <div className="flex items-center gap-3">
                <span className="text-base font-extrabold text-foreground">
                  October 2026
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                  Bench 04 Roster
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toast('Displaying October 2026', 'info')}
                  className="grid size-8 place-items-center rounded-full hover:bg-zinc-100 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toast('November 2026 not yet gazetted', 'info')}
                  className="grid size-8 place-items-center rounded-full hover:bg-zinc-100 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-zinc-400 mb-2">
              <div className="py-1">MON</div>
              <div className="py-1">TUE</div>
              <div className="py-1">WED</div>
              <div className="py-1">THU</div>
              <div className="py-1">FRI</div>
              <div className="py-1 text-zinc-300">SAT</div>
              <div className="py-1 text-zinc-300">SUN</div>
            </div>

            {/* Calendar Cells Grid with rounded corners */}
            <div className="grid grid-cols-7 gap-2">
              {calendarGrid.map((cell, idx) => {
                const isSelected = cell.fullDate === selectedDate && viewScope === 'selected'
                const isHeavy = cell.count >= 14
                const hasHearings = cell.count > 0

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDate(cell.fullDate)
                        setViewScope('selected')
                      }
                    }}
                    className={`relative min-h-[82px] p-2.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer border ${
                      !cell.isCurrentMonth
                        ? 'border-transparent opacity-30 cursor-not-allowed'
                        : isSelected
                          ? 'border-[#FF5C5C] bg-rose-50/70 shadow-xs ring-2 ring-[#FF5C5C]/30'
                          : 'border-black/[0.04] bg-[#FAF7F0] hover:bg-white hover:border-black/10 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-extrabold ${
                          isSelected ? 'text-[#FF5C5C]' : cell.isCurrentMonth ? 'text-zinc-900' : 'text-zinc-400'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* Visible Count of Hearings on each day */}
                      {cell.isCurrentMonth && hasHearings && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHeavy
                              ? 'bg-[#FF5C5C] text-white'
                              : 'bg-zinc-200/80 text-zinc-800'
                          }`}
                        >
                          {cell.count}
                        </span>
                      )}
                    </div>

                    {cell.isCurrentMonth && (
                      <div className="w-full text-left">
                        <span className="text-[10px] font-medium text-zinc-500">
                          {cell.count === 0 ? '—' : cell.count >= 14 ? 'Peak Load' : 'Listed'}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-4 border-t border-black/[0.06] text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-zinc-200" />
                  <span>Standard Docket (&lt;14)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#FF5C5C]" />
                  <span>High Density Listing (14+)</span>
                </span>
              </div>
              <span className="font-semibold text-zinc-800">
                Total Matters: {hearings.length}
              </span>
            </div>
          </Card>
        </div>

        {/* Right: Detailed, Big, Simple Docket List For All Matters */}
        <div className="space-y-4">
          <Card className="p-6 sm:p-7 bg-white shadow-sm border border-black/[0.06] rounded-3xl">
            {/* Header with scope toggle pills and Add Matter action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-black/[0.06] mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {viewScope === 'selected' ? `Docket for ${selectedDate}` : 'Full Court Roster — All Listed Matters'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {displayedHearings.length} {displayedHearings.length === 1 ? 'matter' : 'matters'} listed in bench schedule
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Scope Switcher: Selected Date vs All Matters ("its for all") */}
                <div className="flex items-center bg-[#FAF7F0] p-1 rounded-full border border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setViewScope('selected')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      viewScope === 'selected'
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Day ({selectedDateHearings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewScope('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      viewScope === 'all'
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    All Matters ({hearings.length})
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => {
                    setNewDate(selectedDate)
                    setScheduleModalOpen(true)
                  }}
                >
                  + Add Matter
                </Button>
              </div>
            </div>

            {displayedHearings.length === 0 ? (
              <div className="p-14 text-center text-xs text-zinc-400 space-y-2">
                <CalendarIcon className="size-8 mx-auto text-zinc-300 stroke-[1.5]" />
                <p className="font-semibold text-zinc-600">No matters listed for {selectedDate}.</p>
                <p className="text-[11px] text-zinc-400">Select another calendar day or click "+ Add Matter" to list a cause.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {displayedHearings.map((h, i) => {
                  // Pastel palette matching reference design (Pink, Blue, Yellow, Emerald, Purple, Orange)
                  const bgs = [
                    'bg-[#FCE7F3] text-pink-950 border-pink-200/70',
                    'bg-[#DBEAFE] text-blue-950 border-blue-200/70',
                    'bg-[#FEF3C7] text-amber-950 border-amber-200/70',
                    'bg-[#DCFCE7] text-emerald-950 border-emerald-200/70',
                    'bg-[#F3E8FF] text-purple-950 border-purple-200/70',
                    'bg-[#FFEDD5] text-orange-950 border-orange-200/70',
                  ]
                  const cardBg = bgs[i % bgs.length]

                  // Case reference lookup for rich details
                  const targetCase = cases.find((c) => c.id === h.caseId)
                  const acts = targetCase?.acts || []
                  const accusedParties = targetCase?.parties?.filter((p) => p.role === 'Accused') || []
                  const prosecutor = targetCase?.parties?.find((p) => p.role === 'Prosecutor')
                  const defenseCounsel = targetCase?.parties?.find((p) => p.role === 'Defense Counsel')
                  const primaryCustody = accusedParties[0]?.custody || 'In custody'
                  const evidenceCount = targetCase?.evidence?.length || 0
                  const checkedDocs = targetCase?.checkedDocCategories?.length || 3

                  return (
                    <div
                      key={h.id}
                      className={`p-6 sm:p-7 rounded-3xl border ${cardBg} shadow-xs hover:shadow-md transition-all space-y-4`}
                    >
                      {/* 1. Header Bar: Time badge + Case Number + Custody Pill + Alarm */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-3.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white shadow-xs font-black text-xs sm:text-sm text-zinc-900 border border-black/5">
                            <Clock className="size-3.5 text-zinc-700" />
                            <span>{h.time} HRS</span>
                          </span>

                          {viewScope === 'all' && (
                            <span className="px-3 py-1 rounded-full bg-white/80 font-black text-xs text-zinc-800 border border-black/5">
                              📅 {h.date}
                            </span>
                          )}

                          <span className="font-black text-sm sm:text-base text-zinc-950 tracking-tight">
                            {h.caseNumber}
                          </span>

                          {targetCase?.type && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/70 border border-black/5 text-zinc-800">
                              {targetCase.type}
                            </span>
                          )}

                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                              primaryCustody === 'In custody'
                                ? 'bg-rose-500/15 text-rose-950 border-rose-300/60'
                                : primaryCustody === 'On bail'
                                ? 'bg-amber-500/15 text-amber-950 border-amber-300/60'
                                : 'bg-zinc-200/60 text-zinc-800 border-zinc-300/60'
                            }`}
                          >
                            ● {primaryCustody}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {h.hasAlarm && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-black shadow-xs">
                              <Bell className="size-3.5 animate-bounce" />
                              <span>{h.alarmUrgency === 'STATUTORY_CRITICAL' ? 'Statutory Critical' : 'Alarm'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 2. Cause Title & Courtroom Hierarchy */}
                      <div className="space-y-1.5">
                        <h4 className="font-black text-base sm:text-xl text-zinc-950 leading-snug tracking-tight">
                          {h.caseTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] font-bold text-zinc-800">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-black/5 shadow-xs">
                            <Gavel className="size-3.5 text-zinc-700" />
                            <span>{h.stage}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-black/5 shadow-xs text-zinc-700">
                            <Building2 className="size-3.5 text-zinc-500" />
                            <span>{h.courtHall}</span>
                          </span>
                          {targetCase?.policeStation && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/60 text-zinc-600 border border-black/5 text-xs">
                              PS: {targetCase.policeStation.split(',')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3. Detailed Yet Simple Information Grid (White Container Card) */}
                      <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-xs space-y-3.5">
                        {/* Statutory Provisions / Act Sections */}
                        {acts.length > 0 && (
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                              Statutory Provisions &amp; Act Sections
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {acts.map((act, actIdx) => (
                                <span
                                  key={actIdx}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono text-[11px] font-black shadow-xs"
                                >
                                  § {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2-Column: Prosecution & IO vs Accused & Defense */}
                        <div className="grid sm:grid-cols-2 gap-3.5 pt-1 border-t border-black/[0.04] text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                              Prosecution &amp; Police Investigation
                            </span>
                            <div className="font-extrabold text-zinc-950">
                              {prosecutor?.name || 'Public Prosecutor (Standing Counsel)'}
                            </div>
                            {targetCase?.io && (
                              <div className="text-[11px] font-medium text-zinc-600">
                                IO: <span className="font-bold text-zinc-900">{targetCase.io.name}</span> ({targetCase.io.rank})
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                              Accused &amp; Defense Representation
                            </span>
                            <div className="font-extrabold text-zinc-950">
                              {accusedParties.length > 0 ? accusedParties.map((a) => a.name).join(', ') : 'Accused In Matter'}
                            </div>
                            <div className="text-[11px] font-medium text-zinc-600">
                              Counsel: <span className="font-bold text-zinc-900">{defenseCounsel?.name || 'Adv. Priya Sharma'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Evidence & Case Dossier Summary Chips */}
                        {targetCase && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/[0.04] text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 font-bold text-[11px] border border-emerald-200/50">
                                ✓ {checkedDocs} of 8 Doc Categories Checked
                              </span>
                              {evidenceCount > 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-blue-100/90 text-blue-900 font-bold text-[11px] border border-blue-200/50">
                                  {evidenceCount} Admitted Exhibits ({targetCase.evidence.map((e) => e.code).join(', ')})
                                </span>
                              )}
                              {targetCase.weapons && targetCase.weapons.length > 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-rose-100/90 text-rose-900 font-bold text-[11px] border border-rose-200/50">
                                  Seized: {targetCase.weapons[0].makeModel}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. Bench Notes Callout Banner */}
                      {h.benchNotes && (
                        <div className="p-4 rounded-2xl bg-white/95 border border-black/10 flex items-start gap-3 shadow-xs">
                          <div className="grid size-7.5 place-items-center rounded-xl bg-zinc-100 text-zinc-700 shrink-0 mt-0.5">
                            <FileText className="size-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                              Bench Order &amp; Direction:
                            </span>
                            <p className="text-xs sm:text-[13px] text-zinc-950 leading-relaxed font-semibold">
                              {h.benchNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 5. Bottom Action Bar (Bigger, Clear, Clean) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/[0.06]">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDossierCase(targetCase || null)}
                            className="px-4 py-2.5 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 border border-black/10 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <FileText className="size-3.5 text-zinc-700" />
                            <span>Quick Dossier</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAdjournTargetHearing(h)
                              setAdjournDate(h.date)
                              setAdjournTime(h.time)
                              setAdjournStage(h.stage)
                              setAdjournHall(h.courtHall)
                              setAdjournNotes(h.benchNotes || '')
                            }}
                            className="px-4 py-2.5 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 border border-black/10 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <CalendarIcon className="size-3.5 text-zinc-700" />
                            <span>Adjourn / Edit Note</span>
                          </button>
                        </div>

                        <Link to={`/cases/${h.caseId}`}>
                          <Button
                            variant="primary"
                            size="md"
                            className="bg-[#121316] text-white hover:bg-zinc-800 px-5.5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-sm inline-flex items-center gap-2"
                          >
                            <span>Open Case Report</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Dossier Modal */}
      {selectedDossierCase && (
        <Modal
          open={Boolean(selectedDossierCase)}
          onClose={() => setSelectedDossierCase(null)}
          title={`Case Dossier Summary — ${selectedDossierCase.number}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/5 space-y-2">
              <h4 className="font-extrabold text-sm text-foreground">
                {selectedDossierCase.title}
              </h4>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 font-bold">
                  {selectedDossierCase.court}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  FIR: {selectedDossierCase.fir.no} ({selectedDossierCase.fir.date})
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Status: {selectedDossierCase.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Parties */}
            <div>
              <span className="font-black text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">
                Listed Parties &amp; Accused
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {selectedDossierCase.parties.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-black/5 bg-zinc-50">
                    <span className="text-[10px] text-zinc-400 block font-bold">{p.role}</span>
                    <span className="font-bold text-zinc-900">{p.name}</span>
                    {p.custody && (
                      <span className="text-[10px] text-zinc-500 block">Custody: {p.custody}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admitted Evidence */}
            {selectedDossierCase.evidence.length > 0 && (
              <div>
                <span className="font-black text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">
                  Admitted Evidence &amp; Exhibits ({selectedDossierCase.evidence.length})
                </span>
                <div className="space-y-1.5">
                  {selectedDossierCase.evidence.map((ev) => (
                    <div key={ev.id} className="p-2.5 rounded-xl border border-black/5 bg-white flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-zinc-900 mr-2">{ev.code}</span>
                        <span className="font-medium text-zinc-700">{ev.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        {ev.admission.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDossierCase(null)}
              >
                Close
              </Button>
              <Link to={`/cases/${selectedDossierCase.id}`}>
                <Button variant="primary" size="sm">
                  View Full Case File →
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* Adjourn / Edit Notes Modal */}
      {adjournTargetHearing && (
        <Modal
          open={Boolean(adjournTargetHearing)}
          onClose={() => setAdjournTargetHearing(null)}
          title={`Adjourn / Update Order for ${adjournTargetHearing.caseNumber}`}
          size="md"
        >
          <form onSubmit={handleSaveAdjournment} className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-black/5 font-bold text-xs text-zinc-900">
              {adjournTargetHearing.caseTitle}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Hearing Date">
                <Input
                  type="date"
                  value={adjournDate}
                  onChange={(e) => setAdjournDate(e.target.value)}
                  required
                />
              </Field>
              <Field label="Time Slot">
                <Input
                  type="time"
                  value={adjournTime}
                  onChange={(e) => setAdjournTime(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Hearing Stage / Purpose">
              <Select
                value={adjournStage}
                onChange={(e) => setAdjournStage(e.target.value)}
                className="w-full"
              >
                <option>Remand Production &amp; Custody Review</option>
                <option>Remand Production &amp; FSL Direction</option>
                <option>Bail Hearing / Discharge Application</option>
                <option>Charge Framing &amp; Plea Recording</option>
                <option>Evidence &amp; Witness Examination</option>
                <option>Cross Examination of Lead IO</option>
                <option>Victim Evidence (In-Camera Preparation)</option>
                <option>Victim Deposition (In-Camera Section 35)</option>
                <option>Final Arguments &amp; Written Submissions</option>
                <option>Pronouncement of Judgment &amp; Sentence</option>
              </Select>
            </Field>

            <Field label="Court Hall Assignment">
              <Input
                value={adjournHall}
                onChange={(e) => setAdjournHall(e.target.value)}
                placeholder="e.g. Hall 04 (Main Sessions)"
              />
            </Field>

            <Field label="Bench Order &amp; Direction Notes">
              <Input
                value={adjournNotes}
                onChange={(e) => setAdjournNotes(e.target.value)}
                placeholder="e.g. Accused produced via VC. Remand extended by 14 days."
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAdjournTargetHearing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="coral" size="sm">
                Save Bench Direction
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule Hearing Modal */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule or List New Hearing"
        size="md"
      >
        <form onSubmit={handleCreateHearing} className="space-y-4 text-xs">
          <Field label="Target Judicial Case">
            <Select
              value={targetCaseId}
              onChange={(e) => setTargetCaseId(e.target.value)}
              required
              className="w-full"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number} — {c.title.slice(0, 48)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Hearing Date">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Time Slot">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Hearing Stage / Purpose">
            <Select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="w-full"
            >
              <option>Remand Production &amp; Custody Review</option>
              <option>Bail Hearing / Discharge Application</option>
              <option>Charge Framing &amp; Plea Recording</option>
              <option>Evidence &amp; Witness Examination</option>
              <option>Cross Examination of Investigating Officer</option>
              <option>Victim Deposition (In-Camera Section 35)</option>
              <option>Final Arguments &amp; Written Submissions</option>
              <option>Pronouncement of Judgment &amp; Sentence</option>
            </Select>
          </Field>

          <Field label="Court Hall Assignment">
            <Input
              value={newHall}
              onChange={(e) => setNewHall(e.target.value)}
              placeholder="e.g. Hall 04 (Main Sessions)"
            />
          </Field>

          <Field label="Bench Notes">
            <Input
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="e.g. Summons issued to chemical examiner"
            />
          </Field>

          <div className="rounded-2xl border border-black/8 bg-zinc-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">
                Set Reminder Alarm &amp; Notification
              </span>
              <input
                type="checkbox"
                checked={attachAlarm}
                onChange={(e) => setAttachAlarm(e.target.checked)}
                className="size-4 accent-[#FF5C5C]"
              />
            </div>
            {attachAlarm && (
              <Field label="Alarm Urgency Tier">
                <Select
                  value={alarmUrgency}
                  onChange={(e) => setAlarmUrgency(e.target.value as any)}
                  className="w-full"
                >
                  <option value="INFO">Notice: 15m Prior</option>
                  <option value="WARNING">Warning: Remand / Evidence (1 Day Prior)</option>
                  <option value="STATUTORY_CRITICAL">Critical: Statutory Limitation Lapse</option>
                </Select>
              </Field>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Save To Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
