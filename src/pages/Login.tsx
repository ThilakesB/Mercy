import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Lock, Scale, ShieldCheck, ArrowRight, KeyRound, Terminal, AlertTriangle } from 'lucide-react'
import { Button, Field, Input, Select, useApp, type Role } from '../ui'

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

export default function Login() {
  const { setRole, setAuthed, toast } = useApp()
  const nav = useNavigate()
  const [id, setId] = useState('counsel@mercy-legal.app')
  const [pw, setPw] = useState('mercy-pass-2026')
  const [r, setR] = useState<Role>('Judge')
  const [err, setErr] = useState('')

  const handleGoogleSignIn = () => {
    setRole(r)
    setAuthed(true)
    toast('Authentication successful with Google. Welcome to MERCY!', 'ok')
    nav('/')
  }

  const submitCred = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id.trim() || pw.length < 4) {
      return setErr('Please enter your email and passkey.')
    }
    setErr('')
    setRole(r)
    setAuthed(true)
    toast('Authentication successful! Welcome to MERCY.', 'ok')
    nav('/')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_1fr] font-mono text-xs">
      {/* Left Blueprint Telemetry Panel */}
      <div className="relative hidden flex-col justify-between bg-card border-r border-border p-12 text-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center border-2 border-[#e61919] bg-[#e61919] text-white font-black text-sm">
            ME
          </div>
          <div>
            <div className="font-sans text-lg font-black tracking-tight text-foreground uppercase">
              MERCY // LEGAL CASE MANAGEMENT
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#e61919] font-bold">
              CHAMBER SUITE // UNIFIED LEGAL WORKSPACE
            </div>
          </div>
        </div>

        <div className="max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 border border-border bg-elevated px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
            <span className="size-2 bg-[#e61919]" />
            AUTHORIZED ACCESS // LEGAL PROFESSIONALS &amp; COUNSEL
          </div>

          <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
            Comprehensive Case Records, Evidentiary Telemetry &amp; Precedent Intelligence.
          </h1>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Integrated command environment connecting advocate briefs, evidence chain-of-custody, monthly trial rosters, case histories, and retrieval-augmented case law research.
          </p>

          <div className="grid grid-cols-3 gap-3 border-t border-border pt-6 font-mono text-xs">
            <div className="border border-border p-3 bg-elevated/40">
              <div className="text-[10px] text-muted-foreground uppercase">SECURITY</div>
              <div className="text-sm font-black text-[#e61919] mt-0.5">AES-256 GCM</div>
              <div className="text-[9.5px] text-muted-foreground">End-to-End Encrypted</div>
            </div>
            <div className="border border-border p-3 bg-elevated/40">
              <div className="text-[10px] text-muted-foreground uppercase">DISASTER RECOVERY</div>
              <div className="text-sm font-black text-foreground mt-0.5">RPO &le; 60s</div>
              <div className="text-[9.5px] text-muted-foreground">Continuous Cloud WAL</div>
            </div>
            <div className="border border-border p-3 bg-elevated/40">
              <div className="text-[10px] text-muted-foreground uppercase">PRECEDENTS</div>
              <div className="text-sm font-black text-foreground mt-0.5">42,000+</div>
              <div className="text-[9.5px] text-muted-foreground">Appellate &amp; High Court</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>MERCY LEGAL PLATFORM // ENTERPRISE EDITION</span>
          <span className="text-[#e61919] font-bold">[SOC-2 COMPLIANT]</span>
        </div>
      </div>

      {/* Right Login Action Panel */}
      <div className="flex flex-col justify-center bg-background p-8 md:p-14">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div>
            <div className="inline-block border border-[#e61919] bg-[#e61919]/10 px-2 py-0.5 text-[10px] font-bold text-[#e61919] uppercase tracking-wider mb-2">
              [WORKSPACE ACCESS]
            </div>
            <h2 className="font-sans text-xl font-black uppercase text-foreground">
              Sign In To MERCY
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in to access case records, calendar dockets, and evidentiary files.
            </p>
          </div>

          {err && (
            <div className="border border-[#e61919] bg-[#e61919]/10 p-3 text-xs text-[#e61919] font-bold">
              [!] {err}
            </div>
          )}

          {/* Modern Google-Style Sign-in Option */}
          <div className="space-y-3 font-sans">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white py-3 px-4 text-xs sm:text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer active:scale-[0.98]"
            >
              <GoogleLogo className="size-4.5 shrink-0" />
              <span>Sign in</span>
            </button>

            <div className="relative flex items-center justify-center my-3 text-[10.5px] font-mono text-muted-foreground uppercase tracking-wider">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3">or workspace credentials</span>
            </div>
          </div>

          <form onSubmit={submitCred} className="space-y-4">
            <Field label="Professional Email">
              <Input
                type="email"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="counsel@mercy-legal.app"
                required
              />
            </Field>

            <Field label="PIN or Passkey">
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
            </Field>

            <Field label="Active Registry Role">
              <Select
                value={r}
                onChange={(e) => setR(e.target.value as Role)}
                className="w-full"
              >
                <option value="Judge">Presiding Officer (Full Case Authority)</option>
                <option value="Clerk">Court Reader / Clerk (Drafting &amp; Registry)</option>
                <option value="Admin">Audit Administrator (Security Oversight)</option>
              </Select>
            </Field>

            <Button type="submit" variant="hazard" size="lg" className="w-full">
              [ SIGN IN TO WORKSPACE ]
            </Button>
          </form>

          <div className="pt-4 border-t border-border text-[10px] text-muted-foreground text-center">
            SECURE ACCESS ONLY · MERCY ENTERPRISE LEGAL INTELLIGENCE · ALL SESSIONS AUDITED
          </div>
        </div>
      </div>
    </div>
  )
}
