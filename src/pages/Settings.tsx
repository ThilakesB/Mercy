import { useState } from 'react'
import {
  User,
  Building2,
  Scale,
  Palette,
  Moon,
  Sun,
  Database,
  Sparkles,
  Bell,
  Lock,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Check,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Sliders,
  Shield,
  FileSpreadsheet,
} from 'lucide-react'
import { judicialStore } from '../lib/judicialStore'
import {
  getSupabaseConfig,
  setSupabaseConfig,
  isSupabaseConfigured,
  getSupabase,
} from '../lib/supabase'
import { askGeminiLegalAI } from '../lib/gemini'
import {
  Button,
  Card,
  PageHeader,
  Field,
  Input,
  Select,
  Switch,
  useApp,
} from '../ui'

export default function Settings() {
  const { user, theme, setTheme, toast } = useApp()

  // 1. Court & Bench Profile
  const [courtProfile, setCourtProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mercy_court_profile')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {}
      }
    }
    return {
      judgeName: user?.name || 'Hon. Justice R. Venkataraman',
      benchTitle: 'Sessions Judge · Bench 04',
      courtName: 'Principal Sessions Court',
      jurisdiction: 'New Delhi Sessions Division (DL)',
      email: user?.email || 'thilakesb@gmail.com',
      casePrefix: 'SC/ND-2026/',
    }
  })

  // 2. Display & Interface Preferences
  const [dateFormat, setDateFormat] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_date_format')) || 'DD/MM/YYYY'
  })
  const [tableDensity, setTableDensity] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_table_density')) || 'comfortable'
  })

  // 3. Cloud Database (Supabase)
  const initialSupabase = getSupabaseConfig()
  const [supabaseUrl, setSupabaseUrl] = useState(
    initialSupabase.url || 'https://vodrmtqzqrmrcevmlvyg.supabase.co'
  )
  const [supabaseKey, setSupabaseKey] = useState(initialSupabase.key || '')
  const [showSupabaseKey, setShowSupabaseKey] = useState(false)
  const [isTestingSupabase, setIsTestingSupabase] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState<{
    success?: boolean
    msg?: string
    latency?: number
  } | null>(null)

  // 4. Gemini Legal AI
  const [geminiKey, setGeminiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mercy_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
    }
    return ''
  })
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [isTestingGemini, setIsTestingGemini] = useState(false)

  // 5. Notifications & Alarms
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mercy_notifications_config')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {}
      }
    }
    return {
      hearingReminders: true,
      statutoryBailAlerts: true,
      caseAdjournmentAlerts: true,
      dailyDigest: false,
    }
  })
  const [autoLockTimeout, setAutoLockTimeout] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_autolock')) || '15'
  })

  // Save Court Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_court_profile', JSON.stringify(courtProfile))
    }
    toast('Court & Bench profile saved successfully!', 'ok')
  }

  // Save Supabase
  const handleSaveSupabase = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!supabaseUrl.trim()) {
      toast('Please enter a valid Supabase project URL', 'bad')
      return
    }
    setSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim())
    toast('Supabase configuration saved! Testing connection...', 'ok')
    handleTestSupabase()
  }

  // Test Supabase
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true)
    setSupabaseStatus(null)
    const startTime = performance.now()
    try {
      const client = getSupabase()
      if (!client) {
        setSupabaseStatus({
          success: false,
          msg: 'Please save both Project URL and Anon Key to test connection.',
        })
        return
      }

      const { error } = await client.from('cases').select('id').limit(1)
      const elapsed = Math.round(performance.now() - startTime)

      if (error && error.code !== 'PGRST204' && !error.message?.includes('does not exist')) {
        setSupabaseStatus({
          success: false,
          latency: elapsed,
          msg: `Supabase query error: ${error.message} (Code: ${error.code})`,
        })
        toast(`Supabase connection error: ${error.message}`, 'bad')
      } else {
        setSupabaseStatus({
          success: true,
          latency: elapsed,
          msg: `Connected successfully (${elapsed}ms)! Cloud PostgreSQL database is responding.`,
        })
        toast('Connected successfully to Supabase cloud database!', 'ok')
      }
    } catch (err: any) {
      setSupabaseStatus({
        success: false,
        msg: `Connection failed: ${err.message || 'Network / CORS error'}.`,
      })
      toast('Could not connect to Supabase endpoint', 'bad')
    } finally {
      setIsTestingSupabase(false)
    }
  }

  // Save Gemini Key
  const handleSaveGeminiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_gemini_api_key', geminiKey.trim())
      toast('Gemini Legal AI API Key saved!', 'ok')
    }
  }

  // Test Gemini AI
  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      toast('Please enter a Gemini API Key first', 'bad')
      return
    }
    setIsTestingGemini(true)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mercy_gemini_api_key', geminiKey.trim())
      }
      const response = await askGeminiLegalAI(
        'Confirm bench assistant connection in 1 short sentence with statutory affirmation.'
      )
      toast('Gemini AI connected! ' + response.slice(0, 50) + '...', 'ok')
    } catch (err: any) {
      toast('Gemini AI connection failed: ' + err.message, 'bad')
    } finally {
      setIsTestingGemini(false)
    }
  }

  // Save Notification Config
  const handleToggleNotification = (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value }
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_notifications_config', JSON.stringify(updated))
    }
    toast('Notification preference updated', 'ok')
  }

  // Export JSON Backup
  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      appName: 'Mercy Judicial Platform',
      version: '1.0',
      courtProfile,
      cases: judicialStore.getCases(),
      criminals: judicialStore.getCriminals(),
      lawyers: judicialStore.getLawyers(),
      hearings: judicialStore.getHearings(),
      punishments: judicialStore.getPunishments(),
      documents: judicialStore.getDocuments(),
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mercy_judicial_records_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('Court records exported successfully as JSON file!', 'ok')
  }

  // Clear Registry Cache
  const handleClearCache = () => {
    if (
      window.confirm(
        'Are you sure you want to clear local cache records? Unsynced changes will be reset.'
      )
    ) {
      judicialStore.resetToCleanState()
      toast('Local registry cache cleared successfully.', 'ok')
    }
  }

  const isConfigured = isSupabaseConfigured()

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      <PageHeader
        title="Settings & System Preferences"
        sub="Configure court profile, display appearance, cloud database integration, and automated court docket alerts."
      />

      {/* 1. COURT & BENCH PROFILE */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-[#121316] text-white grid place-items-center">
            <Building2 className="size-5 text-[#FF5C5C]" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Court &amp; Bench Profile
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Official judicial officer details, court establishment, and default docket numbering prefix.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Presiding Judicial Officer Name">
              <Input
                value={courtProfile.judgeName}
                onChange={(e) =>
                  setCourtProfile({ ...courtProfile, judgeName: e.target.value })
                }
                placeholder="Hon. Justice R. Venkataraman"
                required
              />
            </Field>

            <Field label="Designation / Bench Style">
              <Input
                value={courtProfile.benchTitle}
                onChange={(e) =>
                  setCourtProfile({ ...courtProfile, benchTitle: e.target.value })
                }
                placeholder="Principal Sessions Judge · Bench 04"
                required
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Court Establishment / Complex">
              <Input
                value={courtProfile.courtName}
                onChange={(e) =>
                  setCourtProfile({ ...courtProfile, courtName: e.target.value })
                }
                placeholder="Principal Sessions Court"
                required
              />
            </Field>

            <Field label="Jurisdiction & Division">
              <Input
                value={courtProfile.jurisdiction}
                onChange={(e) =>
                  setCourtProfile({ ...courtProfile, jurisdiction: e.target.value })
                }
                placeholder="New Delhi Sessions Division (DL)"
                required
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Official Bench Email">
              <Input
                type="email"
                value={courtProfile.email}
                onChange={(e) =>
                  setCourtProfile({ ...courtProfile, email: e.target.value })
                }
                placeholder="thilakesb@gmail.com"
                required
              />
            </Field>

            <Field label="Auto Case Numbering Prefix">
              <Input
                value={courtProfile.casePrefix}
                onChange={(e) =>
                  setCourtProfile({ ...courtProfile, casePrefix: e.target.value })
                }
                placeholder="SC/ND-2026/"
                required
              />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="rounded-full shadow-sm flex items-center gap-2">
              <Save className="size-4" />
              <span>Save Court Profile</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. APPEARANCE & DISPLAY PREFERENCES */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-amber-100 text-amber-900 grid place-items-center">
            <Palette className="size-5 text-amber-950" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Appearance &amp; Optical Theme
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Select courtroom illumination theme, table density, and calendar date format.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('swiss-light')
              toast('Switched to Warm Cream substrate (#F7F4EB)', 'ok')
            }}
            className={`p-4.5 text-left rounded-2xl border transition-all cursor-pointer ${
              theme === 'swiss-light'
                ? 'border-black bg-[#F7F4EB] shadow-xs ring-2 ring-black'
                : 'border-black/[0.08] bg-white hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-extrabold text-sm text-zinc-950 flex items-center gap-2">
                <Sun className="size-4 text-amber-600" />
                <span>Warm Cream Bento (Default)</span>
              </div>
              {theme === 'swiss-light' && (
                <span className="size-2 rounded-full bg-emerald-500" />
              )}
            </div>
            <div className="text-xs text-zinc-600 font-medium leading-relaxed">
              Warm cream paper substrate (#F7F4EB) with dark capsule navigation and soft pastel cards.
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('tactical-dark')
              toast('Switched to Tactical Dark CRT (#0A0A0A)', 'ok')
            }}
            className={`p-4.5 text-left rounded-2xl border transition-all cursor-pointer ${
              theme === 'tactical-dark'
                ? 'border-zinc-700 bg-zinc-900 text-white shadow-xs ring-2 ring-zinc-500'
                : 'border-black/[0.08] bg-white hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-extrabold text-sm text-zinc-950 dark:text-white flex items-center gap-2">
                <Moon className="size-4 text-blue-400" />
                <span>Tactical Dark CRT</span>
              </div>
              {theme === 'tactical-dark' && (
                <span className="size-2 rounded-full bg-emerald-500" />
              )}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Ultra-low emission dark CRT aesthetic for evening sessions and minimal ocular glare.
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <Field label="Date Display Format">
            <Select
              value={dateFormat}
              onChange={(e) => {
                setDateFormat(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_date_format', e.target.value)
                }
                toast('Date format preference updated', 'ok')
              }}
              className="w-full"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard · 11/10/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard · 2026-10-11)</option>
              <option value="DD MMM YYYY">DD MMM YYYY (11 Oct 2026)</option>
            </Select>
          </Field>

          <Field label="Table Record Density">
            <Select
              value={tableDensity}
              onChange={(e) => {
                setTableDensity(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_table_density', e.target.value)
                }
                toast('Table density preference updated', 'ok')
              }}
              className="w-full"
            >
              <option value="comfortable">Comfortable (Standard judicial spacing)</option>
              <option value="compact">Compact (High density for large rosters)</option>
            </Select>
          </Field>
        </div>
      </Card>

      {/* 3. CLOUD DATABASE & AI INTEGRATION */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Supabase Database Connection */}
        <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[#121316] text-white grid place-items-center">
                <Database className="size-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900">
                  Supabase Cloud Database
                </h3>
                <span
                  className={`text-[10.5px] font-bold ${
                    isConfigured ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isConfigured ? '● Connected' : '○ Not Configured'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="rounded-full text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`size-3 ${isTestingSupabase ? 'animate-spin' : ''}`} />
              <span>{isTestingSupabase ? 'Testing...' : 'Test'}</span>
            </Button>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-3.5">
            <Field label="Project URL">
              <Input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                required
              />
            </Field>

            <Field label="Anon Public API Key">
              <div className="relative">
                <Input
                  type={showSupabaseKey ? 'text' : 'password'}
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showSupabaseKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            {supabaseStatus && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-start gap-2 border ${
                  supabaseStatus.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                {supabaseStatus.success ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{supabaseStatus.msg}</span>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full rounded-full text-xs font-bold">
              Save Supabase Connection
            </Button>
          </form>
        </Card>

        {/* Gemini Legal AI */}
        <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[#121316] text-white grid place-items-center">
                <Sparkles className="size-5 text-[#FF5C5C]" />
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900">
                  Google Gemini Legal AI
                </h3>
                <span className="text-[10.5px] font-bold text-emerald-700">
                  ● Model: gemini-flash-latest
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestGemini}
              disabled={isTestingGemini}
              className="rounded-full text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`size-3 ${isTestingGemini ? 'animate-spin' : ''}`} />
              <span>{isTestingGemini ? 'Checking...' : 'Test AI'}</span>
            </Button>
          </div>

          <div className="space-y-3.5">
            <Field label="Gemini API Key" hint="Used for statutory AI research, precedents, and legal chatbot.">
              <div className="relative">
                <Input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showGeminiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl text-xs text-zinc-600">
              Powers instant cross-statutory citations for BNS 2023, BNSS 2023, BSA 2023, and IPC precedents.
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleSaveGeminiKey}
              className="w-full rounded-full text-xs font-bold"
            >
              Save Gemini AI Key
            </Button>
          </div>
        </Card>
      </div>

      {/* 4. NOTIFICATIONS & SECURITY */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-indigo-50 text-indigo-900 grid place-items-center">
            <Bell className="size-5 text-indigo-900" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Court Docket Alarms &amp; Security Controls
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Automated statutory reminders, hearing schedule alarms, and session lock timeouts.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Scheduled Hearing Reminders</div>
              <div className="text-[11px] text-zinc-500">
                Notify judge before listed court sessions and docket hearings
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.hearingReminders}
              onChange={(e) => handleToggleNotification('hearingReminders', e.target.checked)}
              className="accent-black size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Statutory Bail &amp; Remand Threshold Alarms</div>
              <div className="text-[11px] text-zinc-500">
                Automatic statutory alerts on 60/90 days default bail thresholds under BNSS / CrPC
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.statutoryBailAlerts}
              onChange={(e) => handleToggleNotification('statutoryBailAlerts', e.target.checked)}
              className="accent-black size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Case Adjournment &amp; Stage Advance Alerts</div>
              <div className="text-[11px] text-zinc-500">
                Alert on hearing rescheduling and witness examination changes
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.caseAdjournmentAlerts}
              onChange={(e) => handleToggleNotification('caseAdjournmentAlerts', e.target.checked)}
              className="accent-black size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Auto-Lock Inactivity Period</div>
              <div className="text-[11px] text-zinc-500">
                Automatically locks the bench session when terminal is idle
              </div>
            </div>
            <Select
              value={autoLockTimeout}
              onChange={(e) => {
                setAutoLockTimeout(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_autolock', e.target.value)
                }
                toast('Auto-lock timeout updated', 'ok')
              }}
              className="text-xs rounded-full h-8"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="never">Never (Bench Mode)</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 5. DATA BACKUP & MAINTENANCE */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-900 grid place-items-center">
            <Download className="size-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Data Backup &amp; Storage Maintenance
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Export court dockets as JSON files or reset registry cache.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/5 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-zinc-900 text-xs block">Export All Court Records</span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Download complete JSON snapshot containing all cases, criminals, hearings, punishments, and documents.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleExportData}
              className="rounded-full text-xs font-bold flex items-center justify-center gap-2 self-start"
            >
              <Download className="size-3.5" />
              <span>Download JSON Backup</span>
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-rose-950 text-xs block">Clear Local Cache</span>
              <p className="text-[11px] text-rose-800/80 mt-1">
                Purge cached records stored in the browser. Unsynced local items will be cleared.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearCache}
              className="rounded-full text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-900 border-rose-300 self-start flex items-center gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Clear Local Cache</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
