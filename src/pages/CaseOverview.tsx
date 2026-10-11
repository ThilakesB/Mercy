import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Gavel,
  Shield,
  Calendar,
  Clock,
  User,
  Users,
  FileText,
  Printer,
  Edit,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale,
  Sparkles,
  MapPin,
  EyeOff,
  Eye,
  Plus,
} from 'lucide-react'
import { judicialStore, type FullCaseRecord } from '../lib/judicialStore'
import { Button, Card, CardHeader, Tag, StatusChip, useApp } from '../ui'

export default function CaseOverview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useApp()

  const allCases = judicialStore.getCases()
  const currentCase = id ? judicialStore.getCase(id) || allCases[0] : allCases[0]

  if (!currentCase) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-zinc-800">Case Docket Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">The requested case record does not exist.</p>
        <Link to="/cases" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Return to Registry</Button>
        </Link>
      </div>
    )
  }

  const accusedList = currentCase.parties.filter((p) => p.role === 'Accused')
  const complainantParty = currentCase.parties.find((p) => p.role === 'Prosecutor' || p.role === 'Complainant / Offended Party')
  const totalVictims = currentCase.victims?.total || 1
  const minorVictims = currentCase.victims?.minors || 0
  const isOverdue = currentCase.status === 'overdue'

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121316] pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-black/[0.08] sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/cases"
                className="size-9 rounded-full bg-zinc-100 hover:bg-zinc-200 grid place-items-center text-zinc-700 transition-colors"
                title="Back to Cases"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white">
                    {currentCase.number}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOverdue ? 'Action Required · Overdue' : currentCase.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {currentCase.court}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 mt-1">
                  {currentCase.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/case/${currentCase.id}/details`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <Edit className="size-3.5 mr-1" />
                  Edit 8-Step Pipeline
                </Button>
              </Link>
              <Link to={`/case/${currentCase.id}/review`}>
                <Button variant="primary" size="sm" className="text-xs">
                  <Gavel className="size-3.5 mr-1" />
                  Review &amp; Verdict
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Sub-Navigation for Case Pipeline */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-black/[0.05] pt-3 text-xs font-bold">
            <Link
              to={`/case/${currentCase.id}/details`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              1. Case Details
            </Link>
            <Link
              to={`/case/${currentCase.id}/accused`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              2. Accused ({accusedList.length})
            </Link>
            <Link
              to={`/case/${currentCase.id}/victims`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              3. Victims ({totalVictims})
            </Link>
            <Link
              to={`/case/${currentCase.id}/witnesses`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              4. Witnesses
            </Link>
            <Link
              to={`/case/${currentCase.id}/evidence`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              5. Evidence Tracker ({currentCase.evidence?.length || 0})
            </Link>
            <Link
              to={`/case/${currentCase.id}/investigation`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              6. Investigation
            </Link>
            <Link
              to={`/case/${currentCase.id}/judgement-documents`}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 shrink-0"
            >
              7. Judgement Docs
            </Link>
            <Link
              to={`/case/${currentCase.id}/review`}
              className="px-3 py-1.5 rounded-xl bg-black text-white shrink-0"
            >
              8. Review &amp; Submit
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Primary Dossier Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Parties (Complainant vs Accused) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Users className="size-4 text-indigo-600" />
                Case Parties &amp; Legal Representation
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold">
                {currentCase.type}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Complainant / State Party */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Prosecution / Complainant
                </span>
                <div className="font-bold text-sm text-zinc-900">
                  {complainantParty?.name || 'State (NCT of Delhi)'}
                </div>
                <div className="text-xs text-zinc-600">
                  <span>FIR Registered at: </span>
                  <strong>{currentCase.policeStation}</strong>
                </div>
                <div className="text-xs text-zinc-600">
                  <span>FIR No: </span>
                  <strong className="font-mono">{currentCase.fir.no}</strong> ({currentCase.fir.date})
                </div>
              </div>

              {/* Accused Parties */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                  Accused / Respondent ({accusedList.length})
                </span>
                {accusedList.map((acc, i) => (
                  <div key={i} className="text-xs space-y-0.5 border-b border-rose-200/50 pb-1.5 last:border-b-0 last:pb-0">
                    <div className="font-bold text-zinc-900">{acc.name}</div>
                    <div className="flex items-center gap-2 text-zinc-600">
                      <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        {acc.custody || 'In custody'}
                      </span>
                      <span>Role: Main Accused</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 2: Sections of Law & Statutory Provisions */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Scale className="size-4 text-amber-600" />
              Statutory Sections Applied
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentCase.acts.map((act, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-2xs"
                >
                  <Gavel className="size-3 text-amber-700" />
                  {act}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-500 pt-1 leading-relaxed">
              {currentCase.additionalDetails ||
                'Prosecution instituted under statutory criminal provisions. Charges framed by Principal Sessions Court and listed for trial and witness cross-examinations.'}
            </p>
          </Card>

          {/* Card 3: Evidence Summary */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <FolderOpen className="size-4 text-emerald-600" />
                  Evidence Exhibits &amp; Lab Analysis Summary
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Chain-of-custody verified records and forensic lab findings
                </p>
              </div>
              <Link to={`/case/${currentCase.id}/evidence`}>
                <Button variant="outline" size="sm" className="text-xs">
                  Full Tracker
                </Button>
              </Link>
            </div>

            {/* Evidence counts grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                <span className="text-lg font-black block text-zinc-900">
                  {currentCase.evidence?.filter((e) => e.kind === 'Forensic').length || 1}
                </span>
                <span className="text-[10px] font-bold uppercase text-zinc-500">Forensic</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                <span className="text-lg font-black block text-zinc-900">
                  {currentCase.weapons?.length || 1}
                </span>
                <span className="text-[10px] font-bold uppercase text-zinc-500">Weapons</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                <span className="text-lg font-black block text-zinc-900">
                  {currentCase.evidence?.filter((e) => e.kind === 'Documentary').length || 1}
                </span>
                <span className="text-[10px] font-bold uppercase text-zinc-500">Documentary</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                <span className="text-lg font-black block text-zinc-900">
                  {currentCase.evidence?.filter((e) => e.kind === 'Circumstantial').length || 1}
                </span>
                <span className="text-[10px] font-bold uppercase text-zinc-500">Circumstantial</span>
              </div>
            </div>

            {/* Recent Evidence Items */}
            <div className="space-y-2">
              {currentCase.evidence?.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900 block">{ev.title}</span>
                    <span className="text-zinc-500 text-[11px]">
                      {ev.code} · Collected by {ev.custodyOfficer} on {ev.date}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                    {ev.admission}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Key Metrics, IO Details, Victims, and Timeline */}
        <div className="space-y-6">
          {/* Victims Count Card */}
          <Card className="p-5 space-y-3 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Victim Protection &amp; Count
              </span>
              <span className="size-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs grid place-items-center">
                {totalVictims}
              </span>
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-600">
                <span>Total Victims:</span>
                <strong className="text-zinc-900">{totalVictims}</strong>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Minor Victims (&lt; 18 yrs):</span>
                <strong className="text-zinc-900">{minorVictims}</strong>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Identity Protection:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <Shield className="size-3" /> Sealed Record
                </span>
              </div>
            </div>
            <Link to={`/case/${currentCase.id}/victims`} className="block pt-1">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Manage Victim Records
              </Button>
            </Link>
          </Card>

          {/* Lead Investigating Officer Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <User className="size-4 text-purple-600" />
              Lead Investigating Officer (IO)
            </h3>
            <div className="text-xs space-y-2 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
              <div>
                <span className="text-zinc-400 block text-[10px]">Officer Name:</span>
                <strong className="text-zinc-900 font-bold">{currentCase.io?.name || 'Insp. Pradeep Rawat'}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Rank:</span>
                  <span className="font-semibold">{currentCase.io?.rank || 'Inspector'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Badge:</span>
                  <span className="font-mono">{currentCase.io?.badge || 'DL-POL-8821'}</span>
                </div>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Official Phone:</span>
                <span className="font-semibold">{currentCase.io?.phone || '+91-98110-44910'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Chargesheet Reference:</span>
                <span className="font-mono text-zinc-700 font-bold">
                  {currentCase.io?.chargesheetRef || `CS-${currentCase.number.slice(-4)}/2026`}
                </span>
              </div>
            </div>
          </Card>

          {/* Chronological Timeline */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="size-4 text-blue-600" />
              Bench Timeline &amp; Hearings
            </h3>

            <div className="relative pl-5 space-y-4 border-l-2 border-zinc-200 text-xs">
              <div className="relative">
                <span className="absolute -left-[27px] top-0 size-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <span className="text-[10px] font-bold text-zinc-400 block">{currentCase.filingDate}</span>
                <span className="font-bold text-zinc-900 block">Case Ingested &amp; Docket Registered</span>
                <span className="text-zinc-500 text-[11px]">FIR registered at {currentCase.policeStation}</span>
              </div>

              <div className="relative">
                <span className="absolute -left-[27px] top-0 size-3 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                <span className="text-[10px] font-bold text-zinc-400 block">2026-04-05</span>
                <span className="font-bold text-zinc-900 block">Chargesheet Filed (Sec. 173 BNSS)</span>
                <span className="text-zinc-500 text-[11px]">Exhibits admitted into record</span>
              </div>

              <div className="relative">
                <span className="absolute -left-[27px] top-0 size-3 rounded-full bg-amber-500 ring-4 ring-amber-100 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-700 block">
                  Next Hearing: {currentCase.nextHearing}
                </span>
                <span className="font-bold text-zinc-900 block">Stage: {currentCase.stage}</span>
                <span className="text-zinc-500 text-[11px]">Principal Sessions Court, Bench 04</span>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5">
              <Link to="/schedule">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Calendar className="size-3.5 mr-1" />
                  View in Bench Calendar
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
