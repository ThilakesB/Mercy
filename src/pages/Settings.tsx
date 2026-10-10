import { useState } from 'react'
import {
  User,
  Building2,
  Scale,
  Palette,
  Moon,
  Sun,
  Bell,
  Lock,
  Download,
  Trash2,
  Check,
  Shield,
  Eye,
  Clock,
  Globe,
  Sliders,
  Volume2,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { judicialStore } from '../lib/judicialStore'
import {
  Button,
  Card,
  PageHeader,
  Field,
  Input,
  Select,
  useApp,
} from '../ui'

export default function Settings() {
  const { user, theme, setTheme, toast } = useApp()

  // 1. Profile Settings
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mercy_user_profile_settings')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {}
      }
    }
    return {
      fullName: user?.name || 'Hon. Justice R. Venkataraman',
      judicialTitle: 'Presiding Sessions Judge',
      courtRoom: 'Court Hall 04 (Main Sessions)',
      division: 'New Delhi Sessions Division',
    }
  })

  // 2. Appearance & Interface Preferences
  const [fontSize, setFontSize] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_font_size')) || 'standard'
  })
  const [tableDensity, setTableDensity] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_table_density')) || 'comfortable'
  })

  // 3. Regional & Date Preferences
  const [dateFormat, setDateFormat] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_date_format')) || 'DD/MM/YYYY'
  })
  const [timeFormat, setTimeFormat] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_time_format')) || '12h'
  })
  const [defaultView, setDefaultView] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_default_view')) || 'today'
  })

  // 4. Notifications & Alerts
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
      soundAlerts: true,
      caseAdjournments: true,
      dailyMorningDigest: false,
    }
  })
  const [leadTime, setLeadTime] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_reminder_lead_time')) || '15'
  })

  // 5. Security & Privacy
  const [autoLockTimeout, setAutoLockTimeout] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_autolock')) || '15'
  })
  const [confirmBeforeDelete, setConfirmBeforeDelete] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_confirm_delete') !== 'false')
  })
  const [maskJuvenileNames, setMaskJuvenileNames] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('mercy_mask_juvenile') === 'true')
  })

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_user_profile_settings', JSON.stringify(profile))
    }
    toast('Profile details updated successfully!', 'ok')
  }

  // Toggle Notification Helper
  const handleToggleNotification = (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value }
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mercy_notifications_config', JSON.stringify(updated))
    }
    toast('Notification settings saved', 'ok')
  }

  // Export JSON Backup
  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      platform: 'Mercy Judicial Management Platform',
      version: '1.0',
      profile,
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
    a.download = `mercy_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('Court records exported to JSON backup!', 'ok')
  }

  // Clear Local Cache
  const handleClearCache = () => {
    if (
      window.confirm(
        'Are you sure you want to clear local application cache? Browser cached files will be refreshed.'
      )
    ) {
      judicialStore.resetToCleanState()
      toast('Local application cache cleared.', 'ok')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <PageHeader
        title="Settings & Preferences"
        sub="Customize profile details, appearance themes, docket reminders, regional formats, and session security."
      />

      {/* 1. PROFILE & JUDICIAL BENCH DETAILS */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-[#121316] text-white grid place-items-center">
            <User className="size-5 text-[#FF5C5C]" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Profile &amp; Judicial Officer Information
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Personalized designation displayed across case orders, decree signatures, and cause lists.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full Name">
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Hon. Justice R. Venkataraman"
                required
              />
            </Field>

            <Field label="Judicial Designation / Role">
              <Input
                value={profile.judicialTitle}
                onChange={(e) => setProfile({ ...profile, judicialTitle: e.target.value })}
                placeholder="Presiding Sessions Judge"
                required
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Assigned Courtroom / Bench">
              <Input
                value={profile.courtRoom}
                onChange={(e) => setProfile({ ...profile, courtRoom: e.target.value })}
                placeholder="Court Hall 04 (Main Sessions)"
                required
              />
            </Field>

            <Field label="Judicial Division / Jurisdiction">
              <Input
                value={profile.division}
                onChange={(e) => setProfile({ ...profile, division: e.target.value })}
                placeholder="New Delhi Sessions Division"
                required
              />
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary" className="rounded-full shadow-sm flex items-center gap-2">
              <Save className="size-4" />
              <span>Save Profile</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. APPEARANCE & THEME */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-amber-100 text-amber-900 grid place-items-center">
            <Palette className="size-5 text-amber-950" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Appearance &amp; Display Theme
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Choose courtroom visual theme, table spacing density, and interface scaling.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => {
              setTheme('swiss-light')
              toast('Switched to Warm Cream theme', 'ok')
            }}
            className={`p-4.5 text-left rounded-2xl border transition-all cursor-pointer ${
              theme === 'swiss-light'
                ? 'border-black bg-[#F7F4EB] shadow-xs ring-2 ring-black'
                : 'border-black/[0.08] bg-white hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-extrabold text-sm text-zinc-950 flex items-center gap-2">
                <Sun className="size-4 text-amber-600" />
                <span>Warm Cream Bento (Default Light)</span>
              </div>
              {theme === 'swiss-light' && <CheckCircle2 className="size-4 text-emerald-600" />}
            </div>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Clean warm cream background with dark high-contrast navigation and soft pastel cards.
            </p>
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => {
              setTheme('tactical-dark')
              toast('Switched to Tactical Dark theme', 'ok')
            }}
            className={`p-4.5 text-left rounded-2xl border transition-all cursor-pointer ${
              theme === 'tactical-dark'
                ? 'border-zinc-700 bg-zinc-900 text-white shadow-xs ring-2 ring-zinc-500'
                : 'border-black/[0.08] bg-white hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-extrabold text-sm text-zinc-950 dark:text-white flex items-center gap-2">
                <Moon className="size-4 text-blue-400" />
                <span>Tactical Dark CRT (Dark Mode)</span>
              </div>
              {theme === 'tactical-dark' && <CheckCircle2 className="size-4 text-emerald-400" />}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Low-emission dark interface designed for evening sessions and minimal eye strain.
            </p>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <Field label="Table Density">
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
              <option value="comfortable">Comfortable (Standard spacing)</option>
              <option value="compact">Compact (Dense layout for large rosters)</option>
            </Select>
          </Field>

          <Field label="Interface Text Size">
            <Select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_font_size', e.target.value)
                }
                toast('Text size preference updated', 'ok')
              }}
              className="w-full"
            >
              <option value="standard">Standard (100% - Default)</option>
              <option value="medium">Medium (110% - Enhanced Readability)</option>
              <option value="large">Large (120% - High Accessibility)</option>
            </Select>
          </Field>
        </div>
      </Card>

      {/* 3. REGIONAL & DOCKET PREFERENCES */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-blue-50 text-blue-900 grid place-items-center">
            <Globe className="size-5 text-blue-800" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Regional Formats &amp; Docket Preferences
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Standardize date formatting, time clock system, and default cause list views.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Date Format">
            <Select
              value={dateFormat}
              onChange={(e) => {
                setDateFormat(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_date_format', e.target.value)
                }
                toast('Date format saved', 'ok')
              }}
              className="w-full"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard · 11/10/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard · 2026-10-11)</option>
              <option value="DD MMM YYYY">DD MMM YYYY (11 Oct 2026)</option>
            </Select>
          </Field>

          <Field label="Clock Format">
            <Select
              value={timeFormat}
              onChange={(e) => {
                setTimeFormat(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_time_format', e.target.value)
                }
                toast('Clock format saved', 'ok')
              }}
              className="w-full"
            >
              <option value="12h">12-Hour Clock (e.g. 10:30 AM)</option>
              <option value="24h">24-Hour Military (e.g. 10:30)</option>
            </Select>
          </Field>

          <Field label="Default Schedule View">
            <Select
              value={defaultView}
              onChange={(e) => {
                setDefaultView(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_default_view', e.target.value)
                }
                toast('Schedule view preference saved', 'ok')
              }}
              className="w-full"
            >
              <option value="today">Today's Cause List</option>
              <option value="all">Full Upcoming Docket</option>
            </Select>
          </Field>
        </div>
      </Card>

      {/* 4. NOTIFICATIONS & DOCKET ALARMS */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-indigo-50 text-indigo-900 grid place-items-center">
            <Bell className="size-5 text-indigo-900" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Hearing Notifications &amp; Docket Alerts
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Control automated reminders, hearing alerts, and audible notifications.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Scheduled Hearing Reminders</div>
              <div className="text-[11px] text-zinc-500">
                Show visual notification banner for upcoming bench listings
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
              <div className="font-bold text-zinc-900">Audible Sound Alerts</div>
              <div className="text-[11px] text-zinc-500">
                Play subtle chime when a scheduled hearing time arrives
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.soundAlerts}
              onChange={(e) => handleToggleNotification('soundAlerts', e.target.checked)}
              className="accent-black size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Case Adjournment Alerts</div>
              <div className="text-[11px] text-zinc-500">
                Notify when hearing date or witness schedule is modified
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications.caseAdjournments}
              onChange={(e) => handleToggleNotification('caseAdjournments', e.target.checked)}
              className="accent-black size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Reminder Lead Time</div>
              <div className="text-[11px] text-zinc-500">
                How early to alert before listed hearing start time
              </div>
            </div>
            <Select
              value={leadTime}
              onChange={(e) => {
                setLeadTime(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_reminder_lead_time', e.target.value)
                }
                toast('Reminder lead time saved', 'ok')
              }}
              className="text-xs rounded-full h-8"
            >
              <option value="5">5 Minutes Before</option>
              <option value="15">15 Minutes Before</option>
              <option value="30">30 Minutes Before</option>
              <option value="60">1 Hour Before</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 5. PRIVACY & SECURITY CONTROLS */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-zinc-100 text-zinc-900 grid place-items-center">
            <Lock className="size-5 text-zinc-900" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Session Security &amp; Courtroom Privacy
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Auto-lock idle timers, sensitive witness masking, and delete safety confirmations.
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Auto-Lock Inactivity Period</div>
              <div className="text-[11px] text-zinc-500">
                Automatically lock the bench terminal when idle
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
              <option value="never">Never (Stay Unlocked)</option>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">Confirmation Dialog Before Deleting</div>
              <div className="text-[11px] text-zinc-500">
                Require confirmation before deleting cases, hearings, or records
              </div>
            </div>
            <input
              type="checkbox"
              checked={confirmBeforeDelete}
              onChange={(e) => {
                setConfirmBeforeDelete(e.target.checked)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_confirm_delete', String(e.target.checked))
                }
                toast('Safety confirmation updated', 'ok')
              }}
              className="accent-black size-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5]">
            <div>
              <div className="font-bold text-zinc-900">In-Camera Witness Privacy Masking</div>
              <div className="text-[11px] text-zinc-500">
                Obfuscate sensitive victim and minor names on secondary public displays
              </div>
            </div>
            <input
              type="checkbox"
              checked={maskJuvenileNames}
              onChange={(e) => {
                setMaskJuvenileNames(e.target.checked)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('mercy_mask_juvenile', String(e.target.checked))
                }
                toast('Privacy filter preference updated', 'ok')
              }}
              className="accent-black size-4 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* 6. DATA BACKUP & MAINTENANCE */}
      <Card className="bg-white p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm border border-black/[0.06]">
        <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
          <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-900 grid place-items-center">
            <Download className="size-5 text-emerald-800" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-wider text-zinc-900">
              Backup &amp; Data Maintenance
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Export court records as offline JSON backup or refresh browser storage.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4.5 rounded-2xl bg-[#FAF8F5] border border-black/5 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-zinc-900 text-xs block">Export Court Records</span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Download a complete, offline JSON snapshot containing cases, hearings, criminals, decrees, and documents.
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

          <div className="p-4.5 rounded-2xl bg-rose-50/60 border border-rose-200/60 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-rose-950 text-xs block">Clear Local Cache</span>
              <p className="text-[11px] text-rose-800/80 mt-1">
                Refresh browser cached data. Live database connections will automatically re-sync.
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
