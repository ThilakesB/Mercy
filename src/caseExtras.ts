import type { Admission, CaseRec, EvKind, Evidence, LabStatus } from './data'

type Opts = {
  by: string
  date: string
  place: string
  linked: string[]
  lab?: LabStatus
  adm?: Admission
  chain?: Evidence['chain']
  labSummary?: string
  statements?: string[]
  notes?: string
  eventIdx?: number
  flag?: string
}
const E = (id: string, kind: EvKind, title: string, detail: string, doc: string, page: number, o: Opts): Evidence => ({
  id,
  kind,
  title,
  detail,
  src: { doc, page },
  by: o.by,
  date: o.date,
  place: o.place,
  linked: o.linked,
  lab: o.lab ?? 'n/a',
  adm: o.adm ?? 'marked',
  chain: o.chain ?? [],
  labSummary: o.labSummary,
  statements: o.statements,
  notes: o.notes,
  eventIdx: o.eventIdx,
  flag: o.flag,
})

const IO = 'Insp. S. Murugan'

export const extras: Record<string, Partial<CaseRec>> = {
  'sc-214-2025': {
    policeStation: 'T-4 Anna Nagar Police Station',
    fir: { no: '118/2025', date: '04 Feb 2025' },
    witnesses: 11,
    accused: [
      { name: 'Ramesh Kumar', age: 34, alias: '"Kutty"', address: '12, Periyar Street, Koyambedu, Chennai 600107', custody: 'In custody' },
      { name: 'Dinesh Babu', age: 29, alias: 'None', address: '4/18, Gandhi Nagar, Villivakkam, Chennai 600049', custody: 'On bail' },
      { name: 'Arun Selvam', age: 31, alias: '"Arun Hosur"', address: 'Last known: Bagalur Road, Hosur 635109', custody: 'Absconding' },
    ],
    victims: { total: 1, minors: 0, adults: 1, list: [{ masked: 'K***** S.', full: 'K. Sundaram (Meenakshi Jewellers)', minor: false }] },
    evidence: [
      E('E-01', 'Digital', 'CCTV footage and transcript - jewellery store', 'DVR extract of 2 min 14 s; three persons enter at 18:42.', 'CCTV_Transcript.pdf', 2, { by: IO, date: '05 Feb 2025', place: 'Meenakshi Jewellers, Anna Nagar', linked: ['Ramesh Kumar', 'Dinesh Babu', 'K. Sundaram'], lab: 'received', adm: 'marked', eventIdx: 0, labSummary: 'CFSL confirms the extract is unedited. Frame timestamps align with DVR clock (+3 min offset noted).', statements: ['PW-1 says three persons entered.', 'PW-2 says two persons entered.'], chain: [{ from: 'K. Sundaram', to: IO, date: '05 Feb 2025' }, { from: IO, to: 'Malkhana, T-4', date: '05 Feb 2025' }, { from: 'Malkhana, T-4', to: 'CFSL Hyderabad', date: '14 Feb 2025' }, { from: 'CFSL Hyderabad', to: IO, date: '02 Mar 2025' }] }),
      E('E-02', 'Forensic', 'Country-made pistol', 'Recovered on disclosure of Accused 1 near Koyambedu flyover.', 'FSL_Forwarding.pdf', 1, { by: IO, date: '09 Feb 2025', place: 'Koyambedu, Chennai', linked: ['Ramesh Kumar'], lab: 'pending', adm: 'marked', eventIdx: 1, flag: 'Ballistic report 22 days overdue', chain: [{ from: IO, to: 'Malkhana, T-4', date: '09 Feb 2025' }, { from: 'Malkhana, T-4', to: 'FSL Chennai', date: '12 Feb 2025', gap: 'No register entry between 10 and 12 Feb 2025' }], notes: 'Court direction of 04 Sep 2025 to obtain report within 6 weeks.' }),
      E('E-03', 'Forensic', 'Two live rounds (.315 bore)', 'Seized along with the pistol under the same mahazar.', 'FSL_Forwarding.pdf', 2, { by: IO, date: '09 Feb 2025', place: 'Koyambedu, Chennai', linked: ['Ramesh Kumar'], lab: 'pending', adm: 'marked', eventIdx: 1, chain: [{ from: IO, to: 'Malkhana, T-4', date: '09 Feb 2025' }, { from: 'Malkhana, T-4', to: 'FSL Chennai', date: '12 Feb 2025' }] }),
      E('E-04', 'Witness', 'Statement of K. Sundaram (PW-1)', 'Identifies Accused 1 as holding the pistol; says three persons entered.', 'Stmt_PW1_s180BNSS.pdf', 1, { by: IO, date: '06 Feb 2025', place: 'T-4 Anna Nagar PS', linked: ['K. Sundaram', 'Ramesh Kumar'], adm: 'marked', eventIdx: 0, statements: ['Three armed persons entered the shop at about 18:30.'] }),
      E('E-05', 'Witness', 'Statement of R. Devi (PW-2)', 'Shop assistant; states only two persons entered.', 'Stmt_PW2_s180BNSS.pdf', 2, { by: IO, date: '06 Feb 2025', place: 'T-4 Anna Nagar PS', linked: ['R. Devi'], adm: 'marked', eventIdx: 0, statements: ['Only two persons came to the counter.'] }),
      E('E-06', 'Digital', 'Call detail records - Accused 2', 'Tower location near Koyambedu between 17:50 and 19:10.', 'CDR_Analysis.pdf', 6, { by: 'Sub-Insp. V. Anand', date: '18 Feb 2025', place: 'Nodal officer, Airtel Chennai', linked: ['Dinesh Babu'], lab: 'n/a', adm: 'pending', eventIdx: 2, notes: 'Section 63 BSA certificate to be produced.' , chain: [{ from: 'Airtel nodal officer', to: 'Sub-Insp. V. Anand', date: '18 Feb 2025' }] }),
      E('E-07', 'Documentary', 'Seizure mahazar - pistol', 'Prepared in presence of two independent witnesses.', 'Chargesheet.pdf', 22, { by: IO, date: '09 Feb 2025', place: 'Koyambedu, Chennai', linked: ['Ramesh Kumar'], adm: 'marked', eventIdx: 1 }),
      E('E-08', 'Documentary', 'Valuation certificate - stolen ornaments', 'Valuer certifies Rs. 14.2 lakh.', 'Chargesheet.pdf', 27, { by: 'Govt. approved valuer M. Raghavan', date: '12 Feb 2025', place: 'Chennai', linked: ['K. Sundaram'], adm: 'admitted', eventIdx: 0 }),
      E('E-09', 'Circumstantial', 'Footwear impression cast', 'Plaster cast taken from the entrance mat.', 'Chargesheet.pdf', 31, { by: 'SOCO team, Chennai City', date: '04 Feb 2025', place: 'Meenakshi Jewellers', linked: ['Ramesh Kumar'], lab: 'disputed', adm: 'marked', eventIdx: 0, labSummary: 'Report matches size 9; defence disputes the method of comparison.', chain: [{ from: 'SOCO team', to: IO, date: '04 Feb 2025' }, { from: IO, to: 'FSL Chennai', date: '15 Feb 2025' }] }),
      E('E-10', 'Forensic', 'Latent fingerprints - glass counter', 'Three lifts on the counter surface.', 'Chargesheet.pdf', 29, { by: 'SOCO team, Chennai City', date: '04 Feb 2025', place: 'Meenakshi Jewellers', linked: ['Ramesh Kumar', 'Dinesh Babu'], lab: 'pending', adm: 'marked', eventIdx: 0, flag: 'Custody gap flagged', chain: [{ from: 'SOCO team', to: IO, date: '07 Feb 2025', gap: 'Lifts held by SOCO for 3 days with no handover entry' }, { from: IO, to: 'Fingerprint Bureau', date: '20 Feb 2025' }] }),
      E('E-11', 'Chemical', 'Gunshot residue swabs - Accused 1', 'Hand swabs taken at arrest.', 'FSL_Forwarding.pdf', 4, { by: 'Dr. K. Meena (Govt. Medical Officer)', date: '09 Feb 2025', place: 'Stanley Medical College Hospital', linked: ['Ramesh Kumar'], lab: 'pending', adm: 'pending', eventIdx: 1, chain: [{ from: 'Dr. K. Meena', to: IO, date: '09 Feb 2025' }, { from: IO, to: 'FSL Chennai', date: '12 Feb 2025' }] }),
    ],
  },
  'pocso-38-2025': {
    policeStation: 'All Women Police Station, Madurai',
    fir: { no: '41/2025', date: '11 Jun 2025' },
    witnesses: 9,
    accused: [{ name: 'T. Anbazhagan', age: 41, alias: 'None', address: '27, Kamarajar Salai, Simmakkal, Madurai 625001', custody: 'In custody' }],
    victims: { total: 1, minors: 1, adults: 0, list: [{ masked: 'V***** (minor)', full: 'Identity withheld by law (POCSO s.23)', minor: true }] },
    evidence: [
      E('E-01', 'Forensic', 'Medical examination report', 'Examination at Govt. Rajaji Hospital.', 'Medical_Report.pdf', 2, { by: 'Dr. S. Priya', date: '11 Jun 2025', place: 'Govt. Rajaji Hospital, Madurai', linked: ['Victim (masked)'], lab: 'received', adm: 'marked', eventIdx: 0, chain: [{ from: 'Dr. S. Priya', to: 'Dy.SP Kavitha Rajan', date: '11 Jun 2025' }] }),
      E('E-02', 'Documentary', 'School admission register extract', 'Records date of birth 04 Mar 2012.', 'School_Cert.pdf', 1, { by: 'Dy.SP Kavitha Rajan', date: '13 Jun 2025', place: 'Govt. Girls School, Madurai', linked: ['Victim (masked)'], adm: 'admitted', eventIdx: 0, flag: 'Age differs from hospital form' }),
      E('E-03', 'Witness', 'Victim statement (s.183 BNSS)', 'Recorded before Magistrate with support person present.', 'Stmt_Magistrate_s183.pdf', 1, { by: 'Judicial Magistrate, Madurai', date: '14 Jun 2025', place: 'Magistrate chambers', linked: ['Victim (masked)', 'T. Anbazhagan'], adm: 'marked', eventIdx: 1, notes: 'In-camera. Video recording sealed.', chain: [{ from: 'Judicial Magistrate', to: 'Court strong room', date: '14 Jun 2025' }] }),
      E('E-04', 'Forensic', 'DNA analysis report', 'Biological samples compared against reference sample of accused.', 'DNA_Report.pdf', 4, { by: 'Dy.SP Kavitha Rajan', date: '20 Jun 2025', place: 'Govt. Rajaji Hospital, Madurai', linked: ['T. Anbazhagan', 'Victim (masked)'], lab: 'received', adm: 'pending', eventIdx: 2, flag: 'Awaiting expert deposition', labSummary: 'Report received 02 Sep 2025. Expert deposition not yet listed.', chain: [{ from: 'Dr. S. Priya', to: 'Dy.SP Kavitha Rajan', date: '11 Jun 2025' }, { from: 'Dy.SP Kavitha Rajan', to: 'FSL Madurai', date: '20 Jun 2025' }, { from: 'FSL Madurai', to: 'Dy.SP Kavitha Rajan', date: '02 Sep 2025' }] }),
      E('E-05', 'Circumstantial', 'Clothing seized from accused premises', 'Sealed packet, seized under mahazar.', 'Chargesheet_POCSO.pdf', 14, { by: 'Dy.SP Kavitha Rajan', date: '12 Jun 2025', place: 'Simmakkal, Madurai', linked: ['T. Anbazhagan'], lab: 'received', adm: 'marked', eventIdx: 0, chain: [{ from: 'Dy.SP Kavitha Rajan', to: 'Malkhana, AWPS', date: '12 Jun 2025' }, { from: 'Malkhana, AWPS', to: 'FSL Madurai', date: '20 Jun 2025' }] }),
      E('E-06', 'Digital', 'Mobile phone of accused', 'Seized at arrest; imaging pending for one SIM.', 'Chargesheet_POCSO.pdf', 17, { by: 'Dy.SP Kavitha Rajan', date: '12 Jun 2025', place: 'Simmakkal, Madurai', linked: ['T. Anbazhagan'], lab: 'pending', adm: 'marked', eventIdx: 0, flag: 'Custody gap flagged', chain: [{ from: 'Dy.SP Kavitha Rajan', to: 'Cyber Cell', date: '12 Jun 2025' }, { from: 'Cyber Cell', to: 'Malkhana, AWPS', date: '02 Jul 2025', gap: 'Device location 14 to 17 Jun 2025 not recorded' }] }),
      E('E-07', 'Digital', 'Message extraction report', 'Extracted chats between accused and victim family.', 'Chargesheet_POCSO.pdf', 21, { by: 'Cyber Cell, Madurai', date: '20 Jul 2025', place: 'Cyber Cell, Madurai', linked: ['T. Anbazhagan'], lab: 'disputed', adm: 'marked', eventIdx: 4, labSummary: 'Defence disputes the s.63 BSA certificate.' }),
      E('E-08', 'Witness', 'Statement of parent (informant)', 'Describes events leading to the complaint.', 'Chargesheet_POCSO.pdf', 9, { by: 'Dy.SP Kavitha Rajan', date: '11 Jun 2025', place: 'AWPS Madurai', linked: ['Parent (masked)'], adm: 'marked', eventIdx: 0 }),
      E('E-09', 'Documentary', 'Scene mahazar and rough sketch', 'Prepared with two independent witnesses.', 'Chargesheet_POCSO.pdf', 12, { by: 'Dy.SP Kavitha Rajan', date: '12 Jun 2025', place: 'Simmakkal, Madurai', linked: ['T. Anbazhagan'], adm: 'admitted', eventIdx: 0 }),
      E('E-10', 'Digital', 'Scene photographs and video', '24 photographs and a 3 min video.', 'Chargesheet_POCSO.pdf', 13, { by: 'SOCO team, Madurai City', date: '12 Jun 2025', place: 'Simmakkal, Madurai', linked: ['T. Anbazhagan'], adm: 'marked', eventIdx: 0 }),
      E('E-11', 'Chemical', 'Blood grouping analysis', 'Chemical examiner report on stained fabric.', 'Chargesheet_POCSO.pdf', 25, { by: 'FSL Madurai', date: '14 Aug 2025', place: 'FSL Madurai', linked: ['T. Anbazhagan', 'Victim (masked)'], lab: 'received', adm: 'marked', eventIdx: 2, chain: [{ from: 'Malkhana, AWPS', to: 'FSL Madurai', date: '20 Jun 2025' }] }),
    ],
  },
  'hmop-67-2025': {
    policeStation: 'Not applicable (civil matter)',
    fir: { no: 'N/A', date: 'N/A' },
    witnesses: 4,
    accused: [{ name: 'Respondent (masked)', fullName: 'Karthik Subramani', age: 36, alias: 'None', address: 'Masked. Coimbatore (R.S. Puram)', custody: 'Not applicable' }],
    victims: { total: 2, minors: 1, adults: 1, list: [{ masked: 'D***** R.', full: 'Divya Ramesh (petitioner)', minor: false }, { masked: 'A***** K. (minor)', full: 'Identity withheld (minor child)', minor: true }] },
    evidence: [
      E('E-01', 'Documentary', 'Marriage certificate', 'Registered at Sub-Registrar Office, Coimbatore.', 'Marriage_Cert.pdf', 1, { by: 'Adv. R. Gayathri (Petitioner)', date: '19 Mar 2025', place: 'Family Court, Coimbatore', linked: ['Petitioner', 'Respondent'], adm: 'admitted', eventIdx: 0 }),
      E('E-02', 'Digital', 'Message transcripts', '126 messages exhibited, Mar to Dec 2023.', 'Chat_Transcript.pdf', 5, { by: 'Adv. R. Gayathri (Petitioner)', date: '02 Apr 2025', place: 'Family Court, Coimbatore', linked: ['Petitioner', 'Respondent'], lab: 'disputed', adm: 'marked', eventIdx: 0, labSummary: 'Respondent disputes authenticity of 14 messages.' }),
      E('E-03', 'Documentary', 'Salary slips (respondent)', 'Six months, Jan to Jun 2026.', 'Salary_Slips.pdf', 1, { by: 'Adv. T. Subramaniam (Respondent)', date: '10 Jul 2026', place: 'Family Court, Coimbatore', linked: ['Respondent'], adm: 'admitted', eventIdx: 1 }),
      E('E-04', 'Documentary', 'Medical records (petitioner)', 'Counselling consultation notes 2023-2024.', 'Medical_Records.pdf', 3, { by: 'Adv. R. Gayathri (Petitioner)', date: '02 Apr 2025', place: 'Family Court, Coimbatore', linked: ['Petitioner'], adm: 'marked', eventIdx: 0 }),
      E('E-05', 'Documentary', 'Bank statements (joint account)', 'Jan 2023 to Dec 2024.', 'Bank_Statements.pdf', 7, { by: 'Adv. T. Subramaniam (Respondent)', date: '10 Jul 2026', place: 'Family Court, Coimbatore', linked: ['Petitioner', 'Respondent'], adm: 'admitted', eventIdx: 1 }),
      E('E-06', 'Digital', 'Photographs from family events', '38 photographs, 2018 to 2023.', 'Photos_Index.pdf', 1, { by: 'Adv. T. Subramaniam (Respondent)', date: '02 Jul 2025', place: 'Family Court, Coimbatore', linked: ['Respondent'], adm: 'marked', eventIdx: 1 }),
      E('E-07', 'Witness', 'Statement of petitioner\'s mother (PW-1)', 'Describes events of 2023 and 2024.', 'Affidavit_PW1.pdf', 2, { by: 'Adv. R. Gayathri (Petitioner)', date: '15 Jul 2026', place: 'Family Court, Coimbatore', linked: ['Petitioner'], adm: 'marked', eventIdx: 1 }),
      E('E-08', 'Witness', 'Statement of respondent\'s brother (RW-1)', 'Describes the period of cohabitation in 2024.', 'Affidavit_RW1.pdf', 2, { by: 'Adv. T. Subramaniam (Respondent)', date: '20 Jul 2026', place: 'Family Court, Coimbatore', linked: ['Respondent'], adm: 'marked', eventIdx: 1, flag: 'Date of separation differs from petition' }),
      E('E-09', 'Documentary', 'Community Service Register extract (2023)', 'Complaint filed at local police station.', 'CSR_Copy.pdf', 1, { by: 'Adv. R. Gayathri (Petitioner)', date: '02 Apr 2025', place: 'R.S. Puram PS', linked: ['Petitioner', 'Respondent'], adm: 'marked', eventIdx: 0 }),
      E('E-10', 'Documentary', 'Counsellor notes - session 1', 'Mediation session on 30 Sep 2026.', 'Mediation_Note.pdf', 1, { by: 'Ms. J. Revathy (Counsellor)', date: '30 Sep 2026', place: 'Family Court, Coimbatore', linked: ['Petitioner', 'Respondent'], adm: 'pending', eventIdx: 3 }),
      E('E-11', 'Digital', 'Audio recording of phone call', 'Voice sample sent for authentication.', 'Audio_Index.pdf', 1, { by: 'Adv. R. Gayathri (Petitioner)', date: '05 Aug 2026', place: 'Family Court, Coimbatore', linked: ['Petitioner', 'Respondent'], lab: 'pending', adm: 'pending', eventIdx: 3, chain: [{ from: 'Adv. R. Gayathri', to: 'Court registry', date: '05 Aug 2026' }, { from: 'Court registry', to: 'Forensic voice lab', date: '14 Aug 2026', gap: 'Registry entry missing for 06 to 13 Aug' }] }),
    ],
  },
}
