import { Link } from 'react-router'
import {
  Scale,
  Shield,
  Sparkles,
  Gavel,
  BookOpen,
  FileCheck,
  Cpu,
  Clock,
  ArrowRight,
  Database,
  Lock,
  Layers,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react'
import { Card, Button } from '../ui'

export default function About() {
  const capabilities = [
    {
      icon: Scale,
      color: 'bg-[#FEF08A] text-amber-950',
      badge: 'Core Registry',
      title: 'Judicial Case Management & Docketing',
      desc: 'End-to-end trial lifecycle tracking compliant with National Judicial Data Grid (NJDG) standards. Standardized FIR intake, statutory category validation, and instant docket indexing.',
    },
    {
      icon: Shield,
      color: 'bg-[#FBCFE8] text-pink-950',
      badge: 'Evidentiary Security',
      title: 'Digital Evidence & Chain of Custody',
      desc: 'Tamper-evident evidentiary repository for weapon registries, ballistic balloting, chemical forensic reports, and physical custody transfers with SHA-256 cryptographic verification.',
    },
    {
      icon: Sparkles,
      color: 'bg-[#BBF7D0] text-emerald-950',
      badge: 'AI Intelligence',
      title: 'Retrieval-Augmented Precedent Research',
      desc: 'Bench-ready precedent synthesis over 42,000+ Supreme Court and High Court judgments. Instant statutory mapping across IPC, CrPC, Bharatiya Nyaya Sanhita (BNS), POCSO, and NDPS.',
    },
    {
      icon: Clock,
      color: 'bg-[#BFDBFE] text-blue-950',
      badge: 'Courtroom Ops',
      title: 'Interactive Cause Roster & Remand Engine',
      desc: 'Automated daily trial rosters, in-camera hearing scheduling, statutory remand calculation, and multi-tier statutory compliance alarms to prevent procedural adjournments.',
    },
    {
      icon: Users,
      color: 'bg-[#E9D5FF] text-purple-950',
      badge: 'Criminal Telemetry',
      title: 'Comprehensive Offender Dossiers',
      desc: 'Consolidated criminal histories, prior conviction ledgers, alias matching, biometric markers, and bail suitability evaluations accessible to presiding judges in one click.',
    },
    {
      icon: Gavel,
      color: 'bg-[#FEF08A] text-amber-950',
      badge: 'Decree Studio',
      title: 'Automated Judgment & Decree Generation',
      desc: 'Standardized decree builder with judicial seal watermarking, structured legal reasoning frameworks, and print-ready PDF export for formal court distribution.',
    },
  ]

  const stats = [
    { label: 'Active Bench Records', value: '14,200+', detail: 'Indexed trial dockets' },
    { label: 'Indexed Precedents', value: '42,000+', detail: 'SC & HC ratio decidendi' },
    { label: 'Security Cryptography', value: 'FIPS 140-3', detail: 'Hardware HSM enabled' },
    { label: 'Disaster Recovery', value: 'RPO ≤ 60s', detail: 'Encrypted cloud WAL' },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#141518] text-white p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#FF5C5C] backdrop-blur-md">
            <span className="size-2 rounded-full bg-[#FF5C5C] animate-pulse" />
            <span>MERCY PLATFORM ARCHITECTURE // MERCY</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            The Digital Operating System for Sovereign Courts &amp; Judicial Benches.
          </h1>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            MERCY is an integrated judicial command environment designed to eliminate trial backlog, safeguard evidentiary chain-of-custody, and empower presiding officers with real-time statutory research.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/">
              <button
                type="button"
                className="rounded-full bg-[#FF5C5C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#EE4B4B] transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <span>Launch Judicial Bench</span>
                <ArrowRight className="size-3.5" />
              </button>
            </Link>

            <Link to="/research">
              <button
                type="button"
                className="rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all border border-white/15 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="size-3.5 text-amber-300" />
                <span>Explore AI Precedents</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Decorative Ambient Background Elements */}
        <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-[#FF5C5C]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-10 top-10 size-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Platform Telemetry / Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-1 hover:shadow-md transition-shadow"
          >
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              {s.label}
            </div>
            <div className="text-2xl font-black text-foreground tracking-tight">
              {s.value}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Core Offerings & Modules Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              What MERCY Delivers
            </h2>
            <p className="text-xs text-zinc-500">
              Purpose-built courtroom modules engineered for transparency, evidentiary integrity, and swift justice.
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-400">
            6 Core Judicial Pillars
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <Card key={c.title} className="p-6 space-y-3.5 bg-white hover:border-black/20 transition-all">
              <div className="flex items-center justify-between">
                <div className={`grid size-10 place-items-center rounded-2xl ${c.color} shadow-xs`}>
                  <c.icon className="size-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-black/10 text-zinc-600 uppercase tracking-wider">
                  {c.badge}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-foreground leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Security & Compliance Foundation */}
      <Card className="p-8 bg-[#FAF7F0] border border-black/[0.08] space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            <CheckCircle2 className="size-3.5" />
            <span>Sovereign Security Standard</span>
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Government Compliance &amp; Institutional Trust
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            All judicial proceedings require unbreakable evidentiary guarantees. MERCY implements cryptographic ledgers and strict role segregation across all court tiers.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-black/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Lock className="size-4 text-[#FF5C5C]" />
              <span>Role-Based Air-Gapping</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Presiding Judges, Court Clerks, and Audit Administrators operate within compartmentalized privilege boundaries.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Database className="size-4 text-blue-600" />
              <span>Full Supabase / PostgreSQL Support</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Row-Level Security (RLS) protects all case files with fallback local state preview when cloud keys are offline.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <FileCheck className="size-4 text-emerald-600" />
              <span>Audit Logging &amp; Immutability</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Every document view, evidence access, and bail order modification is permanently recorded in an immutable audit ledger.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
