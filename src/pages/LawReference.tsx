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
  Maximize2,
  Minimize2,
  Columns,
  Zap,
  Info,
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

export default function LawReference() {
  const { toast } = useApp()
  const laws = judicialStore.getStatutoryLaws()

  const [searchLaw, setSearchLaw] = useState('')
  const [selectedActFilter, setSelectedActFilter] = useState('ALL')
  const [selectedLawId, setSelectedLawId] = useState<string>(laws[0]?.id || '')
  const [activeTab, setActiveTab] = useState<'ai-chat' | 'statute-details'>('ai-chat')
  const [viewLayout, setViewLayout] = useState<'split' | 'ai-focus'>('split')

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Ready for your inquiry, Hon’ble Bench. Inquire into any statutory provision, ingredients, or case precedents below.',
      timestamp: 'Active',
    },
  ])
  const [inputPrompt, setInputPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Internal scroll container ref (Prevents window jump / zoom bug)
  const chatScrollContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  const activeLaw = laws.find((l) => l.id === selectedLawId) || laws[0]

  // Safe internal auto-scroll only when messages change after mount (Fixes window zooming/jump bug)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight
    }
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
    setActiveTab('ai-chat')
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
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Authoritative Statutory Law Reference & AI Assistant"
        sub="Instant legal reference for codified Indian statutes (BNS, BNSS, BSA, POCSO, Arms Act). Powered by Google Gemini AI for deep statutory ingredient analysis and judicial case inquiries."
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle Button */}
            <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-black/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewLayout('split')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewLayout === 'split'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
                title="Split View: Statute Directory & AI Assistant"
              >
                <Columns className="size-3.5" />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayout('ai-focus')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewLayout === 'ai-focus'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
                title="AI Focus View: Expanded Full-Width Chatbot"
              >
                <Maximize2 className="size-3.5 text-[#FF5C5C]" />
                <span>AI Focus (Full View)</span>
              </button>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold">
              <Sparkles className="size-3 text-emerald-600 animate-pulse" />
              <span>Gemini 2.5 Active</span>
            </span>
          </div>
        }
      />

      {/* Prominent High-Visibility Hero Banner for AI Assistant */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-black/10 bg-gradient-to-r from-[#121316] via-zinc-900 to-[#1e2025] text-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-11 sm:size-12 rounded-2xl bg-white/10 border border-white/20 grid place-items-center shrink-0 shadow-inner">
              <Bot className="size-6 text-[#FF5C5C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white">
                  Mercy Judicial Legal AI Assistant
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  ● READY FOR INQUIRY
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Query Indian penal codes (BNS), evidentiary standards (BSA), and criminal procedure (BNSS) with instant precedent citations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ai-chat')
                handleSendMessage('List the landmark Supreme Court principles on Section 103 BNS and circumstantial evidence.')
              }}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Zap className="size-3.5 text-amber-400" />
              <span>Landmark Precedents</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ai-chat')
                handleSendMessage('Explain Section 23 BSA regarding disclosure statements and Section 27 IEA doctrine.')
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FF5C5C] hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <span>Examine Sec 23 BSA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Search & Act Filter Toolbar (Only shown in Split View or when searching) */}
      <Card className="p-3.5 sm:p-4 bg-white shadow-xs space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4.5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchLaw}
            onChange={(e) => setSearchLaw(e.target.value)}
            placeholder="Search statutes, sections, or keywords (e.g. 103 BNS, Murder, 25 Arms, POCSO, Bail, Discovery 23)..."
            className="pl-12 pr-6 h-12 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
          />
        </div>

        {/* Act Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
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
              className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
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

      {/* Main Grid: Responsive Split View or Full AI Focus Mode */}
      <div
        className={`grid gap-6 ${
          viewLayout === 'ai-focus'
            ? 'grid-cols-1'
            : 'grid-cols-1 lg:grid-cols-[1.1fr_1.9fr]'
        }`}
      >
        {/* Left Column: Statutory Law Index (Hidden when in AI Focus mode) */}
        {viewLayout === 'split' && (
          <div className="space-y-4">
            <Card className="bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Statute Directory ({filteredLaws.length} Indexed)
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    Click any section to analyze or load into AI assistant
                  </p>
                </div>
                <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold">
                  Bench 04
                </span>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
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
                            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-[#121316] hover:text-white text-zinc-700 font-bold text-[10.5px] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
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
        )}

        {/* Right Column: AI Chatbot & Statutory Details (Made Primary & Highly Visible) */}
        <div className="space-y-4">
          {/* Navigation Tabs (AI Chatbot vs Official Statutory Text) */}
          <div className="flex flex-wrap items-center justify-between bg-white p-2 rounded-2xl border border-black/[0.06] shadow-xs gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('ai-chat')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'ai-chat'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Bot className="size-4 text-[#FF5C5C]" />
                <span>Gemini Judicial AI Assistant</span>
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('statute-details')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'statute-details'
                    ? 'bg-[#121316] text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <BookOpen className="size-4 text-amber-600" />
                <span>Statute Provisions ({activeLaw.section})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {viewLayout === 'ai-focus' ? (
                <button
                  type="button"
                  onClick={() => setViewLayout('split')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Return to side-by-side view"
                >
                  <Minimize2 className="size-3.5" />
                  <span>Show Directory</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewLayout('ai-focus')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Expand AI Assistant full width"
                >
                  <Maximize2 className="size-3.5 text-[#FF5C5C]" />
                  <span>Expand Chat</span>
                </button>
              )}

              {activeTab === 'ai-chat' && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="px-3 py-1.5 rounded-full text-zinc-500 hover:text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Clear chat transcript"
                >
                  <RotateCcw className="size-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: GEMINI LEGAL AI CHATBOT INTERFACE (MINIMAL, DISTRACTION-FREE CHAT BOARD) */}
          {activeTab === 'ai-chat' && (
            <Card className="bg-white p-4 sm:p-6 flex flex-col h-[740px] shadow-sm border border-black/10">
              {/* Minimal Section Context Bar */}
              <div className="px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 mb-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-zinc-500 font-medium shrink-0">Statute Context:</span>
                  <span className="font-bold text-zinc-900 truncate">
                    {activeLaw.section} · {activeLaw.title} ({activeLaw.actCode})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAskAboutSection(activeLaw)}
                  className="text-xs font-bold text-[#FF5C5C] hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-2"
                >
                  <Sparkles className="size-3.5" />
                  <span>Analyze Ingredients</span>
                </button>
              </div>

              {/* Chat Message Scrollable Container */}
              <div
                ref={chatScrollContainerRef}
                className="flex-1 overflow-y-auto space-y-5 pr-2 scroll-smooth"
              >
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`size-10 sm:size-11 rounded-2xl grid place-items-center shrink-0 font-bold text-xs shadow-xs ${
                          isUser
                            ? 'bg-[#121316] text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isUser ? <User className="size-5" /> : <Bot className="size-5" />}
                      </div>

                      <div
                        className={`max-w-[86%] rounded-3xl p-5 sm:p-6 space-y-2 relative group shadow-xs ${
                          isUser
                            ? 'bg-[#121316] text-white rounded-tr-xs'
                            : 'bg-[#FBF9F4] text-zinc-900 border border-black/[0.08] rounded-tl-xs'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between gap-3 text-xs pb-2 mb-1 border-b ${
                            isUser ? 'border-white/10 text-zinc-300' : 'border-black/[0.06] text-zinc-500'
                          }`}
                        >
                          <span className="font-bold">
                            {isUser ? 'Hon. Presiding Judge' : 'Mercy Legal AI (Gemini 2.5 Flash)'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>{msg.timestamp}</span>
                            {!isUser && (
                              <button
                                type="button"
                                onClick={() => handleCopyText(msg.content, msg.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-[#FF5C5C] cursor-pointer"
                                title="Copy legal text"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="size-4 text-emerald-600" />
                                ) : (
                                  <Copy className="size-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="whitespace-pre-wrap font-sans text-base sm:text-[17px] leading-relaxed font-normal">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {isGenerating && (
                  <div className="flex items-start gap-3.5">
                    <div className="size-10 sm:size-11 rounded-2xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-xs">
                      <Bot className="size-5 animate-spin" />
                    </div>
                    <div className="bg-[#FBF9F4] p-4.5 rounded-3xl rounded-tl-xs border border-black/5 text-sm sm:text-base text-zinc-700 flex items-center gap-3">
                      <Sparkles className="size-4.5 text-[#FF5C5C] animate-pulse" />
                      <span className="font-medium">
                        Analyzing codified statutes, precedents, and sentencing matrices via Gemini...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Field (Clean, Large Font Size, No Suggestions) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="pt-3.5 flex items-center gap-3 border-t border-black/[0.08]"
              >
                <div className="relative flex-1">
                  <input
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder={`Ask a legal query about ${activeLaw.section} or any statute (Press Enter to query)...`}
                    className="w-full h-14 pl-6 pr-6 rounded-full border-2 border-black/15 bg-zinc-50/70 focus:bg-white text-base font-semibold focus:border-black focus:outline-none transition-all shadow-xs placeholder:text-zinc-400 placeholder:text-sm sm:placeholder:text-base"
                    disabled={isGenerating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isGenerating}
                  className="size-14 rounded-full bg-[#121316] text-white grid place-items-center hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
                  title="Send query to Gemini Legal AI"
                >
                  <Send className="size-5 text-white" />
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
