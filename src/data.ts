export type Status = 'ontrack' | 'warning' | 'overdue'
export type CaseType = 'Criminal' | 'POCSO' | 'Matrimonial'
export type Src = { doc: string; page: number }

export const TODAY = '12 Oct 2026'
export const TODAY_LABEL = 'Monday, 12 October 2026'

export type EvKind = 'Circumstantial' | 'Forensic' | 'Chemical' | 'Documentary' | 'Witness' | 'Digital'
export type LabStatus = 'n/a' | 'pending' | 'received' | 'disputed'
export type Admission = 'pending' | 'marked' | 'admitted' | 'rejected'
export interface Evidence {
  id: string
  kind: EvKind
  title: string
  detail: string
  src: Src
  flag?: string
  by: string
  date: string
  place: string
  linked: string[]
  lab: LabStatus
  adm: Admission
  chain: { from: string; to: string; date: string; gap?: string }[]
  labSummary?: string
  statements?: string[]
  notes?: string
  eventIdx?: number
}
export interface Accused {
  name: string
  fullName?: string
  age: number
  alias: string
  address: string
  custody: 'In custody' | 'On bail' | 'Absconding' | 'Not applicable'
}

export interface CaseRec {
  id: string
  number: string
  title: string
  type: CaseType
  court: string
  acts: string[]
  stage: string
  status: Status
  nextHearing: string
  io: string
  judge: string
  idle: number
  parties: { name: string; role: string; masked?: boolean }[]
  lawyers: { name: string; side: string; enrol: string }[]
  keyDates: { label: string; date: string }[]
  timeline: { date: string; type: string; title: string; detail: string; src?: Src; gapDays?: number }[]
  evidence: Evidence[]
  accused: Accused[]
  victims: { total: number; minors: number; adults: number; list: { masked: string; full: string; minor: boolean }[] }
  policeStation: string
  fir: { no: string; date: string }
  witnesses: number
  contradictions: { summary: string; a: string; b: string; srcA: Src; srcB: Src }[]
  police: { date: string; entry: string }[]
  pendingReports: { name: string; requested: string; due: string; status: Status }[]
  custody: { status: string; detail: string }
  people: { name: string; role: string; masked?: boolean; note: string; links: string[] }[]
  documents: { name: string; pages: number; date: string; kind: string; size: string }[]
  deadlines: { rule: string; due: string; days: number; status: Status; src: Src }[]
  detailed: boolean
}

