import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Gavel,
  Shield,
  Calendar,
  Sparkles,
  FileText,
  Printer,
  Plus,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  Users,
  CheckSquare,
  Square,
  FolderOpen,
  FileSearch,
  Scale,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  Building,
  Upload,
  UserPlus,
  Eye,
  BookOpen,
} from 'lucide-react'
import {
  judicialStore,
  type FullCaseRecord,
  type PunishmentType,
  type WeaponRecord,
  type DocumentRecord,
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  type SubmittingParty,
} from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  Modal,
  PageHeader,
  Tag,
  StatusChip,
  Field,
  Input,
  Select,
  useApp,
} from '../ui'

type CaseTab = 'case-file' | 'facts-issues' | 'evidence' | 'law-arguments' | 'judgment-prep'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const caseItem = judicialStore.getCase(id || '')

  const [activeTab, setActiveTab] = useState<CaseTab>('case-file')

  // Modals state
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [addDocModalOpen, setAddDocModalOpen] = useState(false)
  const [addProfileModalOpen, setAddProfileModalOpen] = useState(false)
  const [addWeaponModalOpen, setAddWeaponModalOpen] = useState(false)
  const [aiReportGenerated, setAiReportGenerated] = useState(true)

  // Close Case form state
  const [judgmentText, setJudgmentText] = useState(
    'Upon careful appreciation of the ballistic evidence, forensic recoveries under Section 27 (now Sec. 23 BSA), and eye-witness testimony, the prosecution has established the guilt of the accused beyond reasonable doubt. The accused is accordingly convicted under Section 103 BNS and Section 25 Arms Act.'
  )
  const [sentenceType, setSentenceType] = useState<PunishmentType>('LIFE_IMPRISONMENT')
  const [durationYears, setDurationYears] = useState(20)
  const [fineAmount, setFineAmount] = useState(25000)
  const [operativeDecree, setOperativeDecree] = useState(
    'Sentenced to undergo Imprisonment for Life and to pay a fine of Rs. 25,000, in default to undergo further rigorous imprisonment of 6 months.'
  )

  // Schedule Hearing form state
  const [hearingDate, setHearingDate] = useState('2026-10-24')
  const [hearingTime, setHearingTime] = useState('11:30')
  const [hearingStage, setHearingStage] = useState('Defense Cross-Examination of PW-1 & Forensic Expert')
  const [hearingHall, setHearingHall] = useState('Hall 04 (Main Sessions)')

  // Add Document form state
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Evidence files and evidence index')
  const [docTitle, setDocTitle] = useState('')
  const [docFileName, setDocFileName] = useState('')
  const [docParty, setDocParty] = useState<SubmittingParty>('POLICE_INVESTIGATION')
  const [docSubmitter, setDocSubmitter] = useState('')
  const [docPages, setDocPages] = useState('8')
  const [docOcrText, setDocOcrText] = useState('')

  // Add Profile form state
  const [partyRole, setPartyRole] = useState<FullCaseRecord['parties'][0]['role']>('Accused')
  const [partyName, setPartyName] = useState('')
  const [partyCrimId, setPartyCrimId] = useState('')
  const [partyLawyerBar, setPartyLawyerBar] = useState('')
  const [partyCustody, setPartyCustody] = useState<'In custody' | 'On bail' | 'Absconding' | 'Not applicable'>('In custody')

  // Add Weapon form state
  const [weaponType, setWeaponType] = useState<WeaponRecord['type']>('FIREARM')
  const [weaponMakeModel, setWeaponMakeModel] = useState('')
  const [weaponSerial, setWeaponSerial] = useState('')
  const [weaponRecoveryMemo, setWeaponRecoveryMemo] = useState('')
  const [weaponRecoveryDate, setWeaponRecoveryDate] = useState('2025-02-09')
  const [weaponRecoveryPlace, setWeaponRecoveryPlace] = useState('Shrubbery near Ring Road')
  const [weaponBallisticStatus, setWeaponBallisticStatus] = useState<WeaponRecord['ballisticStatus']>('MATCHED')

  if (!caseItem) {
    return (
      <Card className="m-6 p-8">
        <div className="text-center py-8">
          <h3 className="text-base font-bold text-foreground">Case file not found</h3>
          <p className="text-xs text-zinc-500 mt-1">No case matches number "{id}".</p>
          <Link to="/cases" className="inline-block mt-4">
            <Button variant="coral" size="sm">Return to Case Directory</Button>
          </Link>
        </div>
      </Card>
    )
  }

  // Checked document categories: default to existing or initialized
  const checkedCategories = caseItem.checkedDocCategories || [
    'Evidence files and evidence index',
    'Complaint / FIR',
    'Charge sheet / final report, if applicable',
  ]
  const primaryAccused = caseItem.parties.find((p) => p.role === 'Accused')

  const handleToggleCategory = (category: string) => {
    judicialStore.toggleDocCategory(caseItem.id, category)
  }

  const handleCloseCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    judicialStore.closeCaseWithAutoDocumentation({
      caseId: caseItem.id,
      judgmentText,
      punishments: [
        {
          convictName: primaryAccused?.name || 'Primary Accused',
          crimId: primaryAccused?.crimId || 'CRIM-BENCH-CONVICT',
          type: sentenceType,
          durationMonths: durationYears * 12,
          fineAmountInr: fineAmount,
          operativeDecree,
        },
      ],
    })
    toast('Case closed! Auto-Documentation generated & saved to cloud.', 'ok')
    setCloseModalOpen(false)
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    judicialStore.scheduleHearing({
      caseId: caseItem.id,
      date: hearingDate,
      time: hearingTime,
      stage: hearingStage,
      courtHall: hearingHall,
      judge: caseItem.judge,
      setAlarm: true,
      alarmUrgency: 'WARNING',
    })
    toast(`Hearing scheduled for ${hearingDate} at ${hearingTime}`, 'ok')
    setScheduleModalOpen(false)
  }

  const handleAddDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle.trim()) {
      toast('Document title is required', 'bad')
      return
    }
    judicialStore.addDocumentToCase(
      caseItem.id,
      {
        caseId: caseItem.id,
        caseNumber: caseItem.number,
        canonicalName: docTitle,
        originalFileName: docFileName || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        submittingParty: docParty,
        advocateOrOfficer: docSubmitter || caseItem.io.name,
        submissionDate: new Date().toISOString().slice(0, 10),
        fileSize: '2.4 MB',
        pages: parseInt(docPages, 10) || 5,
        kind: docCategory,
        sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        ocrExcerpt: docOcrText || `Official court filing under category [${docCategory}]: ${docTitle}. Verified under Bharatiya Sakshya Adhiniyam, 2023.`,
      },
      docCategory
    )
    toast(`Document "${docTitle}" added under ${docCategory}`, 'ok')
    setAddDocModalOpen(false)
    setDocTitle('')
    setDocFileName('')
    setDocOcrText('')
  }

  const handleAddProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!partyName.trim()) {
      toast('Profile name is required', 'bad')
      return
    }
    judicialStore.addPartyToCase(caseItem.id, {
      role: partyRole,
      name: partyName,
      crimId: partyCrimId || undefined,
      lawyerBar: partyLawyerBar || undefined,
      custody: partyCustody,
    })
    toast(`Added profile: ${partyName} (${partyRole})`, 'ok')
    setAddProfileModalOpen(false)
    setPartyName('')
    setPartyCrimId('')
    setPartyLawyerBar('')
  }

  const handleAddWeaponSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!weaponMakeModel.trim()) {
      toast('Make & model required', 'bad')
      return
    }
    judicialStore.addWeaponToCase(caseItem.id, {
      type: weaponType,
      makeModel: weaponMakeModel,
      serialNumber: weaponSerial || 'N/A (Defaced)',
      recoveryMemo: weaponRecoveryMemo || `Recovery Memo under Sec. 23 BSA / Sec. 27 IEA`,
      recoveryDate: weaponRecoveryDate,
      recoveryPlace: weaponRecoveryPlace,
      ballisticStatus: weaponBallisticStatus,
      notes: `Seized weapon admitted into evidence. Ballistic examination: ${weaponBallisticStatus}.`,
    })
    toast(`Weapon "${weaponMakeModel}" registered to case`, 'ok')
    setAddWeaponModalOpen(false)
    setWeaponMakeModel('')
    setWeaponSerial('')
    setWeaponRecoveryMemo('')
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Court Identifier */}
      <div className="flex items-center justify-between">
        <Link
          to="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Return to Active Case Files</span>
        </Link>
        <span className="px-3.5 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
          Court 04 · {caseItem.court}
        </span>
      </div>

      {/* Case Header & Quick Action Buttons */}
      <PageHeader
        title={caseItem.number}
        sub={caseItem.title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!caseItem.isClosed ? (
              <>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-white hover:bg-zinc-100 border border-black/[0.08] text-xs font-bold text-zinc-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="size-3.5 text-zinc-600" />
                  <span>Schedule Hearing</span>
                </button>
                <Link to={`/research?case=${caseItem.id}`}>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-white hover:bg-zinc-100 border border-black/[0.08] text-xs font-bold text-zinc-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="size-3.5 text-[#FF5C5C]" />
                    <span>AI Precedents</span>
                  </button>
                </Link>
                <Link to="/law-reference">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-white hover:bg-zinc-100 border border-black/[0.08] text-xs font-bold text-zinc-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Scale className="size-3.5 text-zinc-600" />
                    <span>Verify Law</span>
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#121316] hover:bg-zinc-800 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Gavel className="size-3.5 text-[#FF5C5C]" />
                  <span>Pronounce Judgment</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Case Closed &amp; Disposed
                </span>
                <Link to={`/print/${caseItem.id}`}>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-[#121316] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-zinc-800 transition-colors"
                  >
                    <Printer className="size-3.5" />
                    <span>View Printable Decree</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        }
      />

      {/* Case File Structure Navigation Tabs (Matching User Specification 1 to 5) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-black/[0.06] shadow-xs">
        {[
          { key: 'case-file', label: '1. Complete Case File & Checklist' },
          { key: 'facts-issues', label: '2. Facts & Issues' },
          { key: 'evidence', label: '3. Evidence & Admissibility' },
          { key: 'law-arguments', label: '4. Law & Legal Arguments' },
          { key: 'judgment-prep', label: '5. Judgment Preparation & AI Draft' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as CaseTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#121316] text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Closure Banner if closed */}
      {caseItem.isClosed && caseItem.closureRecord && (
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span>Auto-Documentation Complete: Final Judgment Order Generated</span>
            </div>
            <Link to={`/print/${caseItem.id}`}>
              <Button variant="outline" size="sm" className="bg-white">
                Open Printable Decree
              </Button>
            </Link>
          </div>
          <div className="text-xs text-emerald-800/80 space-y-0.5 pt-1">
            <div>Closed on: {caseItem.closureRecord.closedDate} · Cloud Snapshot: {caseItem.closureRecord.cloudSnapshotUri}</div>
            <div className="text-[11px] font-mono break-all">SHA-256 Checksum: {caseItem.closureRecord.decreeHash}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: COMPLETE CASE FILE & 8-CATEGORY DOCUMENT CHECKLIST                 */}
      {/* ========================================================================= */}
      {activeTab === 'case-file' && (
        <div className="space-y-6">
          {/* THE 8-DOCUMENT CATEGORY CHECKLIST (Explicitly Requested by User) */}
          <Card className="p-6 bg-white space-y-4 shadow-sm border border-black/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                    Case Documents &amp; Evidence Index Checklist
                  </h3>
                  <span className="px-3 py-0.5 rounded-full bg-[#FEF08A] text-amber-950 text-xs font-black">
                    {checkedCategories.length} of {DOCUMENT_CATEGORIES.length} document categories checked
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Check off verified dockets or click to add documents, suspect profiles, or weapons to the master case file.
                </p>
              </div>

              {/* Action Buttons to Add All Docs, Profile, Weapon */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddDocModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5 text-[#FF5C5C]" />
                  <span>Add Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddProfileModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="size-3.5 text-blue-600" />
                  <span>Add Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddWeaponModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Crosshair className="size-3.5 text-amber-600" />
                  <span>Add Weapon</span>
                </button>
              </div>
            </div>

            {/* The 8 Interactive Document Categories */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {DOCUMENT_CATEGORIES.map((cat, idx) => {
                const isChecked = checkedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 group ${
                      isChecked
                        ? 'bg-[#F7F4EB] border-black/15 shadow-xs'
                        : 'bg-zinc-50/70 border-black/[0.05] hover:bg-zinc-100/70'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="size-4.5 text-[#FF5C5C]" />
                      ) : (
                        <Square className="size-4.5 text-zinc-400 group-hover:text-zinc-600" />
                      )}
                    </div>
                    <div>
                      <span className={`text-xs block leading-snug ${isChecked ? 'font-black text-zinc-900' : 'font-medium text-zinc-600'}`}>
                        {cat}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold block mt-1">
                        Category 0{idx + 1} · {isChecked ? 'Verified in File' : 'Pending Docket'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* 4 Pastel Bento Quadrants */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Quadrant 1: Investigating Officers & Police Station */}
            <Card className="p-6 space-y-4 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Investigating Officers &amp; Station Diary
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-bold">
                  Police Origin
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-[#DBEAFE] text-blue-950 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-800/80 block">Lead Investigator</span>
                    <span className="text-sm font-extrabold text-blue-950">{caseItem.io.name}</span>
                    <div className="text-[11px] opacity-80 mt-0.5">{caseItem.io.rank}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-blue-800/80 block">Badge ID</span>
                    <span className="text-sm font-extrabold text-[#FF5C5C]">{caseItem.io.badge}</span>
                    <div className="text-[11px] opacity-80 mt-0.5">{caseItem.io.phone}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F7F4EB]">
                    <span className="text-zinc-500">Police Station:</span>
                    <span className="font-semibold text-zinc-900 text-right">{caseItem.policeStation}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F7F4EB]">
                    <span className="text-zinc-500">FIR Reference:</span>
                    <span className="font-semibold text-zinc-900">No. {caseItem.fir.no} · Dated {caseItem.fir.date}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F7F4EB]">
                    <span className="text-zinc-500">Charge Sheet Record:</span>
                    <span className="font-semibold text-zinc-900">{caseItem.io.chargesheetRef}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-2xl bg-[#F7F4EB]">
                    <span className="text-zinc-500">Trial Stage:</span>
                    <span className="font-bold text-[#FF5C5C]">{caseItem.stage}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quadrant 2: Parties Involved & Victims */}
            <Card className="p-6 space-y-4 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Parties Involved &amp; Victims
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddProfileModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" /> Add Profile
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Victims highlight box */}
                <div className="p-4 rounded-2xl bg-[#FCE7F3] text-pink-950 space-y-1.5">
                  <div className="flex justify-between font-bold text-xs">
                    <span>Victim Information:</span>
                    <span>{caseItem.victims.minors} Minors · {caseItem.victims.adults} Adults</span>
                  </div>
                  {caseItem.victims.details.map((v, i) => (
                    <div key={i} className="flex justify-between text-xs pt-1 border-t border-pink-200/60">
                      <span className="font-semibold">• {v.name} ({v.age} Yrs)</span>
                      <span className="text-[11px] opacity-80">{v.relationship}</span>
                    </div>
                  ))}
                </div>

                {/* Parties List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {caseItem.parties.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#F7F4EB] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{p.name}</span>
                          {p.crimId && (
                            <Link
                              to={`/criminals/${p.crimId}`}
                              className="text-[11px] font-bold text-[#FF5C5C] hover:underline"
                            >
                              ({p.crimId})
                            </Link>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {p.role} {p.lawyerBar && `· Bar: ${p.lawyerBar}`}
                        </div>
                      </div>

                      <div>
                        {p.custody && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                              p.custody === 'In custody'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {p.custody}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Quadrant 3: Weapons Used at the Scene */}
            <Card className="p-6 space-y-4 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Weapons Used at Scene &amp; Seizures ({caseItem.weapons.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddWeaponModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" /> Add Weapon
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {caseItem.weapons.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl bg-[#FEF3C7] text-amber-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{w.makeModel}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/80 text-[10px] font-bold">
                        {w.ballisticStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] opacity-80">
                      <div>Serial: {w.serialNumber}</div>
                      <div>Type: {w.type}</div>
                      <div>Recovered: {w.recoveryDate}</div>
                      <div>Location: {w.recoveryPlace}</div>
                    </div>
                    <div className="text-[11px] pt-1 border-t border-amber-300/60 font-medium">
                      Memo: {w.recoveryMemo}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quadrant 4: Admitted Evidence & Chain of Custody */}
            <Card className="p-6 space-y-4 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Admitted Evidence Exhibits ({caseItem.evidence.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddDocModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="size-3" /> Add Exhibit
                </button>
              </div>

              <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
                {caseItem.evidence.map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded-2xl bg-[#F7F4EB] border border-black/[0.04] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-white font-bold text-[10.5px]">
                          {ev.code}
                        </span>
                        <span className="font-extrabold text-xs text-zinc-900">{ev.title}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {ev.admission}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-[11px] leading-relaxed">
                      {ev.detail}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] text-zinc-500 pt-1 border-t border-zinc-200/60">
                      <div>Officer: {ev.custodyOfficer}</div>
                      <div>Lab: {ev.labStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FACTS AND ISSUES                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'facts-issues' && (
        <div className="space-y-6">
          {/* Section 2.1: What Happened and When? */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  What Happened and When? (Chronological Case Narrative)
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Verified facts of the alleged offense, police FIR registration, and arrests.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                Occurred: {caseItem.fir.date}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F4EB] text-xs leading-relaxed space-y-3 text-zinc-800 font-medium">
              <p>
                On <strong className="text-black">{caseItem.fir.date}</strong> at approximately 18:40 hours, the complainant reported an incident occurring within the jurisdiction of <strong className="text-black">{caseItem.policeStation}</strong>. Three armed perpetrators reportedly entered the establishment with intent to commit aggravated robbery under Section 309 BNS.
              </p>
              <p>
                FIR No. <strong className="text-black">{caseItem.fir.no}</strong> was registered upon the statement of the complainant PW-1. Investigating Officer <strong className="text-black">{caseItem.io.name} ({caseItem.io.badge})</strong> dispatched patrol units and secured the crime scene, collecting forensic swabs and CCTV DVR extracts.
              </p>
              <p>
                On 09 Feb 2025, accused <strong className="text-black">{primaryAccused?.name || 'Primary Accused'}</strong> was apprehended. Pursuant to disclosure statement recorded under Section 23 of the Bharatiya Sakshya Adhiniyam, 2023 (formerly Section 27 Indian Evidence Act), weapons including a country-made firearm and stolen property were seized.
              </p>
            </div>
          </Card>

          {/* Section 2.2: Agreed Upon vs Disputed Facts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-white space-y-3">
              <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Facts Agreed Upon by Both Sides
                </h3>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/50 text-emerald-900 font-medium">
                  • The occurrence of an armed robbery at the complainant's shop on {caseItem.fir.date} is not in dispute.
                </li>
                <li className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/50 text-emerald-900 font-medium">
                  • FIR No. {caseItem.fir.no} was lodged promptly within 2 hours of the incident without undue delay.
                </li>
                <li className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/50 text-emerald-900 font-medium">
                  • The weapon (Exhibit EX-P-1) was forwarded to the Central Forensic Science Laboratory (CFSL) by the IO.
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-white space-y-3">
              <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
                <AlertTriangle className="size-4 text-rose-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-950">
                  Facts Disputed by Parties
                </h3>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50 text-rose-900 font-medium">
                  • <strong>Identification of Accused:</strong> Defense contends that no Test Identification Parade (TIP) was conducted, rendering dock identification questionable.
                </li>
                <li className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50 text-rose-900 font-medium">
                  • <strong>Voluntariness of Disclosure:</strong> Defense alleges that disclosure memo under Sec. 23 BSA was procured under custodial coercion without independent witnesses.
                </li>
                <li className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50 text-rose-900 font-medium">
                  • <strong>Electronic Certificate:</strong> CCTV DVR transcript lacks the mandatory Section 63 BSA certificate signed by the system custodian.
                </li>
              </ul>
            </Card>
          </div>

          {/* Section 2.3: Questions the Judge Must Decide */}
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-purple-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Questions the Judge Must Decide (Points for Determination)
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                Order XX Rule 4 CPC / Sec. 354 CrPC
              </span>
            </div>

            <div className="grid gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] flex items-start gap-3">
                <span className="size-6 rounded-full bg-[#121316] text-white text-xs font-bold grid place-items-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-zinc-900 block">Whether the prosecution has established the identity of the accused beyond reasonable doubt?</strong>
                  <span className="text-zinc-500 font-medium text-[11px]">Evaluating eyewitness testimony PW-1 against absence of formal TIP.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] flex items-start gap-3">
                <span className="size-6 rounded-full bg-[#121316] text-white text-xs font-bold grid place-items-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-zinc-900 block">Whether the recovery of the firearm satisfies Section 23 of the Bharatiya Sakshya Adhiniyam, 2023?</strong>
                  <span className="text-zinc-500 font-medium text-[11px]">Testing mahazar witness credibility, disclosure nexus, and concealment place accessibility.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] flex items-start gap-3">
                <span className="size-6 rounded-full bg-[#121316] text-white text-xs font-bold grid place-items-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-zinc-900 block">Whether the electronic CCTV footage is legally admissible without a Section 63 BSA certificate?</strong>
                  <span className="text-zinc-500 font-medium text-[11px]">Applying Supreme Court precedents in Arjun Panditrao &amp; Anvar P.V. principles.</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EVIDENCE & ADMISSIBILITY (BSA 2023)                                */}
      {/* ========================================================================= */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Evidence Admissibility Audit (Bharatiya Sakshya Adhiniyam, 2023)
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Inspection of documents, photos, CCTV, digital records, witness testimony, and forensic reports.
                </p>
              </div>
              <a
                href="https://www.indiacode.nic.in/handle/123456789/20063"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>India Code: BSA 2023</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Evidence Table with Document and Page References */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#F7F4EB]/60">
                    <th className="p-3 font-bold text-zinc-500">EXHIBIT CODE</th>
                    <th className="p-3 font-bold text-zinc-500">ITEM &amp; DOCUMENT TITLE</th>
                    <th className="p-3 font-bold text-zinc-500">PAGE REF</th>
                    <th className="p-3 font-bold text-zinc-500">CATEGORY</th>
                    <th className="p-3 font-bold text-zinc-500">ADMISSIBILITY UNDER BSA 2023</th>
                    <th className="p-3 font-bold text-zinc-500">LAB / CHAIN STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {caseItem.evidence.map((ev, i) => (
                    <tr key={ev.id} className="border-b border-black/[0.04] hover:bg-[#F7F4EB]/30">
                      <td className="p-3 font-mono font-bold text-zinc-900">{ev.code}</td>
                      <td className="p-3">
                        <div className="font-bold text-zinc-900">{ev.title}</div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-sm">{ev.detail}</div>
                      </td>
                      <td className="p-3 font-mono text-zinc-600">Dkt. 1, p. {14 + i * 8}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10.5px] font-bold">
                          {ev.kind}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                          {ev.admission === 'admitted' ? 'Admitted (Sec. 61 BSA)' : 'Marked for Identification'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-zinc-700">
                        {ev.labStatus} (Officer: {ev.custodyOfficer})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Forensic & Ballistics Assessment Card */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-white space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 pb-2 border-b border-black/[0.06]">
                Ballistic &amp; Medical Forensic Reports
              </h3>
              <div className="p-4 rounded-2xl bg-[#FEF3C7] text-xs text-amber-950 space-y-2 font-medium">
                <div className="flex justify-between font-bold">
                  <span>CFSL Ballistic Examination Report:</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[10px]">FSL/2025/B-918</span>
                </div>
                <p>
                  Microscopic comparison of striker marks and breech-face impressions establishes that the recovered empty cartridge casing EX-P-3 was discharged through the country-made pistol EX-P-1 recovered from Accused 1.
                </p>
                <div className="text-[11px] pt-1 border-t border-amber-300/60 opacity-90">
                  Expert Witness: Dr. K. Ramanathan, Deputy Director (Ballistics), CFSL Delhi.
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 pb-2 border-b border-black/[0.06]">
                Witness Testimony &amp; Cross-Examination Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F4EB] border border-black/[0.04]">
                  <strong className="text-zinc-900 block">PW-1 (Complainant / Store Owner):</strong>
                  <p className="text-zinc-600 mt-0.5 text-[11.5px]">
                    Deposed regarding the armed trespass, intimidation, and valuation of stolen goods. Stood firm in cross-examination regarding physical description of the assailant.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F4EB] border border-black/[0.04]">
                  <strong className="text-zinc-900 block">PW-2 (Recovery Mahazar Witness):</strong>
                  <p className="text-zinc-600 mt-0.5 text-[11.5px]">
                    Corroborated recovery of weapon from bushes near Ring Road. Admitted under cross that he did not see the weapon until police retrieved it.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LAW AND LEGAL ARGUMENTS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'law-arguments' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Applicable Statutory Laws &amp; Legal Sections
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Codified penal statutory ingredients and appellate standards of proof.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-bold">
                Standard: Beyond Reasonable Doubt
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] space-y-1.5 text-xs">
                <span className="font-bold text-[#FF5C5C] text-sm">Sec. 103 BNS</span>
                <span className="text-[11px] text-zinc-400 block font-semibold">(Sec. 302 IPC equivalent)</span>
                <p className="text-zinc-700 font-medium leading-relaxed">
                  Punishment for murder. Requires proof of intentional infliction of bodily injury sufficient in ordinary course of nature to cause death.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] space-y-1.5 text-xs">
                <span className="font-bold text-amber-700 text-sm">Sec. 309 BNS</span>
                <span className="text-[11px] text-zinc-400 block font-semibold">(Sec. 392 IPC equivalent)</span>
                <p className="text-zinc-700 font-medium leading-relaxed">
                  Robbery and armed extortion. Requires proof of wrongful restraint, putting victim in fear of instant death or hurt.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] space-y-1.5 text-xs">
                <span className="font-bold text-blue-700 text-sm">Sec. 25 Arms Act</span>
                <span className="text-[11px] text-zinc-400 block font-semibold">Unlicensed Firearm</span>
                <p className="text-zinc-700 font-medium leading-relaxed">
                  Possession of prohibited arms or ammunition without valid license under the Arms Act, 1959.
                </p>
              </div>
            </div>
          </Card>

          {/* Arguments from Both Sides */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-white space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-950 pb-2 border-b border-black/[0.06]">
                Arguments by Public Prosecutor (State)
              </h3>
              <div className="space-y-2 text-xs font-medium text-zinc-800">
                <p className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/50">
                  1. <strong>Direct Eyewitness:</strong> PW-1 had clear opportunity to observe the accused at point-blank range in well-illuminated shop premises.
                </p>
                <p className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/50">
                  2. <strong>Ballistic Match:</strong> Striated cartridge matched the seized 9mm pistol conclusively under Section 39 of the Bharatiya Sakshya Adhiniyam.
                </p>
                <p className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/50">
                  3. <strong>Exclusive Knowledge:</strong> The weapon was recovered from concealed shrubbery solely upon confidential disclosure by the accused under Section 23 BSA.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-white space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-950 pb-2 border-b border-black/[0.06]">
                Arguments by Defense Counsel
              </h3>
              <div className="space-y-2 text-xs font-medium text-zinc-800">
                <p className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50">
                  1. <strong>Absence of TIP:</strong> Failure to conduct Test Identification Parade leaves dock identification vulnerable to coaching and prejudice.
                </p>
                <p className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50">
                  2. <strong>Accessible Spot:</strong> Shrubbery near Ring Road was an open public area, weakening inference of exclusive possession by the accused.
                </p>
                <p className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/50">
                  3. <strong>Hostile Witnesses:</strong> Independent panchas admitted that their signatures were obtained on pre-printed forms at the police station.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: JUDGMENT PREPARATION & AI DRAFT JUDGMENT (ORDER XX CPC)            */}
      {/* ========================================================================= */}
      {activeTab === 'judgment-prep' && (
        <div className="space-y-6">
          {/* Official Reference Banner */}
          <div className="p-4.5 rounded-3xl bg-amber-50/90 border border-amber-200/70 flex items-start justify-between gap-4 shadow-xs text-xs">
            <div className="flex items-start gap-3">
              <Scale className="size-5 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase tracking-wide text-amber-950 block mb-0.5">
                  Order XX Code of Civil Procedure &amp; Section 354 CrPC Legal Standards
                </span>
                <p className="text-amber-900/90 leading-relaxed font-medium">
                  A formal judgment must contain: (1) Concise statement of the case, (2) Points for determination, (3) Decision thereon, and (4) The reasons for such decision. AI assistant provides a draft structure to support the presiding judge, who independently assesses the evidence and delivers final judgment.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
              <a
                href="https://www.indiacode.nic.in/handle/123456789/2191"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100/50 inline-flex items-center gap-1.5"
              >
                <span>India Code: CPC Order XX</span>
                <ExternalLink className="size-3" />
              </a>
              <a
                href="https://www.indiacode.nic.in/handle/123456789/20063"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100/50 inline-flex items-center gap-1.5"
              >
                <span>India Code: BSA 2023</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {/* AI Case Review & Draft Judgment Report (All 9 Sections) */}
          <Card className="p-6 bg-white space-y-6 shadow-sm border border-black/[0.06]">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-[#121316] text-white grid place-items-center">
                  <Sparkles className="size-5 text-[#FF5C5C]" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                    Comprehensive AI Case Review &amp; Draft Judgment Structure
                  </h3>
                  <div className="text-xs text-zinc-500 font-medium">
                    Synthesized from verified case dockets, admitted exhibits, and statutory repositories
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCloseModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#121316] hover:bg-zinc-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Gavel className="size-3.5 text-[#FF5C5C]" />
                <span>Adopt Draft &amp; Close Case</span>
              </button>
            </div>

            {/* The 9 Canonical Sections Generated for the Judge */}
            <div className="space-y-5 text-xs font-sans">
              {/* Section 1: Case Summary */}
              <div className="p-4.5 rounded-2xl bg-[#F7F4EB] border border-black/[0.04] space-y-1.5">
                <div className="font-black text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#FF5C5C]" />
                  1. Case Summary
                </div>
                <p className="text-zinc-800 leading-relaxed font-medium">
                  State represented by the Public Prosecutor has brought trial proceedings against the accused {primaryAccused?.name || 'Accused'} for offenses punishable under Section 103 &amp; Section 309 of Bharatiya Nyaya Sanhita, 2023, along with Section 25 of the Arms Act. The case arises out of armed robbery and assault committed at the complainant's establishment on {caseItem.fir.date}, culminating in recovery of unlicensed firearms and stolen valuables.
                </p>
              </div>

              {/* Section 2: Timeline of Events */}
              <div className="p-4.5 rounded-2xl bg-white border border-black/[0.06] space-y-2">
                <div className="font-black text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Clock className="size-3.5 text-zinc-500" />
                  2. Timeline of Events
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                  <div className="p-3 rounded-xl bg-zinc-50">
                    <span className="font-bold text-[#FF5C5C] block text-[11px]">03 Feb 2025</span>
                    <span className="text-zinc-900 font-semibold block mt-0.5">Offense Committed</span>
                    <span className="text-zinc-500 text-[10.5px]">FIR registered at {caseItem.policeStation}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50">
                    <span className="font-bold text-zinc-700 block text-[11px]">09 Feb 2025</span>
                    <span className="text-zinc-900 font-semibold block mt-0.5">Apprehension &amp; Recovery</span>
                    <span className="text-zinc-500 text-[10.5px]">Pistol seized under Section 23 BSA</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50">
                    <span className="font-bold text-zinc-700 block text-[11px]">02 May 2025</span>
                    <span className="text-zinc-900 font-semibold block mt-0.5">Charge Sheet Filed</span>
                    <span className="text-zinc-500 text-[10.5px]">Cognizance taken by Committal Magistrate</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50">
                    <span className="font-bold text-emerald-700 block text-[11px]">Present Term</span>
                    <span className="text-zinc-900 font-semibold block mt-0.5">Final Arguments Complete</span>
                    <span className="text-zinc-500 text-[10.5px]">Reserved for judgment pronouncement</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Claims of Both Parties */}
              <div className="p-4.5 rounded-2xl bg-white border border-black/[0.06] space-y-2">
                <div className="font-black text-xs uppercase tracking-wider text-zinc-900">
                  3. Claims of Both Parties
                </div>
                <div className="grid gap-3 md:grid-cols-2 pt-1">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/50">
                    <strong className="text-blue-950 block mb-1">Complainant / Prosecution Claims:</strong>
                    <p className="text-blue-900 leading-relaxed font-medium">
                      The accused actively brandished weapon EX-P-1, intimidated store staff, and fled with valuables. Identification in court is corroborated by recovery memo and ballistic match.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/50">
                    <strong className="text-rose-950 block mb-1">Accused / Defense Claims:</strong>
                    <p className="text-rose-900 leading-relaxed font-medium">
                      False implication due to prior dispute. Weapon was planted by police from unverified open area. Dock identification is inadmissible without a contemporaneous TIP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Evidence Table with Document & Page References */}
              <div className="p-4.5 rounded-2xl bg-[#F7F4EB] border border-black/[0.04] space-y-2">
                <div className="font-black text-xs uppercase tracking-wider text-zinc-900">
                  4. Evidence Table with Document &amp; Page References
                </div>
                <div className="overflow-x-auto bg-white rounded-xl border border-black/[0.05]">
                  <table className="w-full text-left border-collapse text-[11.5px]">
                    <thead>
                      <tr className="border-b border-black/[0.06] bg-zinc-50">
                        <th className="p-2.5 font-bold">EXHIBIT</th>
                        <th className="p-2.5 font-bold">SOURCE DOCKET</th>
                        <th className="p-2.5 font-bold">PAGE NO.</th>
                        <th className="p-2.5 font-bold">EVIDENTIARY PURPOSE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black/[0.04]">
                        <td className="p-2.5 font-mono font-bold">EX-P-1</td>
                        <td className="p-2.5">Recovery Mahazar under Sec. 23 BSA</td>
                        <td className="p-2.5 font-mono text-zinc-500">Vol. I, p. 14</td>
                        <td className="p-2.5">Proof of firearm possession</td>
                      </tr>
                      <tr className="border-b border-black/[0.04]">
                        <td className="p-2.5 font-mono font-bold">EX-P-2</td>
                        <td className="p-2.5">CCTV DVR Transcript</td>
                        <td className="p-2.5 font-mono text-zinc-500">Vol. I, p. 28</td>
                        <td className="p-2.5">Corroboration of armed entry</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold">EX-P-3</td>
                        <td className="p-2.5">CFSL Ballistics Report</td>
                        <td className="p-2.5 font-mono text-zinc-500">Vol. II, p. 44</td>
                        <td className="p-2.5">Conclusive firing pin match</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Conflicts or Gaps in the Evidence */}
              <div className="p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/50 space-y-1.5">
                <div className="font-black text-xs uppercase tracking-wider text-amber-950 flex items-center gap-2">
                  <AlertTriangle className="size-3.5 text-amber-700" />
                  5. Conflicts or Gaps in the Evidence
                </div>
                <ul className="space-y-1.5 text-amber-900 leading-relaxed font-medium">
                  <li>• <strong>Gap 1:</strong> Prosecution failed to tender Section 63 BSA certificate for CCTV digital storage medium, rendering electronic transcript secondary in nature.</li>
                  <li>• <strong>Gap 2:</strong> Independent panch witness admitted under cross-examination that he did not see the exact shrubbery depression where weapon lay before police recovery.</li>
                </ul>
              </div>

              {/* Section 6: Applicable Laws and Relevant Judgments */}
              <div className="p-4.5 rounded-2xl bg-white border border-black/[0.06] space-y-2">
                <div className="font-black text-xs uppercase tracking-wider text-zinc-900">
                  6. Applicable Laws and Relevant Judgments
                </div>
                <div className="space-y-1.5 text-zinc-800 font-medium">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04]">
                    <strong className="text-zinc-900">State of U.P. v. Deoman Upadhyaya (AIR 1960 SC 1125):</strong>
                    <span className="text-zinc-600 block text-[11px] mt-0.5">Constitutionality and strict standard of recovery memos following custodial disclosure.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04]">
                    <strong className="text-zinc-900">Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020 7 SCC 1):</strong>
                    <span className="text-zinc-600 block text-[11px] mt-0.5">Mandatory certificate under electronic records provisions prior to receiving secondary electronic evidence.</span>
                  </div>
                </div>
              </div>

              {/* Section 7 & 8: Legal Issues & Questions the Judge May Need to Resolve */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.04] space-y-1.5">
                  <div className="font-black text-xs uppercase tracking-wider text-zinc-900">
                    7. Legal Issues Needing Decision
                  </div>
                  <p className="text-zinc-700 leading-relaxed font-medium">
                    Whether absence of s.63 BSA certificate is fatal to prosecution case where direct ocular testimony of PW-1 and ballistic recovery independently prove guilt beyond reasonable doubt.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.04] space-y-1.5">
                  <div className="font-black text-xs uppercase tracking-wider text-zinc-900">
                    8. Questions the Judge May Need to Resolve
                  </div>
                  <p className="text-zinc-700 leading-relaxed font-medium">
                    Can dock identification by the store owner be accepted when corroborated by unimpeached ballistic link connecting the seized weapon to the fired shell?
                  </p>
                </div>
              </div>

              {/* Section 9: Draft Judgment Structure with Reasons and Findings */}
              <div className="p-5 rounded-2xl bg-[#121316] text-white space-y-3">
                <div className="font-black text-xs uppercase tracking-wider text-[#FF5C5C] flex items-center gap-2">
                  <Gavel className="size-4" />
                  9. Draft Judgment Structure with Reasons and Findings (Order XX CPC)
                </div>
                <div className="space-y-2 text-xs text-zinc-300 leading-relaxed font-medium">
                  <p>
                    <strong className="text-white">Point 1 for Determination:</strong> Has the prosecution established the identity of the accused? <strong className="text-emerald-400">Finding: In the Affirmative.</strong> Reason: PW-1 had unhurried opportunity to observe accused; lack of TIP is not fatal when corroborated by physical recovery.
                  </p>
                  <p>
                    <strong className="text-white">Point 2 for Determination:</strong> Is the recovery of weapon proved under Section 23 BSA? <strong className="text-emerald-400">Finding: In the Affirmative.</strong> Reason: IO recovery memo is consistent and corroborated by CFSL ballistic report.
                  </p>
                  <p>
                    <strong className="text-white">Operative Order / Sentencing:</strong> The accused is accordingly convicted under Section 103 &amp; 309 BNS and Section 25 Arms Act, and sentenced to Imprisonment for Life with penal fine of Rs. 25,000.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD DOCUMENT TO CASE FILE (User Specification)                  */}
      {/* ========================================================================= */}
      <Modal
        open={addDocModalOpen}
        onClose={() => setAddDocModalOpen(false)}
        title="Add Document to Complete Case File"
        size="md"
      >
        <form onSubmit={handleAddDocumentSubmit} className="space-y-4 text-xs">
          <Field label="Document Category (1 of 8 Categories)">
            <Select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
              className="w-full text-xs"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Canonical Document Title / Alias">
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Supplementary Witness Statement of PW-2, FSL Ballistic Memo"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Original File Name">
              <Input
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                placeholder="e.g. FSL_Report_2025.pdf"
              />
            </Field>

            <Field label="Page Count">
              <Input
                type="number"
                value={docPages}
                onChange={(e) => setDocPages(e.target.value)}
                placeholder="e.g. 12"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Submitting Party">
              <Select
                value={docParty}
                onChange={(e) => setDocParty(e.target.value as SubmittingParty)}
                className="w-full text-xs"
              >
                <option value="POLICE_INVESTIGATION">Police Investigation</option>
                <option value="DEFENSE_ADVOCATE">Defense Advocate</option>
                <option value="PUBLIC_PROSECUTOR">Public Prosecutor</option>
                <option value="REGISTRY_DIRECT">Court Registry / Judicial Order</option>
              </Select>
            </Field>

            <Field label="Officer or Advocate Name">
              <Input
                value={docSubmitter}
                onChange={(e) => setDocSubmitter(e.target.value)}
                placeholder={caseItem.io.name}
              />
            </Field>
          </div>

          <Field label="Extracted OCR Text / Transcript Snippet">
            <textarea
              rows={3}
              value={docOcrText}
              onChange={(e) => setDocOcrText(e.target.value)}
              className="w-full rounded-2xl border border-black/10 p-3 text-xs focus:border-black font-sans leading-relaxed"
              placeholder="Enter official document transcript or notes under Bharatiya Sakshya Adhiniyam, 2023..."
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddDocModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Save Document to Case File
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: ADD PROFILE / PARTY (User Specification)                         */}
      {/* ========================================================================= */}
      <Modal
        open={addProfileModalOpen}
        onClose={() => setAddProfileModalOpen(false)}
        title="Add Party / Accused / Victim Profile"
        size="md"
      >
        <form onSubmit={handleAddProfileSubmit} className="space-y-4 text-xs">
          <Field label="Profile Role in Case">
            <Select
              value={partyRole}
              onChange={(e) => setPartyRole(e.target.value as any)}
              className="w-full text-xs"
            >
              <option value="Accused">Accused / Defendant</option>
              <option value="Complainant / Offended Party">Complainant / Offended Party</option>
              <option value="Victim">Victim</option>
              <option value="Key Witness">Key Witness (PW/DW)</option>
              <option value="Defense Counsel">Defense Counsel</option>
              <option value="Prosecutor">Public Prosecutor</option>
            </Select>
          </Field>

          <Field label="Full Legal Name">
            <Input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. Vikas Sharma"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Criminal Record ID (Optional)">
              <Input
                value={partyCrimId}
                onChange={(e) => setPartyCrimId(e.target.value)}
                placeholder="e.g. CRIM-2024-8819"
              />
            </Field>

            <Field label="Bar Enrolment No. (If Counsel)">
              <Input
                value={partyLawyerBar}
                onChange={(e) => setPartyLawyerBar(e.target.value)}
                placeholder="e.g. D/1482/2004"
              />
            </Field>
          </div>

          <Field label="Custody / Attendance Status">
            <Select
              value={partyCustody}
              onChange={(e) => setPartyCustody(e.target.value as any)}
              className="w-full text-xs"
            >
              <option value="In custody">In custody</option>
              <option value="On bail">On bail</option>
              <option value="Absconding">Absconding</option>
              <option value="Not applicable">Not applicable</option>
            </Select>
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: ADD WEAPON AT SCENE (User Specification)                         */}
      {/* ========================================================================= */}
      <Modal
        open={addWeaponModalOpen}
        onClose={() => setAddWeaponModalOpen(false)}
        title="Add Weapon at Scene & Seizure"
        size="md"
      >
        <form onSubmit={handleAddWeaponSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weapon Category">
              <Select
                value={weaponType}
                onChange={(e) => setWeaponType(e.target.value as any)}
                className="w-full text-xs"
              >
                <option value="FIREARM">Firearm (Pistol / Revolver / Rifle)</option>
                <option value="EDGED_WEAPON">Edged Weapon (Knife / Dagger)</option>
                <option value="BLUNT_OBJECT">Blunt Object (Iron Rod / Club)</option>
                <option value="EXPLOSIVE">Explosive Device</option>
                <option value="IMPROVISED">Improvised Weapon</option>
              </Select>
            </Field>

            <Field label="Make & Model">
              <Input
                value={weaponMakeModel}
                onChange={(e) => setWeaponMakeModel(e.target.value)}
                placeholder="e.g. Country-made 9mm Semi-Automatic Pistol"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Serial / Identifier Number">
              <Input
                value={weaponSerial}
                onChange={(e) => setWeaponSerial(e.target.value)}
                placeholder="e.g. SN-88219 (or Defaced)"
              />
            </Field>

            <Field label="Ballistic Examination Status">
              <Select
                value={weaponBallisticStatus}
                onChange={(e) => setWeaponBallisticStatus(e.target.value as any)}
                className="w-full text-xs"
              >
                <option value="MATCHED">MATCHED (CFSL Confirmed)</option>
                <option value="PENDING_FSL">PENDING_FSL (Lab Awaited)</option>
                <option value="DISPUTED">DISPUTED (Defense Challenge)</option>
                <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
              </Select>
            </Field>
          </div>

          <Field label="Recovery Memo Reference">
            <Input
              value={weaponRecoveryMemo}
              onChange={(e) => setWeaponRecoveryMemo(e.target.value)}
              placeholder="e.g. Recovery Memo under Sec. 23 BSA / Sec. 27 IEA"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Recovery Date">
              <Input
                type="date"
                value={weaponRecoveryDate}
                onChange={(e) => setWeaponRecoveryDate(e.target.value)}
              />
            </Field>

            <Field label="Recovery Place">
              <Input
                value={weaponRecoveryPlace}
                onChange={(e) => setWeaponRecoveryPlace(e.target.value)}
                placeholder="e.g. Shrubbery near Ring Road"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddWeaponModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Save Weapon Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Case Close & Auto-Documentation Modal */}
      <Modal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title="Pronounce Judgment & Close Case (Auto-Documentation)"
        size="lg"
      >
        <form onSubmit={handleCloseCaseSubmit} className="space-y-4 text-xs">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950 font-medium">
            <span className="font-bold block mb-1">
              Automatic Documentation &amp; Cloud Archival
            </span>
            Pronouncing judgment will automatically generate the official court decree, register the penalties in the punishment history, calculate the SHA-256 seal, and provide a printable decree.
          </div>

          <Field label="Formal Judgment Reasoning & Summary">
            <textarea
              rows={4}
              value={judgmentText}
              onChange={(e) => setJudgmentText(e.target.value)}
              className="w-full rounded-2xl border border-black/10 p-3 text-xs focus:border-black"
              required
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Sentence Category">
              <Select
                value={sentenceType}
                onChange={(e) => setSentenceType(e.target.value as PunishmentType)}
                className="w-full text-xs"
              >
                <option value="LIFE_IMPRISONMENT">Life Imprisonment</option>
                <option value="RIGOROUS_IMPRISONMENT">Rigorous Imprisonment</option>
                <option value="SIMPLE_IMPRISONMENT">Simple Imprisonment</option>
                <option value="CAPITAL">Capital (Death)</option>
                <option value="PENAL_FINE">Penal Fine Only</option>
                <option value="PROBATION">Probation</option>
              </Select>
            </Field>

            <Field label="Term (Years)">
              <Input
                type="number"
                value={durationYears}
                onChange={(e) => setDurationYears(parseInt(e.target.value, 10) || 0)}
              />
            </Field>

            <Field label="Penal Fine (INR ₹)">
              <Input
                type="number"
                value={fineAmount}
                onChange={(e) => setFineAmount(parseInt(e.target.value, 10) || 0)}
              />
            </Field>
          </div>

          <Field label="Operative Court Decree Text">
            <Input
              value={operativeDecree}
              onChange={(e) => setOperativeDecree(e.target.value)}
              required
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCloseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="coral" size="sm">
              Confirm &amp; Generate Court Decree
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Hearing Modal */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Next Bench Hearing"
        size="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hearing Date">
              <Input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Time Slot">
              <Input
                type="time"
                value={hearingTime}
                onChange={(e) => setHearingTime(e.target.value)}
                required
              />
            </Field>
          </div>

          <Field label="Trial Stage / Purpose">
            <Input
              value={hearingStage}
              onChange={(e) => setHearingStage(e.target.value)}
              required
            />
          </Field>

          <Field label="Court Hall">
            <Input
              value={hearingHall}
              onChange={(e) => setHearingHall(e.target.value)}
              required
            />
          </Field>

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

