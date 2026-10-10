import { useState } from 'react'
import { Button, Card, CardHeader, PageHeader, Select, Switch, useApp } from '../ui'

export default function Settings() {
  const { role, toast } = useApp()
  const [n, setN] = useState({ overdue: true, deadline: true, digest: false, sms: false })
  const [lang, setLang] = useState('English')
  const [timeout, setTimeoutV] = useState('15')

  const Row = ({
    label,
    hint,
    children,
  }: {
    label: string
    hint?: string
    children: React.ReactNode
  }) => (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-0">
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        {hint && <p className="font-mono text-[10.5px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )

  return (
    <>
      <PageHeader
        title="Bench Preferences & Terminal Profile"
        sub={`Authenticated as ${role}. Security and notification configurations apply to this terminal session.`}
      />

      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader num="01" title="Procedural Notifications & Alarms" />
          <Row label="Overdue Statutory Case Alerts" hint="Immediate alert on POCSO or chargesheet deadline lapse">
            <Switch
              label="Overdue alerts"
              checked={n.overdue}
              onChange={(v) => setN({ ...n, overdue: v })}
            />
          </Row>
          <Row label="Limitation Deadlines Within 7 Days" hint="Notice for pending forensic submissions and witness examination">
            <Switch
              label="Deadline alerts"
              checked={n.deadline}
              onChange={(v) => setN({ ...n, deadline: v })}
            />
          </Row>
          <Row label="Daily 8:00 AM Cause List Digest" hint="Dispatches encrypted summary of the morning roll to official email">
            <Switch
              label="Daily digest"
              checked={n.digest}
              onChange={(v) => setN({ ...n, digest: v })}
            />
          </Row>
          <Row label="SMS Critical Breach Alerts" hint="Dispatches SMS for malkhana custody alerts and statutory bail limits">
            <Switch
              label="SMS alerts"
              checked={n.sms}
              onChange={(v) => setN({ ...n, sms: v })}
            />
          </Row>
        </Card>

        <Card>
          <CardHeader num="02" title="Language & Editorial Visuals" />
          <Row label="Court Registry Interface Language">
            <Select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option>English</option>
              <option>தமிழ்</option>
              <option>हिन्दी</option>
            </Select>
          </Row>
          <Row label="Visual Theme" hint="Designed for prolonged bench readability and optical comfort">
            <span className="font-mono text-xs text-muted-foreground">Warm Dark Charcoal (High Contrast)</span>
          </Row>
        </Card>

        <Card>
          <CardHeader num="03" title="Bench Terminal Security" />
          <Row label="Automatic Inactivity Screen Lock">
            <Select value={timeout} onChange={(e) => setTimeoutV(e.target.value)}>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes (Standard)</option>
              <option value="30">30 minutes</option>
            </Select>
          </Row>
          <Row label="Active Registry Sessions" hint="Chennai Principal Sessions Court · Windows Desktop · Current Terminal">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast('All remote bench sessions terminated', 'info')}
            >
              Terminate Other Sessions
            </Button>
          </Row>
        </Card>

        <div className="pt-2">
          <Button size="sm" onClick={() => toast('Terminal configurations saved successfully')}>
            Save Preferences
          </Button>
        </div>
      </div>
    </>
  )
}