export const cases: CaseRec[] = [
  {
    id: 'sc-214-2025',
    number: 'S.C. 214/2025',
    title: 'State v. Ramesh Kumar & 2 Ors.',
    type: 'Criminal',
    court: 'Principal Sessions Court, Chennai',
    acts: ['BNS s.309(4)', 'BNS s.3(5)', 'Arms Act s.25'],
    stage: 'Charge framing',
    status: 'warning',
    nextHearing: '15 Oct 2026',
    io: 'Insp. S. Murugan (T-4 Anna Nagar)',
    judge: 'Hon. Justice R. Venkataraman',
    idle: 6,
    parties: [
      { name: 'State of Tamil Nadu', role: 'Prosecution' },
      { name: 'Ramesh Kumar', role: 'Accused 1 (in judicial custody)' },
      { name: 'Dinesh Babu', role: 'Accused 2 (on bail)' },
      { name: 'Arun Selvam', role: 'Accused 3 (absconding)' },
      { name: 'Meenakshi Jewellers (Prop. K. Sundaram)', role: 'Complainant' },
    ],
    lawyers: [
      { name: 'Adv. P. Lakshmi', side: 'Public Prosecutor', enrol: 'MS/1182/2004' },
      { name: 'Adv. V. Karthikeyan', side: 'Accused 1 & 2', enrol: 'MS/3340/2011' },
    ],
    keyDates: [
      { label: 'Date of offence', date: '03 Feb 2025' },
      { label: 'FIR registered (No. 118/2025)', date: '04 Feb 2025' },
      { label: 'Arrest of Accused 1', date: '09 Feb 2025' },
      { label: 'Chargesheet filed', date: '02 May 2025' },
      { label: 'Cognizance taken', date: '19 May 2025' },
    ],
    timeline: [
      { date: '04 Feb 2025', type: 'Filing', title: 'FIR No. 118/2025 registered', detail: 'Armed robbery at Meenakshi Jewellers, Anna Nagar. Complaint by K. Sundaram.', src: { doc: 'FIR_118_2025.pdf', page: 1 } },
      { date: '09 Feb 2025', type: 'Police', title: 'Accused 1 arrested', detail: 'Arrested near Koyambedu; country-made pistol recovered under Sec. 27 Evidence Act.', src: { doc: 'Arrest_Memo.pdf', page: 2 } },
      { date: '02 May 2025', type: 'Filing', title: 'Chargesheet filed', detail: '83 days after arrest; within the 90-day statutory period.', src: { doc: 'Chargesheet.pdf', page: 4 } },
      { date: '19 May 2025', type: 'Order', title: 'Cognizance taken; case committed to Sessions', detail: 'Summons issued to accused. Accused 3 declared absconding.', src: { doc: 'Committal_Order.pdf', page: 1 } },
      { date: '17 Jul 2025', type: 'Hearing', title: 'Bail granted to Accused 2', detail: 'Conditions: weekly reporting, passport surrendered.', src: { doc: 'Bail_Order_A2.pdf', page: 3 } },
      { date: '04 Sep 2025', type: 'Hearing', title: 'Hearing adjourned - FSL report awaited', detail: 'Court directed IO to obtain ballistic report within 6 weeks.', src: { doc: 'Order_Sheet.pdf', page: 11 } },
      { date: '21 Sep 2026', type: 'Hearing', title: 'Defence sought time for discharge application', detail: 'Matter listed for charge hearing on 15 Oct 2026.', src: { doc: 'Order_Sheet.pdf', page: 19 }, gapDays: 382 },
    ],
    evidence: [],
    accused: [],
    victims: { total: 0, minors: 0, adults: 0, list: [] },
    policeStation: '',
    fir: { no: '', date: '' },
    witnesses: 0,
    contradictions: [
      {
        summary: 'Number of persons who entered the shop',
        a: 'PW-1 states three armed persons entered the shop.',
        b: 'PW-2 states only two persons entered the shop.',
        srcA: { doc: 'Stmt_PW1_s180BNSS.pdf', page: 1 },
        srcB: { doc: 'Stmt_PW2_s180BNSS.pdf', page: 2 },
      },
      {
        summary: 'Time of incident',
        a: 'FIR records the incident at about 18:30.',
        b: 'CCTV transcript timestamps entry at 18:42.',
        srcA: { doc: 'FIR_118_2025.pdf', page: 1 },
        srcB: { doc: 'CCTV_Transcript.pdf', page: 2 },
      },
    ],
    police: [
      { date: '10 Sep 2026', entry: 'IO reports Accused 3 last traced to Hosur; NBW execution pending.' },
      { date: '22 Aug 2026', entry: 'Supplementary statement of PW-3 recorded under s.180 BNSS.' },
      { date: '01 Jun 2026', entry: 'Request for extension to obtain FSL report filed.' },
    ],
    pendingReports: [
      { name: 'FSL ballistic report', requested: '12 Feb 2025', due: '20 Sep 2026', status: 'overdue' },
      { name: 'Status report on NBW - Accused 3', requested: '10 Sep 2026', due: '17 Oct 2026', status: 'warning' },
    ],
    custody: { status: 'Judicial custody (A1); Bail (A2); Absconding (A3)', detail: 'A1 remanded 14 days at a time. Last extension 28 Sep 2026; next production 12 Oct 2026.' },
    people: [
      { name: 'K. Sundaram', role: 'Complainant / PW-1', note: 'Owner of the store; eyewitness.', links: ['E-01', 'E-03'] },
      { name: 'R. Devi', role: 'Witness / PW-2', note: 'Shop assistant, present at counter.', links: ['E-04'] },
      { name: 'Ramesh Kumar', role: 'Accused 1', note: 'Pistol recovered on disclosure.', links: ['E-02'] },
      { name: 'Dinesh Babu', role: 'Accused 2', note: 'Placed near the location by CDR.', links: ['E-05'] },
    ],
    documents: [
      { name: 'FIR_118_2025.pdf', pages: 3, date: '04 Feb 2025', kind: 'FIR', size: '412 KB' },
      { name: 'Chargesheet.pdf', pages: 64, date: '02 May 2025', kind: 'Chargesheet', size: '5.2 MB' },
      { name: 'CCTV_Transcript.pdf', pages: 4, date: '21 Mar 2025', kind: 'Evidence', size: '690 KB' },
      { name: 'Order_Sheet.pdf', pages: 20, date: '21 Sep 2026', kind: 'Order', size: '1.1 MB' },
    ],
    deadlines: [
      { rule: 'FSL report per court direction (4 Sep 2025)', due: '20 Sep 2026', days: -22, status: 'overdue', src: { doc: 'Order_Sheet.pdf', page: 11 } },
      { rule: 'Charge framing - BNSS s.263 timeline', due: '25 Oct 2026', days: 13, status: 'warning', src: { doc: 'Order_Sheet.pdf', page: 19 } },
      { rule: 'Remand extension - A1 production', due: '12 Oct 2026', days: 0, status: 'warning', src: { doc: 'Remand_Order.pdf', page: 1 } },
      { rule: 'Chargesheet within 90 days (BNSS s.187)', due: '10 May 2025', days: 0, status: 'ontrack', src: { doc: 'Chargesheet.pdf', page: 4 } },
    ],
    detailed: true,
  },
  {
    id: 'pocso-38-2025',
    number: 'Spl.S.C. (POCSO) 38/2025',
    title: 'State v. T. Anbazhagan',
    type: 'POCSO',
    court: 'Special Court (POCSO), Madurai',
    acts: ['POCSO s.6', 'POCSO s.10', 'BNS s.65(2)'],
    stage: 'Victim evidence (in-camera)',
    status: 'overdue',
    nextHearing: '14 Oct 2026',
    io: 'Dy.SP Kavitha Rajan (AWPS Madurai)',
    judge: 'Hon. Smt. Justice L. Anuradha',
    idle: 34,
    parties: [
      { name: 'State of Tamil Nadu', role: 'Prosecution' },
      { name: 'T. Anbazhagan', role: 'Accused (judicial custody)' },
      { name: 'Minor victim - identity withheld', role: 'Victim (aged 13)', masked: true },
      { name: 'Parent of victim - identity withheld', role: 'Informant', masked: true },
    ],
    lawyers: [
      { name: 'Adv. S. Revathi', side: 'Special Public Prosecutor', enrol: 'MS/2201/2008' },
      { name: 'Adv. M. Gnanasekar', side: 'Accused', enrol: 'MS/4417/2014' },
      { name: 'Adv. N. Fathima (Support Person)', side: 'Victim', enrol: 'DLSA panel' },
    ],
    keyDates: [
      { label: 'FIR (Crime 41/2025)', date: '11 Jun 2025' },
      { label: 'Accused arrested', date: '12 Jun 2025' },
      { label: 'Chargesheet filed', date: '08 Sep 2025' },
      { label: 'Trial must conclude (POCSO s.35)', date: '08 Sep 2026' },
    ],
    timeline: [
      { date: '11 Jun 2025', type: 'Filing', title: 'FIR registered on parent complaint', detail: 'Information given to Child Welfare Committee within 24 hours.', src: { doc: 'FIR_41_2025.pdf', page: 1 } },
      { date: '14 Jun 2025', type: 'Police', title: 'Victim statement recorded before Magistrate', detail: 'Recorded in presence of support person; video-recorded.', src: { doc: 'Stmt_Magistrate_s183.pdf', page: 1 } },
      { date: '08 Sep 2025', type: 'Filing', title: 'Chargesheet filed', detail: 'Filed on 88th day of custody.', src: { doc: 'Chargesheet_POCSO.pdf', page: 3 } },
      { date: '16 Dec 2025', type: 'Order', title: 'Charges framed', detail: 'Accused pleaded not guilty.', src: { doc: 'Order_Sheet_POCSO.pdf', page: 8 } },
      { date: '09 Sep 2026', type: 'Hearing', title: 'Victim not examined - witness protection arrangements pending', detail: 'DLSA support person requested a closed-room facility.', src: { doc: 'Order_Sheet_POCSO.pdf', page: 15 }, gapDays: 34 },
    ],
    evidence: [],
    accused: [],
    victims: { total: 0, minors: 0, adults: 0, list: [] },
    policeStation: '',
    fir: { no: '', date: '' },
    witnesses: 0,
    contradictions: [
      {
        summary: 'Date of birth of the victim',
        a: 'School register records date of birth as 04 Mar 2012.',
        b: 'Hospital intake form records age as 14 years.',
        srcA: { doc: 'School_Cert.pdf', page: 1 },
        srcB: { doc: 'Medical_Report.pdf', page: 1 },
      },
    ],
    police: [
      { date: '03 Oct 2026', entry: 'IO submitted compliance report on witness protection arrangements.' },
      { date: '22 Sep 2026', entry: 'Request to FSL for expert availability for deposition.' },
    ],
    pendingReports: [
      { name: 'Expert attendance - DNA analyst', requested: '22 Sep 2026', due: '14 Oct 2026', status: 'warning' },
      { name: 'Victim compensation scheme report (DLSA)', requested: '10 Aug 2026', due: '10 Sep 2026', status: 'overdue' },
    ],
    custody: { status: 'Judicial custody', detail: 'Bail applications dismissed on 22 Jul 2025 and 03 Feb 2026.' },
    people: [
      { name: 'Minor victim (identity withheld)', role: 'Victim', masked: true, note: 'Name, school and address masked under POCSO s.23.', links: ['E-01', 'E-03'] },
      { name: 'T. Anbazhagan', role: 'Accused', note: 'Neighbour of victim family.', links: ['E-04'] },
      { name: 'Dr. S. Priya', role: 'Medical witness', note: 'Examined victim on 11 Jun 2025.', links: ['E-01'] },
    ],
    documents: [
      { name: 'FIR_41_2025.pdf', pages: 2, date: '11 Jun 2025', kind: 'FIR', size: '340 KB' },
      { name: 'Chargesheet_POCSO.pdf', pages: 48, date: '08 Sep 2025', kind: 'Chargesheet', size: '4.4 MB' },
      { name: 'Order_Sheet_POCSO.pdf', pages: 16, date: '09 Sep 2026', kind: 'Order', size: '0.9 MB' },
    ],
    deadlines: [
      { rule: 'Trial completion within 1 year of cognizance (POCSO s.35(2))', due: '08 Sep 2026', days: -34, status: 'overdue', src: { doc: 'Chargesheet_POCSO.pdf', page: 3 } },
      { rule: 'Victim compensation report', due: '10 Sep 2026', days: -32, status: 'overdue', src: { doc: 'Order_Sheet_POCSO.pdf', page: 14 } },
      { rule: 'Victim evidence recorded within 30 days (POCSO s.35(1))', due: '14 Oct 2026', days: 2, status: 'warning', src: { doc: 'Order_Sheet_POCSO.pdf', page: 15 } },
    ],
    detailed: true,
  },
  {
    id: 'hmop-67-2025',
    number: 'H.M.O.P. 67/2025',
    title: 'Party A v. Party B (Divorce)',
    type: 'Matrimonial',
    court: 'Family Court No. 2, Coimbatore',
    acts: ['Hindu Marriage Act s.13(1)(ia)', 'HMA s.24', 'Guardians & Wards Act s.25'],
    stage: 'Mediation - report awaited',
    status: 'ontrack',
    nextHearing: '27 Oct 2026',
    io: 'N/A - Family Court Counsellor: Ms. J. Revathy',
    judge: 'Hon. Sri Justice K. Balasubramanian',
    idle: 12,
    parties: [
      { name: 'Petitioner (wife) - name masked', role: 'Petitioner', masked: true },
      { name: 'Respondent (husband) - name masked', role: 'Respondent', masked: true },
      { name: 'Minor child (age 6) - name masked', role: 'Child', masked: true },
    ],
    lawyers: [
      { name: 'Adv. R. Gayathri', side: 'Petitioner', enrol: 'MS/5521/2015' },
      { name: 'Adv. T. Subramaniam', side: 'Respondent', enrol: 'MS/2780/2009' },
    ],
    keyDates: [
      { label: 'Marriage solemnised', date: '14 Feb 2018' },
      { label: 'Separation', date: '02 Jan 2024' },
      { label: 'Petition filed', date: '19 Mar 2025' },
      { label: 'Referred to mediation', date: '05 Aug 2026' },
    ],
    timeline: [
      { date: '19 Mar 2025', type: 'Filing', title: 'Divorce petition filed on ground of cruelty', detail: 'Petition under HMA s.13(1)(ia).', src: { doc: 'Petition_HMOP67.pdf', page: 1 } },
      { date: '11 Jun 2025', type: 'Order', title: 'Interim maintenance ordered (s.24)', detail: 'Rs. 18,000 per month pending disposal.', src: { doc: 'Interim_Order.pdf', page: 2 } },
      { date: '05 Aug 2026', type: 'Order', title: 'Referred to court mediation', detail: 'Both parties directed to attend sessions with counsellor.', src: { doc: 'Order_Sheet_HMOP.pdf', page: 9 } },
      { date: '30 Sep 2026', type: 'Hearing', title: 'First mediation session held', detail: 'Counsellor reports both parties attended.', src: { doc: 'Mediation_Note.pdf', page: 1 } },
    ],
    evidence: [],
    accused: [],
    victims: { total: 0, minors: 0, adults: 0, list: [] },
    policeStation: '',
    fir: { no: '', date: '' },
    witnesses: 0,
    contradictions: [
      {
        summary: 'Date of separation',
        a: 'Petition states the parties separated on 02 Jan 2024.',
        b: 'Written statement states they lived together until Apr 2024.',
        srcA: { doc: 'Petition_HMOP67.pdf', page: 2 },
        srcB: { doc: 'Written_Statement.pdf', page: 3 },
      },
    ],
    police: [{ date: '-', entry: 'No police involvement in this matter. Counsellor reports are tracked under Documents.' }],
    pendingReports: [{ name: 'Mediation report', requested: '05 Aug 2026', due: '20 Oct 2026', status: 'ontrack' }],
    custody: { status: 'Not applicable', detail: 'Child currently resides with petitioner. Interim visitation on alternate Saturdays.' },
    people: [
      { name: 'Petitioner (masked)', role: 'Petitioner', masked: true, note: 'Identity masked per masking policy.', links: ['E-01', 'E-02'] },
      { name: 'Respondent (masked)', role: 'Respondent', masked: true, note: 'Identity masked per masking policy.', links: ['E-03'] },
      { name: 'Ms. J. Revathy', role: 'Family Court Counsellor', note: 'Conducting mediation sessions.', links: [] },
    ],
    documents: [
      { name: 'Petition_HMOP67.pdf', pages: 14, date: '19 Mar 2025', kind: 'Petition', size: '1.3 MB' },
      { name: 'Written_Statement.pdf', pages: 11, date: '02 Jul 2025', kind: 'Pleading', size: '980 KB' },
      { name: 'Mediation_Note.pdf', pages: 2, date: '30 Sep 2026', kind: 'Report', size: '210 KB' },
    ],
    deadlines: [
      { rule: 'Mediation report (referral order)', due: '20 Oct 2026', days: 8, status: 'ontrack', src: { doc: 'Order_Sheet_HMOP.pdf', page: 9 } },
      { rule: 'Disposal within 1 year of service (HMA s.21B)', due: '30 Nov 2026', days: 49, status: 'ontrack', src: { doc: 'Petition_HMOP67.pdf', page: 14 } },
    ],
    detailed: true,
  },
  ...[
    ['sc-198-2024', 'S.C. 198/2024', 'State v. M. Arjunan', 'Criminal', 'Principal Sessions Court, Chennai', ['BNS s.103(1)'], 'Prosecution evidence', 'overdue', '19 Oct 2026', 'Insp. A. Palani', 61],
    ['sc-077-2025', 'S.C. 77/2025', 'State v. Joseph Fernandez', 'Criminal', 'Additional Sessions Court, Salem', ['NDPS s.20(b)'], 'Arguments', 'ontrack', '23 Oct 2026', 'Insp. D. Rajeshwari', 4],
    ['pocso-12-2026', 'Spl.S.C. (POCSO) 12/2026', 'State v. K. Selvaraj', 'POCSO', 'Special Court (POCSO), Trichy', ['POCSO s.8'], 'Charge framing', 'warning', '16 Oct 2026', 'Insp. P. Anitha', 18],
    ['hmop-142-2024', 'H.M.O.P. 142/2024', 'Party C v. Party D (Divorce)', 'Matrimonial', 'Family Court No. 1, Madurai', ['HMA s.13B'], 'Cooling-off period', 'ontrack', '05 Nov 2026', 'N/A', 9],
    ['sc-301-2023', 'S.C. 301/2023', 'State v. P. Vasudevan & Ors.', 'Criminal', 'Principal Sessions Court, Vellore', ['BNS s.318(4)'], 'Defence evidence', 'warning', '20 Oct 2026', 'Insp. G. Murali', 42],
  ].map(
    (r): CaseRec => ({
      id: r[0] as string,
      number: r[1] as string,
      title: r[2] as string,
      type: r[3] as CaseType,
      court: r[4] as string,
      acts: r[5] as string[],
      stage: r[6] as string,
      status: r[7] as Status,
      nextHearing: r[8] as string,
      io: r[9] as string,
      judge: 'Hon. Justice R. Venkataraman',
      idle: r[10] as number,
      parties: [],
      lawyers: [],
      keyDates: [],
      timeline: [],
      evidence: [],
      accused: [],
      victims: { total: 0, minors: 0, adults: 0, list: [] },
      policeStation: '',
      fir: { no: '', date: '' },
      witnesses: 0,
      contradictions: [],
      police: [],
      pendingReports: [],
      custody: { status: '', detail: '' },
      people: [],
      documents: [],
      deadlines: [],
      detailed: false,
    }),
  ),
]

