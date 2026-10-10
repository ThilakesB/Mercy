-- ==============================================================================
-- NYAYADESK DATABASE PURGE / RESET SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO WIPE ALL DEMO/MOCK DATA FOR CLIENT HANDOVER
-- ==============================================================================

TRUNCATE TABLE 
  public.case_parties,
  public.weapons,
  public.evidence,
  public.documents,
  public.hearings,
  public.punishments,
  public.alarms,
  public.criminal_offenses,
  public.cases,
  public.criminals,
  public.lawyers,
  public.investigators,
  public.audit_logs 
CASCADE;

-- Optional: Verify that all tables are now clean
SELECT 'cases' AS table_name, count(*) AS remaining_records FROM public.cases
UNION ALL
SELECT 'criminals', count(*) FROM public.criminals
UNION ALL
SELECT 'hearings', count(*) FROM public.hearings
UNION ALL
SELECT 'evidence', count(*) FROM public.evidence;
