import { useState } from 'react'
import { Link } from 'react-router'
import {
  Search,
  ShieldAlert,
  Fingerprint,
  User,
  AlertTriangle,
  History,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { judicialStore, type CriminalRecord } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Tag,
  useApp,
} from '../ui'

export default function Criminals() {
  const { toast } = useApp()
  const criminals = judicialStore.getCriminals()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? judicialStore.searchCriminals(query)
    : criminals

  return (
    <div className="space-y-6">
      <PageHeader
        title="National Criminal History Index"
        sub="Searchable directory of criminal career dossiers, recidivism behavioral risk metrics, biometric hashes, and documented convictions."
        actions={
          <span className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-bold">
            Audited Bench Access Only
          </span>
        }
      />

      {/* Search Input Bar (Matching Image 1 & 2) */}
      <Card className="p-3.5 bg-white shadow-xs">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search criminals by name, alias, or criminal ID (e.g. Rahul Verma, CRIM-2024-8819)..."
            className="pl-13 pr-6 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
          />
        </div>
      </Card>

      {/* Criminal Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="p-16 text-center text-xs text-zinc-400 space-y-2">
          <User className="size-8 mx-auto text-zinc-300" />
          <p className="font-extrabold text-sm text-zinc-700">No Criminal Dossiers Found</p>
          <p className="text-[11px] text-zinc-400">The criminal record register is clean. Accused persons will be registered upon case filing.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const isHighRisk = c.recidivismScore >= 0.7
            return (
              <Card key={c.id} className="p-5.5 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-black/[0.05] pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-[#FEF08A] text-amber-950 font-bold text-sm grid place-items-center shadow-xs">
                      {c.photoPlaceholder}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground">
                        {c.name}
                      </h3>
                      <div className="text-xs font-bold text-[#FF5C5C]">
                        {c.crimId}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                      isHighRisk
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {(c.recidivismScore * 100).toFixed(0)}% Risk
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Aliases:</span>
                    <span className="font-semibold text-zinc-800 text-right">{c.aliases.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Age / DOB:</span>
                    <span className="text-zinc-800 font-medium">{c.age} Yrs ({c.dob})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Custody:</span>
                    <span className={`font-bold ${c.custodyStatus === 'In custody' ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {c.custodyStatus}
                    </span>
                  </div>

                  {c.activeCaseNumber && (
                    <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-[11px]">
                      <span className="text-zinc-500 block text-[10px]">Active Bench Trial:</span>
                      <span className="font-bold text-[#FF5C5C]">{c.activeCaseNumber}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-black/[0.05]">
                    <div className="text-[11px] font-bold text-zinc-500 mb-1">
                      Prior Crimes: {c.crimes.length} Offenses
                    </div>
                    <div className="space-y-1">
                      {c.crimes.slice(0, 2).map((crm, idx) => (
                        <div key={idx} className="text-[11px] text-zinc-600 truncate">
                          • {crm.date}: {crm.charges.join(', ')} ({crm.verdict})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.05] mt-3">
                <Link to={`/criminals/${c.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Complete Criminal Dossier
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
        </div>
      )}
    </div>
  )
}