export const kpis = {
  accused: 1612,
  victims: 1347,
  evidencePending: 218,
  pending: 1284,
  today: 14,
  overdue: 63,
  deadlines7: 37,
  inactive30: 91,
}

export const priorityQueue = [
  { caseId: 'pocso-38-2025', reason: 'POCSO trial statutory period lapsed 34 days ago', severity: 'overdue' as Status },
  { caseId: 'sc-198-2024', reason: 'No activity for 61 days; summons to PW-4 unserved', severity: 'overdue' as Status },
  { caseId: 'sc-214-2025', reason: 'FSL report overdue; remand production today', severity: 'warning' as Status },
  { caseId: 'sc-301-2023', reason: 'Chargesheet supplementary deadline in 3 days', severity: 'warning' as Status },
  { caseId: 'pocso-12-2026', reason: 'Victim statement under s.183 BNSS pending', severity: 'warning' as Status },
]

export const causeList = [
  { time: '10:30', caseId: 'sc-214-2025', stage: 'Remand production (A1)' },
  { time: '11:00', caseId: 'sc-077-2025', stage: 'Arguments' },
  { time: '11:45', caseId: 'sc-301-2023', stage: 'Defence evidence' },
  { time: '12:30', caseId: 'hmop-67-2025', stage: 'Mention - mediation' },
  { time: '14:30', caseId: 'pocso-12-2026', stage: 'Charge framing' },
  { time: '15:15', caseId: 'sc-198-2024', stage: 'Prosecution evidence' },
]

