import { useState } from 'react'
import { Link } from 'react-router'
import {
  FileText,
  Printer,
  Scale,
  Sparkles,
} from 'lucide-react'
import { cases, findCase } from '../data'
import { Button, PageHeader, Select, useApp } from '../ui'
import { Timeline } from './CaseDetail'

export default function TimelinePage() {
  const [selectedId, setSelectedId] = useState('sc-214-2025')
  const { toast } = useApp()
  const c = findCase(selectedId) || cases[0]

  return (
    <>
      <PageHeader
        title="Court & Investigation Workflow Tree"
        sub="Statutory branching timeline connecting case inception, police recovery, committal orders, and scheduled trial hearings."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => toast(`Certified timeline audit generated for ${c.number}`, 'ok')}
            >
              <Printer className="size-3.5" /> Export Tree Report
            </Button>
            <Link to={`/cases/${c.id}`}>
              <Button variant="outline" size="sm">
                <FileText className="size-3.5" /> View Case File
              </Button>
            </Link>
            <Link to="/summary">
              <Button variant="outline" size="sm">
                <Sparkles className="size-3.5" /> AI Case Digest
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Case Switcher Strip (Clean Light Monochrome) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-zinc-50/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Scale className="size-3.5 text-black" /> Active Matter:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {cases.map((cs) => {
              const isActive = cs.id === selectedId

              return (
                <button
                  key={cs.id}
                  onClick={() => setSelectedId(cs.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-black text-white font-semibold border-black shadow-sm'
                      : 'bg-white text-zinc-700 hover:text-black border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <span>{cs.number}</span>
                  <span className="opacity-70 text-[10px]">({cs.type})</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">Select by title:</span>
          <Select
            aria-label="Select case"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-56 text-xs"
          >
            {cases.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.number} — {cs.title.slice(0, 28)}...
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <Timeline c={c} />
      </div>
    </>
  )
}
