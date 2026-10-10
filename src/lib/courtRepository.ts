import { supabase } from './supabase'
import type { CaseRec } from '../data'

export async function searchCases(query: string) {
  if (!supabase) return []

  const normalized = query.trim()
  if (!normalized) return []

  const { data, error } = await supabase
    .from('cases')
    .select('id, case_number, case_name, case_type, court_name, stage, status, next_hearing, investigating_officer')
    .or(`case_number.ilike.%${normalized}%,case_name.ilike.%${normalized}%,investigating_officer.ilike.%${normalized}%`)
    .order('next_hearing', { ascending: true })
    .limit(8)

  if (error) throw error
  return data ?? []
}

export async function getCaseById(id: string) {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      *,
      case_participants (*, person:people (*)),
      evidence (*),
      documents (*),
      hearings (*),
      investigators:case_investigators (*, investigator:investigators (*))
    `,
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createCase(input: {
  caseType: string
  caseName?: string
  courtName: string
  incidentDate?: string
  incidentLocation?: string
  summary?: string
}) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('cases')
    .insert({
      case_type: input.caseType,
      case_name: input.caseName || null,
      court_name: input.courtName,
      incident_date: input.incidentDate || null,
      incident_location: input.incidentLocation || null,
      summary: input.summary || null,
      status: 'registered',
      stage: 'Registration',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export function isCaseRec(value: unknown): value is CaseRec {
  return Boolean(value && typeof value === 'object' && 'id' in value && 'number' in value)
}
