import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  Gavel,
  Scale,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  User,
  Users,
  Shield,
  BookOpen,
  Award,
  History,
  ChevronRight,
  Filter,
  Search,
  Save,
  Printer,
  Eye,
  RefreshCw,
  Lock,
  Check,
  ChevronDown,
  Layers,
  FolderOpen,
  ArrowRight,
  Hash,
  FileSpreadsheet,
  AlertTriangle,
  FileCode,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react"
import {
  judicialStore,
  type FullCaseRecord,
  type PunishmentType,
} from "../lib/judicialStore"
import {
  Button,
  Card,
  CardHeader,
  PageHeader,
  Field,
  Input,
  Select,
  Tag,
  useApp,
} from "../ui"

// Available Tab Navigation for the 11 judgment-focused sections
type TabKey = "dossier" | "evidence" | "analysis" | "draft" | "approval"

interface IssueItem {
  id: string
  number: number
  question: string
  finding: "PROVED_BEYOND_DOUBT" | "NOT_PROVED" | "PARTIALLY_ESTABLISHED"
  reasoning: string
}

interface WitnessItem {
  id: string
  code: string
  name: string
  role: "Eyewitness" | "Medical Officer" | "Forensic Expert" | "Investigating Officer" | "Defense Witness"
  depositionSummary: string
  crossExamHighlight: string
  credibility: "High" | "Corroborated" | "Doubtful"
}

interface PrecedentItem {
  id: string
  citation: string
  court: string
  bench: string
  proposition: string
  relevance: string
}

interface JudgmentVersion {
  version: string
  timestamp: string
  author: string
  note: string
  content: string
}

