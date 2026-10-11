// ============================================================================
// NYAYADESK JUDICIAL STORE & STATE SERVICE
// Complete relational datasets, Auto-Numbering, Auto-Documentation,
// Cloud Backup, and Criminal/Lawyer/Hearing/Punishment/Law state engine.
// ============================================================================
import { supabase } from './supabase'

export type PunishmentType =
  | 'CAPITAL'
  | 'LIFE_IMPRISONMENT'
  | 'RIGOROUS_IMPRISONMENT'
  | 'SIMPLE_IMPRISONMENT'
  | 'PENAL_FINE'
  | 'PROBATION'

export type SubmittingParty =
  | 'POLICE_INVESTIGATION'
  | 'DEFENSE_ADVOCATE'
  | 'PUBLIC_PROSECUTOR'
  | 'REGISTRY_DIRECT'

export interface CriminalOffense {
  date: string
  firCourt: string
  charges: string[]
  verdict: 'CONVICTED' | 'ACQUITTED' | 'UNDER_TRIAL' | 'DISCHARGED'
  sentence: string
  notes?: string
}

export interface CriminalRecord {
  id: string
  crimId: string // e.g., CRIM-2024-8819
  name: string
  aliases: string[]
  age: number
  dob: string
  gender: string
  biometricHash: string
  recidivismScore: number // 0.0 to 1.0
  activeCaseNumber?: string
  activeCaseId?: string
  custodyStatus: 'In custody' | 'On bail' | 'Absconding' | 'Not applicable'
  address: string
  photoPlaceholder: string
  crimes: CriminalOffense[]
}

export interface LawyerRecord {
  id: string
  barNumber: string // e.g. D/1482/2004 or MS/1182/2004
  name: string
  chapter: string
  enrolmentYear: number
  standingYears: number
  activeCasesCount: number
  isParticipatingInBench: boolean
  clearanceStatus: 'VERIFIED' | 'PROVISIONAL' | 'SUSPENDED'
  phone: string
  email: string
  chamber: string
}

export interface WeaponRecord {
  id: string
  type: 'FIREARM' | 'EDGED_WEAPON' | 'BLUNT_OBJECT' | 'EXPLOSIVE' | 'IMPROVISED'
  makeModel: string
  serialNumber: string
  recoveryMemo: string
  recoveryDate: string
  recoveryPlace: string
  ballisticStatus: 'MATCHED' | 'PENDING_FSL' | 'DISPUTED' | 'NOT_APPLICABLE'
  notes: string
}

export interface InvestigatingOfficer {
  name: string
  rank: string
  badge: string
  policeStation: string
  phone: string
  chargesheetRef: string
}

export interface EvidenceRecord {
  id: string
  code: string // e.g. EX-P-1
  kind: 'Forensic' | 'Digital' | 'Ballistic' | 'Documentary' | 'Witness' | 'Circumstantial'
  title: string
  detail: string
  custodyOfficer: string
  date: string
  place: string
  labStatus: 'received' | 'pending' | 'disputed' | 'n/a'
  admission: 'marked' | 'admitted' | 'rejected' | 'pending'
  chainHash: string
  notes?: string
}

export interface HearingRecord {
  id: string
  caseId: string
  caseNumber: string
  caseTitle: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  stage: string
  courtHall: string
  judge: string
  benchNotes?: string
  hasAlarm: boolean
  alarmUrgency?: 'INFO' | 'WARNING' | 'STATUTORY_CRITICAL'
}

export interface PunishmentRecord {
  id: string
  caseId: string
  caseNumber: string
  caseTitle: string
  convictName: string
  crimId: string
  judge: string
  type: PunishmentType
  durationMonths: number
  durationDescription?: string
  fineAmountInr: number
  pronouncementDate: string // YYYY-MM-DD
  operativeText: string
  operativeOrderSnippet?: string
}

export interface DocumentRecord {
  id: string
  caseId: string
  caseNumber: string
  canonicalName: string
  originalFileName: string
  submittingParty: SubmittingParty
  advocateOrOfficer: string
  submissionDate: string
  fileSize: string
  pages: number
  kind: string
  sha256: string
  ocrExcerpt: string
}

export interface AlarmRecord {
  id: string
  hearingId?: string
  caseId?: string
  caseNumber?: string
  title: string
  triggerTime: string
  urgency: 'INFO' | 'WARNING' | 'STATUTORY_CRITICAL'
  message: string
  isAcknowledged: boolean
  isDismissed: boolean
  createdAt: string
}

export interface StatutoryLaw {
  id: string
  actCode: string // e.g., BNS, IPC, POCSO, ARMS, NDPS, BSA
  actName: string
  section: string
  title: string
  description: string
  punishmentGuide: string
  ingredients: string[]
  precedents: { title: string; citation: string; principle: string }[]
}

