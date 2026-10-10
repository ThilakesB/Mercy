import { useState } from 'react'
import { Check, Lock, Minus, UserPlus } from 'lucide-react'
import { auditLog, permissions, users } from '../data'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Modal,
  PageHeader,
  Switch,
  Tabs,
  Tag,
  Td,
  Th,
  useApp,
} from '../ui'

export default function Admin() {
  const { role, toast } = useApp()
  const [tab, setTab] = useState('Users & roles')
  const [list, setList] = useState(users)
  const [off, setOff] = useState<string | null>(null)
  const [mask, setMask] = useState({ victim: true, minor: true, matrimonial: true, export: true })

  if (role !== 'Admin')
    return (
      <>
        <PageHeader title="Access Governance & Security Controls" />
        <Card>
          <EmptyState
            icon={<Lock className="size-4" />}
            title="Access Restricted to System Administrators"
            text="Switch role to Admin from the top-right user menu to inspect permission matrix and access governance."
          />
        </Card>
      </>
    )

  return (
    <>
      <PageHeader
        title="Access Governance & Audit Trail"
        sub="Role-based access matrix, active staff sessions, and statutory masking policies."
        actions={
          <Button size="sm" onClick={() => toast('Judicial staff invitation dispatched', 'info')}>
            <UserPlus className="size-3.5" /> Invite Registry Staff
          </Button>
        }
      />

      <Tabs
        tabs={['Users & roles', 'Permission matrix', 'Audit log', 'Masking policies']}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-6">
        {tab === 'Users & roles' && (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead>
                <tr>
                  <Th>Registry Staff Name</Th>
                  <Th>Judicial e-ID</Th>
                  <Th>Assigned Role</Th>
                  <Th>Last Authentication</Th>
                  <Th>Access Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {list.map((u) => (
                  <tr key={u.email} className="hover:bg-white/[0.02]">
                    <Td className="font-medium text-foreground">{u.name}</Td>
                    <Td className="font-mono text-muted-foreground">{u.email}</Td>
                    <Td>
                      <Tag>{u.role}</Tag>
                    </Td>
                    <Td className="font-mono text-muted-foreground">{u.last}</Td>
                    <Td>
                      <Switch
                        label={`Access for ${u.name}`}
                        checked={u.active}
                        onChange={(v) =>
                          v
                            ? setList(
                                list.map((x) =>
                                  x.email === u.email ? { ...x, active: true } : x,
                                ),
                              )
                            : setOff(u.email)
                        }
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'Permission matrix' && (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr>
                  <Th>Judicial Capability</Th>
                  <Th className="text-center">Presiding Judge</Th>
                  <Th className="text-center">Court Clerk</Th>
                  <Th className="text-center">Administrator</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {permissions.map((p) => (
                  <tr key={p.perm} className="hover:bg-white/[0.02]">
                    <Td className="font-medium text-foreground">{p.perm}</Td>
                    {(['Judge', 'Clerk', 'Admin'] as const).map((r) => (
                      <Td key={r} className="text-center">
                        {p[r] ? (
                          <Check className="mx-auto size-3.5 text-ok" aria-label="Permitted" />
                        ) : (
                          <Minus className="mx-auto size-3.5 text-muted-foreground/40" aria-label="Denied" />
                        )}
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'Audit log' && (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr>
                  <Th>Timestamp</Th>
                  <Th>Authenticated User</Th>
                  <Th>Executed Action</Th>
                  <Th>Target Identifier</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditLog.map((a, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <Td className="font-mono text-muted-foreground">{a.t}</Td>
                    <Td className="font-medium text-foreground">{a.user}</Td>
                    <Td className="text-foreground">{a.action}</Td>
                    <Td className="font-mono text-accent">{a.target}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'Masking policies' && (
          <Card>
            <CardHeader
              title="Vulnerable Identity Masking Standards"
              sub="Applied universally across cause lists, searches, exported PDFs, and synthesized digests."
            />
            {[
              [
                'victim',
                'Mask victim names in all views',
                'Statutory requirement under Indian Penal / BNSS code for sexual offences',
              ],
              [
                'minor',
                'Mask minors and their legal guardians (POCSO s.23)',
                'Mandatory statutory rule: cannot be overridden by any role',
              ],
              [
                'matrimonial',
                'Mask party names in matrimonial family disputes',
                'Presiding judges may unmask with mandatory audit logging',
              ],
              [
                'export',
                'Enforce masking on printouts and certified exports',
                'Applies certified digital watermark and anonymized names',
              ],
            ].map(([k, l, h]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-0"
              >
                <div>
                  <p className="text-xs font-medium text-foreground">{l}</p>
                  {h && <p className="font-mono text-[10.5px] text-muted-foreground">{h}</p>}
                </div>
                <Switch
                  label={l}
                  checked={mask[k as keyof typeof mask]}
                  onChange={(v) => {
                    if (k === 'minor' || k === 'victim')
                      return toast(
                        'This statutory rule is mandatory and cannot be disabled.',
                        'bad',
                      )
                    setMask({ ...mask, [k]: v })
                    toast('Masking policy updated')
                  }}
                />
              </div>
            ))}
          </Card>
        )}
      </div>

      <Modal
        open={!!off}
        onClose={() => setOff(null)}
        title="Revoke Judicial Registry Access?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOff(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setList(list.map((x) => (x.email === off ? { ...x, active: false } : x)))
                toast('Access revoked and logged to registry')
                setOff(null)
              }}
            >
              Revoke Access
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          This staff member will be signed out immediately and their session invalidated across
          all bench terminals. Revocation is permanently recorded in the immutable audit log.
        </p>
      </Modal>
    </>
  )
}
