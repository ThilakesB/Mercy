import { useState } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  FileText,
  Shield,
  User,
  Users,
  Eye,
  EyeOff,
  Gavel,
  Scale,
  Calendar,
  Clock,
  MapPin,
  FileCheck,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Search,
  Check,
  Sparkles,
} from 'lucide-react'
import { judicialStore, type FullCaseRecord } from '../lib/judicialStore'
import { useApp } from '../ui'

interface ComprehensiveCaseIntakeModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (caseId: string) => void
}

export default function ComprehensiveCaseIntakeModal({
  open,
  onClose,
  onSuccess,
}: ComprehensiveCaseIntakeModalProps) {
  const { toast } = useApp()

  // Active Wizard Step (1 to 8, or 9 for Success Screen)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [submittedCaseNumber, setSubmittedCaseNumber] = useState<string>('')
  const [submittedCaseId, setSubmittedCaseId] = useState<string>('')

  // =========================================================================
  // STEP 1: CASE DETAILS
  // =========================================================================
  const [autoCaseNumber] = useState(
    () => `CNR/2026/DL04-SESS/${Math.floor(1000 + Math.random() * 9000)}`
  )
  const [caseType, setCaseType] = useState<
    'Criminal' | 'POCSO' | 'Divorce/Family' | 'Civil' | 'Other'
  >('Criminal')
  const [courtName, setCourtName] = useState('Court of Principal Sessions Judge, Bench 04')
  const [judgeName, setJudgeName] = useState('Hon. Justice R. Venkataraman')
  const [policeStation, setPoliceStation] = useState('PS Cyber Thana / Special Cell')
  const [firNumber, setFirNumber] = useState('FIR-88/2026')
  const [firDate, setFirDate] = useState('2026-03-12')
  const [incidentDate, setIncidentDate] = useState('2026-03-10')
  const [incidentPlace, setIncidentPlace] = useState('Connaught Place Outer Circle, New Delhi')
  const [filingDate, setFilingDate] = useState('2026-03-15')
  const [caseStatus, setCaseStatus] = useState<
    | 'Registered'
    | 'Under Investigation'
    | 'Chargesheet Filed'
    | 'Trial'
    | 'Judgement Reserved'
    | 'Closed'
  >('Chargesheet Filed')
  const [statutorySections, setStatutorySections] = useState<string[]>([
    'BNS s.103',
    'Arms Act s.25',
    'BSA s.23',
  ])
  const [newSectionInput, setNewSectionInput] = useState('')
  const [caseSummary, setCaseSummary] = useState(
    'Incident involving armed confrontation and recovery of country-made firearm with eyewitness testimonies and forensic ballistic match.'
  )

  const handleAddSection = () => {
    if (newSectionInput.trim() && !statutorySections.includes(newSectionInput.trim())) {
      setStatutorySections([...statutorySections, newSectionInput.trim()])
      setNewSectionInput('')
    }
  }

  const handleRemoveSection = (sec: string) => {
    setStatutorySections(statutorySections.filter((s) => s !== sec))
  }

  // =========================================================================
  // STEP 2: ACCUSED / CRIMINAL DETAILS
  // =========================================================================
  interface AccusedForm {
    id: string
    fullName: string
    alias: string
    age: number
    dob: string
    gender: string
    address: string
    phone: string
    idProofType: string
    idProofNumber: string
    photoName: string
    roleInCrime: 'Main Accused' | 'Accomplice' | 'Abettor'
    arrestStatus: 'Not Arrested' | 'Arrested' | 'Absconding' | 'Bail Granted'
    arrestDate: string
    bailDetails: string
    hasPreviousHistory: boolean
    previousCaseNumbers: string
    previousCaseDetails: string
    weaponUsed: boolean
    weaponDescription: string
  }

  const [accusedList, setAccusedList] = useState<AccusedForm[]>([
    {
      id: 'acc-1',
      fullName: 'Vikas Yadav',
      alias: 'Vicky',
      age: 32,
      dob: '1994-06-15',
      gender: 'Male',
      address: 'House 42, Gali No. 3, Najafgarh, New Delhi',
      phone: '+91-98711-20931',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-8912',
      photoName: 'accused_vikas_mugshot.jpg',
      roleInCrime: 'Main Accused',
      arrestStatus: 'Arrested',
      arrestDate: '2026-03-14',
      bailDetails: 'Bail dismissed by Sessions Court on 22.03.2026.',
      hasPreviousHistory: true,
      previousCaseNumbers: 'FIR-112/2021 (PS Tilak Nagar), FIR-45/2023',
      previousCaseDetails: 'Previous charges of assault under Sec 324 IPC. Under trial.',
      weaponUsed: true,
      weaponDescription: 'Country-made .32 bore pistol with defaced serial number',
    },
  ])

  const handleAddAccused = () => {
    const newAcc: AccusedForm = {
      id: `acc-${Date.now()}`,
      fullName: '',
      alias: '',
      age: 28,
      dob: '1998-01-01',
      gender: 'Male',
      address: '',
      phone: '',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
      photoName: '',
      roleInCrime: 'Accomplice',
      arrestStatus: 'Not Arrested',
      arrestDate: '',
      bailDetails: '',
      hasPreviousHistory: false,
      previousCaseNumbers: '',
      previousCaseDetails: '',
      weaponUsed: false,
      weaponDescription: '',
    }
    setAccusedList([...accusedList, newAcc])
  }

  const handleRemoveAccused = (id: string) => {
    if (accusedList.length === 1) {
      toast('At least one accused record is required', 'info')
      return
    }
    setAccusedList(accusedList.filter((a) => a.id !== id))
  }

  const handleUpdateAccused = (id: string, field: keyof AccusedForm, val: any) => {
    setAccusedList(
      accusedList.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    )
  }

  // =========================================================================
  // STEP 3: VICTIM DETAILS
  // =========================================================================
  interface VictimForm {
    id: string
    name: string
    isConfidential: boolean
    age: number
    gender: string
    address: string
    contact: string
    guardianDetails: string
    relationshipWithAccused: string
    injuryDetails: string
    medicalReportUploaded: boolean
    medicalReportFile: string
    statement164Uploaded: boolean
    statement164File: string
  }

  const [victimList, setVictimList] = useState<VictimForm[]>([
    {
      id: 'vic-1',
      name: caseType === 'POCSO' ? 'Victim X (Masked u/s 33 POCSO)' : 'Sanjay Singhal',
      isConfidential: caseType === 'POCSO',
      age: 34,
      gender: 'Male',
      address: 'Flat 102, Shanti Vihar, Rohini Sec 14, Delhi',
      contact: '+91-98101-55412',
      guardianDetails: 'N/A (Adult)',
      relationshipWithAccused: 'Former commercial partner',
      injuryDetails: 'Gunshot trauma to thoracic cavity resulting in hemorrhage',
      medicalReportUploaded: true,
      medicalReportFile: 'post_mortem_autopsy_29_2026.pdf',
      statement164Uploaded: true,
      statement164File: 'statement_sec164_magistrate.pdf',
    },
  ])

  const handleAddVictim = () => {
    const newVic: VictimForm = {
      id: `vic-${Date.now()}`,
      name: caseType === 'POCSO' ? `Victim ${victimList.length + 1} (Confidential)` : '',
      isConfidential: caseType === 'POCSO',
      age: 25,
      gender: 'Female',
      address: '',
      contact: '',
      guardianDetails: '',
      relationshipWithAccused: 'Acquaintance',
      injuryDetails: '',
      medicalReportUploaded: false,
      medicalReportFile: '',
      statement164Uploaded: false,
      statement164File: '',
    }
    setVictimList([...victimList, newVic])
  }

  const handleRemoveVictim = (id: string) => {
    if (victimList.length === 1) {
      toast('At least one victim record is required', 'info')
      return
    }
    setVictimList(victimList.filter((v) => v.id !== id))
  }

  const handleUpdateVictim = (id: string, field: keyof VictimForm, val: any) => {
    setVictimList(
      victimList.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    )
  }

  // =========================================================================
  // STEP 4: WITNESSES AND PEOPLE INVOLVED
  // =========================================================================
  interface WitnessForm {
    id: string
    name: string
    type: 'Eyewitness' | 'Expert' | 'Complainant' | 'Police/Panch' | 'Other'
    contact: string
    statementSummary: string
    documentUploaded: boolean
    documentName: string
  }

  const [witnessList, setWitnessList] = useState<WitnessForm[]>([
    {
      id: 'wit-1',
      name: 'Mohit Khurana',
      type: 'Eyewitness',
      contact: '+91-98711-40918',
      statementSummary: 'Present at spot. Saw accused brandish country pistol and discharge rounds.',
      documentUploaded: true,
      documentName: 'sec161_statement_mohit_khurana.pdf',
    },
    {
      id: 'wit-2',
      name: 'Dr. Ramesh Chandra (CMO, RML Hospital)',
      type: 'Expert',
      contact: '+91-98110-33290',
      statementSummary: 'Post-mortem examination surgeon confirming gunshot wound trajectory.',
      documentUploaded: true,
      documentName: 'expert_deposition_dr_chandra.pdf',
    },
  ])

  const handleAddWitness = () => {
    setWitnessList([
      ...witnessList,
      {
        id: `wit-${Date.now()}`,
        name: '',
        type: 'Eyewitness',
        contact: '',
        statementSummary: '',
        documentUploaded: false,
        documentName: '',
      },
    ])
  }

  const handleRemoveWitness = (id: string) => {
    setWitnessList(witnessList.filter((w) => w.id !== id))
  }

  const handleUpdateWitness = (id: string, field: keyof WitnessForm, val: any) => {
    setWitnessList(
      witnessList.map((w) => (w.id === id ? { ...w, [field]: val } : w))
    )
  }

  // =========================================================================
  // STEP 5: EVIDENCE TRACKER (6 Categories + Chain of Custody)
  // =========================================================================
  type EvidenceCategory =
    | 'circumstantial'
    | 'forensic'
    | 'chemical'
    | 'physical'
    | 'documentary'
    | 'oral'

  interface EvidenceItem {
    id: string
    category: EvidenceCategory
    code: string
    description: string
    source: string
    dateCollected: string
    collectedBy: string
    status: 'Collected' | 'Sent to lab' | 'Report received' | 'Produced in court'
    filesCount: number
    // Extra specific fields
    forensicSubType?: string
    labName?: string
    reportNumber?: string
    chemicalSubstance?: string
    chainOfCustody: {
      handedBy: string
      receivedBy: string
      dateTime: string
      purpose: string
    }[]
  }

  const [activeEvidenceTab, setActiveEvidenceTab] =
    useState<EvidenceCategory>('forensic')

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([
    {
      id: 'ev-1',
      category: 'forensic',
      code: 'EX-P-1',
      description: 'Spent .32 bore cartridge case retrieved from crime scene pavement',
      source: 'Crime Scene / Spot Inspection',
      dateCollected: '2026-03-10',
      collectedBy: 'Insp. Pradeep Rawat (Lead IO)',
      status: 'Report received',
      forensicSubType: 'Ballistics',
      labName: 'FSL Rohini, Forensic Ballistics Division',
      reportNumber: 'FSL/2026/BAL-9912',
      filesCount: 2,
      chainOfCustody: [
        {
          handedBy: 'Insp. Pradeep Rawat',
          receivedBy: 'Malkhana Incharge SI Anil',
          dateTime: '2026-03-10 18:30 IST',
          purpose: 'Safe custody in sealed tamper-proof cloth container',
        },
        {
          handedBy: 'SI Anil',
          receivedBy: 'FSL Courier HC Ramesh',
          dateTime: '2026-03-12 10:00 IST',
          purpose: 'Dispatched to FSL Rohini for ballistic comparison',
        },
      ],
    },
    {
      id: 'ev-2',
      category: 'physical',
      code: 'EX-P-2',
      description: 'Country-made .32 bore pistol recovered pursuant to Sec 27 disclosure memo',
      source: 'Hidden wall cavity at abandoned warehouse',
      dateCollected: '2026-03-14',
      collectedBy: 'Lead IO in presence of independent panch witnesses',
      status: 'Produced in court',
      filesCount: 3,
      chainOfCustody: [
        {
          handedBy: 'Insp. Pradeep Rawat',
          receivedBy: 'Malkhana Incharge',
          dateTime: '2026-03-14 16:45 IST',
          purpose: 'Court seizure registration',
        },
      ],
    },
    {
      id: 'ev-3',
      category: 'documentary',
      code: 'EX-P-3',
      description: 'CCTV DVR extract showing suspect fleeing scene at 21:14 hrs',
      source: 'CCTV Camera 04, Commercial Complex',
      dateCollected: '2026-03-11',
      collectedBy: 'Cyber Cell Forensic Inspector',
      status: 'Report received',
      filesCount: 1,
      chainOfCustody: [
        {
          handedBy: 'Premises Owner',
          receivedBy: 'Cyber Cell IO',
          dateTime: '2026-03-11 11:00 IST',
          purpose: 'Hash checksum generation & Sec 63 BSA certificate',
        },
      ],
    },
  ])

  const handleAddEvidenceItem = (cat: EvidenceCategory) => {
    const nextNum = evidenceList.length + 1
    const newEv: EvidenceItem = {
      id: `ev-${Date.now()}`,
      category: cat,
      code: `EX-P-${nextNum}`,
      description: '',
      source: '',
      dateCollected: new Date().toISOString().split('T')[0],
      collectedBy: ioName,
      status: 'Collected',
      filesCount: 1,
      chainOfCustody: [
        {
          handedBy: ioName,
          receivedBy: 'Court Malkhana',
          dateTime: new Date().toLocaleString(),
          purpose: 'Registration in evidentiary register',
        },
      ],
    }
    setEvidenceList([...evidenceList, newEv])
  }

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(evidenceList.filter((e) => e.id !== id))
  }

  // =========================================================================
  // STEP 6: INVESTIGATION DOCUMENTS (POLICE / IO)
  // =========================================================================
  const [ioName, setIoName] = useState('Insp. Pradeep Rawat')
  const [ioRank, setIoRank] = useState('Inspector of Police')
  const [ioPhone, setIoPhone] = useState('+91-98110-33412')
  const [ioEmail, setIoEmail] = useState('rawat.p@delhipolice.gov.in')

  interface ChecklistDoc {
    id: string
    title: string
    status: 'Pending' | 'Uploaded' | 'Verified'
    fileName?: string
  }

  const [investigationDocs, setInvestigationDocs] = useState<ChecklistDoc[]>([
    { id: 'inv-1', title: 'FIR Copy (First Information Report)', status: 'Verified', fileName: 'fir_29_2026_certified.pdf' },
    { id: 'inv-2', title: 'Arrest Memo & Seizure Memo (Panchnama)', status: 'Verified', fileName: 'arrest_panchnama_vikas.pdf' },
    { id: 'inv-3', title: 'Spot / Scene of Crime Inspection Report', status: 'Verified', fileName: 'crime_scene_inspection_spot.pdf' },
    { id: 'inv-4', title: 'Post-Mortem / Medical Trauma Report', status: 'Verified', fileName: 'autopsy_report_rml.pdf' },
    { id: 'inv-5', title: 'Forensic (FSL) Chemical & Ballistic Reports', status: 'Uploaded', fileName: 'fsl_ballistics_report_2026.pdf' },
    { id: 'inv-6', title: 'Witness Statements (Sec. 161 / 164)', status: 'Verified', fileName: 'statements_161_164_bundle.pdf' },
    { id: 'inv-7', title: 'Confession / Remand Application Papers', status: 'Uploaded', fileName: 'remand_order_march2026.pdf' },
    { id: 'inv-8', title: 'Call Detail Records (CDR) & CCTV Forensic Drive', status: 'Uploaded', fileName: 'cdr_cell_tower_dump.xlsx' },
    { id: 'inv-9', title: 'Charge Sheet / Final Investigation Report', status: 'Verified', fileName: 'chargesheet_cs_29_final.pdf' },
  ])

  interface ProgressLog {
    id: string
    date: string
    actionTaken: string
    nextActionDate: string
  }

  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([
    {
      id: 'log-1',
      date: '2026-03-14',
      actionTaken: 'Recovery of weapon executed under Sec 27 disclosure; accused formally arrested.',
      nextActionDate: '2026-03-24',
    },
    {
      id: 'log-2',
      date: '2026-04-10',
      actionTaken: 'FSL report received; charge-sheet completed and filed before magistrate.',
      nextActionDate: '2026-05-15',
    },
  ])

  const handleAddProgressLog = () => {
    setProgressLogs([
      ...progressLogs,
      {
        id: `log-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        actionTaken: '',
        nextActionDate: '2026-11-05',
      },
    ])
  }

  // =========================================================================
  // STEP 7: DOCUMENTS REQUIRED FOR JUDGEMENT
  // =========================================================================
  interface JudgmentCheckItem {
    id: string
    title: string
    status: 'Pending' | 'Ready' | 'Verified'
    isReviewed: boolean
    notes?: string
  }

  const [judgmentChecklist, setJudgmentChecklist] = useState<JudgmentCheckItem[]>([
    { id: 'jud-1', title: 'Charge sheet and charges framed', status: 'Verified', isReviewed: true },
    { id: 'jud-2', title: 'Evidence list and exhibit list (Ex. P-1 to P-5)', status: 'Verified', isReviewed: true },
    { id: 'jud-3', title: 'Witness deposition and cross-examination records', status: 'Verified', isReviewed: true },
    { id: 'jud-4', title: 'Forensic and medical autopsy reports', status: 'Ready', isReviewed: true },
    { id: 'jud-5', title: 'Prosecution arguments and defense arguments', status: 'Ready', isReviewed: true },
    { id: 'jud-6', title: 'Bail orders and previous interlocutory court orders', status: 'Ready', isReviewed: true },
    { id: 'jud-7', title: 'Victim impact statement', status: 'Ready', isReviewed: true },
    { id: 'jud-8', title: 'Criminal history record of the accused', status: 'Ready', isReviewed: true },
    { id: 'jud-9', title: 'Case law / binding precedent references', status: 'Ready', isReviewed: true },
  ])

  const [judgeNotes, setJudgeNotes] = useState(
    'Ocular testimony of PW-1 is consistent and corroborated by Ballistic FSL Exhibit P-1. Chain of custody confirmed unbroken. Defense alibi not proved with contemporaneous records.'
  )
  const [precedentReferences, setPrecedentReferences] = useState(
    'Sharad Birdhichand Sarda v. State of Maharashtra (1984) 4 SCC 116; Pulukuri Kottaya v. Emperor (1947) AIR PC 67.'
  )
  const [judgmentVerdict, setJudgmentVerdict] = useState<
    'Convicted' | 'Acquitted' | 'Discharged'
  >('Convicted')
  const [judgmentSentencing, setJudgmentSentencing] = useState(
    'Rigorous Imprisonment for 20 Years and Fine of Rs. 50,000/- u/s 103 BNS.'
  )
  const [judgmentReasons, setJudgmentReasons] = useState(
    'Guilt established beyond all reasonable doubt through ocular witness, ballistic match, and valid Section 27 recovery.'
  )

  const reviewedCount = judgmentChecklist.filter((j) => j.isReviewed).length
  const totalJudgmentItems = judgmentChecklist.length

  // =========================================================================
  // STEP 8: SUBMIT
  // =========================================================================
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitCase = () => {
    setIsSubmitting(true)

    try {
      const primaryAcc = accusedList[0] || {
        fullName: 'Unknown Accused',
        roleInCrime: 'Main Accused',
      }

      const casePayload: Omit<FullCaseRecord, 'id'> = {
        number: autoCaseNumber,
        title: `${caseType === 'POCSO' ? 'State' : 'State (NCT of Delhi)'} vs. ${primaryAcc.fullName} (U/S ${statutorySections.join(', ')})`,
        type: caseType === 'POCSO' ? 'POCSO' : caseType === 'Civil' ? 'Civil' : 'Criminal',
        court: courtName,
        acts: statutorySections,
        stage: caseStatus,
        status: 'ontrack',
        filingDate,
        nextHearing: '2026-10-28',
        judge: judgeName,
        policeStation,
        fir: { no: firNumber, date: firDate },
        io: {
          name: ioName,
          rank: ioRank,
          badge: 'DL-POL-9921',
          policeStation,
          phone: ioPhone,
          chargesheetRef: `CS-${firNumber} (${filingDate})`,
        },
        parties: [
          { role: 'Prosecutor', name: 'State Public Prosecutor' },
          { role: 'Complainant / Offended Party', name: 'State / Informant' },
          ...accusedList.map((a) => ({
            role: 'Accused' as const,
            name: a.fullName,
            custody: a.arrestStatus === 'Arrested' ? ('In custody' as const) : ('On bail' as const),
          })),
          ...victimList.map((v) => ({
            role: 'Victim' as const,
            name: v.name,
            masked: v.isConfidential,
          })),
        ],
        victims: {
          total: victimList.length,
          minors: victimList.filter((v) => v.age < 18).length,
          adults: victimList.filter((v) => v.age >= 18).length,
          details: victimList.map((v) => ({
            name: v.name,
            masked: v.isConfidential,
            age: v.age,
            relationship: v.relationshipWithAccused,
          })),
        },
        weapons: accusedList
          .filter((a) => a.weaponUsed)
          .map((a, idx) => ({
            id: `wpn-${Date.now()}-${idx}`,
            type: 'FIREARM',
            makeModel: a.weaponDescription || 'Recovered Weapon',
            serialNumber: 'DEFACED / LAB TAGGED',
            recoveryMemo: `Seizure Panchnama from ${a.fullName}`,
            recoveryDate: a.arrestDate || filingDate,
            recoveryPlace: incidentPlace,
            ballisticStatus: 'MATCHED',
            notes: 'Recovered under Sec 27',
          })),
        evidence: evidenceList.map((e) => ({
          id: e.id,
          code: e.code,
          kind: e.category === 'forensic' ? 'Forensic' : e.category === 'documentary' ? 'Documentary' : 'Circumstantial',
          title: e.description || e.code,
          detail: `Collected from ${e.source} by ${e.collectedBy}. Status: ${e.status}`,
          custodyOfficer: e.collectedBy,
          date: e.dateCollected,
          place: e.source,
          labStatus: e.status === 'Report received' ? 'received' : 'pending',
          admission: 'admitted',
          chainHash: '9a8b7c6d5e4f3a2b1c0d',
        })),
        documents: [],
        hearings: [],
        additionalDetails: caseSummary,
        isClosed: caseStatus === 'Closed',
      }

      const created = judicialStore.ingestNewCase(casePayload)
      setSubmittedCaseNumber(created.number)
      setSubmittedCaseId(created.id)
      setCurrentStep(9) // Step 9 is Success Screen!
      toast(`Case docket ${created.number} successfully created!`, 'ok')
      if (onSuccess) onSuccess(created.id)
    } catch (err: any) {
      toast(err.message || 'Error occurred while saving case', 'bad')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  // Wizard Step Labels
  const STEP_TITLES = [
    'Case Details',
    'Accused / Criminal Details',
    'Victim Details',
    'Witnesses & People Involved',
    'Evidence Tracker',
    'Investigation Documents',
    'Documents for Judgement',
    'Review & Submit',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border-2 border-black/15 bg-white text-zinc-900 shadow-2xl overflow-hidden">
        {/* Wizard Header */}
        <div className="bg-[#121316] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white/10 grid place-items-center text-[#FF5C5C]">
              <Scale className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-base sm:text-lg font-black tracking-tight text-white">
                  Intake New Judicial Case Docket
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  8-STEP FORM
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {currentStep <= 8 ? `STEP ${currentStep} of 8: ${STEP_TITLES[currentStep - 1]}` : 'DOCKET REGISTRATION COMPLETE'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white grid place-items-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Progress Pill Strip */}
        {currentStep <= 8 && (
          <div className="bg-zinc-100 px-4 py-2.5 border-b border-black/10 overflow-x-auto flex items-center gap-1.5 shrink-0 text-xs">
            {STEP_TITLES.map((title, idx) => {
              const stepNum = idx + 1
              const isActive = currentStep === stepNum
              const isDone = currentStep > stepNum
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(stepNum)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-white text-zinc-600 hover:bg-zinc-200 border border-black/5'
                  }`}
                >
                  <span
                    className={`size-4 rounded-full text-[9px] font-black grid place-items-center ${
                      isActive ? 'bg-[#FF5C5C] text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {isDone ? '✓' : stepNum}
                  </span>
                  <span>{title}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Wizard Body Scroll Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* ================================================================= */}
          {/* STEP 1: CASE DETAILS                                              */}
          {/* ================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-black/10 pb-3">
                <h3 className="font-sans text-base font-black text-zinc-900">
                  STEP 1 – Primary Judicial Case Details
                </h3>
                <p className="text-xs text-zinc-500">
                  Assign statutory classification, FIR provenance, and applied legal sections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Auto-generated Case Number */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 flex items-center justify-between">
                    <span>Case Number (Auto-Generated)</span>
                    <span className="text-[10px] text-emerald-600 font-mono">CNR FORMAT</span>
                  </label>
                  <input
                    type="text"
                    value={autoCaseNumber}
                    readOnly
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-zinc-100 font-mono font-bold text-zinc-800 outline-none select-all"
                  />
                </div>

                {/* Case Type Dropdown */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Case Type</label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value as any)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                  >
                    <option value="Criminal">Criminal</option>
                    <option value="POCSO">POCSO</option>
                    <option value="Divorce/Family">Divorce/Family</option>
                    <option value="Civil">Civil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Court Name */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Court Name</label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                    required
                  />
                </div>

                {/* Judge Name */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Judge Name</label>
                  <input
                    type="text"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                    required
                  />
                </div>

                {/* Police Station */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Police Station</label>
                  <input
                    type="text"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                    required
                  />
                </div>

                {/* FIR Number & Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">FIR Number</label>
                    <input
                      type="text"
                      value={firNumber}
                      onChange={(e) => setFirNumber(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700">FIR Date</label>
                    <input
                      type="date"
                      value={firDate}
                      onChange={(e) => setFirDate(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Date & Place of Incident */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Date of Incident</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Place of Incident</label>
                  <input
                    type="text"
                    value={incidentPlace}
                    onChange={(e) => setIncidentPlace(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                    required
                  />
                </div>

                {/* Date Case Was Filed & Case Status */}
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Date Case Was Filed</label>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700">Case Status</label>
                  <select
                    value={caseStatus}
                    onChange={(e) => setCaseStatus(e.target.value as any)}
                    className="w-full h-11 px-3.5 rounded-xl border border-black/15 bg-white font-semibold text-zinc-800 outline-none"
                  >
                    <option value="Registered">Registered</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Chargesheet Filed">Chargesheet Filed</option>
                    <option value="Trial">Trial</option>
                    <option value="Judgement Reserved">Judgement Reserved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Sections of Law Applied (Multi-Select Tags) */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-xs text-zinc-700 block">
                  Sections of Law Applied (IPC/BNS, POCSO, CrPC/BNSS, Arms Act)
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border border-black/15 bg-zinc-50/50">
                  {statutorySections.map((sec) => (
                    <span
                      key={sec}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-mono font-bold"
                    >
                      <span>{sec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sec)}
                        className="hover:text-[#FF5C5C] cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <input
                      type="text"
                      value={newSectionInput}
                      onChange={(e) => setNewSectionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSection()
                        }
                      }}
                      placeholder="Type section (e.g. BNS 105) & press Add"
                      className="flex-1 h-8 px-2 text-xs font-semibold bg-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-xs font-bold text-zinc-800 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Brief Case Summary */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-xs text-zinc-700 block">Brief Case Summary</label>
                <textarea
                  rows={3}
                  value={caseSummary}
                  onChange={(e) => setCaseSummary(e.target.value)}
                  placeholder="Summarize the core legal complaint and alleged offenses..."
                  className="w-full p-3 rounded-2xl border border-black/15 bg-white text-xs font-medium text-zinc-800 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: ACCUSED / CRIMINAL DETAILS (REPEATABLE CARDS)             */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <div>
                  <h3 className="font-sans text-base font-black text-zinc-900">
                    STEP 2 – Accused / Criminal Details
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Add all co-accused persons, custody statuses, weapons, and previous criminal records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAccused}
                  className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Accused</span>
                </button>
              </div>

              <div className="space-y-4">
                {accusedList.map((acc, idx) => (
                  <div
                    key={acc.id}
                    className="p-4 sm:p-5 rounded-3xl border-2 border-black/10 bg-zinc-50/70 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-black text-white text-xs font-mono font-bold grid place-items-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-sans font-black text-sm text-zinc-900">
                          {acc.fullName || `Accused #${idx + 1}`}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                          {acc.roleInCrime}
                        </span>
                      </div>

                      {accusedList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAccused(acc.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={acc.fullName}
                          onChange={(e) => handleUpdateAccused(acc.id, 'fullName', e.target.value)}
                          placeholder="e.g. Vikas Yadav"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Alias / Street Moniker</label>
                        <input
                          type="text"
                          value={acc.alias}
                          onChange={(e) => handleUpdateAccused(acc.id, 'alias', e.target.value)}
                          placeholder="e.g. Vicky"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Role in Crime</label>
                        <select
                          value={acc.roleInCrime}
                          onChange={(e) => handleUpdateAccused(acc.id, 'roleInCrime', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        >
                          <option value="Main Accused">Main Accused</option>
                          <option value="Accomplice">Accomplice</option>
                          <option value="Abettor">Abettor</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Age / Date of Birth</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={acc.age}
                            onChange={(e) => handleUpdateAccused(acc.id, 'age', parseInt(e.target.value) || 0)}
                            placeholder="Age"
                            className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                          <input
                            type="date"
                            value={acc.dob}
                            onChange={(e) => handleUpdateAccused(acc.id, 'dob', e.target.value)}
                            className="w-full h-10 px-2 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Gender</label>
                        <select
                          value={acc.gender}
                          onChange={(e) => handleUpdateAccused(acc.id, 'gender', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={acc.phone}
                          onChange={(e) => handleUpdateAccused(acc.id, 'phone', e.target.value)}
                          placeholder="+91-XXXXX-XXXXX"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-zinc-700 block mb-1">Residential Address</label>
                        <input
                          type="text"
                          value={acc.address}
                          onChange={(e) => handleUpdateAccused(acc.id, 'address', e.target.value)}
                          placeholder="Complete residential address"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">ID Proof (Type &amp; Number)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={acc.idProofType}
                            onChange={(e) => handleUpdateAccused(acc.id, 'idProofType', e.target.value)}
                            className="w-full h-10 px-2 rounded-xl border border-black/15 bg-white font-semibold outline-none text-xs"
                          >
                            <option value="Aadhaar Card">Aadhaar</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Passport">Passport</option>
                            <option value="PAN Card">PAN</option>
                          </select>
                          <input
                            type="text"
                            value={acc.idProofNumber}
                            onChange={(e) => handleUpdateAccused(acc.id, 'idProofNumber', e.target.value)}
                            placeholder="ID Number"
                            className="w-full h-10 px-2.5 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      {/* Arrest Status & Bail */}
                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Arrest Status</label>
                        <select
                          value={acc.arrestStatus}
                          onChange={(e) => handleUpdateAccused(acc.id, 'arrestStatus', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        >
                          <option value="Not Arrested">Not Arrested</option>
                          <option value="Arrested">Arrested</option>
                          <option value="Absconding">Absconding</option>
                          <option value="Bail Granted">Bail Granted</option>
                        </select>
                      </div>

                      {acc.arrestStatus === 'Arrested' && (
                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Arrest Date</label>
                          <input
                            type="date"
                            value={acc.arrestDate}
                            onChange={(e) => handleUpdateAccused(acc.id, 'arrestDate', e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>
                      )}

                      {acc.arrestStatus === 'Bail Granted' && (
                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Bail Order Details</label>
                          <input
                            type="text"
                            value={acc.bailDetails}
                            onChange={(e) => handleUpdateAccused(acc.id, 'bailDetails', e.target.value)}
                            placeholder="Surety amount, bail order date"
                            className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>
                      )}

                      {/* Photo Upload slot */}
                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Photo Upload</label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 h-10 px-3 rounded-xl border border-dashed border-black/30 bg-white hover:bg-zinc-50 flex items-center justify-center gap-2 text-zinc-600 font-semibold cursor-pointer">
                            <Upload className="size-3.5" />
                            <span className="truncate">{acc.photoName || 'Upload Mugshot / Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleUpdateAccused(acc.id, 'photoName', f.name)
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Previous Criminal History Toggle */}
                    <div className="p-3 rounded-2xl bg-white border border-black/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-800">
                          Previous Criminal History / Prior Convictions?
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                            <input
                              type="radio"
                              name={`history-${acc.id}`}
                              checked={acc.hasPreviousHistory}
                              onChange={() => handleUpdateAccused(acc.id, 'hasPreviousHistory', true)}
                            />
                            Yes
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                            <input
                              type="radio"
                              name={`history-${acc.id}`}
                              checked={!acc.hasPreviousHistory}
                              onChange={() => handleUpdateAccused(acc.id, 'hasPreviousHistory', false)}
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {acc.hasPreviousHistory && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <input
                            type="text"
                            value={acc.previousCaseNumbers}
                            onChange={(e) => handleUpdateAccused(acc.id, 'previousCaseNumbers', e.target.value)}
                            placeholder="Previous Case Numbers / FIRs"
                            className="h-9 px-3 rounded-xl border border-black/15 bg-zinc-50 font-medium outline-none"
                          />
                          <input
                            type="text"
                            value={acc.previousCaseDetails}
                            onChange={(e) => handleUpdateAccused(acc.id, 'previousCaseDetails', e.target.value)}
                            placeholder="Offenses, trial status, or sentences"
                            className="h-9 px-3 rounded-xl border border-black/15 bg-zinc-50 font-medium outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Weapon Used Toggle */}
                    <div className="p-3 rounded-2xl bg-white border border-black/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-800">Weapon Used by this Accused?</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                            <input
                              type="radio"
                              name={`weapon-${acc.id}`}
                              checked={acc.weaponUsed}
                              onChange={() => handleUpdateAccused(acc.id, 'weaponUsed', true)}
                            />
                            Yes
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                            <input
                              type="radio"
                              name={`weapon-${acc.id}`}
                              checked={!acc.weaponUsed}
                              onChange={() => handleUpdateAccused(acc.id, 'weaponUsed', false)}
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {acc.weaponUsed && (
                        <input
                          type="text"
                          value={acc.weaponDescription}
                          onChange={(e) => handleUpdateAccused(acc.id, 'weaponDescription', e.target.value)}
                          placeholder="Weapon description (e.g. .32 pistol, iron rod, knife, machete)"
                          className="w-full h-9 px-3 rounded-xl border border-black/15 bg-zinc-50 font-medium outline-none"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: VICTIM DETAILS                                            */}
          {/* ================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-sans text-base font-black text-zinc-900">
                      STEP 3 – Victim Details
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold">
                      Total Victims: {victimList.length}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Record affected persons, minors, guardian info, medical reports, and Section 164 statements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVictim}
                  className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Victim</span>
                </button>
              </div>

              <div className="space-y-4">
                {victimList.map((vic, idx) => (
                  <div
                    key={vic.id}
                    className="p-4 sm:p-5 rounded-3xl border-2 border-black/10 bg-zinc-50/70 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-rose-600 text-white text-xs font-mono font-bold grid place-items-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-sans font-black text-sm text-zinc-900">
                          {vic.isConfidential ? 'Protected Victim (Identity Masked)' : vic.name || `Victim #${idx + 1}`}
                        </h4>
                        {vic.age < 18 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                            MINOR ({vic.age} YRS)
                          </span>
                        )}
                      </div>

                      {victimList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVictim(vic.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-zinc-700">Victim Legal Name</label>
                          <label className="flex items-center gap-1 text-[11px] font-bold text-rose-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vic.isConfidential}
                              onChange={(e) =>
                                handleUpdateVictim(vic.id, 'isConfidential', e.target.checked)
                              }
                            />
                            <span>Confidential Identity</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={vic.name}
                          onChange={(e) => handleUpdateVictim(vic.id, 'name', e.target.value)}
                          placeholder="e.g. Sanjay Singhal or Victim X"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Age</label>
                        <input
                          type="number"
                          value={vic.age}
                          onChange={(e) => handleUpdateVictim(vic.id, 'age', parseInt(e.target.value) || 0)}
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Gender</label>
                        <select
                          value={vic.gender}
                          onChange={(e) => handleUpdateVictim(vic.id, 'gender', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Relationship with Accused</label>
                        <input
                          type="text"
                          value={vic.relationshipWithAccused}
                          onChange={(e) => handleUpdateVictim(vic.id, 'relationshipWithAccused', e.target.value)}
                          placeholder="e.g. Acquaintance, stranger, former associate"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={vic.contact}
                          onChange={(e) => handleUpdateVictim(vic.id, 'contact', e.target.value)}
                          placeholder="+91-XXXXX-XXXXX"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      {vic.age < 18 ? (
                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">
                            Guardian Details (Mandatory for Minor)
                          </label>
                          <input
                            type="text"
                            value={vic.guardianDetails}
                            onChange={(e) => handleUpdateVictim(vic.id, 'guardianDetails', e.target.value)}
                            placeholder="Parent / Legal Guardian name & relation"
                            className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                            required
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Address</label>
                          <input
                            type="text"
                            value={vic.address}
                            onChange={(e) => handleUpdateVictim(vic.id, 'address', e.target.value)}
                            placeholder="Residential address"
                            className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>
                      )}

                      <div className="sm:col-span-3">
                        <label className="font-bold text-zinc-700 block mb-1">Injury / Loss Details</label>
                        <input
                          type="text"
                          value={vic.injuryDetails}
                          onChange={(e) => handleUpdateVictim(vic.id, 'injuryDetails', e.target.value)}
                          placeholder="Specific bodily injuries, psychological trauma, or property losses"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      {/* Medical Report Upload */}
                      <div className="p-3 rounded-2xl bg-white border border-black/10 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-zinc-800">
                          <span>Medical Report Uploaded?</span>
                          <input
                            type="checkbox"
                            checked={vic.medicalReportUploaded}
                            onChange={(e) => handleUpdateVictim(vic.id, 'medicalReportUploaded', e.target.checked)}
                          />
                        </div>
                        {vic.medicalReportUploaded && (
                          <label className="h-9 px-3 rounded-xl border border-dashed border-black/30 bg-zinc-50 flex items-center gap-2 cursor-pointer text-zinc-600 font-semibold truncate">
                            <Upload className="size-3 shrink-0" />
                            <span className="truncate">{vic.medicalReportFile || 'Upload Medical / Autopsy PDF'}</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleUpdateVictim(vic.id, 'medicalReportFile', f.name)
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Sec 164 Statement Upload */}
                      <div className="p-3 rounded-2xl bg-white border border-black/10 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-zinc-800">
                          <span>Sec 164 Statement Uploaded?</span>
                          <input
                            type="checkbox"
                            checked={vic.statement164Uploaded}
                            onChange={(e) => handleUpdateVictim(vic.id, 'statement164Uploaded', e.target.checked)}
                          />
                        </div>
                        {vic.statement164Uploaded && (
                          <label className="h-9 px-3 rounded-xl border border-dashed border-black/30 bg-zinc-50 flex items-center gap-2 cursor-pointer text-zinc-600 font-semibold truncate">
                            <Upload className="size-3 shrink-0" />
                            <span className="truncate">{vic.statement164File || 'Upload Magistrate 164 Statement PDF'}</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) handleUpdateVictim(vic.id, 'statement164File', f.name)
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: WITNESSES AND PEOPLE INVOLVED                             */}
          {/* ================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <div>
                  <h3 className="font-sans text-base font-black text-zinc-900">
                    STEP 4 – Witnesses &amp; People Involved
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Record eyewitnesses, forensic specialists, medical officers, and deposition records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddWitness}
                  className="px-3.5 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Witness</span>
                </button>
              </div>

              <div className="space-y-3">
                {witnessList.map((wit, idx) => (
                  <div
                    key={wit.id}
                    className="p-4 rounded-2xl border border-black/15 bg-zinc-50/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-zinc-800 text-white text-xs font-mono font-bold grid place-items-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-zinc-900">
                          {wit.name || `Witness #${idx + 1}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                          {wit.type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveWitness(wit.id)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Witness Name</label>
                        <input
                          type="text"
                          value={wit.name}
                          onChange={(e) => handleUpdateWitness(wit.id, 'name', e.target.value)}
                          placeholder="e.g. Mohit Khurana"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Witness Type</label>
                        <select
                          value={wit.type}
                          onChange={(e) => handleUpdateWitness(wit.id, 'type', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        >
                          <option value="Eyewitness">Eyewitness</option>
                          <option value="Expert">Expert (Forensic / Medical)</option>
                          <option value="Complainant">Complainant</option>
                          <option value="Police/Panch">Police / Panch Witness</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={wit.contact}
                          onChange={(e) => handleUpdateWitness(wit.id, 'contact', e.target.value)}
                          placeholder="+91-XXXXX-XXXXX"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-zinc-700 block mb-1">Statement Summary</label>
                        <input
                          type="text"
                          value={wit.statementSummary}
                          onChange={(e) => handleUpdateWitness(wit.id, 'statementSummary', e.target.value)}
                          placeholder="Crucial statement points recorded under Sec 161"
                          className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-zinc-700 block mb-1">Statement Document Upload</label>
                        <label className="h-10 px-3 rounded-xl border border-dashed border-black/30 bg-white flex items-center gap-2 cursor-pointer text-zinc-600 font-semibold truncate">
                          <Upload className="size-3 shrink-0" />
                          <span className="truncate">{wit.documentName || 'Upload Statement PDF'}</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) {
                                handleUpdateWitness(wit.id, 'documentUploaded', true)
                                handleUpdateWitness(wit.id, 'documentName', f.name)
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: EVIDENCE TRACKER (6 TABS + CHAIN OF CUSTODY)              */}
          {/* ================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-black/10 pb-3">
                <h3 className="font-sans text-base font-black text-zinc-900">
                  STEP 5 – Evidence Tracker &amp; Chain of Custody
                </h3>
                <p className="text-xs text-zinc-500">
                  Manage physical, forensic, chemical, documentary, and circumstantial exhibits with custody provenance.
                </p>
              </div>

              {/* Evidence Type Count Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { key: 'circumstantial', label: 'Circumstantial', count: evidenceList.filter((e) => e.category === 'circumstantial').length },
                  { key: 'forensic', label: 'Forensic', count: evidenceList.filter((e) => e.category === 'forensic').length },
                  { key: 'chemical', label: 'Chemical', count: evidenceList.filter((e) => e.category === 'chemical').length },
                  { key: 'physical', label: 'Physical', count: evidenceList.filter((e) => e.category === 'physical').length },
                  { key: 'documentary', label: 'Documentary', count: evidenceList.filter((e) => e.category === 'documentary').length },
                  { key: 'oral', label: 'Oral / Witness', count: witnessList.length },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveEvidenceTab(item.key as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeEvidenceTab === item.key
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-black/10 bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase font-bold block opacity-75">
                      {item.label}
                    </span>
                    <span className="font-mono text-lg font-black">{item.count}</span>
                  </button>
                ))}
              </div>

              {/* Active Tab Header & Add Evidence Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-zinc-800 uppercase font-mono">
                  Showing {activeEvidenceTab.toUpperCase()} Evidence Items ({evidenceList.filter((e) => e.category === activeEvidenceTab).length})
                </span>
                <button
                  type="button"
                  onClick={() => handleAddEvidenceItem(activeEvidenceTab)}
                  className="px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3" />
                  <span>Add {activeEvidenceTab.charAt(0).toUpperCase() + activeEvidenceTab.slice(1)} Evidence</span>
                </button>
              </div>

              {/* Filtered Evidence Items List */}
              <div className="space-y-4">
                {evidenceList
                  .filter((e) => e.category === activeEvidenceTab)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl border border-black/15 bg-zinc-50/70 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-black/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#FF5C5C] bg-white px-2 py-0.5 rounded border border-black/10">
                            {ev.code}
                          </span>
                          <span className="font-bold text-xs text-zinc-900">
                            {ev.description || 'New Evidence Item'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(ev.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-zinc-700 block mb-1">Description</label>
                          <input
                            type="text"
                            value={ev.description}
                            onChange={(e) => {
                              const val = e.target.value
                              setEvidenceList(
                                evidenceList.map((item) =>
                                  item.id === ev.id ? { ...item, description: val } : item
                                )
                              )
                            }}
                            placeholder="Detailed description of seized exhibit"
                            className="w-full h-9 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Status</label>
                          <select
                            value={ev.status}
                            onChange={(e) => {
                              const val = e.target.value as any
                              setEvidenceList(
                                evidenceList.map((item) =>
                                  item.id === ev.id ? { ...item, status: val } : item
                                )
                              )
                            }}
                            className="w-full h-9 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          >
                            <option value="Collected">Collected</option>
                            <option value="Sent to lab">Sent to lab</option>
                            <option value="Report received">Report received</option>
                            <option value="Produced in court">Produced in court</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Source / Location</label>
                          <input
                            type="text"
                            value={ev.source}
                            onChange={(e) => {
                              const val = e.target.value
                              setEvidenceList(
                                evidenceList.map((item) =>
                                  item.id === ev.id ? { ...item, source: val } : item
                                )
                              )
                            }}
                            placeholder="Seizure location or person"
                            className="w-full h-9 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Date Collected</label>
                          <input
                            type="date"
                            value={ev.dateCollected}
                            onChange={(e) => {
                              const val = e.target.value
                              setEvidenceList(
                                evidenceList.map((item) =>
                                  item.id === ev.id ? { ...item, dateCollected: val } : item
                                )
                              )
                            }}
                            className="w-full h-9 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-700 block mb-1">Collected By</label>
                          <input
                            type="text"
                            value={ev.collectedBy}
                            onChange={(e) => {
                              const val = e.target.value
                              setEvidenceList(
                                evidenceList.map((item) =>
                                  item.id === ev.id ? { ...item, collectedBy: val } : item
                                )
                              )
                            }}
                            placeholder="Officer name & rank"
                            className="w-full h-9 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                          />
                        </div>
                      </div>

                      {/* Chain of Custody Table */}
                      <div className="pt-2 border-t border-black/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-zinc-800 font-mono">Chain of Custody Logs</span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            {ev.chainOfCustody.length} transfers recorded
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white">
                          <table className="w-full text-left text-xs font-medium">
                            <thead className="bg-zinc-100 text-[10px] font-mono uppercase text-zinc-600 border-b border-black/10">
                              <tr>
                                <th className="p-2">Handed By</th>
                                <th className="p-2">Received By</th>
                                <th className="p-2">Date / Time</th>
                                <th className="p-2">Purpose</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                              {ev.chainOfCustody.map((c, cIdx) => (
                                <tr key={cIdx} className="hover:bg-zinc-50">
                                  <td className="p-2 font-semibold text-zinc-800">{c.handedBy}</td>
                                  <td className="p-2 font-semibold text-zinc-800">{c.receivedBy}</td>
                                  <td className="p-2 font-mono text-[11px] text-zinc-600">{c.dateTime}</td>
                                  <td className="p-2 text-zinc-600">{c.purpose}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}

                {evidenceList.filter((e) => e.category === activeEvidenceTab).length === 0 && (
                  <div className="p-6 text-center text-xs text-zinc-400 border-2 border-dashed border-black/10 rounded-2xl">
                    No evidence items added under {activeEvidenceTab} yet. Click '+ Add' above.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 6: INVESTIGATION DOCUMENTS (POLICE / IO)                     */}
          {/* ================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="border-b border-black/10 pb-3">
                <h3 className="font-sans text-base font-black text-zinc-900">
                  STEP 6 – Investigation Documents &amp; Police IO Records
                </h3>
                <p className="text-xs text-zinc-500">
                  Track investigating officer credentials, document verification checklist, and investigation progress logs.
                </p>
              </div>

              {/* Investigating Officer Details */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/10 space-y-3">
                <span className="font-mono font-bold text-xs uppercase text-zinc-600 block">
                  Lead Investigating Officer (IO) Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">IO Full Name</label>
                    <input
                      type="text"
                      value={ioName}
                      onChange={(e) => setIoName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">Rank / Designation</label>
                    <input
                      type="text"
                      value={ioRank}
                      onChange={(e) => setIoRank(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">Official Phone</label>
                    <input
                      type="tel"
                      value={ioPhone}
                      onChange={(e) => setIoPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">Official Email</label>
                    <input
                      type="email"
                      value={ioEmail}
                      onChange={(e) => setIoEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Investigation Documents Checklist */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-zinc-800 uppercase font-mono block">
                  Mandatory Police Investigation Dossiers Checklist
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {investigationDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl border border-black/10 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-zinc-900 truncate">{doc.title}</div>
                        <div className="text-[11px] font-mono text-zinc-500 truncate">
                          {doc.fileName || 'No file attached'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={doc.status}
                          onChange={(e) => {
                            const val = e.target.value as any
                            setInvestigationDocs(
                              investigationDocs.map((d) => (d.id === doc.id ? { ...d, status: val } : d))
                            )
                          }}
                          className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full outline-none ${
                            doc.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'Uploaded'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Uploaded">Uploaded</option>
                          <option value="Verified">Verified</option>
                        </select>

                        <label className="size-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 grid place-items-center cursor-pointer text-zinc-600">
                          <Upload className="size-3.5" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) {
                                setInvestigationDocs(
                                  investigationDocs.map((d) =>
                                    d.id === doc.id ? { ...d, status: 'Uploaded', fileName: f.name } : d
                                  )
                                )
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigation Progress Log */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs uppercase text-zinc-800 block">
                      Investigation Progress Log
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Feeds the "No Action Taken" statutory delinquency alert if next action date lapses.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProgressLog}
                    className="px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Add Entry</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {progressLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-white border border-black/10 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
                    >
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Date</label>
                        <input
                          type="date"
                          value={log.date}
                          onChange={(e) => {
                            const val = e.target.value
                            setProgressLogs(
                              progressLogs.map((l) => (l.id === log.id ? { ...l, date: val } : l))
                            )
                          }}
                          className="w-full h-8 px-2 rounded-lg border border-black/15 bg-zinc-50 font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Action Taken</label>
                        <input
                          type="text"
                          value={log.actionTaken}
                          onChange={(e) => {
                            const val = e.target.value
                            setProgressLogs(
                              progressLogs.map((l) => (l.id === log.id ? { ...l, actionTaken: val } : l))
                            )
                          }}
                          placeholder="Action executed by investigating team"
                          className="w-full h-8 px-2 rounded-lg border border-black/15 bg-zinc-50 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Next Action Date</label>
                        <input
                          type="date"
                          value={log.nextActionDate}
                          onChange={(e) => {
                            const val = e.target.value
                            setProgressLogs(
                              progressLogs.map((l) => (l.id === log.id ? { ...l, nextActionDate: val } : l))
                            )
                          }}
                          className="w-full h-8 px-2 rounded-lg border border-black/15 bg-zinc-50 font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 7: DOCUMENTS REQUIRED FOR JUDGEMENT                          */}
          {/* ================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="border-b border-black/10 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-base font-black text-zinc-900">
                    STEP 7 – Documents Required for Judgement
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-600">
                      Judgement Readiness: {reviewedCount} of {totalJudgmentItems} ready
                    </span>
                  </div>
                </div>
                {/* Readiness Progress Bar */}
                <div className="h-2 w-full bg-zinc-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(reviewedCount / totalJudgmentItems) * 100}%` }}
                  />
                </div>
              </div>

              {/* Judgment Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {judgmentChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-black/10 bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <label className="flex items-center gap-2.5 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.isReviewed}
                        onChange={(e) => {
                          const val = e.target.checked
                          setJudgmentChecklist(
                            judgmentChecklist.map((j) => (j.id === item.id ? { ...j, isReviewed: val } : j))
                          )
                        }}
                        className="size-4 rounded text-black accent-black cursor-pointer"
                      />
                      <span className={`font-bold truncate ${item.isReviewed ? 'text-zinc-900' : 'text-zinc-600'}`}>
                        {item.title}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <label className="size-6 rounded-md bg-zinc-100 hover:bg-zinc-200 grid place-items-center cursor-pointer text-zinc-600">
                        <Upload className="size-3" />
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Precedent References & Judge's Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Case Law / Precedent References</label>
                  <textarea
                    rows={3}
                    value={precedentReferences}
                    onChange={(e) => setPrecedentReferences(e.target.value)}
                    placeholder="Add citations, SCC references, and authoritative case links"
                    className="w-full p-3 rounded-2xl border border-black/15 bg-white text-xs font-medium text-zinc-800 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 block">Judge's Deliberation Notes (Rich Text)</label>
                  <textarea
                    rows={3}
                    value={judgeNotes}
                    onChange={(e) => setJudgeNotes(e.target.value)}
                    placeholder="Judicial observations on witness demeanour, forensic striations..."
                    className="w-full p-3 rounded-2xl border border-black/15 bg-white text-xs font-medium text-zinc-800 outline-none resize-none font-serif"
                  />
                </div>
              </div>

              {/* Final Judgement Fields */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/10 space-y-3 text-xs">
                <span className="font-mono font-bold uppercase text-zinc-700 block">
                  Final Judgement &amp; Decree Parameters
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">Verdict</label>
                    <select
                      value={judgmentVerdict}
                      onChange={(e) => setJudgmentVerdict(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-bold outline-none"
                    >
                      <option value="Convicted">Convicted</option>
                      <option value="Acquitted">Acquitted</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-zinc-700 block mb-1">Punishment / Sentence</label>
                    <input
                      type="text"
                      value={judgmentSentencing}
                      onChange={(e) => setJudgmentSentencing(e.target.value)}
                      placeholder="e.g. 20 Years Rigorous Imprisonment and Fine"
                      className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Reasons for Verdict</label>
                  <input
                    type="text"
                    value={judgmentReasons}
                    onChange={(e) => setJudgmentReasons(e.target.value)}
                    placeholder="Core legal reasoning supporting verdict"
                    className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white font-semibold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 8: REVIEW & SUBMIT                                           */}
          {/* ================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="border-b border-black/10 pb-3">
                <h3 className="font-sans text-base font-black text-zinc-900">
                  STEP 8 – Comprehensive Review &amp; Submit
                </h3>
                <p className="text-xs text-zinc-500">
                  Carefully verify all 7 preceding modules before official docket registration.
                </p>
              </div>

              {/* Missing Mandatory Documents Warnings */}
              {reviewedCount < totalJudgmentItems && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Judgement Readiness Notice:</span>
                    <span>
                      {totalJudgmentItems - reviewedCount} judgment items have not been marked as reviewed. You may still submit this intake docket to initiate preliminary court hearings.
                    </span>
                  </div>
                </div>
              )}

              {/* Read-Only Summary with Edit Links */}
              <div className="space-y-3 text-xs">
                {/* Summary Card 1: Case Details */}
                <div className="p-4 rounded-2xl border border-black/10 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                    <span className="font-black text-zinc-900 uppercase font-mono">
                      1. Case Identification &amp; Court
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-[#FF5C5C] hover:underline cursor-pointer"
                    >
                      Edit Step 1
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-600 font-medium">
                    <div><span className="text-zinc-400 block font-mono text-[10px]">CASE NUMBER:</span>{autoCaseNumber}</div>
                    <div><span className="text-zinc-400 block font-mono text-[10px]">TYPE:</span>{caseType}</div>
                    <div><span className="text-zinc-400 block font-mono text-[10px]">FIR:</span>{firNumber} ({firDate})</div>
                    <div><span className="text-zinc-400 block font-mono text-[10px]">STATUS:</span>{caseStatus}</div>
                  </div>
                </div>

                {/* Summary Card 2: Accused */}
                <div className="p-4 rounded-2xl border border-black/10 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                    <span className="font-black text-zinc-900 uppercase font-mono">
                      2. Accused Roster ({accusedList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#FF5C5C] hover:underline cursor-pointer"
                    >
                      Edit Step 2
                    </button>
                  </div>
                  <div className="space-y-1">
                    {accusedList.map((a, idx) => (
                      <div key={a.id} className="text-zinc-700">
                        <span className="font-bold">{idx + 1}. {a.fullName || 'Unnamed'}</span> ({a.alias ? `alias ${a.alias}, ` : ''}{a.roleInCrime}, {a.arrestStatus}) {a.weaponUsed ? '· Weapon: ' + a.weaponDescription : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Card 3: Victims */}
                <div className="p-4 rounded-2xl border border-black/10 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                    <span className="font-black text-zinc-900 uppercase font-mono">
                      3. Victims Manifest ({victimList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-[#FF5C5C] hover:underline cursor-pointer"
                    >
                      Edit Step 3
                    </button>
                  </div>
                  <div className="space-y-1">
                    {victimList.map((v, idx) => (
                      <div key={v.id} className="text-zinc-700">
                        <span className="font-bold">{idx + 1}. {v.isConfidential ? 'Protected Victim' : v.name}</span> ({v.age} yrs, {v.gender}) · {v.injuryDetails || 'No trauma recorded'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Card 4: Witnesses */}
                <div className="p-4 rounded-2xl border border-black/10 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                    <span className="font-black text-zinc-900 uppercase font-mono">
                      4. Witnesses ({witnessList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-bold text-[#FF5C5C] hover:underline cursor-pointer"
                    >
                      Edit Step 4
                    </button>
                  </div>
                  <div className="text-zinc-600">
                    {witnessList.map((w) => w.name || 'Unnamed').join(' · ')}
                  </div>
                </div>

                {/* Summary Card 5: Evidence & Checklist */}
                <div className="p-4 rounded-2xl border border-black/10 bg-white space-y-2">
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                    <span className="font-black text-zinc-900 uppercase font-mono">
                      5 &amp; 6. Evidentiary Items ({evidenceList.length}) &amp; Investigation Dossiers
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="text-xs font-bold text-[#FF5C5C] hover:underline cursor-pointer"
                    >
                      Edit Step 5 / 6
                    </button>
                  </div>
                  <div className="text-zinc-600">
                    {evidenceList.map((e) => `${e.code} (${e.description || e.category})`).join(' · ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 9: SUCCESS SCREEN                                            */}
          {/* ================================================================= */}
          {currentStep === 9 && (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
              <div className="size-16 rounded-3xl bg-emerald-100 text-emerald-800 grid place-items-center mx-auto shadow-md">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  DOCKET INGESTION &amp; REGISTRATION SUCCESSFUL
                </span>
                <h3 className="font-sans text-2xl font-black text-zinc-900">
                  Official Case Dossier Created
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  The case record has been generated and indexed in the Court of the Principal Sessions Judge database with certified barcode telemetry.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-100 border border-black/10 inline-block font-mono text-lg font-black text-[#FF5C5C]">
                {submittedCaseNumber}
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-black/15 bg-white hover:bg-zinc-50 font-bold text-xs text-zinc-800 cursor-pointer"
                >
                  Close &amp; Return to Dashboard
                </button>

                <a
                  href={`/cases/${submittedCaseId}`}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 font-bold text-xs text-white flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Open Full Case Record</span>
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        {currentStep <= 8 && (
          <div className="bg-zinc-50 px-6 py-4 border-t border-black/10 flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl border border-black/15 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Next: {STEP_TITLES[currentStep]}</span>
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitCase}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5C5C] hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Gavel className="size-4" />
                  <span>{isSubmitting ? 'Registering Docket...' : 'Submit Case Docket'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
