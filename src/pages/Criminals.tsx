import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Search,
  ShieldAlert,
  Fingerprint,
  User,
  AlertTriangle,
  History,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Scale,
  Shield,
} from 'lucide-react'
import { judicialStore, type CriminalRecord } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Select,
  Field,
  Modal,
  Tag,
  useApp,
} from '../ui'

export default function Criminals() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const criminals = judicialStore.getCriminals()
  const cases = judicialStore.getCases()
  const [query, setQuery] = useState('')

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CriminalRecord | null>(null)

  // Add Criminal Form State
  const [name, setName] = useState('')
  const [aliases, setAliases] = useState('')
  const [age, setAge] = useState('28')
  const [dob, setDob] = useState('1998-05-14')
  const [gender, setGender] = useState('Male')
  const [custodyStatus, setCustodyStatus] = useState<'In custody' | 'On bail' | 'Absconding' | 'Not applicable'>('In custody')
  const [activeCaseNumber, setActiveCaseNumber] = useState(cases[0]?.number || '')
  const [address, setAddress] = useState('Delhi / NCR')
  const [recidivismScore, setRecidivismScore] = useState('0.45')
  const [priorCharges, setPriorCharges] = useState('BNS s.303 (Theft), Arms Act s.25')

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast('Please enter full legal name', 'bad')
      return
    }

    const aliasList = aliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)

    const scoreNum = Math.min(1, Math.max(0, parseFloat(recidivismScore) || 0.3))

    const newRec = judicialStore.addCriminal({
      name: name.trim(),
      aliases: aliasList,
      age: parseInt(age, 10) || 28,
      dob: dob || '1998-01-01',
      gender,
      custodyStatus,
      address: address.trim() || 'Jurisdiction PS Crime Branch',
      recidivismScore: scoreNum,
      activeCaseNumber: activeCaseNumber.trim() || undefined,
      biometricHash: `SHA256:${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      photoPlaceholder: name.trim().slice(0, 2).toUpperCase(),
      crimes: priorCharges.trim()
        ? [
            {
              date: new Date().toISOString().split('T')[0],
              firCourt: 'Principal Sessions Court · Bench 04',
              charges: priorCharges.split(',').map((c) => c.trim()),
              verdict: 'UNDER_TRIAL',
              sentence: 'Under judicial custody review',
            },
          ]
        : [],
    })

    toast(`Accused profile "${newRec.name}" (${newRec.crimId}) created!`, 'ok')
    setIsAddOpen(false)
    setName('')
    setAliases('')
    setPriorCharges('')
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    const success = judicialStore.deleteCriminal(deleteTarget.id)
    if (success) {
      toast(`Expunged criminal profile ${deleteTarget.crimId} (${deleteTarget.name})`, 'ok')
    } else {
      toast('Failed to delete profile', 'bad')
    }
    setDeleteTarget(null)
  }

  const filtered = query.trim()
    ? judicialStore.searchCriminals(query)
    : criminals

  return (
    <div className="space-y-6">
      <PageHeader
        title="National Criminal History Index"
        sub="Searchable directory of criminal career dossiers, recidivism behavioral risk metrics, biometric hashes, and documented convictions."
        actions={
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-bold">
              Audited Bench Access Only
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddOpen(true)}
              className="shadow-xs cursor-pointer"
            >
              <Plus className="size-4" />
              <span>+ Add Criminal</span>
            </Button>
          </div>
        }
      />

      {/* Search Input Bar */}
      <Card className="p-3.5 bg-white shadow-xs">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search criminals by name, alias, or criminal ID (e.g. Rahul Verma, CRIM-2024-8819)..."
            className="pl-13 pr-6 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
          />
        </div>
      </Card>

      {/* Criminal Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="p-16 text-center text-xs text-zinc-400 space-y-3">
          <User className="size-10 mx-auto text-zinc-300 stroke-[1.5]" />
          <h3 className="font-extrabold text-base text-zinc-800">No Criminal Dossiers Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            The criminal record register is currently empty. Click below to add an accused profile or link to a case docket.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={() => setIsAddOpen(true)}>
              <Plus className="size-4" />
              <span>+ Add Criminal Profile</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const isHighRisk = c.recidivismScore >= 0.7
            return (
              <Card key={c.id} className="p-5.5 flex flex-col justify-between hover:shadow-md transition-all relative group bg-white">
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-black/[0.05] pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-[#FEF08A] text-amber-950 font-bold text-sm grid place-items-center shadow-xs shrink-0">
                        {c.photoPlaceholder || c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-foreground">
                          {c.name}
                        </h3>
                        <div className="text-xs font-bold text-[#FF5C5C]">
                          {c.crimId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                          isHighRisk
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {(c.recidivismScore * 100).toFixed(0)}% Risk
                      </span>

                      {/* Delete Criminal Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete criminal dossier"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Aliases:</span>
                      <span className="font-semibold text-zinc-800 text-right">
                        {c.aliases && c.aliases.length > 0 ? c.aliases.join(', ') : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Age / DOB:</span>
                      <span className="text-zinc-800 font-medium">
                        {c.age} Yrs ({c.dob})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Gender / Status:</span>
                      <span className="text-zinc-800 font-medium">
                        {c.gender} · {c.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Custody:</span>
                      <span
                        className={`font-bold ${
                          c.custodyStatus === 'In custody'
                            ? 'text-rose-600'
                            : c.custodyStatus === 'Absconding'
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {c.custodyStatus}
                      </span>
                    </div>

                    {c.activeCaseNumber && (
                      <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-[11px]">
                        <span className="text-zinc-500 block text-[10px]">Active Bench Trial:</span>
                        <span className="font-bold text-[#FF5C5C]">{c.activeCaseNumber}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-black/[0.05]">
                      <div className="text-[11px] font-bold text-zinc-500 mb-1">
                        Prior Crimes: {c.crimes?.length || 0} Offenses
                      </div>
                      <div className="space-y-1">
                        {c.crimes && c.crimes.length > 0 ? (
                          c.crimes.slice(0, 2).map((crm, idx) => (
                            <div key={idx} className="text-[11px] text-zinc-600 truncate">
                              • {crm.date}: {crm.charges.join(', ')} ({crm.verdict})
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] text-zinc-400">No prior criminal convictions logged.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.05] mt-3 flex items-center gap-2">
                  <Link to={`/criminals/${c.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Complete Criminal Dossier
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(c)}
                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    title="Delete profile"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ADD NEW CRIMINAL PROFILE */}
      {/* =================================================================== */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Accused / Criminal Profile"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 text-xs">
            <span className="font-bold block mb-0.5">High-Security Registry Entry:</span>
            New profile will be assigned an automated judicial registry identifier (e.g. CRIM-2026-XXX) and synchronized across active courtroom benches.
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full Legal Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                required
              />
            </Field>

            <Field label="Known Aliases (comma separated)">
              <Input
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="e.g. Rocky, Bablu, Chhota"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Age (Years)" required>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="100"
                required
              />
            </Field>

            <Field label="Date of Birth" required>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </Field>

            <Field label="Gender">
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Custody Status">
              <Select
                value={custodyStatus}
                onChange={(e) => setCustodyStatus(e.target.value as any)}
              >
                <option value="In custody">In custody (Judicial/Police Remand)</option>
                <option value="On bail">On bail</option>
                <option value="Absconding">Absconding (NBW Issued)</option>
                <option value="Not applicable">Not applicable</option>
              </Select>
            </Field>

            <Field label="Recidivism Risk Score (0.0 to 1.0)">
              <Input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={recidivismScore}
                onChange={(e) => setRecidivismScore(e.target.value)}
                placeholder="e.g. 0.45"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Linked Active Case Docket">
              <Select
                value={activeCaseNumber}
                onChange={(e) => setActiveCaseNumber(e.target.value)}
              >
                <option value="">-- No Active Bench Case --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.number}>
                    {c.number} · {c.title.slice(0, 30)}...
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Residential Area / Police Precinct">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. T-4 Anna Nagar, Chennai"
              />
            </Field>
          </div>

          <Field label="Charges / Offense Summary">
            <Input
              value={priorCharges}
              onChange={(e) => setPriorCharges(e.target.value)}
              placeholder="e.g. BNS s.103 / Arms Act s.25"
            />
          </Field>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              + Save &amp; Register Accused
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2: CONFIRM DELETE CRIMINAL PROFILE */}
      {/* =================================================================== */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Expunge & Delete Criminal Dossier"
        size="md"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs">
              <span className="font-bold block mb-1">Permanent Removal Warning:</span>
              Are you sure you want to delete the criminal dossier for{' '}
              <span className="font-bold">{deleteTarget.name}</span> ({deleteTarget.crimId})? This will expunge all linked risk profiles and prior offense entries from the database.
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl text-xs space-y-1">
              <div><span className="text-zinc-500">Accused:</span> <span className="font-bold text-zinc-900">{deleteTarget.name}</span></div>
              <div><span className="text-zinc-500">Registry ID:</span> <span className="font-mono font-bold text-[#FF5C5C]">{deleteTarget.crimId}</span></div>
              <div><span className="text-zinc-500">Status:</span> <span className="font-medium text-zinc-800">{deleteTarget.custodyStatus}</span></div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/5">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Trash2 className="size-4" />
                <span>Confirm Expunge &amp; Delete</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
