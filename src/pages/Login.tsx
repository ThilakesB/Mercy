import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Lock, Scale, ShieldCheck, ArrowRight, KeyRound, Terminal, AlertTriangle } from 'lucide-react'
import { Button, Field, Input, Select, useApp, type Role } from '../ui'

export default function Login() {
  const { setRole, setAuthed, toast } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState<'cred' | 'otp'>('cred')
  const [id, setId] = useState('judge.venkataraman@nyayadesk.gov.in')
  const [pw, setPw] = useState('judicial-pin-8821')
  const [r, setR] = useState<Role>('Judge')
  const [otp, setOtp] = useState('991420')
  const [err, setErr] = useState('')

  const submitCred = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id.trim() || pw.length < 4) {
      return setErr('Enter judicial service identifier and bench PIN.')
    }
    setErr('')
    setStep('otp')
    toast('Hardware PIV challenge generated. Enter token to authenticate.', 'info')
  }

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return setErr('Enter the 6-digit hardware security token.')
    setRole(r)
    setAuthed(true)
    toast('Authentication successful! Bench terminal unlocked.', 'ok')
    nav('/')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_1fr] font-mono text-xs">
      {/* Left Blueprint Telemetry Panel */}
      <div className="relative hidden flex-col justify-between bg-card border-r border-border p-12 text-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center border-2 border-[#e61919] bg-[#e61919] text-white font-black text-sm">
            NY
          </div>
          <div>
            <div className="font-sans text-lg font-black tracking-tight text-foreground uppercase">
              NYAYADESK // JUDICIAL CASE MANAGEMENT
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#e61919] font-bold">
              BENCH 04 // SESSIONS COURT SECURE TERMINAL
            </div>
          </div>
        </div>

        <div className="max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 border border-border bg-elevated px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
            <span className="size-2 bg-[#e61919]" />
            RESTRICTED ACCESS // JUDGES &amp; REGISTRARS ONLY
          </div>

          <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
            Comprehensive Case Records, Evidentiary Telemetry &amp; Precedent Intelligence.
          </h1>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Integrated judicial command environment connecting investigating officer reports, evidence chain-of-custody, monthly trial rosters, national criminal histories, and retrieval-augmented case law research.
          </p>

          <div className="grid grid-cols-3 gap-3 border-t border-border pt-6 font-mono text-xs">
            <div className="border border-border p-3 bg-elevated/40">
              <div className="text-[10px] text-muted-foreground uppercase">SECURITY</div>
              <div className="text-sm font-black text-[#e61919] mt-0.5">FIPS 140-3</div>
              <div className="text-[9.5px] text-muted-foreground">HSM Cryptography</div>
            </div>
            <div className="border border-border p-3 bg-elevated/40">
              <div className="text-[10px] text-muted-foreground uppercase">DISASTER RECOVERY</div>
              <div className="text-sm font-black text-foreground mt-0.5">RPO &le; 60s</div>
              <div className="text-[9.5px] text-muted-foreground">Continuous Cloud WAL</div>
            </div>
            <div className="border border-border p-3 bg-elevated/40">
              <div className="text-[10px] text-muted-foreground uppercase">PRECEDENTS</div>
              <div className="text-sm font-black text-foreground mt-0.5">42,000+</div>
              <div className="text-[9.5px] text-muted-foreground">Supreme &amp; High Court</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>GOVERNMENT OF INDIA // NATIONAL JUDICIAL DATA GRID PHASE III</span>
          <span className="text-[#e61919] font-bold">[AIR-GAPPED COMPLIANT]</span>
        </div>
      </div>

      {/* Right Login Action Panel */}
      <div className="flex flex-col justify-center bg-background p-8 md:p-14">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div>
            <div className="inline-block border border-[#e61919] bg-[#e61919]/10 px-2 py-0.5 text-[10px] font-bold text-[#e61919] uppercase tracking-wider mb-2">
              [AUTHENTICATION GATEWAY]
            </div>
            <h2 className="font-sans text-xl font-black uppercase text-foreground">
              Sign In To Bench Terminal
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Verify credentials with judicial identity token to decrypt case dockets.
            </p>
          </div>

          {err && (
            <div className="border border-[#e61919] bg-[#e61919]/10 p-3 text-xs text-[#e61919] font-bold">
              [!] {err}
            </div>
          )}

          {step === 'cred' ? (
            <form onSubmit={submitCred} className="space-y-4">
              <Field label="Judicial Identity / Email">
                <Input
                  type="email"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="name@ecourts.gov.in"
                  required
                />
              </Field>

              <Field label="Master Judicial PIN / Security Passkey">
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
                  <option value="Judge">Presiding Judge (Full Bench Authority)</option>
                  <option value="Clerk">Court Reader / Clerk (Drafting &amp; Registry)</option>
                  <option value="Admin">Audit Administrator (Security Oversight)</option>
                </Select>
              </Field>

              <Button type="submit" variant="hazard" size="lg" className="w-full">
                [ VERIFY CREDENTIALS &amp; REQUEST TOKEN ]
              </Button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-4">
              <div className="border border-border bg-elevated/40 p-3 text-xs space-y-1">
                <div className="text-muted-foreground">VERIFICATION TOKEN SENT:</div>
                <div className="font-bold text-foreground">Hardware Token PIV Challenge: #991420</div>
              </div>

              <Field label="Enter 6-Digit Hardware Token">
                <Input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center font-mono text-lg font-bold tracking-widest h-12"
                  autoFocus
                  required
                />
              </Field>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-1/3"
                  onClick={() => setStep('cred')}
                >
                  Back
                </Button>
                <Button type="submit" variant="hazard" size="md" className="w-2/3">
                  [ UNLOCK TERMINAL ]
                </Button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-border text-[10px] text-muted-foreground text-center">
            UNAUTHORIZED ACCESS IS PROSECUTABLE UNDER SECTION 66 OF THE IT ACT &amp; JUDICIAL PROTECTION STATUTES.
          </div>
        </div>
      </div>
    </div>
  )
}