// Keep exports for TimelinePage.tsx and PolicePage.tsx
export function Timeline({ c }: { c?: any }) {
  const events = c?.timeline || [
    { date: '04 Feb 2025', type: 'Filing', title: 'FIR registered', detail: 'Armed robbery complaint registered.' },
    { date: '09 Feb 2025', type: 'Police', title: 'Accused 1 arrested', detail: 'Pistol seized under Section 27.' },
    { date: '02 May 2025', type: 'Filing', title: 'Chargesheet filed', detail: 'Chargesheet submitted to Sessions.' },
    { date: '12 Oct 2026', type: 'Hearing', title: 'Remand Production', detail: 'Accused produced via video conference.' },
  ]

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-extrabold text-sm text-foreground">Chronological Case Timeline</h3>
      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
        {events.map((ev: any, idx: number) => (
          <div key={idx} className="relative flex items-start gap-4 pl-1">
            <div className="size-5 rounded-full bg-[#FF5C5C] text-white font-bold text-[9px] grid place-items-center shrink-0 z-10">
              •
            </div>
            <div className="flex-1 p-3.5 rounded-2xl bg-[#FAF7F0] border border-black/[0.04]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">{ev.title}</span>
                <span className="text-[11px] font-semibold text-zinc-500">{ev.date}</span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">{ev.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function Police({ c }: { c?: any }) {
  const entries = c?.police || [
    { date: '10 Sep 2026', entry: 'IO reports NBW execution pending for absconding co-accused.' },
    { date: '22 Aug 2026', entry: 'Supplementary statement recorded under BNSS Section 180.' },
    { date: '01 Jun 2026', entry: 'Request for extension to obtain FSL ballistic report filed.' },
  ]

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-extrabold text-sm text-foreground">Police Station Diary &amp; Malkhana Log</h3>
      <div className="space-y-2.5">
        {entries.map((p: any, idx: number) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-black/[0.04]">
            <span className="font-bold text-xs text-[#FF5C5C] block">{p.date}</span>
            <p className="text-xs text-zinc-800 mt-0.5">{p.entry}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
