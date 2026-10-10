import { useState } from 'react'
import { Link } from 'react-router'
import {
  Scale,
  Search,
  ShieldCheck,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  Building,
} from 'lucide-react'
import { judicialStore, type LawyerRecord } from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Input,
  Tag,
  Th,
  Td,
  Select,
  useApp,
} from '../ui'

export default function Lawyers() {
  const { toast } = useApp()
  const lawyers = judicialStore.getLawyers()

  const [query, setQuery] = useState('')
  const [filterChapter, setFilterChapter] = useState('ALL')
  const [filterStanding, setFilterStanding] = useState('ALL')

  const totalWorkingInCourt = 1420
  const totalInDatabase = lawyers.length
  const activelyParticipatingCount = lawyers.filter((l) => l.isParticipatingInBench).length
  const verifiedCount = lawyers.filter((l) => l.clearanceStatus === 'VERIFIED').length

  const filteredLawyers = lawyers.filter((l) => {
    const q = query.trim().toLowerCase()
    const matchesQ =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.barNumber.toLowerCase().includes(q) ||
      l.chamber.toLowerCase().includes(q)

    const matchesChapter = filterChapter === 'ALL' || l.chapter === filterChapter
    const matchesStanding =
      filterStanding === 'ALL'
        ? true
        : filterStanding === 'SENIOR'
          ? l.standingYears >= 20
          : filterStanding === 'MID'
            ? l.standingYears >= 10 && l.standingYears < 20
            : l.standingYears < 10

    return matchesQ && matchesChapter && matchesStanding
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bar Council Advocate Database"
        sub="Statutory roster of legal counsel appearing before this Sessions Court. Enrolment credentials, standing years, and disciplinary clearance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => toast('Exported Advocate Standing Roll as PDF', 'ok')}
            >
              Export Standing Roll
            </Button>
          </div>
        }
      />

      {/* Top 4 Pastel Bento Metrics (Matching Images 2 & 4) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 rounded-3xl bg-[#FEF08A] text-amber-950">
          <div className="text-xs font-bold opacity-80">Total In Jurisdiction</div>
          <div className="text-2xl font-black mt-1">1,420 Advocates</div>
          <div className="text-[11px] opacity-75 mt-0.5">Gazetted Bar Roll</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FBCFE8] text-pink-950">
          <div className="text-xs font-bold opacity-80">Actively on Bench</div>
          <div className="text-2xl font-black mt-1">{activelyParticipatingCount} Advocates</div>
          <div className="text-[11px] opacity-75 mt-0.5">Active Vakalatnamas</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#BBF7D0] text-emerald-950">
          <div className="text-xs font-bold opacity-80">Good Standing Verified</div>
          <div className="text-2xl font-black mt-1">{verifiedCount} / {totalInDatabase}</div>
          <div className="text-[11px] opacity-75 mt-0.5">Bar Council Cleared</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#BFDBFE] text-blue-950">
          <div className="text-xs font-bold opacity-80">Bench Appearance Load</div>
          <div className="text-2xl font-black mt-1">58 Matters</div>
          <div className="text-[11px] opacity-75 mt-0.5">Across Trial Roster</div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search advocate name or bar number..."
              className="pl-9.5 h-10 text-xs rounded-full"
            />
          </div>

          <Select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="w-full rounded-full"
          >
            <option value="ALL">All State Chapters</option>
            <option value="Bar Council of Delhi">Bar Council of Delhi</option>
            <option value="Bar Council of Tamil Nadu & Puducherry">Bar Council of Tamil Nadu</option>
            <option value="Supreme Court Bar Association">Supreme Court Bar</option>
          </Select>

          <Select
            value={filterStanding}
            onChange={(e) => setFilterStanding(e.target.value)}
            className="w-full rounded-full"
          >
            <option value="ALL">All Seniority Tiers</option>
            <option value="SENIOR">Senior Counsel (20+ Years)</option>
            <option value="MID">Mid-Career (10 - 20 Years)</option>
            <option value="JUNIOR">Junior Advocates (&lt; 10 Years)</option>
          </Select>
        </div>
      </Card>

      {/* Lawyers Roster Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Advocate Roster Directory
            </h3>
            <p className="text-xs text-zinc-500">
              {filteredLawyers.length} legal counsel matching current filters
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <Th>BAR ENROLMENT NO.</Th>
                <Th>ADVOCATE NAME</Th>
                <Th>STATE CHAPTER</Th>
                <Th>STANDING</Th>
                <Th>ACTIVE CASES</Th>
                <Th>BENCH PARTICIPATION</Th>
                <Th>CLEARANCE</Th>
                <Th>CONTACT</Th>
              </tr>
            </thead>
            <tbody>
              {filteredLawyers.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-50/80 transition-colors">
                  <Td className="font-bold text-xs text-[#FF5C5C]">
                    {l.barNumber}
                  </Td>
                  <Td>
                    <div className="font-bold text-xs text-zinc-900">{l.name}</div>
                    <div className="text-[11px] text-zinc-500">{l.chamber}</div>
                  </Td>
                  <Td className="text-xs text-zinc-700">
                    {l.chapter}
                  </Td>
                  <Td className="text-xs">
                    <span className="font-bold">{l.standingYears}</span> Yrs
                  </Td>
                  <Td className="text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 font-bold text-zinc-800">
                      {l.activeCasesCount} Cases
                    </span>
                  </Td>
                  <Td className="text-xs">
                    {l.isParticipatingInBench ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Active on Bench
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[11px]">
                        Inactive
                      </span>
                    )}
                  </Td>
                  <Td className="text-xs">
                    {l.clearanceStatus === 'VERIFIED' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px]">
                        Provisional
                      </span>
                    )}
                  </Td>
                  <Td className="text-[11px] text-zinc-500">
                    <div>{l.phone}</div>
                    <div className="text-[10px] text-zinc-400">{l.email}</div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
