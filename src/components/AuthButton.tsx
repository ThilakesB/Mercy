import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Lock,
  User,
  UserPlus,
  LogOut,
  ChevronDown,
  Shield,
  KeyRound,
  X,
  Mail,
  Fingerprint,
} from 'lucide-react'
import { useApp, type Role } from '../ui'

interface AuthButtonProps {
  className?: string
}

function GoogleLogo({ className = 'size-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const { authed, setAuthed, role, setRole, toast } = useApp()
  const navigate = useNavigate()

  // Modal / Dropdown state
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [courtId, setCourtId] = useState('CHE-SESSIONS-04')
  const [selectedRole, setSelectedRole] = useState<Role>('Judge')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGoogleQuickSignIn = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setRole('Judge')
      setAuthed(true)
      setIsSubmitting(false)
      setModalOpen(false)
      toast('Signed in with Google. Welcome to MERCY!', 'ok')
    }, 450)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setRole(selectedRole)
      setAuthed(true)
      setIsSubmitting(false)
      setModalOpen(false)
      toast(`Authenticated as ${selectedRole}. Workspace decrypted.`, 'ok')
    }, 600)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setRole(selectedRole)
      setAuthed(true)
      setIsSubmitting(false)
      setModalOpen(false)
      toast(`Account registered for ${fullName || 'Counsel'}. Welcome to MERCY!`, 'ok')
    }, 700)
  }

  const handleLogout = () => {
    setAuthed(false)
    setProfileMenuOpen(false)
    toast('Session locked safely. Re-authenticate to access records.', 'info')
    navigate('/login')
  }

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      {authed ? (
        /* Authenticated State: Sleek Profile Pill */
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="group flex items-center gap-2.5 rounded-full border border-black/10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 shadow-sm transition-all hover:border-black/25 hover:bg-white hover:shadow-md cursor-pointer active:scale-[0.98]"
            aria-expanded={profileMenuOpen}
            aria-haspopup="true"
          >
            <div className="size-7.5 rounded-full bg-[#141518] text-white font-bold text-xs grid place-items-center shadow-xs group-hover:bg-[#FF5C5C] transition-colors">
              {role === 'Judge' ? 'PO' : role === 'Clerk' ? 'CR' : 'AD'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold text-foreground leading-tight">
                {role === 'Judge' ? 'Presiding Officer' : `${role} Officer`}
              </span>
              <span className="block text-[10px] text-zinc-500 font-medium">
                {role} · Chamber 04
              </span>
            </div>
            <ChevronDown className="size-3.5 text-zinc-400 group-hover:text-foreground transition-transform duration-200" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="slidein absolute right-0 top-12 z-50 w-64 rounded-3xl border border-black/8 bg-white p-3 shadow-xl font-sans">
              <div className="border-b border-black/5 p-2.5 mb-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Active Credential
                </div>
                <div className="text-xs font-bold text-foreground mt-0.5">
                  officer@mercy-legal.app
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-semibold">
                  <Shield className="size-3 text-emerald-600" />
                  <span>Verified Workspace Token</span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="size-3.5 text-zinc-400" />
                  <span>Security &amp; Passkeys</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="size-3.5 text-rose-500" />
                  <span>Lock Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Modern Google-Style Sign-In Option */
        <button
          type="button"
          onClick={() => {
            setActiveTab('login')
            setModalOpen(true)
          }}
          className="group flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white hover:bg-zinc-50 active:bg-zinc-100 px-4 py-2 sm:px-4.5 sm:py-2.5 shadow-xs hover:shadow-sm hover:border-zinc-300 transition-all duration-200 cursor-pointer font-sans active:scale-[0.98]"
          aria-label="Sign in"
        >
          <GoogleLogo className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-xs sm:text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 tracking-normal">
            Sign in
          </span>
        </button>
      )}

      {/* Custom Native Modal for Login & Sign Up */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-[#FFFFFF] p-6 shadow-2xl relative font-sans">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 grid size-8 place-items-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            {/* Header with Brand Accent */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-extrabold text-xl tracking-[0.22em] text-foreground uppercase">
                MERCY
              </span>
              <span className="size-2 rounded-full bg-[#FF5C5C]" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                // WORKSPACE AUTH
              </span>
            </div>

            {/* Prominent Google One-Click Action */}
            <button
              type="button"
              onClick={handleGoogleQuickSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white py-2.5 px-4 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer mb-4 active:scale-[0.98]"
            >
              <GoogleLogo className="size-4 shrink-0" />
              <span>Continue with Google Workspace</span>
            </button>

            <div className="relative flex items-center justify-center my-3 text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3">or continue with credentials</span>
            </div>

            {/* Segmented Native Tab Selector */}
            <div className="grid grid-cols-2 p-1 bg-[#F0EDE4] rounded-2xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-foreground shadow-xs font-extrabold'
                    : 'text-zinc-500 hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-foreground shadow-xs font-extrabold'
                    : 'text-zinc-500 hover:text-foreground'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Mode 1: Sign In */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Official Email / Workspace ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="counsel@mercy-legal.app"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Security Passkey / PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Chamber Role Assignment
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                  >
                    <option value="Judge">Presiding Officer (Full Authority)</option>
                    <option value="Clerk">Court Reader / Clerk (Drafting)</option>
                    <option value="Admin">Audit Administrator (Security)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[#141518] py-3 text-xs font-bold text-white hover:bg-black transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Shield className="size-3.5" />
                        <span>Sign In to Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Form Mode 2: Register / Sign Up */
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Counsel Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Advocate Sarah Jenkins"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Professional Legal Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="counsel@mercy-legal.app"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Chamber &amp; Practice Registry Code
                  </label>
                  <input
                    type="text"
                    value={courtId}
                    onChange={(e) => setCourtId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-mono text-[11px] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Set Master PIN
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6+ chars"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as Role)}
                      className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-zinc-50 text-foreground font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]"
                    >
                      <option value="Judge">Judge / Officer</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[#FF5C5C] py-3 text-xs font-bold text-white hover:bg-[#EE4B4B] transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Fingerprint className="size-3.5" />
                        <span>Register &amp; Provision Access</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-black/5 text-center text-[10.5px] text-zinc-400">
              MERCY Enterprise Legal Suite · End-to-End Encrypted
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
