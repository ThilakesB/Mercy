import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Lock, Scale, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react'
import { Button, Field, Input, Select, useApp, type Role } from '../ui'

export default function Login() {
  const { setRole, setAuthed, toast } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState<'cred' | 'otp'>('cred')
  const [id, setId] = useState('r.venkataraman@ecourts.gov.in')
  const [pw, setPw] = useState('demo1234')
  const [r, setR] = useState<Role>('Judge')
  const [otp, setOtp] = useState('123456')
  const [err, setErr] = useState('')

  const submitCred = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id.trim() || pw.length < 4)
      return setErr('Enter your court e-ID and a password of at least 4 characters.')
    setErr('')
    setStep('otp')
    toast('OTP sent to registered judicial mobile ending 4821', 'info')
  }

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return setErr('Enter the 6-digit OTP.')
    setRole(r)
    setAuthed(true)
    nav('/')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Editorial Judicial Left Panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar border-r border-border p-12 text-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg border border-border bg-[#13161c] text-accent">
            <Scale className="size-5" />
          </div>
          <div>
            <div className="font-serif text-xl font-semibold tracking-tight text-white">
              Mercy
            </div>
            <div className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground">
              Sessions Court Intelligence System
            </div>
          </div>
        </div>

        <div className="max-w-md my-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#12151c] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            National e-Courts Phase III Companion
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-white leading-snug">
            Every file, exhibit and statutory timeline in one calm, verified view.
          </h1>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Instant chronology, chain-of-custody tracking and statutory breach alarms,
            always traceable to exact document page citations. Designed strictly as decision
            support for the presiding bench.
          </p>

          <div className="grid grid-cols-3 gap-3 border-t border-border/80 pt-6 font-mono">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Courtrooms</div>
              <div className="text-lg font-semibold text-white">12 Benches</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Traceability</div>
              <div className="text-lg font-semibold text-white">100% Cited</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Autonomy</div>
              <div className="text-lg font-semibold text-white">Human Final</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span className="font-serif italic text-zinc-300">"Satyameva Jayate"</span>
          <span>e-Courts Security Standard 2.4</span>
        </div>
      </div>

      {/* Auth Form Right Panel */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <Scale className="size-5 text-white" />
            <span className="font-serif text-lg font-semibold">Mercy</span>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground tracking-tight">
              {step === 'cred' ? 'Bench Authentication' : 'Verify Secure OTP'}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {step === 'cred'
                ? 'Enter your official court registry credentials to access the roster.'
                : 'Enter the 6-digit confirmation code dispatched to your registered handset.'}
            </p>
          </div>

          {step === 'cred' ? (
            <form onSubmit={submitCred} className="space-y-4">
              <Field label="Judicial e-ID / Email">
                <Input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  autoComplete="username"
                  placeholder="justice.name@ecourts.gov.in"
                />
              </Field>

              <Field label="Security Key / Password">
                <Input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Demo password"
                  autoComplete="current-password"
                />
              </Field>

              <Field label="Roster Access Role">
                <Select
                  value={r}
                  onChange={(e) => setR(e.target.value as Role)}
                  className="w-full"
                >
                  <option value="Judge">Presiding Judge (Full Roster & Reveal)</option>
                  <option value="Clerk">Court Registry Clerk (Operational)</option>
                  <option value="Admin">System & Access Administrator</option>
                </Select>
              </Field>

              {err && (
                <p role="alert" className="text-xs text-bad">
                  {err}
                </p>
              )}

              <Button type="submit" className="w-full">
                Continue to OTP Verification
                <ArrowRight className="size-3.5" />
              </Button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-4">
              <Field
                label="6-Digit Verification Code"
                hint="Demo verification code 123456 is pre-filled."
              >
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono text-base tracking-[0.5em] h-10"
                  autoFocus
                />
              </Field>

              {err && (
                <p role="alert" className="text-xs text-bad">
                  {err}
                </p>
              )}

              <Button type="submit" className="w-full">
                Authenticate & Open Bench
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('cred')
                  setErr('')
                }}
              >
                Change Credentials
              </Button>
            </form>
          )}

          <div className="mt-8 rounded-lg border border-border bg-[#11141b] p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <span className="leading-relaxed">
              Role-based access enforced. Sensitive identities under POCSO and Family Law are
              automatically masked per Supreme Court directives.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
