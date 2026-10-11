import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Download,
  Plus,
  FilterX,
  Search,
  Crosshair,
  ArrowUpDown,
  ArrowRight,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  Printer,
  Scale,
  Shield,
  Gavel,
  CheckCircle2,
  X,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
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
  Modal,
  Field,
  useApp,
} from '../ui'
import OfficialCaseDocument from '../components/OfficialCaseDocument'
import ComprehensiveCaseIntakeModal from '../components/ComprehensiveCaseIntakeModal'

export default function Cases() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const cases = judicialStore.getCases()

  // Filters and queries
  const [q, setQ] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'criminal' | 'pocso' | 'family' | 'pending' | 'overdue' | 'closed'>('all')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<'number' | 'hearing' | 'filing'>('hearing')

  // Selected Case for Official Master Document View
  const [viewingDocCase, setViewingDocCase] = useState<FullCaseRecord | null>(null)

  // Edit Case Modal State
  const [editingCase, setEditingCase] = useState<FullCaseRecord | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editType, setEditType] = useState<'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'>('Criminal')
  const [editStage, setEditStage] = useState('')
  const [editStatus, setEditStatus] = useState<'ontrack' | 'warning' | 'overdue'>('ontrack')
  const [editNextHearing, setEditNextHearing] = useState('')
  const [editPoliceStation, setEditPoliceStation] = useState('')
  const [editIoName, setEditIoName] = useState('')
  const [editActs, setEditActs] = useState('')

  // Delete Case Confirmation State
  const [deletingCase, setDeletingCase] = useState<FullCaseRecord | null>(null)

  // Quick Add Case Modal State
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false)
  const [newCaseType, setNewCaseType] = useState<'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'>('Criminal')
  const [newComplainant, setNewComplainant] = useState('State of Tamil Nadu')
  const [newAccused, setNewAccused] = useState('')
  const [newActs, setNewActs] = useState('BNS s.309(4) / Arms Act s.25')
  const [newPoliceStation, setNewPoliceStation] = useState('T-4 Anna Nagar Police Station')
  const [newIoName, setNewIoName] = useState('Insp. S. Murugan')
  const [newStage, setNewStage] = useState('Framing of Charges')
  const [newNextHearing, setNewNextHearing] = useState('2026-10-24')

  // Calculated Dashboard Statistics
  const stats = useMemo(() => {
    const total = cases.length
    const closed = cases.filter((c) => c.isClosed).length
    const pending = total - closed
    const overdue = cases.filter((c) => !c.isClosed && (c.status === 'overdue' || c.status === 'warning')).length
    const criminalCount = cases.filter((c) => c.type === 'Criminal').length
    const pocsoCount = cases.filter((c) => c.type === 'POCSO').length
    const familyCount = cases.filter((c) => c.type === 'Matrimonial' || c.type === 'Civil').length
    
    // Upcoming hearings
    const upcomingHearings = cases
      .filter((c) => !c.isClosed && c.nextHearing)
      .sort((a, b) => a.nextHearing.localeCompare(b.nextHearing))
      .slice(0, 3)

    return {
      total,
      closed,
      pending,
      overdue,
      criminalCount,
      pocsoCount,
      familyCount,
      upcomingHearings,
    }
  }, [cases])

  // Filtered rows
  const rows = useMemo(() => {
    let r = cases.filter((c) => {
      const query = q.trim().toLowerCase()
      if (
        query &&
        !(c.number + ' ' + c.title + ' ' + c.court + ' ' + c.policeStation + ' ' + (c.io?.name || '') + ' ' + c.acts.join(' ')).toLowerCase().includes(query)
      ) {
        return false
      }

      // Tab filter
      if (activeTab === 'criminal' && c.type !== 'Criminal') return false
      if (activeTab === 'pocso' && c.type !== 'POCSO') return false
      if (activeTab === 'family' && c.type !== 'Matrimonial' && c.type !== 'Civil') return false
      if (activeTab === 'pending' && c.isClosed) return false
      if (activeTab === 'overdue' && (c.isClosed || c.status === 'ontrack')) return false
      if (activeTab === 'closed' && !c.isClosed) return false

      // Dropdown filters
      if (type && c.type !== type) return false
      if (status === 'closed' && !c.isClosed) return false
      if (status === 'active' && c.isClosed) return false
      if (status === 'overdue' && (c.isClosed || c.status !== 'overdue')) return false
      if (status === 'warning' && (c.isClosed || c.status !== 'warning')) return false

      return true
    })

    r = [...r].sort((a, b) => {
      if (sort === 'number') return a.number.localeCompare(b.number)
      if (sort === 'filing') return b.filingDate.localeCompare(a.filingDate)
      return a.nextHearing.localeCompare(b.nextHearing)
    })

    return r
  }, [cases, q, activeTab, type, status, sort])

  const openEditModal = (c: FullCaseRecord) => {
    setEditingCase(c)
    setEditTitle(c.title)
    setEditType(c.type)
    setEditStage(c.stage)
    setEditStatus(c.status)
    setEditNextHearing(c.nextHearing)
    setEditPoliceStation(c.policeStation)
    setEditIoName(c.io?.name || '')
    setEditActs(c.acts.join(', '))
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCase) return

    judicialStore.updateCase(editingCase.id, {
      title: editTitle,
      type: editType,
      stage: editStage,
      status: editStatus,
      nextHearing: editNextHearing,
      policeStation: editPoliceStation,
      acts: editActs.split(',').map((s) => s.trim()).filter(Boolean),
      io: {
        ...editingCase.io,
        name: editIoName || editingCase.io.name,
        policeStation: editPoliceStation || editingCase.io.policeStation,
      },
    })

    toast(`Case ${editingCase.number} updated successfully!`, 'ok')
    setEditingCase(null)
  }

  const handleConfirmDelete = () => {
    if (!deletingCase) return
    const num = deletingCase.number
    const success = judicialStore.deleteCase(deletingCase.id)
    if (success) {
      toast(`Case ${num} deleted from docket registry`, 'ok')
      setDeletingCase(null)
    } else {
      toast('Failed to delete case', 'bad')
    }
  }

  const handleAddCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccused.trim()) {
      toast('Please enter primary accused name', 'bad')
      return
    }

    const preview = judicialStore.generateCaseNumberAndName({
      jurisdictionCode: 'TN',
      caseType: newCaseType,
      year: 2026,
      policeStationCode: newPoliceStation.slice(0, 4).toUpperCase(),
      primaryComplainant: newComplainant,
      primaryAccused: newAccused,
      coAccusedCount: 0,
      primaryStatuteSection: newActs.split('/')[0]?.trim() || 'BNS',
    })

    const newCase = judicialStore.ingestNewCase({
      number: preview.caseNumber,
      title: preview.caseName,
      type: newCaseType,
      court: 'Principal Sessions Court · Bench 04',
      acts: newActs.split(',').map((s) => s.trim()),
      stage: newStage,
      status: 'ontrack',
      filingDate: new Date().toISOString().split('T')[0],
      nextHearing: newNextHearing,
      judge: 'Hon. Justice R. Venkataraman',
      policeStation: newPoliceStation,
      fir: { no: `${Math.floor(Math.random() * 200) + 1}/2026`, date: new Date().toISOString().split('T')[0] },
      io: {
        name: newIoName,
        rank: 'Inspector',
        badge: 'TN-POL-8821',
        policeStation: newPoliceStation,
        phone: '+91-98401-44910',
        chargesheetRef: `CS-${preview.caseNumber.slice(-4)}/2026`,
      },
      parties: [
        { role: 'Prosecutor', name: 'State of Tamil Nadu' },
        { role: 'Accused', name: newAccused, custody: 'In custody' },
      ],
      victims: { total: 1, minors: 0, adults: 1, details: [] },
      weapons: [],
      evidence: [],
      documents: [],
      hearings: [
        {
          id: `hrg-${Date.now()}`,
          caseId: preview.caseNumber.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          caseNumber: preview.caseNumber,
          caseTitle: preview.caseName,
          date: newNextHearing,
          time: '11:00',
          stage: newStage,
          courtHall: 'Hall 04 (Main Sessions)',
          judge: 'Hon. Justice R. Venkataraman',
          hasAlarm: false,
        },
      ],
      additionalDetails: 'Case intake executed via Bench Trial Registry.',
      isClosed: false,
    })

    setIsAddCaseOpen(false)
    setNewAccused('')
    toast(`Case ${newCase.number} ingested into registry!`, 'ok')
  }

  // Ring Donut percentages
  const pendingPct = stats.total > 0 ? (stats.pending / stats.total) * 100 : 70
  const closedPct = stats.total > 0 ? (stats.closed / stats.total) * 100 : 15
  const overduePct = stats.total > 0 ? (stats.overdue / stats.total) * 100 : 15

  return (
    <div className="space-y-7 selection:bg-[#FF5C5C]/20 selection:text-black">
      {/* ========================================================================= */}
      {/* PAGE HEADER: NEOBRUTALIST SWISS BENCH TITLE                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b-2 border-black/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white font-mono text-[10px] font-bold tracking-widest uppercase mb-2">
            <span className="size-2 rounded-full bg-[#FF5C5C] animate-pulse" />
            Bench 04 · High-Court Docket Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950 font-sans uppercase">
            Case Files &amp; Trial Registry Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
            Real-time telemetry: Total dockets, active trials pending examination, statutory deadlines &amp; certified case record dossiers.
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddCaseOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#121316] text-white hover:bg-zinc-800 text-xs font-black transition-all cursor-pointer inline-flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="size-4 text-[#FF5C5C]" />
            <span>+ Intake New Case</span>
          </button>

          <Link to="/cases/new">
            <button className="px-4 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-black text-xs font-bold transition-all cursor-pointer shadow-xs">
              Auto-Number Wizard
            </button>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 border border-black/20 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Print Cause List / Registry"
          >
            <Printer className="size-4 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DASHBOARD TELEMETRY: DONUT RING + WAITING DOCKETS + PASTEL METRIC CARDS   */}
      {/* (Directly matching the top screen of the reference image)                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: DONUT CIRCULAR OVERVIEW CARD (Matching "23,4k" Donut Card) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border-2 border-black shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-500">
              Docket Volume Breakdown
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-bold">
              LIVE REGISTRY
            </span>
          </div>

          {/* Donut Graphic with Total in Center */}
          <div className="py-6 flex flex-col items-center justify-center relative">
            <div className="relative size-48 sm:size-52 grid place-items-center">
              {/* SVG Circular Donut Ring */}
              <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F3F4F6"
                  strokeWidth="12"
                />
                {/* Pending Cases Segment (Golden Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FBBF24"
                  strokeWidth="12"
                  strokeDasharray={`${pendingPct * 2.38} 238`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Overdue/Warning Cases Segment (Rose Coral) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FF5C5C"
                  strokeWidth="12"
                  strokeDasharray={`${overduePct * 2.38} 238`}
                  strokeDashoffset={`-${pendingPct * 2.38}`}
                  strokeLinecap="round"
                />
                {/* Disposed Cases Segment (Emerald Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${closedPct * 2.38} 238`}
                  strokeDashoffset={`-${(pendingPct + overduePct) * 2.38}`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-black font-sans text-black tracking-tight">
                  {stats.total}
                </span>
                <span className="font-mono text-[10.5px] uppercase font-bold text-zinc-500 tracking-wider">
                  Total Cases
                </span>
              </div>
            </div>

            {/* Quick Segment Indicator Badges */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="font-bold">Pending:</span>
                </div>
                <span className="font-black">{stats.pending}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overdue')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#FF5C5C]" />
                  <span className="font-bold">Urgent:</span>
                </div>
                <span className="font-black">{stats.overdue}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('closed')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold">Disposed:</span>
                </div>
                <span className="font-black">{stats.closed}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-black" />
                  <span className="font-bold">All Files:</span>
                </div>
                <span className="font-black">{stats.total}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TOP QUICK DOCKETS + PROCEEDINGS (Matching "Waiting for bills" & "Latest transaction") */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-4">
          
          {/* Top Row: "Upcoming Trial Hearings (Next 48h)" (Matching "Waiting for bills" cards) */}
          <div className="bg-white rounded-3xl p-5 border-2 border-black shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[#FF5C5C]" />
                <h3 className="font-sans font-black text-xs uppercase tracking-wider text-black">
                  Priority Hearings Listed (Cause List)
                </h3>
              </div>
              <span className="font-mono text-[10.5px] text-zinc-500 font-bold">
                Next {stats.upcomingHearings.length} Matters
              </span>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stats.upcomingHearings.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-[#F7F4EB] border border-black/10 flex flex-col justify-between space-y-2 hover:border-black transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-black text-xs text-[#FF5C5C]">
                        {c.number}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-black text-white font-mono text-[9.5px] font-bold">
                        {c.nextHearing}
                      </span>
                    </div>
                    <div className="font-sans font-bold text-xs text-zinc-900 truncate mt-1" title={c.title}>
                      {c.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                      Stage: <span className="text-zinc-800 font-semibold">{c.stage}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingDocCase(c)}
                    className="w-full py-1.5 px-3 rounded-full bg-black text-white text-[11px] font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs group-hover:scale-[1.01]"
                  >
                    <FileText className="size-3 text-[#FF5C5C]" />
                    <span>Open Case Document</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row: 3 Pastel KPI Metric Cards (Matching Pink, Blue, Yellow cards in reference) */}
          <div className="grid sm:grid-cols-3 gap-3.5">
            
            {/* Card 1: Soft Rose Pastel - "Pending Under Trial" */}
            <div
              onClick={() => setActiveTab('pending')}
              className="p-5 rounded-3xl bg-[#FCE7F3] border-2 border-pink-300/80 text-pink-950 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-pink-900/80">
                  Pending Under Trial
                </span>
                <span className="px-2 py-0.5 rounded-full bg-pink-200/80 text-pink-900 font-mono text-[10px] font-black">
                  {((stats.pending / (stats.total || 1)) * 100).toFixed(0)}% ACTIVE
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-sans text-pink-950 tracking-tight">
                  {stats.pending}
                </div>
                <div className="text-xs text-pink-900/80 font-medium mt-0.5">
                  Trials undergoing examination &amp; hearing
                </div>
              </div>
              <div className="pt-2 border-t border-pink-200/80 flex items-center justify-between text-[11px] font-bold text-pink-900">
                <span>Filter Pending Cases</span>
                <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Soft Blue Pastel - "Criminal Sessions Dockets" */}
            <div
              onClick={() => setActiveTab('criminal')}
              className="p-5 rounded-3xl bg-[#DBEAFE] border-2 border-blue-300/80 text-blue-950 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-blue-900/80">
                  Criminal Sessions
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900 font-mono text-[10px] font-black">
                  BNS / IPC
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-sans text-blue-950 tracking-tight">
                  {stats.criminalCount}
                </div>
                <div className="text-xs text-blue-900/80 font-medium mt-0.5">
                  Sessions &amp; Special trial dockets
                </div>
              </div>
              <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span>Filter Criminal Trials</span>
                <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Soft Amber Pastel - "Statutory Alerts & Overdue" */}
            <div
              onClick={() => setActiveTab('overdue')}
              className="p-5 rounded-3xl bg-[#FEF3C7] border-2 border-amber-300/80 text-amber-950 flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-wider text-amber-900/80">
                  Statutory Overdue
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-mono text-[10px] font-black">
                  ATTENTION
                </span>
              </div>
              <div>
                <div className="text-3xl font-black font-sans text-amber-950 tracking-tight">
                  {stats.overdue}
                </div>
                <div className="text-xs text-amber-900/80 font-medium mt-0.5">
                  Overdue reports &amp; statutory periods
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span>Filter Urgent Matters</span>
                <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FILTER TABS & SEARCH CONTROLS (Matching "All, Telemedicine, In clinic...") */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-black shadow-sm space-y-4">
        
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'All Dockets', count: stats.total },
              { key: 'pending', label: 'Pending in Trial', count: stats.pending },
              { key: 'criminal', label: 'Criminal Sessions', count: stats.criminalCount },
              { key: 'pocso', label: 'POCSO Special', count: stats.pocsoCount },
              { key: 'family', label: 'Family / Civil', count: stats.familyCount },
              { key: 'overdue', label: 'Statutory Overdue', count: stats.overdue },
              { key: 'closed', label: 'Disposed Decrees', count: stats.closed },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-black/10 text-zinc-800'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-zinc-500 font-semibold">
            Showing <span className="font-bold text-black">{rows.length}</span> of {cases.length} Dockets
          </div>
        </div>

        {/* Search Input & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-7 relative">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 size-4.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by case number (e.g. S.C. 214/2025), party name, IO, police station, or cited statutes..."
              className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-black/15 focus:border-black bg-zinc-50/70 focus:bg-white text-xs sm:text-sm font-semibold transition-all outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full h-12 px-4 rounded-full border-2 border-black/15 bg-white text-xs font-bold text-zinc-800 outline-none"
            >
              <option value="hearing">Sort by Next Hearing Date</option>
              <option value="number">Sort by Case Number</option>
              <option value="filing">Sort by Filing Date</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end">
            {(q || activeTab !== 'all' || type || status) && (
              <button
                type="button"
                onClick={() => {
                  setQ('')
                  setActiveTab('all')
                  setType('')
                  setStatus('')
                }}
                className="w-full h-12 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FilterX className="size-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE NEOBRUTALIST CASE FILES TABLE                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-black shadow-sm overflow-hidden">
        <div className="p-5 border-b-2 border-black flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F2]">
          <div>
            <h3 className="font-sans font-black text-sm uppercase tracking-wider text-black">
              Official Docket Registry Records ({rows.length})
            </h3>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">
              Click <strong className="text-black">"Case Document"</strong> on any matter to inspect the complete certified case file dossier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddCaseOpen(true)}
              className="cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>+ Intake Case</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-[#F2EDE0] text-black font-mono font-bold text-[11px] uppercase tracking-wider">
                <th className="p-3.5 border-r border-black/20 whitespace-nowrap">Case Number</th>
                <th className="p-3.5 border-r border-black/20">Standardized Cause Title &amp; FIR</th>
                <th className="p-3.5 border-r border-black/20">Classification</th>
                <th className="p-3.5 border-r border-black/20">Lead IO &amp; Police Station</th>
                <th className="p-3.5 border-r border-black/20">Statutes Cited</th>
                <th className="p-3.5 border-r border-black/20">Trial Stage</th>
                <th className="p-3.5 border-r border-black/20">Next Hearing</th>
                <th className="p-3.5 border-r border-black/20">Status</th>
                <th className="p-3.5 text-center font-black text-black">Actions &amp; Case Document</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-xs text-zinc-400">
                    <div className="space-y-2 max-w-sm mx-auto">
                      <p className="font-black text-sm text-zinc-700">No Matching Dockets Found</p>
                      <p className="text-[11px] text-zinc-400">Adjust your search terms or filter selection.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setQ('')
                          setActiveTab('all')
                        }}
                        className="mt-2 px-4 py-2 rounded-full bg-black text-white font-bold text-xs cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#FAF8F2] transition-colors border-b border-black/10 group"
                  >
                    {/* Case Number */}
                    <td className="p-3.5 border-r border-black/10 whitespace-nowrap">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setViewingDocCase(c)}
                          className="font-mono font-black text-xs text-[#FF5C5C] hover:underline cursor-pointer block text-left"
                        >
                          {c.number}
                        </button>
                        <span className="font-mono text-[10px] text-zinc-400 block">
                          FIL: {c.filingDate || '2025'}
                        </span>
                      </div>
                    </td>

                    {/* Cause Title */}
                    <td className="p-3.5 border-r border-black/10 max-w-xs">
                      <div className="font-bold text-xs text-zinc-900 truncate" title={c.title}>
                        {c.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-medium mt-0.5 truncate">
                        FIR: {c.fir?.no || 'N/A'} ({c.fir?.date || 'N/A'}) · {c.evidence?.length || 0} Exhibits
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3.5 border-r border-black/10 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {c.type}
                      </span>
                    </td>

                    {/* IO & Police */}
                    <td className="p-3.5 border-r border-black/10 max-w-44">
                      <div className="font-bold text-zinc-900 truncate">{c.io?.name || 'Assigned Officer'}</div>
                      <div className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                        {c.policeStation}
                      </div>
                    </td>

                    {/* Acts */}
                    <td className="p-3.5 border-r border-black/10 max-w-40">
                      <div className="font-mono text-[11px] text-zinc-700 truncate font-semibold" title={c.acts.join(', ')}>
                        {c.acts.join(', ')}
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="p-3.5 border-r border-black/10 whitespace-nowrap">
                      <span className="font-semibold text-zinc-900 text-xs">
                        {c.stage}
                      </span>
                    </td>

                    {/* Next Hearing */}
                    <td className="p-3.5 border-r border-black/10 whitespace-nowrap font-mono font-bold text-xs text-zinc-800">
                      {c.nextHearing}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 border-r border-black/10 whitespace-nowrap">
                      {c.isClosed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10.5px] font-bold">
                          Disposed
                        </span>
                      ) : c.status === 'overdue' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-mono text-[10.5px] font-bold">
                          Overdue
                        </span>
                      ) : c.status === 'warning' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-[10.5px] font-bold">
                          Warning
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-mono text-[10.5px] font-bold">
                          In Trial
                        </span>
                      )}
                    </td>

                    {/* Actions: Prominent "Case Document" button + Edit + Delete */}
                    <td className="p-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Prominent Official Case Document Button */}
                        <button
                          type="button"
                          onClick={() => setViewingDocCase(c)}
                          className="px-3 py-1.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Open Master Legal Case Document (Total Info)"
                        >
                          <FileText className="size-3.5 text-[#FF5C5C]" />
                          <span>Case Document</span>
                        </button>

                        {/* Full Dossier Page link */}
                        <Link to={`/cases/${c.id}`}>
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                            title="Interactive Dossier Workspace"
                          >
                            <ArrowRight className="size-3.5" />
                          </button>
                        </Link>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                          title="Edit Case Details"
                        >
                          <Edit2 className="size-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingCase(c)}
                          className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
                          title="Delete Case"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL CASE RECORD & DOSSIER (TOTAL INFO OF THE CASE)            */}
      {/* ========================================================================= */}
      {viewingDocCase && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto animate-in fade-in zoom-in-95 duration-150">
            <OfficialCaseDocument
              caseItem={viewingDocCase}
              onClose={() => setViewingDocCase(null)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CASE DOCKET                                                   */}
      {/* ========================================================================= */}
      {editingCase && (
        <Modal
          open={!!editingCase}
          onClose={() => setEditingCase(null)}
          title={`Edit Case Docket: ${editingCase.number}`}
          size="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Field label="Standardized Cause Title">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Case Type">
                <Select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full"
                >
                  <option value="Criminal">Criminal Sessions</option>
                  <option value="POCSO">POCSO Special Court</option>
                  <option value="Matrimonial">Matrimonial / Family</option>
                  <option value="Civil">Civil Suit</option>
                </Select>
              </Field>

              <Field label="Trial Stage">
                <Input
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  required
                />
              </Field>

              <Field label="Trial Status">
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full"
                >
                  <option value="ontrack">On Track</option>
                  <option value="warning">Warning / Hearing Delayed</option>
                  <option value="overdue">Statutory Default Overdue</option>
                </Select>
              </Field>

              <Field label="Next Hearing Date">
                <Input
                  type="date"
                  value={editNextHearing}
                  onChange={(e) => setEditNextHearing(e.target.value)}
                  required
                />
              </Field>

              <Field label="Police Station">
                <Input
                  value={editPoliceStation}
                  onChange={(e) => setEditPoliceStation(e.target.value)}
                  required
                />
              </Field>

              <Field label="Lead IO Name">
                <Input
                  value={editIoName}
                  onChange={(e) => setEditIoName(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Statutory Acts (Comma separated)">
              <Input
                value={editActs}
                onChange={(e) => setEditActs(e.target.value)}
                placeholder="e.g. BNS s.103, Arms Act s.25"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
              <Button variant="outline" type="button" onClick={() => setEditingCase(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INTAKE NEW CASE                                                    */}
      {/* ========================================================================= */}
      <ComprehensiveCaseIntakeModal
        open={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        onSuccess={(caseId) => {
          setSelectedId(caseId)
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {deletingCase && (
        <Modal
          open={!!deletingCase}
          onClose={() => setDeletingCase(null)}
          title="Confirm Docket Deletion"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete case docket <strong className="text-black font-mono">{deletingCase.number}</strong> ({deletingCase.title}) from the active registry? This action will remove all linked documents and hearings.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeletingCase(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Docket
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
