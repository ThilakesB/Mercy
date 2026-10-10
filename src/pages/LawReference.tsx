import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  Search,
  Sparkles,
  Send,
  Bot,
  User,
  Scale,
  Shield,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Gavel,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react'
import { judicialStore, type StatutoryLaw } from '../lib/judicialStore'
import { sendLegalChatMessage, type ChatMessage } from '../lib/gemini'
import {
  Button,
  Card,
  PageHeader,
  Input,
  useApp,
} from '../ui'

const SUGGESTED_QUERIES = [
  'What are the essential ingredients to prove murder under Section 103 BNS?',
  'Explain statutory bail provisions under Section 479 BNSS, 2023.',
  'What are mandatory in-camera requirements for victim deposition under POCSO?',
  'How does Section 23 of Bharatiya Sakshya Adhiniyam treat police confessions and discovery?',
]

export default function LawReference() {
  const { toast } = useApp()
  const laws = judicialStore.getStatutoryLaws()

  const [searchLaw, setSearchLaw] = useState('')
  const [selectedActFilter, setSelectedActFilter] = useState('ALL')
  const [selectedLawId, setSelectedLawId] = useState<string>(laws[0]?.id || '')
  const [activeTab, setActiveTab] = useState<'ai-chat' | 'statute-details'>('ai-chat')

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Greetings, Hon’ble Bench. I am **Mercy Legal AI**, your authoritative judicial research assistant powered by Google Gemini.\n\nI can assist you with:\n- **Bharatiya Nyaya Sanhita (BNS, 2023)** & IPC comparisons\n- **Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023)** procedural provisions\n- **Bharatiya Sakshya Adhiniyam (BSA, 2023)** rules of evidence\n- **POCSO, NDPS, Arms Act** & special penal statutes\n- Essential ingredients, statutory sentencing guidelines, and landmark Supreme Court precedents.\n\nSelect any section from the registry on the left, or ask any legal query below.',
      timestamp: 'Active',
    },
  ])
  const [inputPrompt, setInputPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const activeLaw = laws.find((l) => l.id === selectedLawId) || laws[0]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isGenerating])

  // Filtered laws list
  const filteredLaws = laws.filter((l) => {
    const q = searchLaw.trim().toLowerCase()
    const matchesAct =
      selectedActFilter === 'ALL' ||
      (selectedActFilter === 'BNS' && l.actCode === 'BNS') ||
      (selectedActFilter === 'BSA' && l.actCode === 'BSA') ||
      (selectedActFilter === 'POCSO' && l.actCode === 'POCSO') ||
      (selectedActFilter === 'ARMS' && l.actCode === 'ARMS')

    if (!matchesAct) return false
    if (!q) return true

    return (
      l.section.toLowerCase().includes(q) ||
      l.actName.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    )
  })

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim()
    if (!prompt || isGenerating) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputPrompt('')
    setIsGenerating(true)
    setActiveTab('ai-chat')

    try {
      const statuteContext = activeLaw
        ? `Statute: ${activeLaw.actName} (${activeLaw.actCode})\nSection: ${activeLaw.section} - ${activeLaw.title}\nOfficial Text: ${activeLaw.description}\nSentencing: ${activeLaw.punishmentGuide}\nIngredients: ${activeLaw.ingredients.join('; ')}`
        : undefined

      const responseText = await sendLegalChatMessage(
        chatMessages.map((m) => ({ role: m.role, content: m.content })),
        prompt,
        statuteContext
      )

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setChatMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Judicial AI Notice:** Unable to reach Gemini API. ${err?.message || 'Please check network connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setChatMessages((prev) => [...prev, errorMsg])
      toast('AI query error', 'bad')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAskAboutSection = (law: StatutoryLaw) => {
    setSelectedLawId(law.id)
    const prompt = `Please provide a thorough judicial analysis of ${law.section} (${law.title}) under ${law.actName}. Explain the essential legal ingredients the prosecution must prove, statutory sentencing guidelines, and relevant landmark Supreme Court precedents.`
    handleSendMessage(prompt)
  }

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast('Legal text copied to clipboard', 'ok')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Session cleared. Ready for your next statutory inquiry, Hon’ble Bench.',
        timestamp: 'Active',
      },
    ])
    toast('Chat transcript reset', 'info')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authoritative Statutory Law Reference & AI Assistant"
        sub="Instant legal reference for codified Indian statutes (BNS, BNSS, BSA, POCSO, Arms Act). Powered by Google Gemini AI for deep statutory ingredient analysis and judicial case inquiries."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold">
              <Sparkles className="size-3 text-emerald-600 animate-pulse" />
              <span>Gemini Legal AI: Active</span>
            </span>
          </div>
        }
      />

      {/* Main Search & Act Filter Toolbar */}
      <Card className="p-4 bg-white shadow-xs space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4.5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchLaw}
            onChange={(e) => setSearchLaw(e.target.value)}
            placeholder="Search statutes, sections, or keywords (e.g. 103 BNS, Murder, 25 Arms, POCSO, Bail, Discovery 23)..."
            className="pl-12 pr-6 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
          />
        </div>

        {/* Act Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
            Act Code:
          </span>
          {[
            { id: 'ALL', label: 'All Codified Statutes' },
            { id: 'BNS', label: 'BNS (Penal, 2023)' },
            { id: 'BSA', label: 'BSA (Evidence, 2023)' },
            { id: 'POCSO', label: 'POCSO (Special Court)' },
            { id: 'ARMS', label: 'Arms Act, 1959' },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setSelectedActFilter(act.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                selectedActFilter === act.id
                  ? 'bg-[#121316] text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </Card>

      {/* 2-Column Split: Left Statute Directory, Right Gemini AI Chatbot & Details */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_1.85fr]">
        {/* Left Column: Statutory Law Index */}
        <div className="space-y-4">
          <Card className="bg-white p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Statute Directory ({filteredLaws.length} Indexed)
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Select a section to analyze or query the AI assistant
                </p>
              </div>
              <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold">
                Bench 04
              </span>
            </div>

            <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
              {filteredLaws.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 space-y-2">
                  <BookOpen className="size-7 mx-auto text-zinc-300" />
                  <p className="font-bold text-zinc-700">No matching statutes found</p>
                  <p className="text-[11px]">Try searching section numbers like "103", "309", or "25".</p>
                </div>
              ) : (
                filteredLaws.map((law) => {
                  const isSelected = law.id === selectedLawId
                  return (
                    <div
                      key={law.id}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'border-[#FF5C5C] bg-[#FF5C5C]/5 shadow-xs ring-1 ring-[#FF5C5C]/40'
                          : 'border-black/[0.05] bg-white hover:bg-zinc-50'
                      }`}
                      onClick={() => setSelectedLawId(law.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#FF5C5C]">
                            {law.section}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                            {law.actCode}
                          </span>
                        </div>

                        {/* Quick Consult AI Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAskAboutSection(law)
                          }}
                          className="px-2 py-1 rounded-full bg-zinc-100 hover:bg-[#121316] hover:text-white text-zinc-700 font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          title="Ask Gemini Legal AI about this section"
                        >
                          <Sparkles className="size-3 text-[#FF5C5C]" />
                          <span>Ask AI</span>
                        </button>
                      </div>

                      <div className="font-bold text-xs text-zinc-900 mt-1">
                        {law.title}
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        {law.description}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Chatbot & Statutory Details */}
        <div className="space-y-4">
          {/* Navigation Tabs (AI Chatbot vs Official Statutory Text) */}
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-black/[0.06] shadow-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('ai-chat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'ai-chat'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Bot className="size-4 text-[#FF5C5C]" />
                <span>Gemini Judicial AI Chatbot</span>
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('statute-details')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'statute-details'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <BookOpen className="size-4 text-amber-600" />
                <span>Statute Provisions ({activeLaw.section})</span>
              </button>
            </div>

            {activeTab === 'ai-chat' && (
              <button
                type="button"
                onClick={handleClearChat}
                className="px-3 py-1.5 rounded-full text-zinc-500 hover:text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Clear chat transcript"
              >
                <RotateCcw className="size-3" />
                <span>Clear Chat</span>
              </button>
            )}
          </div>

          {/* TAB 1: GEMINI LEGAL AI CHATBOT INTERFACE */}
          {activeTab === 'ai-chat' && (
            <Card className="bg-white p-5 flex flex-col h-[700px] shadow-xs">
              {/* Active Statute Awareness Banner */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 mb-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-500 font-medium">Context Statute:</span>
                  <span className="font-bold text-zinc-900">
                    {activeLaw.section} · {activeLaw.title} ({activeLaw.actCode})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAskAboutSection(activeLaw)}
                  className="text-[11px] font-bold text-[#FF5C5C] hover:underline cursor-pointer"
                >
                  Analyze Ingredients →
                </button>
              </div>

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`size-8 rounded-full grid place-items-center shrink-0 font-bold text-xs shadow-xs ${
                          isUser
                            ? 'bg-[#121316] text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                          isUser
                            ? 'bg-[#121316] text-white rounded-tr-xs'
                            : 'bg-[#F7F4EB] text-zinc-900 border border-black/[0.04] rounded-tl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 border-b border-current/10 pb-1 mb-1">
                          <span className="font-bold">
                            {isUser ? 'Hon. Judge' : 'Mercy Legal AI (Gemini 2.5 Flash)'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span>{msg.timestamp}</span>
                            {!isUser && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.content, msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-[#FF5C5C] cursor-pointer"
                                title="Copy legal text"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="whitespace-pre-wrap font-sans text-xs sm:text-[12.5px] leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isGenerating && (
                  <div className="flex items-start gap-2.5">
                    <div className="size-8 rounded-full bg-emerald-600 text-white grid place-items-center shrink-0 shadow-xs">
                      <Bot className="size-4 animate-spin" />
                    </div>
                    <div className="bg-[#F7F4EB] p-4 rounded-3xl rounded-tl-xs border border-black/5 text-xs text-zinc-600 flex items-center gap-2">
                      <Sparkles className="size-4 text-[#FF5C5C] animate-pulse" />
                      <span>Reviewing statutes &amp; case precedents via Gemini Legal Engine...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested Quick Prompt Chips */}
              <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="font-bold text-zinc-400 shrink-0">Quick Queries:</span>
                {SUGGESTED_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium border border-black/5"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="pt-2 flex items-center gap-2 border-t border-black/[0.06]"
              >
                <div className="relative flex-1">
                  <input
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder={`Ask a judicial question about ${activeLaw.section} or any legal matter...`}
                    className="w-full h-11.5 pl-4 pr-10 rounded-full border border-black/10 bg-zinc-50 focus:bg-white text-xs sm:text-sm font-medium focus:border-black focus:outline-none transition-all"
                    disabled={isGenerating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="size-11.5 rounded-full bg-[#121316] text-white grid place-items-center hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Send query"
                >
                  <Send className="size-4 text-white" />
                </button>
              </form>
            </Card>
          )}

          {/* TAB 2: OFFICIAL STATUTE DETAILS & LEGAL INGREDIENTS */}
          {activeTab === 'statute-details' && (
            <Card className="bg-white p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5C5C]">
                    {activeLaw.actName}
                  </span>
                  <h2 className="font-black text-lg text-zinc-900 mt-0.5">
                    {activeLaw.section}: {activeLaw.title}
                  </h2>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAskAboutSection(activeLaw)}
                  className="cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>Analyze with AI</span>
                </Button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-1.5">
                    Official Statutory Text:
                  </span>
                  <p className="bg-[#F7F4EB] p-4 rounded-2xl border border-black/[0.04] text-zinc-800 leading-relaxed font-medium text-xs sm:text-[13px]">
                    "{activeLaw.description}"
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-1.5">
                    Sentencing Guideline / Statutory Range:
                  </span>
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 font-bold text-xs sm:text-[13px]">
                    {activeLaw.punishmentGuide}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-2">
                    Essential Ingredients to be Proven:
                  </span>
                  <div className="grid gap-2">
                    {activeLaw.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-[#FAF8F5] p-3 rounded-2xl border border-black/[0.04]"
                      >
                        <span className="size-5 rounded-full bg-[#121316] text-white text-[10px] font-bold grid place-items-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-zinc-800 font-medium text-xs sm:text-[12.5px] leading-relaxed">
                          {ing}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide block mb-2">
                    Landmark Judicial Precedents:
                  </span>
                  <div className="space-y-2.5">
                    {activeLaw.precedents.map((p, idx) => (
                      <div
                        key={idx}
                        className="border border-black/[0.05] bg-[#F7F4EB]/70 p-4 rounded-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 text-xs sm:text-sm">
                            {p.title}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-white text-[#FF5C5C] border border-black/[0.05]">
                            {p.citation}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-600 mt-1.5 leading-relaxed">
                          {p.principle}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