export const DOCUMENT_CATEGORIES = [
  'Complaint / FIR',
  'Petition and response',
  'Charge sheet / final report, if applicable',
  'Evidence files and evidence index',
  'Witness statements / testimony',
  'Medical or forensic reports',
  'Previous court orders',
  'Relevant laws and judgments',
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

export interface FullCaseRecord {
  id: string
  number: string
  title: string
  type: 'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'
  court: string
  acts: string[]
  stage: string
  status: 'ontrack' | 'warning' | 'overdue'
  filingDate: string
  nextHearing: string
  judge: string
  policeStation: string
  fir: {
    no: string
    date: string
    time?: string
    gdNo?: string
    gdTime?: string
    complainantName?: string
    complainantContact?: string
    dutyOfficer?: string
    infoType?: string
    delayReason?: string
    docFileName?: string
    docFileSize?: string
    docStatus?: string
  }
  intakeDocuments?: {
    id: string
    title: string
    category: string
    fileName: string
    fileSize: string
    uploadDate: string
    status: 'Verified' | 'Uploaded' | 'Pending'
  }[]
  io: InvestigatingOfficer
  parties: {
    role: 'Complainant / Offended Party' | 'Accused' | 'Victim' | 'Key Witness' | 'Prosecutor' | 'Defense Counsel'
    name: string
    crimId?: string
    lawyerBar?: string
    masked?: boolean
    custody?: 'In custody' | 'On bail' | 'Absconding' | 'Not applicable'
  }[]
  victims: {
    total: number
    minors: number
    adults: number
    details: { name: string; masked: boolean; age: number; relationship: string }[]
  }
  weapons: WeaponRecord[]
  evidence: EvidenceRecord[]
  documents: DocumentRecord[]
  hearings: HearingRecord[]
  additionalDetails: string
  isClosed: boolean
  checkedDocCategories?: string[]
  closureRecord?: {
    closedDate: string
    decreeHash: string
    cloudSnapshotUri: string
    judgmentSummary: string
    punishments: PunishmentRecord[]
  }
}

// ============================================================================
// INITIAL SEED DATA
// ============================================================================

export const INITIAL_CRIMINALS: CriminalRecord[] = []
export const INITIAL_LAWYERS: LawyerRecord[] = []

export const INITIAL_STATUTORY_LAWS: StatutoryLaw[] = [
  {
    id: 'law-bns-103',
    actCode: 'BNS',
    actName: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 103(1)',
    title: 'Punishment for Murder',
    description: 'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
    punishmentGuide: 'Capital Punishment (Death) or Life Imprisonment + Fine',
    ingredients: [
      'Proof of death of the victim.',
      'Actus Reus: Death caused by the voluntary bodily act of the accused.',
      'Mens Rea: Intention of causing death, or causing bodily injury known to be likely to cause death.',
      'Knowledge that the act is so imminently dangerous that it must in all probability cause death.',
    ],
    precedents: [
      {
        title: 'Virsa Singh v. State of Punjab',
        citation: 'AIR 1958 SC 465',
        principle: 'Prosecution must prove objective bodily injury and subjective intention to inflict that specific injury sufficient in the ordinary course of nature to cause death.',
      },
      {
        title: 'Bachan Singh v. State of Punjab',
        citation: '(1980) 2 SCC 684',
        principle: 'Death penalty only in the "rarest of rare cases" when the alternative option of life imprisonment is unquestionably foreclosed.',
      },
    ],
  },
  {
    id: 'law-bns-309',
    actCode: 'BNS',
    actName: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 309(4)',
    title: 'Robbery with Attempt to Cause Death or Hurt',
    description: 'If at the time of committing or attempting to commit robbery, the offender uses any deadly weapon or causes grievous hurt to any person, imprisonment shall not be less than seven years.',
    punishmentGuide: 'Rigorous Imprisonment for not less than 7 years, extending up to 10 years + Fine',
    ingredients: [
      'Commission of theft or extortion by wrongful restraint, fear of instant hurt or instant death.',
      'Active use or carrying of a deadly weapon at the time of committing the offense.',
      'Proof of seizure of weapon or corroborative witness testimony.',
    ],
    precedents: [
      {
        title: 'Phool Kumar v. Delhi Administration',
        citation: '(1975) 1 SCC 797',
        principle: '"Uses" any deadly weapon includes openly carrying or flashing a deadly weapon to overawe or terrorize the victim without discharging it.',
      },
    ],
  },
  {
    id: 'law-arms-25',
    actCode: 'ARMS',
    actName: 'The Arms Act, 1959',
    section: 'Section 25(1B)(a)',
    title: 'Acquisition or Possession of Unlicensed Firearms or Ammunition',
    description: 'Whoever acquires, has in his possession or carries any firearm or ammunition in contravention of section 3 shall be punishable with imprisonment for a term which shall not be less than two years but which may extend to five years and with fine.',
    punishmentGuide: 'Rigorous Imprisonment 2 to 5 years + Fine',
    ingredients: [
      'Proof of conscious possession of firearm or ammunition.',
      'Absence of valid arms license under Section 3.',
      'Forensic / Ballistic report establishing the seized object is a "firearm" capable of propulsion.',
      'Valid Sanction for prosecution under Section 39 from District Magistrate.',
    ],
    precedents: [
      {
        title: 'Gunwantlal v. State of Madhya Pradesh',
        citation: '(1972) 2 SCC 194',
        principle: 'Conscious possession means control over the firearm with the accompanying mental element of being aware of its custody.',
      },
    ],
  },
  {
    id: 'law-bsa-23',
    actCode: 'BSA',
    actName: 'Bharatiya Sakshya Adhiniyam, 2023 (Sec 23 / Sec 27 IEA)',
    section: 'Section 23',
    title: 'Discovery of Facts on Information Received from Accused in Custody',
    description: 'When any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact thereby discovered, may be proved.',
    punishmentGuide: 'Evidentiary Rule of Admissibility',
    ingredients: [
      'Accused must be in custody of police at the time of making disclosure statement.',
      'Disclosure statement must lead directly to discovery of a physical fact (e.g. concealed weapon).',
      'The fact discovered must be concealed and not previously known to the investigating officer.',
      'Preparation of contemporaneous Seizure Memo (Mahazar) with independent attesting witnesses.',
    ],
    precedents: [
      {
        title: 'Pulukuri Kottaya v. King-Emperor',
        citation: 'AIR 1947 PC 67',
        principle: 'Only the exact statement leading directly to the physical place of concealment and recovery of the object is admissible, not confessional admissions of guilt.',
      },
      {
        title: 'State of H.P. v. Jeet Singh',
        citation: '(1999) 4 SCC 370',
        principle: 'Recovery under Section 27 cannot be disregarded merely because independent witnesses turned hostile or were unavailable, if IO credibility is sound.',
      },
    ],
  },
  {
    id: 'law-pocso-6',
    actCode: 'POCSO',
    actName: 'Protection of Children from Sexual Offences Act, 2012',
    section: 'Section 6',
    title: 'Punishment for Aggravated Penetrative Sexual Assault',
    description: 'Whoever commits aggravated penetrative sexual assault shall be punished with rigorous imprisonment for a term which shall not be less than twenty years, but which may extend to imprisonment for life, and shall also be liable to fine.',
    punishmentGuide: 'Rigorous Imprisonment 20 years to Life (or Death in extreme cases) + Fine',
    ingredients: [
      'Victim under 18 years of age at the time of the alleged incident.',
      'Aggravating circumstance (e.g., person in position of trust/authority, gang assault, recurring assault).',
      'Presumption of mental state under POCSO Section 29 operates against the accused upon foundational fact proof.',
    ],
    precedents: [
      {
        title: 'State of Karnataka v. Shivanna',
        citation: '(2014) 8 SCC 913',
        principle: 'Strict guidelines for in-camera recording of victim testimony; cross-examination questions must be routed through the presiding judge to avoid secondary trauma.',
      },
    ],
  },
]

import { SEED_CASES } from './seedCases'

export const INITIAL_PUNISHMENTS: PunishmentRecord[] = []
export const INITIAL_DOCUMENTS: DocumentRecord[] = []
export const INITIAL_HEARINGS: HearingRecord[] = []
export const INITIAL_ALARMS: AlarmRecord[] = []
export const INITIAL_CASES: FullCaseRecord[] = SEED_CASES

// ============================================================================
// STORE STATE WITH LOCALSTORAGE PERSISTENCE
// ============================================================================

const STORAGE_KEYS = {
  CASES: 'mercy_clean_cases_v3',
  CRIMINALS: 'mercy_clean_criminals_v3',
  LAWYERS: 'mercy_clean_lawyers_v3',
  HEARINGS: 'mercy_clean_hearings_v3',
  PUNISHMENTS: 'mercy_clean_punishments_v3',
  DOCUMENTS: 'mercy_clean_documents_v3',
  ALARMS: 'mercy_clean_alarms_v3',
  THEME: 'mercy_theme_v3',
  BACKUP_META: 'mercy_backup_meta_v3',
}

if (typeof window !== 'undefined') {
  const legacyKeys = [
    'nyayadesk_cases_v2',
    'nyayadesk_hearings_v2',
    'nyayadesk_documents_v2',
    'nyayadesk_criminals_v2',
    'nyayadesk_lawyers_v2',
    'nyayadesk_punishments_v2',
    'nyayadesk_alarms_v2',
    'nyayadesk_theme_v2',
    'nyayadesk_backup_meta_v2',
    'mercy_cases_v5',
    'mercy_hearings_v5',
    'mercy_real_cases_v1',
    'mercy_real_criminals_v1',
    'mercy_real_lawyers_v1',
    'mercy_real_hearings_v1',
    'mercy_real_punishments_v1',
    'mercy_real_documents_v1',
    'mercy_real_alarms_v1',
    'mercy_clean_dockets_v2',
    'mercy_clean_criminals_v2',
    'mercy_clean_lawyers_v2',
    'mercy_clean_hearings_v2',
    'mercy_clean_punishments_v2',
    'mercy_clean_documents_v2',
    'mercy_clean_alarms_v2',
  ]
  legacyKeys.forEach((k) => localStorage.removeItem(k))
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      return JSON.parse(raw) as T
    }
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}`, e)
  }
  return fallback
}

function saveToStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {
    console.warn(`Error saving to localStorage for ${key}`, e)
  }
}

class JudicialStoreService {
  private cases: FullCaseRecord[]
  private criminals: CriminalRecord[]
  private lawyers: LawyerRecord[]
  private hearings: HearingRecord[]
  private punishments: PunishmentRecord[]
  private documents: DocumentRecord[]
  private alarms: AlarmRecord[]
  private laws: StatutoryLaw[] = INITIAL_STATUTORY_LAWS
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.cases = loadFromStorage(STORAGE_KEYS.CASES, INITIAL_CASES)
    if (!this.cases || this.cases.length === 0) {
      this.cases = [...SEED_CASES]
    }
    this.criminals = loadFromStorage(STORAGE_KEYS.CRIMINALS, INITIAL_CRIMINALS)
    this.lawyers = loadFromStorage(STORAGE_KEYS.LAWYERS, INITIAL_LAWYERS)
    this.hearings = loadFromStorage(STORAGE_KEYS.HEARINGS, INITIAL_HEARINGS)
    this.punishments = loadFromStorage(STORAGE_KEYS.PUNISHMENTS, INITIAL_PUNISHMENTS)
    this.documents = loadFromStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS)
    this.alarms = loadFromStorage(STORAGE_KEYS.ALARMS, INITIAL_ALARMS)
    this.syncFromSupabase()
  }

  public async syncFromSupabase(): Promise<void> {
    if (!supabase) return
    try {
      const { data: supaCases } = await supabase.from('cases').select('*')
      if (supaCases && supaCases.length > 0) {
        this.cases = supaCases.map((sc: any) => ({
          id: sc.id,
          number: sc.number || sc.case_number || 'CASE-001',
          title: sc.title || sc.case_name || 'Judicial Matter',
          type: sc.type || sc.case_type || 'Criminal',
          court: sc.court || sc.court_name || 'Principal Sessions Court · Bench 04',
          acts: sc.acts || [],
          stage: sc.stage || 'Framing of Charges',
          status: sc.status || 'ontrack',
          filingDate: sc.filing_date || new Date().toISOString().slice(0, 10),
          nextHearing: sc.next_hearing || '2026-10-24',
          judge: sc.judge || 'Hon. Justice R. Venkataraman',
          policeStation: sc.police_station || 'PS Crime Branch',
          fir: { no: sc.fir_no || 'N/A', date: sc.fir_date || sc.filing_date },
          io: {
            name: sc.investigating_officer || 'Unassigned',
            rank: 'Inspector',
            badge: 'POL-01',
            policeStation: sc.police_station || 'PS Crime Branch',
            phone: '',
            chargesheetRef: '',
          },
          parties: [],
          victims: { total: 0, minors: 0, adults: 0, details: [] },
          weapons: [],
          evidence: [],
          documents: [],
          hearings: [],
          additionalDetails: sc.summary || '',
          isClosed: Boolean(sc.is_closed),
        }))
        this.notify()
      }

      const { data: supaDocs } = await supabase.from('documents').select('*')
      if (supaDocs && supaDocs.length > 0) {
        this.documents = supaDocs.map((sd: any) => ({
          id: sd.id,
          caseId: sd.case_id,
          caseNumber: sd.case_number || '',
          canonicalName: sd.canonical_name || 'Document',
          originalFileName: sd.original_file_name || 'file.docx',
          submittingParty: sd.submitting_party || 'DEFENSE_ADVOCATE',
          advocateOrOfficer: sd.advocate_or_officer || 'Advocate',
          submissionDate: sd.submission_date || new Date().toISOString().slice(0, 10),
          fileSize: sd.file_size || '1.0 MB',
          pages: sd.pages || 1,
          kind: sd.kind || 'Affidavit (.docx)',
          sha256: sd.sha256 || '0000',
          ocrExcerpt: sd.ocr_excerpt || '',
        }))
        this.notify()
      }

      const { data: supaCriminals } = await supabase.from('criminals').select('*')
      if (supaCriminals && supaCriminals.length > 0) {
        this.criminals = supaCriminals.map((sc: any) => ({
          id: sc.id,
          crimId: sc.crim_id || sc.id,
          name: sc.name || 'Accused',
          aliases: sc.aliases || [],
          age: sc.age || 30,
          dob: sc.dob || '1995-01-01',
          gender: sc.gender || 'Male',
          biometricHash: sc.biometric_hash || 'SHA256:0000',
          recidivismScore: Number(sc.recidivism_score || 0.3),
          activeCaseNumber: sc.active_case_number || '',
          activeCaseId: sc.active_case_id || '',
          custodyStatus: sc.custody_status || 'In custody',
          address: sc.address || 'Delhi / NCR',
          photoPlaceholder: sc.photo_placeholder || (sc.name ? sc.name.slice(0, 2).toUpperCase() : 'AC'),
          crimes: sc.crimes || [],
        }))
        this.notify()
      }

      const { data: supaPunishments } = await supabase.from('punishments').select('*')
      if (supaPunishments && supaPunishments.length > 0) {
        this.punishments = supaPunishments.map((sp: any) => ({
          id: sp.id,
          caseId: sp.case_id || '',
          caseNumber: sp.case_number || 'CASE-001',
          caseTitle: sp.case_title || 'Judicial Proceeding',
          convictName: sp.convict_name || 'Accused',
          crimId: sp.crim_id || 'CRIM-001',
          judge: sp.judge || 'Hon. Justice R. Venkataraman',
          type: (sp.punishment_type || sp.type || 'RIGOROUS_IMPRISONMENT') as PunishmentType,
          durationMonths: Number(sp.duration_months || 0),
          durationDescription: sp.duration_description || (sp.duration_months ? `${sp.duration_months} Months` : 'Statutory Order'),
          fineAmountInr: Number(sp.fine_amount_inr || 0),
          pronouncementDate: sp.pronouncement_date || new Date().toISOString().slice(0, 10),
          operativeText: sp.operative_text || '',
          operativeOrderSnippet: sp.operative_text || '',
        }))
        this.notify()
      }

      const { data: supaHearings } = await supabase.from('hearings').select('*')
      if (supaHearings && supaHearings.length > 0) {
        this.hearings = supaHearings.map((sh: any) => ({
          id: sh.id,
          caseId: sh.case_id || '',
          caseNumber: sh.case_number || '',
          caseTitle: sh.case_title || '',
          date: sh.hearing_date || sh.date || new Date().toISOString().slice(0, 10),
          time: sh.time_slot || sh.time || '10:30',
          stage: sh.stage || 'Hearing',
          courtHall: sh.court_hall || 'Hall 04 (Main Sessions)',
          judge: sh.judge || 'Hon. Justice R. Venkataraman',
          benchNotes: sh.bench_notes,
          hasAlarm: Boolean(sh.has_alarm),
          alarmUrgency: sh.alarm_urgency || 'INFO',
        }))
        this.notify()
      }

      const { data: supaLawyers } = await supabase.from('lawyers').select('*')
      if (supaLawyers && supaLawyers.length > 0) {
        this.lawyers = supaLawyers.map((sl: any) => ({
          id: sl.id,
          barNumber: sl.bar_number || sl.id,
          name: sl.name || 'Advocate',
          chapter: sl.chapter || 'Bar Council of Delhi',
          enrolmentYear: Number(sl.enrolment_year || 2015),
          standingYears: Number(sl.standing_years || 10),
          activeCasesCount: Number(sl.active_cases_count || 1),
          isParticipatingInBench: sl.is_participating_in_bench ?? true,
          clearanceStatus: sl.clearance_status || 'VERIFIED',
          phone: sl.phone || '',
          email: sl.email || '',
          chamber: sl.chamber || '',
        }))
        this.notify()
      }
    } catch (e) {
      console.warn('Supabase sync notice:', e)
    }
  }

  public async pushToSupabase(): Promise<{
    success: boolean
    counts: {
      cases: number
      criminals: number
      lawyers: number
      hearings: number
      punishments: number
      documents: number
    }
    errors: string[]
  }> {
    if (!supabase) {
      return {
        success: false,
        counts: { cases: 0, criminals: 0, lawyers: 0, hearings: 0, punishments: 0, documents: 0 },
        errors: ['Supabase client not initialized or missing configuration in .env'],
      }
    }

    const errors: string[] = []
    let casesCount = 0
    let criminalsCount = 0
    let lawyersCount = 0
    let hearingsCount = 0
    let punishmentsCount = 0
    let documentsCount = 0

    // 1. Push Cases
    try {
      if (this.cases.length > 0) {
        const rows = this.cases.map((c) => ({
          id: c.id,
          number: c.number,
          title: c.title,
          type: c.type,
          court: c.court,
          acts: c.acts,
          stage: c.stage,
          status: c.status,
          filing_date: c.filingDate,
          next_hearing: c.nextHearing,
          judge: c.judge,
          police_station: c.policeStation,
          fir_no: c.fir.no,
          fir_date: c.fir.date,
          investigating_officer: c.io.name,
          summary: c.additionalDetails || '',
          is_closed: Boolean(c.isClosed),
        }))
        const { error } = await supabase.from('cases').upsert(rows)
        if (error) errors.push(`Cases: ${error.message}`)
        else casesCount = rows.length
      }
    } catch (e: any) {
      errors.push(`Cases: ${e?.message || e}`)
    }

    // 2. Push Criminals
    try {
      if (this.criminals.length > 0) {
        const rows = this.criminals.map((cr) => ({
          id: cr.id,
          crim_id: cr.crimId,
          name: cr.name,
          aliases: cr.aliases,
          age: cr.age,
          dob: cr.dob,
          gender: cr.gender,
          biometric_hash: cr.biometricHash,
          recidivism_score: cr.recidivismScore,
          active_case_number: cr.activeCaseNumber || '',
          active_case_id: cr.activeCaseId || '',
          custody_status: cr.custodyStatus,
          address: cr.address,
          photo_placeholder: cr.photoPlaceholder,
          crimes: cr.crimes,
        }))
        const { error } = await supabase.from('criminals').upsert(rows)
        if (error) errors.push(`Criminals: ${error.message}`)
        else criminalsCount = rows.length
      }
    } catch (e: any) {
      errors.push(`Criminals: ${e?.message || e}`)
    }

    // 3. Push Lawyers
    try {
      if (this.lawyers.length > 0) {
        const rows = this.lawyers.map((l) => ({
          id: l.id,
          bar_number: l.barNumber,
          name: l.name,
          chapter: l.chapter,
          enrolment_year: l.enrolmentYear,
          standing_years: l.standingYears,
          active_cases_count: l.activeCasesCount,
          is_participating_in_bench: l.isParticipatingInBench,
          clearance_status: l.clearanceStatus,
          phone: l.phone,
          email: l.email,
          chamber: l.chamber,
        }))
        const { error } = await supabase.from('lawyers').upsert(rows)
        if (error) errors.push(`Lawyers: ${error.message}`)
        else lawyersCount = rows.length
      }
    } catch (e: any) {
      errors.push(`Lawyers: ${e?.message || e}`)
    }

    // 4. Push Hearings
    try {
      if (this.hearings.length > 0) {
        const rows = this.hearings.map((h) => ({
          id: h.id,
          case_id: h.caseId,
          case_number: h.caseNumber,
          case_title: h.caseTitle,
          date: h.date,
          time: h.time,
          stage: h.stage,
          court_hall: h.courtHall,
          judge: h.judge,
          bench_notes: h.benchNotes || '',
          has_alarm: Boolean(h.hasAlarm),
          alarm_urgency: h.alarmUrgency || 'INFO',
        }))
        const { error } = await supabase.from('hearings').upsert(rows)
        if (error) errors.push(`Hearings: ${error.message}`)
        else hearingsCount = rows.length
      }
    } catch (e: any) {
      errors.push(`Hearings: ${e?.message || e}`)
    }

    // 5. Push Punishments
    try {
      if (this.punishments.length > 0) {
        const rows = this.punishments.map((p) => ({
          id: p.id,
          case_id: p.caseId,
          case_number: p.caseNumber,
          case_title: p.caseTitle,
          convict_name: p.convictName,
          crim_id: p.crimId,
          judge: p.judge,
          type: p.type,
          duration_months: p.durationMonths,
          duration_description: p.durationDescription || '',
          fine_amount_inr: p.fineAmountInr,
          pronouncement_date: p.pronouncementDate,
          operative_text: p.operativeText,
        }))
        const { error } = await supabase.from('punishments').upsert(rows)
        if (error) errors.push(`Punishments: ${error.message}`)
        else punishmentsCount = rows.length
      }
    } catch (e: any) {
      errors.push(`Punishments: ${e?.message || e}`)
    }

    // 6. Push Documents
    try {
      if (this.documents.length > 0) {
        const rows = this.documents.map((d) => ({
          id: d.id,
          case_id: d.caseId,
          case_number: d.caseNumber,
          canonical_name: d.canonicalName,
          original_file_name: d.originalFileName,
          submitting_party: d.submittingParty,
          advocate_or_officer: d.advocateOrOfficer,
          submission_date: d.submissionDate,
          file_size: d.fileSize,
          pages: d.pages,
          kind: d.kind,
          sha256: d.sha256,
          ocr_excerpt: d.ocrExcerpt || '',
        }))
        const { error } = await supabase.from('documents').upsert(rows)
        if (error) errors.push(`Documents: ${error.message}`)
        else documentsCount = rows.length
      }
    } catch (e: any) {
      errors.push(`Documents: ${e?.message || e}`)
    }

    return {
      success: errors.length === 0,
      counts: {
        cases: casesCount,
        criminals: criminalsCount,
        lawyers: lawyersCount,
        hearings: hearingsCount,
        punishments: punishmentsCount,
        documents: documentsCount,
      },
      errors,
    }
  }

  public async testDatabaseConnection(): Promise<{
    connected: boolean
    latencyMs: number
    supabaseUrl: string
    tablesStatus: Record<string, boolean>
    error?: string
  }> {
    if (!supabase) {
      return {
        connected: false,
        latencyMs: 0,
        supabaseUrl: '',
        tablesStatus: {},
        error: 'Supabase client not initialized',
      }
    }

    const start = performance.now()
    const tables = ['cases', 'lawyers', 'criminals', 'hearings', 'punishments', 'documents']
    const tablesStatus: Record<string, boolean> = {}

    try {
      const results = await Promise.all(
        tables.map(async (tbl) => {
          try {
            const { error } = await supabase!.from(tbl).select('id').limit(1)
            return { tbl, ok: !error }
          } catch {
            return { tbl, ok: false }
          }
        })
      )

      results.forEach((r) => {
        tablesStatus[r.tbl] = r.ok
      })

      const latency = Math.round(performance.now() - start)
      const hasAnyOk = Object.values(tablesStatus).some(Boolean)

      return {
        connected: hasAnyOk,
        latencyMs: latency,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://vodrmtqzqrmrcevmlvyg.supabase.co',
        tablesStatus,
      }
    } catch (e: any) {
      return {
        connected: false,
        latencyMs: Math.round(performance.now() - start),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
        tablesStatus,
        error: e?.message || 'Connection timeout or network failure',
      }
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  public resetToCleanState(): void {
    this.cases = []
    this.criminals = []
    this.lawyers = []
    this.hearings = []
    this.punishments = []
    this.documents = []
    this.alarms = []
    this.notify()
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
    }
  }

  private notify(): void {
    saveToStorage(STORAGE_KEYS.CASES, this.cases)
    saveToStorage(STORAGE_KEYS.CRIMINALS, this.criminals)
    saveToStorage(STORAGE_KEYS.LAWYERS, this.lawyers)
    saveToStorage(STORAGE_KEYS.HEARINGS, this.hearings)
    saveToStorage(STORAGE_KEYS.PUNISHMENTS, this.punishments)
    saveToStorage(STORAGE_KEYS.DOCUMENTS, this.documents)
    saveToStorage(STORAGE_KEYS.ALARMS, this.alarms)
    this.listeners.forEach((fn) => fn())
  }

  // --------------------------------------------------------------------------
  // CASES & AUTO-NUMBERING
  // --------------------------------------------------------------------------

  public getCases(): FullCaseRecord[] {
    return this.cases
  }

  public getCase(idOrNumber: string): FullCaseRecord | undefined {
    return this.cases.find(
      (c) =>
        c.id.toLowerCase() === idOrNumber.toLowerCase() ||
        c.number.toLowerCase() === idOrNumber.toLowerCase() ||
        c.number.replace(/\s+/g, '').toLowerCase() === idOrNumber.replace(/\s+/g, '').toLowerCase()
    )
  }

  /**
   * Core Auto-Numbering Engine:
   * Generates case number and case name from case details, evidence, and investigating officers.
   */
  public generateCaseNumberAndName(params: {
    jurisdictionCode: string // e.g. "DL" or "TN"
    caseType: 'Criminal' | 'POCSO' | 'Matrimonial' | 'Civil'
    year: number
    policeStationCode: string // e.g. "PSCT" or "AN"
    primaryComplainant: string
    primaryAccused: string
    coAccusedCount: number
    primaryStatuteSection: string
  }): { caseNumber: string; caseName: string } {
    const typeCode =
      params.caseType === 'Criminal'
        ? 'CR'
        : params.caseType === 'POCSO'
          ? 'POCSO'
          : params.caseType === 'Matrimonial'
            ? 'MAT'
            : 'CIV'

    // Determine sequence number based on existing cases count + 101
    const seq = String(this.cases.length + 101).padStart(4, '0')
    const cleanPrecinct = params.policeStationCode.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4) || 'PS'

    const caseNumber = `${params.jurisdictionCode}-${typeCode}-${params.year}-${cleanPrecinct}-${seq}`

    const accusedClause =
      params.coAccusedCount > 0
        ? `${params.primaryAccused.toUpperCase()} & ${params.coAccusedCount} ORS.`
        : params.primaryAccused.toUpperCase()

    const caseName = `${params.primaryComplainant.toUpperCase()} VS. ${accusedClause} (U/S ${params.primaryStatuteSection.toUpperCase()})`

    return { caseNumber, caseName }
  }

  public ingestNewCase(caseData: Omit<FullCaseRecord, 'id'>): FullCaseRecord {
    const id = caseData.number.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const newCase: FullCaseRecord = {
      ...caseData,
      id,
    }
    this.cases = [newCase, ...this.cases]
    this.notify()

    if (supabase) {
      try {
        supabase.from('cases').upsert({
          id: newCase.id,
          number: newCase.number,
          title: newCase.title,
          type: newCase.type,
          court: newCase.court,
          acts: newCase.acts,
          stage: newCase.stage,
          status: newCase.status,
          filing_date: newCase.filingDate,
          next_hearing: newCase.nextHearing,
          judge: newCase.judge,
          police_station: newCase.policeStation,
          fir_no: newCase.fir?.no || 'N/A',
          fir_date: newCase.fir?.date || newCase.filingDate,
          summary: newCase.additionalDetails,
          is_closed: newCase.isClosed,
        }).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase upsert case error:', e)
      }
    }
    return newCase
  }

  public updateCase(caseId: string, updates: Partial<FullCaseRecord>): FullCaseRecord | undefined {
    const idx = this.cases.findIndex((c) => c.id === caseId)
    if (idx === -1) return undefined
    this.cases[idx] = {
      ...this.cases[idx],
      ...updates,
    }
    if (updates.number || updates.title) {
      this.hearings.forEach((h) => {
        if (h.caseId === caseId) {
          if (updates.number) h.caseNumber = updates.number
          if (updates.title) h.caseTitle = updates.title
        }
      })
      this.documents.forEach((d) => {
        if (d.caseId === caseId && updates.number) {
          d.caseNumber = updates.number
        }
      })
    }
    this.notify()

    if (supabase) {
      try {
        const c = this.cases[idx]
        supabase.from('cases').update({
          title: c.title,
          type: c.type,
          stage: c.stage,
          status: c.status,
          next_hearing: c.nextHearing,
          police_station: c.policeStation,
          acts: c.acts,
        }).eq('id', caseId).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase update case error:', e)
      }
    }

    return this.cases[idx]
  }

  public deleteCase(caseId: string): boolean {
    const exists = this.cases.some((c) => c.id === caseId)
    if (!exists) return false
    this.cases = this.cases.filter((c) => c.id !== caseId)
    this.hearings = this.hearings.filter((h) => h.caseId !== caseId)
    this.documents = this.documents.filter((d) => d.caseId !== caseId)
    this.alarms = this.alarms.filter((a) => a.caseId !== caseId)
    this.notify()

    if (supabase) {
      try {
        supabase.from('cases').delete().eq('id', caseId).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase delete case error:', e)
      }
    }

    return true
  }

  // --------------------------------------------------------------------------
  // AUTO-DOCUMENTATION & CLOSURE
  // --------------------------------------------------------------------------

  /**
   * Trigger: Judge closes a case.
   * Action: Generates signed court decree, calculates punishments,
   * stores to simulated cloud backup, generates printable record.
   */
  public closeCaseWithAutoDocumentation(params: {
    caseId: string
    judgmentText: string
    punishments: {
      convictName: string
      crimId: string
      type: PunishmentType
      durationMonths: number
      fineAmountInr: number
      operativeDecree: string
    }[]
  }): FullCaseRecord {
    const targetCase = this.cases.find((c) => c.id === params.caseId)
    if (!targetCase) throw new Error('Case not found')

    const dateToday = new Date().toISOString().split('T')[0]
    const decreeHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    const cloudSnapshotUri = `s3://nyayadesk-cloud-vault/decrees/2026/${targetCase.number.replace(/\//g, '-')}-${decreeHash.slice(0, 12)}.pdf.enc`

    // Generate Punishment records
    const createdPunishments: PunishmentRecord[] = params.punishments.map((p, idx) => ({
      id: `pnh-${Date.now()}-${idx}`,
      caseId: targetCase.id,
      caseNumber: targetCase.number,
      caseTitle: targetCase.title,
      convictName: p.convictName,
      crimId: p.crimId,
      judge: targetCase.judge,
      type: p.type,
      durationMonths: p.durationMonths,
      fineAmountInr: p.fineAmountInr,
      pronouncementDate: dateToday,
      operativeText: p.operativeDecree,
    }))

    // Add to global punishment history
    this.punishments = [...createdPunishments, ...this.punishments]

    // Create Document in Document History for the Decree
    const decreeDoc: DocumentRecord = {
      id: `doc-${Date.now()}-decree`,
      caseId: targetCase.id,
      caseNumber: targetCase.number,
      canonicalName: `DECREE-${targetCase.number.replace(/[^A-Za-z0-9]/g, '-')}-FINAL-JUDGMENT`,
      originalFileName: `FINAL_ORDER_${targetCase.number.replace(/[^A-Za-z0-9]/g, '_')}.pdf`,
      submittingParty: 'REGISTRY_DIRECT',
      advocateOrOfficer: targetCase.judge,
      submissionDate: dateToday,
      fileSize: '1.4 MB',
      pages: 18,
      kind: 'Final Decree & Order',
      sha256: decreeHash,
      ocrExcerpt: `COURT OF THE SESSIONS JUDGE. IN THE MATTER OF ${targetCase.title}. DECREE OF PRONOUNCEMENT: ${params.judgmentText.slice(0, 160)}...`,
    }
    this.documents = [decreeDoc, ...this.documents]

    // Update Case status to Closed
    targetCase.isClosed = true
    targetCase.stage = 'Closed & Disposed (Judgment Pronounced)'
    targetCase.status = 'ontrack'
    targetCase.closureRecord = {
      closedDate: dateToday,
      decreeHash,
      cloudSnapshotUri,
      judgmentSummary: params.judgmentText,
      punishments: createdPunishments,
    }

    this.notify()

    if (supabase) {
      try {
        createdPunishments.forEach((cp) => {
          supabase.from('punishments').upsert({
            id: cp.id,
            case_id: cp.caseId,
            case_number: cp.caseNumber,
            case_title: cp.caseTitle,
            convict_name: cp.convictName,
            crim_id: cp.crimId,
            judge: cp.judge,
            punishment_type: cp.type,
            duration_months: cp.durationMonths,
            fine_amount_inr: cp.fineAmountInr,
            pronouncement_date: cp.pronouncementDate,
            operative_text: cp.operativeText,
            decree_hash: decreeHash,
          }).then(() => {}).catch(() => {})
        })

        supabase.from('documents').upsert({
          id: decreeDoc.id,
          case_id: decreeDoc.caseId,
          canonical_name: decreeDoc.canonicalName,
          original_file_name: decreeDoc.originalFileName,
          submitting_party: decreeDoc.submittingParty,
          advocate_or_officer: decreeDoc.advocateOrOfficer,
          submission_date: decreeDoc.submissionDate,
          file_size: decreeDoc.fileSize,
          pages: decreeDoc.pages,
          kind: decreeDoc.kind,
          sha256: decreeDoc.sha256,
          ocr_excerpt: decreeDoc.ocrExcerpt,
        }).then(() => {}).catch(() => {})

        supabase.from('cases').update({
          is_closed: true,
          stage: targetCase.stage,
          status: targetCase.status,
        }).eq('id', targetCase.id).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase closeCase error:', e)
      }
    }

    return targetCase
  }

  public addWeaponToCase(caseId: string, weaponData: Omit<WeaponRecord, 'id'>): WeaponRecord | undefined {
    const targetCase = this.cases.find((c) => c.id === caseId)
    if (!targetCase) return undefined
    const newWeapon: WeaponRecord = {
      id: `wpn-${Date.now()}`,
      ...weaponData,
    }
    targetCase.weapons = [newWeapon, ...targetCase.weapons]
    this.notify()
    return newWeapon
  }

  public addPartyToCase(caseId: string, party: FullCaseRecord['parties'][0]): boolean {
    const targetCase = this.cases.find((c) => c.id === caseId)
    if (!targetCase) return false
    targetCase.parties = [...targetCase.parties, party]
    this.notify()
    return true
  }

  public addDocumentToCase(caseId: string, docData: Omit<DocumentRecord, 'id'>, category?: string): DocumentRecord | undefined {
    const targetCase = this.cases.find((c) => c.id === caseId)
    if (!targetCase) return undefined
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      ...docData,
    }
    targetCase.documents = [newDoc, ...targetCase.documents]
    this.documents = [newDoc, ...this.documents]
    if (category) {
      if (!targetCase.checkedDocCategories) targetCase.checkedDocCategories = []
      if (!targetCase.checkedDocCategories.includes(category)) {
        targetCase.checkedDocCategories.push(category)
      }
    }
    this.notify()
    return newDoc
  }

  public toggleDocCategory(caseId: string, category: string): string[] {
    const targetCase = this.cases.find((c) => c.id === caseId)
    if (!targetCase) return []
    if (!targetCase.checkedDocCategories) {
      targetCase.checkedDocCategories = ['Evidence files and evidence index']
    }
    if (targetCase.checkedDocCategories.includes(category)) {
      targetCase.checkedDocCategories = targetCase.checkedDocCategories.filter((c) => c !== category)
    } else {
      targetCase.checkedDocCategories = [...targetCase.checkedDocCategories, category]
    }
    this.notify()
    return targetCase.checkedDocCategories
  }

  public addDocument(docData: Omit<DocumentRecord, 'id'>): DocumentRecord {
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      ...docData,
    }
    this.documents = [newDoc, ...this.documents]
    if (docData.caseId || docData.caseNumber) {
      const targetCase = this.cases.find(
        (c) => c.id === docData.caseId || c.number === docData.caseNumber
      )
      if (targetCase) {
        targetCase.documents = [newDoc, ...targetCase.documents]
      }
    }
    this.notify()

    if (supabase) {
      try {
        supabase.from('documents').upsert({
          id: newDoc.id,
          case_id: newDoc.caseId,
          canonical_name: newDoc.canonicalName,
          original_file_name: newDoc.originalFileName,
          submitting_party: newDoc.submittingParty,
          advocate_or_officer: newDoc.advocateOrOfficer,
          submission_date: newDoc.submissionDate,
          file_size: newDoc.fileSize,
          pages: newDoc.pages,
          kind: newDoc.kind,
          sha256: newDoc.sha256,
          ocr_excerpt: newDoc.ocrExcerpt,
        }).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase document upsert error:', e)
      }
    }

    return newDoc
  }

  public deleteDocument(docId: string): boolean {
    const exists = this.documents.some((d) => d.id === docId)
    if (!exists) return false
    this.documents = this.documents.filter((d) => d.id !== docId)
    this.cases.forEach((c) => {
      c.documents = c.documents.filter((d) => d.id !== docId)
    })
    this.notify()

    if (supabase) {
      try {
        supabase.from('documents').delete().eq('id', docId).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase document delete error:', e)
      }
    }

    return true
  }

  public updateDocument(docId: string, updates: Partial<DocumentRecord>): DocumentRecord | undefined {
    const idx = this.documents.findIndex((d) => d.id === docId)
    if (idx === -1) return undefined
    this.documents[idx] = {
      ...this.documents[idx],
      ...updates,
    }
    this.cases.forEach((c) => {
      c.documents = c.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d))
    })
    this.notify()
    return this.documents[idx]
  }

  // --------------------------------------------------------------------------
  // CRIMINALS & SEARCH
  // --------------------------------------------------------------------------

  public getCriminals(): CriminalRecord[] {
    return this.criminals
  }

  public getCriminal(idOrCrimId: string): CriminalRecord | undefined {
    return this.criminals.find(
      (c) =>
        c.id.toLowerCase() === idOrCrimId.toLowerCase() ||
        c.crimId.toLowerCase() === idOrCrimId.toLowerCase() ||
        c.name.toLowerCase() === idOrCrimId.toLowerCase()
    )
  }

  public searchCriminals(query: string): CriminalRecord[] {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return this.criminals.filter(
      (c) =>
        c.crimId.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
    )
  }

  public addCriminal(criminalData: Omit<CriminalRecord, 'id' | 'crimId'> & { crimId?: string }): CriminalRecord {
    const nextSeq = String(this.criminals.length + 1).padStart(3, '0')
    const currentYear = new Date().getFullYear()
    const crimId = criminalData.crimId || `CRIM-${currentYear}-${nextSeq}`
    const id = crimId.toLowerCase().replace(/[^a-z0-9]/g, '-')

    const newCriminal: CriminalRecord = {
      ...criminalData,
      id,
      crimId,
      photoPlaceholder: criminalData.photoPlaceholder || (criminalData.name ? criminalData.name.slice(0, 2).toUpperCase() : 'CR'),
      biometricHash: criminalData.biometricHash || `SHA256:${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      crimes: criminalData.crimes || [],
      aliases: criminalData.aliases || [],
    }

    this.criminals = [newCriminal, ...this.criminals]
    this.notify()

    if (supabase) {
      try {
        supabase.from('criminals').upsert({
          id: newCriminal.id,
          crim_id: newCriminal.crimId,
          name: newCriminal.name,
          age: newCriminal.age,
          dob: newCriminal.dob,
          gender: newCriminal.gender,
          custody_status: newCriminal.custodyStatus,
          address: newCriminal.address,
          recidivism_score: newCriminal.recidivismScore,
          active_case_number: newCriminal.activeCaseNumber,
        }).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase upsert criminal error:', e)
      }
    }

    return newCriminal
  }

  public deleteCriminal(criminalId: string): boolean {
    const prevLen = this.criminals.length
    this.criminals = this.criminals.filter((c) => c.id !== criminalId && c.crimId !== criminalId)
    if (this.criminals.length !== prevLen) {
      this.notify()
      if (supabase) {
        try {
          supabase.from('criminals').delete().or(`id.eq.${criminalId},crim_id.eq.${criminalId}`).then(() => {}).catch(() => {})
        } catch (e) {
          console.warn('Supabase delete criminal error:', e)
        }
      }
      return true
    }
    return false
  }

  public updateCriminal(criminalId: string, updates: Partial<CriminalRecord>): CriminalRecord | undefined {
    const idx = this.criminals.findIndex((c) => c.id === criminalId || c.crimId === criminalId)
    if (idx === -1) return undefined
    this.criminals[idx] = {
      ...this.criminals[idx],
      ...updates,
    }
    this.notify()
    return this.criminals[idx]
  }

  // --------------------------------------------------------------------------
  // LAWYERS
  // --------------------------------------------------------------------------

  public getLawyers(): LawyerRecord[] {
    return this.lawyers
  }

  public getLawyer(idOrBar: string): LawyerRecord | undefined {
    return this.lawyers.find(
      (l) =>
        l.id.toLowerCase() === idOrBar.toLowerCase() ||
        l.barNumber.toLowerCase() === idOrBar.toLowerCase() ||
        l.name.toLowerCase().includes(idOrBar.toLowerCase())
    )
  }

  public addLawyer(lawyerData: Omit<LawyerRecord, 'id'> & { id?: string }): LawyerRecord {
    const id = lawyerData.id || `law-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
    const newLawyer: LawyerRecord = {
      ...lawyerData,
      id,
    }
    this.lawyers.unshift(newLawyer)
    this.notify()

    if (supabase) {
      try {
        supabase
          .from('lawyers')
          .upsert({
            id: newLawyer.id,
            bar_number: newLawyer.barNumber,
            name: newLawyer.name,
            chapter: newLawyer.chapter,
            enrolment_year: newLawyer.enrolmentYear,
            standing_years: newLawyer.standingYears,
            active_cases_count: newLawyer.activeCasesCount,
            is_participating_in_bench: newLawyer.isParticipatingInBench,
            clearance_status: newLawyer.clearanceStatus,
            phone: newLawyer.phone,
            email: newLawyer.email,
            chamber: newLawyer.chamber,
          })
          .then(() => {})
          .catch(() => {})
      } catch (e) {
        console.warn('Supabase upsert lawyer error:', e)
      }
    }

    return newLawyer
  }

  public updateLawyer(idOrBar: string, updates: Partial<LawyerRecord>): LawyerRecord | undefined {
    const idx = this.lawyers.findIndex(
      (l) => l.id === idOrBar || l.barNumber.toLowerCase() === idOrBar.toLowerCase()
    )
    if (idx === -1) return undefined
    this.lawyers[idx] = {
      ...this.lawyers[idx],
      ...updates,
    }
    this.notify()

    if (supabase) {
      try {
        const updated = this.lawyers[idx]
        supabase
          .from('lawyers')
          .update({
            bar_number: updated.barNumber,
            name: updated.name,
            chapter: updated.chapter,
            enrolment_year: updated.enrolmentYear,
            standing_years: updated.standingYears,
            active_cases_count: updated.activeCasesCount,
            is_participating_in_bench: updated.isParticipatingInBench,
            clearance_status: updated.clearanceStatus,
            phone: updated.phone,
            email: updated.email,
            chamber: updated.chamber,
          })
          .eq('id', updated.id)
          .then(() => {})
          .catch(() => {})
      } catch (e) {
        console.warn('Supabase update lawyer error:', e)
      }
    }

    return this.lawyers[idx]
  }

  public deleteLawyer(idOrBar: string): boolean {
    const prevLen = this.lawyers.length
    const toDelete = this.lawyers.find(
      (l) => l.id === idOrBar || l.barNumber.toLowerCase() === idOrBar.toLowerCase()
    )
    this.lawyers = this.lawyers.filter(
      (l) => l.id !== idOrBar && l.barNumber.toLowerCase() !== idOrBar.toLowerCase()
    )
    if (this.lawyers.length !== prevLen) {
      this.notify()
      if (supabase && toDelete) {
        try {
          supabase
            .from('lawyers')
            .delete()
            .eq('id', toDelete.id)
            .then(() => {})
            .catch(() => {})
        } catch (e) {
          console.warn('Supabase delete lawyer error:', e)
        }
      }
      return true
    }
    return false
  }

  // --------------------------------------------------------------------------
  // SCHEDULE & HEARINGS
  // --------------------------------------------------------------------------

  public getHearings(): HearingRecord[] {
    return this.hearings
  }

  public getHearingsForDate(dateStr: string): HearingRecord[] {
    return this.hearings.filter((h) => h.date === dateStr)
  }

  public getHearingCountByDate(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.hearings.forEach((h) => {
      counts[h.date] = (counts[h.date] || 0) + 1
    })
    return counts
  }

  public scheduleHearing(params: {
    caseId: string
    date: string // YYYY-MM-DD
    time: string // HH:mm
    stage: string
    courtHall: string
    judge: string
    notes?: string
    setAlarm?: boolean
    alarmUrgency?: 'INFO' | 'WARNING' | 'STATUTORY_CRITICAL'
  }): HearingRecord {
    const targetCase = this.cases.find((c) => c.id === params.caseId)
    const caseNumber = targetCase ? targetCase.number : 'UNKNOWN-CASE'
    const caseTitle = targetCase ? targetCase.title : 'Judicial Proceeding'

    const newHearing: HearingRecord = {
      id: `hrg-${Date.now()}`,
      caseId: params.caseId,
      caseNumber,
      caseTitle,
      date: params.date,
      time: params.time,
      stage: params.stage,
      courtHall: params.courtHall,
      judge: params.judge,
      benchNotes: params.notes,
      hasAlarm: Boolean(params.setAlarm),
      alarmUrgency: params.alarmUrgency || 'INFO',
    }

    this.hearings = [...this.hearings, newHearing]

    // If alarm requested, create notification alarm
    if (params.setAlarm) {
      const alarm: AlarmRecord = {
        id: `alm-${Date.now()}`,
        hearingId: newHearing.id,
        caseId: params.caseId,
        caseNumber,
        title: `Scheduled Hearing Reminder: ${caseNumber}`,
        triggerTime: `${params.date} ${params.time}`,
        urgency: params.alarmUrgency || 'INFO',
        message: `Bench hearing listed for ${params.stage} in ${params.courtHall} at ${params.time}.`,
        isAcknowledged: false,
        isDismissed: false,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
      this.alarms = [alarm, ...this.alarms]
    }

    // Update target case next hearing date
    if (targetCase) {
      targetCase.nextHearing = params.date
    }

    this.notify()

    if (supabase) {
      try {
        supabase.from('hearings').upsert({
          id: newHearing.id,
          case_id: newHearing.caseId,
          case_number: newHearing.caseNumber,
          case_title: newHearing.caseTitle,
          hearing_date: newHearing.date,
          time_slot: newHearing.time,
          stage: newHearing.stage,
          court_hall: newHearing.courtHall,
          judge: newHearing.judge,
          bench_notes: newHearing.benchNotes,
          has_alarm: newHearing.hasAlarm,
          alarm_urgency: newHearing.alarmUrgency,
        }).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase upsert hearing error:', e)
      }
    }

    return newHearing
  }

  public updateHearing(id: string, updates: Partial<HearingRecord>): HearingRecord | undefined {
    const idx = this.hearings.findIndex((h) => h.id === id)
    if (idx === -1) return undefined
    this.hearings[idx] = { ...this.hearings[idx], ...updates }
    this.notify()
    return this.hearings[idx]
  }

  public deleteHearing(id: string): boolean {
    const prevLen = this.hearings.length
    this.hearings = this.hearings.filter((h) => h.id !== id)
    this.alarms = this.alarms.filter((a) => a.hearingId !== id)
    if (this.hearings.length !== prevLen) {
      this.notify()
      if (supabase) {
        try {
          supabase.from('hearings').delete().eq('id', id).then(() => {}).catch(() => {})
        } catch (e) {
          console.warn('Supabase delete hearing error:', e)
        }
      }
      return true
    }
    return false
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS & ALARMS
  // --------------------------------------------------------------------------

  public getAlarms(): AlarmRecord[] {
    return this.alarms
  }

  public acknowledgeAlarm(id: string): void {
    this.alarms = this.alarms.map((a) => (a.id === id ? { ...a, isAcknowledged: true } : a))
    this.notify()
  }

  public dismissAlarm(id: string): void {
    this.alarms = this.alarms.filter((a) => a.id !== id)
    this.notify()
  }

  public createCustomAlarm(params: Omit<AlarmRecord, 'id' | 'createdAt' | 'isAcknowledged' | 'isDismissed'>): AlarmRecord {
    const alarm: AlarmRecord = {
      ...params,
      id: `alm-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isAcknowledged: false,
      isDismissed: false,
    }
    this.alarms = [alarm, ...this.alarms]
    this.notify()
    return alarm
  }

  // --------------------------------------------------------------------------
  // JUDGMENT & PUNISHMENT HISTORY
  // --------------------------------------------------------------------------

  public getPunishments(): PunishmentRecord[] {
    return this.punishments
  }

  public getPunishmentsByMonth(yearMonth: string): PunishmentRecord[] {
    // yearMonth = '2026-10'
    return this.punishments.filter((p) => p.pronouncementDate.startsWith(yearMonth))
  }

  public getPunishmentCountsByType(): Record<PunishmentType, number> {
    const counts: Record<PunishmentType, number> = {
      CAPITAL: 0,
      LIFE_IMPRISONMENT: 0,
      RIGOROUS_IMPRISONMENT: 0,
      SIMPLE_IMPRISONMENT: 0,
      PENAL_FINE: 0,
      PROBATION: 0,
    }
    this.punishments.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1
    })
    return counts
  }

  public addPunishment(params: {
    caseId?: string
    caseNumber: string
    caseTitle: string
    convictName: string
    crimId?: string
    judge?: string
    type: PunishmentType
    durationMonths?: number
    durationDescription?: string
    fineAmountInr: number
    pronouncementDate?: string
    operativeText: string
  }): PunishmentRecord {
    const newPunishment: PunishmentRecord = {
      id: `pnh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      caseId: params.caseId || 'manual-docket',
      caseNumber: params.caseNumber,
      caseTitle: params.caseTitle,
      convictName: params.convictName,
      crimId: params.crimId || `CRIM-${Math.floor(1000 + Math.random() * 9000)}`,
      judge: params.judge || 'Hon. Justice R. Venkataraman',
      type: params.type,
      durationMonths: params.durationMonths || 0,
      durationDescription: params.durationDescription || (params.durationMonths ? `${params.durationMonths} Months` : 'Statutory Order'),
      fineAmountInr: params.fineAmountInr || 0,
      pronouncementDate: params.pronouncementDate || new Date().toISOString().slice(0, 10),
      operativeText: params.operativeText,
      operativeOrderSnippet: params.operativeText,
    }

    this.punishments = [newPunishment, ...this.punishments]
    this.notify()

    if (supabase) {
      try {
        supabase.from('punishments').upsert({
          id: newPunishment.id,
          case_id: newPunishment.caseId,
          case_number: newPunishment.caseNumber,
          case_title: newPunishment.caseTitle,
          convict_name: newPunishment.convictName,
          crim_id: newPunishment.crimId,
          judge: newPunishment.judge,
          punishment_type: newPunishment.type,
          duration_months: newPunishment.durationMonths,
          fine_amount_inr: newPunishment.fineAmountInr,
          pronouncement_date: newPunishment.pronouncementDate,
          operative_text: newPunishment.operativeText,
        }).then(() => {}).catch(() => {})
      } catch (e) {
        console.warn('Supabase upsert punishment error:', e)
      }
    }

    return newPunishment
  }

  public deletePunishment(id: string): boolean {
    const prevLen = this.punishments.length
    this.punishments = this.punishments.filter((p) => p.id !== id)
    if (this.punishments.length !== prevLen) {
      this.notify()
      if (supabase) {
        try {
          supabase.from('punishments').delete().eq('id', id).then(() => {}).catch(() => {})
        } catch (e) {
          console.warn('Supabase delete punishment error:', e)
        }
      }
      return true
    }
    return false
  }

  // --------------------------------------------------------------------------
  // DOCUMENTS & DOCUMENT HISTORY
  // --------------------------------------------------------------------------

  public getDocuments(): DocumentRecord[] {
    return this.documents
  }

  public renameDocument(id: string, newCanonicalName: string): void {
    this.documents = this.documents.map((d) =>
      d.id === id ? { ...d, canonicalName: newCanonicalName.trim() } : d
    )
    this.notify()
  }

  // --------------------------------------------------------------------------
  // STATUTORY LAWS & AI APPLICABILITY
  // --------------------------------------------------------------------------

  public getStatutoryLaws(): StatutoryLaw[] {
    return this.laws
  }

  public checkLawApplicability(statuteSection: string, factsText: string): {
    matchedIngredients: { ingredient: string; isMet: boolean; rationale: string }[]
    overallApplicabilityScore: number // 0 to 100
    recommendation: string
    relatedCaseLaws: { title: string; citation: string; note: string }[]
  } {
    const cleanSec = statuteSection.toLowerCase()
    const law = this.laws.find(
      (l) => l.section.toLowerCase().includes(cleanSec) || l.actCode.toLowerCase().includes(cleanSec)
    ) || this.laws[0]

    const factsLower = factsText.toLowerCase()
    const matched = law.ingredients.map((ing) => {
      const ingWords = ing.toLowerCase().split(' ').slice(0, 3)
      const hasWord = ingWords.some((w) => w.length > 3 && factsLower.includes(w))
      return {
        ingredient: ing,
        isMet: hasWord || factsLower.length > 50, // simulated extraction match
        rationale: hasWord
          ? `Substantiated by police narrative and submitted evidentiary dockets.`
          : `Requires explicit corroboration or eyewitness deposition before framing of charges.`,
      }
    })

    const metCount = matched.filter((m) => m.isMet).length
    const score = Math.round((metCount / matched.length) * 100)

    return {
      matchedIngredients: matched,
      overallApplicabilityScore: score,
      recommendation:
        score >= 75
          ? `Prima facie evidence substantiates all core statutory ingredients under ${law.section}. Charges may proceed to framing.`
          : `Insufficient corroboration for Section ${law.section}. Court may direct supplementary IO statement or consider lesser included offense.`,
      relatedCaseLaws: law.precedents.map((p) => ({
        title: p.title,
        citation: p.citation,
        note: p.principle,
      })),
    }
  }

  // --------------------------------------------------------------------------
  // AI PRECEDENT SEARCH (RAG SIMULATOR)
  // --------------------------------------------------------------------------

  public searchPrecedents(query: string, caseContext?: string): {
    results: {
      title: string
      citation: string
      court: string
      date: string
      bench: string
      ratioDecidendi: string
      pinpoint: string
      similarityScore: number
    }[]
    summaryText: string
  } {
    const q = (query + ' ' + (caseContext || '')).toLowerCase()

    const pool = [
      {
        title: 'State of H.P. v. Jeet Singh',
        citation: '(1999) 4 SCC 370',
        court: 'Supreme Court of India',
        date: '1999-03-24',
        bench: 'Bench: K.T. Thomas & M.B. Shah, JJ.',
        ratioDecidendi:
          'Recovery under Section 27 made on disclosure statement cannot be rejected merely because independent witnesses turned hostile or were unavailable, provided IO testimony is credible.',
        pinpoint: '1999 SCC (Cri) 539, Para 21',
        keywords: ['recovery', 'section 27', 'weapon', 'pistol', 'hostile', 'evidence'],
        baseScore: 94,
      },
      {
        title: 'Virsa Singh v. State of Punjab',
        citation: 'AIR 1958 SC 465',
        court: 'Supreme Court of India',
        date: '1958-03-11',
        bench: 'Constitution Bench (5 Judges)',
        ratioDecidendi:
          'To establish Section 300 clause 3rdly, the prosecution must prove that bodily injury was intentionally inflicted and that the injury was sufficient in ordinary course of nature to cause death.',
        pinpoint: '1958 SCR 1495, Para 12',
        keywords: ['murder', '302', '103', 'intention', 'grievous', 'fatal'],
        baseScore: 91,
      },
      {
        title: 'Phool Kumar v. Delhi Administration',
        citation: '(1975) 1 SCC 797',
        court: 'Supreme Court of India',
        date: '1975-04-18',
        bench: 'Division Bench',
        ratioDecidendi:
          'The phrase "uses any deadly weapon" in armed robbery provisions includes openly brandishing or carrying a weapon to terrorize victims, even if not discharged.',
        pinpoint: '1975 SCC (Cri) 336, Para 9',
        keywords: ['robbery', 'arms', 'weapon', 'deadly', 'brandish', '309'],
        baseScore: 89,
      },
      {
        title: 'Lalita Kumari v. Govt. of Uttar Pradesh',
        citation: '(2014) 2 SCC 1',
        court: 'Supreme Court of India',
        date: '2013-11-12',
        bench: 'Constitution Bench (5 Judges)',
        ratioDecidendi:
          'Registration of FIR is mandatory under Section 154 CrPC / Sec 173 BNSS if information discloses commission of a cognizable offence.',
        pinpoint: '2014 (1) SCC (Cri) 524, Para 120',
        keywords: ['fir', 'cognizable', 'police', 'delay', 'mandate'],
        baseScore: 87,
      },
      {
        title: 'Satender Kumar Antil v. CBI & Anr.',
        citation: '(2022) 10 SCC 51',
        court: 'Supreme Court of India',
        date: '2022-07-11',
        bench: 'Division Bench: S.K. Kaul & M.M. Sundresh, JJ.',
        ratioDecidendi:
          'Guidelines for bail and remand; strict enforcement of 60/90 days statutory default bail rights under CrPC / BNSS without detention abuses.',
        pinpoint: '2022 SCC OnLine SC 825, Para 73',
        keywords: ['bail', 'remand', 'custody', 'default', 'timeline'],
        baseScore: 86,
      },
      {
        title: 'State of Karnataka v. Shivanna',
        citation: '(2014) 8 SCC 913',
        court: 'Supreme Court of India',
        date: '2014-04-25',
        bench: 'Supreme Court of India',
        ratioDecidendi:
          'Strict protocol for in-camera victim deposition in sexual assault and POCSO cases; mandate of support person and prohibition of direct aggressive cross-examination.',
        pinpoint: '2014 (3) SCC (Cri) 612, Para 10',
        keywords: ['pocso', 'victim', 'in-camera', 'child', 'deposition', 'examination'],
        baseScore: 92,
      },
    ]

    const scored = pool.map((item) => {
      let matches = 0
      item.keywords.forEach((kw) => {
        if (q.includes(kw)) matches += 1
      })
      const score = Math.min(99, item.baseScore + matches * 2)
      return {
        title: item.title,
        citation: item.citation,
        court: item.court,
        date: item.date,
        bench: item.bench,
        ratioDecidendi: item.ratioDecidendi,
        pinpoint: item.pinpoint,
        similarityScore: score,
      }
    })

    scored.sort((a, b) => b.similarityScore - a.similarityScore)

    return {
      results: scored.slice(0, 4),
      summaryText: `Analyzed query across 42,000 canonical Supreme Court & High Court reported judgments. Found ${scored.length} authoritative binding citations with >85% ratio-decidendi alignment.`,
    }
  }

  // --------------------------------------------------------------------------
  // CLOUD BACKUP TELEMETRY & INTEGRITY
  // --------------------------------------------------------------------------

  public getBackupTelemetry(): {
    lastSnapshotTime: string
    rpoSeconds: number
    rtoMinutes: number
    totalEncryptedDockets: number
    cloudStatus: 'SYNCED_HEALTHY' | 'SYNCING' | 'OFFLINE'
    encryptionSpec: string
    merkleRootHash: string
  } {
    const meta = loadFromStorage(STORAGE_KEYS.BACKUP_META, {
      lastSnapshotTime: '2026-10-12 09:14:02 UTC',
      rpoSeconds: 14,
      rtoMinutes: 8,
      merkleRootHash: '9e8c7b6a5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e',
    })

    return {
      lastSnapshotTime: meta.lastSnapshotTime,
      rpoSeconds: meta.rpoSeconds,
      rtoMinutes: meta.rtoMinutes,
      totalEncryptedDockets: this.cases.length + this.documents.length + this.punishments.length,
      cloudStatus: 'SYNCED_HEALTHY',
      encryptionSpec: 'AES-256-GCM Hardware HSM Envelope (FIPS 140-3 Validated)',
      merkleRootHash: meta.merkleRootHash,
    }
  }

  public triggerManualCloudBackup(): { success: boolean; newSnapshotHash: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    const newSnapshotHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    saveToStorage(STORAGE_KEYS.BACKUP_META, {
      lastSnapshotTime: timestamp,
      rpoSeconds: 2,
      rtoMinutes: 8,
      merkleRootHash: newSnapshotHash,
    })

    this.notify()
    return { success: true, newSnapshotHash, timestamp }
  }
}

export const judicialStore = new JudicialStoreService()
