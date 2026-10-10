import { useState } from 'react'
import { BookOpenText, Search, Sparkles } from 'lucide-react'
import { Button, Card, Citation, Input, PageHeader, Tag, useApp } from '../ui'

const results = [
  {
    title: 'Lalita Kumari v. Govt. of Uttar Pradesh',
    cite: '(2014) 2 SCC 1',
    bench: 'Constitution Bench (5 Judges)',
    note: 'Registration of FIR is mandatory under Section 154 of the Code if the information discloses commission of a cognizable offence.',
    src: { doc: 'SCC_2014_2_SCC_1.pdf', page: 33 },
  },
  {
    title: 'Satender Kumar Antil v. CBI',
    cite: '(2022) 10 SCC 51',
    bench: 'Supreme Court of India',
    note: 'Guidelines on bail and categorization of offences into Categories A, B, C and D with strict timelines for remand compliance.',
    src: { doc: 'SCC_2022_10_SCC_51.pdf', page: 62 },
  },
  {
    title: 'Protection of Children from Sexual Offences Act, 2012 - Section 35',
    cite: 'Central Act 32 of 2012',
    bench: 'Statutory Limitation Code',
    note: 'Evidence of the child shall be recorded within a period of thirty days of the Special Court taking cognizance; trial shall be completed within one year.',
    src: { doc: 'POCSO_Act_2012.pdf', page: 14 },
  },
]

export default function Research() {
  const [q, setQ] = useState('')
  const [show, setShow] = useState(false)
  const { toast } = useApp()

  return (
    <>
      <PageHeader
        title="Statutory & Case Law Research"
        sub="Search verified Supreme Court and High Court precedents. All citations are checked against canonical reporters."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded border border-border bg-[#141720] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-accent" />
            Registry Phase III Module
          </span>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setShow(!!q.trim())
          if (!q.trim()) toast('Enter a search query', 'info')
        }}
        className="mb-6 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8.5"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search judgments or sections (e.g. Lalita Kumari FIR, Section 35 POCSO, Section 63 BSA)"
            aria-label="Search laws and judgments"
          />
        </div>
        <Button type="submit">Search Precedents</Button>
      </form>

      {!show ? (
        <Card className="grid place-items-center px-6 py-16 text-center">
          <div className="mb-3 grid size-10 place-items-center rounded-lg border border-border bg-[#10131a] text-accent">
            <BookOpenText className="size-5" />
          </div>
          <h2 className="font-serif text-base font-semibold text-foreground">
            Canonical Judicial Research Engine
          </h2>
          <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            Search landmark rulings and statutory provisions. Type keywords above to preview
            structured precedents with paragraph citations.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="font-mono text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Verified Precedents Matching Query</span>
            <span>{results.length} authorities found</span>
          </div>

          <ul className="space-y-3">
            {results.map((r) => (
              <Card key={r.title} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-sm font-semibold text-foreground">{r.title}</h3>
                  <Tag className="font-mono text-[11px]">{r.cite}</Tag>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{r.bench}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.note}</p>
                <div className="mt-3.5 border-t border-border/60 pt-3">
                  <Citation src={r.src} />
                </div>
              </Card>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
