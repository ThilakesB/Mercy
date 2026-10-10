import { useState } from 'react'
import {
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { judicialStore, type StatutoryLaw } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Select,
  Tag,
  Th,
  Td,
  useApp,
} from '../ui'

export default function LawReference() {
  const { toast } = useApp()
  const laws = judicialStore.getStatutoryLaws()
  const cases = judicialStore.getCases()

  const [searchLaw, setSearchLaw] = useState('')
  const [selectedLawId, setSelectedLawId] = useState<string>(laws[0]?.id || '')

  // AI Law Applicability state
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '')
  const [customFacts, setCustomFacts] = useState<string>(
    'The prosecution alleges that during a planned robbery on 03 Feb 2025, accused brandished an unlicensed 9mm country-made pistol to intimidate store staff, after which the weapon was recovered from shrubbery on his confidential disclosure under Section 27.'
  )
  const [applicabilityResult, setApplicabilityResult] = useState<any>(null)
  const [isRunningAI, setIsRunningAI] = useState(false)

  const activeLaw = laws.find((l) => l.id === selectedLawId) || laws[0]

  const filteredLaws = laws.filter((l) => {
    const q = searchLaw.trim().toLowerCase()
    if (!q) return true
    return (
      l.section.toLowerCase().includes(q) ||
      l.actName.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    )
  })

  const handleRunApplicabilityCheck = () => {
    setIsRunningAI(true)
    setTimeout(() => {
      const result = judicialStore.checkLawApplicability(
        activeLaw.section,
        customFacts
      )
      setApplicabilityResult(result)
      setIsRunningAI(false)
      toast(`AI evaluated applicability for ${activeLaw.section}`, 'ok')
    }, 400)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authoritative Statutory Law Reference & AI Applicability"
        sub="Search codified statutes, legal ingredients, and sentencing guidelines. Use AI to verify whether case facts fulfill statutory elements and retrieve binding case law."
        actions={
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold">
            <Sparkles className="size-3 text-emerald-600" />
            AI Statutory Verification Active
          </span>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1.8fr]">
        {/* Left Column: Statutory Directory & Search */}
        <div className="space-y-4">
          <Card className="p-4 bg-white">
            <div className="relative mb-3.5">
              <Search className="pointer-events-none absolute left-4.5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchLaw}
                onChange={(e) => setSearchLaw(e.target.value)}
                placeholder="Search statute or section (e.g. 103 BNS, 25 Arms, 35 POCSO)..."
                className="pl-12 pr-5 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
              />
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredLaws.map((law) => {
                const isSelected = law.id === selectedLawId
                return (
                  <button
                    key={law.id}
                    type="button"
                    onClick={() => {
                      setSelectedLawId(law.id)
                      setApplicabilityResult(null)
                    }}
                    className={`w-full p-4 text-left rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black bg-[#F7F4EB] shadow-xs'
                        : 'border-black/[0.05] bg-white hover:bg-[#F7F4EB]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-[#FF5C5C]">
                        {law.section}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                        {law.actCode}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-zinc-900 mt-1">
                      {law.title}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {law.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Law Detail + AI Applicability Tester */}
        <div className="space-y-6">
          {/* Law Card */}
          <Card className="bg-white p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5C5C]">
                  {activeLaw.actName}
                </span>
                <h2 className="font-black text-base text-zinc-900 mt-0.5">
                  {activeLaw.section}: {activeLaw.title}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold">
                Statutory Code
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-1.5">
                  Official Statutory Text:
                </span>
                <p className="bg-[#F7F4EB] p-4 rounded-2xl border border-black/[0.04] text-zinc-800 leading-relaxed font-medium">
                  "{activeLaw.description}"
                </p>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-1.5">
                  Sentencing Guideline / Statutory Range:
                </span>
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/50 text-rose-900 font-bold">
                  {activeLaw.punishmentGuide}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-2">
                  Essential Ingredients to be Proven:
                </span>
                <div className="grid gap-2">
                  {activeLaw.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-black/[0.04]">
                      <span className="size-5 rounded-full bg-[#121316] text-white text-[10px] font-bold grid place-items-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-zinc-800 font-medium">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-2">
                  Related Landmark Precedents:
                </span>
                <div className="space-y-2.5">
                  {activeLaw.precedents.map((p, idx) => (
                    <div key={idx} className="border border-black/[0.05] bg-[#F7F4EB]/70 p-3.5 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 text-xs">{p.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white text-[#FF5C5C] border border-black/[0.05]">
                          {p.citation}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                        {p.principle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* AI Applicability Testing Engine */}
          <Card className="bg-white p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#FEF08A] text-amber-950 grid place-items-center">
                  <Sparkles className="size-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    AI Statutory Applicability Verification
                  </h3>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Testing against: <span className="text-[#FF5C5C] font-bold">{activeLaw.section}</span>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-bold">
                AI Evaluator
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-1.5">
                  Case Facts / Police Charge Sheet Narrative to Test:
                </span>
                <textarea
                  rows={4}
                  value={customFacts}
                  onChange={(e) => setCustomFacts(e.target.value)}
                  className="w-full border border-black/[0.08] bg-[#FAF8F5] p-3.5 rounded-2xl font-sans text-xs text-zinc-900 focus:outline-none focus:border-black leading-relaxed"
                  placeholder="Paste charge sheet allegations, weapon seizure details, or witness summaries..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500">Or autofill from case:</span>
                  <select
                    className="border border-black/[0.08] bg-white px-3 py-1.5 rounded-full text-xs font-medium"
                    onChange={(e) => {
                      const c = cases.find((x) => x.id === e.target.value)
                      if (c) {
                        setCustomFacts(
                          `Case ${c.number}: ${c.title}. Lead IO: ${c.io.name}. Offense occurred under FIR ${c.fir.no}. Weapons seized: ${c.weapons.map((w) => w.makeModel).join(', ') || 'None'}. Evidence submitted: ${c.evidence.map((ev) => ev.title).join('; ')}.`
                        )
                      }
                    }}
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.number}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRunApplicabilityCheck}
                  disabled={isRunningAI}
                  className="px-5 py-2.5 rounded-full bg-[#121316] text-white hover:bg-zinc-800 disabled:opacity-50 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {isRunningAI ? 'Evaluating Elements...' : 'Run AI Applicability Check'}
                </button>
              </div>

              {/* Applicability Output */}
              {applicabilityResult && (
                <div className="mt-5 p-5 rounded-3xl bg-[#F7F4EB] border border-black/[0.06] space-y-4">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-black/[0.05]">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-900">
                      Statutory Ingredients Compliance
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      {applicabilityResult.overallApplicabilityScore}% Satisfied
                    </span>
                  </div>

                  <p className="p-3.5 rounded-2xl bg-white border border-black/[0.04] font-semibold text-zinc-800 text-xs leading-relaxed">
                    {applicabilityResult.recommendation}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[10.5px] text-zinc-400 uppercase font-bold tracking-wider block">
                      Ingredient Breakdown:
                    </span>
                    {applicabilityResult.matchedIngredients.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white border border-black/[0.04]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 text-xs">
                            {m.ingredient}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              m.isMet
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.isMet ? 'Substantiated' : 'Requires Proof'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          {m.rationale}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/50 text-amber-900 text-[11px] flex items-center gap-2">
                    <ShieldAlert className="size-4 shrink-0 text-amber-600" />
                    <span>Algorithmic aid for statutory testing. Requires presiding judge's independent verification.</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
