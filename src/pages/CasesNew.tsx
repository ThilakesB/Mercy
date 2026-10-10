import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Sparkles,
  Shield,
  ArrowRight,
  Gavel,
  Hash,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react'
import { judicialStore, type FullCaseRecord } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Field,
  Input,
  Select,
  Tag,
  useApp,
} from '../ui'

export default function CasesNew() {
  const { toast } = useApp()
  const navigate = useNavigate()

  // Form State
  const [jurisdiction, setJurisdiction] = useState('DL')
  const [caseType, setCaseType] = useState<'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'>('Criminal')
  const [year] = useState(2026)
  const [policePrecinct, setPolicePrecinct] = useState('PSCT')
  const [complainant, setComplainant] = useState('State (NCT of Delhi)')
  const [primaryAccused, setPrimaryAccused] = useState('Vikas Yadav')
  const [coAccusedCount, setCoAccusedCount] = useState(1)
  const [statuteSection, setStatuteSection] = useState('BNS s.103 / Arms Act s.25')

  // IO Details
  const [ioName, setIoName] = useState('Insp. Pradeep Rawat')
  const [ioBadge, setIoBadge] = useState('DL-POL-9921')
  const [ioStation, setIoStation] = useState('PS Cyber Thana / Special Crime Unit')
  const [ioPhone, setIoPhone] = useState('+91-98110-33412')

  // Evidence & Weapons details
  const [firNo, setFirNo] = useState('29/2026')
  const [firDate, setFirDate] = useState('2026-03-14')
  const [weaponType, setWeaponType] = useState('Country-made .32 bore pistol with defaced serial number')
  const [initialEvidence, setInitialEvidence] = useState('Ballistic recovery memo under Sec 27 & CCTV extract')

  // Live Auto-Numbering Computation
  const preview = judicialStore.generateCaseNumberAndName({
    jurisdictionCode: jurisdiction,
    caseType,
    year,
    policeStationCode: policePrecinct,
    primaryComplainant: complainant,
    primaryAccused,
    coAccusedCount,
    primaryStatuteSection: statuteSection,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newCasePayload: Omit<FullCaseRecord, 'id'> = {
      number: preview.caseNumber,
      title: preview.caseName,
      type: caseType,
      court: 'Principal Sessions Court · Bench 04',
      acts: statuteSection.split('/').map((s) => s.trim()),
      stage: 'Framing of Charges',
      status: 'ontrack',
      filingDate: new Date().toISOString().split('T')[0],
      nextHearing: '2026-10-25',
      judge: 'Hon. Justice R. Venkataraman',
      policeStation: ioStation,
      fir: { no: firNo, date: firDate },
      io: {
        name: ioName,
        rank: 'Inspector of Police',
        badge: ioBadge,
        policeStation: ioStation,
        phone: ioPhone,
        chargesheetRef: `CS-${firNo} filed ${firDate}`,
      },
      parties: [
        { role: 'Prosecutor', name: 'State Public Prosecutor' },
        { role: 'Complainant / Offended Party', name: complainant },
        { role: 'Accused', name: primaryAccused, custody: 'In custody' },
        ...(coAccusedCount > 0
          ? [{ role: 'Accused' as const, name: `Co-Accused 1 (${primaryAccused} associate)`, custody: 'On bail' as const }]
          : []),
      ],
      victims: {
        total: 1,
        minors: 0,
        adults: 1,
        details: [{ name: 'Deceased / Complainant Victim', masked: false, age: 34, relationship: 'Aggrieved' }],
      },
      weapons: [
        {
          id: `wpn-${Date.now()}`,
          type: 'FIREARM',
          makeModel: weaponType,
          serialNumber: 'DEFACED / LABORATORY TAGGED',
          recoveryMemo: `Seizure Memo under Sec 27 prepared by ${ioName}`,
          recoveryDate: firDate,
          recoveryPlace: 'Crime Scene / Seizure Location',
          ballisticStatus: 'PENDING_FSL',
          notes: 'Submitted to FSL for striation matching.',
        },
      ],
      evidence: [
        {
          id: `ev-${Date.now()}`,
          code: 'EX-P-1',
          kind: 'Forensic',
          title: initialEvidence,
          detail: `Initial physical seizure seized by IO ${ioName} under FIR ${firNo}.`,
          custodyOfficer: ioName,
          date: firDate,
          place: ioStation,
          labStatus: 'pending',
          admission: 'marked',
          chainHash: '9a8b7c6d5e4f3a2b1c0d',
        },
      ],
      documents: [],
      hearings: [],
      additionalDetails: `Ingested through Auto-Numbering Engine on ${new Date().toISOString().split('T')[0]}. Priority trial listing.`,
      isClosed: false,
    }

    const created = judicialStore.ingestNewCase(newCasePayload)
    toast(`Case ${created.number} created and indexed via Auto-Numbering Engine!`, 'ok')
    navigate(`/cases/${created.id}`)
  }

  return (
    <>
      <PageHeader
        title="Case Ingestion & Deterministic Auto-Numbering Engine"
        sub="Core judicial intake pipeline. Automatically synthesizes case number sequences and standardized cause titles from statutory sections, investigating officer records, and party telemetry."
      />

      {/* Live Generator Banner */}
      <Card className="mb-6 p-5 border-2 border-foreground bg-elevated/40">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-[#e61919]">
          <Sparkles className="size-4" />
          <span>/// LIVE DETERMINISTIC AUTO-NUMBERING PREVIEW ///</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 bg-card p-4 border border-border">
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground block">
              GENERATED CASE NUMBER:
            </span>
            <div className="font-mono text-xl font-black text-[#e61919]">
              {preview.caseNumber}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground mt-0.5 block">
              Format: [JURISDICTION]-[TYPE]-[YEAR]-[PRECINCT]-[SEQUENCE]
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground block">
              STANDARDIZED JUDICIAL CAUSE TITLE:
            </span>
            <div className="font-sans text-sm font-bold text-foreground">
              {preview.caseName}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground mt-0.5 block">
              Format: [COMPLAINANT] VS. [PRIMARY_ACCUSED] (U/S [STATUTE])
            </span>
          </div>
        </div>
      </Card>

      {/* Ingestion Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-2 mb-6">
          {/* Column 1: Case Details & Parties */}
          <Card className="p-5 space-y-4">
            <CardHeader
              num="01"
              title="CASE CLASSIFICATION & JURISDICTION"
              sub="Required inputs for sequence indexing and cause heading generation"
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Court Jurisdiction Code">
                <Select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full"
                >
                  <option value="DL">DL (National Capital Territory of Delhi)</option>
                  <option value="TN">TN (State of Tamil Nadu)</option>
                  <option value="MH">MH (State of Maharashtra)</option>
                  <option value="KA">KA (State of Karnataka)</option>
                </Select>
              </Field>

              <Field label="Case Legal Classification">
                <Select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as any)}
                  className="w-full"
                >
                  <option value="Criminal">Criminal (Sessions Trial)</option>
                  <option value="POCSO">POCSO Special Court</option>
                  <option value="Matrimonial">Matrimonial / Family Court</option>
                  <option value="Civil">Civil Suit</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Police Precinct Code">
                <Input
                  value={policePrecinct}
                  onChange={(e) => setPolicePrecinct(e.target.value.toUpperCase())}
                  placeholder="e.g. PSCT, AN, KOTW"
                  required
                />
              </Field>
              <Field label="Primary Statutory Code / Section">
                <Input
                  value={statuteSection}
                  onChange={(e) => setStatuteSection(e.target.value)}
                  placeholder="e.g. BNS s.103 / Arms Act s.25"
                  required
                />
              </Field>
            </div>

            <Field label="Complainant / Offended Party">
              <Input
                value={complainant}
                onChange={(e) => setComplainant(e.target.value)}
                placeholder="e.g. State (NCT of Delhi) or Citizen Name"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary Accused Person">
                <Input
                  value={primaryAccused}
                  onChange={(e) => setPrimaryAccused(e.target.value)}
                  placeholder="e.g. Vikas Yadav"
                  required
                />
              </Field>
              <Field label="Co-Accused Persons Count">
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={coAccusedCount}
                  onChange={(e) => setCoAccusedCount(parseInt(e.target.value) || 0)}
                />
              </Field>
            </div>
          </Card>

          {/* Column 2: Investigating Officers & Initial Evidence */}
          <Card className="p-5 space-y-4">
            <CardHeader
              num="02"
              title="INVESTIGATING OFFICERS & INITIAL RECOVERY"
              sub="Evidentiary provenance for docket registration"
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Lead Investigating Officer (IO)">
                <Input
                  value={ioName}
                  onChange={(e) => setIoName(e.target.value)}
                  required
                />
              </Field>
              <Field label="IO Police Badge Number">
                <Input
                  value={ioBadge}
                  onChange={(e) => setIoBadge(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Police Station / Precinct Name">
              <Input
                value={ioStation}
                onChange={(e) => setIoStation(e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="FIR Reference Number">
                <Input
                  value={firNo}
                  onChange={(e) => setFirNo(e.target.value)}
                  required
                />
              </Field>
              <Field label="FIR Registration Date">
                <Input
                  type="date"
                  value={firDate}
                  onChange={(e) => setFirDate(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Weapons Used / Recovered At Scene">
              <Input
                value={weaponType}
                onChange={(e) => setWeaponType(e.target.value)}
                placeholder="Description of firearm, blade, or blunt weapon"
                required
              />
            </Field>

            <Field label="Initial Evidence Items Submitted">
              <Input
                value={initialEvidence}
                onChange={(e) => setInitialEvidence(e.target.value)}
                placeholder="e.g. Seizure memo, CCTV drive, forensic swabs"
                required
              />
            </Field>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border border-border bg-card">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/cases')}
          >
            Cancel Intake
          </Button>

          <Button type="submit" variant="hazard" size="lg">
            [ EXECUTE AUTO-NUMBERING &amp; CREATE OFFICIAL CASE ]
          </Button>
        </div>
      </form>
    </>
  )
}
