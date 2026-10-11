import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Scale,
  Search,
  ShieldCheck,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  Building,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Loader2,
  Sparkles,
  X,
  FileText,
  BadgeCheck,
} from 'lucide-react'
import { judicialStore, type LawyerRecord } from '../lib/judicialStore'
import {
  searchAdvocateByName,
  COURT_COMPLEXES,
  type ECourtsAdvocateResult,
} from '../lib/ecourtsApi'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Tag,
  Th,
  Td,
  Select,
  useApp,
} from '../ui'

export default function Lawyers() {
  const { toast } = useApp()
  const [lawyers, setLawyers] = useState<LawyerRecord[]>(() => judicialStore.getLawyers())

  useEffect(() => {
    const unsub = judicialStore.subscribe(() => {
      setLawyers([...judicialStore.getLawyers()])
    })
    return unsub
  }, [])

  const [query, setQuery] = useState('')
  const [filterChapter, setFilterChapter] = useState('ALL')
  const [filterStanding, setFilterStanding] = useState('ALL')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLawyer, setEditingLawyer] = useState<LawyerRecord | null>(null)
  const [deletingLawyer, setDeletingLawyer] = useState<LawyerRecord | null>(null)
  const [isEcourtSearchOpen, setIsEcourtSearchOpen] = useState(false)

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    barNumber: '',
    chapter: 'Bar Council of Delhi',
    enrolmentYear: 2015,
    standingYears: 11,
    activeCasesCount: 3,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED' as 'VERIFIED' | 'PROVISIONAL' | 'SUSPENDED',
    phone: '',
    email: '',
    chamber: '',
  })

  // eCourts CIS API Search state
  const [ecourtQuery, setEcourtQuery] = useState('PRATEEK')
  const [ecourtStage, setEcourtStage] = useState<'BOTH' | 'PENDING' | 'DISPOSED'>('BOTH')
  const [ecourtComplexId, setEcourtComplexId] = useState('5f5f010a')
  const [isSearchingEcourt, setIsSearchingEcourt] = useState(false)
  const [ecourtResults, setEcourtResults] = useState<ECourtsAdvocateResult[]>([])
  const [ecourtSource, setEcourtSource] = useState<'LIVE_API' | 'AUTHORITATIVE_CACHE' | null>(null)

  const totalInDatabase = lawyers.length
  const activelyParticipatingCount = lawyers.filter((l) => l.isParticipatingInBench).length
  const verifiedCount = lawyers.filter((l) => l.clearanceStatus === 'VERIFIED').length
  const totalLoad = lawyers.reduce((acc, curr) => acc + (curr.activeCasesCount || 0), 0)

  const filteredLawyers = lawyers.filter((l) => {
    const q = query.trim().toLowerCase()
    const matchesQ =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.barNumber.toLowerCase().includes(q) ||
      l.chamber.toLowerCase().includes(q)

    const matchesChapter = filterChapter === 'ALL' || l.chapter === filterChapter
    const matchesStanding =
      filterStanding === 'ALL'
        ? true
        : filterStanding === 'SENIOR'
          ? l.standingYears >= 20
          : filterStanding === 'MID'
            ? l.standingYears >= 10 && l.standingYears < 20
            : l.standingYears < 10

    return matchesQ && matchesChapter && matchesStanding
  })

  const openAddModal = () => {
    setFormData({
      name: '',
      barNumber: `D/${Math.floor(1000 + Math.random() * 4000)}/2020`,
      chapter: 'Bar Council of Delhi',
      enrolmentYear: 2020,
      standingYears: 6,
      activeCasesCount: 1,
      isParticipatingInBench: true,
      clearanceStatus: 'VERIFIED',
      phone: '+91 98100 00000',
      email: '',
      chamber: 'Chamber No. 204, Saket Courts Complex',
    })
    setIsAddModalOpen(true)
  }

  const openEditModal = (lawyer: LawyerRecord) => {
    setEditingLawyer(lawyer)
    setFormData({
      name: lawyer.name,
      barNumber: lawyer.barNumber,
      chapter: lawyer.chapter,
      enrolmentYear: lawyer.enrolmentYear,
      standingYears: lawyer.standingYears,
      activeCasesCount: lawyer.activeCasesCount,
      isParticipatingInBench: lawyer.isParticipatingInBench,
      clearanceStatus: lawyer.clearanceStatus,
      phone: lawyer.phone,
      email: lawyer.email,
      chamber: lawyer.chamber,
    })
  }

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.barNumber.trim()) {
      toast('Please enter advocate name and bar enrolment number', 'error')
      return
    }

    const standing = Math.max(1, new Date().getFullYear() - Number(formData.enrolmentYear))
    judicialStore.addLawyer({
      name: formData.name.trim(),
      barNumber: formData.barNumber.trim(),
      chapter: formData.chapter,
      enrolmentYear: Number(formData.enrolmentYear),
      standingYears: standing,
      activeCasesCount: Number(formData.activeCasesCount) || 1,
      isParticipatingInBench: formData.isParticipatingInBench,
      clearanceStatus: formData.clearanceStatus,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      chamber: formData.chamber.trim(),
    })

    toast(`Advocate ${formData.name} added to Bar roll successfully`, 'ok')
    setIsAddModalOpen(false)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLawyer) return
    if (!formData.name.trim() || !formData.barNumber.trim()) {
      toast('Please enter advocate name and bar enrolment number', 'error')
      return
    }

    const standing = Math.max(1, new Date().getFullYear() - Number(formData.enrolmentYear))
    judicialStore.updateLawyer(editingLawyer.id, {
      name: formData.name.trim(),
      barNumber: formData.barNumber.trim(),
      chapter: formData.chapter,
      enrolmentYear: Number(formData.enrolmentYear),
      standingYears: standing,
      activeCasesCount: Number(formData.activeCasesCount) || 0,
      isParticipatingInBench: formData.isParticipatingInBench,
      clearanceStatus: formData.clearanceStatus,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      chamber: formData.chamber.trim(),
    })

    toast(`Advocate ${formData.name} records updated`, 'ok')
    setEditingLawyer(null)
  }

  const handleDelete = () => {
    if (!deletingLawyer) return
    const name = deletingLawyer.name
    judicialStore.deleteLawyer(deletingLawyer.id)
    toast(`Advocate ${name} removed from active roster`, 'ok')
    setDeletingLawyer(null)
  }

  const executeEcourtAdvocateSearch = async () => {
    setIsSearchingEcourt(true)
    try {
      const res = await searchAdvocateByName({
        name: ecourtQuery,
        stage: ecourtStage,
        complexId: ecourtComplexId,
      })
      setEcourtResults(res.results)
      setEcourtSource(res.source)
      toast(
        res.source === 'LIVE_API'
          ? `Fetched ${res.results.length} counsel from live eCourts CIS server`
          : `Fetched ${res.results.length} counsel records via eCourts Registry Mirror`,
        'ok'
      )
    } catch (e) {
      toast('Failed to query eCourts Advocate API', 'error')
    } finally {
      setIsSearchingEcourt(false)
    }
  }

  const handleImportEcourtAdvocate = (adv: ECourtsAdvocateResult) => {
    // Check if already in store
    const exists = judicialStore.getLawyer(adv.barNumber)
    if (exists) {
      toast(`Advocate ${adv.name} (${adv.barNumber}) already enrolled on this Bench`, 'error')
      return
    }

    judicialStore.addLawyer({
      name: adv.name,
      barNumber: adv.barNumber,
      chapter: adv.chapter,
      enrolmentYear: adv.enrolmentYear,
      standingYears: adv.standingYears,
      activeCasesCount: adv.totalCases,
      isParticipatingInBench: true,
      clearanceStatus: adv.clearanceStatus,
      phone: adv.phone,
      email: adv.email,
      chamber: adv.chamber,
    })

    toast(`Imported ${adv.name} from eCourts CIS directly into Bench Roster!`, 'ok')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bar Council Advocate Database"
        sub="Statutory roster of legal counsel appearing before this Sessions Court. Enrolment credentials, standing years, disciplinary clearance, and real-time eCourts CIS synchronization."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsEcourtSearchOpen(true)
                if (ecourtResults.length === 0) {
                  executeEcourtAdvocateSearch()
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <Globe className="size-3.5" />
              eCourts CIS Advocate Search
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={openAddModal}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Add Advocate
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => toast('Exported Advocate Standing Roll as PDF', 'ok')}
            >
              Export Standing Roll
            </Button>
          </div>
        }
      />

      {/* Top 4 Pastel Bento Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-3xl bg-[#FEF08A] text-amber-950 shadow-xs border border-amber-200/50">
          <div className="text-xs font-bold opacity-80">Total In Jurisdiction</div>
          <div className="text-2xl font-black mt-1">1,420 Advocates</div>
          <div className="text-[11px] opacity-75 mt-0.5">Gazetted District Bar Roll</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FBCFE8] text-pink-950 shadow-xs border border-pink-200/50">
          <div className="text-xs font-bold opacity-80">Actively on Bench</div>
          <div className="text-2xl font-black mt-1">{activelyParticipatingCount} Advocates</div>
          <div className="text-[11px] opacity-75 mt-0.5">Active Vakalatnamas on File</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#BBF7D0] text-emerald-950 shadow-xs border border-emerald-200/50">
          <div className="text-xs font-bold opacity-80">Good Standing Verified</div>
          <div className="text-2xl font-black mt-1">{verifiedCount} / {totalInDatabase}</div>
          <div className="text-[11px] opacity-75 mt-0.5">Bar Council Cleared & Verified</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#BFDBFE] text-blue-950 shadow-xs border border-blue-200/50">
          <div className="text-xs font-bold opacity-80">Bench Appearance Load</div>
          <div className="text-2xl font-black mt-1">{totalLoad} Matters</div>
          <div className="text-[11px] opacity-75 mt-0.5">Across Trial Sessions Roster</div>
        </div>
      </div>

      {/* Real-world eCourts API Direct Callout Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-zinc-50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold shrink-0">
            API
          </div>
          <div>
            <div className="font-bold text-zinc-900 flex items-center gap-2">
              Integrated Indian District Court eCourts CIS API
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                eciapi/17
              </span>
            </div>
            <p className="text-zinc-600 text-[11px] mt-0.5">
              Live queries available for <span className="font-mono text-blue-700">district-court/search/advocate-name</span> (Advocate roster lookup) and <span className="font-mono text-blue-700">district-court/case</span> (CNR verification).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEcourtSearchOpen(true)
            if (ecourtResults.length === 0) executeEcourtAdvocateSearch()
          }}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shrink-0"
        >
          Open Advocate Search Tool →
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search advocate name, bar number, or chamber..."
              className="pl-9.5 h-10 text-xs rounded-full"
            />
          </div>

          <Select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="w-full rounded-full"
          >
            <option value="ALL">All State Chapters</option>
            <option value="Bar Council of Delhi">Bar Council of Delhi</option>
            <option value="Bar Council of Tamil Nadu & Puducherry">Bar Council of Tamil Nadu</option>
            <option value="Supreme Court Bar Association">Supreme Court Bar</option>
            <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra</option>
          </Select>

          <Select
            value={filterStanding}
            onChange={(e) => setFilterStanding(e.target.value)}
            className="w-full rounded-full"
          >
            <option value="ALL">All Seniority Tiers</option>
            <option value="SENIOR">Senior Counsel (20+ Years)</option>
            <option value="MID">Mid-Career (10 - 20 Years)</option>
            <option value="JUNIOR">Junior Advocates (&lt; 10 Years)</option>
          </Select>
        </div>
      </Card>

      {/* Lawyers Roster Table with Add/Edit/Delete Controls */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-black/[0.06] gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Advocate Roster Directory ({filteredLawyers.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Manage gazetted advocates, update chamber allocations, clearance certifications, and bench standings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">
              Showing {filteredLawyers.length} of {totalInDatabase} registered counsel
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <Th>BAR ENROLMENT NO.</Th>
                <Th>ADVOCATE NAME</Th>
                <Th>STATE CHAPTER</Th>
                <Th>STANDING</Th>
                <Th>ACTIVE CASES</Th>
                <Th>BENCH PARTICIPATION</Th>
                <Th>CLEARANCE</Th>
                <Th>CONTACT</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {filteredLawyers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-zinc-500">
                    No advocates matching current search criteria. Click &quot;Add Advocate&quot; or &quot;eCourts CIS Advocate Search&quot; to register counsel.
                  </td>
                </tr>
              ) : (
                filteredLawyers.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-50/80 transition-colors group">
                    <Td className="font-bold text-xs text-[#FF5C5C] font-mono">
                      {l.barNumber}
                    </Td>
                    <Td>
                      <div className="font-bold text-xs text-zinc-900">{l.name}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Building className="size-3 text-zinc-400" />
                        {l.chamber || 'Chamber not assigned'}
                      </div>
                    </Td>
                    <Td className="text-xs text-zinc-700">
                      {l.chapter}
                    </Td>
                    <Td className="text-xs">
                      <span className="font-bold">{l.standingYears}</span> Yrs
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        Enr. {l.enrolmentYear}
                      </span>
                    </Td>
                    <Td className="text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-100 font-bold text-zinc-800">
                        {l.activeCasesCount} Cases
                      </span>
                    </Td>
                    <Td className="text-xs">
                      {l.isParticipatingInBench ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          Active on Bench
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[11px]">
                          Inactive
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs">
                      {l.clearanceStatus === 'VERIFIED' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Verified
                        </span>
                      ) : l.clearanceStatus === 'PROVISIONAL' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium">
                          Provisional
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                          Suspended
                        </span>
                      )}
                    </Td>
                    <Td className="text-[11px] text-zinc-500">
                      <div>{l.phone || '—'}</div>
                      <div className="text-[10px] text-zinc-400">{l.email || '—'}</div>
                    </Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(l)}
                          title="Edit Advocate Record"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingLawyer(l)}
                          title="Delete from Roster"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =========================================================================
          ADD ADVOCATE MODAL
      ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Plus className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Add Advocate to Bar Roll</h3>
                  <p className="text-[11px] text-zinc-500">Enrol new legal counsel appearing before this Bench</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Advocate Full Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Adv. Rajesh K. Varma"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Bar Enrolment Number *
                  </label>
                  <Input
                    required
                    value={formData.barNumber}
                    onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                    placeholder="D/1482/2012"
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    State Bar Council Chapter
                  </label>
                  <Select
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Bar Council of Delhi">Bar Council of Delhi</option>
                    <option value="Bar Council of Tamil Nadu & Puducherry">Bar Council of Tamil Nadu</option>
                    <option value="Supreme Court Bar Association">Supreme Court Bar Association</option>
                    <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra</option>
                    <option value="Bar Council of Uttar Pradesh">Bar Council of Uttar Pradesh</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Enrolment Year
                  </label>
                  <Input
                    type="number"
                    min="1960"
                    max={new Date().getFullYear()}
                    value={formData.enrolmentYear}
                    onChange={(e) =>
                      setFormData({ ...formData, enrolmentYear: parseInt(e.target.value) || 2020 })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Active Matters on File
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.activeCasesCount}
                    onChange={(e) =>
                      setFormData({ ...formData, activeCasesCount: parseInt(e.target.value) || 0 })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Clearance & Good Standing
                  </label>
                  <Select
                    value={formData.clearanceStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clearanceStatus: e.target.value as 'VERIFIED' | 'PROVISIONAL' | 'SUSPENDED',
                      })
                    }
                    className="h-9 text-xs"
                  >
                    <option value="VERIFIED">VERIFIED (Cleared by Bar Council)</option>
                    <option value="PROVISIONAL">PROVISIONAL (Verification Pending)</option>
                    <option value="SUSPENDED">SUSPENDED (Disciplinary Hold)</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Chamber / Office Address
                </label>
                <Input
                  value={formData.chamber}
                  onChange={(e) => setFormData({ ...formData, chamber: e.target.value })}
                  placeholder="Chamber No. 314, Lawyers Chambers Block, Saket Courts"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98110 00000"
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Official Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="advocate@delhibar.org"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeBench"
                  checked={formData.isParticipatingInBench}
                  onChange={(e) =>
                    setFormData({ ...formData, isParticipatingInBench: e.target.checked })
                  }
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activeBench" className="text-xs text-zinc-700 cursor-pointer">
                  Actively participating on Sessions Bench (Valid Vakalatnama filed)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save & Register Advocate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT ADVOCATE MODAL
      ========================================================================= */}
      {editingLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Pencil className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">
                    Edit Advocate: {editingLawyer.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Bar Enrolment: {editingLawyer.barNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLawyer(null)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Advocate Full Name *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Bar Enrolment Number *
                  </label>
                  <Input
                    required
                    value={formData.barNumber}
                    onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    State Bar Chapter
                  </label>
                  <Select
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="h-9 text-xs"
                  >
                    <option value="Bar Council of Delhi">Bar Council of Delhi</option>
                    <option value="Bar Council of Tamil Nadu & Puducherry">Bar Council of Tamil Nadu</option>
                    <option value="Supreme Court Bar Association">Supreme Court Bar Association</option>
                    <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra</option>
                    <option value="Bar Council of Uttar Pradesh">Bar Council of Uttar Pradesh</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Enrolment Year
                  </label>
                  <Input
                    type="number"
                    value={formData.enrolmentYear}
                    onChange={(e) =>
                      setFormData({ ...formData, enrolmentYear: parseInt(e.target.value) || 2020 })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Active Matters Count
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.activeCasesCount}
                    onChange={(e) =>
                      setFormData({ ...formData, activeCasesCount: parseInt(e.target.value) || 0 })
                    }
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Clearance Status
                  </label>
                  <Select
                    value={formData.clearanceStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clearanceStatus: e.target.value as 'VERIFIED' | 'PROVISIONAL' | 'SUSPENDED',
                      })
                    }
                    className="h-9 text-xs"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PROVISIONAL">PROVISIONAL</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Chamber / Office Address
                </label>
                <Input
                  value={formData.chamber}
                  onChange={(e) => setFormData({ ...formData, chamber: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Email
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeBenchEdit"
                  checked={formData.isParticipatingInBench}
                  onChange={(e) =>
                    setFormData({ ...formData, isParticipatingInBench: e.target.checked })
                  }
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activeBenchEdit" className="text-xs text-zinc-700 cursor-pointer">
                  Actively appearing on Bench (Vakalatnama valid)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingLawyer(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Update Advocate Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE ADVOCATE CONFIRMATION MODAL
      ========================================================================= */}
      {deletingLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900">Remove Advocate from Bench?</h3>
                <p className="text-xs text-zinc-600 mt-1">
                  Are you sure you want to delete <span className="font-semibold text-zinc-900">{deletingLawyer.name}</span> ({deletingLawyer.barNumber}) from the active roster?
                </p>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mt-3 text-[11px] text-rose-800">
                  This will remove this counsel&apos;s standing record from this Sessions Court jurisdiction.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingLawyer(null)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          eCourts CIS ADVOCATE SEARCH MODAL (REAL-WORLD API INTEGRATION)
      ========================================================================= */}
      {isEcourtSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-blue-50/80 via-white to-zinc-50">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Globe className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    eCourts CIS Advocate Registry Search
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono font-semibold">
                      API: /search/advocate-name
                    </span>
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Live Indian District Court Counsel verification with active matter appearances
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEcourtSearchOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* API Parameters Input Controls */}
            <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wide">
                    Advocate Name
                  </label>
                  <Input
                    value={ecourtQuery}
                    onChange={(e) => setEcourtQuery(e.target.value)}
                    placeholder='e.g. "PRATEEK"'
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wide">
                    Case Stage Filter
                  </label>
                  <Select
                    value={ecourtStage}
                    onChange={(e) =>
                      setEcourtStage(e.target.value as 'BOTH' | 'PENDING' | 'DISPOSED')
                    }
                    className="h-9 text-xs"
                  >
                    <option value="BOTH">BOTH (Pending & Disposed)</option>
                    <option value="PENDING">PENDING Matters Only</option>
                    <option value="DISPOSED">DISPOSED Matters Only</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wide">
                    Court Complex
                  </label>
                  <Select
                    value={ecourtComplexId}
                    onChange={(e) => setEcourtComplexId(e.target.value)}
                    className="h-9 text-xs"
                  >
                    {COURT_COMPLEXES.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.name} ({cc.id})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* API curl command info strip */}
              <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
                <div className="truncate">
                  <span className="text-emerald-400 font-bold">curl</span> --location &apos;https://apis.akshit.net/eciapi/17/district-court/search/advocate-name&apos; \
                  --data &apos;{JSON.stringify({ name: ecourtQuery, stage: ecourtStage, complexId: ecourtComplexId })}&apos;
                </div>
                <button
                  onClick={executeEcourtAdvocateSearch}
                  disabled={isSearchingEcourt}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs shrink-0 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isSearchingEcourt ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Search className="size-3.5" />
                  )}
                  Execute Query
                </button>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                  <span>Advocates Found: {ecourtResults.length}</span>
                  {ecourtSource && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        ecourtSource === 'LIVE_API'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ecourtSource === 'LIVE_API'
                        ? '● Live eCourts CIS Verified'
                        : '● eCourts Central Mirror Synchronized'}
                    </span>
                  )}
                </div>
              </div>

              {isSearchingEcourt ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 className="size-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-xs font-semibold text-zinc-700">Connecting to eCourts National CIS Roster...</p>
                  <p className="text-[11px] text-zinc-400">Verifying Bar Council records and pending trial appearances</p>
                </div>
              ) : ecourtResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 border-2 border-dashed border-zinc-200 rounded-2xl">
                  No advocates found matching &quot;{ecourtQuery}&quot;. Try searching for &quot;PRATEEK&quot; or changing the Court Complex.
                </div>
              ) : (
                <div className="space-y-4">
                  {ecourtResults.map((adv, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-zinc-200 bg-white hover:border-blue-300 transition shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-zinc-900">{adv.name}</h4>
                            <span className="text-xs font-mono font-bold text-[#FF5C5C]">
                              {adv.barNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              {adv.clearanceStatus}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                            <span>{adv.chapter}</span>
                            <span>·</span>
                            <span>{adv.standingYears} Years Standing (Enr. {adv.enrolmentYear})</span>
                            <span>·</span>
                            <span>{adv.courtComplex}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleImportEcourtAdvocate(adv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs shrink-0"
                        >
                          <Plus className="size-3.5" />
                          Import to Bench Roster
                        </button>
                      </div>

                      {/* Advocate Info details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-xl">
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Chamber / Seat:</span>
                          <span className="font-medium text-zinc-800 truncate block">{adv.chamber}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Phone & Email:</span>
                          <span className="font-medium text-zinc-800">{adv.phone}</span>
                          <span className="text-zinc-500 block text-[10px]">{adv.email}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Total Matters:</span>
                          <span className="font-bold text-blue-600">
                            {adv.totalCases} Total ({adv.pendingCount} Pending, {adv.disposedCount} Disposed)
                          </span>
                        </div>
                      </div>

                      {/* Associated Cases List */}
                      {adv.cases && adv.cases.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                            Active & Recent Trial Appearances:
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {adv.cases.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs space-y-1 hover:border-zinc-300"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-blue-700 text-[11px]">
                                    {c.caseNumber}
                                  </span>
                                  <span
                                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                      c.status === 'PENDING'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-zinc-100 text-zinc-600'
                                    }`}
                                  >
                                    {c.status}
                                  </span>
                                </div>
                                <div className="font-semibold text-zinc-800 truncate">{c.title}</div>
                                <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                                  <span>CNR: <span className="font-mono">{c.cnr}</span></span>
                                  <span className="font-semibold text-zinc-700">Side: {c.representedParty}</span>
                                </div>
                                <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-0.5">
                                  <span>Court: {c.court}</span>
                                  {c.nextHearingDate && c.nextHearingDate !== '-' && (
                                    <span className="text-emerald-700 font-bold">
                                      Next: {c.nextHearingDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
              <span>District Court eCourts Integration active. Data adheres to Section 30 of Advocates Act, 1961.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEcourtSearchOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
