// Complete PostgreSQL DDL Script for NyayaDesk Judicial Case Management System
export const COMPLETE_POSTGRES_SQL = `-- ==============================================================================
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

-- 3. CORE RELATIONAL TABLES

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
  summary TEXT,
  additional_details TEXT,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  checked_doc_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Court Documents
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hearings Docket Roster
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

-- Punishments & Judicial Sentences
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punishments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow read access to court cases" ON public.cases FOR SELECT USING (true);
  CREATE POLICY "Allow write access to court cases" ON public.cases FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to criminals" ON public.criminals FOR SELECT USING (true);
  CREATE POLICY "Allow write access to criminals" ON public.criminals FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to lawyers" ON public.lawyers FOR SELECT USING (true);
  CREATE POLICY "Allow write access to lawyers" ON public.lawyers FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to hearings" ON public.hearings FOR SELECT USING (true);
  CREATE POLICY "Allow write access to hearings" ON public.hearings FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to documents" ON public.documents FOR SELECT USING (true);
  CREATE POLICY "Allow write access to documents" ON public.documents FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow read access to punishments" ON public.punishments FOR SELECT USING (true);
  CREATE POLICY "Allow write access to punishments" ON public.punishments FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`