export const byType = [
  { name: 'Criminal', value: 702 },
  { name: 'POCSO', value: 188 },
  { name: 'Matrimonial', value: 241 },
  { name: 'Civil', value: 153 },
]
export const ageBuckets = [
  { name: '0-90 d', cases: 412 },
  { name: '91-180 d', cases: 301 },
  { name: '181-365 d', cases: 276 },
  { name: '1-2 yr', cases: 187 },
  { name: '2 yr+', cases: 108 },
]
export const delayReasons = [
  { name: 'Witness absent', cases: 214 },
  { name: 'Report awaited', cases: 168 },
  { name: 'Counsel sought time', cases: 143 },
  { name: 'Accused not produced', cases: 77 },
  { name: 'Summons unserved', cases: 66 },
]

export const alerts = [
  { id: 1, sev: 'overdue' as Status, text: 'Trial period lapsed in Spl.S.C. (POCSO) 38/2025', time: '2h ago' },
  { id: 2, sev: 'overdue' as Status, text: 'FSL report overdue in S.C. 214/2025', time: '5h ago' },
  { id: 3, sev: 'warning' as Status, text: 'NBW status report due in 5 days - S.C. 214/2025', time: 'Yesterday' },
  { id: 4, sev: 'warning' as Status, text: 'No activity for 42 days - S.C. 301/2023', time: 'Yesterday' },
  { id: 5, sev: 'ontrack' as Status, text: 'Mediation report on track - H.M.O.P. 67/2025', time: '2 days ago' },
  { id: 6, sev: 'ontrack' as Status, text: 'Chargesheet filed within statutory time - S.C. 77/2025', time: '3 days ago' },
]

