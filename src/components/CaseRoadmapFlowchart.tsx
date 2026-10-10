import { useState } from 'react'
import { Link } from 'react-router'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  Fingerprint,
  FlaskConical,
  Gavel,
  Lock,
  MapPin,
  Maximize2,
  Minimize2,
  Scale,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  UserX,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import type { CaseRec } from '../data'
import { Button, Card, Citation, cn, Tag, useApp } from '../ui'

interface RoadmapProps {
  c: CaseRec
}

export function CaseRoadmapFlowchart({ c }: RoadmapProps) {
  const { revealed, role } = useApp()
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [expandedSection, setExpandedSection] = useState<'all' | 'summary'>('all')

  const crim = c.type !== 'Matrimonial'

  // Extract key entities
  const ioName = c.io || 'Insp. S. Murugan (T-4 Anna Nagar)'
  const stationName = c.policeStation || 'Principal Sessions Jurisdiction'
  const firNumber = c.fir?.no && c.fir.no !== 'N/A' ? `FIR No. ${c.fir.no} (${c.fir.date})` : 'Complaint Direct Filing'

  return (
    <div className="space-y-6">
      {/* 1. ROADMAP HERO HEADER */}
      <Card line className="p-6 bg-card border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-black animate-pulse" />
              <span className="font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground">
                Judicial Decision Roadmap · Case Anatomy Flowchart
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {c.number}: {c.title}
              </h2>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded border border-zinc-200 bg-zinc-100 text-black font-semibold">
                {c.type} Matter
              </span>
              <span>·</span>
              <span>Penal Charges:</span>
              <span className="text-foreground font-semibold">{c.acts.join(', ')}</span>
              <span>·</span>
              <span>Courtroom:</span>
              <span className="text-zinc-600">{c.court}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={expandedSection === 'all' ? 'primary' : 'outline'}
              onClick={() => setExpandedSection(expandedSection === 'all' ? 'summary' : 'all')}
            >
              {expandedSection === 'all' ? 'Focus Mode' : 'Expand All Nodes'}
            </Button>
            <Link to={`/timeline`}>
              <Button size="sm" variant="outline">
                <Clock className="size-3.5" /> Full Timeline Tree
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Progress Indicator Bar */}
        <div className="mt-4 pt-1 grid grid-cols-6 gap-2 font-mono text-[10.5px]">
          <div className="flex items-center gap-1.5 text-black font-semibold">
            <span className="size-4 grid place-items-center rounded bg-black text-white text-[9px] font-bold">1</span>
            <span className="truncate hidden sm:inline">Case & Charge</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <span className="size-4 grid place-items-center rounded border border-zinc-300 text-zinc-700 text-[9px]">2</span>
            <span className="truncate hidden sm:inline">Investigating IO</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <span className="size-4 grid place-items-center rounded border border-zinc-300 text-zinc-700 text-[9px]">3</span>
            <span className="truncate hidden sm:inline">Victim / Informant</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <span className="size-4 grid place-items-center rounded border border-zinc-300 text-zinc-700 text-[9px]">4</span>
            <span className="truncate hidden sm:inline">Accused / Criminal</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <span className="size-4 grid place-items-center rounded border border-zinc-300 text-zinc-700 text-[9px]">5</span>
            <span className="truncate hidden sm:inline">Police Evidence</span>
          </div>
          <div className="flex items-center gap-1.5 text-black font-bold">
            <span className="size-4 grid place-items-center rounded bg-black text-white text-[9px]">6</span>
            <span className="truncate hidden sm:inline">Next Hearing</span>
          </div>
        </div>
      </Card>

      {/* 2. THE GRAND JUDICIAL FLOWCHART ROADMAP CONTAINER */}
      <div className="relative space-y-6">
        {/* ========================================================================= */}
        {/* STEP 1: CASE INCEPTION & STATUTORY CHARGES                                */}
        {/* ========================================================================= */}
        <div className="relative group">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-xs transition-all hover:border-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-black text-white">
                  STEP 01
                </span>
                <span className="font-serif text-lg font-bold text-foreground">
                  Case Inception & Formal Penal Charges
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Originating Registry Entry
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Docket & FIR Registration
                </span>
                <div className="mt-1 font-mono text-sm font-bold text-black">
                  {c.number}
                </div>
                <div className="mt-1 text-xs text-zinc-700">
                  {firNumber}
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Police Jurisdiction: {stationName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Statutory Penal Charges Under Trial
                </span>
                <div className="mt-1 space-y-1">
                  {c.acts.map((act) => (
                    <div key={act} className="inline-block mr-1.5 mb-1 px-2 py-0.5 rounded bg-black text-white font-mono text-xs font-semibold">
                      {act}
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Substantive offences framed under Bharatiya Nyaya Sanhita & Special Acts
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Registry Status & Trial Stage
                </span>
                <div className="mt-1 font-serif text-base font-bold text-black">
                  {c.stage}
                </div>
                <div className="mt-1 font-mono text-xs text-zinc-700">
                  Bench: {c.judge}
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Courtroom 04 · Sessions Bench Chennai
                </div>
              </div>
            </div>
          </div>

          {/* Central Connecting Flow Arrow */}
          <div className="my-2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-zinc-300" />
              <div className="size-7 rounded-full border border-zinc-300 bg-white grid place-items-center text-black shadow-xs">
                <ArrowDown className="size-3.5" />
              </div>
              <div className="w-0.5 h-6 bg-zinc-300" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 2: WHO INVESTIGATED THE CASE (INVESTIGATING OFFICER)                 */}
        {/* ========================================================================= */}
        <div className="relative group">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-xs transition-all hover:border-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-black text-white">
                  STEP 02
                </span>
                <span className="font-serif text-lg font-bold text-foreground">
                  Who Investigated the Case (Police Authority)
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Investigating Officer (IO) & Station Diary
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Primary IO Card */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 relative shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg border border-zinc-200 bg-white grid place-items-center text-black shrink-0 shadow-xs">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Lead Investigating Officer
                    </span>
                    <h4 className="mt-0.5 font-serif text-base font-bold text-black">
                      {ioName}
                    </h4>
                    <p className="font-mono text-xs text-zinc-600 mt-0.5">
                      {stationName}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-200 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Officer In-Charge:</span>
                    <strong className="text-black">Authorised under Sec. 173 BNSS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Chargesheet Filing:</span>
                    <strong className="text-black">Filed within 83 days</strong>
                  </div>
                </div>
              </div>

              {/* Station Diary Log Card */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Police Station Diary & Remand Log
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {c.police.length} Entries Logged
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {c.police.slice(0, 2).map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-zinc-200 bg-white text-xs shadow-xs">
                      <span className="font-mono text-[10.5px] text-black font-semibold block">{p.date}</span>
                      <p className="text-zinc-700 mt-0.5 line-clamp-1">{p.entry}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Malkhana & Seizure Safe Custody */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Malkhana Evidence Custody & Panchnama
                </span>
                <div className="mt-2 text-xs text-zinc-700 leading-relaxed">
                  All seized property forwarded to Malkhana register under safe seal. Weapon seized under disclosure memo with 2 independent mahazar witnesses.
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Property Form 95:</span>
                  <span className="text-black font-semibold">Submitted to Magistrate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Central Connecting Flow Arrow */}
          <div className="my-2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-zinc-300" />
              <div className="size-7 rounded-full border border-zinc-300 bg-white grid place-items-center text-black shadow-xs">
                <ArrowDown className="size-3.5" />
              </div>
              <div className="w-0.5 h-6 bg-zinc-300" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: WHO IS THE VICTIM (COMPLAINANT / INJURED / INFORMANT)             */}
        {/* ========================================================================= */}
        <div className="relative group">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-xs transition-all hover:border-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-black text-white">
                  STEP 03
                </span>
                <span className="font-serif text-lg font-bold text-foreground">
                  Who is the Victim & Complainant
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                {c.type === 'POCSO' ? (
                  <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-black font-semibold">
                    <Lock className="inline size-3 mr-1" /> Protected Minor (POCSO s.23)
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Primary Prosecuting Witness
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.victims.list.length > 0 ? (
                c.victims.list.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-lg border border-zinc-200 bg-white grid place-items-center text-black shrink-0 shadow-xs">
                        <UserCheck className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {v.minor ? 'Minor Victim' : 'Complainant / Injured'}
                        </span>
                        <h4 className="mt-0.5 font-serif text-base font-bold text-black truncate">
                          {revealed && !v.minor ? v.full : v.masked}
                        </h4>
                        <div className="mt-1 font-mono text-xs text-zinc-700">
                          {v.minor ? 'Age 13 · Support Person Appointed' : 'Shop Owner · Eyewitness PW-1'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-200 space-y-1 font-mono text-xs text-muted-foreground">
                      <div>Statement: <strong className="text-black">Sec. 180 / 183 BNSS Recorded</strong></div>
                      <div>Legal Aid: <strong className="text-black">DLSA Panel Advocate Assigned</strong></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-lg border border-zinc-200 bg-white grid place-items-center text-black shrink-0 shadow-xs">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Informant / Complainant
                      </span>
                      <h4 className="mt-0.5 font-serif text-base font-bold text-black">
                        K. Sundaram (Meenakshi Jewellers)
                      </h4>
                      <div className="mt-1 font-mono text-xs text-zinc-700">
                        Proprietor · Direct Eyewitness
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-200 text-xs text-muted-foreground">
                    Filed complaint within 3 hours of crime; identified stolen articles and pistol.
                  </div>
                </div>
              )}

              {/* Informant Deposition Summary */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Evidentiary Statement under Section 180 BNSS
                </span>
                <p className="mt-2 text-xs text-zinc-700 leading-relaxed">
                  "At about 18:30 hrs, armed assailants entered the premises, brandished a country-made firearm, threatened staff, and looted gold ornaments weighing approximately 280 grams."
                </p>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Citations: <Citation src={{ doc: 'Stmt_PW1_s180BNSS.pdf', page: 1 }} />
                </div>
              </div>

              {/* Statutory Privacy & Protection Notice */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Judicial Witness Protection Orders
                </span>
                <div className="mt-2 space-y-1.5 text-xs text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-black" />
                    <span>In-Camera Examination Ordered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-black" />
                    <span>Witness Protection Scheme 2018 Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-black" />
                    <span>Identity Redacted in Public Registry</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Central Connecting Flow Arrow */}
          <div className="my-2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-zinc-300" />
              <div className="size-7 rounded-full border border-zinc-300 bg-white grid place-items-center text-black shadow-xs">
                <ArrowDown className="size-3.5" />
              </div>
              <div className="w-0.5 h-6 bg-zinc-300" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 4: WHO IS THE CRIMINAL / ACCUSED                                     */}
        {/* ========================================================================= */}
        <div className="relative group">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-xs transition-all hover:border-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-black text-white">
                  STEP 04
                </span>
                <span className="font-serif text-lg font-bold text-foreground">
                  Who is the Criminal / Accused Persons
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {c.accused.length} Accused Persons Listed on Chargesheet
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.accused.map((a, idx) => (
                <div
                  key={a.name}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 relative flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded bg-black border border-black grid place-items-center font-mono text-xs font-bold text-white">
                          A{idx + 1}
                        </span>
                        <h4 className="font-serif text-base font-bold text-black">
                          {a.name}
                        </h4>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider',
                          a.custody === 'In custody'
                            ? 'bg-black text-white'
                            : a.custody === 'On bail'
                              ? 'border border-zinc-300 bg-white text-zinc-800'
                              : 'border border-black bg-zinc-200 text-black',
                        )}
                      >
                        {a.custody}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 font-mono text-xs text-muted-foreground">
                      <div>Age: <span className="text-black font-semibold">{a.age} years</span></div>
                      <div>Alias: <span className="text-black font-semibold">{a.alias}</span></div>
                      <div className="truncate">Address: <span className="text-zinc-700">{a.address}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 text-xs">
                    {a.custody === 'In custody' && (
                      <div className="font-mono text-[11px] text-zinc-700 flex items-center gap-1.5">
                        <Lock className="size-3 text-black" /> Remanded at Central Prison Puzhal
                      </div>
                    )}
                    {a.custody === 'On bail' && (
                      <div className="font-mono text-[11px] text-zinc-700 flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-black" /> Bail with passport surrendered
                      </div>
                    )}
                    {a.custody === 'Absconding' && (
                      <div className="font-mono text-[11px] text-black flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="size-3 text-black" /> NBW Warrant Pending Execution
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Connecting Flow Arrow */}
          <div className="my-2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-zinc-300" />
              <div className="size-7 rounded-full border border-zinc-300 bg-white grid place-items-center text-black shadow-xs">
                <ArrowDown className="size-3.5" />
              </div>
              <div className="w-0.5 h-6 bg-zinc-300" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 5: WHAT ARE THE EVIDENCE PROVIDED BY POLICE                          */}
        {/* ========================================================================= */}
        <div className="relative group">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-xs transition-all hover:border-black/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-black text-white">
                  STEP 05
                </span>
                <span className="font-serif text-lg font-bold text-foreground">
                  What are the Evidence Provided by the Police
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {c.evidence.length} Exhibits Forwarded with Chargesheet
              </span>
            </div>

            {/* Evidence Categorized Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {c.evidence.slice(0, 6).map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 hover:border-black/30 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-black text-white">
                        {ev.id}
                      </span>
                      <Tag className="font-mono text-[10px]">{ev.kind}</Tag>
                      <span className="font-mono text-[10.5px] uppercase font-semibold text-zinc-700 border border-zinc-300 bg-white px-1.5 py-0.2 rounded">
                        {ev.adm}
                      </span>
                    </div>

                    <h4 className="mt-2 font-serif text-sm font-bold text-black line-clamp-1">
                      {ev.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {ev.detail}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 font-mono text-[10.5px]">
                    <span className="text-zinc-600">By: {ev.by}</span>
                    {ev.flag && (
                      <span className="text-black font-bold flex items-center gap-1 border border-zinc-300 px-1 rounded bg-zinc-100">
                        <AlertTriangle className="size-2.5" /> Flagged
                      </span>
                    )}
                    {ev.src && <Citation src={ev.src} />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link to={`/evidence`}>
                <Button variant="outline" size="sm">
                  View Complete Evidentiary Chain of Custody ({c.evidence.length} Exhibits) <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Central Connecting Flow Arrow */}
          <div className="my-2 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-zinc-300" />
              <div className="size-7 rounded-full border border-zinc-300 bg-white grid place-items-center text-black shadow-xs">
                <ArrowDown className="size-3.5" />
              </div>
              <div className="w-0.5 h-6 bg-zinc-300" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 6: CURRENT BENCH STAGE & NEXT HEARING ACTION                          */}
        {/* ========================================================================= */}
        <div className="relative group">
          <div className="rounded-2xl border-2 border-zinc-300 bg-zinc-50 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded font-mono text-xs font-bold bg-black text-white">
                  STEP 06 · TARGET
                </span>
                <span className="font-serif text-xl font-bold text-foreground">
                  Current Bench Stage & Scheduled Next Hearing
                </span>
              </div>
              <span className="px-3 py-1 rounded-full font-mono text-xs bg-black text-white font-bold">
                Listed: {c.nextHearing}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block">
                  Mandatory Adjudication Checklist for the Bench:
                </span>
                <ul className="space-y-2 text-xs text-zinc-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-black shrink-0 mt-0.5" />
                    <span><strong>Formal Framing of Charges:</strong> Hear defence discharge plea and examine statutory elements under Sec. 263 BNSS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-black shrink-0 mt-0.5" />
                    <span><strong>Summon IO on Ballistics Delay:</strong> Issue formal summons to IO Insp. S. Murugan to produce certified FSL ballistic certificate (overdue by 22 days).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-black shrink-0 mt-0.5" />
                    <span><strong>Execute NBW on Absconding Accused:</strong> Direct Commissioner of Police to file compliance status on Accused 3 arrest warrant.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-white flex flex-col justify-between shadow-xs">
                <div>
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground block">
                    Immediate Bench Directives
                  </span>
                  <p className="mt-1.5 text-xs text-zinc-700 leading-relaxed">
                    Courtroom 04 Sessions Bench will convene at 10:30 AM on {c.nextHearing}. Production order issued for Accused 1 from Central Prison Puzhal.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-200 flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => alert('Order draft created for Framing of Charges')}
                  >
                    <Gavel className="size-3.5" /> Pass Stage Order
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert('Judicial summons dispatched to IO')}
                  >
                    <Zap className="size-3.5" /> Expedite IO Compliance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
