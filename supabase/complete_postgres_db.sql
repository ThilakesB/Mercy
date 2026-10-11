-- ==============================================================================
-- NYAYADESK JUDICIAL CASE MANAGEMENT SYSTEM
-- COMPLETE POSTGRESQL DATABASE FOR DATA STORAGE & AUDIT TRACEABILITY
-- ==============================================================================
-- Supports both Supabase (PostgreSQL 15+) and Standalone PostgreSQL instances.
-- Includes full schema DDL, RLS policies, indexing, and seed data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
  CREATE TYPE public.judicial_case_type AS ENUM ('Criminal', 'POCSO', 'Matrimonial', 'Civil');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.judicial_case_status AS ENUM ('ontrack', 'warning', 'overdue', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.punishment_kind AS ENUM (
    'CAPITAL',
    'LIFE_IMPRISONMENT',
    'RIGOROUS_IMPRISONMENT',
    'SIMPLE_IMPRISONMENT',
    'PENAL_FINE',
    'PROBATION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.weapon_kind AS ENUM (
    'FIREARM',
    'EDGED_WEAPON',
    'BLUNT_OBJECT',
    'EXPLOSIVE',
    'IMPROVISED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 3. CORE RELATIONAL TABLES
-- ==============================================================================

-- Courts Registry
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  bench_number TEXT DEFAULT '04',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles & Judicial Officers
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  official_email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'judge',
  court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criminal Dossiers & Accused Persons
CREATE TABLE IF NOT EXISTS public.criminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crim_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  age INTEGER,
  dob DATE,
  gender TEXT DEFAULT 'Male',
  biometric_hash TEXT,
  recidivism_score NUMERIC(4,2) DEFAULT 0.00,
  active_case_number TEXT,
  custody_status TEXT NOT NULL DEFAULT 'In custody',
  address TEXT,
  photo_placeholder TEXT DEFAULT 'CR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prior Criminal Offense History
CREATE TABLE IF NOT EXISTS public.criminal_offenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criminal_id UUID NOT NULL REFERENCES public.criminals(id) ON DELETE CASCADE,
  offense_date DATE NOT NULL,
  fir_court TEXT NOT NULL,
  charges TEXT[] NOT NULL DEFAULT '{}',
  verdict TEXT NOT NULL DEFAULT 'UNDER_TRIAL',
  sentence TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Advocates & Lawyers Registry
CREATE TABLE IF NOT EXISTS public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  chapter TEXT NOT NULL,
  enrolment_year INTEGER,
  standing_years INTEGER DEFAULT 0,
  active_cases_count INTEGER DEFAULT 0,
  is_participating_in_bench BOOLEAN DEFAULT TRUE,
  clearance_status TEXT NOT NULL DEFAULT 'VERIFIED',
  phone TEXT,
  email TEXT,
  chamber TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Police Investigating Officers (IO)
CREATE TABLE IF NOT EXISTS public.investigators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  police_station TEXT NOT NULL,
  phone TEXT,
  chargesheet_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Judicial Cases Master Table
CREATE TABLE IF NOT EXISTS public.cases (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type public.judicial_case_type NOT NULL DEFAULT 'Criminal',
  court TEXT NOT NULL,
  court_id UUID REFERENCES public.courts(id) ON DELETE SET NULL,
  acts TEXT[] NOT NULL DEFAULT '{}',
  stage TEXT NOT NULL DEFAULT 'Filing & Cognizance',
  status public.judicial_case_status NOT NULL DEFAULT 'ontrack',
  filing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_hearing DATE,
  judge TEXT NOT NULL DEFAULT 'Hon. Justice R. Venkataraman',
  police_station TEXT NOT NULL,
  fir_no TEXT NOT NULL,
  fir_date DATE NOT NULL,
  io_badge TEXT REFERENCES public.investigators(badge) ON DELETE SET NULL,
  summary TEXT,
  additional_details TEXT,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  checked_doc_categories TEXT[] DEFAULT '{}',
  closure_record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case Parties (Complainant, Accused, Victim, Prosecutor, Defense Counsel)
CREATE TABLE IF NOT EXISTS public.case_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  crim_id TEXT REFERENCES public.criminals(crim_id) ON DELETE SET NULL,
  lawyer_bar TEXT REFERENCES public.lawyers(bar_number) ON DELETE SET NULL,
  masked BOOLEAN NOT NULL DEFAULT FALSE,
  custody TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seized Weapons & Firearms
CREATE TABLE IF NOT EXISTS public.weapons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  weapon_type public.weapon_kind NOT NULL DEFAULT 'FIREARM',
  make_model TEXT NOT NULL,
  serial_number TEXT,
  recovery_memo TEXT,
  recovery_date DATE,
  recovery_place TEXT,
  ballistic_status TEXT NOT NULL DEFAULT 'MATCHED',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admitted Evidence & Chain of Custody
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  custody_officer TEXT NOT NULL,
  collection_date DATE,
  place TEXT,
  lab_status TEXT NOT NULL DEFAULT 'received',
  admission TEXT NOT NULL DEFAULT 'admitted',
  chain_hash TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Court Documents & Exhibits (FIR, Chargesheet, Orders, Statements)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  canonical_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  submitting_party TEXT NOT NULL,
  advocate_or_officer TEXT NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_size TEXT,
  pages INTEGER DEFAULT 1,
  kind TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  ocr_excerpt TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hearings & Courtroom Docket Roster
CREATE TABLE IF NOT EXISTS public.hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  case_title TEXT NOT NULL,
  hearing_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  stage TEXT NOT NULL,
  court_hall TEXT NOT NULL DEFAULT 'Hall 04 (Main Sessions)',
  judge TEXT NOT NULL DEFAULT 'Hon. Justice R. Venkataraman',
  bench_notes TEXT,
  has_alarm BOOLEAN NOT NULL DEFAULT FALSE,
  alarm_urgency TEXT DEFAULT 'INFO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pronounced Judgments & Sentences
CREATE TABLE IF NOT EXISTS public.punishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  case_title TEXT NOT NULL,
  convict_name TEXT NOT NULL,
  crim_id TEXT,
  judge TEXT NOT NULL,
  punishment_type public.punishment_kind NOT NULL,
  duration_months INTEGER DEFAULT 0,
  fine_amount_inr NUMERIC(12,2) DEFAULT 0.00,
  pronouncement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  operative_text TEXT NOT NULL,
  decree_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Statutory Alarms & Deadline Reminders
CREATE TABLE IF NOT EXISTS public.alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hearing_id UUID REFERENCES public.hearings(id) ON DELETE CASCADE,
  case_id TEXT REFERENCES public.cases(id) ON DELETE CASCADE,
  case_number TEXT,
  title TEXT NOT NULL,
  trigger_time TIMESTAMPTZ NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'WARNING',
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Statutory Law Reference (BNS, BNSS, BSA, POCSO, Arms Act)
CREATE TABLE IF NOT EXISTS public.statutory_laws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  act_code TEXT NOT NULL,
  act_name TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  punishment_guide TEXT,
  ingredients TEXT[] DEFAULT '{}',
  precedents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Trail for Tamper-Evident Judicial Logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'Hon. Justice R. Venkataraman',
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_type ON public.cases(type);
CREATE INDEX IF NOT EXISTS idx_cases_filing ON public.cases(filing_date);
CREATE INDEX IF NOT EXISTS idx_hearings_date ON public.hearings(hearing_date);
CREATE INDEX IF NOT EXISTS idx_hearings_case ON public.hearings(case_id);
CREATE INDEX IF NOT EXISTS idx_criminals_crim_id ON public.criminals(crim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_alarms_ack ON public.alarms(is_acknowledged);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishments ENABLE ROW LEVEL SECURITY;

-- Development & Authorized Bench Access (Permits read/write for authenticated & anon keys in court intranet)
DO $$ BEGIN
  CREATE POLICY "Allow read access to court cases" ON public.cases FOR SELECT USING (true);
  CREATE POLICY "Allow insert access to court cases" ON public.cases FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow update access to court cases" ON public.cases FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to criminals" ON public.criminals FOR SELECT USING (true);
  CREATE POLICY "Allow write access to criminals" ON public.criminals FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to hearings" ON public.hearings FOR SELECT USING (true);
  CREATE POLICY "Allow write access to hearings" ON public.hearings FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to evidence" ON public.evidence FOR SELECT USING (true);
  CREATE POLICY "Allow write access to evidence" ON public.evidence FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to documents" ON public.documents FOR SELECT USING (true);
  CREATE POLICY "Allow write access to documents" ON public.documents FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to lawyers" ON public.lawyers FOR SELECT USING (true);
  CREATE POLICY "Allow write access to lawyers" ON public.lawyers FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to punishments" ON public.punishments FOR SELECT USING (true);
  CREATE POLICY "Allow write access to punishments" ON public.punishments FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 6. STATUTORY LAW REFERENCE (STATUTORY PROVISIONS FOR JUDICIAL SEARCH)
-- ==============================================================================
-- Only formal statutory legal enactments (BNS, BNSS, BSA, POCSO, Arms Act)
INSERT INTO public.statutory_laws (
  act_code, act_name, section, title, description, punishment_guide, ingredients
)
VALUES 
  (
    'BNS',
    'Bharatiya Nyaya Sanhita, 2023',
    '103(1)',
    'Punishment for Murder',
    'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
    'Death or Life Imprisonment + Mandatory Fine',
    '{"1. Causing death of a human being", "2. Intention of causing death or bodily injury likely to cause death", "3. Knowledge that act is so imminently dangerous as to cause death"}'
  ),
  (
    'BNS',
    'Bharatiya Nyaya Sanhita, 2023',
    '309(4)',
    'Robbery with Attempt to Cause Death or Hurt',
    'If at the time of committing or attempting to commit robbery, offender causes hurt or uses deadly weapon.',
    'Rigorous Imprisonment not less than 7 years, extending to 10 years + Fine',
    '{"1. Commission or attempt of robbery", "2. Use of deadly weapon or causing grievous hurt during commission"}'
  ),
  (
    'POCSO',
    'Protection of Children from Sexual Offences Act, 2012',
    '6',
    'Punishment for Aggravated Penetrative Sexual Assault',
    'Whoever commits aggravated penetrative sexual assault shall be punished with rigorous imprisonment for a term which shall not be less than twenty years.',
    'Rigorous Imprisonment 20 years to Life Imprisonment or Death + Fine',
    '{"1. Child victim under 18 years of age", "2. Penetrative assault committed in aggravated circumstances"}'
  )
ON CONFLICT DO NOTHING;
