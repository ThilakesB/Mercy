import { useState, useId } from 'react'
import {
  Printer,
  Copy,
  Check,
  Download,
  Share2,
  Scale,
  Shield,
  FileText,
  Calendar,
  AlertTriangle,
  User,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Crosshair,
  BadgeAlert,
  ArrowRight,
  Gavel,
} from 'lucide-react'
import type { FullCaseRecord } from '../lib/judicialStore'
import { Button, Tag, StatusChip } from '../ui'

interface OfficialCaseDocumentProps {
  caseItem: FullCaseRecord
  onClose?: () => void
  isModal?: boolean
}

export default function OfficialCaseDocument({
  caseItem,
  onClose,
  isModal = false,
}: OfficialCaseDocumentProps) {
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState<'all' | 'parties' | 'investigation' | 'charges' | 'evidence' | 'hearings' | 'documents'>('all')

  // Generate standardized 16-character e-Courts CNR Number if not present
  const cnrNumber =
    (caseItem.id.startsWith('sc') ? 'TNCH01-' : caseItem.id.startsWith('pocso') ? 'TNMD02-' : 'TNCM03-') +
    caseItem.number.replace(/[^0-9]/g, '').padStart(6, '0').slice(-6) +
    '-' +
    (caseItem.filingDate ? caseItem.filingDate.slice(0, 4) : '2025')

  const handleCopyCnr = () => {
    navigator.clipboard.writeText(cnrNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportText = () => {
    const content = `
================================================================================
COURT OF THE PRINCIPAL DISTRICT & SESSIONS JUDGE · BENCH 04
COMPREHENSIVE MASTER CASE DOSSIER & OFFICIAL TRIAL RECORD
================================================================================
CNR NUMBER: ${cnrNumber}
CASE NUMBER: ${caseItem.number}
CAUSE TITLE: ${caseItem.title}
CASE TYPE: ${caseItem.type}
COURT: ${caseItem.court}
PRESIDING JUDGE: ${caseItem.judge}
FILING DATE: ${caseItem.filingDate}
NEXT HEARING: ${caseItem.nextHearing}
STATUS: ${caseItem.isClosed ? 'CLOSED / DISPOSED' : 'PENDING UNDER TRIAL'} (${caseItem.status.toUpperCase()})

POLICE INVESTIGATION:
Station: ${caseItem.policeStation}
FIR Reference: No. ${caseItem.fir.no} dated ${caseItem.fir.date}
Investigating Officer: ${caseItem.io?.name} (${caseItem.io?.rank}, Badge ${caseItem.io?.badge})
Chargesheet Reference: ${caseItem.io?.chargesheetRef}

STATUTORY PROVISIONS CITED:
${caseItem.acts.join(', ')}

PARTIES:
${caseItem.parties.map((p) => `- ${p.role}: ${p.name} ${p.custody ? `[${p.custody}]` : ''} ${p.lawyerBar ? `(Bar: ${p.lawyerBar})` : ''}`).join('\n')}

ADMITTED EVIDENCE & EXHIBITS:
${caseItem.evidence.map((e) => `- [${e.code}] ${e.title} (${e.kind}) - Status: ${e.admission.toUpperCase()}`).join('\n')}

WEAPONS SEIZED:
${caseItem.weapons.map((w) => `- ${w.makeModel} (Serial: ${w.serialNumber}) - Ballistics: ${w.ballisticStatus}`).join('\n')}

RECORD OF PROCEEDINGS:
${caseItem.hearings.map((h) => `- ${h.date} (${h.time}): ${h.stage} - Coram: ${h.judge} | Notes: ${h.benchNotes || 'Routine'}`).join('\n')}

CERTIFIED CASE EXTRACT GENERATED ON ${new Date().toLocaleDateString('en-GB')}
================================================================================
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Case_Document_${caseItem.number.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`w-full ${isModal ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
      {/* Top Document Controls Bar (Hidden during printing) */}
      <div className="print:hidden sticky top-0 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#121316] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-white/10 grid place-items-center text-[#FF5C5C]">
            <Scale className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-white uppercase">
                Official Case Record &amp; Dossier
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                CERTIFIED AUTHENTIC
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              CNR: {cnrNumber} · Case No: {caseItem.number}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCnr}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Copy CNR Number"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-zinc-400" />}
            <span>{copied ? 'CNR Copied' : 'Copy CNR'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportText}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Download Plain Text Dossier"
          >
            <Download className="size-3.5 text-zinc-400" />
            <span>Export Text</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-[#FF5C5C] hover:bg-[#ff4343] text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Print Official Certified Docket"
          >
            <Printer className="size-3.5" />
            <span>Print Case Document</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close Document"
            >
              <X className="size-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE OFFICIAL CASE RECORD DOCUMENT (Formatted as authentic legal court paper) */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF8F2] text-[#121316] font-serif p-6 sm:p-10 md:p-14 rounded-3xl border-2 border-black/20 shadow-2xl space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none">
        
        {/* Document Header & National Judiciary Seal */}
        <div className="text-center space-y-3 pb-6 border-b-2 border-black/80 relative">
          {/* Subtle Watermark emblem in center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -z-0">
            <Scale className="size-72" />
          </div>

          {/* Court Header Title */}
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-black/5 border border-black/15 font-mono text-[11px] font-bold tracking-widest uppercase mb-1">
            <span>e-Courts Digital Judicial Registry of India</span>
            <span>·</span>
            <span>Integrated Case Information System (CIS 4.0)</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-sans uppercase tracking-tight text-black">
            In the Court of the Principal District &amp; Sessions Judge
          </h1>
          <h2 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-zinc-700">
            Bench 04 · Trial Registry &amp; Cause Docket Record
          </h2>
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            {caseItem.court}
          </p>

          {/* Barcode & Security Hash Banner */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs border-t border-black/15 mt-4">
            <div className="text-left space-y-0.5">
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Case Record Number (CNR):</div>
              <div className="text-sm font-black tracking-wider text-black bg-black/5 px-2.5 py-1 rounded border border-black/10 inline-block">
                {cnrNumber}
              </div>
            </div>

            {/* Simulated Clean Digital Barcode */}
            <div className="flex flex-col items-center">
              <div className="flex items-end gap-[1.5px] h-7 px-2 py-1 bg-white border border-black/20 rounded">
                {[4,8,2,6,10,3,7,2,9,5,3,8,2,7,10,4,2,6,3,8,5,2,9,4,7,3,8].map((h, i) => (
                  <div key={i} className="w-[1.5px] bg-black" style={{ height: `${h * 2.2}px` }} />
                ))}
              </div>
              <span className="text-[9px] tracking-widest text-zinc-500 mt-0.5">CIS-VERIFIED DOCKET</span>
            </div>

            <div className="text-right space-y-0.5">
              <div className="text-[10px] text-zinc-500 uppercase font-bold">Registry Status:</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs uppercase font-mono tracking-wider bg-black text-white">
                <span className={`size-1.5 rounded-full ${caseItem.isClosed ? 'bg-emerald-400' : 'bg-[#FF5C5C] animate-pulse'}`} />
                <span>{caseItem.isClosed ? 'Disposed & Closed' : 'Pending Under Trial'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Case Metadata Table (Neobrutalist Swiss Grid) */}
        <div className="border border-black font-sans text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-[#F2EDE0] border-b border-black font-bold uppercase text-[10.5px] tracking-wider text-zinc-700">
            <div className="p-2.5 border-r border-black">Case Number</div>
            <div className="p-2.5 border-r border-black">Case Classification</div>
            <div className="p-2.5 border-r border-black">Filing Date</div>
            <div className="p-2.5">Next Hearing Date</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-black font-semibold text-zinc-900 bg-white">
            <div className="p-3 border-r border-black font-mono font-black text-sm text-[#FF5C5C]">
              {caseItem.number}
            </div>
            <div className="p-3 border-r border-black">
              <span className="px-2 py-0.5 rounded bg-zinc-100 font-bold text-xs uppercase">
                {caseItem.type} Suit / Trial
              </span>
            </div>
            <div className="p-3 border-r border-black font-mono">
              {caseItem.filingDate || '04 Feb 2025'}
            </div>
            <div className="p-3 font-mono font-bold text-black flex items-center gap-1.5">
              <Calendar className="size-3.5 text-zinc-500" />
              <span>{caseItem.nextHearing}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 bg-[#F2EDE0] border-b border-black font-bold uppercase text-[10.5px] tracking-wider text-zinc-700">
            <div className="p-2.5 border-r border-black">Presiding Judge</div>
            <div className="p-2.5 border-r border-black">Court Room / Hall</div>
            <div className="p-2.5 border-r border-black">Current Trial Stage</div>
            <div className="p-2.5">Police Precinct</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 font-semibold text-zinc-900 bg-white">
            <div className="p-3 border-r border-black font-bold text-black">
              {caseItem.judge}
            </div>
            <div className="p-3 border-r border-black">
              Hall 04 (Main Sessions Complex)
            </div>
            <div className="p-3 border-r border-black font-bold text-[#FF5C5C]">
              {caseItem.stage}
            </div>
            <div className="p-3 truncate">
              {caseItem.policeStation}
            </div>
          </div>
        </div>

        {/* Cause Title Banner (Standardized Legal Nomenclature) */}
        <div className="p-5 rounded-2xl bg-[#EFEAD8] border-2 border-black space-y-2">
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-zinc-600">
            Standardized Cause Title of the Matter
          </div>
          <div className="text-base sm:text-lg font-sans font-black tracking-tight text-black">
            {caseItem.title}
          </div>
          <div className="text-xs font-sans text-zinc-700 font-medium">
            Primary Criminal Proceeding instituted upon police chargesheet reference: <span className="font-mono font-bold text-black">{caseItem.io?.chargesheetRef || 'CS-REG-2025'}</span>
          </div>
        </div>

        {/* Section 1: Standardized Litigant & Counsel Ledger */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-black">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#FF5C5C]">SECTION 01.</span>
              <h3 className="font-black text-sm uppercase tracking-wider text-black">
                Litigants, Parties &amp; Legal Representatives
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">
              {caseItem.parties.length} Named Parties On Record
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Complainants / Prosecution */}
            <div className="border border-black bg-white p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-600">
                  Petitioner / Prosecution
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold font-mono">
                  THE STATE
                </span>
              </div>

              {caseItem.parties
                .filter((p) => p.role.includes('Prosecutor') || p.role.includes('Complainant') || p.role.includes('Offended'))
                .map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="font-bold text-xs text-black">{p.name}</div>
                    <div className="text-[11px] text-zinc-600 font-medium flex items-center justify-between">
                      <span>Role: {p.role}</span>
                      {p.lawyerBar && <span className="font-mono text-[10.5px]">Bar Enrolment: {p.lawyerBar}</span>}
                    </div>
                  </div>
                ))}
            </div>

            {/* Accused / Respondents */}
            <div className="border border-black bg-white p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-zinc-600">
                  Accused / Respondents
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold font-mono">
                  DEFENSE ROSTER
                </span>
              </div>

              {caseItem.parties
                .filter((p) => p.role.includes('Accused') || p.role.includes('Defense'))
                .map((p, i) => (
                  <div key={i} className="space-y-1 pb-2 border-b border-zinc-100 last:border-none last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black">{p.name}</span>
                      {p.custody && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          p.custody === 'In custody'
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : p.custody === 'On bail'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {p.custody}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-600 font-medium flex items-center justify-between">
                      <span>{p.crimId ? `Dossier ID: ${p.crimId}` : `Role: ${p.role}`}</span>
                      {p.lawyerBar && <span className="font-mono text-[10.5px]">Counsel: {p.lawyerBar}</span>}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Victims Details if present */}
          {caseItem.victims && caseItem.victims.total > 0 && (
            <div className="border border-black bg-[#FFF7ED] p-3.5 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold uppercase tracking-wider text-amber-950 font-mono text-[10.5px] block">
                  Victim Information &amp; Protection Registry:
                </span>
                <span className="text-zinc-700 font-medium">
                  Total Victims: {caseItem.victims.total} ({caseItem.victims.minors} Minors, {caseItem.victims.adults} Adults). Protective masking enforced under Section 23 POCSO / Section 228A IPC where applicable.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-200 text-amber-950 font-mono font-bold text-[10.5px]">
                IDENTITY PROTECTED
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Police Investigation & Station Diary Record */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-black">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#FF5C5C]">SECTION 02.</span>
              <h3 className="font-black text-sm uppercase tracking-wider text-black">
                Police Investigation &amp; Station Diary Manifest
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">
              FIR No. {caseItem.fir.no}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 border border-black bg-white p-4 text-xs">
            <div className="space-y-1">
              <div className="font-mono text-[10.5px] text-zinc-500 uppercase font-bold">Police Station</div>
              <div className="font-bold text-zinc-900">{caseItem.policeStation}</div>
              <div className="text-[11px] text-zinc-500">Jurisdiction: Greater Metropolitan Police</div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-r border-black/10 sm:px-4">
              <div className="font-mono text-[10.5px] text-zinc-500 uppercase font-bold">First Information Report (FIR)</div>
              <div className="font-bold text-zinc-900">FIR No. {caseItem.fir.no}</div>
              <div className="text-[11px] text-zinc-500">Registered: {caseItem.fir.date}</div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-[10.5px] text-zinc-500 uppercase font-bold">Lead Investigating Officer (IO)</div>
              <div className="font-bold text-zinc-900">{caseItem.io?.name || 'Assigned IO'}</div>
              <div className="text-[11px] text-zinc-500">
                {caseItem.io?.rank || 'Inspector'} · Badge: <span className="font-mono font-bold">{caseItem.io?.badge || 'POL-01'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Statutory Charges & Penal Provisions Cited */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-black">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#FF5C5C]">SECTION 03.</span>
              <h3 className="font-black text-sm uppercase tracking-wider text-black">
                Statutory Offenses &amp; Penal Provisions Charged
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">
              {caseItem.acts.length} Cited Statutes
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {caseItem.acts.map((act, idx) => (
              <div key={idx} className="p-3 bg-white border border-black space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-zinc-500 uppercase">Charge 0{idx + 1}</span>
                  <span className="size-2 rounded-full bg-[#FF5C5C]" />
                </div>
                <div className="font-black text-xs text-black font-mono">
                  {act}
                </div>
                <div className="text-[10.5px] text-zinc-600 leading-tight">
                  Cognizable offense under Indian Statutory Criminal Code. Framing of charges in accordance with Section 228 CrPC / 251 BNSS.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Admitted Evidence, Weapons & Exhibits Ledger */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-black">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#FF5C5C]">SECTION 04.</span>
              <h3 className="font-black text-sm uppercase tracking-wider text-black">
                Admitted Evidence, Seized Weapons &amp; Exhibits Ledger
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">
              {caseItem.evidence.length} Exhibits · {caseItem.weapons.length} Weapons
            </span>
          </div>

          {/* Weapons Cards if present */}
          {caseItem.weapons.length > 0 && (
            <div className="space-y-2">
              <div className="font-mono text-[10.5px] font-bold text-zinc-500 uppercase">
                Seized Arms, Munitions &amp; Lethal Weapons:
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {caseItem.weapons.map((w) => (
                  <div key={w.id} className="p-3.5 bg-[#FEF3C7] border border-black space-y-1.5 text-xs text-amber-950">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs font-sans">{w.makeModel}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-200 font-mono font-bold text-[10px]">
                        BALLISTICS: {w.ballisticStatus}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] opacity-80">
                      Serial: {w.serialNumber} · Seizure Date: {w.recoveryDate}
                    </div>
                    <div className="text-[11px] border-t border-amber-300/60 pt-1 leading-snug">
                      Recovery Memo: {w.recoveryMemo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admitted Evidence Table */}
          {caseItem.evidence.length > 0 ? (
            <div className="border border-black overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F2EDE0] border-b border-black font-mono font-bold text-[10.5px] uppercase">
                    <th className="p-2.5 border-r border-black w-24">Ex. Code</th>
                    <th className="p-2.5 border-r border-black">Exhibit Title &amp; Description</th>
                    <th className="p-2.5 border-r border-black w-28">Classification</th>
                    <th className="p-2.5 border-r border-black w-28">Lab Status</th>
                    <th className="p-2.5 w-24">Admission</th>
                  </tr>
                </thead>
                <tbody>
                  {caseItem.evidence.map((ev) => (
                    <tr key={ev.id} className="border-b border-black/10 last:border-none hover:bg-zinc-50">
                      <td className="p-2.5 border-r border-black/10 font-mono font-black text-[#FF5C5C]">
                        {ev.code}
                      </td>
                      <td className="p-2.5 border-r border-black/10">
                        <div className="font-bold text-black">{ev.title}</div>
                        <div className="text-[11px] text-zinc-600 mt-0.5">{ev.detail}</div>
                      </td>
                      <td className="p-2.5 border-r border-black/10 font-mono text-[11px]">
                        {ev.kind}
                      </td>
                      <td className="p-2.5 border-r border-black/10">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 font-mono font-bold text-[10px] uppercase">
                          {ev.labStatus}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-[10px] uppercase">
                          {ev.admission}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-white border border-black/10 text-center text-xs text-zinc-500 font-mono">
              No formal evidence exhibits marked on record yet.
            </div>
          )}
        </div>

        {/* Section 5: Record of Court Hearings & Daily Proceedings */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-black">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#FF5C5C]">SECTION 05.</span>
              <h3 className="font-black text-sm uppercase tracking-wider text-black">
                Hearing History &amp; Daily Order Transcripts
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">
              {caseItem.hearings.length} Recorded Proceedings
            </span>
          </div>

          <div className="border border-black bg-white divide-y divide-black/10">
            {caseItem.hearings.map((h, i) => (
              <div key={h.id || i} className="p-3.5 text-xs flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-black">{h.date}</span>
                    <span className="text-zinc-400 font-mono">({h.time})</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold text-[10.5px]">
                      {h.stage}
                    </span>
                  </div>
                  <div className="text-zinc-700 text-[11.5px] leading-relaxed">
                    {h.benchNotes || 'Routine calling. Matter adjourned per court instructions.'}
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-zinc-500">
                  <div className="font-bold text-black">{h.courtHall || 'Hall 04'}</div>
                  <div className="text-[10px]">{h.judge || caseItem.judge}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Verified Document Repository Checklist */}
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-black">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs text-[#FF5C5C]">SECTION 06.</span>
              <h3 className="font-black text-sm uppercase tracking-wider text-black">
                Court Docket &amp; Document Checklist Registry
              </h3>
            </div>
            <span className="font-mono text-[11px] text-zinc-500 font-semibold">
              Certified Repository
            </span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: 'First Information Report (FIR)', ok: true },
              { name: 'Police Chargesheet (Sec 173 CrPC)', ok: true },
              { name: 'Witness Statements (Sec 161/180)', ok: true },
              { name: 'Seizure Mahazar / Property Memo', ok: true },
              { name: 'Forensic Ballistic / FSL Report', ok: caseItem.weapons.length > 0 },
              { name: 'Medico-Legal Post-Mortem Report', ok: caseItem.victims.total > 0 },
              { name: 'Previous Daily Interim Orders', ok: true },
              { name: 'Relevant Precedents & Citations', ok: true },
            ].map((d, idx) => (
              <div key={idx} className="p-2.5 bg-white border border-black/15 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] font-medium text-zinc-800 leading-tight truncate">{d.name}</span>
                {d.ok ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 font-bold shrink-0">N/A</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Formal Judicial Attestation, Seal & Verification Block */}
        <div className="pt-8 border-t-2 border-black/80 space-y-6">
          <div className="grid md:grid-cols-3 gap-6 text-xs font-sans">
            <div className="space-y-1">
              <div className="font-mono font-bold text-[10px] uppercase text-zinc-500">Document Authenticity Stamp</div>
              <div className="font-mono font-black text-xs text-black">
                DIGITALLY CERTIFIED COPY
              </div>
              <div className="text-[10.5px] text-zinc-500 font-mono">
                Extracted from the Central Server of the District Court under Information Technology Act 2000.
              </div>
            </div>

            <div className="flex flex-col items-center text-center justify-center space-y-1">
              <div className="size-16 rounded-full border-2 border-dashed border-black/40 flex items-center justify-center text-zinc-400">
                <Gavel className="size-6 text-zinc-600" />
              </div>
              <span className="font-mono text-[9.5px] uppercase font-bold tracking-widest text-zinc-500">
                OFFICIAL SEAL OF THE SESSIONS COURT
              </span>
            </div>

            <div className="text-right space-y-1">
              <div className="font-mono font-bold text-[10px] uppercase text-zinc-500">Attesting Officer</div>
              <div className="font-bold text-xs text-black">
                Registrar / Bench Clerk
              </div>
              <div className="text-[11px] text-zinc-600">
                Principal Sessions Court · Bench 04
              </div>
              <div className="font-mono text-[10px] text-zinc-400 pt-1">
                Date: {new Date().toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          <div className="text-center font-mono text-[10px] text-zinc-400 border-t border-black/10 pt-3">
            NYAYADESK / MERCY HIGH-SECURITY JUDICIAL AUTOMATION PLATFORM · END OF OFFICIAL CASE DOSSIER
          </div>
        </div>

      </div>
    </div>
  )
}
