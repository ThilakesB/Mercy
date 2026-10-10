import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import {
  Sparkles,
  Search,
  BookOpen,
  Scale,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Pin,
  Bot,
  User,
  ArrowRight,
} from 'lucide-react'
import { judicialStore, type FullCaseRecord } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Tag,
  Select,
  useApp,
} from '../ui'

interface ChatMessage {
  id: string
  sender: 'judge' | 'copilot'
  text: string
  timestamp: string
  precedents?: {
    title: string
    citation: string
    court: string
    date: string
    bench: string
    ratioDecidendi: string
    pinpoint: string
    similarityScore: number
  }[]
}

export default function Research() {
  const { toast } = useApp()
  const [searchParams] = useSearchParams()
  const initialCaseId = searchParams.get('case') || ''

  const cases = judicialStore.getCases()

  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId || cases[0]?.id || ''
  )
  const [queryInput, setQueryInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [copiedCite, setCopiedCite] = useState<string | null>(null)

  const activeCase = cases.find((c) => c.id === selectedCaseId)

  // Dialogue Thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'copilot',
      text: 'Greetings, Your Honor. Judicial Precedent Copilot initialized with RAG telemetry. Authoritative indices: Supreme Court Reports (1950-2026), High Court Gazettes, Bharatiya Nyaya Sanhita, Arms Act, and POCSO repository.',
      timestamp: '09:00 AM',
    },
  ])

  // Context pre-fill when active case changes
  useEffect(() => {
    if (activeCase) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-seed-${Date.now()}`,
          sender: 'copilot',
          text: `Active Case Context Locked: [${activeCase.number} // ${activeCase.title}]. Statutory provisions: ${activeCase.acts.join(', ')}. Inquire regarding evidentiary admissibility, recovery memos under Sec. 27, or sentencing parity.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [selectedCaseId])

  const handleSendQuery = (customPrompt?: string) => {
    const q = (customPrompt || queryInput).trim()
    if (!q) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'judge',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setQueryInput('')
    setIsSearching(true)

    setTimeout(() => {
      const caseContext = activeCase
        ? `${activeCase.number} ${activeCase.acts.join(' ')} ${activeCase.weapons.map((w) => w.makeModel).join(' ')}`
        : ''

      const searchResult = judicialStore.searchPrecedents(q, caseContext)

      const copilotMsg: ChatMessage = {
        id: `cpl-${Date.now()}`,
        sender: 'copilot',
        text: searchResult.summaryText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        precedents: searchResult.results,
      }

      setMessages((prev) => [...prev, copilotMsg])
      setIsSearching(false)
    }, 450)
  }

  const handleCopyCitation = (cite: string) => {
    navigator.clipboard?.writeText(cite)
    setCopiedCite(cite)
    toast(`Copied citation: ${cite}`, 'ok')
    setTimeout(() => setCopiedCite(null), 2500)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Similar Cases & Legal Research (AI Copilot)"
        sub="Retrieval-Augmented Precedent Search engine. Discovers authoritative binding appellate rulings and applicable law across verified statutory repositories to assist judicial decision-making."
        actions={
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold">
            <Sparkles className="size-3 text-emerald-600" />
            Canonical RAG Engine Online
          </span>
        }
      />

      {/* Mandatory Statutory Notice Banner */}
      <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200/70 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs">
          <span className="font-extrabold uppercase tracking-wide text-amber-900 block mb-0.5">
            Mandatory Judicial Notice
          </span>
          <p className="text-amber-800/90 leading-relaxed">
            AI output is an algorithmic research aid to discover relevant authorities. AI output supports, and does NOT replace, independent judicial judgment. The presiding judge must independently verify original primary statutory texts and law reporters before delivering judgment.
          </p>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_2.5fr]">
        {/* Left Column: Context Configuration */}
        <div className="space-y-5">
          <Card className="p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-900">
                Active Case Context
              </span>
              <span className="text-[10.5px] font-bold text-[#FF5C5C] bg-[#FF5C5C]/10 px-2 py-0.5 rounded-full">
                Locked
              </span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-500 font-bold block mb-1.5">
                Select Case Docket:
              </label>
              <Select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full text-xs rounded-full"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number} — {c.title.slice(0, 36)}
                  </option>
                ))}
              </Select>
            </div>

            {activeCase && (
              <div className="bg-[#F7F4EB] p-4 rounded-2xl border border-black/[0.04] space-y-2 text-xs">
                <div className="font-black text-sm text-zinc-900">{activeCase.number}</div>
                <div className="text-zinc-700 font-medium">{activeCase.title}</div>
                <div className="pt-2 border-t border-black/[0.05] flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-white text-zinc-700 font-semibold border border-black/[0.04]">
                    Stage: {activeCase.stage}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-zinc-700 font-semibold border border-black/[0.04]">
                    {activeCase.acts.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3.5 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.05]">
              <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-900">
                Suggested Prompts
              </span>
              <span className="text-[11px] text-zinc-400">Templates</span>
            </div>

            <div className="space-y-2">
              {[
                'Can conviction stand solely on circumstantial ballistics without direct eyewitnesses?',
                'Recovery under Section 27 when independent mahazar witnesses turn hostile',
                'Aggravated robbery Section 309: does brandishing satisfy "uses deadly weapon"?',
                'POCSO Section 35: limitation compliance and child examination in-camera guidelines',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendQuery(prompt)}
                  className="w-full text-left p-3 rounded-2xl bg-[#F7F4EB]/80 hover:bg-[#FEF08A]/50 border border-black/[0.04] hover:border-black/[0.1] transition-all text-xs font-medium text-zinc-800 leading-snug cursor-pointer group flex items-start gap-2"
                >
                  <ArrowRight className="size-3.5 text-[#FF5C5C] shrink-0 mt-0.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive Chatbot & Precedent Cards */}
        <div>
          <Card className="flex flex-col h-[750px] bg-white overflow-hidden">
            {/* Header */}
            <div className="border-b border-black/[0.06] bg-[#F7F4EB]/60 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#121316] text-white grid place-items-center">
                  <Bot className="size-4 text-[#FF5C5C]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Precedent Copilot // Dialogue Terminal
                  </h3>
                  <div className="text-[11px] text-zinc-500 font-medium">
                    Supreme Court &amp; High Court Vector Indices (42,000+ Rulings)
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[10.5px] font-bold">
                Connected
              </span>
            </div>

            {/* Chat Thread Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FAF8F5]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'judge' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl p-4.5 rounded-3xl ${
                      msg.sender === 'judge'
                        ? 'bg-[#121316] text-white rounded-br-sm shadow-sm'
                        : 'bg-white text-zinc-900 rounded-bl-sm shadow-xs border border-black/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[11px] pb-2 mb-2 border-b border-black/[0.06]">
                      <span className={`font-extrabold uppercase tracking-wide ${msg.sender === 'judge' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {msg.sender === 'judge' ? 'Hon. Presiding Judge' : 'Judicial Copilot'}
                      </span>
                      <span className={msg.sender === 'judge' ? 'text-zinc-400' : 'text-zinc-400'}>
                        {msg.timestamp}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed whitespace-pre-wrap font-sans ${msg.sender === 'judge' ? 'font-normal' : 'font-medium'}`}>
                      {msg.text}
                    </p>

                    {/* Render Structured Precedent Cards if available */}
                    {msg.precedents && (
                      <div className="mt-4 pt-3.5 border-t border-black/[0.06] space-y-3">
                        <div className="text-[11px] uppercase font-black tracking-wider text-[#FF5C5C] flex items-center gap-1.5">
                          <BookOpen className="size-3.5" />
                          Matched Binding Precedents:
                        </div>

                        {msg.precedents.map((p, idx) => (
                          <div
                            key={idx}
                            className="rounded-2xl border border-black/[0.06] bg-[#F7F4EB]/80 p-3.5 space-y-2.5 text-zinc-900 hover:shadow-xs transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-extrabold text-xs text-zinc-900">
                                  {p.title}
                                </h4>
                                <div className="text-[11px] font-bold text-[#FF5C5C]">
                                  {p.citation} · {p.court}
                                </div>
                                <div className="text-[10.5px] text-zinc-500 font-medium">
                                  {p.bench} ({p.date})
                                </div>
                              </div>

                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-black shrink-0">
                                {p.similarityScore}% Match
                              </span>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-black/[0.04] text-xs">
                              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                                Ratio Decidendi:
                              </span>
                              <p className="leading-relaxed text-zinc-800 font-medium italic">
                                "{p.ratioDecidendi}"
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                              <span className="font-medium">Pinpoint: {p.pinpoint}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyCitation(p.citation)}
                                  className="px-3 py-1 rounded-full bg-white hover:bg-zinc-100 text-zinc-800 border border-black/[0.08] text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                                >
                                  {copiedCite === p.citation ? (
                                    <>
                                      <Check className="size-3 text-emerald-600" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-3" />
                                      Copy Cite
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toast(`Pinned authority "${p.title}" to active draft judgment`, 'ok')
                                  }
                                  className="px-3 py-1 rounded-full bg-[#121316] hover:bg-zinc-800 text-white text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 transition-colors"
                                >
                                  <Pin className="size-3" />
                                  Pin to Draft
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSearching && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-black/[0.06] text-xs text-zinc-600 max-w-md shadow-xs">
                  <Sparkles className="size-4 animate-spin text-[#FF5C5C]" />
                  <span className="font-medium">Scanning Supreme Court Reports &amp; statutory vector corpus...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-black/[0.06] bg-white p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendQuery()
                }}
                className="flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <Input
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="Ask a legal research question or inquire about statutory precedent..."
                    className="w-full text-sm font-semibold rounded-full pl-5 pr-12 h-13 border-black/10 focus:border-black"
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !queryInput.trim()}
                  className="size-13 rounded-full bg-[#121316] text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#121316] grid place-items-center transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Send className="size-5 text-white" />
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