export const alertRows = [
  { id: 'a1', caseId: 'pocso-38-2025', rule: 'POCSO trial period (s.35) exceeded', sev: 'overdue' as Status, days: 34, clerk: 'M. Kalaivani' },
  { id: 'a2', caseId: 'sc-198-2024', rule: 'Inactivity threshold (Criminal: 45 d)', sev: 'overdue' as Status, days: 16, clerk: 'R. Suresh' },
  { id: 'a3', caseId: 'sc-214-2025', rule: 'Court-directed forensic report', sev: 'overdue' as Status, days: 22, clerk: 'M. Kalaivani' },
  { id: 'a4', caseId: 'sc-301-2023', rule: 'Inactivity threshold (Criminal: 45 d)', sev: 'warning' as Status, days: 0, clerk: 'S. Ibrahim' },
  { id: 'a5', caseId: 'pocso-12-2026', rule: 'Victim statement s.183 BNSS', sev: 'warning' as Status, days: 0, clerk: 'P. Divya' },
  { id: 'a6', caseId: 'hmop-67-2025', rule: 'Mediation report', sev: 'ontrack' as Status, days: 0, clerk: 'S. Ibrahim' },
]

export const users = [
  { name: 'Hon. R. Venkataraman', email: 'r.venkataraman@ecourts.gov.in', role: 'Judge', last: 'Today 09:12', active: true },
  { name: 'M. Kalaivani', email: 'm.kalaivani@ecourts.gov.in', role: 'Clerk', last: 'Today 09:40', active: true },
  { name: 'R. Suresh', email: 'r.suresh@ecourts.gov.in', role: 'Clerk', last: 'Yesterday 17:22', active: true },
  { name: 'S. Ibrahim', email: 's.ibrahim@ecourts.gov.in', role: 'Clerk', last: '08 Oct 2026', active: true },
  { name: 'D. Anandhi', email: 'd.anandhi@ecourts.gov.in', role: 'Admin', last: 'Today 08:55', active: true },
  { name: 'P. Divya', email: 'p.divya@ecourts.gov.in', role: 'Clerk', last: '21 Sep 2026', active: false },
]

