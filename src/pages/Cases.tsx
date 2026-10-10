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

export default function Cases() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const cases = judicialStore.getCases()

  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<'number' | 'hearing' | 'filing'>('number')

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
  const [newComplainant, setNewComplainant] = useState('State (NCT of Delhi)')
  const [newAccused, setNewAccused] = useState('')
  const [newActs, setNewActs] = useState('BNS s.103 / Arms Act s.25')
  const [newPoliceStation, setNewPoliceStation] = useState('PS Crime Branch')
  const [newIoName, setNewIoName] = useState('Insp. Pradeep Rawat')
  const [newStage, setNewStage] = useState('Framing of Charges')
  const [newNextHearing, setNewNextHearing] = useState('2026-10-24')

  const rows = useMemo(() => {
    let r = cases.filter((c) => {
      const query = q.trim().toLowerCase()
      if (
        query &&
        !(c.number + c.title + c.court + c.policeStation + c.io.name).toLowerCase().includes(query)
      ) {
        return false
      }
      if (type && c.type !== type) return false
      if (status === 'closed' && !c.isClosed) return false
      if (status === 'active' && c.isClosed) return false
      return true
    })

    r = [...r].sort((a, b) => {
      if (sort === 'number') return a.number.localeCompare(b.number)
      if (sort === 'filing') return b.filingDate.localeCompare(a.filingDate)
      return a.nextHearing.localeCompare(b.nextHearing)
    })

    return r
  }, [cases, q, type, status, sort])

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
      additionalDetails: 'Case created via Mercy registry.',
      isClosed: false,
    })

    setIsAddCaseOpen(false)
    setNewAccused('')
    toast(`Case ${newCase.number} ingested into Mercy!`, 'ok')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bench Case Dossiers & Trial Registry"
        sub="Primary case repository. Find cases by number or title, review investigating officer manifests, evidence chain-of-custody, and closed judgments."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddCaseOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#121316] text-white hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="size-4 text-[#FF5C5C]" />
              + Quick Add Case
            </button>
            <Link to="/cases/new">
              <button className="px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer">
                Full Auto-Numbering Wizard
              </button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by case no. (e.g. S.C. 214/2025), party, IO, or police station..."
              className="pl-12 pr-5 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
            />
          </div>

          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-13 text-xs sm:text-sm font-semibold rounded-full border-black/10"
          >
            <option value="">All Case Types</option>
            <option value="Criminal">Criminal Sessions</option>
            <option value="POCSO">POCSO Special Court</option>
            <option value="Matrimonial">Matrimonial / Family</option>
            <option value="Civil">Civil Suit</option>
          </Select>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-13 text-xs sm:text-sm font-semibold rounded-full border-black/10"
          >
            <option value="">All Trial Statuses</option>
            <option value="active">Active In Trial</option>
            <option value="closed">Closed &amp; Disposed</option>
          </Select>
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="bg-white overflow-hidden">
        <div className="p-5 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Registered Cases ({rows.length} Recorded)
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Select any matter to open trial dossier, edit details, or delete docket.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cases.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Delete all cases from registry and reset?')) {
                    judicialStore.resetToCleanState()
                    toast('Registry cleared of all cases', 'ok')
                  }
                }}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                title="Delete all cases in registry"
              >
                <Trash2 className="size-3.5" />
                <span>Delete All</span>
              </Button>
            )}
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#F7F4EB]/70">
                <Th className="whitespace-nowrap">CASE NUMBER</Th>
                <Th>STANDARDIZED CAUSE TITLE</Th>
                <Th>TYPE</Th>
                <Th>LEAD IO &amp; POLICE</Th>
                <Th>SECTIONS CITED</Th>
                <Th>TRIAL STAGE</Th>
                <Th>NEXT HEARING</Th>
                <Th>STATUS</Th>
                <Th className="sticky right-0 bg-[#FAF7F0] shadow-[-6px_0_12px_rgba(0,0,0,0.06)] border-l border-black/[0.06] z-20 text-center font-extrabold text-rose-700">
                  ACTIONS (DELETE / EDIT)
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-xs text-zinc-400">
                    <div className="space-y-2 max-w-sm mx-auto">
                      <p className="font-extrabold text-sm text-zinc-700">No Cases Found in Registry</p>
                      <p className="text-[11px] text-zinc-400">Your judicial database is clean. Click below to intake the first case.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddCaseOpen(true)}
                        className="mt-2 px-4 py-2 rounded-full bg-[#121316] text-white font-bold text-xs cursor-pointer"
                      >
                        + Intake New Case
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F7F4EB]/30 transition-colors border-b border-black/[0.04] group">
                    <Td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/cases/${c.id}`}
                          className="font-black text-xs text-[#FF5C5C] hover:underline"
                        >
                          {c.number}
                        </Link>
                        {/* Quick Delete Trash Button directly in the first column */}
                        <button
                          type="button"
                          onClick={() => setDeletingCase(c)}
                          className="p-1 rounded-full text-zinc-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={`Delete case ${c.number}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </Td>

                    <Td>
                      <div className="font-extrabold text-xs text-zinc-900 max-w-xs truncate" title={c.title}>
                        {c.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5">
                        FIR: {c.fir.no} ({c.fir.date}) · {c.documents.length} Docs Indexed
                      </div>
                    </Td>

                    <Td className="whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-zinc-100 text-zinc-700">
                        {c.type}
                      </span>
                    </Td>

                    <Td className="text-xs">
                      <div className="font-bold text-zinc-900 truncate max-w-44">{c.io.name}</div>
                      <div className="text-[11px] text-zinc-400 font-medium truncate max-w-44">
                        {c.policeStation}
                      </div>
                    </Td>

                    <Td className="text-[11px] text-zinc-600 font-medium max-w-40 truncate">
                      {c.acts.join(', ')}
                    </Td>

                    <Td className="text-xs font-bold text-zinc-800 whitespace-nowrap">
                      {c.stage}
                    </Td>

                    <Td className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
                      {c.nextHearing}
                    </Td>

                    <Td className="whitespace-nowrap">
                      {c.isClosed ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                          Closed
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-bold">
                          {c.status}
                        </span>
                      )}
                    </Td>

                    {/* Prominent, Sticky Actions Column with Red Delete Button */}
                    <Td className="sticky right-0 bg-white group-hover:bg-[#FAF7F0] shadow-[-6px_0_12px_rgba(0,0,0,0.06)] border-l border-black/[0.06] z-10 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 justify-end">
                        {/* Prominent Red Delete Button with label */}
                        <button
                          type="button"
                          onClick={() => setDeletingCase(c)}
                          className="px-2.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold text-xs inline-flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                          title="Delete Case from registry"
                        >
                          <Trash2 className="size-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black transition-colors cursor-pointer"
                          title="Edit Case"
                        >
                          <Edit2 className="size-3.5" />
                        </button>

                        {/* Dossier Button */}
                        <Link to={`/cases/${c.id}`}>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            Dossier
                            <ArrowRight className="size-3" />
                          </button>
                        </Link>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: EDIT CASE */}
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
                Save Case Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: DELETE CASE CONFIRMATION */}
      {deletingCase && (
        <Modal
          open={!!deletingCase}
          onClose={() => setDeletingCase(null)}
          title="Confirm Case Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete case <strong className="text-zinc-900">{deletingCase.number}</strong> ({deletingCase.title})?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
              This will remove all associated hearings, evidence items, and documents for this case.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setDeletingCase(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Permanently Delete Case
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: QUICK ADD CASE */}
      <Modal
        open={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        title="Intake New Case Docket"
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
                <option value="Criminal">Criminal Sessions</option>
                <option value="POCSO">POCSO Special Court</option>
                <option value="Matrimonial">Matrimonial / Family</option>
                <option value="Civil">Civil Suit</option>
              </Select>
            </Field>

            <Field label="Complainant / Prosecution Party">
              <Input
                value={newComplainant}
                onChange={(e) => setNewComplainant(e.target.value)}
                placeholder="e.g. State (NCT of Delhi)"
                required
              />
            </Field>

            <Field label="Primary Accused Name">
              <Input
                value={newAccused}
                onChange={(e) => setNewAccused(e.target.value)}
                placeholder="e.g. Rahul Sharma"
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

            <Field label="Police Station">
              <Input
                value={newPoliceStation}
                onChange={(e) => setNewPoliceStation(e.target.value)}
                placeholder="e.g. PS Special Cell"
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

            <Field label="Trial Stage">
              <Select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                className="w-full"
              >
                <option value="Framing of Charges">Framing of Charges</option>
                <option value="Prosecution Evidence">Prosecution Evidence</option>
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
    </div>
  )
}
