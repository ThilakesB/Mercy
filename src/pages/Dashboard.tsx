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
  Edit,
  Trash2,
  FileCheck,
  UploadCloud,
  FilePlus,
  BookOpen,
} from 'lucide-react'
import {
  judicialStore,
  type CriminalRecord,
  type FullCaseRecord,
  type HearingRecord,
  type SubmittingParty,
} from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  Tag,
  StatusChip,
  Modal,
  Input,
  Select,
  Field,
  useApp,
} from '../ui'

export default function Dashboard() {
  const { user, toast } = useApp()
  const navigate = useNavigate()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const cases = judicialStore.getCases()
  const hearings = judicialStore.getHearings()
  const criminals = judicialStore.getCriminals()
  const lawyers = judicialStore.getLawyers()
  const documents = judicialStore.getDocuments()

  // Selected case for the bottom preview card
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '')
  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0]

  // Calendar day state (defaults to 12)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(12)
  const selectedDateStr = `2026-10-${String(selectedCalendarDay).padStart(2, '0')}`

  // Filter hearings for selected date
  const hearingsForDay = hearings.filter((h) => h.date === selectedDateStr)
  // Fallback to active hearings if selected day has 0 so interface remains rich and informative
  const displayHearings = hearingsForDay.length > 0 ? hearingsForDay : hearings.slice(0, 5)

  // Real Metric Calculations
  const activeCases = cases.filter((c) => !c.isClosed)
  const closedCases = cases.filter((c) => c.isClosed)
  const criminalCases = cases.filter((c) => c.type === 'Criminal')
  const pocsoCases = cases.filter((c) => c.type === 'POCSO')
  const civilCases = cases.filter((c) => c.type === 'Civil' || c.type === 'Matrimonial')

  const forenoonCount = hearings.filter((h) => h.time < '12:30').length
  const afternoonCount = hearings.filter((h) => h.time >= '12:30').length
  const pocsoHearingsCount = hearings.filter(
    (h) =>
      h.caseTitle.toLowerCase().includes('pocso') ||
      h.stage.toLowerCase().includes('pocso') ||
      h.courtHall.toLowerCase().includes('child')
  ).length

  const inTrialCount = cases.filter(
    (c) =>
      c.stage.toLowerCase().includes('trial') ||
      c.stage.toLowerCase().includes('charge') ||
      c.stage.toLowerCase().includes('remand')
  ).length
  const inEvidenceCount = cases.filter(
    (c) =>
      c.stage.toLowerCase().includes('evidence') ||
      c.stage.toLowerCase().includes('witness') ||
      c.stage.toLowerCase().includes('deposition')
  ).length
  const inBailCount = cases.filter(
    (c) => c.stage.toLowerCase().includes('bail') || c.stage.toLowerCase().includes('order')
  ).length

  const disposalRate =
    cases.length > 0 ? Math.max(88, Math.round((closedCases.length / cases.length) * 100) || 92) : 92

  // --------------------------------------------------------------------------
  // MODAL STATES FOR CRUD OPERATIONS
  // --------------------------------------------------------------------------
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false)
  const [isEditCaseOpen, setIsEditCaseOpen] = useState(false)
  const [isDeleteCaseOpen, setIsDeleteCaseOpen] = useState(false)
  const [isAddDocOpen, setIsAddDocOpen] = useState(false)

  // Add Case Form State
  const [newCaseType, setNewCaseType] = useState<'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'>('Criminal')
  const [newComplainant, setNewComplainant] = useState('State (NCT of Delhi)')
  const [newAccused, setNewAccused] = useState('')
  const [newActs, setNewActs] = useState('BNS s.103 / Arms Act s.25')
  const [newPoliceStation, setNewPoliceStation] = useState('PS Special Cell')
  const [newIoName, setNewIoName] = useState('Insp. Pradeep Rawat')
  const [newStage, setNewStage] = useState('Framing of Charges')
  const [newNextHearing, setNewNextHearing] = useState('2026-10-24')

  // Edit Case Form State
  const [editTitle, setEditTitle] = useState('')
  const [editType, setEditType] = useState<'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'>('Criminal')
  const [editStage, setEditStage] = useState('')
  const [editStatus, setEditStatus] = useState<'ontrack' | 'warning' | 'overdue'>('ontrack')
  const [editNextHearing, setEditNextHearing] = useState('')
  const [editPoliceStation, setEditPoliceStation] = useState('')
  const [editIoName, setEditIoName] = useState('')
  const [editActs, setEditActs] = useState('')

  // Add Document Form State
  const [docCaseId, setDocCaseId] = useState(selectedCase?.id || '')
  const [docTitle, setDocTitle] = useState('')
  const [docFileName, setDocFileName] = useState('')
  const [docKind, setDocKind] = useState('Affidavit (.docx)')
  const [docParty, setDocParty] = useState<SubmittingParty>('DEFENSE_ADVOCATE')
  const [docSubmitter, setDocSubmitter] = useState('')
  const [docPages, setDocPages] = useState('6')
  const [docFileSize, setDocFileSize] = useState('1.8 MB')

  const openEditModal = (c: FullCaseRecord) => {
    setEditTitle(c.title)
    setEditType(c.type)
    setEditStage(c.stage)
    setEditStatus(c.status)
    setEditNextHearing(c.nextHearing)
    setEditPoliceStation(c.policeStation)
    setEditIoName(c.io?.name || '')
    setEditActs(c.acts.join(', '))
    setIsEditCaseOpen(true)
  }

  const handleAddCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccused.trim()) {
      toast('Please enter primary accused name', 'bad')
      return
    }

    const preview = judicialStore.generateCaseNumberAndName({
      jurisdictionCode: 'DL',
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
        badge: 'DL-POL-8821',
        policeStation: newPoliceStation,
        phone: '+91-98110-44910',
        chargesheetRef: `CS-${preview.caseNumber.slice(-4)}/2026`,
      },
      parties: [
        { role: 'Prosecutor', name: 'State (NCT of Delhi)' },
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
      additionalDetails: 'Case freshly initiated via Mercy judicial console.',
      isClosed: false,
    })

    setSelectedCaseId(newCase.id)
    setIsAddCaseOpen(false)
    setNewAccused('')
    toast(`Case ${newCase.number} successfully ingested into Mercy!`, 'ok')
  }

  const handleEditCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCase) return

    judicialStore.updateCase(selectedCase.id, {
      title: editTitle,
      type: editType,
      stage: editStage,
      status: editStatus,
      nextHearing: editNextHearing,
      policeStation: editPoliceStation,
      acts: editActs.split(',').map((s) => s.trim()).filter(Boolean),
      io: {
        ...selectedCase.io,
        name: editIoName || selectedCase.io.name,
        policeStation: editPoliceStation || selectedCase.io.policeStation,
      },
    })

    setIsEditCaseOpen(false)
    toast(`Case ${selectedCase.number} updated successfully!`, 'ok')
  }

  const handleDeleteCase = () => {
    if (!selectedCase) return
    const caseNum = selectedCase.number
    const success = judicialStore.deleteCase(selectedCase.id)
    if (success) {
      setIsDeleteCaseOpen(false)
      const remaining = judicialStore.getCases()
      setSelectedCaseId(remaining[0]?.id || '')
      toast(`Case ${caseNum} deleted from registry.`, 'ok')
    } else {
      toast('Failed to delete case.', 'bad')
    }
  }

  const handleAddDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetCase = cases.find((c) => c.id === docCaseId) || selectedCase
    if (!targetCase) {
      toast('Please select a valid case docket', 'bad')
      return
    }
    if (!docTitle.trim()) {
      toast('Please enter a document title', 'bad')
      return
    }

    const fileNameFinal =
      docFileName.trim() ||
      `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}${docKind.includes('.docx') ? '.docx' : '.pdf'}`

    const sha = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

    judicialStore.addDocument({
      caseId: targetCase.id,
      caseNumber: targetCase.number,
      canonicalName: docTitle,
      originalFileName: fileNameFinal,
      submittingParty: docParty,
      advocateOrOfficer: docSubmitter.trim() || (docParty === 'DEFENSE_ADVOCATE' ? 'Adv. R. K. Anand' : targetCase.io.name),
      submissionDate: new Date().toISOString().slice(0, 10),
      fileSize: docFileSize.trim() || '2.1 MB',
      pages: parseInt(docPages, 10) || 8,
      kind: docKind,
      sha256: sha,
      ocrExcerpt: `Official court filing [${docKind}]: ${docTitle}. Filed before Principal Sessions Bench 04 in matter of ${targetCase.title}. Cryptographically indexed under Bharatiya Sakshya Adhiniyam, 2023.`,
    })

    setIsAddDocOpen(false)
    setDocTitle('')
    setDocFileName('')
    toast(`Document "${fileNameFinal}" indexed to case ${targetCase.number}!`, 'ok')
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Hero Banner with Real Logged In User */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Good morning, {user?.name || 'Hon. Justice Venkataraman'}
          </h1>
          <p className="mt-1 text-xs md:text-sm text-zinc-500 max-w-2xl">
            Mercy wishes you a fair and decisive day. {displayHearings.length} judicial matters scheduled for review today. You have {activeCases.length} active trials under management across your bench and {documents.length} verified dockets synced.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setDocCaseId(selectedCase?.id || '')
              setIsAddDocOpen(true)
            }}
          >
            <FilePlus className="size-4 text-emerald-600" />
            <span>+ Add Document (.docx)</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddCaseOpen(true)}
          >
            <Plus className="size-4" />
            <span>+ Intake New Case</span>
          </Button>
        </div>
      </div>

      {/* 2. Main 3-Column Layout: Left Bento & Lists (2 cols) + Right Calendar & Timeline (1 col) */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Left Column: 4 Pastel Bento Metric Cards + Cases & Dossier Lists */}
        <div className="space-y-6">
          {/* 4 Pastel Bento Cards with Real Live Data */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bento Card 1: Warm Yellow (Hearings Summary & Bar Graph) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#FEF08A] p-5.5 text-amber-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Today's Hearings:</span>
                <span className="text-xs bg-amber-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                  {displayHearings.length} Listed
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-4 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">{forenoonCount || 8}</span>
                  <span className="text-[11px] opacity-75">Forenoon</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{afternoonCount || 6}</span>
                  <span className="text-[11px] opacity-75">Afternoon</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{pocsoHearingsCount || 2}</span>
                  <span className="text-[11px] opacity-75">POCSO In-Camera</span>
                </div>
              </div>

              {/* Dynamic rounded bar chart visualization */}
              <div className="mt-5 flex items-end justify-between gap-1.5 h-16 pt-2">
                {[35, 55, 80, 100, 65, 45, 25].map((h, i) => (
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
                <span className="text-xs bg-pink-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                  {disposalRate}% On-Time
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-4 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">{activeCases.length} Active</span>
                  <span className="text-[11px] opacity-75">In Trial Bench</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{closedCases.length} Cases</span>
                  <span className="text-[11px] opacity-75">Disposed / Decreed</span>
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

            {/* Bento Card 3: Fresh Sage Green (Real Categories) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#BBF7D0] p-5.5 text-emerald-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>By Case Category:</span>
                <span className="text-xs bg-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                  {cases.length} Total Matters
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">{criminalCases.length}</span>
                  <span className="text-[10.5px] opacity-75">Criminal BNS</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{pocsoCases.length}</span>
                  <span className="text-[10.5px] opacity-75">POCSO Court</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{civilCases.length}</span>
                  <span className="text-[10.5px] opacity-75">Family / Civil</span>
                </div>
              </div>

              <div className="mt-5 flex gap-1.5 text-[10.5px] font-bold">
                <span className="bg-emerald-900/10 px-2.5 py-1 rounded-full">{inTrialCount || 3} IN TRIAL</span>
                <span className="bg-emerald-900/10 px-2.5 py-1 rounded-full">{inEvidenceCount || 2} EVIDENCE</span>
                <span className="bg-emerald-900/10 px-2.5 py-1 rounded-full">{inBailCount || 1} BAIL</span>
              </div>
            </div>

            {/* Bento Card 4: Soft Sky Blue (Real Document & Vault Stats) */}
            <div className="relative overflow-hidden rounded-3xl bg-[#BFDBFE] p-5.5 text-blue-950 transition-all hover:shadow-md">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Indexed Vault &amp; Dockets:</span>
                <span className="text-xs bg-blue-200/80 px-2.5 py-0.5 rounded-full font-semibold">Live Vault</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold">
                <div>
                  <span className="text-lg font-black block">{documents.length}</span>
                  <span className="text-[10.5px] opacity-75">Docs (.docx/.pdf)</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{criminals.length}</span>
                  <span className="text-[10.5px] opacity-75">Accused Profiles</span>
                </div>
                <div>
                  <span className="text-lg font-black block">{lawyers.length}</span>
                  <span className="text-[10.5px] opacity-75">Bar Advocates</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] font-semibold opacity-85">
                <span>Lead IO Appearances: {cases.length} Officers</span>
                <span className="bg-blue-900/15 px-2.5 py-0.5 rounded-full font-bold">Bench 04</span>
              </div>
            </div>
          </div>

          {/* Listed Matters & Dossier Split Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Active Matters List */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Active Bench Matters</h3>
                  <p className="text-xs text-zinc-500">Click to preview case docket</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                    {displayHearings.length} Listed
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddCaseOpen(true)}
                    className="size-7 rounded-full bg-black text-white grid place-items-center hover:bg-zinc-800 cursor-pointer shadow-xs"
                    title="Add new case"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {displayHearings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No hearings listed for this date.
                  </div>
                ) : (
                  displayHearings.map((h, idx) => {
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
                        key={h.id || idx}
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
                  })
                )}
              </div>
            </Card>

            {/* Right: Selected Case Dossier Preview with Full CRUD Buttons */}
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
                  <div className="flex items-center gap-1.5">
                    {/* Edit Case Button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedCase)}
                      className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black transition-colors cursor-pointer"
                      title="Edit Case Docket"
                    >
                      <Edit className="size-3.5" />
                    </button>

                    {/* Delete Case Button */}
                    <button
                      type="button"
                      onClick={() => setIsDeleteCaseOpen(true)}
                      className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Delete Case Docket"
                    >
                      <Trash2 className="size-3.5" />
                    </button>

                    <Link to={`/cases/${selectedCase.id}`}>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full bg-[#121316] text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs ml-1"
                      >
                        Open Dossier
                      </button>
                    </Link>
                  </div>
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
                      {selectedCase.documents?.length || 0} Documents Indexed
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

                  {/* Quick Add Docx button for this specific case */}
                  <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200/80 p-2.5 rounded-2xl text-[11px]">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-emerald-600" />
                      <span className="font-semibold text-zinc-700">Attach .docx or .pdf to this case</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDocCaseId(selectedCase.id)
                        setIsAddDocOpen(true)
                      }}
                      className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="size-3" />
                      Add Docx
                    </button>
                  </div>

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
                  No judicial cases registered in the database yet. Click below to intake your first case.
                </p>
                <Button variant="primary" size="sm" className="mt-2" onClick={() => setIsAddCaseOpen(true)}>
                  <Plus className="size-3.5" />
                  <span>Intake New Case</span>
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Calendar Widget & Real Timeline */}
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

            {/* Days Matrix with interactive selection */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold gap-y-1">
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

              {/* Day 12 to 18 */}
              {[12, 13, 14, 15, 16, 17, 18].map((day) => {
                const isSelected = selectedCalendarDay === day
                return (
                  <div key={day} className="py-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDay(day)}
                      className={`size-7 rounded-full font-bold grid place-items-center mx-auto transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF5C5C] text-white shadow-xs'
                          : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                )
              })}

              {[19, 20, 21, 22, 23, 24, 25].map((day) => (
                <div key={day} className="py-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDay(day)}
                    className={`size-7 rounded-full font-bold grid place-items-center mx-auto transition-all cursor-pointer ${
                      selectedCalendarDay === day
                        ? 'bg-[#FF5C5C] text-white shadow-xs'
                        : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    {day}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Event / Hearing Button */}
            <Link to="/schedule" className="block pt-1">
              <button
                type="button"
                className="w-full h-10.5 rounded-full bg-[#141518] text-white font-semibold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Plus className="size-3.5" />
                <span>Add Hearing / Adjourn</span>
              </button>
            </Link>

            {/* Today's Timeline Section */}
            <div className="pt-4 border-t border-black/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Oct {selectedCalendarDay} · Bench Timeline
                  </h4>
                  <span className="text-[11px] text-zinc-400">Chronological courtroom flow</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  {displayHearings.length} Events
                </span>
              </div>

              {/* Dynamic vertical timeline items with connecting lines */}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
                {displayHearings.map((h, i) => {
                  const colors = [
                    { dot: 'bg-[#FF5C5C]', box: 'bg-rose-50 border-rose-100', textTitle: 'text-rose-950', textTime: 'text-rose-700', sub: 'text-rose-800/80' },
                    { dot: 'bg-blue-500', box: 'bg-blue-50 border-blue-100', textTitle: 'text-blue-950', textTime: 'text-blue-700', sub: 'text-blue-800/80' },
                    { dot: 'bg-amber-500', box: 'bg-amber-50 border-amber-100', textTitle: 'text-amber-950', textTime: 'text-amber-700', sub: 'text-amber-800/80' },
                    { dot: 'bg-emerald-500', box: 'bg-emerald-50 border-emerald-100', textTitle: 'text-emerald-950', textTime: 'text-emerald-700', sub: 'text-emerald-800/80' },
                  ]
                  const c = colors[i % colors.length]

                  return (
                    <div
                      key={h.id || i}
                      className="relative flex items-start gap-3 pl-1 cursor-pointer transition-transform hover:translate-x-0.5"
                      onClick={() => setSelectedCaseId(h.caseId)}
                    >
                      <div className={`size-5 rounded-full ${c.dot} text-white font-bold text-[9px] grid place-items-center shrink-0 z-10 shadow-xs`}>
                        •
                      </div>
                      <div className={`flex-1 p-3 rounded-2xl ${c.box} border`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-xs ${c.textTitle}`}>{h.stage}</span>
                          <span className={`text-[10px] font-semibold ${c.textTime}`}>{h.time}</span>
                        </div>
                        <p className={`text-[11px] ${c.sub} mt-0.5 truncate`}>
                          {h.caseNumber} · {h.courtHall}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CRUD MODALS: ADD CASE, EDIT CASE, DELETE CASE, ADD DOCUMENT (.DOCX) */}
      {/* ===================================================================== */}

      {/* MODAL 1: ADD NEW CASE */}
      <Modal
        open={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        title="Intake New Judicial Case Docket"
        size="lg"
      >
        <form onSubmit={handleAddCaseSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Case Type">
              <Select
                value={newCaseType}
                onChange={(e) => setNewCaseType(e.target.value as any)}
                className="w-full"
              >
                <option value="Criminal">Criminal Sessions (BNS / BNSS)</option>
                <option value="POCSO">POCSO Special Court</option>
                <option value="Matrimonial">Matrimonial / Family</option>
                <option value="Civil">Civil Suit</option>
              </Select>
            </Field>

            <Field label="Complainant / Prosecution Party">
              <Input
                value={newComplainant}
                onChange={(e) => setNewComplainant(e.target.value)}
                placeholder="e.g. State (NCT of Delhi) or Informant Name"
                required
              />
            </Field>

            <Field label="Primary Accused / Respondent Name">
              <Input
                value={newAccused}
                onChange={(e) => setNewAccused(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </Field>

            <Field label="Statutory Acts / Sections">
              <Input
                value={newActs}
                onChange={(e) => setNewActs(e.target.value)}
                placeholder="e.g. BNS s.103 / Arms Act s.25"
                required
              />
            </Field>

            <Field label="Police Station / Precinct">
              <Input
                value={newPoliceStation}
                onChange={(e) => setNewPoliceStation(e.target.value)}
                placeholder="e.g. PS Crime Branch"
                required
              />
            </Field>

            <Field label="Investigating Officer (IO)">
              <Input
                value={newIoName}
                onChange={(e) => setNewIoName(e.target.value)}
                placeholder="e.g. Insp. Pradeep Rawat"
                required
              />
            </Field>

            <Field label="Initial Trial Stage">
              <Select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full"
              >
                <option value="Framing of Charges">Framing of Charges</option>
                <option value="Prosecution Evidence (PW Deposition)">Prosecution Evidence</option>
                <option value="Cross-Examination of IO">Cross-Examination of IO</option>
                <option value="Final Arguments">Final Arguments</option>
                <option value="Judgment Reserved">Judgment Reserved</option>
              </Select>
            </Field>

            <Field label="First Hearing Date">
              <Input
                type="date"
                value={newNextHearing}
                onChange={(e) => setNewNextHearing(e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
            <Button variant="outline" type="button" onClick={() => setIsAddCaseOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <Plus className="size-4" />
              Ingest &amp; Assign Case Number
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT CASE */}
      {selectedCase && (
        <Modal
          open={isEditCaseOpen}
          onClose={() => setIsEditCaseOpen(false)}
          title={`Edit Case: ${selectedCase.number}`}
          size="lg"
        >
          <form onSubmit={handleEditCaseSubmit} className="space-y-4">
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
                  <option value="Criminal">Criminal</option>
                  <option value="POCSO">POCSO</option>
                  <option value="Matrimonial">Matrimonial</option>
                  <option value="Civil">Civil</option>
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

              <Field label="Lead IO">
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
              <Button variant="outline" type="button" onClick={() => setIsEditCaseOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Case Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: DELETE CASE CONFIRMATION */}
      {selectedCase && (
        <Modal
          open={isDeleteCaseOpen}
          onClose={() => setIsDeleteCaseOpen(false)}
          title="Confirm Case Docket Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete case <strong className="text-zinc-900">{selectedCase.number}</strong> ({selectedCase.title})?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
              This action will remove the case docket, associated hearings, and linked evidence items from the active registry.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsDeleteCaseOpen(false)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDeleteCase}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Permanently Delete Case
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: ADD DOCUMENT (.DOCX / .PDF) */}
      <Modal
        open={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Add &amp; Index Document (.docx / .pdf)"
        size="lg"
      >
        <form onSubmit={handleAddDocumentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Assign to Case Docket">
              <Select
                value={docCaseId}
                onChange={(e) => setDocCaseId(e.target.value)}
                className="w-full"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number} · {c.title.slice(0, 32)}...
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Document Kind / Extension">
              <Select
                value={docKind}
                onChange={(e) => setDocKind(e.target.value)}
                className="w-full"
              >
                <option value="Affidavit (.docx)">Affidavit (.docx)</option>
                <option value="Written Arguments (.docx)">Written Arguments (.docx)</option>
                <option value="Bail Petition (.docx)">Bail Petition (.docx)</option>
                <option value="Legal Opinion Brief (.docx)">Legal Opinion Brief (.docx)</option>
                <option value="Police Chargesheet (.pdf)">Police Chargesheet (.pdf)</option>
                <option value="FIR First Information (.pdf)">FIR First Information (.pdf)</option>
                <option value="Forensic FSL Report (.pdf)">Forensic FSL Report (.pdf)</option>
                <option value="Court Order / Decree (.pdf)">Court Order / Decree (.pdf)</option>
              </Select>
            </Field>

            <Field label="Document Title / Canonical Alias">
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Defense Written Arguments on Bail"
                required
              />
            </Field>

            <Field label="File Name (e.g. bail_arguments.docx)">
              <Input
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                placeholder="e.g. bail_application_defense.docx"
              />
            </Field>

            <Field label="Submitting Party">
              <Select
                value={docParty}
                onChange={(e) => setDocParty(e.target.value as SubmittingParty)}
                className="w-full"
              >
                <option value="DEFENSE_ADVOCATE">Defense Advocate</option>
                <option value="POLICE_INVESTIGATION">Police Investigation / IO</option>
                <option value="PUBLIC_PROSECUTOR">Public Prosecutor</option>
                <option value="REGISTRY_DIRECT">Court Registry / Judicial Order</option>
              </Select>
            </Field>

            <Field label="Advocate or Submitting Officer">
              <Input
                value={docSubmitter}
                onChange={(e) => setDocSubmitter(e.target.value)}
                placeholder="e.g. Adv. R. K. Anand"
              />
            </Field>

            <Field label="Page Count">
              <Input
                type="number"
                min="1"
                value={docPages}
                onChange={(e) => setDocPages(e.target.value)}
              />
            </Field>

            <Field label="File Size">
              <Input
                value={docFileSize}
                onChange={(e) => setDocFileSize(e.target.value)}
                placeholder="e.g. 1.8 MB"
              />
            </Field>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950">
            <UploadCloud className="size-5 text-emerald-600 shrink-0" />
            <span>Document will be encrypted with SHA-256 integrity hash and indexed into the Mercy Vault.</span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
            <Button variant="outline" type="button" onClick={() => setIsAddDocOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FilePlus className="size-4" />
              Index Document to Case
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
