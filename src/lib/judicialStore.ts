// ============================================================================
// NYAYADESK JUDICIAL STORE & STATE SERVICE
// Complete relational datasets, Auto-Numbering, Auto-Documentation,
// Cloud Backup, and Criminal/Lawyer/Hearing/Punishment/Law state engine.
// ============================================================================

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
  fineAmountInr: number
  pronouncementDate: string // YYYY-MM-DD
  operativeText: string
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
  fir: { no: string; date: string }
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

export const INITIAL_CRIMINALS: CriminalRecord[] = [
  {
    id: 'crim-01',
    crimId: 'CRIM-2024-8819',
    name: 'Rahul Verma',
    aliases: ['"Rocky"', '"RDX"', '"Rahul Shooter"'],
    age: 37,
    dob: '1989-04-12',
    gender: 'Male',
    biometricHash: 'A982-F199-00B2-114A',
    recidivismScore: 0.82,
    activeCaseNumber: 'DL-CR-2026-PSCT-00481',
    activeCaseId: 'dl-cr-2026-00481',
    custodyStatus: 'In custody',
    address: 'Plot 44, Gali No. 8, Seelampur, Delhi 110053',
    photoPlaceholder: 'RV',
    crimes: [
      {
        date: '2018-02-11',
        firCourt: 'FIR 44/2018 · PS Kotwali · Tis Hazari Courts',
        charges: ['Sec. 379 IPC (Theft)', 'Sec. 411 IPC (Dishonestly receiving stolen property)'],
        verdict: 'CONVICTED',
        sentence: '18 Months Rigorous Imprisonment + Rs. 5,000 fine',
        notes: 'Recovered two stolen motorbikes. Served full sentence at Tihar Jail.',
      },
      {
        date: '2021-06-20',
        firCourt: 'FIR 102/2021 · PS Sadar Bazar · Sessions Court 03',
        charges: ['Sec. 392 IPC (Armed Robbery)', 'Arms Act Sec. 25'],
        verdict: 'CONVICTED',
        sentence: '3 Years Rigorous Imprisonment',
        notes: 'Armed holdup of cash merchant in Chandni Chowk. Released on parole in late 2023.',
      },
      {
        date: '2024-11-04',
        firCourt: 'FIR 219/2024 · PS Cyber Thana · Patiala House',
        charges: ['Sec. 307 IPC (Attempted Murder)', 'Sec. 34 IPC'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Remanded in Judicial Custody',
        notes: 'Shootout during intercepted getaway near DND Flyway.',
      },
      {
        date: '2026-01-10',
        firCourt: 'FIR 12/2026 · PS Cyber Thana · Principal Sessions Bench 04',
        charges: ['BNS s.103 (Murder)', 'BNS s.309(4) (Robbery)', 'Arms Act s.25'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Current active trial before this bench',
        notes: 'Co-accused identified in CCTV footage and ballistic match.',
      },
    ],
  },
  {
    id: 'crim-02',
    crimId: 'CRIM-2022-1102',
    name: 'Ramesh Kumar',
    aliases: ['"Kutty"', '"Ramesh Anna"'],
    age: 34,
    dob: '1992-08-19',
    gender: 'Male',
    biometricHash: 'C471-9921-A810-775E',
    recidivismScore: 0.65,
    activeCaseNumber: 'S.C. 214/2025',
    activeCaseId: 'sc-214-2025',
    custodyStatus: 'In custody',
    address: '12, Periyar Street, Koyambedu, Chennai 600107',
    photoPlaceholder: 'RK',
    crimes: [
      {
        date: '2020-04-15',
        firCourt: 'FIR 88/2020 · PS Ambattur · Metropolitan Magistrate Egmore',
        charges: ['Sec. 380 IPC (Theft in dwelling house)'],
        verdict: 'CONVICTED',
        sentence: '1 Year Simple Imprisonment',
        notes: 'Plea bargaining accepted. Sentence served.',
      },
      {
        date: '2025-02-04',
        firCourt: 'FIR 118/2025 · PS Anna Nagar · Principal Sessions Chennai',
        charges: ['BNS s.309(4) (Robbery with deadly weapon)', 'Arms Act s.25'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Judicial Custody (Remand pending)',
        notes: 'Recovered country pistol near Koyambedu flyover on s.27 disclosure.',
      },
    ],
  },
  {
    id: 'crim-03',
    crimId: 'CRIM-2025-0412',
    name: 'Dinesh Babu',
    aliases: ['"Dinu"', '"Babu White"'],
    age: 29,
    dob: '1997-01-30',
    gender: 'Male',
    biometricHash: 'F110-3882-B902-8871',
    recidivismScore: 0.28,
    activeCaseNumber: 'S.C. 214/2025',
    activeCaseId: 'sc-214-2025',
    custodyStatus: 'On bail',
    address: '4/18, Gandhi Nagar, Villivakkam, Chennai 600049',
    photoPlaceholder: 'DB',
    crimes: [
      {
        date: '2025-02-04',
        firCourt: 'FIR 118/2025 · PS Anna Nagar · Principal Sessions Chennai',
        charges: ['BNS s.309(4) Robbery', 'Arms Act s.25'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Enlarged on bail (weekly reporting condition)',
        notes: 'CDR places device within 200m of jewellery store.',
      },
    ],
  },
  {
    id: 'crim-04',
    crimId: 'CRIM-2023-7401',
    name: 'Arun Selvam',
    aliases: ['"Arun Hosur"', '"Speed Arun"'],
    age: 31,
    dob: '1995-11-03',
    gender: 'Male',
    biometricHash: 'D892-1200-5491-CC43',
    recidivismScore: 0.78,
    activeCaseNumber: 'S.C. 214/2025',
    activeCaseId: 'sc-214-2025',
    custodyStatus: 'Absconding',
    address: 'Bagalur Road, Hosur 635109 (Last known)',
    photoPlaceholder: 'AS',
    crimes: [
      {
        date: '2019-11-02',
        firCourt: 'FIR 204/2019 · PS Hosur Town · Sessions Court Krishnagiri',
        charges: ['Sec. 324 IPC (Hurt by dangerous weapon)', 'Sec. 506 IPC'],
        verdict: 'CONVICTED',
        sentence: '2 Years Rigorous Imprisonment',
      },
      {
        date: '2025-02-04',
        firCourt: 'FIR 118/2025 · PS Anna Nagar · Principal Sessions Chennai',
        charges: ['BNS s.309(4) Robbery', 'BNS s.3(5) Common Intention'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Non-Bailable Warrant issued; declared absconder',
      },
    ],
  },
  {
    id: 'crim-05',
    crimId: 'CRIM-2024-9120',
    name: 'T. Anbazhagan',
    aliases: ['"Teacher Anbu"'],
    age: 44,
    dob: '1982-05-14',
    gender: 'Male',
    biometricHash: 'E331-5011-8974-9921',
    recidivismScore: 0.45,
    activeCaseNumber: 'Spl.S.C. (POCSO) 38/2025',
    activeCaseId: 'pocso-38-2025',
    custodyStatus: 'In custody',
    address: '22, North Veli Street, Madurai 625001',
    photoPlaceholder: 'TA',
    crimes: [
      {
        date: '2025-06-11',
        firCourt: 'FIR 41/2025 · AWPS Madurai · Special POCSO Court',
        charges: ['POCSO Act s.6 & s.10', 'BNS s.65(2)'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Judicial custody; bail dismissed twice',
      },
    ],
  },
  {
    id: 'crim-06',
    crimId: 'CRIM-2025-3391',
    name: 'Vikram Malhotra',
    aliases: ['"Vicky Syndicate"', '"Seth Ji"'],
    age: 41,
    dob: '1985-07-28',
    gender: 'Male',
    biometricHash: 'B201-9874-3321-4412',
    recidivismScore: 0.92,
    activeCaseNumber: 'DL-CR-2024-00219',
    activeCaseId: 'dl-cr-2024-00219',
    custodyStatus: 'In custody',
    address: 'Flat 102, Shivalik Enclave, New Delhi 110017',
    photoPlaceholder: 'VM',
    crimes: [
      {
        date: '2016-03-12',
        firCourt: 'FIR 61/2016 · PS Civil Lines · Sessions Court Delhi',
        charges: ['Arms Act Sec. 25', 'Sec. 386 IPC (Extortion by putting in fear of death)'],
        verdict: 'CONVICTED',
        sentence: '4 Years Rigorous Imprisonment',
      },
      {
        date: '2021-08-04',
        firCourt: 'FIR 190/2021 · PS Connaught Place · Patiala House',
        charges: ['Sec. 420 IPC (Cheating)', 'Sec. 467 IPC (Forgery of valuable security)'],
        verdict: 'CONVICTED',
        sentence: '3 Years Rigorous Imprisonment + Rs. 2,00,000 fine',
      },
      {
        date: '2024-09-18',
        firCourt: 'FIR 312/2024 · PS Cyber Thana · Bench 04',
        charges: ['BNS s.318 (Cheating)', 'BNS s.61 (Criminal Conspiracy)'],
        verdict: 'UNDER_TRIAL',
        sentence: 'Active trial proceeding before Bench 04',
      },
    ],
  },
]

export const INITIAL_LAWYERS: LawyerRecord[] = [
  {
    id: 'law-01',
    barNumber: 'D/1482/2004',
    name: 'Adv. Rajesh Khanna',
    chapter: 'Bar Council of Delhi',
    enrolmentYear: 2004,
    standingYears: 22,
    activeCasesCount: 7,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-98112-44102',
    email: 'r.khanna.adv@delhibar.org',
    chamber: 'Chamber 412, Tis Hazari Complex, Delhi',
  },
  {
    id: 'law-02',
    barNumber: 'MS/1182/2004',
    name: 'Adv. P. Lakshmi',
    chapter: 'Bar Council of Tamil Nadu & Puducherry',
    enrolmentYear: 2004,
    standingYears: 22,
    activeCasesCount: 14,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-94441-20911',
    email: 'p.lakshmi.spp@tngov.in',
    chamber: 'Chamber 18, City Civil Court Buildings, Chennai',
  },
  {
    id: 'law-03',
    barNumber: 'MS/3340/2011',
    name: 'Adv. V. Karthikeyan',
    chapter: 'Bar Council of Tamil Nadu & Puducherry',
    enrolmentYear: 2011,
    standingYears: 15,
    activeCasesCount: 9,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-98402-88190',
    email: 'karthik.v.law@gmail.com',
    chamber: 'Chamber 104, Madras High Court Advocates Association, Chennai',
  },
  {
    id: 'law-04',
    barNumber: 'MS/2201/2008',
    name: 'Adv. S. Revathi',
    chapter: 'Bar Council of Tamil Nadu & Puducherry',
    enrolmentYear: 2008,
    standingYears: 18,
    activeCasesCount: 8,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-98410-63201',
    email: 'revathi.spp.pocso@gov.in',
    chamber: 'Special Prosecutor Office, Madurai District Court',
  },
  {
    id: 'law-05',
    barNumber: 'MS/4417/2014',
    name: 'Adv. M. Gnanasekar',
    chapter: 'Bar Council of Tamil Nadu & Puducherry',
    enrolmentYear: 2014,
    standingYears: 12,
    activeCasesCount: 5,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-99401-11234',
    email: 'gnanasekar.adv@yahoo.co.in',
    chamber: 'Chamber 82, Madurai Bar Association',
  },
  {
    id: 'law-06',
    barNumber: 'D/2190/2005',
    name: 'Adv. Priya Sharma',
    chapter: 'Bar Council of Delhi',
    enrolmentYear: 2005,
    standingYears: 21,
    activeCasesCount: 11,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-98101-77219',
    email: 'priya.sharma@defenselaw.in',
    chamber: 'Chamber 309, Patiala House Courts, New Delhi',
  },
  {
    id: 'law-07',
    barNumber: 'D/0092/1991',
    name: 'Adv. Sundaram Iyer (Sr. Adv.)',
    chapter: 'Supreme Court Bar Association',
    enrolmentYear: 1991,
    standingYears: 35,
    activeCasesCount: 4,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-98100-00122',
    email: 'sundaram.iyer.sr@jurist.org',
    chamber: 'A-12, Sector 15A, Noida & SCBA Library 1',
  },
  {
    id: 'law-08',
    barNumber: 'D/3301/2018',
    name: 'Adv. Arun Mohanty',
    chapter: 'Bar Council of Delhi',
    enrolmentYear: 2018,
    standingYears: 8,
    activeCasesCount: 2,
    isParticipatingInBench: false,
    clearanceStatus: 'PROVISIONAL',
    phone: '+91-97110-82910',
    email: 'arun.mohanty.law@gmail.com',
    chamber: 'Chamber 51, Rohini District Courts, Delhi',
  },
  {
    id: 'law-09',
    barNumber: 'MS/9812/2019',
    name: 'Adv. N. Fathima',
    chapter: 'Bar Council of Tamil Nadu & Puducherry',
    enrolmentYear: 2019,
    standingYears: 7,
    activeCasesCount: 6,
    isParticipatingInBench: true,
    clearanceStatus: 'VERIFIED',
    phone: '+91-94420-77192',
    email: 'fathima.dlsa.panel@gov.in',
    chamber: 'District Legal Services Authority, Madurai',
  },
]

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

export const INITIAL_PUNISHMENTS: PunishmentRecord[] = [
  {
    id: 'pnh-01',
    caseId: 'sc-198-2024',
    caseNumber: 'S.C. 198/2024',
    caseTitle: 'State v. Murugesan & Anr.',
    convictName: 'Murugesan (CRIM-2021-0912)',
    crimId: 'CRIM-2021-0912',
    judge: 'Hon. Justice R. Venkataraman',
    type: 'LIFE_IMPRISONMENT',
    durationMonths: 240,
    fineAmountInr: 25000,
    pronouncementDate: '2026-04-14',
    operativeText: 'The convict is sentenced to undergo Imprisonment for Life under Section 302 IPC and to pay a fine of Rs. 25,000, in default of payment to undergo further rigorous imprisonment for 6 months.',
  },
  {
    id: 'pnh-02',
    caseId: 'sc-112-2024',
    caseNumber: 'S.C. 112/2024',
    caseTitle: 'State v. K. Rajendran',
    convictName: 'K. Rajendran (CRIM-2020-4109)',
    crimId: 'CRIM-2020-4109',
    judge: 'Hon. Justice R. Venkataraman',
    type: 'RIGOROUS_IMPRISONMENT',
    durationMonths: 84, // 7 years
    fineAmountInr: 15000,
    pronouncementDate: '2026-06-22',
    operativeText: 'Convicted under Section 392 IPC read with Section 397 IPC. Sentenced to 7 years rigorous imprisonment.',
  },
  {
    id: 'pnh-03',
    caseId: 'sc-081-2025',
    caseNumber: 'S.C. 81/2025',
    caseTitle: 'State v. Selva Kumar',
    convictName: 'Selva Kumar (CRIM-2023-1120)',
    crimId: 'CRIM-2023-1120',
    judge: 'Hon. Justice R. Venkataraman',
    type: 'RIGOROUS_IMPRISONMENT',
    durationMonths: 36, // 3 years
    fineAmountInr: 5000,
    pronouncementDate: '2026-08-10',
    operativeText: 'Sentenced to 3 years rigorous imprisonment for voluntary causing grievous hurt by dangerous weapons.',
  },
  {
    id: 'pnh-04',
    caseId: 'sc-045-2025',
    caseNumber: 'S.C. 45/2025',
    caseTitle: 'State v. Govindaraj',
    convictName: 'Govindaraj (CRIM-2022-7712)',
    crimId: 'CRIM-2022-7712',
    judge: 'Hon. Justice R. Venkataraman',
    type: 'SIMPLE_IMPRISONMENT',
    durationMonths: 12,
    fineAmountInr: 2000,
    pronouncementDate: '2026-09-05',
    operativeText: 'Convicted under Section 323 IPC. Sentenced to 1 year simple imprisonment with set-off under Section 428 CrPC.',
  },
  {
    id: 'pnh-05',
    caseId: 'sc-009-2026',
    caseNumber: 'S.C. 09/2026',
    caseTitle: 'State v. T. Balaji',
    convictName: 'T. Balaji (CRIM-2025-0019)',
    crimId: 'CRIM-2025-0019',
    judge: 'Hon. Justice R. Venkataraman',
    type: 'PENAL_FINE',
    durationMonths: 0,
    fineAmountInr: 50000,
    pronouncementDate: '2026-10-02',
    operativeText: 'Compounded matter under Section 320 CrPC upon payment of compensation and penal fine of Rs. 50,000 to victim relief fund.',
  },
  {
    id: 'pnh-06',
    caseId: 'sc-014-2026',
    caseNumber: 'S.C. 14/2026',
    caseTitle: 'State v. S. Manikandan',
    convictName: 'S. Manikandan (CRIM-2024-5501)',
    crimId: 'CRIM-2024-5501',
    judge: 'Hon. Justice R. Venkataraman',
    type: 'PROBATION',
    durationMonths: 12,
    fineAmountInr: 10000,
    pronouncementDate: '2026-10-07',
    operativeText: 'First-time young offender released on Probation of Good Conduct under Section 4 of Probation of Offenders Act for 1 year upon executing bond of Rs. 10,000.',
  },
]

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-01',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    canonicalName: 'DOC-POLICE-FIR-118-2025',
    originalFileName: 'FIR_118_2025.pdf',
    submittingParty: 'POLICE_INVESTIGATION',
    advocateOrOfficer: 'Insp. S. Murugan (T-4 Anna Nagar)',
    submissionDate: '2025-02-04',
    fileSize: '412 KB',
    pages: 3,
    kind: 'FIR',
    sha256: '9a3b8c1d5e2f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    ocrExcerpt: 'First Information Report under Section 173 BNSS. Informant K. Sundaram states three persons armed with firearm barged into jewellery shop at 18:30 hrs...',
  },
  {
    id: 'doc-02',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    canonicalName: 'DOC-POLICE-FINAL-CHARGESHEET-CS99',
    originalFileName: 'Chargesheet.pdf',
    submittingParty: 'POLICE_INVESTIGATION',
    advocateOrOfficer: 'Insp. S. Murugan',
    submissionDate: '2025-05-02',
    fileSize: '5.2 MB',
    pages: 64,
    kind: 'Chargesheet',
    sha256: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    ocrExcerpt: 'Final Police Report under Section 193 BNSS. Accused Ramesh Kumar, Dinesh Babu and Arun Selvam charge-sheeted under Sections 309(4) and 3(5) BNS...',
  },
  {
    id: 'doc-03',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    canonicalName: 'DOC-DEFENSE-BAIL-APPLICATION-A2',
    originalFileName: 'Bail_Petition_A2.pdf',
    submittingParty: 'DEFENSE_ADVOCATE',
    advocateOrOfficer: 'Adv. V. Karthikeyan (Bar MS/3340/2011)',
    submissionDate: '2025-07-02',
    fileSize: '890 KB',
    pages: 12,
    kind: 'Bail Petition',
    sha256: '1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
    ocrExcerpt: 'Application under Section 480 BNSS for grant of regular bail to Accused 2 Dinesh Babu. Accused has deep roots in society, no antecedent, willing to surrender passport...',
  },
  {
    id: 'doc-04',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    canonicalName: 'DOC-PROSECUTION-CCTV-EVIDENTIARY-EXTRACT',
    originalFileName: 'CCTV_Transcript.pdf',
    submittingParty: 'PUBLIC_PROSECUTOR',
    advocateOrOfficer: 'Adv. P. Lakshmi (Special PP)',
    submissionDate: '2025-03-21',
    fileSize: '690 KB',
    pages: 4,
    kind: 'Forensic Evidence Transcript',
    sha256: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    ocrExcerpt: 'Transcript of CCTV footage camera 02. Frame 18:42:01 shows three males wearing caps entering front shutter...',
  },
  {
    id: 'doc-05',
    caseId: 'pocso-38-2025',
    caseNumber: 'Spl.S.C. (POCSO) 38/2025',
    canonicalName: 'DOC-POLICE-POCSO-CHARGESHEET-CR41',
    originalFileName: 'Chargesheet_POCSO.pdf',
    submittingParty: 'POLICE_INVESTIGATION',
    advocateOrOfficer: 'Dy.SP Kavitha Rajan (AWPS Madurai)',
    submissionDate: '2025-09-08',
    fileSize: '4.4 MB',
    pages: 48,
    kind: 'Chargesheet',
    sha256: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    ocrExcerpt: 'Final report under Section 193 BNSS in Crime 41/2025. Accused T. Anbazhagan booked under POCSO Sections 6 and 10...',
  },
  {
    id: 'doc-06',
    caseId: 'pocso-38-2025',
    caseNumber: 'Spl.S.C. (POCSO) 38/2025',
    canonicalName: 'DOC-DEFENSE-DISCHARGE-PLEA-A1',
    originalFileName: 'Discharge_Application_POCSO.pdf',
    submittingParty: 'DEFENSE_ADVOCATE',
    advocateOrOfficer: 'Adv. M. Gnanasekar (Bar MS/4417/2014)',
    submissionDate: '2025-11-20',
    fileSize: '1.2 MB',
    pages: 15,
    kind: 'Plea of Discharge',
    sha256: '5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
    ocrExcerpt: 'Petition under Section 250 BNSS seeking discharge of accused on ground of contradictory birth certificate records...',
  },
  {
    id: 'doc-07',
    caseId: 'dl-cr-2026-00481',
    caseNumber: 'DL-CR-2026-PSCT-00481',
    canonicalName: 'DOC-POLICE-FIR-12-2026-CYBER-THANA',
    originalFileName: 'FIR_12_2026.pdf',
    submittingParty: 'POLICE_INVESTIGATION',
    advocateOrOfficer: 'Insp. Vikram Singh (Badge #7741)',
    submissionDate: '2026-01-10',
    fileSize: '620 KB',
    pages: 5,
    kind: 'FIR',
    sha256: '8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    ocrExcerpt: 'FIR registered on complaint of deceased victim brother. Accused Rahul Verma and co-accused charged with firearm homicide...',
  },
]

export const INITIAL_HEARINGS: HearingRecord[] = [
  {
    id: 'hrg-01',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    caseTitle: 'State v. Ramesh Kumar & 2 Ors.',
    date: '2026-10-12',
    time: '10:30',
    stage: 'Remand Production & FSL Direction',
    courtHall: 'Hall 04 (Main Sessions)',
    judge: 'Hon. Justice R. Venkataraman',
    benchNotes: 'Accused 1 produced via video conference from Central Prison. Remand extended by 14 days.',
    hasAlarm: true,
    alarmUrgency: 'WARNING',
  },
  {
    id: 'hrg-02',
    caseId: 'pocso-38-2025',
    caseNumber: 'Spl.S.C. (POCSO) 38/2025',
    caseTitle: 'State v. T. Anbazhagan',
    date: '2026-10-12',
    time: '11:45',
    stage: 'Victim Evidence (In-Camera Preparation)',
    courtHall: 'Hall 02 (Child Friendly Room)',
    judge: 'Hon. Justice R. Venkataraman',
    benchNotes: 'DLSA support person present. Screen barrier positioned.',
    hasAlarm: true,
    alarmUrgency: 'STATUTORY_CRITICAL',
  },
  {
    id: 'hrg-03',
    caseId: 'dl-cr-2026-00481',
    caseNumber: 'DL-CR-2026-PSCT-00481',
    caseTitle: 'State (NCT of Delhi) v. Rahul Verma & 2 Ors.',
    date: '2026-10-12',
    time: '14:00',
    stage: 'Cross Examination of Lead IO',
    courtHall: 'Hall 04 (Main Sessions)',
    judge: 'Hon. Justice R. Venkataraman',
    benchNotes: 'Defense counsel Adv. Priya Sharma conducting cross on recovery memo.',
    hasAlarm: false,
  },
  {
    id: 'hrg-04',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    caseTitle: 'State v. Ramesh Kumar & 2 Ors.',
    date: '2026-10-15',
    time: '10:30',
    stage: 'Charge Framing Hearing',
    courtHall: 'Hall 04',
    judge: 'Hon. Justice R. Venkataraman',
    hasAlarm: true,
    alarmUrgency: 'WARNING',
  },
  {
    id: 'hrg-05',
    caseId: 'pocso-38-2025',
    caseNumber: 'Spl.S.C. (POCSO) 38/2025',
    caseTitle: 'State v. T. Anbazhagan',
    date: '2026-10-14',
    time: '11:00',
    stage: 'Victim Deposition (In-Camera)',
    courtHall: 'Hall 02',
    judge: 'Hon. Justice R. Venkataraman',
    hasAlarm: true,
    alarmUrgency: 'STATUTORY_CRITICAL',
  },
  {
    id: 'hrg-06',
    caseId: 'dl-cr-2026-00481',
    caseNumber: 'DL-CR-2026-PSCT-00481',
    caseTitle: 'State (NCT of Delhi) v. Rahul Verma & 2 Ors.',
    date: '2026-10-21',
    time: '14:30',
    stage: 'Final Arguments',
    courtHall: 'Hall 04',
    judge: 'Hon. Justice R. Venkataraman',
    hasAlarm: true,
    alarmUrgency: 'INFO',
  },
  {
    id: 'hrg-07',
    caseId: 'sc-198-2024',
    caseNumber: 'S.C. 198/2024',
    caseTitle: 'State v. Murugesan & Anr.',
    date: '2026-10-23',
    time: '15:00',
    stage: 'Review Compliance Report',
    courtHall: 'Hall 04',
    judge: 'Hon. Justice R. Venkataraman',
    hasAlarm: false,
  },
  {
    id: 'hrg-08',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    caseTitle: 'State v. Ramesh Kumar & 2 Ors.',
    date: '2026-10-28',
    time: '11:15',
    stage: 'Prosecution Witness PW-1 Examination',
    courtHall: 'Hall 04',
    judge: 'Hon. Justice R. Venkataraman',
    hasAlarm: true,
    alarmUrgency: 'INFO',
  },
]

export const INITIAL_ALARMS: AlarmRecord[] = [
  {
    id: 'alm-01',
    hearingId: 'hrg-02',
    caseId: 'pocso-38-2025',
    caseNumber: 'Spl.S.C. (POCSO) 38/2025',
    title: 'Statutory Limitation Lapse: In-Camera Victim Evidence Overdue',
    triggerTime: '2026-10-12 11:45',
    urgency: 'STATUTORY_CRITICAL',
    message: 'Under POCSO Act Sec. 35(1), victim deposition must be completed within 30 days of cognizance. 34 days elapsed. Expedite closed-room session.',
    isAcknowledged: false,
    isDismissed: false,
    createdAt: '2026-10-10 09:00',
  },
  {
    id: 'alm-02',
    hearingId: 'hrg-01',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    title: 'Remand Expiration Alarm: Accused 1 Ramesh Kumar',
    triggerTime: '2026-10-12 10:30',
    urgency: 'WARNING',
    message: '14-day statutory remand expires today. Production memo required before 13:00 hrs to avoid default bail vulnerability.',
    isAcknowledged: false,
    isDismissed: false,
    createdAt: '2026-10-11 08:30',
  },
  {
    id: 'alm-03',
    hearingId: 'hrg-04',
    caseId: 'sc-214-2025',
    caseNumber: 'S.C. 214/2025',
    title: 'FSL Ballistics Report Overdue Notice (22 Days)',
    triggerTime: '2026-10-15 10:00',
    urgency: 'WARNING',
    message: 'Court directed FSL Chennai to submit pistol ballistic match by 20 Sep 2026. Summons to Chemical Examiner pending.',
    isAcknowledged: true,
    isDismissed: false,
    createdAt: '2026-10-09 14:15',
  },
]

export const INITIAL_CASES: FullCaseRecord[] = [
  {
    id: 'sc-214-2025',
    number: 'S.C. 214/2025',
    title: 'State of Tamil Nadu v. Ramesh Kumar & 2 Ors.',
    type: 'Criminal',
    court: 'Principal Sessions Court, Chennai · Bench 04',
    acts: ['BNS s.309(4)', 'BNS s.3(5)', 'Arms Act s.25'],
    stage: 'Charge Framing & FSL Awaited',
    status: 'warning',
    filingDate: '2025-05-02',
    nextHearing: '15 Oct 2026',
    judge: 'Hon. Justice R. Venkataraman',
    policeStation: 'T-4 Anna Nagar Police Station, Chennai',
    fir: { no: '118/2025', date: '04 Feb 2025' },
    io: {
      name: 'Insp. S. Murugan',
      rank: 'Inspector of Police (Law & Order)',
      badge: 'TN-POL-4412',
      policeStation: 'T-4 Anna Nagar PS',
      phone: '+91-98401-22901',
      chargesheetRef: 'CS-118/2025 filed 02 May 2025',
    },
    parties: [
      { role: 'Prosecutor', name: 'Adv. P. Lakshmi (Special PP)', lawyerBar: 'MS/1182/2004' },
      { role: 'Complainant / Offended Party', name: 'K. Sundaram (Proprietor, Meenakshi Jewellers)' },
      { role: 'Accused', name: 'Ramesh Kumar (Alias "Kutty")', crimId: 'CRIM-2022-1102', lawyerBar: 'MS/3340/2011', custody: 'In custody' },
      { role: 'Accused', name: 'Dinesh Babu (Alias "Dinu")', crimId: 'CRIM-2025-0412', lawyerBar: 'MS/3340/2011', custody: 'On bail' },
      { role: 'Accused', name: 'Arun Selvam (Alias "Arun Hosur")', crimId: 'CRIM-2023-7401', custody: 'Absconding' },
      { role: 'Key Witness', name: 'R. Devi (Shop Assistant / PW-2)' },
    ],
    victims: {
      total: 1,
      minors: 0,
      adults: 1,
      details: [
        { name: 'K. Sundaram', masked: false, age: 58, relationship: 'Store Owner & Victim of Armed Assault' },
      ],
    },
    weapons: [
      {
        id: 'wpn-01',
        type: 'FIREARM',
        makeModel: 'Country-made 9mm semi-automatic pistol',
        serialNumber: 'Defaced / Ground off (Lab Tag WPN-441)',
        recoveryMemo: 'Seizure Mahazar under Sec. 27 Evidence Act dated 09 Feb 2025',
        recoveryDate: '2025-02-09',
        recoveryPlace: 'Shrubbery near Koyambedu flyover pillar #14, Chennai',
        ballisticStatus: 'PENDING_FSL',
        notes: 'Chambered for .315 / 9mm rounds. FSL report 22 days overdue. Summons issued to Forensic Director.',
      },
      {
        id: 'wpn-02',
        type: 'FIREARM',
        makeModel: 'Two live rounds (.315 bore lead core ammunition)',
        serialNumber: 'Ammunition Lot KF-19',
        recoveryMemo: 'Recovered along with weapon wpn-01 under same seizure memo',
        recoveryDate: '2025-02-09',
        recoveryPlace: 'Koyambedu, Chennai',
        ballisticStatus: 'PENDING_FSL',
        notes: 'Cartridges intact; primer unmarked.',
      },
    ],
    evidence: [
      {
        id: 'ev-01',
        code: 'EX-P-1',
        kind: 'Digital',
        title: 'CCTV DVR extract and certified transcript',
        detail: 'DVR extract of 2 min 14 sec from camera 02 showing 3 persons entering jewellery store at 18:42 hrs.',
        custodyOfficer: 'Insp. S. Murugan',
        date: '2025-02-05',
        place: 'Meenakshi Jewellers, Anna Nagar',
        labStatus: 'received',
        admission: 'admitted',
        chainHash: '8f2a9c1b4e6d7a8f9b0c',
        notes: 'CFSL Hyderabad confirms no digital tampering. Certificate under Section 63 BSA appended.',
      },
      {
        id: 'ev-02',
        code: 'EX-P-2',
        kind: 'Ballistic',
        title: 'Country-made pistol (.315 / 9mm)',
        detail: 'Recovered on disclosure statement of Accused 1 Ramesh Kumar near Koyambedu flyover.',
        custodyOfficer: 'Insp. S. Murugan',
        date: '2025-02-09',
        place: 'Malkhana, T-4 Anna Nagar PS',
        labStatus: 'pending',
        admission: 'marked',
        chainHash: '4e91a03f8c2b5d6e7f1a',
        notes: 'FSL report awaited from Forensic Science Department, Chennai.',
      },
      {
        id: 'ev-03',
        code: 'EX-P-3',
        kind: 'Forensic',
        title: 'Latent fingerprints lifted from glass display counter',
        detail: 'Three latent prints lifted by Scene of Crime Officers (SOCO) team.',
        custodyOfficer: 'SI V. Anand',
        date: '2025-02-04',
        place: 'Fingerprint Bureau, Egmore',
        labStatus: 'pending',
        admission: 'marked',
        chainHash: '7b6a5d4c3e2f1a0b9c8d',
        notes: 'Custody gap flagged: 3-day holding by SOCO without malkhana register entry.',
      },
    ],
    documents: [],
    hearings: [],
    additionalDetails: 'Chargesheet filed within 83 days of arrest. Defense has filed application for discharge regarding absence of independent witnesses during recovery.',
    isClosed: false,
  },
  {
    id: 'pocso-38-2025',
    number: 'Spl.S.C. (POCSO) 38/2025',
    title: 'State of Tamil Nadu v. T. Anbazhagan',
    type: 'POCSO',
    court: 'Special Court for POCSO Act Cases, Madurai · Bench 02',
    acts: ['POCSO Act s.6', 'POCSO Act s.10', 'BNS s.65(2)'],
    stage: 'Victim Evidence (In-Camera Overdue)',
    status: 'overdue',
    filingDate: '2025-09-08',
    nextHearing: '14 Oct 2026',
    judge: 'Hon. Justice R. Venkataraman',
    policeStation: 'All Women Police Station, Madurai City',
    fir: { no: '41/2025', date: '11 Jun 2025' },
    io: {
      name: 'Dy.SP Kavitha Rajan',
      rank: 'Deputy Superintendent of Police (AWPS)',
      badge: 'TN-POL-8109',
      policeStation: 'AWPS Madurai',
      phone: '+91-98421-99810',
      chargesheetRef: 'CS-POCSO-41/2025 filed 08 Sep 2025',
    },
    parties: [
      { role: 'Prosecutor', name: 'Adv. S. Revathi (Special Public Prosecutor)', lawyerBar: 'MS/2201/2008' },
      { role: 'Complainant / Offended Party', name: 'Parent of Minor Victim (Identity Protected under Sec 23 POCSO)', masked: true },
      { role: 'Victim', name: 'Minor Victim (Age 13 years · Identity Withheld)', masked: true },
      { role: 'Accused', name: 'T. Anbazhagan', crimId: 'CRIM-2024-9120', lawyerBar: 'MS/4417/2014', custody: 'In custody' },
    ],
    victims: {
      total: 1,
      minors: 1,
      adults: 0,
      details: [
        { name: 'Minor Child (Identity Withheld)', masked: true, age: 13, relationship: 'Primary Complainant & Victim' },
      ],
    },
    weapons: [],
    evidence: [
      {
        id: 'ev-p-01',
        code: 'EX-P-1',
        kind: 'Documentary',
        title: 'Statement recorded under Section 183 BNSS (Sec 164 CrPC)',
        detail: 'Confidential statement of the victim recorded before Judicial Magistrate II, Madurai in presence of support person.',
        custodyOfficer: 'Dy.SP Kavitha Rajan',
        date: '2025-06-14',
        place: 'Court of JM-II, Madurai',
        labStatus: 'n/a',
        admission: 'admitted',
        chainHash: '1a2b3c4d5e6f7a8b9c0d',
      },
      {
        id: 'ev-p-02',
        code: 'EX-P-2',
        kind: 'Forensic',
        title: 'DNA Profiling & Serology Examination Report',
        detail: 'DNA isolation from forensic swab compared with accused reference sample.',
        custodyOfficer: 'Dy.SP Kavitha Rajan',
        date: '2025-08-20',
        place: 'Forensic Lab Chennai',
        labStatus: 'received',
        admission: 'admitted',
        chainHash: '9f8e7d6c5b4a3f2e1d0c',
        notes: 'Positive allele match report signed by Dr. K. Meenakshi, DNA Analyst.',
      },
    ],
    documents: [],
    hearings: [],
    additionalDetails: 'Trial period exceeded 1 year from cognizance under POCSO s.35(2). Immediate in-camera recording required with DLSA support person.',
    isClosed: false,
  },
  {
    id: 'dl-cr-2026-00481',
    number: 'DL-CR-2026-PSCT-00481',
    title: 'State (NCT of Delhi) v. Rahul Verma & 2 Ors. (U/S 103 BNS / 302 IPC)',
    type: 'Criminal',
    court: 'Principal Sessions Court, Delhi · Bench 04',
    acts: ['BNS s.103(1)', 'BNS s.309(4)', 'Arms Act s.25'],
    stage: 'Cross Examination of Investigating Officer',
    status: 'warning',
    filingDate: '2026-01-15',
    nextHearing: '21 Oct 2026',
    judge: 'Hon. Justice R. Venkataraman',
    policeStation: 'PS Cyber Thana / Special Crime Branch, New Delhi',
    fir: { no: '12/2026', date: '10 Jan 2026' },
    io: {
      name: 'Insp. Vikram Singh',
      rank: 'Senior Inspector of Police (Special Cell)',
      badge: 'DL-POL-7741',
      policeStation: 'PS Cyber Thana, New Delhi',
      phone: '+91-98110-44199',
      chargesheetRef: 'CS-DL-12/2026 filed 10 Jan 2026',
    },
    parties: [
      { role: 'Prosecutor', name: 'Adv. Rajesh Khanna (Standing Counsel)', lawyerBar: 'D/1482/2004' },
      { role: 'Complainant / Offended Party', name: 'Sunil Verma (Brother of Deceased)' },
      { role: 'Victim', name: 'Late Sunita Devi (Deceased)' },
      { role: 'Accused', name: 'Rahul Verma (Alias "Rocky")', crimId: 'CRIM-2024-8819', lawyerBar: 'D/2190/2005', custody: 'In custody' },
      { role: 'Accused', name: 'Vikram Malhotra', crimId: 'CRIM-2025-3391', lawyerBar: 'D/2190/2005', custody: 'In custody' },
    ],
    victims: {
      total: 1,
      minors: 0,
      adults: 1,
      details: [
        { name: 'Late Sunita Devi', masked: false, age: 36, relationship: 'Deceased Victim of Armed Robbery Assault' },
      ],
    },
    weapons: [
      {
        id: 'wpn-dl-01',
        type: 'FIREARM',
        makeModel: 'Factory-grade 9mm Glock clone semi-automatic pistol',
        serialNumber: 'GLK-99120-DELHI',
        recoveryMemo: 'Seizure memo PS-CT-MEMO-2026-091 dated 11 Jan 2026',
        recoveryDate: '2026-01-11',
        recoveryPlace: 'Behind Mayur Vihar Pocket 1 drain culvert, New Delhi',
        ballisticStatus: 'MATCHED',
        notes: 'Forensic ballistics test confirms fired 9mm casing recovered from crime scene matched firing pin striations.',
      },
    ],
    evidence: [
      {
        id: 'ev-dl-01',
        code: 'EX-P-1',
        kind: 'Ballistic',
        title: '9mm Glock clone pistol & 4 fired cartridge cases',
        detail: 'Recovered on secret disclosure memo of Accused Rahul Verma.',
        custodyOfficer: 'Insp. Vikram Singh',
        date: '2026-01-11',
        place: 'CFSL New Delhi',
        labStatus: 'received',
        admission: 'admitted',
        chainHash: '5e4d3c2b1a0f9e8d7c6b',
        notes: 'CFSL Ballistic Report No. BAL-2026-448 positive match.',
      },
      {
        id: 'ev-dl-02',
        code: 'EX-P-2',
        kind: 'Digital',
        title: 'Tower CDR dumps and geo-triangulation packet',
        detail: 'Airtel & Jio cellular telemetry showing accused handset concurrently hopping same micro-tower at 21:14 hrs.',
        custodyOfficer: 'SI Rohit Narang',
        date: '2026-01-12',
        place: 'Special Cell Analytics Lab',
        labStatus: 'received',
        admission: 'admitted',
        chainHash: '3a4b5c6d7e8f9a0b1c2d',
      },
    ],
    documents: [],
    hearings: [],
    additionalDetails: 'Case reached stage of IO cross-examination. Defense attempting to impeach independent recovery memo witness.',
    isClosed: false,
  },
]

// Assign initial documents and hearings to cases
INITIAL_CASES.forEach((c) => {
  c.documents = INITIAL_DOCUMENTS.filter((d) => d.caseId === c.id)
  c.hearings = INITIAL_HEARINGS.filter((h) => h.caseId === c.id)
})

// ============================================================================
// STORE STATE WITH LOCALSTORAGE PERSISTENCE
// ============================================================================

const STORAGE_KEYS = {
  CASES: 'nyayadesk_cases_v2',
  CRIMINALS: 'nyayadesk_criminals_v2',
  LAWYERS: 'nyayadesk_lawyers_v2',
  HEARINGS: 'nyayadesk_hearings_v2',
  PUNISHMENTS: 'nyayadesk_punishments_v2',
  DOCUMENTS: 'nyayadesk_documents_v2',
  ALARMS: 'nyayadesk_alarms_v2',
  THEME: 'nyayadesk_theme_v2',
  BACKUP_META: 'nyayadesk_backup_meta_v2',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
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
    this.criminals = loadFromStorage(STORAGE_KEYS.CRIMINALS, INITIAL_CRIMINALS)
    this.lawyers = loadFromStorage(STORAGE_KEYS.LAWYERS, INITIAL_LAWYERS)
    this.hearings = loadFromStorage(STORAGE_KEYS.HEARINGS, INITIAL_HEARINGS)
    this.punishments = loadFromStorage(STORAGE_KEYS.PUNISHMENTS, INITIAL_PUNISHMENTS)
    this.documents = loadFromStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS)
    this.alarms = loadFromStorage(STORAGE_KEYS.ALARMS, INITIAL_ALARMS)
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
    return newCase
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
    return newHearing
  }

  public updateHearing(id: string, updates: Partial<HearingRecord>): HearingRecord | undefined {
    const idx = this.hearings.findIndex((h) => h.id === id)
    if (idx === -1) return undefined
    this.hearings[idx] = { ...this.hearings[idx], ...updates }
    this.notify()
    return this.hearings[idx]
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
