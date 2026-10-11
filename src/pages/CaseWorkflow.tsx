import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router'
import {
  FileText,
  Users,
  Eye,
  EyeOff,
  User,
  Shield,
  Gavel,
  Scale,
  Calendar,
  Clock,
  MapPin,
  FileCheck,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Award,
  Hash,
} from 'lucide-react'
import {
  judicialStore,
  type FullCaseRecord,
  type EvidenceRecord,
} from '../lib/judicialStore'
import { Button, Card, CardHeader, Tag, Input, Select, Field, useApp } from '../ui'

interface AccusedItem {
  id: string
  fullName: string
  alias: string
  age: string
  dob: string
  gender: string
  address: string
  phone: string
  idProofType: string
  idProofNumber: string
  photoUploaded: boolean
  role: 'main accused' | 'accomplice' | 'abettor'
  arrestStatus: 'not arrested' | 'arrested' | 'absconding' | 'bail granted'
  arrestDate: string
  bailDetails: string
  hasPreviousCriminalHistory: boolean
  previousCaseNumbers: string
  weaponUsed: boolean
  weaponDescription: string
}

interface VictimItem {
  id: string
  fullName: string
  isConfidential: boolean
  age: string
  gender: string
  address: string
  contact: string
  isMinor: boolean
  guardianDetails: string
  relationshipWithAccused: string
  injuryOrLossDetails: string
  medicalReportUploaded: boolean
  victimStatementUploaded: boolean
  statementRef: string
}

interface WitnessItem {
  id: string
  fullName: string
  type: 'eyewitness' | 'expert' | 'complainant' | 'police' | 'other'
  contact: string
  statementSummary: string
  documentUploaded: boolean
  documentName: string
}

interface ChainOfCustodyEntry {
  handedBy: string
  receivedBy: string
  dateTime: string
  purpose: string
}

interface ComprehensiveEvidenceItem {
  id: string
  evidenceId: string
  type: 'circumstantial' | 'forensic' | 'chemical' | 'physical' | 'documentary' | 'oral'
  description: string
  source: string
  linksToCrime: string
  dateCollected: string
  collectedBy: string
  forensicSubtype?: string
  labName?: string
  reportNumber?: string
  chemicalSubstance?: string
  chemicalLabAnalysis?: string
  physicalType?: string
  documentKind?: string
  linkedWitnessId?: string
  chainOfCustody: ChainOfCustodyEntry[]
  status: 'Collected' | 'Sent to lab' | 'Report received' | 'Produced in court'
  uploadedFiles: string[]
}

interface InvestigationDocItem {
  id: string
  name: string
  status: 'Pending' | 'Uploaded' | 'Verified'
  fileName?: string
}

interface ProgressLogEntry {
  id: string
  date: string
  actionTaken: string
  nextActionDate: string
}

interface JudgementDocCheckItem {
  id: string
  title: string
  isUploaded: boolean
  isReviewed: boolean
  status: 'Pending' | 'Uploaded' | 'Reviewed'
}

type StepKey =
  | 'details'
  | 'accused'
  | 'victims'
  | 'witnesses'
  | 'evidence'
  | 'investigation'
  | 'judgement-documents'
  | 'review'

const STEP_DEFINITIONS: { key: StepKey; stepNumber: number; title: string; subtitle: string }[] = [
  { key: 'details', stepNumber: 1, title: 'Case Details', subtitle: 'CNR, Court, FIR & Sections' },
  { key: 'accused', stepNumber: 2, title: 'Accused', subtitle: 'Demographics, Role & Arrest' },
  { key: 'victims', stepNumber: 3, title: 'Victims', subtitle: 'Identity, Protection & Injury' },
  { key: 'witnesses', stepNumber: 4, title: 'Witnesses', subtitle: 'Statements & Testimonies' },
  { key: 'evidence', stepNumber: 5, title: 'Evidence Tracker', subtitle: 'Chain of Custody & Labs' },
  { key: 'investigation', stepNumber: 6, title: 'Investigation', subtitle: 'IO Memo, Panchnama & Logs' },
  { key: 'judgement-documents', stepNumber: 7, title: 'Judgement Docs', subtitle: 'Verdict Readiness & Findings' },
  { key: 'review', stepNumber: 8, title: 'Review & Submit', subtitle: 'Validation & Ingestion' },
]

