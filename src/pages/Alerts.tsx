import { useState } from 'react'
import { Link } from 'react-router'
import { BellOff, Check, CheckCheck, Lock } from 'lucide-react'
import { alertRows, findCase } from '../data'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Skeleton,
  StatusChip,
  Td,
  Th,
  useApp,
  useLoad,
} from '../ui'

export default function Alerts() {
  const loading = useLoad(400)
  const { role, toast } = useApp()
  const [rows, setRows] = useState(alertRows)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [th, setTh] = useState({ Criminal: 45, POCSO: 30, Matrimonial: 60, Civil: 90 })

  const act = (id: string, verb: string) => {
    setRows((r) => r.filter((x) => x.id !== id))
    toast(`Alert procedural status: ${verb}`)
  }
  const sevOrder = { overdue: 0, warning: 1, ontrack: 2 }
  const sorted = [...rows].sort((a, b) => sevOrder[a.sev] - sevOrder[b.sev])

  return (
    <>
      <PageHeader
        title="Delay & Limitation Alarms"
        sub="Statutory compliance triggers. Automatically calculates days elapsed against statutory schedules."
      />

      <Card className="mb-8 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<CheckCheck className="size-5 text-ok" />}
            title="All statutory deadlines compliant"
            text="No active alarms. New procedural notifications generate automatically as triggers fire."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-xs">
              <thead>
                <tr>
                  <Th>Case Identifier</Th>
                  <Th>Statutory Mandate Triggered</Th>
                  <Th>Urgency Level</Th>
                  <Th className="text-right">Elapsed Past Due</Th>
                  <Th>Registry Clerk</Th>
                  <Th>Procedural Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sorted.map((a) => {
                  const c = findCase(a.caseId)!
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <Td>
                        <Link
                          to={`/cases/${c.id}`}
                          className="font-mono text-xs font-medium text-accent hover:underline block"
                        >
                          {c.number}
                        </Link>
                      </Td>
                      <Td className="font-medium text-foreground">{a.rule}</Td>
                      <Td>
                        <StatusChip s={a.sev} />
                      </Td>
                      <Td className="text-right font-mono tabular-nums text-muted-foreground">
                        {a.days ? (
                          <span className="font-semibold text-bad">{a.days} days</span>
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td className="text-muted-foreground">{a.clerk}</Td>
                      <Td>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => act(a.id, 'acknowledged')}
                          >
                            <Check className="size-3" /> Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast('Snoozed for 2 judicial court days', 'info')}
                          >
                            <BellOff className="size-3" /> Snooze
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirm(a.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          num="Admin"
          title="Inactivity Alarm Thresholds"
          sub="Trigger procedural alarm when no activity or filing is logged after this number of days."
        />
        {role !== 'Admin' ? (
          <EmptyState
            icon={<Lock className="size-4" />}
            title="Administrator Privileges Required"
            text="Switch role to Admin from the top-right bench menu to configure procedural alarm parameters."
          />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(th) as (keyof typeof th)[]).map((k) => (
              <Field key={k} label={`${k} Roster (days)`}>
                <Input
                  type="number"
                  min={1}
                  value={th[k]}
                  onChange={(e) => setTh({ ...th, [k]: +e.target.value })}
                />
              </Field>
            ))}
            <div className="sm:col-span-2 lg:col-span-4 pt-2">
              <Button size="sm" onClick={() => toast('Threshold policies saved. Change logged.')}>
                Save Threshold Policies
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Mark procedural alarm as resolved?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                act(confirm!, 'resolved')
                setConfirm(null)
              }}
            >
              Confirm Resolution
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          Resolution logs your bench credentials in the registry audit trail and discharges the
          statutory alarm flag from the morning cause list.
        </p>
      </Modal>
    </>
  )
}
