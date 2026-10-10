import { useState } from 'react'
import { cases, findCase } from '../data'
import { PageHeader, Select } from '../ui'
import { Police } from './CaseDetail'

export default function PolicePage() {
  const [selectedId, setSelectedId] = useState('sc-214-2025')
  const c = findCase(selectedId) || cases[0]

  return (
    <>
      <PageHeader
        title="Police Activity & Malkhana Log"
        sub="Station diary entries, remand status, and forensic lab submissions."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Select case:</span>
            <Select
              aria-label="Select case"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {cases.map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.number} — {cs.policeStation}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      <div className="space-y-6">
        <Police c={c} />
      </div>
    </>
  )
}