export const permissions = [
  { perm: 'View case list', Judge: true, Clerk: true, Admin: false },
  { perm: 'View unmasked victim identity', Judge: true, Clerk: false, Admin: false },
  { perm: 'Add orders', Judge: true, Clerk: false, Admin: false },
  { perm: 'Add notes / upload documents', Judge: true, Clerk: true, Admin: false },
  { perm: 'Acknowledge alerts', Judge: true, Clerk: true, Admin: false },
  { perm: 'Configure alert rules', Judge: false, Clerk: false, Admin: true },
  { perm: 'Manage users', Judge: false, Clerk: false, Admin: true },
  { perm: 'View audit log', Judge: false, Clerk: false, Admin: true },
]

export const auditLog = [
  { t: '12 Oct 2026 09:41', user: 'M. Kalaivani', action: 'Viewed case', target: 'S.C. 214/2025' },
  { t: '12 Oct 2026 09:15', user: 'Hon. R. Venkataraman', action: 'Unmasked party name (reason logged)', target: 'Spl.S.C. (POCSO) 38/2025' },
  { t: '11 Oct 2026 17:22', user: 'R. Suresh', action: 'Snoozed alert 2 days', target: 'S.C. 198/2024' },
  { t: '11 Oct 2026 12:03', user: 'D. Anandhi', action: 'Changed inactivity threshold (Criminal 60 to 45 d)', target: 'Rule settings' },
  { t: '10 Oct 2026 16:48', user: 'S. Ibrahim', action: 'Exported summary', target: 'H.M.O.P. 67/2025' },
]

export const findCase = (id?: string) => cases.find((c) => c.id === id)
export const statusLabel: Record<Status, string> = { ontrack: 'On track', warning: 'Warning', overdue: 'Overdue' }

export const recentEvidence = [
  { caseId: 'sc-214-2025', id: 'E-10', text: 'Fingerprint lift: custody gap flagged (2 days unrecorded)', time: '1h ago', eventIdx: 1 },
  { caseId: 'pocso-38-2025', id: 'E-07', text: 'Extraction report disputed by defence', time: '4h ago', eventIdx: 4 },
  { caseId: 'sc-214-2025', id: 'E-02', text: 'Pistol: ballistic report still pending at FSL', time: 'Yesterday', eventIdx: 5 },
  { caseId: 'hmop-67-2025', id: 'E-11', text: 'Audio recording sent for voice authentication', time: '2 days ago', eventIdx: 3 },
]

import { extras } from './caseExtras'
cases.forEach((c) => Object.assign(c, extras[c.id]))