export default function CaseWorkflow() {
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useApp()

  // Determine current active step from path
  const getActiveStepFromPath = (): StepKey => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/details')) return 'details'
    if (path.includes('/accused')) return 'accused'
    if (path.includes('/victims')) return 'victims'
    if (path.includes('/witnesses')) return 'witnesses'
    if (path.includes('/evidence')) return 'evidence'
    if (path.includes('/investigation')) return 'investigation'
    if (path.includes('/judgement-documents')) return 'judgement-documents'
    if (path.includes('/review')) return 'review'
    return 'details'
  }

  const activeStepKey = getActiveStepFromPath()
  const currentStepNumber = STEP_DEFINITIONS.find((s) => s.key === activeStepKey)?.stepNumber || 1

  // Track the actual case ID in state (if creating new, assigned when step 1 is saved or generated)
  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    if (id && id !== 'new') return id
    return `case-draft-${Date.now()}`
  })

  // Load existing case if editing
  const existingCase = id && id !== 'new' ? judicialStore.getCase(id) : undefined

  // =========================================================================
  // STEP 1: CASE DETAILS
  // =========================================================================
  const [caseNumber, setCaseNumber] = useState<string>(() => {
    if (existingCase) return existingCase.number
    return `CNR/2026/DL04-SESS/${Math.floor(1000 + Math.random() * 9000)}`
  })
  const [caseType, setCaseType] = useState<'Criminal' | 'POCSO' | 'Divorce/Family' | 'Civil' | 'Other'>(() => {
    if (existingCase) {
      if (existingCase.type === 'POCSO') return 'POCSO'
      if (existingCase.type === 'Matrimonial') return 'Divorce/Family'
      if (existingCase.type === 'Civil') return 'Civil'
      return 'Criminal'
    }
    return 'Criminal'
  })
  const [courtName, setCourtName] = useState(existingCase?.court || 'Principal Sessions Court · Bench 04')
  const [judgeName, setJudgeName] = useState(existingCase?.judge || 'Hon. Justice R. Venkataraman')
  const [policeStation, setPoliceStation] = useState(existingCase?.policeStation || 'PS Crime Branch (Special Cell)')
  const [firNumber, setFirNumber] = useState(existingCase?.fir.no || 'FIR-208/2026')
  const [firDate, setFirDate] = useState(existingCase?.fir.date || '2026-03-14')
  const [incidentDate, setIncidentDate] = useState('2026-03-12')
  const [incidentPlace, setIncidentPlace] = useState('Sector 14 Industrial Area, New Delhi')
  const [dateCaseFiled, setDateCaseFiled] = useState(existingCase?.filingDate || '2026-03-20')
  const [sectionsTags, setSectionsTags] = useState<string[]>(() => {
    if (existingCase && existingCase.acts.length > 0) return existingCase.acts
    return ['BNS s. 103 (Murder)', 'CrPC / BNSS s. 164', 'Arms Act s. 25']
  })
  const [newSectionInput, setNewSectionInput] = useState('')
  const [caseStatus, setCaseStatus] = useState<
    'Registered' | 'Under Investigation' | 'Chargesheet Filed' | 'Trial' | 'Judgement Reserved' | 'Closed'
  >('Trial')
  const [caseSummary, setCaseSummary] = useState(
    existingCase?.additionalDetails ||
      'State prosecution arising from FIR regarding armed confrontation resulting in fatal gunshot injuries. Chargesheet filed under Section 173 BNSS; exhibits verified and ballistics analysis admitted into evidence.'
  )

  // =========================================================================
  // STEP 2: ACCUSED / CRIMINAL DETAILS
  // =========================================================================
  const [accusedList, setAccusedList] = useState<AccusedItem[]>(() => {
    if (existingCase && existingCase.parties) {
      const accusedParties = existingCase.parties.filter((p) => p.role === 'Accused')
      if (accusedParties.length > 0) {
        return accusedParties.map((p, idx) => ({
          id: `acc-${idx}`,
          fullName: p.name,
          alias: 'Badri',
          age: '34',
          dob: '1992-06-14',
          gender: 'Male',
          address: 'House 42, Gali No. 3, Rohini, New Delhi',
          phone: '+91-98101-55241',
          idProofType: 'Aadhaar Card',
          idProofNumber: '4482-9901-2294',
          photoUploaded: true,
          role: idx === 0 ? 'main accused' : 'accomplice',
          arrestStatus: p.custody === 'In custody' ? 'arrested' : p.custody === 'On bail' ? 'bail granted' : 'not arrested',
          arrestDate: '2026-03-15',
          bailDetails: p.custody === 'On bail' ? 'Regular bail granted with 2 sureties of ₹50,000' : 'Remand in judicial custody',
          hasPreviousCriminalHistory: true,
          previousCaseNumbers: 'SC/2021/DL/4901 (Bail Acq), FIR-88/2019 PS Kotwali',
          weaponUsed: true,
          weaponDescription: 'Country-made .315 bore firearm recovered from possession',
        }))
      }
    }
    return [
      {
        id: 'acc-1',
        fullName: 'Vikramaditya @ Vicky Singh',
        alias: 'Vicky Don',
        age: '36',
        dob: '1990-04-12',
        gender: 'Male',
        address: 'H.No 104, Pocket B, Mayur Vihar Phase 2, Delhi',
        phone: '+91-98712-40912',
        idProofType: 'Aadhaar Card',
        idProofNumber: '8912-3401-2281',
        photoUploaded: true,
        role: 'main accused',
        arrestStatus: 'arrested',
        arrestDate: '2026-03-15',
        bailDetails: 'Bail application dismissed by Sessions Bench on 2026-04-02',
        hasPreviousCriminalHistory: true,
        previousCaseNumbers: 'FIR 112/2018 PS Rohini, CC 890/2022 PS Crime Branch',
        weaponUsed: true,
        weaponDescription: '9mm semi-automatic pistol recovered under Section 27 Evidence Act',
      },
    ]
  })

  // =========================================================================
  // STEP 3: VICTIM DETAILS
  // =========================================================================
  const [victimsList, setVictimsList] = useState<VictimItem[]>(() => {
    if (existingCase && existingCase.victims && existingCase.victims.details?.length > 0) {
      return existingCase.victims.details.map((v, idx) => ({
        id: `vic-${idx}`,
        fullName: v.name,
        isConfidential: v.masked,
        age: String(v.age || '29'),
        gender: 'Female',
        address: 'Confidential Address withheld under Witness Protection Scheme',
        contact: '+91-98710-88129',
        isMinor: v.age < 18,
        guardianDetails: v.age < 18 ? 'Mother / Natural Guardian' : '',
        relationshipWithAccused: v.relationship || 'Acquaintance / Neighbor',
        injuryOrLossDetails: 'Gunshot trauma to left shoulder, grievous injury under s. 116 BNS',
        medicalReportUploaded: true,
        victimStatementUploaded: true,
        statementRef: 'MLC-AIIMS-2026/881 and Sec. 164 Statement before MM-02',
      }))
    }
    return [
      {
        id: 'vic-1',
        fullName: 'Ananya Sharma',
        isConfidential: caseType === 'POCSO',
        age: '28',
        gender: 'Female',
        address: 'Flat 402, Block C, Dwarka Sector 11, New Delhi',
        contact: '+91-98112-99881',
        isMinor: false,
        guardianDetails: '',
        relationshipWithAccused: 'Business Associate / Former Partner',
        injuryOrLossDetails: 'Gunshot penetration injury to shoulder, financial extortion',
        medicalReportUploaded: true,
        victimStatementUploaded: true,
        statementRef: 'Sec. 164 BNSS Deposition before MM Court-02',
      },
    ]
  })

  // Auto-enforce victim confidentiality for POCSO
  useEffect(() => {
    if (caseType === 'POCSO') {
      setVictimsList((prev) => prev.map((v) => ({ ...v, isConfidential: true })))
    }
  }, [caseType])

  // =========================================================================
  // STEP 4: WITNESSES AND PEOPLE INVOLVED
  // =========================================================================
  const [witnessesList, setWitnessesList] = useState<WitnessItem[]>([
    {
      id: 'wit-1',
      fullName: 'Rameshwar Lal',
      type: 'eyewitness',
      contact: '+91-98765-12345',
      statementSummary: 'Saw the accused fleeing on motorcycle immediately after gunshots fired outside factory gate.',
      documentUploaded: true,
      documentName: 'statement_rameshwar_161_crpc.pdf',
    },
    {
      id: 'wit-2',
      fullName: 'Dr. Alok Verma (Senior Scientific Officer, FSL Rohini)',
      type: 'expert',
      contact: '+91-99887-76655',
      statementSummary: 'Confirmed lead projectile matched firearm test fired at forensic lab.',
      documentUploaded: true,
      documentName: 'fsl_ballistics_expert_affidavit.pdf',
    },
    {
      id: 'wit-3',
      fullName: 'Head Constable Sunil Kumar',
      type: 'police',
      contact: '+91-94120-00129',
      statementSummary: 'Recovery panch witness for seizure of spent cartridges and weapon recovery.',
      documentUploaded: true,
      documentName: 'seizure_panchnama_exhibit_p1.pdf',
    },
  ])

  // =========================================================================
  // STEP 5: EVIDENCE TRACKER
  // =========================================================================
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<
    'circumstantial' | 'forensic' | 'chemical' | 'physical' | 'documentary' | 'oral'
  >('forensic')

  const [evidenceItems, setEvidenceItems] = useState<ComprehensiveEvidenceItem[]>([
    {
      id: 'ev-1',
      evidenceId: 'EVD-2026-FSL-01',
      type: 'forensic',
      description: 'Spent brass cartridge casing (7.65mm) recovered from scene of incident',
      source: 'Spot inspection recovery',
      linksToCrime: 'Fired from the accused weapon recovered under Section 27',
      dateCollected: '2026-03-12',
      collectedBy: 'SI Rakesh Dogra (Crime Team)',
      forensicSubtype: 'ballistics',
      labName: 'FSL Rohini, Forensic Ballistics Division',
      reportNumber: 'FSL-2026/BAL-8902',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'SI Rakesh Dogra', receivedBy: 'Malkhana Moharrir PS Crime', dateTime: '2026-03-12 18:30', purpose: 'Safe sealed storage in Malkhana' },
        { handedBy: 'Ct. Pradeep Kumar', receivedBy: 'Director FSL Rohini', dateTime: '2026-03-14 11:00', purpose: 'Handed over for microscopic striation analysis' },
        { handedBy: 'SSO FSL Rohini', receivedBy: 'Court Master Bench 04', dateTime: '2026-04-10 10:15', purpose: 'Produced in court with sealed report' },
      ],
      uploadedFiles: ['cartridge_macro_photo.jpg', 'fsl_ballistics_report.pdf'],
    },
    {
      id: 'ev-2',
      evidenceId: 'EVD-2026-PHY-02',
      type: 'physical',
      description: 'Country-made .315 bore firearm with wooden grip',
      source: 'Disclosed location behind transformer, Sector 14',
      linksToCrime: 'Seized pursuant to Section 27 BNSS disclosure statement',
      dateCollected: '2026-03-15',
      collectedBy: 'Insp. Pradeep Rawat (IO)',
      physicalType: 'Weapon',
      status: 'Produced in court',
      chainOfCustody: [
        { handedBy: 'Insp. Pradeep Rawat', receivedBy: 'Malkhana Incharge', dateTime: '2026-03-15 20:00', purpose: 'Sealed deposit with lead seal' },
        { handedBy: 'Malkhana Incharge', receivedBy: 'Court Reader', dateTime: '2026-04-10 11:00', purpose: 'Marked Exhibit P-1 in presence of Accused' },
      ],
      uploadedFiles: ['firearm_exhibit_p1_inspection.jpg', 'seizure_memo_signed.pdf'],
    },
    {
      id: 'ev-3',
      evidenceId: 'EVD-2026-DOC-03',
      type: 'documentary',
      description: 'CCTV footage hard drive containing video of getaway motorcycle at 22:14 hrs',
      source: 'Industrial Unit Camera 04 DVR',
      linksToCrime: 'Identifies vehicle registration and helmetless co-accused',
      dateCollected: '2026-03-13',
      collectedBy: 'SI Manish Kumar',
      documentKind: 'CCTV footage & Section 65B BSA Certificate',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'Factory Owner (D. Singhal)', receivedBy: 'SI Manish Kumar', dateTime: '2026-03-13 14:00', purpose: 'Seizure under panchnama with Sec 65B hash certificate' },
      ],
      uploadedFiles: ['cctv_frame_capture.png', 'sec_65b_bsa_certificate.pdf'],
    },
    {
      id: 'ev-4',
      evidenceId: 'EVD-2026-CIR-04',
      type: 'circumstantial',
      description: 'Call Detail Records (CDR) proving co-location of accused and victim 15 mins prior',
      source: 'Telecom Service Provider Nodal Officer',
      linksToCrime: 'Pre-meditation and presence at proximate distance',
      dateCollected: '2026-03-16',
      collectedBy: 'Insp. Pradeep Rawat',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'Nodal Officer Airtel', receivedBy: 'IO', dateTime: '2026-03-16 16:00', purpose: 'Cryptographic dump with CAF verification' },
      ],
      uploadedFiles: ['cdr_tower_analysis_sheet.xlsx', 'nodal_affidavit.pdf'],
    },
  ])

  // =========================================================================
  // STEP 6: INVESTIGATION DOCUMENTS (POLICE / IO)
  // =========================================================================
  const [ioName, setIoName] = useState(existingCase?.io?.name || 'Insp. Pradeep Rawat')
  const [ioRank, setIoRank] = useState(existingCase?.io?.rank || 'Inspector of Police')
  const [ioPhone, setIoPhone] = useState(existingCase?.io?.phone || '+91-98110-44910')
  const [ioEmail, setIoEmail] = useState('io.delhipolice.crime@gov.in')

  const [investigationDocs, setInvestigationDocs] = useState<InvestigationDocItem[]>([
    { id: 'inv-1', name: 'FIR Copy (First Information Report)', status: 'Verified', fileName: 'fir_208_2026_certified.pdf' },
    { id: 'inv-2', name: 'Investigating Officer Details & Appointment Order', status: 'Verified', fileName: 'io_order_cp_delhi.pdf' },
    { id: 'inv-3', name: 'Arrest Memo and Seizure Memo (Panchnama)', status: 'Verified', fileName: 'arrest_panchnama_signed.pdf' },
    { id: 'inv-4', name: 'Spot / Scene of Crime Inspection Report', status: 'Verified', fileName: 'crime_scene_inspection_sketch.pdf' },
    { id: 'inv-5', name: 'Post-Mortem / Medical (MLC) Report', status: 'Verified', fileName: 'mlc_aiims_forensic_injury.pdf' },
    { id: 'inv-6', name: 'Forensic (FSL) Reports', status: 'Verified', fileName: 'fsl_rohini_ballistics_signed.pdf' },
    { id: 'inv-7', name: 'Witness Statements (Sec. 161 / 164)', status: 'Verified', fileName: 'statements_161_164_bundle.pdf' },
    { id: 'inv-8', name: 'Confession Statement / Remand Papers', status: 'Uploaded', fileName: 'remand_order_cj_court.pdf' },
    { id: 'inv-9', name: 'Call Detail Records (CDR), CCTV and Digital Evidence', status: 'Verified', fileName: 'digital_dump_65b_bsa.pdf' },
    { id: 'inv-10', name: 'Charge Sheet / Final Report (Sec. 173 BNSS)', status: 'Verified', fileName: 'chargesheet_final_report_173.pdf' },
  ])

  const [progressLogs, setProgressLogs] = useState<ProgressLogEntry[]>([
    { id: 'log-1', date: '2026-03-12', actionTaken: 'FIR registered; spot visited by Crime Team; spent cartridge seized.', nextActionDate: '2026-03-14' },
    { id: 'log-2', date: '2026-03-15', actionTaken: 'Accused arrested; weapon recovered on disclosure; sent for 2-day police remand.', nextActionDate: '2026-03-18' },
    { id: 'log-3', date: '2026-03-28', actionTaken: 'Ballistics report received from FSL; CDR analysis completed.', nextActionDate: '2026-04-05' },
    { id: 'log-4', date: '2026-04-05', actionTaken: 'Final chargesheet submitted before Magistrate under Sec 173 BNSS.', nextActionDate: '2026-04-18' },
  ])

  // =========================================================================
  // STEP 7: DOCUMENTS REQUIRED FOR JUDGEMENT
  // =========================================================================
  const [judgementDocs, setJudgementDocs] = useState<JudgementDocCheckItem[]>([
    { id: 'jd-1', title: 'Charge sheet and charges framed by Court', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-2', title: 'Evidence list and exhibit list (Ex. P-1 to P-8)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-3', title: 'Witness deposition and cross-examination records (PW-1 to PW-6)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-4', title: 'Forensic (FSL) and medical reports (MLC)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-5', title: 'Prosecution arguments and defence arguments (Lawyer submissions)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-6', title: 'Bail orders and previous interlocutory court orders', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-7', title: 'Victim impact statement and compensation calculation', isUploaded: true, isReviewed: false, status: 'Uploaded' },
    { id: 'jd-8', title: 'Criminal history record of the accused (Crime Bureau)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-9', title: 'Case law / precedent references and judicial authorities', isUploaded: true, isReviewed: true, status: 'Reviewed' },
  ])

  const [precedentLinks, setPrecedentLinks] = useState(
    'State of UP v. Satish (2005) 3 SCC 114 (Ballistics & recovery under Sec 27); Sharad Birdhichand Sarda v. State of Maharashtra (1984) 4 SCC 116 (Golden principles of circumstantial evidence)'
  )
  const [judgeNotes, setJudgeNotes] = useState(
    'The prosecution has established beyond reasonable doubt the recovery of the weapon pursuant to disclosure. The ballistics report conclusively connects the striation marks on the fired cartridge. The alibi defense raised by defense counsel failed to withstand cross-examination.'
  )
  const [finalVerdict, setFinalVerdict] = useState<'Convicted' | 'Acquitted' | 'Discharged'>('Convicted')
  const [punishmentSentence, setPunishmentSentence] = useState('Rigorous Imprisonment for 10 Years and Fine of ₹50,000')
  const [judgementReasons, setJudgementReasons] = useState(
    'Chain of evidence complete; witness testimony corroborated by objective ballistics finding; statutory ingredients under BNS Section 103 satisfied.'
  )
  const [judgementDate, setJudgementDate] = useState('2026-10-24')

  // Calculate Judgement Readiness Progress
  const reviewedCount = judgementDocs.filter((d) => d.isReviewed).length
  const totalJudgementDocs = judgementDocs.length
  const readinessPercent = Math.round((reviewedCount / totalJudgementDocs) * 100)

  // =========================================================================
  // STEP SWITCHING & NAVIGATION HELPERS
  // =========================================================================
  const getStepRoute = (stepKey: StepKey) => {
    const caseParam = id && id !== 'new' ? id : activeCaseId
    if (stepKey === 'details' && (!id || id === 'new')) {
      return '/case/new/details'
    }
    return `/case/${caseParam}/${stepKey}`
  }

  const navigateToStep = (targetStepKey: StepKey) => {
    // If starting from new details, make sure case ID exists
    let targetCaseId = id && id !== 'new' ? id : activeCaseId
    if (targetCaseId.startsWith('case-draft-') && targetStepKey !== 'details') {
      // Auto-save the new draft case into store if moving past step 1
      const preview = judicialStore.generateCaseNumberAndName({
        jurisdictionCode: 'DL',
        caseType: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
        year: 2026,
        policeStationCode: policeStation.slice(0, 4).toUpperCase(),
        primaryComplainant: 'State (NCT of Delhi)',
        primaryAccused: accusedList[0]?.fullName || 'Accused',
        coAccusedCount: Math.max(0, accusedList.length - 1),
        primaryStatuteSection: sectionsTags[0] || 'BNS',
      })

      const newRecord = judicialStore.ingestNewCase({
        number: caseNumber || preview.caseNumber,
        title: preview.caseName,
        type: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
        court: courtName,
        acts: sectionsTags,
        stage: caseStatus === 'Closed' ? 'Judgment Reserved' : caseStatus,
        status: 'ontrack',
        filingDate: dateCaseFiled,
        nextHearing: '2026-10-24',
        judge: judgeName,
        policeStation: policeStation,
        fir: { no: firNumber, date: firDate },
        io: {
          name: ioName,
          rank: ioRank,
          badge: 'DL-POL-8821',
          policeStation: policeStation,
          phone: ioPhone,
          chargesheetRef: `CS-${firNumber}`,
        },
        parties: [
          { role: 'Prosecutor', name: 'State (NCT of Delhi)' },
          ...accusedList.map((a) => ({
            role: 'Accused' as const,
            name: a.fullName,
            custody: a.arrestStatus === 'arrested' ? ('In custody' as const) : ('On bail' as const),
          })),
        ],
        victims: {
          total: victimsList.length,
          minors: victimsList.filter((v) => v.isMinor).length,
          adults: victimsList.filter((v) => !v.isMinor).length,
          details: victimsList.map((v) => ({
            name: v.fullName,
            masked: v.isConfidential,
            age: parseInt(v.age, 10) || 25,
            relationship: v.relationshipWithAccused,
          })),
        },
        weapons: accusedList
          .filter((a) => a.weaponUsed)
          .map((a, i) => ({
            id: `wp-${i}`,
            type: 'FIREARM' as const,
            makeModel: a.weaponDescription || 'Country Firearm',
            serialNumber: `SN-992${i}`,
            recoveryMemo: 'Recovery Panchnama under Section 27',
            recoveryDate: a.arrestDate || '2026-03-15',
            recoveryPlace: incidentPlace,
            ballisticStatus: 'MATCHED' as const,
            notes: 'Test fired by FSL Rohini',
          })),
        evidence: evidenceItems.map((e) => ({
          id: e.id,
          code: e.evidenceId,
          kind: e.type === 'circumstantial' ? 'Circumstantial' : e.type === 'forensic' ? 'Forensic' : 'Documentary',
          title: e.description,
          detail: e.linksToCrime,
          custodyOfficer: e.collectedBy,
          date: e.dateCollected,
          place: e.source,
          labStatus: e.status === 'Report received' ? 'received' : 'pending',
          admission: 'admitted',
          chainHash: 'sha256-verified-evidence-hash',
        })),
        documents: [],
        hearings: [],
        additionalDetails: caseSummary,
      })
      targetCaseId = newRecord.id
      setActiveCaseId(newRecord.id)
    }

    navigate(`/case/${targetCaseId}/${targetStepKey}`)
  }

  const handleNext = () => {
    const currentIndex = STEP_DEFINITIONS.findIndex((s) => s.key === activeStepKey)
    if (currentIndex < STEP_DEFINITIONS.length - 1) {
      navigateToStep(STEP_DEFINITIONS[currentIndex + 1].key)
    }
  }

  const handlePrev = () => {
    const currentIndex = STEP_DEFINITIONS.findIndex((s) => s.key === activeStepKey)
    if (currentIndex > 0) {
      navigateToStep(STEP_DEFINITIONS[currentIndex - 1].key)
    }
  }

  // Handle final submission in Step 8
  const handleSubmitDocket = () => {
    // Generate or finalize case in store
    const preview = judicialStore.generateCaseNumberAndName({
      jurisdictionCode: 'DL',
      caseType: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
      year: 2026,
      policeStationCode: policeStation.slice(0, 4).toUpperCase(),
      primaryComplainant: 'State (NCT of Delhi)',
      primaryAccused: accusedList[0]?.fullName || 'Accused',
      coAccusedCount: Math.max(0, accusedList.length - 1),
      primaryStatuteSection: sectionsTags[0] || 'BNS',
    })

    const finalCase = judicialStore.ingestNewCase({
      number: caseNumber || preview.caseNumber,
      title: preview.caseName,
      type: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
      court: courtName,
      acts: sectionsTags,
      stage: caseStatus,
      status: 'ontrack',
      filingDate: dateCaseFiled,
      nextHearing: '2026-10-24',
      judge: judgeName,
      policeStation: policeStation,
      fir: { no: firNumber, date: firDate },
      io: {
        name: ioName,
        rank: ioRank,
        badge: 'DL-POL-8821',
        policeStation: policeStation,
        phone: ioPhone,
        chargesheetRef: `CS-${firNumber}`,
      },
      parties: [
        { role: 'Prosecutor', name: 'State (NCT of Delhi)' },
        ...accusedList.map((a) => ({
          role: 'Accused' as const,
          name: a.fullName,
          custody: a.arrestStatus === 'arrested' ? ('In custody' as const) : ('On bail' as const),
        })),
      ],
      victims: {
        total: victimsList.length,
        minors: victimsList.filter((v) => v.isMinor).length,
        adults: victimsList.filter((v) => !v.isMinor).length,
        details: victimsList.map((v) => ({
          name: v.fullName,
          masked: v.isConfidential,
          age: parseInt(v.age, 10) || 25,
          relationship: v.relationshipWithAccused,
        })),
      },
      weapons: accusedList
        .filter((a) => a.weaponUsed)
        .map((a, i) => ({
          id: `wp-${i}`,
          type: 'FIREARM' as const,
          makeModel: a.weaponDescription || 'Country Firearm',
          serialNumber: `SN-992${i}`,
          recoveryMemo: 'Recovery Panchnama under Section 27',
          recoveryDate: a.arrestDate || '2026-03-15',
          recoveryPlace: incidentPlace,
          ballisticStatus: 'MATCHED' as const,
          notes: 'Test fired by FSL Rohini',
        })),
      evidence: evidenceItems.map((e) => ({
        id: e.id,
        code: e.evidenceId,
        kind: e.type === 'circumstantial' ? 'Circumstantial' : e.type === 'forensic' ? 'Forensic' : 'Documentary',
        title: e.description,
        detail: e.linksToCrime,
        custodyOfficer: e.collectedBy,
        date: e.dateCollected,
        place: e.source,
        labStatus: e.status === 'Report received' ? 'received' : 'pending',
        admission: 'admitted',
        chainHash: 'sha256-verified-evidence-hash',
      })),
      documents: [],
      hearings: [],
      additionalDetails: caseSummary,
    })

    toast(`Case docket ${finalCase.number} successfully registered in registry!`, 'good')
    navigate(`/case/${finalCase.id}`)
  }

  // Quick tag helpers for Step 1
  const addSectionTag = () => {
    if (newSectionInput.trim() && !sectionsTags.includes(newSectionInput.trim())) {
      setSectionsTags([...sectionsTags, newSectionInput.trim()])
      setNewSectionInput('')
    }
  }

  const removeSectionTag = (tag: string) => {
    setSectionsTags(sectionsTags.filter((t) => t !== tag))
  }

  // Quick accused helpers for Step 2
  const addAccused = () => {
    const newAcc: AccusedItem = {
      id: `acc-${Date.now()}`,
      fullName: '',
      alias: '',
      age: '',
      dob: '',
      gender: 'Male',
      address: '',
      phone: '',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
      photoUploaded: false,
      role: 'accomplice',
      arrestStatus: 'not arrested',
      arrestDate: '',
      bailDetails: '',
      hasPreviousCriminalHistory: false,
      previousCaseNumbers: '',
      weaponUsed: false,
      weaponDescription: '',
    }
    setAccusedList([...accusedList, newAcc])
  }

  const removeAccused = (idToRemove: string) => {
    if (accusedList.length === 1) {
      toast('At least one accused must remain in docket', 'bad')
      return
    }
    setAccusedList(accusedList.filter((a) => a.id !== idToRemove))
  }

  // Quick victim helpers for Step 3
  const addVictim = () => {
    const newVic: VictimItem = {
      id: `vic-${Date.now()}`,
      fullName: '',
      isConfidential: caseType === 'POCSO',
      age: '',
      gender: 'Female',
      address: '',
      contact: '',
      isMinor: false,
      guardianDetails: '',
      relationshipWithAccused: '',
      injuryOrLossDetails: '',
      medicalReportUploaded: false,
      victimStatementUploaded: false,
      statementRef: '',
    }
    setVictimsList([...victimsList, newVic])
  }

  const removeVictim = (idToRemove: string) => {
    setVictimsList(victimsList.filter((v) => v.id !== idToRemove))
  }

  // Quick witness helpers for Step 4
  const addWitness = () => {
    const newWit: WitnessItem = {
      id: `wit-${Date.now()}`,
      fullName: '',
      type: 'eyewitness',
      contact: '',
      statementSummary: '',
      documentUploaded: false,
      documentName: '',
    }
    setWitnessesList([...witnessesList, newWit])
  }

  const removeWitness = (idToRemove: string) => {
    setWitnessesList(witnessesList.filter((w) => w.id !== idToRemove))
  }

  // Quick evidence helpers for Step 5
  const addEvidence = (type: ComprehensiveEvidenceItem['type']) => {
    const newEv: ComprehensiveEvidenceItem = {
      id: `ev-${Date.now()}`,
      evidenceId: `EVD-2026-${type.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      description: '',
      source: '',
      linksToCrime: '',
      dateCollected: new Date().toISOString().split('T')[0],
      collectedBy: ioName,
      status: 'Collected',
      chainOfCustody: [
        {
          handedBy: ioName,
          receivedBy: 'Police Malkhana',
          dateTime: new Date().toLocaleString(),
          purpose: 'Initial evidentiary intake',
        },
      ],
      uploadedFiles: [],
    }
    setEvidenceItems([...evidenceItems, newEv])
  }

  const addChainOfCustodyRow = (evidenceId: string) => {
    setEvidenceItems((prev) =>
      prev.map((e) => {
        if (e.id === evidenceId) {
          return {
            ...e,
            chainOfCustody: [
              ...e.chainOfCustody,
              {
                handedBy: '',
                receivedBy: '',
                dateTime: new Date().toLocaleString(),
                purpose: '',
              },
            ],
          }
        }
        return e
      })
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121316] pb-24">
      {/* Top Judicial Banner */}
      <div className="bg-white border-b border-black/[0.08] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/cases"
                className="size-9 rounded-full bg-zinc-100 hover:bg-zinc-200 grid place-items-center text-zinc-700 transition-colors"
                title="Back to Case Registry"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white">
                    {caseNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                    Step {currentStepNumber} of 8
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
                  Judicial Case Intake Pipeline · {STEP_DEFINITIONS.find((s) => s.key === activeStepKey)?.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/case/${activeCaseId}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="size-3.5 mr-1" />
                  View Case Overview
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={() => {
                  toast('Draft state auto-saved in local registry.', 'good')
                }}
              >
                <CheckCircle2 className="size-3.5 mr-1 text-emerald-400" />
                Save Progress
              </Button>
            </div>
          </div>

          {/* 8-Step Interactive Navigation Pills */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-black/[0.05] pt-3">
            {STEP_DEFINITIONS.map((step) => {
              const isActive = step.key === activeStepKey
              const isPast = step.stepNumber < currentStepNumber
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => navigateToStep(step.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-sm ring-1 ring-black'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent'
                  }`}
                >
                  <span
                    className={`size-5 rounded-full grid place-items-center text-[11px] font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-black'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-300 text-zinc-700'
                    }`}
                  >
                    {isPast ? <Check className="size-3 stroke-[3]" /> : step.stepNumber}
                  </span>
                  <span>{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* =================================================================== */}
        {/* STEP 1: CASE DETAILS                                                */}
        {/* =================================================================== */}
        {activeStepKey === 'details' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-black/10 pb-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="size-5 text-indigo-600" />
                Step 1: Case Details &amp; Legal Framework
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Establish the unique CNR docket identity, jurisdiction, Police Station, and statutory provisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Case Number (Auto-Generated CNR)
                </label>
                <div className="relative">
                  <Input value={caseNumber} readOnly className="bg-zinc-100 font-mono font-bold text-zinc-800" />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400 uppercase">
                    Read-Only
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">Format: CNR/YEAR/COURT/SERIAL</p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Case Type</label>
                <Select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as any)}
                  className="w-full font-semibold"
                >
                  <option value="Criminal">Criminal (Sessions / Warrant)</option>
                  <option value="POCSO">POCSO Special Court</option>
                  <option value="Divorce/Family">Divorce / Family Court</option>
                  <option value="Civil">Civil Suit</option>
                  <option value="Other">Other Miscellaneous Petition</option>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Court Name</label>
                <Input value={courtName} onChange={(e) => setCourtName(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Presiding Judge</label>
                <Input value={judgeName} onChange={(e) => setJudgeName(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Police Station</label>
                <Input value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">FIR Number</label>
                  <Input value={firNumber} onChange={(e) => setFirNumber(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">FIR Date</label>
                  <Input type="date" value={firDate} onChange={(e) => setFirDate(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Date of Incident</label>
                <Input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Place of Incident</label>
                <Input value={incidentPlace} onChange={(e) => setIncidentPlace(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Date Case Was Filed</label>
                <Input type="date" value={dateCaseFiled} onChange={(e) => setDateCaseFiled(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Case Status</label>
                <Select
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value as any)}
                  className="w-full font-semibold"
                >
                  <option value="Registered">Registered</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Chargesheet Filed">Chargesheet Filed</option>
                  <option value="Trial">Trial</option>
                  <option value="Judgement Reserved">Judgement Reserved</option>
                  <option value="Closed">Closed</option>
                </Select>
              </div>
            </div>

            {/* Sections of Law Applied */}
            <div className="space-y-2 pt-2 border-t border-black/5">
              <label className="text-xs font-bold text-zinc-700 block">
                Sections of Law Applied (Multi-Select Tags)
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                {sectionsTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-zinc-900 border border-zinc-300 shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeSectionTag(tag)}
                      className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSectionTag()
                    }
                  }}
                  placeholder="e.g. BNS s.103, Arms Act s.25, CrPC s.164"
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSectionTag}>
                  <Plus className="size-3.5 mr-1" />
                  Add Section
                </Button>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSectionsTags([...sectionsTags, 'BNS s. 109'])}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-black underline cursor-pointer"
                >
                  + Add BNS s.109
                </button>
                <button
                  type="button"
                  onClick={() => setSectionsTags([...sectionsTags, 'POCSO s. 4 / 6'])}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-black underline cursor-pointer"
                >
                  + Add POCSO s.4/6
                </button>
                <button
                  type="button"
                  onClick={() => setSectionsTags([...sectionsTags, 'BNSS s. 173'])}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-black underline cursor-pointer"
                >
                  + Add BNSS s.173
                </button>
              </div>
            </div>

            {/* Brief Case Summary */}
            <div className="pt-2 border-t border-black/5">
              <label className="text-xs font-bold text-zinc-700 block mb-1">Brief Case Summary</label>
              <textarea
                value={caseSummary}
                onChange={(e) => setCaseSummary(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-zinc-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Provide a succinct summary of the prosecution facts, incident narrative, and court proceedings..."
              />
            </div>
          </Card>
        )}

        {/* =================================================================== */}
        {/* STEP 2: ACCUSED / CRIMINAL DETAILS                                  */}
        {/* =================================================================== */}
        {activeStepKey === 'accused' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="size-5 text-rose-600" />
                  Step 2: Accused &amp; Criminal Demographics
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Record all persons accused, their roles, arrest/bail statuses, and criminal records.
                </p>
              </div>
              <Button type="button" variant="primary" size="sm" onClick={addAccused}>
                <Plus className="size-4 mr-1" />
                Add Accused
              </Button>
            </div>

            <div className="space-y-5">
              {accusedList.map((acc, index) => (
                <Card key={acc.id} className="p-6 relative space-y-4 border-l-4 border-l-rose-500">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs grid place-items-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">
                        {acc.fullName || `Accused #${index + 1}`}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold uppercase">
                        {acc.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAccused(acc.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove this accused"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
                      <Input
                        value={acc.fullName}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, fullName: e.target.value } : a))
                          )
                        }
                        placeholder="e.g. Vikramaditya Singh"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Alias / Known As</label>
                      <Input
                        value={acc.alias}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, alias: e.target.value } : a))
                          )
                        }
                        placeholder="e.g. Vicky"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Age</label>
                        <Input
                          value={acc.age}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, age: e.target.value } : a))
                            )
                          }
                          placeholder="36"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Gender</label>
                        <Select
                          value={acc.gender}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, gender: e.target.value } : a))
                            )
                          }
                          className="w-full"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Date of Birth</label>
                      <Input
                        type="date"
                        value={acc.dob}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, dob: e.target.value } : a))
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Contact Phone</label>
                      <Input
                        value={acc.phone}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, phone: e.target.value } : a))
                          )
                        }
                        placeholder="+91-98712-40912"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Role in Crime</label>
                      <Select
                        value={acc.role}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, role: e.target.value as any } : a))
                          )
                        }
                        className="w-full"
                      >
                        <option value="main accused">Main Accused</option>
                        <option value="accomplice">Accomplice</option>
                        <option value="abettor">Abettor</option>
                      </Select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Residential Address</label>
                      <Input
                        value={acc.address}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, address: e.target.value } : a))
                          )
                        }
                        placeholder="Complete permanent / present address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">ID Proof Type</label>
                        <Select
                          value={acc.idProofType}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, idProofType: e.target.value } : a))
                            )
                          }
                          className="w-full"
                        >
                          <option value="Aadhaar Card">Aadhaar Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="PAN Card">PAN Card</option>
                          <option value="Passport">Passport</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">ID Number</label>
                        <Input
                          value={acc.idProofNumber}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, idProofNumber: e.target.value } : a))
                            )
                          }
                          placeholder="8912-3401-2281"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrest, Bail, Criminal History & Weapons */}
                  <div className="pt-3 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-50/80 p-3.5 rounded-2xl">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Arrest Status</label>
                      <Select
                        value={acc.arrestStatus}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, arrestStatus: e.target.value as any } : a))
                          )
                        }
                        className="w-full"
                      >
                        <option value="not arrested">Not Arrested</option>
                        <option value="arrested">Arrested (In Custody)</option>
                        <option value="absconding">Absconding</option>
                        <option value="bail granted">Bail Granted</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Arrest Date</label>
                      <Input
                        type="date"
                        value={acc.arrestDate}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, arrestDate: e.target.value } : a))
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Bail Details</label>
                      <Input
                        value={acc.bailDetails}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, bailDetails: e.target.value } : a))
                          )
                        }
                        placeholder="Surety details or remand notes"
                      />
                    </div>

                    {/* Previous Criminal History Toggle */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id={`hist-${acc.id}`}
                          checked={acc.hasPreviousCriminalHistory}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, hasPreviousCriminalHistory: e.target.checked } : a
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <label htmlFor={`hist-${acc.id}`} className="text-xs font-bold text-zinc-800 cursor-pointer">
                          Previous Criminal History on Record
                        </label>
                      </div>
                      {acc.hasPreviousCriminalHistory && (
                        <Input
                          value={acc.previousCaseNumbers}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, previousCaseNumbers: e.target.value } : a
                              )
                            )
                          }
                          placeholder="Previous FIRs, case numbers, convictions, or pending trials..."
                          className="text-xs mt-1"
                        />
                      )}
                    </div>

                    {/* Weapon Used Toggle */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id={`wp-${acc.id}`}
                          checked={acc.weaponUsed}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, weaponUsed: e.target.checked } : a
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <label htmlFor={`wp-${acc.id}`} className="text-xs font-bold text-zinc-800 cursor-pointer">
                          Weapon Used / Recovered
                        </label>
                      </div>
                      {acc.weaponUsed && (
                        <Input
                          value={acc.weaponDescription}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, weaponDescription: e.target.value } : a
                              )
                            )
                          }
                          placeholder="Weapon type, serial, recovery memo..."
                          className="text-xs mt-1"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: VICTIM DETAILS                                              */}
        {/* =================================================================== */}
        {activeStepKey === 'victims' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <Shield className="size-5 text-emerald-600" />
                    Step 3: Victim Information &amp; Protection
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    Total Victims: {victimsList.length}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Identity protection toggle is automatically mandated for POCSO and vulnerable cases.
                </p>
              </div>

              <Button type="button" variant="primary" size="sm" onClick={addVictim}>
                <Plus className="size-4 mr-1" />
                Add Victim
              </Button>
            </div>

            <div className="space-y-5">
              {victimsList.map((vic, index) => (
                <Card key={vic.id} className="p-6 relative space-y-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs grid place-items-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">
                        {vic.isConfidential ? 'PROTECTED IDENTITY [SEALED]' : vic.fullName || `Victim #${index + 1}`}
                      </span>
                      {vic.isConfidential && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                          <EyeOff className="size-3" /> Identity Masked
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVictim(vic.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove this victim"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        Victim Name {caseType === 'POCSO' && '(Mandatory Masked)'}
                      </label>
                      <Input
                        value={vic.fullName}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) => (v.id === vic.id ? { ...v, fullName: e.target.value } : v))
                          )
                        }
                        placeholder="Full Legal Name"
                        required
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vic.isConfidential || caseType === 'POCSO'}
                          disabled={caseType === 'POCSO'}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, isConfidential: e.target.checked } : v
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <span>Confidential / Protect Identity</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Age</label>
                        <Input
                          value={vic.age}
                          onChange={(e) => {
                            const val = e.target.value
                            const isMinor = parseInt(val, 10) < 18
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, age: val, isMinor } : v
                              )
                            )
                          }}
                          placeholder="28"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Gender</label>
                        <Select
                          value={vic.gender}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) => (v.id === vic.id ? { ...v, gender: e.target.value } : v))
                            )
                          }
                          className="w-full"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Contact Phone</label>
                      <Input
                        value={vic.contact}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) => (v.id === vic.id ? { ...v, contact: e.target.value } : v))
                          )
                        }
                        placeholder="+91-98112-99881"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Address</label>
                      <Input
                        value={vic.address}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) => (v.id === vic.id ? { ...v, address: e.target.value } : v))
                          )
                        }
                        placeholder="Permanent or protected shelter address"
                      />
                    </div>

                    {vic.isMinor && (
                      <div className="sm:col-span-3 bg-amber-50 border border-amber-200 p-3 rounded-2xl">
                        <label className="text-xs font-bold text-amber-900 block mb-1">
                          Minor Guardian Details (Mandatory for Minors)
                        </label>
                        <Input
                          value={vic.guardianDetails}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, guardianDetails: e.target.value } : v
                              )
                            )
                          }
                          placeholder="Mother/Father/Legal Guardian Name and Contact"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        Relationship with Accused
                      </label>
                      <Input
                        value={vic.relationshipWithAccused}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) =>
                              v.id === vic.id ? { ...v, relationshipWithAccused: e.target.value } : v
                            )
                          )
                        }
                        placeholder="e.g. Spouse, Business Partner, Neighbor, Stranger"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        Injury / Financial / Emotional Loss Details
                      </label>
                      <textarea
                        value={vic.injuryOrLossDetails}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) =>
                              v.id === vic.id ? { ...v, injuryOrLossDetails: e.target.value } : v
                            )
                          )
                        }
                        rows={2}
                        className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                        placeholder="Describe injuries, medical treatment received, or property damage..."
                      />
                    </div>

                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/5">
                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block">Medical Report (MLC)</span>
                          <span className="text-[11px] text-zinc-500">MLC report attached</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={vic.medicalReportUploaded}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, medicalReportUploaded: e.target.checked } : v
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block">Sec. 164 BNSS Statement</span>
                          <span className="text-[11px] text-zinc-500">Magisterial statement recorded</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={vic.victimStatementUploaded}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, victimStatementUploaded: e.target.checked } : v
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: WITNESSES AND PEOPLE INVOLVED                               */}
        {/* =================================================================== */}
        {activeStepKey === 'witnesses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  Step 4: Witnesses &amp; Key Depositions
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Record eyewitnesses, forensic specialists, panchnama signatories, and complainant testimonies.
                </p>
              </div>

              <Button type="button" variant="primary" size="sm" onClick={addWitness}>
                <Plus className="size-4 mr-1" />
                Add Witness
              </Button>
            </div>

            <div className="space-y-4">
              {witnessesList.map((wit, index) => (
                <Card key={wit.id} className="p-6 relative space-y-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs grid place-items-center">
                        PW-{index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">
                        {wit.fullName || `Witness #${index + 1}`}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold uppercase">
                        {wit.type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeWitness(wit.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Witness Full Name</label>
                      <Input
                        value={wit.fullName}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, fullName: e.target.value } : w))
                          )
                        }
                        placeholder="e.g. Rameshwar Lal"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Witness Type</label>
                      <Select
                        value={wit.type}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, type: e.target.value as any } : w))
                          )
                        }
                        className="w-full"
                      >
                        <option value="eyewitness">Eyewitness</option>
                        <option value="expert">Expert / Forensic Specialist</option>
                        <option value="complainant">Complainant / Informant</option>
                        <option value="police">Police / Panch Witness</option>
                        <option value="other">Other Character / Corroborative</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Contact Phone</label>
                      <Input
                        value={wit.contact}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, contact: e.target.value } : w))
                          )
                        }
                        placeholder="+91-98765-12345"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Statement Summary</label>
                      <textarea
                        value={wit.statementSummary}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, statementSummary: e.target.value } : w))
                          )
                        }
                        rows={2}
                        className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                        placeholder="Summary of statement recorded under Section 161 BNSS or deposition in chief..."
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2">
                        <FileCheck className="size-4 text-emerald-600" />
                        <div>
                          <span className="text-xs font-bold text-zinc-800 block">
                            Statement Document (PDF / Signed Copy)
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {wit.documentName || 'statement_recorded_signed.pdf'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Attached
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: EVIDENCE TRACKER                                            */}
        {/* =================================================================== */}
        {activeStepKey === 'evidence' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <FolderOpen className="size-5 text-amber-600" />
                  Step 5: Evidence Tracker &amp; Chain of Custody
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Track circumstantial, forensic, chemical, physical, and documentary exhibits with verified custody logs.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => addEvidence(activeEvidenceTab)}
              >
                <Plus className="size-4 mr-1" />
                Add {activeEvidenceTab.toUpperCase()} Evidence
              </Button>
            </div>

            {/* Evidence Count Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[
                { type: 'circumstantial', label: 'Circumstantial', count: evidenceItems.filter((e) => e.type === 'circumstantial').length },
                { type: 'forensic', label: 'Forensic', count: evidenceItems.filter((e) => e.type === 'forensic').length },
                { type: 'chemical', label: 'Chemical', count: evidenceItems.filter((e) => e.type === 'chemical').length },
                { type: 'physical', label: 'Physical', count: evidenceItems.filter((e) => e.type === 'physical').length },
                { type: 'documentary', label: 'Documentary', count: evidenceItems.filter((e) => e.type === 'documentary').length },
                { type: 'oral', label: 'Oral / Witness', count: evidenceItems.filter((e) => e.type === 'oral').length },
              ].map((item) => (
                <div
                  key={item.type}
                  onClick={() => setActiveEvidenceTab(item.type as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeEvidenceTab === item.type
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xl font-black block">{item.count}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Active Evidence Type Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['circumstantial', 'forensic', 'chemical', 'physical', 'documentary', 'oral'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEvidenceTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                      activeEvidenceTab === tab
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {tab} ({evidenceItems.filter((e) => e.type === tab).length})
                  </button>
                )
              )}
            </div>

            {/* Filtered Evidence Items */}
            <div className="space-y-4">
              {evidenceItems
                .filter((item) => item.type === activeEvidenceTab)
                .map((ev) => (
                  <Card key={ev.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-900">
                          {ev.evidenceId}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold uppercase">
                          {ev.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvidenceItems(evidenceItems.filter((e) => e.id !== ev.id))}
                        className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Description</label>
                        <Input
                          value={ev.description}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, description: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Evidence item description"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Status</label>
                        <Select
                          value={ev.status}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, status: e.target.value as any } : item
                              )
                            )
                          }
                          className="w-full"
                        >
                          <option value="Collected">Collected</option>
                          <option value="Sent to lab">Sent to lab</option>
                          <option value="Report received">Report received</option>
                          <option value="Produced in court">Produced in court</option>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Recovery Source</label>
                        <Input
                          value={ev.source}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, source: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Place/Person from where collected"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Collected By</label>
                        <Input
                          value={ev.collectedBy}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, collectedBy: e.target.value } : item
                              )
                            )
                          }
                          placeholder="IO or Crime Team member"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Date Collected</label>
                        <Input
                          type="date"
                          value={ev.dateCollected}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, dateCollected: e.target.value } : item
                              )
                            )
                          }
                        />
                      </div>

                      {ev.type === 'forensic' && (
                        <>
                          <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1">Lab Name</label>
                            <Input
                              value={ev.labName || ''}
                              onChange={(e) =>
                                setEvidenceItems(
                                  evidenceItems.map((item) =>
                                    item.id === ev.id ? { ...item, labName: e.target.value } : item
                                  )
                                )
                              }
                              placeholder="e.g. FSL Rohini"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1">Report Number</label>
                            <Input
                              value={ev.reportNumber || ''}
                              onChange={(e) =>
                                setEvidenceItems(
                                  evidenceItems.map((item) =>
                                    item.id === ev.id ? { ...item, reportNumber: e.target.value } : item
                                  )
                                )
                              }
                              placeholder="FSL-2026/BAL-8902"
                            />
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-3">
                        <label className="text-xs font-bold text-zinc-700 block mb-1">
                          Relevance &amp; Link to the Crime
                        </label>
                        <Input
                          value={ev.linksToCrime}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, linksToCrime: e.target.value } : item
                              )
                            )
                          }
                          placeholder="How does this item connect to the accused and offence?"
                        />
                      </div>
                    </div>

                    {/* Chain of Custody Table */}
                    <div className="pt-3 border-t border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800">
                          Chain of Custody Handover Log
                        </span>
                        <button
                          type="button"
                          onClick={() => addChainOfCustodyRow(ev.id)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Handover
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-zinc-100 font-bold text-zinc-700">
                            <tr>
                              <th className="p-2">Handed By</th>
                              <th className="p-2">Received By</th>
                              <th className="p-2">Date / Time</th>
                              <th className="p-2">Purpose</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 bg-white">
                            {ev.chainOfCustody.map((c, i) => (
                              <tr key={i}>
                                <td className="p-2 font-medium">{c.handedBy || '—'}</td>
                                <td className="p-2 font-medium">{c.receivedBy || '—'}</td>
                                <td className="p-2 text-zinc-500">{c.dateTime || '—'}</td>
                                <td className="p-2 text-zinc-600">{c.purpose || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 6: INVESTIGATION DOCUMENTS (POLICE / IO)                       */}
        {/* =================================================================== */}
        {activeStepKey === 'investigation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FileCheck className="size-5 text-purple-600" />
                Step 6: Police Investigation Records &amp; IO Log
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Checklist of police documents and timeline logs feeding the "no action taken" delay alerts.
              </p>
            </div>

            {/* Investigating Officer Details Card */}
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Lead Investigating Officer (IO) Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">IO Name</label>
                  <Input value={ioName} onChange={(e) => setIoName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Rank / Designation</label>
                  <Input value={ioRank} onChange={(e) => setIoRank(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Official Contact Phone</label>
                  <Input value={ioPhone} onChange={(e) => setIoPhone(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Official Email</label>
                  <Input value={ioEmail} onChange={(e) => setIoEmail(e.target.value)} />
                </div>
              </div>
            </Card>

            {/* Police Documents Checklist */}
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Mandatory Police Documentation Checklist
              </h3>
              <div className="space-y-2.5">
                {investigationDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 text-zinc-500" />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">{doc.name}</span>
                        <span className="text-[11px] text-zinc-400">{doc.fileName || 'No file attached'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Uploaded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[11px] py-1 h-auto"
                        onClick={() => {
                          setInvestigationDocs(
                            investigationDocs.map((d) =>
                              d.id === doc.id ? { ...d, status: d.status === 'Verified' ? 'Uploaded' : 'Verified' } : d
                            )
                          )
                        }}
                      >
                        Toggle Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Investigation Progress Log */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Investigation Progress Log
                  </h3>
                  <p className="text-[11px] text-zinc-400">Chronological action diary</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newLog: ProgressLogEntry = {
                      id: `log-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      actionTaken: 'Supplementary statement and ballistic report examined.',
                      nextActionDate: '2026-10-30',
                    }
                    setProgressLogs([...progressLogs, newLog])
                  }}
                >
                  <Plus className="size-3.5 mr-1" /> Add Entry
                </Button>
              </div>

              <div className="space-y-2">
                {progressLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-500 font-medium">
                      <span>Date: <strong className="text-zinc-900">{log.date}</strong></span>
                      <span>Next Action Due: <strong className="text-amber-700">{log.nextActionDate}</strong></span>
                    </div>
                    <p className="text-zinc-800 font-semibold">{log.actionTaken}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 7: DOCUMENTS REQUIRED FOR JUDGEMENT                            */}
        {/* =================================================================== */}
        {activeStepKey === 'judgement-documents' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Gavel className="size-5 text-indigo-600" />
                Step 7: Documents Required for Judgement &amp; Findings
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ensure judicial record completeness before delivering verdict and decree.
              </p>
            </div>

            {/* Judgement Readiness Progress Bar */}
            <Card className="p-5 space-y-2 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold tracking-wider uppercase text-zinc-300">
                  Judgement Readiness
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {reviewedCount} of {totalJudgementDocs} Records Reviewed ({readinessPercent}%)
                </span>
              </div>
              <div className="w-full bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </Card>

            {/* Required Checklist Items */}
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Bench Review Checklist
              </h3>
              <div className="space-y-2">
                {judgementDocs.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.isReviewed}
                        onChange={(e) =>
                          setJudgementDocs(
                            judgementDocs.map((d) =>
                              d.id === item.id
                                ? { ...d, isReviewed: e.target.checked, status: e.target.checked ? 'Reviewed' : 'Uploaded' }
                                : d
                            )
                          )
                        }
                        className="size-4.5 rounded text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-xs font-bold text-zinc-900">{item.title}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isReviewed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.isReviewed ? 'Marked as Reviewed' : 'Pending Review'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Precedents & Judge Notes */}
            <Card className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Case Law / Precedent References
                </label>
                <textarea
                  value={precedentLinks}
                  onChange={(e) => setPrecedentLinks(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Add citations, SCC references, or High Court precedents..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Judge's Notes &amp; Deliberations (Confidential)
                </label>
                <textarea
                  value={judgeNotes}
                  onChange={(e) => setJudgeNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Record judicial findings, credibility assessments, and reasoning..."
                />
              </div>
            </Card>

            {/* Final Judgement Parameters */}
            <Card className="p-5 space-y-4 border-l-4 border-l-indigo-600">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Final Judgement &amp; Operative Order Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Verdict</label>
                  <Select
                    value={finalVerdict}
                    onChange={(e) => setFinalVerdict(e.target.value as any)}
                    className="w-full font-bold"
                  >
                    <option value="Convicted">Convicted</option>
                    <option value="Acquitted">Acquitted</option>
                    <option value="Discharged">Discharged</option>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Judgement Date</label>
                  <Input
                    type="date"
                    value={judgementDate}
                    onChange={(e) => setJudgementDate(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Punishment / Sentence Awarded
                  </label>
                  <Input
                    value={punishmentSentence}
                    onChange={(e) => setPunishmentSentence(e.target.value)}
                    placeholder="e.g. Rigorous Imprisonment for 7 years and fine of ₹25,000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Operative Reasons &amp; Findings
                  </label>
                  <textarea
                    value={judgementReasons}
                    onChange={(e) => setJudgementReasons(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 8: REVIEW & SUBMIT                                             */}
        {/* =================================================================== */}
        {activeStepKey === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Step 8: Review &amp; Submit Docket
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Comprehensive summary across all sections. Verify mandatory fields before final submission.
              </p>
            </div>

            {/* Warnings Box if any */}
            {readinessPercent < 80 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
                <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-bold">Judicial Record Incomplete:</strong>
                  <span>
                    Judgement readiness is currently at {readinessPercent}%. You can still submit the docket for trial, but judgment delivery will require all checklist items reviewed.
                  </span>
                </div>
              </div>
            )}

            {/* Read-Only Summary Sections with Direct Edit Links */}
            <div className="space-y-4">
              {/* Summary Section 1 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="size-4 text-indigo-600" /> 1. Case Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('details')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">CNR Docket:</span>
                    <strong className="font-mono">{caseNumber}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Case Type:</span>
                    <strong>{caseType}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Court:</span>
                    <strong>{courtName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">FIR No:</span>
                    <strong>{firNumber} ({firDate})</strong>
                  </div>
                </div>
                <div className="text-xs">
                  <span className="text-zinc-400 block text-[10px]">Sections Applied:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sectionsTags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-zinc-100 font-bold text-[10.5px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Summary Section 2 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="size-4 text-rose-600" /> 2. Accused ({accusedList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('accused')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="space-y-2">
                  {accusedList.map((a, i) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex justify-between">
                      <div>
                        <strong>{i + 1}. {a.fullName || 'Accused'}</strong> ({a.role})
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Status: {a.arrestStatus} · Weapon: {a.weaponUsed ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 font-bold h-fit">
                        {a.gender}, {a.age} yrs
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Summary Section 3 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="size-4 text-emerald-600" /> 3. Victims ({victimsList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('victims')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="space-y-2">
                  {victimsList.map((v, i) => (
                    <div key={v.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex justify-between">
                      <div>
                        <strong>{i + 1}. {v.isConfidential ? '[PROTECTED IDENTITY]' : v.fullName}</strong>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Injury: {v.injuryOrLossDetails || 'Not specified'}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold h-fit">
                        {v.isConfidential ? 'Masked' : 'Public'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Summary Section 4 & 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/5">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase">
                      4. Witnesses ({witnessesList.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateToStep('witnesses')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    {witnessesList.map((w) => w.fullName).join(', ') || 'No witnesses recorded'}
                  </p>
                </Card>

                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/5">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase">
                      5. Evidence Items ({evidenceItems.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateToStep('evidence')}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Forensic ({evidenceItems.filter((e) => e.type === 'forensic').length}), Physical (
                    {evidenceItems.filter((e) => e.type === 'physical').length}), Documentary (
                    {evidenceItems.filter((e) => e.type === 'documentary').length})
                  </p>
                </Card>
              </div>

              {/* Submit Case Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 p-6 rounded-3xl text-white">
                <div>
                  <h4 className="font-bold text-sm">Ready to Register and Ingest Case Docket?</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Submitting will assign the official CNR case number and link all 8 sections to the active docket registry.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitDocket}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-md shrink-0 cursor-pointer"
                >
                  <Gavel className="size-4 mr-2" />
                  Submit Case Docket
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Bottom Stepper Footer */}
        <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStepNumber === 1}
            className="text-xs"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Previous Step
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
              Step {currentStepNumber} of 8
            </span>
            {currentStepNumber < 8 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="text-xs">
                Save &amp; Continue
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleSubmitDocket} className="text-xs bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="size-3.5 mr-1" />
                Complete &amp; Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
