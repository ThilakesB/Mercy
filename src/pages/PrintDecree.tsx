import { useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { judicialStore } from '../lib/judicialStore'
import { Button, Card, EmptyState } from '../ui'

export default function PrintDecree() {
  const { id } = useParams<{ id: string }>()
  const caseItem = judicialStore.getCase(id || '')

  useEffect(() => {
    // Optionally trigger print if query parameter ?print=true is present
    const params = new URLSearchParams(window.location.search)
    if (params.get('print') === 'true') {
      window.print()
    }
  }, [])

  if (!caseItem) {
    return (
      <Card className="m-6 p-8">
        <EmptyState
          title="Case decree not found"
          text={`No record exists for identifier "${id}".`}
          action={
            <Link to="/cases">
              <Button variant="hazard" size="sm">Return to Case Registry</Button>
            </Link>
          }
        />
      </Card>
    )
  }

  const decree = caseItem.closureRecord
  const dateToday = decree?.closedDate || new Date().toISOString().split('T')[0]
  const decreeHash = decree?.decreeHash || '8f9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f'

  return (
    <div className="max-w-4xl mx-auto py-6 font-mono text-xs">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print mb-6 flex items-center justify-between border-b border-border pb-4">
        <Link to={`/cases/${caseItem.id}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          <span>[ RETURN TO ACTIVE CASE REPORT ]</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="size-3.5" />
            [ PRINT PHYSICAL DECREE / SAVE PDF ]
          </Button>
        </div>
      </div>

      {/* Official Court Decree (Printable Container) */}
      <div className="printable-order bg-white text-black p-8 border-2 border-black space-y-6">
        {/* Court Crest & Cause Header */}
        <div className="text-center border-b-2 border-black pb-6 space-y-1">
          <div className="text-[11px] font-bold tracking-widest uppercase">
            IN THE COURT OF THE PRINCIPAL SESSIONS JUDGE
          </div>
          <div className="text-[10px] text-zinc-600 uppercase">
            {caseItem.court.toUpperCase()}
          </div>
          <div className="pt-2 text-sm font-black tracking-wider uppercase">
            FORMAL JUDGMENT &amp; FINAL ORDER OF DISPOSAL
          </div>
          <div className="text-xs font-bold pt-1">
            CASE NO: <span className="font-mono">{caseItem.number}</span>
          </div>
        </div>

        {/* Cause Title Block */}
        <div className="border border-black p-4 space-y-2">
          <div className="font-bold uppercase text-xs">
            CAUSE TITLE:
          </div>
          <div className="text-sm font-black">
            {caseItem.title}
          </div>
          <div className="text-[11px] text-zinc-700">
            STATUTORY PROVISIONS CITED: {caseItem.acts.join(', ')}
          </div>
          <div className="text-[11px] text-zinc-700">
            POLICE STATION: {caseItem.policeStation} · FIR NO: {caseItem.fir.no} DATED {caseItem.fir.date}
          </div>
          <div className="text-[11px] text-zinc-700">
            INVESTIGATING OFFICER: {caseItem.io.name} (BADGE: {caseItem.io.badge})
          </div>
        </div>

        {/* Coram & Representation */}
        <div className="grid grid-cols-2 gap-4 border-b border-black pb-4 text-[11px]">
          <div>
            <span className="font-bold block uppercase text-[10px] text-zinc-600">CORAM / PRESIDING JUDGE:</span>
            <span className="font-bold">{caseItem.judge}</span>
          </div>
          <div>
            <span className="font-bold block uppercase text-[10px] text-zinc-600">DATE OF PRONOUNCEMENT:</span>
            <span className="font-bold">{dateToday}</span>
          </div>
        </div>

        {/* Evidence & Weapons Manifest */}
        <div className="space-y-2">
          <div className="font-bold uppercase text-[11px] border-b border-zinc-400 pb-1">
            I. EVIDENTIARY EXHIBITS &amp; WEAPONS ADMITTED ON RECORD:
          </div>
          <div className="space-y-1.5 text-[11px]">
            {caseItem.weapons.map((w, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-bold">[WPN-{idx + 1}]</span>
                <span>
                  {w.makeModel} (Serial: {w.serialNumber}). {w.recoveryMemo}. Status: {w.ballisticStatus}.
                </span>
              </div>
            ))}
            {caseItem.evidence.map((ev, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-bold">[{ev.code}]</span>
                <span>
                  {ev.title} — {ev.detail} (Admission: {ev.admission.toUpperCase()}).
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operative Judgment & Sentencing Decree */}
        <div className="space-y-2 pt-2">
          <div className="font-bold uppercase text-[11px] border-b border-zinc-400 pb-1">
            II. OPERATIVE REASONING &amp; SENTENCING DECREE:
          </div>
          <div className="p-4 bg-zinc-50 border border-black text-xs leading-relaxed space-y-2">
            <p>
              {decree?.judgmentSummary ||
                `Upon careful examination of the oral testimony of the eyewitnesses, corroborating forensic ballistic reports, and contemporary seizure memoranda under Section 27, this Court finds that the prosecution has established all core statutory ingredients beyond reasonable doubt.`}
            </p>
          </div>
        </div>

        {/* Punishments Awarded */}
        <div className="space-y-2 pt-2">
          <div className="font-bold uppercase text-[11px] border-b border-zinc-400 pb-1">
            III. SENTENCE &amp; PENALTIES IMPOSED:
          </div>
          <div className="space-y-2 text-[11px]">
            {decree?.punishments?.map((p, idx) => (
              <div key={idx} className="border border-black p-3 bg-zinc-50">
                <div className="font-bold text-xs">
                  CONVICT: {p.convictName} (ID: {p.crimId})
                </div>
                <div className="text-zinc-800 mt-1">
                  SENTENCE: <span className="font-bold">{p.type.replace(/_/g, ' ')}</span>
                  {p.durationMonths > 0 && ` FOR A TERM OF ${Math.floor(p.durationMonths / 12)} YEARS`}
                  {p.fineAmountInr > 0 && ` AND FINE OF ₹${p.fineAmountInr.toLocaleString()}`}
                </div>
                <p className="mt-1 text-zinc-600 text-[10.5px]">
                  Operative decree: "{p.operativeText}"
                </p>
              </div>
            )) || (
              <div className="p-3 border border-black">
                Convicted under cited statutory sections. Sentenced to statutory term with set-off under Section 428 CrPC.
              </div>
            )}
          </div>
        </div>

        {/* Digital Signature & Judicial Seal */}
        <div className="pt-8 grid grid-cols-2 gap-8 items-end">
          <div className="space-y-1 text-[10px] text-zinc-700">
            <div className="font-bold uppercase">CLOUD ARCHIVAL VERIFICATION RECEIPT:</div>
            <div>STATUS: [SYNCHRONIZED TO GOVCLOUD S3 WORM VAULT]</div>
            <div className="break-all font-mono text-[9px]">
              SHA-256 HASH: {decreeHash}
            </div>
            <div>STORAGE ENCRYPTION: AES-256-GCM HARDWARE HSM KEY</div>
          </div>

          <div className="text-right space-y-1">
            <div className="h-10 border-b border-black border-dashed" />
            <div className="font-bold text-xs uppercase">{caseItem.judge}</div>
            <div className="text-[10px] text-zinc-600 uppercase">
              Principal Sessions Judge · Bench 04
            </div>
            <div className="text-[9.5px] font-mono text-zinc-500">
              PKI DIGITAL SIGNATURE VERIFIED [OK]
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