export default function CasesNew() {
  const { toast, role } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<TabKey>("dossier")
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")

  // 1. Existing Case Information & Ingestion Fields (Fully preserved & reused)
  const [jurisdiction, setJurisdiction] = useState("DL")
  const [caseType, setCaseType] =
    useState<"Criminal" | "POCSO" | "Matrimonial" | "Civil">("Criminal")
  const [year] = useState(2026)
  const [policePrecinct, setPolicePrecinct] = useState("PSCT")
  const [complainant, setComplainant] = useState("State (NCT of Delhi)")
  const [primaryAccused, setPrimaryAccused] = useState("Vikas Yadav")
  const [coAccusedCount, setCoAccusedCount] = useState(1)
  const [statuteSection, setStatuteSection] = useState(
    "BNS s.103 / Arms Act s.25",
  )

  // IO Details (Preserved)
  const [ioName, setIoName] = useState("Insp. Pradeep Rawat")
  const [ioBadge, setIoBadge] = useState("DL-POL-9921")
  const [ioStation, setIoStation] = useState(
    "PS Cyber Thana / Special Crime Unit",
  )
  const [ioPhone, setIoPhone] = useState("+91-98110-33412")

  // Evidence & FIR (Preserved)
  const [firNo, setFirNo] = useState("29/2026")
  const [firDate, setFirDate] = useState("2026-03-14")
  const [weaponType, setWeaponType] = useState(
    "Country-made .32 bore pistol with defaced serial number",
  )
  const [initialEvidence, setInitialEvidence] = useState(
    "Ballistic recovery memo under Sec 27 & CCTV extract",
  )

  // Procedural History & Stage
  const [committalDate, setCommittalDate] = useState("2026-04-10")
  const [chargeFramingDate, setChargeFramingDate] = useState("2026-05-15")
  const [prosecutionEvidenceClosure, setProsecutionEvidenceClosure] =
    useState("2026-08-20")
  const [accusedStatementDate, setAccusedStatementDate] = useState("2026-09-05")
  const [finalArgumentsDate, setFinalArgumentsDate] = useState("2026-10-02")

  // 2. Parties and Legal Representatives
  const [prosecutorName, setProsecutorName] = useState(
    "Adv. Sandeep Bhardwaj (Public Prosecutor)",
  )
  const [defenseCounselName, setDefenseCounselName] = useState(
    "Adv. Maninder Singh (Senior Defense Advocate)",
  )
  const [victimName, setVictimName] = useState(
    "Sanjay Singhal (Deceased / Aggrieved Party)",
  )

  // 3. Issues for Determination
  const [issues, setIssues] = useState<IssueItem[]>([
    {
      id: "iss-1",
      number: 1,
      question:
        "Whether the prosecution has established beyond reasonable doubt that the accused caused the death of the deceased with premeditated intention under BNS s.103?",
      finding: "PROVED_BEYOND_DOUBT",
      reasoning:
        "Corroborated by eyewitness PW-2, FSL Ballistic striation match (Ex. P-3), and motive evidence.",
    },
    {
      id: "iss-2",
      number: 2,
      question:
        "Whether the recovery of the firearm from the abandoned warehouse satisfies the legal requisites of Section 27 Bharatiya Sakshya Adhiniyam / IEA?",
      finding: "PROVED_BEYOND_DOUBT",
      reasoning:
        "Direct disclosure statement by accused led exclusively to discovery of the firearm in presence of independent panch witness PW-4.",
    },
    {
      id: "iss-3",
      number: 3,
      question:
        "Whether the defense plea of alibi under Section 11 BSA / IEA is substantiated by credible documentary proof?",
      finding: "NOT_PROVED",
      reasoning:
        "Defense failed to produce corroborative CDR records or attendance logs; DW-1 testimony suffered from self-contradictions.",
    },
  ])

  // 4. Evidence & Exhibits Manifest
  const [exhibits, setExhibits] = useState([
    {
      id: "ex-1",
      code: "Ex. P-1",
      title: "FIR No. 29/2026 Original Registration Record",
      admittedBy: "PW-1 (Duty Officer)",
      status: "Admitted in Evidence",
    },
    {
      id: "ex-2",
      code: "Ex. P-2",
      title: "Post-Mortem Autopsy Report (Cause: Gunshot Trauma)",
      admittedBy: "PW-3 (Medical Officer)",
      status: "Admitted in Evidence",
    },
    {
      id: "ex-3",
      code: "Ex. P-3",
      title: "FSL Ballistics Certificate (Cartridge striation match)",
      admittedBy: "PW-4 (Ballistics Expert)",
      status: "Admitted in Evidence",
    },
    {
      id: "ex-4",
      code: "Ex. P-4",
      title: "Seizure Memo & Disclosure Statement u/s 27",
      admittedBy: "PW-5 (Lead IO)",
      status: "Admitted in Evidence",
    },
    {
      id: "ex-5",
      code: "Ex. D-1",
      title: "Purported Toll Plaza Receipt submitted by Defense",
      admittedBy: "DW-1 (Defense)",
      status: "Marked (Disputed Integrity)",
    },
  ])

  // 5. Witnesses and Forensic Reports
  const [witnesses, setWitnesses] = useState<WitnessItem[]>([
    {
      id: "wit-1",
      code: "PW-1",
      name: "Dr. Ramesh Chandra",
      role: "Medical Officer",
      depositionSummary:
        "Conducted post-mortem examination. Affirmed firearm entry wound at close range; death instantaneous due to shock and hemorrhage.",
      crossExamHighlight:
        "Confirmed wound angle strictly consistent with prosecution timeline.",
      credibility: "High",
    },
    {
      id: "wit-2",
      code: "PW-2",
      name: "Mohit Khurana",
      role: "Eyewitness",
      depositionSummary:
        "Present at spot. Identified accused Vikas Yadav brandishing firearm and discharging shots.",
      crossExamHighlight:
        "Testimony remained unshaken despite extensive cross-examination on lighting conditions.",
      credibility: "Corroborated",
    },
    {
      id: "wit-3",
      code: "PW-3",
      name: "Dr. S. K. Sen (Senior Scientific Officer, FSL)",
      role: "Forensic Expert",
      depositionSummary:
        "Examined seized .32 bore country pistol and recovered spent cartridge. Striation marks match test fires to 99.4% probability.",
      crossExamHighlight: "No tampering found with sealed specimen bag.",
      credibility: "High",
    },
    {
      id: "wit-4",
      code: "DW-1",
      name: "Suraj Bhan",
      role: "Defense Witness",
      depositionSummary:
        "Claimed accused was present at his residential farmhouse in Haryana at time of alleged incident.",
      crossExamHighlight:
        "Unable to present phone location data or contemporaneous transport proof.",
      credibility: "Doubtful",
    },
  ])

  // 6. Applicable Laws & Binding Precedents
  const [precedents] = useState<PrecedentItem[]>([
    {
      id: "prec-1",
      citation:
        "Sharad Birdhichand Sarda v. State of Maharashtra (1984) 4 SCC 116",
      court: "Supreme Court of India",
      bench: "Three Judge Bench",
      proposition:
        "Five golden principles (Panchsheel) governing circumstantial evidence: chain must be complete and point unerringly to guilt.",
      relevance:
        "Applies to circumstantial corroboration of ballistic chain and motive telemetry.",
    },
    {
      id: "prec-2",
      citation: "Pulukuri Kottaya v. Emperor (1947) AIR PC 67",
      court: "Privy Council / Supreme Court of India",
      bench: "Full Bench",
      proposition:
        "Discovery of fact pursuant to disclosure statement is admissible only to the extent it relates distinctly to fact discovered.",
      relevance:
        "Validates Ex. P-4 recovery of firearm from hidden wall cavity.",
    },
    {
      id: "prec-3",
      citation: "State of Rajasthan v. Kalki (1981) 2 SCC 752",
      court: "Supreme Court of India",
      bench: "Division Bench",
      proposition:
        "Normal discrepancies in eyewitness testimony are natural; do not erode core substratum of truth.",
      relevance:
        "Neutralizes defense objection on minor 10-minute time variance in PW-2 statement.",
    },
  ])

  // 7. Submissions & Arguments
  const [prosecutionSubmissions, setProsecutionSubmissions] = useState(
    "The prosecution has established a seamless chain of evidence: eye-witness PW-2 directly witnessed the shooting; ballistic report Ex. P-3 positively links the recovered pistol to the fatal bullet; Section 27 recovery is unimpeachable; and motive is established through prior hostility. Guilt is proven beyond all reasonable doubt.",
  )
  const [defenseSubmissions, setDefenseSubmissions] = useState(
    "The defense contends that the prosecution case suffers from material lacunae: independent public witnesses were not joined during seizure; lighting conditions at scene were inadequate; and the accused was falsely implicated due to business rivalry while he was in Haryana. Plea of reasonable doubt is urged.",
  )
  const [judicialAnalysis, setJudicialAnalysis] = useState(
    "Upon careful scrutiny of the record, the ocular evidence of PW-2 inspires immense confidence and is fully corroborated by the objective scientific report of FSL Ballistics Expert PW-3. The discovery of the country pistol u/s 27 conforms strictly with the test laid down in Pulukuri Kottaya. The alibi set up by the defense is an afterthought lacking any documentary backing. The prosecution has discharged its burden.",
  )

  // 8. Draft Judgment Editor State
  const [judgmentTitle, setJudgmentTitle] = useState(
    "IN THE COURT OF THE PRINCIPAL SESSIONS JUDGE, BENCH 04",
  )
  const [judgmentCoram, setJudgmentCoram] = useState(
    "PRESIDING: HON. JUSTICE R. VENKATARAMAN",
  )
  const [judgmentVerdict, setJudgmentVerdict] =
    useState<"CONVICTION" | "ACQUITTAL" | "RE-TRIAL">("CONVICTION")
  const [sentencingTermMonths, setSentencingTermMonths] = useState(240) // 20 years or Life
  const [fineAmount, setFineAmount] = useState(50000)
  const [judgmentText, setJudgmentText] =
    useState(`1. The accused Vikas Yadav stands charged with committing the offense of murder punishable under Section 103 of the Bharatiya Nyaya Sanhita, 2023 and Section 25 of the Arms Act, 1959.

2. FACTUAL MATRIX: On 14.03.2026, pursuant to FIR No. 29/2026 registered at Police Station Cyber Thana, the prosecution alleged that the accused fired multiple gunshots resulting in the death of Sanjay Singhal.

3. EVALUATION OF EVIDENCE: The ocular testimony of PW-2 is clear, cogent, and unimpeached. The scientific evidence by way of Ex. P-3 (FSL Ballistics report) conclusively establishes that the fatal cartridge was discharged from the .32 bore country pistol recovered from the exclusive possession of the accused under Section 27 discovery memo.

4. FINDINGS ON ISSUES: The court finds that Issue No. 1 and Issue No. 2 are proved beyond reasonable doubt in favor of the prosecution. The defense plea of alibi (Issue No. 3) is rejected as uncorroborated.

5. OPERATIVE ORDER & DECREE: The accused Vikas Yadav is held GUILTY and CONVICTED for offenses under BNS Section 103 and Arms Act Section 25. He is sentenced to Rigorous Imprisonment for Life (minimum 20 years) and ordered to pay a fine of Rs. 50,000/-, in default to undergo further Simple Imprisonment for 6 months. Compensation of Rs. 40,000/- out of the fine amount shall be remitted to the next of kin of the deceased victim.`)

  // Version History State
  const [versions, setVersions] = useState<JudgmentVersion[]>([
    {
      version: "v1.0",
      timestamp: "2026-10-09 11:30 IST",
      author: "Bench Clerk (Initial Synthesis)",
      note: "Auto-compiled from charge-sheet and FSL ballistic filings",
      content: judgmentText,
    },
    {
      version: "v1.1",
      timestamp: "2026-10-10 16:45 IST",
      author: "Hon. Justice R. Venkataraman",
      note: "Added Supreme Court citations & detailed sentencing decree",
      content: judgmentText,
    },
  ])

  // 9. Review & Approval Checklist
  const [checklist, setChecklist] = useState({
    chargesAnswered: true,
    evidenceChainCertified: true,
    accusedExamined313: true,
    victimCompensationAssessed: true,
    operativeDecreeCalculated: true,
  })

  const [isFinalizing, setIsFinalizing] = useState(false)

  // Live Auto-Numbering Computation (Reused from existing engine)
  const preview = judicialStore.generateCaseNumberAndName({
    jurisdictionCode: jurisdiction,
    caseType,
    year,
    policeStationCode: policePrecinct,
    primaryComplainant: complainant,
    primaryAccused,
    coAccusedCount,
    primaryStatuteSection: statuteSection,
  })

  // List of existing registered cases in store to optionally review/draft for
  const existingCases = judicialStore.getCases()

  // Pre-load from URL param if available
  useEffect(() => {
    const caseIdParam = searchParams.get("caseId")
    if (caseIdParam) {
      handleLoadExistingCase(caseIdParam)
    }
  }, [searchParams])

  // Load existing case data if selected
  const handleLoadExistingCase = (caseId: string) => {
    setSelectedCaseId(caseId)
    const found = judicialStore.getCase(caseId)
    if (!found) return

    setCaseType(found.type)
    setStatuteSection(found.acts.join(" / "))
    if (found.fir) {
      setFirNo(found.fir.no)
      setFirDate(found.fir.date)
    }
    if (found.policeStation) {
      setIoStation(found.policeStation)
    }
    if (found.io) {
      setIoName(found.io.name)
      setIoBadge(found.io.badge)
      setIoPhone(found.io.phone)
      setIoStation(found.io.policeStation)
    }
    const acc = found.parties.find((p) =>
      p.role.toLowerCase().includes("accused"),
    )
    const comp = found.parties.find(
      (p) =>
        p.role.toLowerCase().includes("complainant") ||
        p.role.toLowerCase().includes("prosecutor"),
    )
    if (acc) setPrimaryAccused(acc.name)
    if (comp) setComplainant(comp.name)

    if (found.weapons && found.weapons.length > 0) {
      setWeaponType(found.weapons[0].makeModel || found.weapons[0].type)
    }
    if (found.evidence && found.evidence.length > 0) {
      setInitialEvidence(found.evidence[0].title)
    }

    toast(
      `Case docket ${found.number} loaded into Final Judgment workspace.`,
      "ok",
    )
  }

  // Handle Save Draft
  const handleSaveDraft = () => {
    const newVersion: JudgmentVersion = {
      version: `v1.${versions.length}`,
      timestamp:
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) +
        " IST",
      author: `${role} (${
        role === "Judge" ? "Presiding Magistrate" : "Court Master"
      })`,
      note: "Judicial analysis & operative order update",
      content: judgmentText,
    }
    setVersions([newVersion, ...versions])
    toast(
      `Draft Judgment ${newVersion.version} saved and stored in judicial vault.`,
      "ok",
    )
  }

  // Handle Pronounce & Finalize Judgment
  const handleFinalizeJudgment = () => {
    if (
      !checklist.chargesAnswered ||
      !checklist.evidenceChainCertified ||
      !checklist.operativeDecreeCalculated
    ) {
      toast(
        "Please complete all mandatory review & approval clearances before final pronouncement.",
        "bad",
      )
      return
    }

    setIsFinalizing(true)

    try {
      let targetCase = selectedCaseId
        ? judicialStore.getCase(selectedCaseId)
        : undefined

      // If no existing case was picked, first ingest the case through the deterministic engine
      if (!targetCase) {
        const newCasePayload: Omit<FullCaseRecord, "id"> = {
          number: preview.caseNumber,
          title: preview.caseName,
          type: caseType,
          court: "Principal Sessions Court · Bench 04",
          acts: statuteSection.split("/").map((s) => s.trim()),
          stage: "Judgment Pronounced & Decreed",
          status: "ontrack",
          filingDate: new Date().toISOString().split("T")[0],
          nextHearing: "Disposed",
          judge: "Hon. Justice R. Venkataraman",
          policeStation: ioStation,
          fir: { no: firNo, date: firDate },
          io: {
            name: ioName,
            rank: "Inspector of Police",
            badge: ioBadge,
            policeStation: ioStation,
            phone: ioPhone,
            chargesheetRef: `CS-${firNo} filed ${firDate}`,
          },
          parties: [
            { role: "Prosecutor", name: prosecutorName },
            { role: "Complainant / Offended Party", name: complainant },
            { role: "Accused", name: primaryAccused, custody: "In custody" },
            ...(coAccusedCount > 0
              ? [
                  {
                    role: "Accused" as const,
                    name: `Co-Accused 1 (${primaryAccused} associate)`,
                    custody: "On bail" as const,
                  },
                ]
              : []),
          ],
          victims: {
            total: 1,
            minors: 0,
            adults: 1,
            details: [
              {
                name: victimName,
                masked: false,
                age: 34,
                relationship: "Aggrieved",
              },
            ],
          },
          weapons: [
            {
              id: `wpn-${Date.now()}`,
              type: "FIREARM",
              makeModel: weaponType,
              serialNumber: "DEFACED / LABORATORY TAGGED",
              recoveryMemo: `Seizure Memo under Sec 27 prepared by ${ioName}`,
              recoveryDate: firDate,
              recoveryPlace: "Crime Scene / Seizure Location",
              ballisticStatus: "ADMITTED_EX_P3",
              notes: "Striation matched with fatal cartridge.",
            },
          ],
          evidence: [
            {
              id: `ev-${Date.now()}`,
              code: "EX-P-1",
              kind: "Forensic",
              title: initialEvidence,
              detail: `Initial physical seizure seized by IO ${ioName} under FIR ${firNo}.`,
              custodyOfficer: ioName,
              date: firDate,
              place: ioStation,
              labStatus: "positive",
              admission: "admitted",
              chainHash: "9a8b7c6d5e4f3a2b1c0d",
            },
          ],
          documents: [],
          hearings: [],
          additionalDetails: `Final Judgment pronounced on ${new Date().toISOString().split("T")[0]}. Verdict: ${judgmentVerdict}.`,
          isClosed: true,
        }
        targetCase = judicialStore.ingestNewCase(newCasePayload)
      }

      // Record Decree Pronouncement in judicialStore
      const punishmentList =
        judgmentVerdict === "CONVICTION"
          ? [
              {
                convictName: primaryAccused,
                crimId: `CRM-${primaryAccused.slice(0, 3).toUpperCase()}-2026`,
                type: "RIGOROUS_IMPRISONMENT" as PunishmentType,
                durationMonths: sentencingTermMonths,
                fineAmountInr: fineAmount,
                operativeDecree: `Convicted u/s ${statuteSection}. Sentence: ${Math.floor(sentencingTermMonths / 12)} years RI with fine Rs. ${fineAmount.toLocaleString()}.`,
              },
            ]
          : []

      judicialStore.recordDecreePronouncement({
        caseId: targetCase.id,
        judgmentText,
        punishments: punishmentList,
      })

      toast(
        `Final Judgment decreed and recorded for ${targetCase.number}!`,
        "ok",
      )
      navigate(`/cases/${targetCase.id}`)
    } catch (e: any) {
      toast(
        e.message || "Error occurred while recording final judgment.",
        "bad",
      )
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <>
      {/* Page Header (Requirements: Title, Description, Breadcrumbs) */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
          <span>Judicial Registry</span>
          <ChevronRight className="size-3" />
          <span>Sessions Court · Bench 04</span>
          <ChevronRight className="size-3 text-[#e61919]" />
          <span className="text-[#e61919]">Final Judgment Case Workspace</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <span className="size-9 rounded-xl bg-black text-white grid place-items-center shrink-0">
                <Gavel className="size-5 text-[#FF5C5C]" />
              </span>
              Final Judgment Case
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl">
              Review case records, evidence, applicable law, arguments, and
              findings to prepare a draft judgment for judicial review.
            </p>
          </div>

          {/* Quick Docket Selector Bar */}
          <div className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border shrink-0">
            <FolderOpen className="size-4 text-muted-foreground ml-1" />
            <select
              value={selectedCaseId}
              onChange={(e) => {
                if (e.target.value) handleLoadExistingCase(e.target.value)
                else setSelectedCaseId("")
              }}
              className="text-xs font-semibold bg-transparent text-foreground outline-none cursor-pointer pr-3"
            >
              <option value="">
                + New Final Judgment Case (Auto-Numbered)
              </option>
              {existingCases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number} · {c.title.slice(0, 38)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Case Header Dossier Badge (Live Auto-Numbering Engine Preview Reused) */}
      <Card className="mb-6 p-4 sm:p-5 border-2 border-foreground bg-elevated/40">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#e61919]">
            <Sparkles className="size-4" />
            <span>
              /// JUDICIAL BENCH CAUSE DOCKET &amp; CASE NUMBERING ///
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
            <span className="px-2 py-0.5 rounded bg-black text-white">
              BENCH 04 · SESSIONS
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              STAGE: FINAL JUDGMENT DISPOSITION
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 bg-card p-4 border border-border mt-3 rounded-lg">
          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
              OFFICIAL CASE NUMBER:
            </span>
            <div className="font-mono text-lg sm:text-xl font-black text-[#e61919]">
              {selectedCaseId
                ? existingCases.find((c) => c.id === selectedCaseId)?.number ||
                  preview.caseNumber
                : preview.caseNumber}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground mt-0.5 block">
              Format: [{jurisdiction}]-[{caseType.toUpperCase()}]-[{year}]-[
              {policePrecinct}]-[SEQUENCE]
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
              STANDARDIZED JUDICIAL CAUSE TITLE:
            </span>
            <div className="font-sans text-xs sm:text-sm font-bold text-foreground">
              {selectedCaseId
                ? existingCases.find((c) => c.id === selectedCaseId)?.title ||
                  preview.caseName
                : preview.caseName}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground mt-0.5 block">
              Coram: Hon. Justice R. Venkataraman · Presiding Judge
            </span>
          </div>
        </div>
      </Card>

      {/* Main Workflow Tabs (11 Judgment-Focused Sections) */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 rounded-2xl border border-black/10 mb-6 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("dossier")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "dossier"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <FolderOpen className="size-3.5" />
          <span>1. Case Dossier &amp; Parties</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("evidence")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "evidence"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <Shield className="size-3.5" />
          <span>2. Trial Record &amp; Evidence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analysis")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "analysis"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>3. Law, Arguments &amp; Findings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("draft")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "draft"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <FileText className="size-3.5 text-[#FF5C5C]" />
          <span>4. Draft Judgment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("approval")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "approval"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <FileCheck className="size-3.5 text-emerald-400" />
          <span>5. Review &amp; Approval</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CASE INFORMATION, PARTIES & PROCEDURAL HISTORY                     */}
      {/* ========================================================================= */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            {/* SECTION 1: CASE INFORMATION */}
            <Card className="p-5 space-y-4">
              <CardHeader
                num="01"
                title="CASE INFORMATION & JURISDICTION"
                sub="Statutory jurisdiction, classification, and sequence indexing records"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Court Jurisdiction Code">
                  <Select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full"
                  >
                    <option value="DL">
                      DL (National Capital Territory of Delhi)
                    </option>
                    <option value="TN">TN (State of Tamil Nadu)</option>
                    <option value="MH">MH (State of Maharashtra)</option>
                    <option value="KA">KA (State of Karnataka)</option>
                  </Select>
                </Field>

                <Field label="Case Legal Classification">
                  <Select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value as any)}
                    className="w-full"
                  >
                    <option value="Criminal">Criminal (Sessions Trial)</option>
                    <option value="POCSO">POCSO Special Court</option>
                    <option value="Matrimonial">
                      Matrimonial / Family Court
                    </option>
                    <option value="Civil">Civil Suit</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Police Precinct Code">
                  <Input
                    value={policePrecinct}
                    onChange={(e) =>
                      setPolicePrecinct(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. PSCT, AN, KOTW"
                    required
                  />
                </Field>
                <Field label="Primary Statutory Code / Sections">
                  <Input
                    value={statuteSection}
                    onChange={(e) => setStatuteSection(e.target.value)}
                    placeholder="e.g. BNS s.103 / Arms Act s.25"
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="FIR Reference Number">
                  <Input
                    value={firNo}
                    onChange={(e) => setFirNo(e.target.value)}
                    required
                  />
                </Field>
                <Field label="FIR Registration Date">
                  <Input
                    type="date"
                    value={firDate}
                    onChange={(e) => setFirDate(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field label="Police Station / Jurisdiction Precinct">
                <Input
                  value={ioStation}
                  onChange={(e) => setIoStation(e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Lead Investigating Officer (IO)">
                  <Input
                    value={ioName}
                    onChange={(e) => setIoName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="IO Police Badge / Contact">
                  <Input
                    value={ioBadge}
                    onChange={(e) => setIoBadge(e.target.value)}
                    required
                  />
                </Field>
              </div>
            </Card>

            {/* SECTION 2: PARTIES AND LEGAL REPRESENTATIVES */}
            <Card className="p-5 space-y-4">
              <CardHeader
                num="02"
                title="PARTIES & LEGAL REPRESENTATIVES"
                sub="Litigant rosters, defense representation, and state prosecutors"
              />

              <Field label="Complainant / Prosecuting Authority">
                <Input
                  value={complainant}
                  onChange={(e) => setComplainant(e.target.value)}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary Accused Person">
                  <Input
                    value={primaryAccused}
                    onChange={(e) => setPrimaryAccused(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Co-Accused Persons Count">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={coAccusedCount}
                    onChange={(e) =>
                      setCoAccusedCount(parseInt(e.target.value) || 0)
                    }
                  />
                </Field>
              </div>

              <Field label="Victim / Aggrieved Person Details">
                <Input
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  placeholder="Victim name (or masked under POCSO / Sec 228A)"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Public Prosecutor / State Counsel">
                  <Input
                    value={prosecutorName}
                    onChange={(e) => setProsecutorName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Senior Defense Counsel / Advocate">
                  <Input
                    value={defenseCounselName}
                    onChange={(e) => setDefenseCounselName(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
                <span className="font-mono font-bold text-muted-foreground uppercase text-[10px] block">
                  CUSTODY TELEMETRY:
                </span>
                <p className="text-foreground font-medium">
                  Primary accused{" "}
                  <span className="font-bold">{primaryAccused}</span> remanded
                  in Judicial Custody at Central Prison Tihar. Custody
                  certificate verified under Section 428 CrPC / Sec 468 BNSS.
                </p>
              </div>
            </Card>
          </div>

          {/* SECTION 3: PROCEDURAL HISTORY */}
          <Card className="p-5 space-y-4">
            <CardHeader
              num="03"
              title="PROCEDURAL HISTORY & TRIAL CHRONOLOGY"
              sub="Statutory trial milestones from committal to final arguments"
            />

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                  1. Committal
                </span>
                <Input
                  type="date"
                  value={committalDate}
                  onChange={(e) => setCommittalDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                  2. Framing Charges
                </span>
                <Input
                  type="date"
                  value={chargeFramingDate}
                  onChange={(e) => setChargeFramingDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                  3. Pros. Evidence
                </span>
                <Input
                  type="date"
                  value={prosecutionEvidenceClosure}
                  onChange={(e) =>
                    setProsecutionEvidenceClosure(e.target.value)
                  }
                  className="mt-1 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                  4. Sec 313 Statement
                </span>
                <Input
                  type="date"
                  value={accusedStatementDate}
                  onChange={(e) => setAccusedStatementDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                  5. Final Arguments
                </span>
                <Input
                  type="date"
                  value={finalArgumentsDate}
                  onChange={(e) => setFinalArgumentsDate(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span>
                All procedural statutory requisites fulfilled prior to final
                judgment reservation.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("evidence")}
              >
                Proceed to Trial Records &amp; Evidence{" "}
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ISSUES FOR DETERMINATION, EVIDENCE, WITNESSES & FORENSICS           */}
      {/* ========================================================================= */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          {/* SECTION 4: ISSUES FOR DETERMINATION */}
          <Card className="p-5 space-y-4">
            <CardHeader
              num="04"
              title="ISSUES FOR DETERMINATION (POINTS OF LAW & FACT)"
              sub="Judicial questions framed for determination in final pronouncement"
            />

            <div className="space-y-3">
              {issues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-black text-white text-xs font-mono font-bold grid place-items-center shrink-0">
                        {iss.number}
                      </span>
                      <h4 className="font-bold text-sm text-foreground">
                        {iss.question}
                      </h4>
                    </div>

                    <select
                      value={iss.finding}
                      onChange={(e) => {
                        const val = e.target.value as any
                        setIssues(
                          issues.map((i) =>
                            i.id === iss.id ? { ...i, finding: val } : i,
                          ),
                        )
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-muted border border-border text-foreground outline-none"
                    >
                      <option value="PROVED_BEYOND_DOUBT">
                        ✓ PROVED BEYOND REASONABLE DOUBT
                      </option>
                      <option value="NOT_PROVED">✕ NOT PROVED</option>
                      <option value="PARTIALLY_ESTABLISHED">
                        ⚠ PARTIALLY ESTABLISHED
                      </option>
                    </select>
                  </div>

                  <div className="pl-8 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      Judicial Finding Note:{" "}
                    </span>
                    {iss.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            {/* SECTION 5: EVIDENCE AND EXHIBITS */}
            <Card className="p-5 space-y-4">
              <CardHeader
                num="05"
                title="EVIDENCE & EXHIBITS MANIFEST"
                sub="Admitted prosecution and defense exhibits with provenance"
              />

              <div className="space-y-2.5">
                {exhibits.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#e61919]">
                          {ex.code}
                        </span>
                        <span className="font-bold text-xs text-foreground">
                          {ex.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        Witness: {ex.admittedBy}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      {ex.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>SEIZED WEAPON: {weaponType}</span>
                <span>CHAIN HASH: 9a8b...1c0d (VERIFIED)</span>
              </div>
            </Card>

            {/* SECTION 6: WITNESSES AND FORENSIC REPORTS */}
            <Card className="p-5 space-y-4">
              <CardHeader
                num="06"
                title="WITNESS STATEMENTS & FORENSIC REPORTS"
                sub="Ocular depositions, medical autopsy, and laboratory ballistics"
              />

              <div className="space-y-3">
                {witnesses.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-card border border-border space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-black bg-zinc-200 px-1.5 py-0.5 rounded text-[11px]">
                          {w.code}
                        </span>
                        <span className="font-bold text-foreground">
                          {w.name}
                        </span>
                        <span className="text-muted-foreground">
                          ({w.role})
                        </span>
                      </div>

                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          w.credibility === "High"
                            ? "bg-emerald-100 text-emerald-800"
                            : w.credibility === "Corroborated"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {w.credibility} Credibility
                      </span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">
                        Deposition:{" "}
                      </span>
                      {w.depositionSummary}
                    </p>
                    <p className="text-muted-foreground text-[11.5px]">
                      <span className="font-semibold text-foreground">
                        Cross-Exam:{" "}
                      </span>
                      {w.crossExamHighlight}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("analysis")}
            >
              Proceed to Applicable Laws &amp; Submissions{" "}
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APPLICABLE LAWS, ARGUMENTS & JUDICIAL FINDINGS                     */}
      {/* ========================================================================= */}
      {activeTab === "analysis" && (
        <div className="space-y-6">
          {/* SECTION 7: APPLICABLE LAWS AND PRECEDENTS */}
          <Card className="p-5 space-y-4">
            <CardHeader
              num="07"
              title="APPLICABLE LAWS & BINDING SUPREME COURT PRECEDENTS"
              sub="Statutory provisions and authoritative judicial citations governing the issues"
            />

            <div className="grid gap-3 md:grid-cols-3">
              {precedents.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10.5px] font-bold text-[#e61919] uppercase block">
                      {p.court}
                    </span>
                    <h5 className="font-bold text-foreground text-xs leading-snug">
                      {p.citation}
                    </h5>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {p.bench}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-[11.5px]">
                    <span className="font-bold text-foreground">
                      Proposition:{" "}
                    </span>
                    {p.proposition}
                  </p>

                  <div className="pt-1 text-[11px] font-mono text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                    Application: {p.relevance}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SECTION 8: ARGUMENTS AND SUBMISSIONS */}
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-5 space-y-3">
              <CardHeader
                num="08A"
                title="PROSECUTION ARGUMENTS & SUBMISSIONS"
                sub="Public Prosecutor Sandeep Bhardwaj"
              />
              <textarea
                rows={5}
                value={prosecutionSubmissions}
                onChange={(e) => setProsecutionSubmissions(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-xs sm:text-sm font-medium text-foreground outline-none resize-none leading-relaxed"
              />
            </Card>

            <Card className="p-5 space-y-3">
              <CardHeader
                num="08B"
                title="DEFENSE ARGUMENTS & REBUTTAL"
                sub="Senior Defense Counsel Maninder Singh"
              />
              <textarea
                rows={5}
                value={defenseSubmissions}
                onChange={(e) => setDefenseSubmissions(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-xs sm:text-sm font-medium text-foreground outline-none resize-none leading-relaxed"
              />
            </Card>
          </div>

          {/* SECTION 9: JUDICIAL ANALYSIS AND FINDINGS */}
          <Card className="p-5 space-y-3">
            <CardHeader
              num="09"
              title="JUDICIAL ANALYSIS & COURT REASONING"
              sub="Independent evaluation of conflicting testimonies and weight of evidence"
            />
            <textarea
              rows={4}
              value={judicialAnalysis}
              onChange={(e) => setJudicialAnalysis(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm font-medium text-foreground outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-muted-foreground">
                Synthesized across PW-1 to PW-4 ocular and ballistic records.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("draft")}
              >
                Proceed to Draft Judgment Editor{" "}
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STRUCTURED DRAFT JUDGMENT WORKSPACE                                 */}
      {/* ========================================================================= */}
      {activeTab === "draft" && (
        <div className="space-y-6">
          {/* AI-Generated Text Draft Notice (Strict Requirement) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-mono text-xs font-black uppercase tracking-wider block text-amber-800">
                  AI-ASSISTED SYNTHESIS DRAFT · PENDING AUTHORIZED HUMAN
                  JUDICIAL REVIEW
                </span>
                <p className="text-xs text-amber-700">
                  This text has been algorithmically synthesized from trial
                  exhibits, forensic reports, and arguments. It is strictly a
                  preliminary working draft. Authorized human review and digital
                  sign-off by the presiding magistrate is mandatory before
                  formal pronouncement.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="shrink-0 bg-white"
            >
              <Save className="size-3.5 mr-1" /> Save Working Snapshot
            </Button>
          </div>

          {/* SECTION 10: STRUCTURED DRAFT JUDGMENT EDITOR */}
          <Card className="p-5 sm:p-7 space-y-6 border-2 border-black/20">
            {/* Judgment Header & Coram */}
            <div className="space-y-3 pb-5 border-b border-border">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Court Jurisdiction Banner">
                  <Input
                    value={judgmentTitle}
                    onChange={(e) => setJudgmentTitle(e.target.value)}
                    className="font-mono text-xs font-bold"
                  />
                </Field>

                <Field label="Presiding Officer / Coram">
                  <Input
                    value={judgmentCoram}
                    onChange={(e) => setJudgmentCoram(e.target.value)}
                    className="font-mono text-xs font-bold"
                  />
                </Field>
              </div>

              {/* Verdict & Sentencing Selector */}
              <div className="grid gap-3 sm:grid-cols-3 pt-2">
                <Field label="Formal Judicial Verdict">
                  <Select
                    value={judgmentVerdict}
                    onChange={(e) => setJudgmentVerdict(e.target.value as any)}
                    className="font-bold text-xs"
                  >
                    <option value="CONVICTION">
                      CONVICTION (ACCUSED GUILTY)
                    </option>
                    <option value="ACQUITTAL">
                      ACQUITTAL (BENEFIT OF DOUBT)
                    </option>
                    <option value="RE-TRIAL">
                      ORDER RE-TRIAL / RE-HEARING
                    </option>
                  </Select>
                </Field>

                <Field label="Term of Sentence (Months)">
                  <Input
                    type="number"
                    disabled={judgmentVerdict !== "CONVICTION"}
                    value={sentencingTermMonths}
                    onChange={(e) =>
                      setSentencingTermMonths(parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g. 240 for 20 years"
                  />
                </Field>

                <Field label="Fine Amount (INR)">
                  <Input
                    type="number"
                    disabled={judgmentVerdict !== "CONVICTION"}
                    value={fineAmount}
                    onChange={(e) =>
                      setFineAmount(parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g. 50000"
                  />
                </Field>
              </div>
            </div>

            {/* Editable Draft Judgment Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Draft Judgment Operative Text &amp; Reasoning Body
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Editable Text Area · Certified for Supreme Bench 04
                </span>
              </div>

              <textarea
                rows={16}
                value={judgmentText}
                onChange={(e) => setJudgmentText(e.target.value)}
                className="w-full p-4 rounded-xl border border-black/20 bg-zinc-50/50 font-serif text-sm leading-relaxed text-zinc-900 outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            {/* Version History & Snapshots (Requirement: Version history where supported) */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <History className="size-3.5" />
                  Draft Judgment Version History &amp; Snapshots
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {versions.length} versions archived
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {versions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#e61919]">
                          {ver.version}
                        </span>
                        <span className="font-semibold text-foreground">
                          {ver.author}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-muted-foreground font-mono block">
                        {ver.timestamp} · {ver.note}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setJudgmentText(ver.content)
                        toast(`Restored draft snapshot ${ver.version}`, "info")
                      }}
                      className="text-[11px] px-2 py-1 h-auto"
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              <Save className="size-4 mr-1.5" /> Save Draft
            </Button>
            <Button
              type="button"
              variant="hazard"
              onClick={() => setActiveTab("approval")}
            >
              Proceed to Review &amp; Approval{" "}
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REVIEW AND APPROVAL & FINAL PRONOUNCEMENT                          */}
      {/* ========================================================================= */}
      {activeTab === "approval" && (
        <div className="space-y-6">
          {/* SECTION 11: REVIEW AND APPROVAL */}
          <Card className="p-5 sm:p-7 space-y-6">
            <CardHeader
              num="11"
              title="REVIEW & APPROVAL (MANDATORY BENCH CLEARANCE)"
              sub="Statutory verification checklist required before formal decree pronouncement"
            />

            {/* Verification Checklist */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.chargesAnswered}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      chargesAnswered: e.target.checked,
                    })
                  }
                  className="size-5 rounded border-black/20 text-black focus:ring-black accent-black"
                />
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    All Statutory Charges &amp; Framing Issues Explicitly
                    Answered
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Findings rendered on Section 103 BNS, Section 25 Arms Act,
                    and individual accused culpability.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.evidenceChainCertified}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      evidenceChainCertified: e.target.checked,
                    })
                  }
                  className="size-5 rounded border-black/20 text-black focus:ring-black accent-black"
                />
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    Chain of Custody &amp; Forensic Exhibit Integrity Certified
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Exhibits Ex. P-1 through Ex. P-5 accompanied by certified
                    custody logs and laboratory reports.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.accusedExamined313}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      accusedExamined313: e.target.checked,
                    })
                  }
                  className="size-5 rounded border-black/20 text-black focus:ring-black accent-black"
                />
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    Statement of Accused Recorded under Sec 313 CrPC / Sec 351
                    BNSS
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Accused afforded full opportunity to explain incriminating
                    circumstances and lead defense evidence.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.victimCompensationAssessed}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      victimCompensationAssessed: e.target.checked,
                    })
                  }
                  className="size-5 rounded border-black/20 text-black focus:ring-black accent-black"
                />
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    Victim Compensation Assessed under Statutory Scheme
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Award quantified for next of kin under Delhi Victim
                    Compensation Scheme / Sec 357A CrPC.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border cursor-pointer select-none hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.operativeDecreeCalculated}
                  onChange={(e) =>
                    setChecklist({
                      ...checklist,
                      operativeDecreeCalculated: e.target.checked,
                    })
                  }
                  className="size-5 rounded border-black/20 text-black focus:ring-black accent-black"
                />
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    Operative Order &amp; Custody Set-Off Period Computed
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pre-trial detention period set-off calculated under Section
                    428 CrPC.
                  </span>
                </div>
              </label>
            </div>

            {/* Presiding Judge Authorization Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-bold">
                  <Award className="size-4" />
                  <span>AUTHORIZATION &amp; BENCH SEAL</span>
                </div>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-zinc-300">
                  DIGITAL SIGNATURE READY
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-zinc-400 block font-mono text-[10px] uppercase">
                    OFFICER:
                  </span>
                  <span className="text-white font-bold text-sm">
                    {judgmentCoram}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-mono text-[10px] uppercase">
                    STATUS:
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {checklist.chargesAnswered &&
                    checklist.evidenceChainCertified &&
                    checklist.operativeDecreeCalculated
                      ? "✓ All Approvals Completed — Authorized to Pronounce"
                      : "⚠ Pending Verification Checklist Items"}
                  </span>
                </div>
              </div>
            </div>

            {/* Final Submission Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/cases")}
              >
                Cancel &amp; Return to Case Files
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                >
                  <Save className="size-4 mr-1.5" /> Save Draft
                </Button>

                <Button
                  type="button"
                  variant="hazard"
                  size="lg"
                  disabled={
                    isFinalizing ||
                    !checklist.chargesAnswered ||
                    !checklist.operativeDecreeCalculated
                  }
                  onClick={handleFinalizeJudgment}
                  className="w-full sm:w-auto"
                >
                  <Gavel className="size-4 mr-2" />
                  <span>
                    {isFinalizing
                      ? "Pronouncing Judgment..."
                      : "EXECUTE PRONOUNCEMENT & ISSUE FINAL JUDGMENT"}
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
