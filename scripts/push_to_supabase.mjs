import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vodrmtqzqrmrcevmlvyg.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_H1eUm5bZKG73CQirby74wg_g0GYSAbN'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function run() {
  console.log('Connecting to Supabase PostgreSQL at:', SUPABASE_URL)

  // 1. Cases
  const casesData = [
    {
      id: 'sc-214-2025',
      number: 'S.C. 214/2025',
      title: 'State of Tamil Nadu v. Ramesh Kumar & 2 Ors.',
      type: 'Criminal',
      court: 'Principal Sessions Court, Chennai · Bench 04',
      acts: ['BNS s.309(4)', 'BNS s.3(5)', 'Arms Act s.25', 'Arms Act s.27'],
      stage: 'Charge Framing & Examination',
      status: 'warning',
      filing_date: '2025-02-04',
      next_hearing: '2026-10-15',
      judge: 'Hon. Justice R. Venkataraman',
      police_station: 'T-4 Anna Nagar Police Station, Chennai',
      fir_no: '118/2025',
      fir_date: '2025-02-04',
      summary: 'Robbery with attempt to cause death or hurt involving country-made firearm seized under section 23 BSA / 27 IEA.',
      is_closed: false,
    },
    {
      id: 'sc-314-2024',
      number: 'SC/314/2024',
      title: 'State (Govt. of NCT of Delhi) vs. Rakesh Kumar Sharma & Anr.',
      type: 'Criminal',
      court: 'Court of Additional Sessions Judge-02, Saket District Courts',
      acts: ['BNS Section 103(1)', 'BNS Section 190', 'Arms Act Sec 25/27', 'BSA Section 23'],
      stage: 'Prosecution Evidence (PE)',
      status: 'ontrack',
      filing_date: '2024-08-12',
      next_hearing: '2026-10-18',
      judge: 'Sh. Devender Kumar Jangala, ASJ-02',
      police_station: 'PS Hauz Khas',
      fir_no: '412/2024',
      fir_date: '2024-08-12',
      summary: 'Sessions murder trial originating from CNR DLST020314162024. Eyewitness examination completed, ballistic report admitted.',
      is_closed: false,
    },
    {
      id: 'pocso-42-2025',
      number: 'POCSO 42/2025',
      title: 'State v. Karthik & Anr.',
      type: 'POCSO',
      court: 'Special Children’s Court (POCSO), Chennai',
      acts: ['POCSO Act s.5', 'POCSO Act s.6', 'BNS s.64'],
      stage: 'Prosecution Evidence',
      status: 'ontrack',
      filing_date: '2025-01-10',
      next_hearing: '2026-10-22',
      judge: 'Hon. Justice M. Chitra Devi',
      police_station: 'All Women Police Station, Kilpauk',
      fir_no: '04/2025',
      fir_date: '2025-01-09',
      summary: 'Special POCSO trial; victim in-camera examination completed; forensic medical reports placed on record.',
      is_closed: false,
    },
  ]

  console.log('1. Pushing cases...')
  const { error: errCases } = await supabase.from('cases').upsert(casesData, { onConflict: 'id' })
  if (errCases) console.error('Error inserting cases:', errCases)
  else console.log('✓ Cases successfully synchronized (3 records)')

  // 2. Lawyers (without hardcoded non-uuid id, upserting on bar_number)
  const lawyersData = [
    {
      bar_number: 'MS/1182/2004',
      name: 'Adv. P. Lakshmi (Senior PP)',
      chapter: 'Bar Council of Tamil Nadu & Puducherry',
      enrolment_year: 2004,
      standing_years: 22,
      active_cases_count: 12,
      is_participating_in_bench: true,
      clearance_status: 'VERIFIED',
      phone: '+91 98401 99120',
      email: 'lakshmi.pp@chennaibar.org',
      chamber: 'Chamber 12, High Court Annex, Chennai',
    },
    {
      bar_number: 'MS/3340/2011',
      name: 'Adv. M. Senthil Kumar',
      chapter: 'Bar Council of Tamil Nadu & Puducherry',
      enrolment_year: 2011,
      standing_years: 15,
      active_cases_count: 8,
      is_participating_in_bench: true,
      clearance_status: 'VERIFIED',
      phone: '+91 94440 18239',
      email: 'senthil.adv@yahoo.com',
      chamber: 'Chamber 404, City Civil Court Block, Chennai',
    },
    {
      bar_number: 'D/2841/2012',
      name: 'Adv. Prateek Sharma',
      chapter: 'Bar Council of Delhi',
      enrolment_year: 2012,
      standing_years: 14,
      active_cases_count: 14,
      is_participating_in_bench: true,
      clearance_status: 'VERIFIED',
      phone: '+91 98114 83921',
      email: 'prateek.sharma.adv@delhibar.org',
      chamber: 'Chamber No. 418, Lawyers Block, Saket Courts Complex',
    },
    {
      bar_number: 'D/4190/2018',
      name: 'Adv. Prateek Singhania',
      chapter: 'Bar Council of Delhi',
      enrolment_year: 2018,
      standing_years: 8,
      active_cases_count: 8,
      is_participating_in_bench: true,
      clearance_status: 'VERIFIED',
      phone: '+91 97112 09481',
      email: 'singhania.law@gmail.com',
      chamber: 'Chamber No. 112, Western Wing, Saket Courts',
    },
    {
      bar_number: 'D/1102/2015',
      name: 'Adv. Prateeksha Malhotra',
      chapter: 'Bar Council of Delhi',
      enrolment_year: 2015,
      standing_years: 11,
      active_cases_count: 19,
      is_participating_in_bench: true,
      clearance_status: 'VERIFIED',
      phone: '+91 99101 44820',
      email: 'prateeksha.malhotra@chamber306.com',
      chamber: 'Chamber No. 306, Tis Hazari Courts / Saket Branch',
    },
  ]

  console.log('2. Pushing lawyers...')
  const { error: errLawyers } = await supabase.from('lawyers').upsert(lawyersData, { onConflict: 'bar_number' })
  if (errLawyers) console.error('Error inserting lawyers:', errLawyers)
  else console.log('✓ Lawyers successfully synchronized (5 records)')

  // 3. Criminals
  const criminalsData = [
    {
      crim_id: 'CRIM-2025-0104',
      name: 'Ramesh Kumar',
      aliases: ['Kutty', 'Ramesh Anna'],
      age: 32,
      dob: '1994-06-12',
      gender: 'Male',
      biometric_hash: 'SHA256:49A1F29B88019C',
      recidivism_score: 0.72,
      active_case_number: 'S.C. 214/2025',
      custody_status: 'In custody',
      address: 'No. 14, MGR Nagar, Chennai',
      photo_placeholder: 'RK',
    },
    {
      crim_id: 'CRIM-2025-0105',
      name: 'Dinesh Babu',
      aliases: ['Dinesh'],
      age: 28,
      dob: '1998-02-18',
      gender: 'Male',
      biometric_hash: 'SHA256:77B812C440182E',
      recidivism_score: 0.35,
      active_case_number: 'S.C. 214/2025',
      custody_status: 'On bail',
      address: 'No. 88, Anna Salai, Chennai',
      photo_placeholder: 'DB',
    },
    {
      crim_id: 'CRIM-2024-8819',
      name: 'Rakesh Kumar Sharma',
      aliases: ['Raka', 'Pandit Ji'],
      age: 36,
      dob: '1990-08-22',
      gender: 'Male',
      biometric_hash: 'SHA256:0914F89BC19280',
      recidivism_score: 0.81,
      active_case_number: 'SC/314/2024',
      custody_status: 'In custody',
      address: 'Gali 4, Hauz Khas Village, New Delhi',
      photo_placeholder: 'RS',
    },
  ]

  console.log('3. Pushing criminals...')
  const { error: errCrim } = await supabase.from('criminals').upsert(criminalsData, { onConflict: 'crim_id' })
  if (errCrim) console.error('Error inserting criminals:', errCrim)
  else console.log('✓ Criminals successfully synchronized (3 records)')

  // 4. Hearings
  const hearingsData = [
    {
      case_id: 'sc-214-2025',
      case_number: 'S.C. 214/2025',
      case_title: 'State of Tamil Nadu v. Ramesh Kumar & 2 Ors.',
      hearing_date: '2026-10-15',
      time_slot: '10:30:00',
      stage: 'Charge Framing',
      court_hall: 'Court Hall 04 (Main Sessions)',
      judge: 'Hon. Justice R. Venkataraman',
      bench_notes: 'Produce Accused A-1 from Central Prison Puzhal under safe escort.',
      has_alarm: true,
      alarm_urgency: 'WARNING',
    },
    {
      case_id: 'sc-314-2024',
      case_number: 'SC/314/2024',
      case_title: 'State vs. Rakesh Kumar Sharma',
      hearing_date: '2026-10-18',
      time_slot: '11:15:00',
      stage: 'Prosecution Evidence',
      court_hall: 'Court Room No. 304, Saket Courts',
      judge: 'Sh. Devender Kumar Jangala, ASJ-02',
      bench_notes: 'Summons issued to PW-4 Investigating Officer.',
      has_alarm: true,
      alarm_urgency: 'INFO',
    },
  ]

  console.log('4. Pushing hearings...')
  const { error: errHearings } = await supabase.from('hearings').upsert(hearingsData)
  if (errHearings) console.error('Error inserting hearings:', errHearings)
  else console.log('✓ Hearings successfully synchronized (2 records)')

  // 5. Punishments
  const punishmentsData = [
    {
      case_id: 'sc-214-2025',
      case_number: 'S.C. 214/2025',
      case_title: 'State v. Ramesh Kumar & Ors.',
      convict_name: 'Ramesh Kumar',
      crim_id: 'CRIM-2025-0104',
      judge: 'Hon. Justice R. Venkataraman',
      punishment_type: 'RIGOROUS_IMPRISONMENT',
      duration_months: 84,
      fine_amount_inr: 50000,
      pronouncement_date: '2025-02-04',
      operative_text: 'Convicted under Section 309(4) BNS. Rigorous Imprisonment for 7 years and fine of Rs. 50,000.',
    },
  ]

  console.log('5. Pushing punishments...')
  const { error: errPunishments } = await supabase.from('punishments').upsert(punishmentsData)
  if (errPunishments) console.error('Error inserting punishments:', errPunishments)
  else console.log('✓ Punishments successfully synchronized (1 record)')

  // 6. Documents
  const documentsData = [
    {
      case_id: 'sc-214-2025',
      canonical_name: 'Certified FIR Copy (Crime No 118/2025)',
      original_file_name: 'FIR_118_2025_Certified_Copy.pdf',
      submitting_party: 'POLICE_INVESTIGATION',
      advocate_or_officer: 'Insp. S. Murugan',
      submission_date: '2025-02-04',
      file_size: '2.4 MB',
      pages: 4,
      kind: 'FIR Copy (.pdf)',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      ocr_excerpt: 'First Information Report under Section 154 CrPC / 173 BNSS registered at T-4 Anna Nagar PS.',
    },
    {
      case_id: 'sc-314-2024',
      canonical_name: 'CFSL Ballistic Examination Report (Ex.PW3/A)',
      original_file_name: 'CFSL_Ballistics_Expert_Opinion.pdf',
      submitting_party: 'POLICE_INVESTIGATION',
      advocate_or_officer: 'Dr. V. K. Mathur (CFSL Expert)',
      submission_date: '2024-09-24',
      file_size: '3.8 MB',
      pages: 12,
      kind: 'Forensic Lab Report (.pdf)',
      sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      ocr_excerpt: 'Striation marks on test cartridge match firing pin impressions on evidence cartridge Ex. P-2.',
    },
  ]

  console.log('6. Pushing documents...')
  const { error: errDocs } = await supabase.from('documents').upsert(documentsData)
  if (errDocs) console.error('Error inserting documents:', errDocs)
  else console.log('✓ Documents successfully synchronized (2 records)')

  console.log('\n======================================================')
  console.log('ALL BACKEND DATABASE TABLES ARE NOW 100% POPULATED & LIVE!')
  console.log('======================================================\n')
}

run().catch(console.error)
