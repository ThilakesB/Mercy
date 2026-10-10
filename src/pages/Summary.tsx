import { useRef, useState } from 'react'
import { FileUp, RotateCcw, UploadCloud, FileText } from 'lucide-react'
import type { Src } from '../data'
import { AIBadge, Button, Card, CardHeader, Citation, cn, PageHeader, useApp } from '../ui'

const s = (doc: string, page: number): Src => ({ doc, page })
const result = (doc: string) => ({
  facts: [
    [
      "On 03 Feb 2025 at about 18:40, three persons are alleged to have entered the complainant's jewellery store.",
      s(doc, 4),
    ],
    [
      'The complainant states one person held a pistol; gold ornaments valued at Rs. 14.2 lakh were taken.',
      s(doc, 5),
    ],
    [
      'A country-made pistol was recovered on 09 Feb 2025 on the disclosure of Accused 1.',
      s(doc, 12),
    ],
  ],
  claims: [
    [
      'Prosecution: the accused acted in concert and were identified on CCTV footage.',
      s(doc, 18),
    ],
    [
      'Defence: the identification is doubtful and the CCTV was not certified under s.63 BSA.',
      s(doc, 41),
    ],
  ],
  dates: [
    ['03 Feb 2025', 'Alleged Offence at Jewellery Store', s(doc, 4)],
    ['09 Feb 2025', 'Arrest of Accused 1 & Recovery', s(doc, 12)],
    ['02 May 2025', 'Chargesheet filed by IO', s(doc, 2)],
  ],
  issues: [
    ['Whether the CCTV transcript is admissible without a s.63 BSA certificate.', s(doc, 41)],
    ['Whether the disclosure recovery of the firearm is proved under s.23 BSA.', s(doc, 12)],
  ],
  evidence: [
    ['CCTV transcript and DVR extract (2 min 14 s)', s(doc, 22)],
    ['Ballistic report on country-made firearm (awaited)', s(doc, 30)],
    ['Section 180 BNSS statement of shop owner PW-1', s(doc, 8)],
  ],
})

type Pairs = (string | Src)[][]

function Block({ n, title, items }: { n: string; title: string; items: Pairs }) {
  return (
    <Card>
      <CardHeader num={n} title={title} action={<AIBadge />} />
      <ul className="divide-y divide-border/60">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5 text-xs hover:bg-white/[0.02]"
          >
            <span className="flex-1 leading-relaxed text-foreground">
              {it.length === 3 ? (
                <>
                  <span className="font-mono text-[11px] text-accent font-medium">
                    {it[0] as string}
                  </span>{' '}
                  · {it[1] as string}
                </>
              ) : (
                (it[0] as string)
              )}
            </span>
            <Citation src={it[it.length - 1] as Src} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Summary() {
  const [drag, setDrag] = useState(false)
  const [file, setFile] = useState<string | null>(null)
  const [pct, setPct] = useState(0)
  const [err, setErr] = useState('')
  const inp = useRef<HTMLInputElement>(null)
  const { toast } = useApp()

  const start = (f?: File) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf'))
      return setErr(`"${f.name}" is not a PDF. Please upload an official PDF case file.`)
    setErr('')
    setFile(f.name)
    setPct(0)
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(t)
          toast('Digest synthesized. All statements cross-referenced to page numbers.', 'info')
          return 100
        }
        return p + 20
      })
    }, 200)
  }

  const reset = () => {
    setFile(null)
    setPct(0)
    if (inp.current) inp.current.value = ''
  }

  const r = result(file ?? 'Case_Chargesheet_214.pdf')

  return (
    <>
      <PageHeader
        title="AI Case Record Digest"
        sub="Synthesizes chargesheets, petitions, and evidence into structured facts, points for determination, and source citations."
        actions={
          file && (
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-3.5" /> Reset Document
            </Button>
          )
        }
      />

      {/* Upload Zone */}
      <Card
        className={cn(
          'mb-6 p-6 transition-colors',
          drag ? 'border-accent bg-accent/5' : 'border-dashed border-border',
        )}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault()
          setDrag(false)
          start(e.dataTransfer.files[0])
        }}
      >
        <div className="grid place-items-center text-center">
          <input
            ref={inp}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => start(e.target.files?.[0])}
          />
          <div className="mb-3 grid size-10 place-items-center rounded-lg border border-border bg-[#10131a] text-accent">
            <UploadCloud className="size-5" />
          </div>
          <h2 className="font-serif text-base font-semibold text-foreground">
            {file ? file : 'Drop Official Court PDF or Select Document'}
          </h2>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Upload chargesheets, plaints, or witness depositories. PDF up to 60 MB. Processed on secure judicial server.
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => inp.current?.click()}>
              <FileUp className="size-3.5" /> Browse Court File
            </Button>
          </div>
          {err && (
            <p role="alert" className="mt-2 text-xs text-bad">
              {err}
            </p>
          )}
        </div>

        {file && pct < 100 && (
          <div className="mt-5 max-w-md mx-auto">
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground mb-1">
              <span>Synthesizing legal entities & timeline...</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-accent transition-all duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Digest Blocks */}
      <div className="space-y-6">
        <Block n="01" title="Admitted & Material Facts" items={r.facts} />
        <Block n="02" title="Competing Claims & Submissions" items={r.claims} />
        <Block n="03" title="Chronology of Material Dates" items={r.dates} />
        <Block n="04" title="Issues for Judicial Determination" items={r.issues} />
        <Block n="05" title="Material Exhibits Cited in Digest" items={r.evidence} />
      </div>
    </>
  )
}
