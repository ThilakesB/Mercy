import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router'
import {
  FileText,
  Users,
  Eye,
  EyeOff,
  User,
  Shield,
  Gavel,
  Scale,
  Calendar,
  Clock,
  MapPin,
  FileCheck,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Award,
  Hash,
  Camera,
  FileUp,
  Download,
  Paperclip,
  X,
  ShieldCheck,
  FileSpreadsheet,
  FileSearch,
  Layers,
  Copy,
  Printer,
  FileDown,
  ShieldAlert,
  CheckSquare,
  MinusCircle,
  Globe,
  Loader2,
} from 'lucide-react'
import {
  judicialStore,
  type FullCaseRecord,
  type EvidenceRecord,
} from '../lib/judicialStore'
import { fetchDistrictCourtCase, type ECourtsCaseDetail } from '../lib/ecourtsApi'
import { Button, Card, CardHeader, Tag, Input, Select, Field, Modal, StatusChip, useApp } from '../ui'

export interface CaseIntakeDoc {
  id: string
  title: string
  category: 'FIR Copy' | 'Complaint / Tehrir' | 'GD Extract' | 'Scene Sketch / Map' | 'Medical / MLC' | 'Other'
  fileName: string
  fileSize: string
  uploadDate: string
  status: 'Verified' | 'Uploaded' | 'Pending'
  notes?: string
}

interface AccusedItem {
  id: string
  fullName: string
  alias: string
  age: string
  dob: string
  gender: string
  address: string
  phone: string
  idProofType: string
  idProofNumber: string
  photoUploaded: boolean
  photoUrl?: string
  photoFileName?: string
  role: 'main accused' | 'accomplice' | 'abettor'
  arrestStatus: 'not arrested' | 'arrested' | 'absconding' | 'bail granted'
  arrestDate: string
  bailDetails: string
  hasPreviousCriminalHistory: boolean
  previousCaseNumbers: string
  weaponUsed: boolean
  weaponDescription: string
}

interface VictimItem {
  id: string
  fullName: string
  isConfidential: boolean
  age: string
  gender: string
  address: string
  contact: string
  isMinor: boolean
  guardianDetails: string
  relationshipWithAccused: string
  injuryOrLossDetails: string
  medicalReportUploaded: boolean
  victimStatementUploaded: boolean
  victimStatementFileName?: string
  victimStatementDate?: string
  statementRef: string
}

interface WitnessItem {
  id: string
  fullName: string
  type: 'eyewitness' | 'expert' | 'complainant' | 'police' | 'other'
  contact: string
  statementSummary: string
  documentUploaded: boolean
  documentName: string
}

interface ChainOfCustodyEntry {
  handedBy: string
  receivedBy: string
  dateTime: string
  purpose: string
}

interface ComprehensiveEvidenceItem {
  id: string
  evidenceId: string
  type: 'circumstantial' | 'forensic' | 'chemical' | 'physical' | 'documentary' | 'witness'
  description: string
  source: string
  linksToCrime: string
  dateCollected: string
  collectedBy: string
  forensicSubtype?: string
  labName?: string
  reportNumber?: string
  chemicalSubstance?: string
  chemicalLabAnalysis?: string
  physicalType?: string
  documentKind?: string
  linkedWitnessId?: string
  chainOfCustody: ChainOfCustodyEntry[]
  status: 'Collected' | 'Sent to lab' | 'Report received' | 'Produced in court'
  uploadedFiles: string[]
}

interface InvestigationDocItem {
  id: string
  name: string
  status: 'Pending' | 'Uploaded' | 'Verified'
  fileName?: string
}

interface ProgressLogEntry {
  id: string
  date: string
  actionTaken: string
  nextActionDate: string
}

interface JudgementDocCheckItem {
  id: string
  title: string
  isUploaded: boolean
  isReviewed: boolean
  status: 'Pending' | 'Uploaded' | 'Reviewed'
}

export type ReadinessStatus = 'Verified' | 'Pending' | 'Disputed' | 'Not Applicable' | 'Requires Review'

export interface CaseReadinessItem {
  id: string
  categoryKey:
    | 'case-details'
    | 'case-documents'
    | 'evidence-exhibits'
    | 'witness-records'
    | 'legal-review'
    | 'final-hearing'
    | 'judgment-document'
    | 'finalisation-checks'
  categoryTitle: string
  title: string
  description: string
  status: ReadinessStatus
  applicableCaseTypes?: ('Criminal' | 'Civil' | 'POCSO' | 'Divorce/Family' | 'Other')[]
  isCoreRequirement?: boolean
  notes?: string
}

export const INITIAL_READINESS_ITEMS: CaseReadinessItem[] = [
  // 1. Case details
  {
    id: 'rd-1-1',
    categoryKey: 'case-details',
    categoryTitle: '1. Case Details',
    title: 'Case number and CNR number',
    description: 'Unique CNR docket identity, registration sequence, and verified registry record number.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-1-2',
    categoryKey: 'case-details',
    categoryTitle: '1. Case Details',
    title: 'Court name and jurisdiction',
    description: 'Territorial, pecuniary, and subject-matter jurisdiction established for the bench.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-1-3',
    categoryKey: 'case-details',
    categoryTitle: '1. Case Details',
    title: 'Case type and applicable law',
    description: 'Substantive penal or civil statutes (e.g. BNS, BNSS, CPC, Specific Relief, POCSO) identified.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-1-4',
    categoryKey: 'case-details',
    categoryTitle: '1. Case Details',
    title: 'Names of all parties and their advocates',
    description: 'Complete memo of parties, prosecuting officer, legal aid / retained defence counsel with bar numbers.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-1-5',
    categoryKey: 'case-details',
    categoryTitle: '1. Case Details',
    title: 'Complaint or petition and relief requested',
    description: 'Core pleadings, prayer clauses, framed charges, or damages and decrees sought.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-1-6',
    categoryKey: 'case-details',
    categoryTitle: '1. Case Details',
    title: 'Case filing date and procedural history',
    description: 'Filing date, limitation compliance, listing timeline, and committal milestones.',
    status: 'Verified',
    isCoreRequirement: true,
  },

  // 2. All case documents
  {
    id: 'rd-2-1',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Original complaint, plaint, or petition',
    description: 'Certified initiating pleading with verified supporting affidavit on record.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-2-2',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Written statement or defence',
    description: 'Counter-affidavit or written statement of defence submitted within statutory timeframe.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-2-3',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Replies and rejoinders',
    description: 'Replications, rejoinder affidavits, and clarifications filed by petitioner / prosecution.',
    status: 'Verified',
    isCoreRequirement: false,
  },
  {
    id: 'rd-2-4',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Applications and affidavits',
    description: 'Interlocutory applications (bail, discovery, amendment, injunction) disposed or accounted for.',
    status: 'Verified',
    isCoreRequirement: false,
  },
  {
    id: 'rd-2-5',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Notices and summons with service records',
    description: 'Process server reports, postal tracking, dasti service, or electronic delivery confirmation.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-2-6',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Previous interim orders and court directions',
    description: 'Complete order-sheet record of interim stays, bail conditions, and procedural mandates.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-2-7',
    categoryKey: 'case-documents',
    categoryTitle: '2. All Case Documents',
    title: 'Relevant contracts, reports, certificates, and official records',
    description: 'Public records, birth/death extract, title documents, or departmental sanction letters.',
    status: 'Verified',
    isCoreRequirement: false,
  },

  // 3. Evidence and exhibits
  {
    id: 'rd-3-1',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Documentary evidence',
    description: 'Original or certified secondary documents tendered and marked as court exhibits.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-3-2',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Photographs, videos, audio, and electronic records',
    description: 'CCTV footage, telephone audio dumps, digital extraction reports, and device forensic images.',
    status: 'Verified',
    isCoreRequirement: false,
  },
  {
    id: 'rd-3-3',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Medical and forensic reports, if applicable',
    description: 'Medico-legal case (MLC) sheet, post-mortem report, ballistics striation matching, DNA profile.',
    status: 'Verified',
    applicableCaseTypes: ['Criminal', 'POCSO'],
    isCoreRequirement: true,
  },
  {
    id: 'rd-3-4',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Expert reports',
    description: 'Forensic Science Laboratory (FSL) expert report, handwriting examiner, or chartered valuer report.',
    status: 'Verified',
    isCoreRequirement: false,
  },
  {
    id: 'rd-3-5',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Evidence submitted by each party',
    description: 'Clear segregation and indexation of Prosecution/Plaintiff exhibits vs Defence exhibits.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-3-6',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Exhibit numbers and source references',
    description: 'Formally marked exhibit catalogue (Ex. P-1 to P-8 / Ex. D-1) matched to seizure panchnamas.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-3-7',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: "Objections to evidence and court's recorded rulings",
    description: 'Objections as to mode of proof, unstamped instruments, or hearsay formally decided on record.',
    status: 'Requires Review',
    isCoreRequirement: false,
    notes: 'Defence raised objection on CDR secondary certificate mode of proof; to be addressed in judgment body.',
  },
  {
    id: 'rd-3-8',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Chain-of-custody records, where relevant',
    description: 'Malkhana register entries, road certificates, unbroken biological seal movements verified.',
    status: 'Verified',
    applicableCaseTypes: ['Criminal', 'POCSO'],
    isCoreRequirement: true,
  },
  {
    id: 'rd-3-9',
    categoryKey: 'evidence-exhibits',
    categoryTitle: '3. Evidence and Exhibits',
    title: 'Electronic evidence integrity & certification (Sec 63/65B)',
    description: 'Mandatory certificate under Section 63 BSA / Sec 65B Indian Evidence Act accompanying electronic data.',
    status: 'Verified',
    isCoreRequirement: true,
  },

  // 4. Witness records
  {
    id: 'rd-4-1',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Witness list',
    description: 'Comprehensive roster of examined witnesses (PW-1 through PW-6) and unexamined witnesses dropped.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-4-2',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Witness statements and depositions',
    description: 'Sworn oral testimonies recorded verbatim in presence of presiding officer and parties.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-4-3',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Examination-in-chief',
    description: 'Direct examination transcripts properly certified and signed by witnesses and judge.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-4-4',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Cross-examination',
    description: 'Complete cross-examination transcripts indicating admissions and credibility tests.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-4-5',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Re-examination, if any',
    description: 'Re-examination on points arising from cross-examination, or recorded statement of no re-examination.',
    status: 'Not Applicable',
    isCoreRequirement: false,
    notes: 'No ambiguities arose; prosecution closed testimony after cross-examination without seeking re-examination.',
  },
  {
    id: 'rd-4-6',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Contradictions and corroborating evidence',
    description: 'Marked contradictions with prior police statements (Sec 148 BSA / Sec 145 IEA) marshalled.',
    status: 'Verified',
    applicableCaseTypes: ['Criminal', 'POCSO'],
    isCoreRequirement: true,
  },
  {
    id: 'rd-4-7',
    categoryKey: 'witness-records',
    categoryTitle: '4. Witness Records',
    title: 'Expert witness testimony, if applicable',
    description: 'Oral deposition of forensic ballistics expert, medical officer, or digital examiner recorded.',
    status: 'Verified',
    isCoreRequirement: false,
  },

  // 5. Legal review
  {
    id: 'rd-5-1',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Issues for determination or charges',
    description: 'Strictly framed charges under Sec 211 CrPC / Sec 234 BNSS or settled civil issues under CPC Order XIV.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-5-2',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Applicable laws and statutory provisions',
    description: 'Statutory ingredients of substantive offenses and procedural limitations scrutinized.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-5-3',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Verified judgments and legal precedents',
    description: 'Authorities cited by Supreme Court and jurisdictional High Court verified against reporter references.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-5-4',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Arguments from both parties',
    description: 'Detailed written arguments, synopses, and recorded oral contentions submitted by rival sides.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-5-5',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Burden and standard of proof, as applicable',
    description: 'Proof beyond reasonable doubt (Criminal) or preponderance of probabilities (Civil/Matrimonial).',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-5-6',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Evidence supporting or contradicting each issue',
    description: 'Systematic mapping of oral and documentary exhibits to each individual framed charge or issue.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-5-7',
    categoryKey: 'legal-review',
    categoryTitle: '5. Legal Review',
    title: 'Unresolved questions and missing information',
    description: 'Identification of evidentiary gaps, unresolved alibis, or minor contradictions for judicial synthesis.',
    status: 'Pending',
    isCoreRequirement: false,
    notes: 'Defence plea of alibi witness not produced; to be evaluated on adverse inference under Section 119 BSA.',
  },

  // 6. Final hearing and judgment preparation
  {
    id: 'rd-6-1',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Final written submissions, if filed',
    description: 'Written arguments, legal propositions, and compilation of judgments submitted on record.',
    status: 'Verified',
    isCoreRequirement: false,
  },
  {
    id: 'rd-6-2',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Oral arguments and recorded submissions',
    description: 'Final arguments heard at length; appearance of counsel recorded in order sheets.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-3',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Questions the court must decide',
    description: 'Definitive formulated points of determination ready for judicial answering.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-4',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Findings on each issue',
    description: 'Affirmative or negative determination recorded for every numbered issue/charge.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-5',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Reasons supporting each finding',
    description: 'Judicial reasoning articulating why evidence was accepted or rejected on each point.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-6',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Treatment of important evidence and objections',
    description: 'Direct judicial consideration of disputed exhibits, recovery admissibility under Sec 27, and credibility.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-7',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Relief, decree, dismissal, conviction, or acquittal',
    description: 'Explicit conclusion whether accused is convicted/acquitted or suit is decreed/dismissed.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-8',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Costs, compensation, interest, or sentence',
    description: 'Quantum of sentence heard (Sec 235 CrPC), victim compensation calculated, or civil costs/interest fixed.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-6-9',
    categoryKey: 'final-hearing',
    categoryTitle: '6. Final Hearing & Judgment Preparation',
    title: 'Directions, deadlines, and compliance requirements',
    description: 'Specific surrender directions, fine deposit timelines, and appellate notification recorded.',
    status: 'Verified',
    isCoreRequirement: true,
  },

  // 7. Final judgment document
  {
    id: 'rd-7-1',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Court heading and case title',
    description: 'Seal of the court, Sessions division, bench number, and presiding judicial officer details.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-2',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Case number and party details',
    description: 'CNR sequence, FIR/Suit reference, police station, and full party descriptions with counsels.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-3',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Date of institution and decision',
    description: 'Chronological anchor points including filing date, arguments conclusion date, and judgment date.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-4',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Brief facts and procedural history',
    description: 'Prosecution narrative, committal history, framing of charges, and trial progression summary.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-5',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Issues or points for determination',
    description: 'Formally numbered propositions for decision set out in sequential paragraphs.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-6',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Summary of evidence',
    description: 'Concise marshalling of prosecution witnesses, defence witnesses, and material exhibits.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-7',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Arguments of both parties',
    description: 'Substantive summary of rival arguments addressed seriatim in the decree body.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-8',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Applicable laws and precedents',
    description: 'Statutory provisions and binding judicial authorities cited, analyzed, and applied.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-9',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Analysis and findings',
    description: 'Independent evaluation of evidence, scrutiny of eyewitness credibility, and findings on each charge.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-10',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Final decision with reasons',
    description: 'Judicial ratio decidendi explaining the rationale behind the ultimate verdict.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-11',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Operative order and applicable directions',
    description: 'Binding operative mandate (conviction, sentencing, fine, compensation, bail bond cancellation).',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-7-12',
    categoryKey: 'judgment-document',
    categoryTitle: '7. Final Judgment Document',
    title: 'Signature and authentication details',
    description: 'Digital seal, presiding judge signature, court seal, and dispatch certificate to registry.',
    status: 'Verified',
    isCoreRequirement: true,
  },

  // 8. Before marking the case as finalised
  {
    id: 'rd-8-1',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Verify that all required hearings and procedural steps are complete',
    description: 'Confirm trial closed, no pending revision/transfer petitions, no interlocutory stay operative.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-2',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Check that all material documents and evidence are accounted for',
    description: 'All seized articles in malkhana safely accounted, exhibited documents placed in court file.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-3',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Confirm both parties received required opportunity to present case',
    description: 'Audi alteram partem satisfied; statutory cross-examination and Sec 313 BNSS statement completed.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-4',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Check that each issue is addressed with reasons',
    description: 'Zero unresolved charges or issues; every point answered with clear findings.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-5',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Verify all legal citations and statutory provisions',
    description: 'All SCC / AIR / SCR citation volumes cross-verified against official law reporters.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-6',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Confirm operative order is clear and consistent with findings',
    description: 'No internal contradiction between findings and operative dispositive clauses.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-7',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Obtain judicial review, approval, signature, and issuance',
    description: 'Final decree transcript signed by presiding judge and uploaded to judicial repository.',
    status: 'Verified',
    isCoreRequirement: true,
  },
  {
    id: 'rd-8-8',
    categoryKey: 'finalisation-checks',
    categoryTitle: '8. Pre-Finalisation Verifications',
    title: 'Record final judgment date and follow-up/compliance actions',
    description: 'Date entered in CIS; compliance report calendar created; certified copy supplied free of cost.',
    status: 'Verified',
    isCoreRequirement: true,
  },
]

type StepKey =
  | 'details'
  | 'accused'
  | 'victims'
  | 'witnesses'
  | 'evidence'
  | 'investigation'
  | 'judgement-documents'
  | 'review'

const STEP_DEFINITIONS: { key: StepKey; stepNumber: number; title: string; subtitle: string }[] = [
  { key: 'details', stepNumber: 1, title: 'Case Details', subtitle: 'CNR, Court, FIR & Sections' },
  { key: 'accused', stepNumber: 2, title: 'Accused', subtitle: 'Demographics, Role & Arrest' },
  { key: 'victims', stepNumber: 3, title: 'Victims', subtitle: 'Identity, Protection & Injury' },
  { key: 'witnesses', stepNumber: 4, title: 'Witnesses', subtitle: 'Statements & Testimonies' },
  { key: 'evidence', stepNumber: 5, title: 'Evidence Tracker', subtitle: 'Chain of Custody & Labs' },
  { key: 'investigation', stepNumber: 6, title: 'Investigation', subtitle: 'IO Memo, Panchnama & Logs' },
  { key: 'judgement-documents', stepNumber: 7, title: 'Case Readiness & Judgment', subtitle: '8-Pillar Judicial Audit & Draft' },
  { key: 'review', stepNumber: 8, title: 'Review & Submit', subtitle: 'Validation & Ingestion' },
]

export default function CaseWorkflow() {
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useApp()

  // Determine current active step from path
  const getActiveStepFromPath = (): StepKey => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/details')) return 'details'
    if (path.includes('/accused')) return 'accused'
    if (path.includes('/victims')) return 'victims'
    if (path.includes('/witnesses')) return 'witnesses'
    if (path.includes('/evidence')) return 'evidence'
    if (path.includes('/investigation')) return 'investigation'
    if (path.includes('/judgement-documents')) return 'judgement-documents'
    if (path.includes('/review')) return 'review'
    return 'details'
  }

  const activeStepKey = getActiveStepFromPath()
  const currentStepNumber = STEP_DEFINITIONS.find((s) => s.key === activeStepKey)?.stepNumber || 1

  // Track the actual case ID in state (if creating new, assigned when step 1 is saved or generated)
  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    if (id && id !== 'new') return id
    return `case-draft-${Date.now()}`
  })

  // Load existing case if editing
  const existingCase = id && id !== 'new' ? judicialStore.getCase(id) : undefined

  // =========================================================================
  // STEP 1: CASE DETAILS
  // =========================================================================
  const [caseNumber, setCaseNumber] = useState<string>(() => {
    if (existingCase) return existingCase.number
    return `CNR/2026/DL04-SESS/${Math.floor(1000 + Math.random() * 9000)}`
  })
  const [caseType, setCaseType] = useState<'Criminal' | 'POCSO' | 'Divorce/Family' | 'Civil' | 'Other'>(() => {
    if (existingCase) {
      if (existingCase.type === 'POCSO') return 'POCSO'
      if (existingCase.type === 'Matrimonial') return 'Divorce/Family'
      if (existingCase.type === 'Civil') return 'Civil'
      return 'Criminal'
    }
    return 'Criminal'
  })
  const [courtName, setCourtName] = useState(existingCase?.court || 'Principal Sessions Court · Bench 04')
  const [judgeName, setJudgeName] = useState(existingCase?.judge || 'Hon. Justice R. Venkataraman')
  const [policeStation, setPoliceStation] = useState(existingCase?.policeStation || 'PS Crime Branch (Special Cell)')
  // Extended FIR Details & Document Upload
  const [firNumber, setFirNumber] = useState(existingCase?.fir.no || 'FIR-208/2026')
  const [firDate, setFirDate] = useState(existingCase?.fir.date || '2026-03-14')
  const [firTime, setFirTime] = useState(existingCase?.fir.time || '03:45 AM')
  const [gdEntryNo, setGdEntryNo] = useState(existingCase?.fir.gdNo || 'GD-38/A')
  const [gdEntryTime, setGdEntryTime] = useState(existingCase?.fir.gdTime || '02:15 AM')
  const [firComplainantName, setFirComplainantName] = useState(existingCase?.fir.complainantName || 'Rameshwar Dayal')
  const [firComplainantContact, setFirComplainantContact] = useState(existingCase?.fir.complainantContact || '+91 98110 44219')
  const [firDutyOfficer, setFirDutyOfficer] = useState(existingCase?.fir.dutyOfficer || 'ASI Suresh Chand (Badge #DL-4412)')
  const [firInformationType, setFirInformationType] = useState(existingCase?.fir.infoType || 'Written')
  const [firDelayReason, setFirDelayReason] = useState(
    existingCase?.fir.delayReason || 'No delay reported; prompt information lodged within 2 hours of occurrence.'
  )
  const [firDocUploaded, setFirDocUploaded] = useState<boolean>(true)
  const [firDocFileName, setFirDocFileName] = useState(existingCase?.fir.docFileName || 'certified_fir_copy_FIR208_2026.pdf')
  const [firDocFileSize, setFirDocFileSize] = useState(existingCase?.fir.docFileSize || '2.4 MB')
  const [firDocStatus, setFirDocStatus] = useState<'Certified Copy Attached' | 'Verified' | 'Pending Attestation'>(
    (existingCase?.fir.docStatus as any) || 'Certified Copy Attached'
  )

  // Initial Intake Documents Repository
  const [intakeDocs, setIntakeDocs] = useState<CaseIntakeDoc[]>(() => {
    if (existingCase?.intakeDocuments && existingCase.intakeDocuments.length > 0) {
      return existingCase.intakeDocuments as any
    }
    return [
      {
        id: 'idoc-1',
        title: 'Certified Copy of First Information Report (FIR)',
        category: 'FIR Copy',
        fileName: 'certified_fir_copy_FIR208_2026.pdf',
        fileSize: '2.4 MB',
        uploadDate: '2026-03-14',
        status: 'Verified',
        notes: 'Signed and sealed by SHO PS Crime Branch',
      },
      {
        id: 'idoc-2',
        title: 'Written Police Complaint / Tehrir (Informant Statement)',
        category: 'Complaint / Tehrir',
        fileName: 'original_written_complaint_signed.pdf',
        fileSize: '840 KB',
        uploadDate: '2026-03-14',
        status: 'Verified',
        notes: 'Original complaint with signature and left thumb impression of complainant',
      },
      {
        id: 'idoc-3',
        title: 'General Diary (GD) Register Extract #38/A',
        category: 'GD Extract',
        fileName: 'gd_register_extract_entry_38A.pdf',
        fileSize: '512 KB',
        uploadDate: '2026-03-14',
        status: 'Uploaded',
        notes: 'Station diary extract recording arrival of complainant and initial message dispatch',
      },
      {
        id: 'idoc-4',
        title: 'Crime Scene Rough Site Sketch (Nazri Naksha)',
        category: 'Scene Sketch / Map',
        fileName: 'scene_site_sketch_panchnama_annexure.pdf',
        fileSize: '1.9 MB',
        uploadDate: '2026-03-15',
        status: 'Uploaded',
        notes: 'Scale drawing showing point of firing, victim position, and spent cartridge location',
      },
    ]
  })

  // Document preview modal state
  const [previewingDoc, setPreviewingDoc] = useState<{
    title: string
    fileName: string
    category: string
    date: string
    size: string
    seal: string
    summary: string
  } | null>(null)

  // Add new intake doc modal state
  const [showAddIntakeDocModal, setShowAddIntakeDocModal] = useState(false)
  const [newIntakeDocTitle, setNewIntakeDocTitle] = useState('')
  const [newIntakeDocCategory, setNewIntakeDocCategory] = useState<CaseIntakeDoc['category']>('Complaint / Tehrir')
  const [newIntakeDocFileName, setNewIntakeDocFileName] = useState('')
  const [newIntakeDocNotes, setNewIntakeDocNotes] = useState('')

  const [incidentDate, setIncidentDate] = useState('2026-03-12')
  const [incidentPlace, setIncidentPlace] = useState('Sector 14 Industrial Area, New Delhi')
  const [dateCaseFiled, setDateCaseFiled] = useState(existingCase?.filingDate || '2026-03-20')
  const [sectionsTags, setSectionsTags] = useState<string[]>(() => {
    if (existingCase && existingCase.acts.length > 0) return existingCase.acts
    return ['BNS s. 103 (Murder)', 'CrPC / BNSS s. 164', 'Arms Act s. 25']
  })
  const [newSectionInput, setNewSectionInput] = useState('')
  const [caseStatus, setCaseStatus] = useState<
    'Registered' | 'Under Investigation' | 'Chargesheet Filed' | 'Trial' | 'Judgement Reserved' | 'Closed'
  >('Trial')
  const [caseSummary, setCaseSummary] = useState(
    existingCase?.additionalDetails ||
      'State prosecution arising from FIR regarding armed confrontation resulting in fatal gunshot injuries. Chargesheet filed under Section 173 BNSS; exhibits verified and ballistics analysis admitted into evidence.'
  )

  // =========================================================================
  // eCourts CIS API Case Lookup State (/district-court/case)
  // =========================================================================
  const [cnrLookupInput, setCnrLookupInput] = useState('DLST020314162024')
  const [isFetchingCnr, setIsFetchingCnr] = useState(false)
  const [ecourtCaseData, setEcourtCaseData] = useState<ECourtsCaseDetail | null>(null)
  const [ecourtCaseSource, setEcourtCaseSource] = useState<'LIVE_API' | 'AUTHORITATIVE_CACHE' | null>(null)
  const [isEcourtDocketModalOpen, setIsEcourtDocketModalOpen] = useState(false)

  const handleFetchEcourtDocket = async (customCnr?: string) => {
    const targetCnr = (customCnr || cnrLookupInput).trim()
    if (!targetCnr) {
      toast('Please enter a valid 16-character CNR number', 'error')
      return
    }
    setIsFetchingCnr(true)
    try {
      const res = await fetchDistrictCourtCase(targetCnr)
      setEcourtCaseData(res.data)
      setEcourtCaseSource(res.source)
      toast(
        res.source === 'LIVE_API'
          ? `Fetched docket for CNR ${res.data.cnr} from Live eCourts CIS API`
          : `Fetched official eCourts docket for CNR ${res.data.cnr}`,
        'ok'
      )
    } catch (e) {
      toast('Failed to fetch eCourts docket', 'error')
    } finally {
      setIsFetchingCnr(false)
    }
  }

  const handleApplyEcourtData = (data: ECourtsCaseDetail) => {
    setCaseNumber(`${data.caseNumber} (CNR: ${data.cnr})`)
    setCourtName(data.courtName)
    setJudgeName(data.presidingJudge)
    setPoliceStation(data.policeStation)
    setFirNumber(data.firNumber)
    setDateCaseFiled(data.filingDate)
    setCaseStatus('Trial')

    // Add acts and sections if not already present
    const newActs = data.actsAndSections.map((a) => `${a.act} - ${a.section}`)
    setSectionsTags((prev) => Array.from(new Set([...prev, ...newActs])))

    // Update case summary with eCourts docket details
    setCaseSummary(
      `Sessions trial registered under ${data.caseNumber} (${data.cnr}) before ${data.courtName}. ` +
      `Petitioner: ${data.petitioner} (Prosecutor: ${data.petitionerAdvocate}). ` +
      `Respondent: ${data.respondent} (Defense: ${data.respondentAdvocate}). ` +
      `Current Trial Stage: ${data.stage}. Investigation originating from ${data.policeStation} (FIR ${data.firNumber}).`
    )

    toast(`Applied eCourts CIS record (${data.cnr}) to active case docket!`, 'ok')
  }

  // =========================================================================
  // STEP 2: ACCUSED / CRIMINAL DETAILS
  // =========================================================================
  const [accusedList, setAccusedList] = useState<AccusedItem[]>(() => {
    if (existingCase && existingCase.parties) {
      const accusedParties = existingCase.parties.filter((p) => p.role === 'Accused')
      if (accusedParties.length > 0) {
        return accusedParties.map((p, idx) => ({
          id: `acc-${idx}`,
          fullName: p.name,
          alias: 'Badri',
          age: '34',
          dob: '1992-06-14',
          gender: 'Male',
          address: 'House 42, Gali No. 3, Rohini, New Delhi',
          phone: '+91-98101-55241',
          idProofType: 'Aadhaar Card',
          idProofNumber: '4482-9901-2294',
          photoUploaded: true,
          role: idx === 0 ? 'main accused' : 'accomplice',
          arrestStatus: p.custody === 'In custody' ? 'arrested' : p.custody === 'On bail' ? 'bail granted' : 'not arrested',
          arrestDate: '2026-03-15',
          bailDetails: p.custody === 'On bail' ? 'Regular bail granted with 2 sureties of ₹50,000' : 'Remand in judicial custody',
          hasPreviousCriminalHistory: true,
          previousCaseNumbers: 'SC/2021/DL/4901 (Bail Acq), FIR-88/2019 PS Kotwali',
          weaponUsed: true,
          weaponDescription: 'Country-made .315 bore firearm recovered from possession',
        }))
      }
    }
    return [
      {
        id: 'acc-1',
        fullName: 'Vikramaditya @ Vicky Singh',
        alias: 'Vicky Don',
        age: '36',
        dob: '1990-04-12',
        gender: 'Male',
        address: 'H.No 104, Pocket B, Mayur Vihar Phase 2, Delhi',
        phone: '+91-98712-40912',
        idProofType: 'Aadhaar Card',
        idProofNumber: '8912-3401-2281',
        photoUploaded: true,
        photoFileName: 'mugshot_vikramaditya_singh.jpg',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'main accused',
        arrestStatus: 'arrested',
        arrestDate: '2026-03-15',
        bailDetails: 'Bail application dismissed by Sessions Bench on 2026-04-02',
        hasPreviousCriminalHistory: true,
        previousCaseNumbers: 'FIR 112/2018 PS Rohini, CC 890/2022 PS Crime Branch',
        weaponUsed: true,
        weaponDescription: '9mm semi-automatic pistol recovered under Section 27 Evidence Act',
      },
    ]
  })

  // =========================================================================
  // STEP 3: VICTIM DETAILS
  // =========================================================================
  const [victimsList, setVictimsList] = useState<VictimItem[]>(() => {
    if (existingCase && existingCase.victims && existingCase.victims.details?.length > 0) {
      return existingCase.victims.details.map((v, idx) => ({
        id: `vic-${idx}`,
        fullName: v.name,
        isConfidential: v.masked,
        age: String(v.age || '29'),
        gender: 'Female',
        address: 'Confidential Address withheld under Witness Protection Scheme',
        contact: '+91-98710-88129',
        isMinor: v.age < 18,
        guardianDetails: v.age < 18 ? 'Mother / Natural Guardian' : '',
        relationshipWithAccused: v.relationship || 'Acquaintance / Neighbor',
        injuryOrLossDetails: 'Gunshot trauma to left shoulder, grievous injury under s. 116 BNS',
        medicalReportUploaded: true,
        victimStatementUploaded: true,
        victimStatementFileName: 'mlc_aiims_victim_statement_164.pdf',
        victimStatementDate: '2026-03-16',
        statementRef: 'MLC-AIIMS-2026/881 and Sec. 164 Statement before MM-02',
      }))
    }
    return [
      {
        id: 'vic-1',
        fullName: 'Ananya Sharma',
        isConfidential: caseType === 'POCSO',
        age: '28',
        gender: 'Female',
        address: 'Flat 402, Block C, Dwarka Sector 11, New Delhi',
        contact: '+91-98112-99881',
        isMinor: false,
        guardianDetails: '',
        relationshipWithAccused: 'Business Associate / Former Partner',
        injuryOrLossDetails: 'Gunshot penetration injury to shoulder, financial extortion',
        medicalReportUploaded: true,
        victimStatementUploaded: true,
        victimStatementFileName: 'sec_164_bnss_magistrate_ananya.pdf',
        victimStatementDate: '2026-03-16',
        statementRef: 'Sec. 164 BNSS Deposition before MM Court-02',
      },
    ]
  })

  // Auto-enforce victim confidentiality for POCSO
  useEffect(() => {
    if (caseType === 'POCSO') {
      setVictimsList((prev) => prev.map((v) => ({ ...v, isConfidential: true })))
    }
  }, [caseType])

  // =========================================================================
  // STEP 4: WITNESSES AND PEOPLE INVOLVED
  // =========================================================================
  const [witnessesList, setWitnessesList] = useState<WitnessItem[]>([
    {
      id: 'wit-1',
      fullName: 'Rameshwar Lal',
      type: 'eyewitness',
      contact: '+91-98765-12345',
      statementSummary: 'Saw the accused fleeing on motorcycle immediately after gunshots fired outside factory gate.',
      documentUploaded: true,
      documentName: 'statement_rameshwar_161_crpc.pdf',
    },
    {
      id: 'wit-2',
      fullName: 'Dr. Alok Verma (Senior Scientific Officer, FSL Rohini)',
      type: 'expert',
      contact: '+91-99887-76655',
      statementSummary: 'Confirmed lead projectile matched firearm test fired at forensic lab.',
      documentUploaded: true,
      documentName: 'fsl_ballistics_expert_affidavit.pdf',
    },
    {
      id: 'wit-3',
      fullName: 'Head Constable Sunil Kumar',
      type: 'police',
      contact: '+91-94120-00129',
      statementSummary: 'Recovery panch witness for seizure of spent cartridges and weapon recovery.',
      documentUploaded: true,
      documentName: 'seizure_panchnama_exhibit_p1.pdf',
    },
  ])

  // =========================================================================
  // STEP 5: EVIDENCE TRACKER
  // =========================================================================
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<
    'circumstantial' | 'forensic' | 'chemical' | 'physical' | 'documentary' | 'witness'
  >('forensic')

  const [evidenceItems, setEvidenceItems] = useState<ComprehensiveEvidenceItem[]>([
    {
      id: 'ev-1',
      evidenceId: 'EVD-2026-FSL-01',
      type: 'forensic',
      description: 'Spent brass cartridge casing (7.65mm) recovered from scene of incident',
      source: 'Spot inspection recovery',
      linksToCrime: 'Fired from the accused weapon recovered under Section 27',
      dateCollected: '2026-03-12',
      collectedBy: 'SI Rakesh Dogra (Crime Team)',
      forensicSubtype: 'ballistics',
      labName: 'FSL Rohini, Forensic Ballistics Division',
      reportNumber: 'FSL-2026/BAL-8902',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'SI Rakesh Dogra', receivedBy: 'Malkhana Moharrir PS Crime', dateTime: '2026-03-12 18:30', purpose: 'Safe sealed storage in Malkhana' },
        { handedBy: 'Ct. Pradeep Kumar', receivedBy: 'Director FSL Rohini', dateTime: '2026-03-14 11:00', purpose: 'Handed over for microscopic striation analysis' },
        { handedBy: 'SSO FSL Rohini', receivedBy: 'Court Master Bench 04', dateTime: '2026-04-10 10:15', purpose: 'Produced in court with sealed report' },
      ],
      uploadedFiles: ['cartridge_macro_photo.jpg', 'fsl_ballistics_report.pdf'],
    },
    {
      id: 'ev-2',
      evidenceId: 'EVD-2026-PHY-02',
      type: 'physical',
      description: 'Country-made .315 bore firearm with wooden grip',
      source: 'Disclosed location behind transformer, Sector 14',
      linksToCrime: 'Seized pursuant to Section 27 BNSS disclosure statement',
      dateCollected: '2026-03-15',
      collectedBy: 'Insp. Pradeep Rawat (IO)',
      physicalType: 'Weapon',
      status: 'Produced in court',
      chainOfCustody: [
        { handedBy: 'Insp. Pradeep Rawat', receivedBy: 'Malkhana Incharge', dateTime: '2026-03-15 20:00', purpose: 'Sealed deposit with lead seal' },
        { handedBy: 'Malkhana Incharge', receivedBy: 'Court Reader', dateTime: '2026-04-10 11:00', purpose: 'Marked Exhibit P-1 in presence of Accused' },
      ],
      uploadedFiles: ['firearm_exhibit_p1_inspection.jpg', 'seizure_memo_signed.pdf'],
    },
    {
      id: 'ev-3',
      evidenceId: 'EVD-2026-DOC-03',
      type: 'documentary',
      description: 'CCTV footage hard drive containing video of getaway motorcycle at 22:14 hrs',
      source: 'Industrial Unit Camera 04 DVR',
      linksToCrime: 'Identifies vehicle registration and helmetless co-accused',
      dateCollected: '2026-03-13',
      collectedBy: 'SI Manish Kumar',
      documentKind: 'CCTV footage & Section 65B BSA Certificate',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'Factory Owner (D. Singhal)', receivedBy: 'SI Manish Kumar', dateTime: '2026-03-13 14:00', purpose: 'Seizure under panchnama with Sec 65B hash certificate' },
      ],
      uploadedFiles: ['cctv_frame_capture.png', 'sec_65b_bsa_certificate.pdf'],
    },
    {
      id: 'ev-4',
      evidenceId: 'EVD-2026-CIR-04',
      type: 'circumstantial',
      description: 'Call Detail Records (CDR) proving co-location of accused and victim 15 mins prior',
      source: 'Telecom Service Provider Nodal Officer',
      linksToCrime: 'Pre-meditation and presence at proximate distance',
      dateCollected: '2026-03-16',
      collectedBy: 'Insp. Pradeep Rawat',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'Nodal Officer Airtel', receivedBy: 'IO', dateTime: '2026-03-16 16:00', purpose: 'Cryptographic dump with CAF verification' },
      ],
      uploadedFiles: ['cdr_tower_analysis_sheet.xlsx', 'nodal_affidavit.pdf'],
    },
    {
      id: 'ev-5',
      evidenceId: 'EVD-2026-CHM-05',
      type: 'chemical',
      description: 'Viscera toxicology analysis and chemical testing of gunshot residue traces',
      source: 'Hospital Emergency Autopsy Sample Sealed',
      linksToCrime: 'Chemical analysis confirms organic nitrite and lead propellant residue on hands',
      dateCollected: '2026-03-13',
      collectedBy: 'Dr. S. K. Goel (Chemical Examiner)',
      labName: 'Central Chemical Examiner Laboratory (CCEL) Rohini',
      reportNumber: 'CCEL-2026/TOX-4819',
      status: 'Report received',
      chainOfCustody: [
        { handedBy: 'Dr. S. K. Goel', receivedBy: 'Malkhana Incharge', dateTime: '2026-03-14 10:00', purpose: 'Sealed viscera box custody' },
        { handedBy: 'Malkhana Incharge', receivedBy: 'Court Reader', dateTime: '2026-04-10 11:30', purpose: 'Exhibited in trial record under seal' },
      ],
      uploadedFiles: ['chemical_toxicology_findings.pdf', 'viscera_seal_memo.jpg'],
    },
    {
      id: 'ev-6',
      evidenceId: 'EVD-2026-WIT-06',
      type: 'witness',
      description: 'Magisterial In-Camera Audio-Video Recorded Deposition of Star Witness (Sec. 164 BNSS)',
      source: 'Metropolitan Magistrate Court No. 02 Official Record',
      linksToCrime: 'Direct positive ocular identification of accused at crime scene',
      dateCollected: '2026-03-14',
      collectedBy: 'Hon. MM Court-02 Magistrate',
      status: 'Produced in court',
      chainOfCustody: [
        { handedBy: 'Judicial Magistrate MM-02', receivedBy: 'Sessions Court Master', dateTime: '2026-03-20 14:00', purpose: 'Committal envelope transmitted under court seal' },
      ],
      uploadedFiles: ['magistrate_164_confidential_deposition.pdf'],
    },
  ])

  // =========================================================================
  // STEP 6: INVESTIGATION DOCUMENTS (POLICE / IO)
  // =========================================================================
  const [ioName, setIoName] = useState(existingCase?.io?.name || 'Insp. Pradeep Rawat')
  const [ioRank, setIoRank] = useState(existingCase?.io?.rank || 'Inspector of Police')
  const [ioPhone, setIoPhone] = useState(existingCase?.io?.phone || '+91-98110-44910')
  const [ioEmail, setIoEmail] = useState('io.delhipolice.crime@gov.in')

  const [investigationDocs, setInvestigationDocs] = useState<InvestigationDocItem[]>([
    { id: 'inv-1', name: 'FIR (First Information Report)', status: 'Verified', fileName: 'fir_208_2026_certified.pdf' },
    { id: 'inv-2', name: 'Arrest Memo', status: 'Verified', fileName: 'arrest_memo_signed.pdf' },
    { id: 'inv-3', name: 'Seizure Memo (Panchnama)', status: 'Verified', fileName: 'seizure_panchnama_exhibit_p1.pdf' },
    { id: 'inv-4', name: 'Scene of Crime Report (Spot Inspection)', status: 'Verified', fileName: 'crime_scene_inspection_sketch.pdf' },
    { id: 'inv-5', name: 'Post-Mortem / Medical (MLC) Report', status: 'Verified', fileName: 'mlc_aiims_forensic_injury.pdf' },
    { id: 'inv-6', name: 'Forensic (FSL) Reports', status: 'Verified', fileName: 'fsl_rohini_ballistics_signed.pdf' },
    { id: 'inv-7', name: 'Witness Statements (Sec. 161 / 164 BNSS)', status: 'Verified', fileName: 'statements_161_164_bundle.pdf' },
    { id: 'inv-8', name: 'Chargesheet (Final Report u/s 173 BNSS)', status: 'Verified', fileName: 'chargesheet_final_report_173.pdf' },
  ])

  const [progressLogs, setProgressLogs] = useState<ProgressLogEntry[]>([
    { id: 'log-1', date: '2026-03-12', actionTaken: 'FIR registered; spot visited by Crime Team; spent cartridge seized.', nextActionDate: '2026-03-14' },
    { id: 'log-2', date: '2026-03-15', actionTaken: 'Accused arrested; weapon recovered on disclosure; sent for 2-day police remand.', nextActionDate: '2026-03-18' },
    { id: 'log-3', date: '2026-03-28', actionTaken: 'Ballistics and chemical reports received from FSL; CDR analysis completed.', nextActionDate: '2026-04-05' },
    { id: 'log-4', date: '2026-04-05', actionTaken: 'Final chargesheet submitted before Magistrate under Sec 173 BNSS.', nextActionDate: '2026-04-18' },
  ])

  // =========================================================================
  // STEP 7: CASE READINESS CHECKLIST & JUDGMENT DRAFT STUDIO
  // =========================================================================
  const [readinessItems, setReadinessItems] = useState<CaseReadinessItem[]>(INITIAL_READINESS_ITEMS)
  const [readinessCategoryFilter, setReadinessCategoryFilter] = useState<string>('all')
  const [readinessStatusFilter, setReadinessStatusFilter] = useState<'All' | 'Outstanding' | 'Verified' | 'Requires Review'>('All')
  const [isJudgeReviewedConfirmed, setIsJudgeReviewedConfirmed] = useState<boolean>(false)
  const [showJudgmentDraftStudio, setShowJudgmentDraftStudio] = useState<boolean>(false)
  const [judgmentDraftTab, setJudgmentDraftTab] = useState<'preview' | 'operative' | 'citations'>('preview')
  const [editingItemNoteId, setEditingItemNoteId] = useState<string | null>(null)
  const [tempItemNote, setTempItemNote] = useState<string>('')

  // Backward compatibility alias for Step 8 review checks
  const [judgementDocs, setJudgementDocs] = useState<JudgementDocCheckItem[]>([
    { id: 'jd-1', title: 'Chargesheet and charges framed by Court', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-2', title: 'Exhibit list and marked material objects (Ex. P-1 to P-8)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-3', title: 'Witness depositions and cross-examination records (PW-1 to PW-6)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-4', title: 'Forensic (FSL) and medical reports (MLC)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-5', title: 'Prosecution arguments and defence written arguments', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-6', title: 'Bail orders and previous interlocutory court orders', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-7', title: 'Victim impact statement and compensation calculation', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-8', title: 'Criminal history record of the accused (Crime Bureau)', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-9', title: 'Case law / precedent references and judicial authorities', isUploaded: true, isReviewed: true, status: 'Reviewed' },
    { id: 'jd-10', title: "Presiding Judge's notes and deliberations (Confidential)", isUploaded: true, isReviewed: true, status: 'Reviewed' },
  ])

  const [precedentLinks, setPrecedentLinks] = useState(
    'State of UP v. Satish (2005) 3 SCC 114 (Ballistics & recovery under Sec 27); Sharad Birdhichand Sarda v. State of Maharashtra (1984) 4 SCC 116 (Golden principles of circumstantial evidence)'
  )
  const [judgeNotes, setJudgeNotes] = useState(
    'The prosecution has established beyond reasonable doubt the recovery of the weapon pursuant to disclosure. The ballistics report conclusively connects the striation marks on the fired cartridge. The alibi defense raised by defense counsel failed to withstand cross-examination.'
  )
  const [finalVerdict, setFinalVerdict] = useState<'Convicted' | 'Acquitted' | 'Discharged'>('Convicted')
  const [judgementSections, setJudgementSections] = useState<string[]>(['BNS s. 103 (Murder)', 'Arms Act s. 25'])
  const [newJudgementSectionInput, setNewJudgementSectionInput] = useState('')
  const [punishmentSentence, setPunishmentSentence] = useState('Rigorous Imprisonment for 10 Years and Fine of ₹50,000')
  const [judgementReasons, setJudgementReasons] = useState(
    'Chain of evidence complete; witness testimony corroborated by objective ballistics finding; statutory ingredients under BNS Section 103 satisfied.'
  )
  const [judgementDate, setJudgementDate] = useState('2026-10-24')
  const [judgementPdfUploaded, setJudgementPdfUploaded] = useState(true)
  const [judgementPdfFileName, setJudgementPdfFileName] = useState('signed_decree_sessions_court_DL04.pdf')

  // Calculate Case Readiness Metrics adapted to case type
  const applicableReadinessItems = readinessItems.filter((i) => {
    if (!i.applicableCaseTypes) return true
    return i.applicableCaseTypes.includes(caseType)
  })

  const verifiedCount = applicableReadinessItems.filter((i) => i.status === 'Verified').length
  const pendingCount = applicableReadinessItems.filter((i) => i.status === 'Pending').length
  const disputedCount = applicableReadinessItems.filter((i) => i.status === 'Disputed').length
  const requiresReviewCount = applicableReadinessItems.filter((i) => i.status === 'Requires Review').length
  const notApplicableCount = applicableReadinessItems.filter((i) => i.status === 'Not Applicable').length
  const outstandingItemsList = applicableReadinessItems.filter(
    (i) => i.status === 'Pending' || i.status === 'Disputed' || i.status === 'Requires Review'
  )
  const outstandingCount = outstandingItemsList.length
  const totalAssessable = applicableReadinessItems.filter((i) => i.status !== 'Not Applicable').length
  const readinessPercent = totalAssessable > 0 ? Math.round((verifiedCount / totalAssessable) * 100) : 100
  const reviewedCount = verifiedCount
  const totalJudgementDocs = totalAssessable

  // Quick status update helper
  const updateReadinessStatus = (id: string, newStatus: ReadinessStatus) => {
    setReadinessItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    )
    toast(`Requirement marked as ${newStatus}`, 'ok')
  }

  // =========================================================================
  // STEP SWITCHING & NAVIGATION HELPERS
  // =========================================================================
  const getStepRoute = (stepKey: StepKey) => {
    const caseParam = id && id !== 'new' ? id : activeCaseId
    if (stepKey === 'details' && (!id || id === 'new')) {
      return '/case/new/details'
    }
    return `/case/${caseParam}/${stepKey}`
  }

  const navigateToStep = (targetStepKey: StepKey) => {
    // If starting from new details, make sure case ID exists
    let targetCaseId = id && id !== 'new' ? id : activeCaseId
    if (targetCaseId.startsWith('case-draft-') && targetStepKey !== 'details') {
      // Auto-save the new draft case into store if moving past step 1
      const preview = judicialStore.generateCaseNumberAndName({
        jurisdictionCode: 'DL',
        caseType: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
        year: 2026,
        policeStationCode: policeStation.slice(0, 4).toUpperCase(),
        primaryComplainant: 'State (NCT of Delhi)',
        primaryAccused: accusedList[0]?.fullName || 'Accused',
        coAccusedCount: Math.max(0, accusedList.length - 1),
        primaryStatuteSection: sectionsTags[0] || 'BNS',
      })

      const newRecord = judicialStore.ingestNewCase({
        number: caseNumber || preview.caseNumber,
        title: preview.caseName,
        type: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
        court: courtName,
        acts: sectionsTags,
        stage: caseStatus === 'Closed' ? 'Judgment Reserved' : caseStatus,
        status: 'ontrack',
        filingDate: dateCaseFiled,
        nextHearing: '2026-10-24',
        judge: judgeName,
        policeStation: policeStation,
        fir: {
          no: firNumber,
          date: firDate,
          time: firTime,
          gdNo: gdEntryNo,
          gdTime: gdEntryTime,
          complainantName: firComplainantName,
          complainantContact: firComplainantContact,
          dutyOfficer: firDutyOfficer,
          infoType: firInformationType,
          delayReason: firDelayReason,
          docFileName: firDocUploaded ? firDocFileName : undefined,
          docFileSize: firDocUploaded ? firDocFileSize : undefined,
          docStatus: firDocUploaded ? firDocStatus : 'Pending',
        },
        intakeDocuments: intakeDocs,
        isClosed: caseStatus === 'Closed',
        io: {
          name: ioName,
          rank: ioRank,
          badge: 'DL-POL-8821',
          policeStation: policeStation,
          phone: ioPhone,
          chargesheetRef: `CS-${firNumber}`,
        },
        parties: [
          { role: 'Prosecutor', name: 'State (NCT of Delhi)' },
          ...accusedList.map((a) => ({
            role: 'Accused' as const,
            name: a.fullName,
            custody: a.arrestStatus === 'arrested' ? ('In custody' as const) : ('On bail' as const),
          })),
        ],
        victims: {
          total: victimsList.length,
          minors: victimsList.filter((v) => v.isMinor).length,
          adults: victimsList.filter((v) => !v.isMinor).length,
          details: victimsList.map((v) => ({
            name: v.fullName,
            masked: v.isConfidential,
            age: parseInt(v.age, 10) || 25,
            relationship: v.relationshipWithAccused,
          })),
        },
        weapons: accusedList
          .filter((a) => a.weaponUsed)
          .map((a, i) => ({
            id: `wp-${i}`,
            type: 'FIREARM' as const,
            makeModel: a.weaponDescription || 'Country Firearm',
            serialNumber: `SN-992${i}`,
            recoveryMemo: 'Recovery Panchnama under Section 27',
            recoveryDate: a.arrestDate || '2026-03-15',
            recoveryPlace: incidentPlace,
            ballisticStatus: 'MATCHED' as const,
            notes: 'Test fired by FSL Rohini',
          })),
        evidence: evidenceItems.map((e) => ({
          id: e.id,
          code: e.evidenceId,
          kind: e.type === 'circumstantial' ? 'Circumstantial' : e.type === 'forensic' ? 'Forensic' : 'Documentary',
          title: e.description,
          detail: e.linksToCrime,
          custodyOfficer: e.collectedBy,
          date: e.dateCollected,
          place: e.source,
          labStatus: e.status === 'Report received' ? 'received' : 'pending',
          admission: 'admitted',
          chainHash: 'sha256-verified-evidence-hash',
        })),
        documents: [],
        hearings: [],
        additionalDetails: caseSummary,
      })
      targetCaseId = newRecord.id
      setActiveCaseId(newRecord.id)
    }

    navigate(`/case/${targetCaseId}/${targetStepKey}`)
  }

  const handleNext = () => {
    const currentIndex = STEP_DEFINITIONS.findIndex((s) => s.key === activeStepKey)
    if (currentIndex < STEP_DEFINITIONS.length - 1) {
      navigateToStep(STEP_DEFINITIONS[currentIndex + 1].key)
    }
  }

  const handlePrev = () => {
    const currentIndex = STEP_DEFINITIONS.findIndex((s) => s.key === activeStepKey)
    if (currentIndex > 0) {
      navigateToStep(STEP_DEFINITIONS[currentIndex - 1].key)
    }
  }

  // Handle final submission in Step 8
  const handleSubmitDocket = () => {
    // Generate or finalize case in store
    const preview = judicialStore.generateCaseNumberAndName({
      jurisdictionCode: 'DL',
      caseType: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
      year: 2026,
      policeStationCode: policeStation.slice(0, 4).toUpperCase(),
      primaryComplainant: 'State (NCT of Delhi)',
      primaryAccused: accusedList[0]?.fullName || 'Accused',
      coAccusedCount: Math.max(0, accusedList.length - 1),
      primaryStatuteSection: sectionsTags[0] || 'BNS',
    })

    const finalCase = judicialStore.ingestNewCase({
      number: caseNumber || preview.caseNumber,
      title: preview.caseName,
      type: caseType === 'Divorce/Family' ? 'Matrimonial' : caseType === 'Other' ? 'Civil' : (caseType as any),
      court: courtName,
      acts: sectionsTags,
      stage: caseStatus,
      status: 'ontrack',
      filingDate: dateCaseFiled,
      nextHearing: '2026-10-24',
      judge: judgeName,
      policeStation: policeStation,
      fir: {
        no: firNumber,
        date: firDate,
        time: firTime,
        gdNo: gdEntryNo,
        gdTime: gdEntryTime,
        complainantName: firComplainantName,
        complainantContact: firComplainantContact,
        dutyOfficer: firDutyOfficer,
        infoType: firInformationType,
        delayReason: firDelayReason,
        docFileName: firDocUploaded ? firDocFileName : undefined,
        docFileSize: firDocUploaded ? firDocFileSize : undefined,
        docStatus: firDocUploaded ? firDocStatus : 'Pending',
      },
      intakeDocuments: intakeDocs,
      isClosed: caseStatus === 'Closed',
      io: {
        name: ioName,
        rank: ioRank,
        badge: 'DL-POL-8821',
        policeStation: policeStation,
        phone: ioPhone,
        chargesheetRef: `CS-${firNumber}`,
      },
      parties: [
        { role: 'Prosecutor', name: 'State (NCT of Delhi)' },
        ...accusedList.map((a) => ({
          role: 'Accused' as const,
          name: a.fullName,
          custody: a.arrestStatus === 'arrested' ? ('In custody' as const) : ('On bail' as const),
        })),
      ],
      victims: {
        total: victimsList.length,
        minors: victimsList.filter((v) => v.isMinor).length,
        adults: victimsList.filter((v) => !v.isMinor).length,
        details: victimsList.map((v) => ({
          name: v.fullName,
          masked: v.isConfidential,
          age: parseInt(v.age, 10) || 25,
          relationship: v.relationshipWithAccused,
        })),
      },
      weapons: accusedList
        .filter((a) => a.weaponUsed)
        .map((a, i) => ({
          id: `wp-${i}`,
          type: 'FIREARM' as const,
          makeModel: a.weaponDescription || 'Country Firearm',
          serialNumber: `SN-992${i}`,
          recoveryMemo: 'Recovery Panchnama under Section 27',
          recoveryDate: a.arrestDate || '2026-03-15',
          recoveryPlace: incidentPlace,
          ballisticStatus: 'MATCHED' as const,
          notes: 'Test fired by FSL Rohini',
        })),
      evidence: evidenceItems.map((e) => ({
        id: e.id,
        code: e.evidenceId,
        kind: e.type === 'circumstantial' ? 'Circumstantial' : e.type === 'forensic' ? 'Forensic' : 'Documentary',
        title: e.description,
        detail: e.linksToCrime,
        custodyOfficer: e.collectedBy,
        date: e.dateCollected,
        place: e.source,
        labStatus: e.status === 'Report received' ? 'received' : 'pending',
        admission: 'admitted',
        chainHash: 'sha256-verified-evidence-hash',
      })),
      documents: [],
      hearings: [],
      additionalDetails: caseSummary,
    })

    toast(`Case docket ${finalCase.number} successfully registered in registry!`, 'ok')
    navigate(`/case/${finalCase.id}`)
  }

  // Quick tag helpers for Step 1
  const addSectionTag = () => {
    if (newSectionInput.trim() && !sectionsTags.includes(newSectionInput.trim())) {
      setSectionsTags([...sectionsTags, newSectionInput.trim()])
      setNewSectionInput('')
    }
  }

  const removeSectionTag = (tag: string) => {
    setSectionsTags(sectionsTags.filter((t) => t !== tag))
  }

  // Quick accused helpers for Step 2
  const addAccused = () => {
    const newAcc: AccusedItem = {
      id: `acc-${Date.now()}`,
      fullName: '',
      alias: '',
      age: '',
      dob: '',
      gender: 'Male',
      address: '',
      phone: '',
      idProofType: 'Aadhaar Card',
      idProofNumber: '',
      photoUploaded: false,
      role: 'accomplice',
      arrestStatus: 'not arrested',
      arrestDate: '',
      bailDetails: '',
      hasPreviousCriminalHistory: false,
      previousCaseNumbers: '',
      weaponUsed: false,
      weaponDescription: '',
    }
    setAccusedList([...accusedList, newAcc])
  }

  const removeAccused = (idToRemove: string) => {
    if (accusedList.length === 1) {
      toast('At least one accused must remain in docket', 'bad')
      return
    }
    setAccusedList(accusedList.filter((a) => a.id !== idToRemove))
  }

  // Quick victim helpers for Step 3
  const addVictim = () => {
    const newVic: VictimItem = {
      id: `vic-${Date.now()}`,
      fullName: '',
      isConfidential: caseType === 'POCSO',
      age: '',
      gender: 'Female',
      address: '',
      contact: '',
      isMinor: false,
      guardianDetails: '',
      relationshipWithAccused: '',
      injuryOrLossDetails: '',
      medicalReportUploaded: false,
      victimStatementUploaded: false,
      statementRef: '',
    }
    setVictimsList([...victimsList, newVic])
  }

  const removeVictim = (idToRemove: string) => {
    setVictimsList(victimsList.filter((v) => v.id !== idToRemove))
  }

  // Quick witness helpers for Step 4
  const addWitness = () => {
    const newWit: WitnessItem = {
      id: `wit-${Date.now()}`,
      fullName: '',
      type: 'eyewitness',
      contact: '',
      statementSummary: '',
      documentUploaded: false,
      documentName: '',
    }
    setWitnessesList([...witnessesList, newWit])
  }

  const removeWitness = (idToRemove: string) => {
    setWitnessesList(witnessesList.filter((w) => w.id !== idToRemove))
  }

  // Quick evidence helpers for Step 5
  const addEvidence = (type: ComprehensiveEvidenceItem['type']) => {
    const newEv: ComprehensiveEvidenceItem = {
      id: `ev-${Date.now()}`,
      evidenceId: `EVD-2026-${type.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      description: '',
      source: '',
      linksToCrime: '',
      dateCollected: new Date().toISOString().split('T')[0],
      collectedBy: ioName,
      status: 'Collected',
      chainOfCustody: [
        {
          handedBy: ioName,
          receivedBy: 'Police Malkhana',
          dateTime: new Date().toLocaleString(),
          purpose: 'Initial evidentiary intake',
        },
      ],
      uploadedFiles: [],
    }
    setEvidenceItems([...evidenceItems, newEv])
  }

  const addChainOfCustodyRow = (evidenceId: string) => {
    setEvidenceItems((prev) =>
      prev.map((e) => {
        if (e.id === evidenceId) {
          return {
            ...e,
            chainOfCustody: [
              ...e.chainOfCustody,
              {
                handedBy: '',
                receivedBy: '',
                dateTime: new Date().toLocaleString(),
                purpose: '',
              },
            ],
          }
        }
        return e
      })
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121316] pb-24">
      {/* Top Judicial Banner */}
      <div className="bg-white border-b border-black/[0.08] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/cases"
                className="size-9 rounded-full bg-zinc-100 hover:bg-zinc-200 grid place-items-center text-zinc-700 transition-colors"
                title="Back to Case Registry"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-white">
                    {caseNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                    Step {currentStepNumber} of 8
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 mt-0.5">
                  Judicial Case Intake Pipeline · {STEP_DEFINITIONS.find((s) => s.key === activeStepKey)?.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/case/${activeCaseId}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="size-3.5 mr-1" />
                  View Case Overview
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={() => {
                  toast('Draft state auto-saved in local registry.', 'ok')
                }}
              >
                <CheckCircle2 className="size-3.5 mr-1 text-emerald-400" />
                Save Progress
              </Button>
            </div>
          </div>

          {/* 8-Step Interactive Navigation Pills */}
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-black/[0.05] pt-3">
            {STEP_DEFINITIONS.map((step) => {
              const isActive = step.key === activeStepKey
              const isPast = step.stepNumber < currentStepNumber
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => navigateToStep(step.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-sm ring-1 ring-black'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent'
                  }`}
                >
                  <span
                    className={`size-5 rounded-full grid place-items-center text-[11px] font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-black'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-300 text-zinc-700'
                    }`}
                  >
                    {isPast ? <Check className="size-3 stroke-[3]" /> : step.stepNumber}
                  </span>
                  <span>{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* =================================================================== */}
        {/* STEP 1: CASE DETAILS                                                */}
        {/* =================================================================== */}
        {activeStepKey === 'details' && (
          <div className="space-y-6">
            {/* 1. Primary Judicial Docket Identity Card */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="border-b border-black/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <FileText className="size-5 text-indigo-600" />
                    Step 1: Case Details &amp; Legal Framework
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Establish the unique CNR docket identity, court jurisdiction, and case initiation parameters.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
                  <ShieldCheck className="size-3.5 text-indigo-600" />
                  <span>Judicial Registry Standard</span>
                </div>
              </div>

              {/* eCourts CIS Real-World API Docket Verification Module */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      CIS
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                        National eCourts CIS Live Case Verification
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono font-semibold">
                          POST /district-court/case
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Query official Indian District Court registry by 16-character CNR number to verify filing and auto-populate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCnrLookupInput('DLST020314162024')
                        handleFetchEcourtDocket('DLST020314162024')
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 hover:border-blue-300 transition"
                    >
                      Load Sample Saket CNR: <span className="font-mono">DLST020314162024</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                    <Input
                      value={cnrLookupInput}
                      onChange={(e) => setCnrLookupInput(e.target.value.toUpperCase())}
                      placeholder="Enter 16-digit CNR Number (e.g., DLST020314162024)"
                      className="pl-9 h-10 text-xs font-mono font-bold bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isFetchingCnr}
                    onClick={() => handleFetchEcourtDocket()}
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 gap-1.5"
                  >
                    {isFetchingCnr ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Search className="size-3.5" />
                    )}
                    Fetch Official eCourts Record
                  </Button>
                </div>

                {/* API Preview / Active Response Badge */}
                {ecourtCaseData && (
                  <div className="p-3.5 rounded-xl bg-white border border-blue-200 space-y-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">{ecourtCaseData.caseNumber}</span>
                        <span className="font-mono text-zinc-500 font-bold">({ecourtCaseData.cnr})</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            ecourtCaseSource === 'LIVE_API'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ecourtCaseSource === 'LIVE_API'
                            ? '● Live eCourts CIS Verified'
                            : '● Verified National Mirror'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEcourtDocketModalOpen(true)}
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          View History &amp; Orders ({ecourtCaseData.history?.length || 0}) &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyEcourtData(ecourtCaseData)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                        >
                          <Check className="size-3" />
                          Apply Data to Case Docket
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-zinc-600">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Court &amp; Complex:</span>
                        <span className="font-medium text-zinc-800">{ecourtCaseData.courtName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Prosecution &amp; Police Station:</span>
                        <span className="font-medium text-zinc-800">
                          {ecourtCaseData.petitioner} &middot; {ecourtCaseData.policeStation} (FIR {ecourtCaseData.firNumber})
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Respondent &amp; Defense Advocate:</span>
                        <span className="font-medium text-zinc-800">
                          {ecourtCaseData.respondent} ({ecourtCaseData.respondentAdvocate})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Case Number (Auto-Generated CNR)
                  </label>
                  <div className="relative">
                    <Input value={caseNumber} readOnly className="bg-zinc-100 font-mono font-bold text-zinc-800" />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400 uppercase">
                      Read-Only
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">Format: CNR/YEAR/COURT/SERIAL</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Case Type</label>
                  <Select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value as any)}
                    className="w-full font-semibold"
                  >
                    <option value="Criminal">Criminal (Sessions / Warrant)</option>
                    <option value="POCSO">POCSO Special Court</option>
                    <option value="Divorce/Family">Divorce / Family Court</option>
                    <option value="Civil">Civil Suit</option>
                    <option value="Other">Other Miscellaneous Petition</option>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Court Name</label>
                  <Input value={courtName} onChange={(e) => setCourtName(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Presiding Judge</label>
                  <Input value={judgeName} onChange={(e) => setJudgeName(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Date Case Was Filed</label>
                  <Input type="date" value={dateCaseFiled} onChange={(e) => setDateCaseFiled(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Case Status</label>
                  <Select
                    value={caseStatus}
                    onChange={(e) => setCaseStatus(e.target.value as any)}
                    className="w-full font-semibold"
                  >
                    <option value="Registered">Registered</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Chargesheet Filed">Chargesheet Filed</option>
                    <option value="Trial">Trial</option>
                    <option value="Judgement Reserved">Judgement Reserved</option>
                    <option value="Closed">Closed</option>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Date of Incident</label>
                  <Input type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Place of Incident / Scene of Crime</label>
                  <Input value={incidentPlace} onChange={(e) => setIncidentPlace(e.target.value)} required />
                </div>
              </div>
            </Card>

            {/* 2. Elevated First Information Report (FIR) Dossier & Document Upload Card */}
            <Card className="p-6 sm:p-8 space-y-6 border-indigo-100 bg-gradient-to-b from-indigo-50/20 via-white to-white">
              <div className="border-b border-black/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Primary Inception Record
                    </span>
                    <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <FolderOpen className="size-4.5 text-indigo-600" />
                      First Information Report (FIR) &amp; Police Station Docket
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    First Information Report recorded under Section 154 CrPC / Sec 173 BNSS, GD entry, informant details, and certified copy upload.
                  </p>
                </div>

                {firDocUploaded ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Certified FIR Copy Attached
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <AlertTriangle className="size-3.5 text-amber-600" />
                    FIR Document Required
                  </span>
                )}
              </div>

              {/* FIR Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Police Station / Precinct</label>
                  <Input value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} required />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">FIR Number</label>
                  <Input value={firNumber} onChange={(e) => setFirNumber(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">FIR Date</label>
                    <Input type="date" value={firDate} onChange={(e) => setFirDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">Time of FIR</label>
                    <Input value={firTime} onChange={(e) => setFirTime(e.target.value)} placeholder="03:45 AM" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">General Diary (GD) Entry No</label>
                  <Input value={gdEntryNo} onChange={(e) => setGdEntryNo(e.target.value)} placeholder="e.g. GD-38/A" />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">GD Entry Time</label>
                  <Input value={gdEntryTime} onChange={(e) => setGdEntryTime(e.target.value)} placeholder="e.g. 02:15 AM" />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Type of Information</label>
                  <Select
                    value={firInformationType}
                    onChange={(e) => setFirInformationType(e.target.value as any)}
                    className="w-full font-semibold"
                  >
                    <option value="Written">Written Police Complaint</option>
                    <option value="Oral">Oral Information (Reduced to Writing)</option>
                    <option value="Telephonic">Telephonic / PCR Call</option>
                    <option value="Suo Motu">Suo Motu / Police Action</option>
                  </Select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Complainant / Informant Name</label>
                  <Input value={firComplainantName} onChange={(e) => setFirComplainantName(e.target.value)} placeholder="Full name of informant" />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Informant Contact / Phone</label>
                  <Input value={firComplainantContact} onChange={(e) => setFirComplainantContact(e.target.value)} placeholder="+91 98XXX XXXXX" />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Duty Officer / Registered By</label>
                  <Input value={firDutyOfficer} onChange={(e) => setFirDutyOfficer(e.target.value)} placeholder="Name & Badge No." />
                </div>

                <div className="md:col-span-3">
                  <label className="font-bold text-zinc-700 block mb-1">Reason for Delay in FIR Lodging (if applicable)</label>
                  <Input value={firDelayReason} onChange={(e) => setFirDelayReason(e.target.value)} placeholder="Explain if FIR lodged after delay or 'No delay; prompt lodging'" />
                </div>
              </div>

              {/* Certified Copy of FIR Document Upload Box */}
              <div className="pt-3 border-t border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <Paperclip className="size-3.5 text-indigo-600" />
                    <span>Certified First Information Report (FIR) Document Copy</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">Section 154 CrPC / Section 173 BNSS Certified Record</span>
                </div>

                {firDocUploaded ? (
                  <div className="p-4 rounded-2xl bg-white border border-indigo-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="size-11 rounded-xl bg-indigo-50 border border-indigo-200 grid place-items-center shrink-0 text-indigo-700">
                        <FileText className="size-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs text-zinc-900">{firDocFileName}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide">
                            {firDocStatus}
                          </span>
                          <span className="text-[11px] text-zinc-400">({firDocFileSize})</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Registered at {policeStation} · Date: {firDate} {firTime} · Certified by Station House Officer
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setPreviewingDoc({
                            title: `Certified FIR Record (${firNumber})`,
                            fileName: firDocFileName,
                            category: 'FIR Copy',
                            date: firDate,
                            size: firDocFileSize,
                            seal: 'SEAL OF SESSIONS COURT · NEW DELHI DISTRICT',
                            summary: `First Information Report registered at ${policeStation} under ${sectionsTags.join(', ')}. Informant: ${firComplainantName}. Incident date: ${incidentDate} at ${incidentPlace}. Duty Officer: ${firDutyOfficer}. Certified under Sec 63 BNSS.`,
                          })
                        }}
                      >
                        <Eye className="size-3.5 mr-1 text-indigo-600" />
                        View Document
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const newName = `fir_${firNumber.replace(/[^a-zA-Z0-9]/g, '_')}_scanned_copy_${Date.now().toString().slice(-4)}.pdf`
                          setFirDocFileName(newName)
                          toast(`Updated FIR file attachment: ${newName}`, 'ok')
                        }}
                      >
                        <Upload className="size-3.5 mr-1" />
                        Replace File
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setFirDocUploaded(false)
                          toast('FIR document unattached', 'info')
                        }}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove FIR Document"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-zinc-50/50 hover:bg-indigo-50/20 transition-colors">
                    <Upload className="size-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-800">
                      Attach Certified FIR Copy (PDF, JPG, PNG up to 25MB)
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Ensure the document contains the signature of the SHO and the official precinct stamp.
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setFirDocUploaded(true)
                          setFirDocFileName(`fir_${firNumber.replace(/[^a-zA-Z0-9]/g, '_')}_certified.pdf`)
                          toast('Certified FIR copy uploaded successfully', 'ok')
                        }}
                      >
                        <Upload className="size-3.5 mr-1" />
                        Upload Certified FIR Copy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 3. Supporting Case Intake Documents Repository Card */}
            <Card className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                    <Layers className="size-4.5 text-zinc-700" />
                    Supporting Case Intake Documents &amp; Initial Records ({intakeDocs.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Tehrir (written complaint), General Diary extract, crime scene sketch, and preliminary medical certificates attached upon case docketing.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={() => {
                    setNewIntakeDocTitle('')
                    setNewIntakeDocFileName(`doc_intake_${Date.now().toString().slice(-4)}.pdf`)
                    setNewIntakeDocNotes('')
                    setShowAddIntakeDocModal(true)
                  }}
                >
                  <Plus className="size-3.5 mr-1 text-indigo-600" />
                  Attach New Intake Document
                </Button>
              </div>

              {/* Intake Documents Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {intakeDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="size-9 rounded-xl bg-zinc-100 border border-zinc-200 grid place-items-center shrink-0 text-zinc-700">
                          <FileText className="size-4.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-zinc-900 leading-snug">{doc.title}</h4>
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            {doc.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          doc.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Uploaded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-black/[0.04]">
                      <span className="font-mono text-zinc-600 truncate max-w-[180px]">{doc.fileName}</span>
                      <span>{doc.fileSize} · {doc.uploadDate}</span>
                    </div>

                    {doc.notes && (
                      <p className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                        "{doc.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7.5 px-3"
                        onClick={() => {
                          setPreviewingDoc({
                            title: doc.title,
                            fileName: doc.fileName,
                            category: doc.category,
                            date: doc.uploadDate,
                            size: doc.fileSize,
                            seal: 'SEAL OF SESSIONS COURT · EXHIBIT ATTACHMENT',
                            summary: doc.notes || `Official case intake attachment: ${doc.title} submitted under FIR ${firNumber}. Verified for judicial docket ingestion.`,
                          })
                        }}
                      >
                        <Eye className="size-3 mr-1 text-zinc-600" />
                        View Document
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setIntakeDocs(intakeDocs.filter((d) => d.id !== doc.id))
                          toast(`Removed ${doc.title}`, 'info')
                        }}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer text-xs flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 4. Sections of Law Applied */}
            <Card className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-900 block">
                  Sections of Law Applied (Multi-Select Tags)
                </label>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Statutory penal codes, procedural sections, and special statutory acts invoked in the FIR and docket.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                {sectionsTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-zinc-900 border border-zinc-300 shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeSectionTag(tag)}
                      className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSectionTag()
                    }
                  }}
                  placeholder="e.g. BNS s.103, Arms Act s.25, CrPC s.164"
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addSectionTag}>
                  <Plus className="size-3.5 mr-1" />
                  Add Section
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSectionsTags([...sectionsTags, 'BNS s. 109'])}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-black underline cursor-pointer"
                >
                  + Add BNS s.109
                </button>
                <button
                  type="button"
                  onClick={() => setSectionsTags([...sectionsTags, 'POCSO s. 4 / 6'])}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-black underline cursor-pointer"
                >
                  + Add POCSO s.4/6
                </button>
                <button
                  type="button"
                  onClick={() => setSectionsTags([...sectionsTags, 'BNSS s. 173'])}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-black underline cursor-pointer"
                >
                  + Add BNSS s.173
                </button>
              </div>
            </Card>

            {/* 5. Brief Case Summary */}
            <Card className="p-6 sm:p-8 space-y-3">
              <label className="text-xs font-bold text-zinc-900 block">Brief Case Summary &amp; Facts Narrative</label>
              <p className="text-xs text-zinc-500">
                Detailed judicial summary of allegations, police investigation summary, and prosecution contentions.
              </p>
              <textarea
                value={caseSummary}
                onChange={(e) => setCaseSummary(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-zinc-200 p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Provide a succinct summary of the prosecution facts, incident narrative, and court proceedings..."
              />
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: ACCUSED / CRIMINAL DETAILS                                  */}
        {/* =================================================================== */}
        {activeStepKey === 'accused' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Users className="size-5 text-rose-600" />
                  Step 2: Accused &amp; Criminal Demographics
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Record all persons accused, their roles, arrest/bail statuses, and criminal records.
                </p>
              </div>
              <Button type="button" variant="primary" size="sm" onClick={addAccused}>
                <Plus className="size-4 mr-1" />
                Add Accused
              </Button>
            </div>

            <div className="space-y-5">
              {accusedList.map((acc, index) => (
                <Card key={acc.id} className="p-6 relative space-y-4 border-l-4 border-l-rose-500">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs grid place-items-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">
                        {acc.fullName || `Accused #${index + 1}`}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold uppercase">
                        {acc.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAccused(acc.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove this accused"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* Accused Photo / Custody Mugshot Upload */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="size-14 rounded-xl bg-zinc-200 border border-zinc-300 overflow-hidden grid place-items-center shrink-0 shadow-2xs">
                        {acc.photoUploaded ? (
                          <img
                            src={acc.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                            alt="Accused Mugshot"
                            className="size-full object-cover"
                          />
                        ) : (
                          <User className="size-6 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900">Accused Photograph / Custody Mugshot</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              acc.photoUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {acc.photoUploaded ? 'Photo Attached' : 'Photo Required'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {acc.photoUploaded ? (acc.photoFileName || 'custody_mugshot_photo.jpg') : 'Standard police custody photograph or forensic profile'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[11px] py-1 h-auto"
                        onClick={() => {
                          setAccusedList(
                            accusedList.map((a) =>
                              a.id === acc.id
                                ? {
                                    ...a,
                                    photoUploaded: !a.photoUploaded,
                                    photoFileName: !a.photoUploaded ? `mugshot_${(a.alias || a.fullName || 'accused').toLowerCase().replace(/\s+/g, '_')}.jpg` : undefined,
                                    photoUrl: !a.photoUploaded ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' : undefined,
                                  }
                                : a
                            )
                          )
                        }}
                      >
                        <Camera className="size-3 mr-1" />
                        {acc.photoUploaded ? 'Remove Photo' : 'Upload Custody Photo'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Full Name</label>
                      <Input
                        value={acc.fullName}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, fullName: e.target.value } : a))
                          )
                        }
                        placeholder="e.g. Vikramaditya Singh"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Alias / Known As</label>
                      <Input
                        value={acc.alias}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, alias: e.target.value } : a))
                          )
                        }
                        placeholder="e.g. Vicky"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Age</label>
                        <Input
                          value={acc.age}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, age: e.target.value } : a))
                            )
                          }
                          placeholder="36"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Gender</label>
                        <Select
                          value={acc.gender}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, gender: e.target.value } : a))
                            )
                          }
                          className="w-full"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Date of Birth</label>
                      <Input
                        type="date"
                        value={acc.dob}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, dob: e.target.value } : a))
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Contact Phone</label>
                      <Input
                        value={acc.phone}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, phone: e.target.value } : a))
                          )
                        }
                        placeholder="+91-98712-40912"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Role in Crime</label>
                      <Select
                        value={acc.role}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, role: e.target.value as any } : a))
                          )
                        }
                        className="w-full"
                      >
                        <option value="main accused">Main Accused</option>
                        <option value="accomplice">Accomplice</option>
                        <option value="abettor">Abettor</option>
                      </Select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Residential Address</label>
                      <Input
                        value={acc.address}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, address: e.target.value } : a))
                          )
                        }
                        placeholder="Complete permanent / present address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">ID Proof Type</label>
                        <Select
                          value={acc.idProofType}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, idProofType: e.target.value } : a))
                            )
                          }
                          className="w-full"
                        >
                          <option value="Aadhaar Card">Aadhaar Card</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="PAN Card">PAN Card</option>
                          <option value="Passport">Passport</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">ID Number</label>
                        <Input
                          value={acc.idProofNumber}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) => (a.id === acc.id ? { ...a, idProofNumber: e.target.value } : a))
                            )
                          }
                          placeholder="8912-3401-2281"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arrest, Bail, Criminal History & Weapons */}
                  <div className="pt-3 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-zinc-50/80 p-3.5 rounded-2xl">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Arrest Status</label>
                      <Select
                        value={acc.arrestStatus}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, arrestStatus: e.target.value as any } : a))
                          )
                        }
                        className="w-full"
                      >
                        <option value="not arrested">Not Arrested</option>
                        <option value="arrested">Arrested (In Custody)</option>
                        <option value="absconding">Absconding</option>
                        <option value="bail granted">Bail Granted</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Arrest Date</label>
                      <Input
                        type="date"
                        value={acc.arrestDate}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, arrestDate: e.target.value } : a))
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Bail Details</label>
                      <Input
                        value={acc.bailDetails}
                        onChange={(e) =>
                          setAccusedList(
                            accusedList.map((a) => (a.id === acc.id ? { ...a, bailDetails: e.target.value } : a))
                          )
                        }
                        placeholder="Surety details or remand notes"
                      />
                    </div>

                    {/* Previous Criminal History Toggle */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id={`hist-${acc.id}`}
                          checked={acc.hasPreviousCriminalHistory}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, hasPreviousCriminalHistory: e.target.checked } : a
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <label htmlFor={`hist-${acc.id}`} className="text-xs font-bold text-zinc-800 cursor-pointer">
                          Previous Criminal History on Record
                        </label>
                      </div>
                      {acc.hasPreviousCriminalHistory && (
                        <Input
                          value={acc.previousCaseNumbers}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, previousCaseNumbers: e.target.value } : a
                              )
                            )
                          }
                          placeholder="Previous FIRs, case numbers, convictions, or pending trials..."
                          className="text-xs mt-1"
                        />
                      )}
                    </div>

                    {/* Weapon Used Toggle */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id={`wp-${acc.id}`}
                          checked={acc.weaponUsed}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, weaponUsed: e.target.checked } : a
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <label htmlFor={`wp-${acc.id}`} className="text-xs font-bold text-zinc-800 cursor-pointer">
                          Weapon Used / Recovered
                        </label>
                      </div>
                      {acc.weaponUsed && (
                        <Input
                          value={acc.weaponDescription}
                          onChange={(e) =>
                            setAccusedList(
                              accusedList.map((a) =>
                                a.id === acc.id ? { ...a, weaponDescription: e.target.value } : a
                              )
                            )
                          }
                          placeholder="Weapon type, serial, recovery memo..."
                          className="text-xs mt-1"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: VICTIM DETAILS                                              */}
        {/* =================================================================== */}
        {activeStepKey === 'victims' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <Shield className="size-5 text-emerald-600" />
                    Step 3: Victim Information &amp; Protection
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    Total Victims: {victimsList.length}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Identity protection toggle is automatically mandated for POCSO and vulnerable cases.
                </p>
              </div>

              <Button type="button" variant="primary" size="sm" onClick={addVictim}>
                <Plus className="size-4 mr-1" />
                Add Victim
              </Button>
            </div>

            <div className="space-y-5">
              {victimsList.map((vic, index) => (
                <Card key={vic.id} className="p-6 relative space-y-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs grid place-items-center">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">
                        {vic.isConfidential ? 'PROTECTED IDENTITY [SEALED]' : vic.fullName || `Victim #${index + 1}`}
                      </span>
                      {vic.isConfidential && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                          <EyeOff className="size-3" /> Identity Masked
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVictim(vic.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove this victim"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        Victim Name {caseType === 'POCSO' && '(Mandatory Masked)'}
                      </label>
                      <Input
                        value={vic.fullName}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) => (v.id === vic.id ? { ...v, fullName: e.target.value } : v))
                          )
                        }
                        placeholder="Full Legal Name"
                        required
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vic.isConfidential || caseType === 'POCSO'}
                          disabled={caseType === 'POCSO'}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, isConfidential: e.target.checked } : v
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <span>Confidential / Protect Identity</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Age</label>
                        <Input
                          value={vic.age}
                          onChange={(e) => {
                            const val = e.target.value
                            const isMinor = parseInt(val, 10) < 18
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, age: val, isMinor } : v
                              )
                            )
                          }}
                          placeholder="28"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Gender</label>
                        <Select
                          value={vic.gender}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) => (v.id === vic.id ? { ...v, gender: e.target.value } : v))
                            )
                          }
                          className="w-full"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Contact Phone</label>
                      <Input
                        value={vic.contact}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) => (v.id === vic.id ? { ...v, contact: e.target.value } : v))
                          )
                        }
                        placeholder="+91-98112-99881"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Address</label>
                      <Input
                        value={vic.address}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) => (v.id === vic.id ? { ...v, address: e.target.value } : v))
                          )
                        }
                        placeholder="Permanent or protected shelter address"
                      />
                    </div>

                    {vic.isMinor && (
                      <div className="sm:col-span-3 bg-amber-50 border border-amber-200 p-3 rounded-2xl">
                        <label className="text-xs font-bold text-amber-900 block mb-1">
                          Minor Guardian Details (Mandatory for Minors)
                        </label>
                        <Input
                          value={vic.guardianDetails}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, guardianDetails: e.target.value } : v
                              )
                            )
                          }
                          placeholder="Mother/Father/Legal Guardian Name and Contact"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        Relationship with Accused
                      </label>
                      <Input
                        value={vic.relationshipWithAccused}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) =>
                              v.id === vic.id ? { ...v, relationshipWithAccused: e.target.value } : v
                            )
                          )
                        }
                        placeholder="e.g. Spouse, Business Partner, Neighbor, Stranger"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">
                        Injury / Financial / Emotional Loss Details
                      </label>
                      <textarea
                        value={vic.injuryOrLossDetails}
                        onChange={(e) =>
                          setVictimsList(
                            victimsList.map((v) =>
                              v.id === vic.id ? { ...v, injuryOrLossDetails: e.target.value } : v
                            )
                          )
                        }
                        rows={2}
                        className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                        placeholder="Describe injuries, medical treatment received, or property damage..."
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-3 pt-2 border-t border-black/5">
                      {/* Victim Statement Upload */}
                      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <FileText className="size-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-zinc-900 block">
                              Victim Statement (Sec. 164 BNSS Recorded Deposition)
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {vic.victimStatementUploaded
                                ? (vic.victimStatementFileName || 'victim_statement_164_magistrate.pdf')
                                : 'No statement uploaded yet'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              vic.victimStatementUploaded
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-zinc-200 text-zinc-600'
                            }`}
                          >
                            {vic.victimStatementUploaded ? 'Uploaded & Sealed' : 'Pending Upload'}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-[11px] py-1 h-auto"
                            onClick={() => {
                              setVictimsList(
                                victimsList.map((v) =>
                                  v.id === vic.id
                                    ? {
                                        ...v,
                                        victimStatementUploaded: !v.victimStatementUploaded,
                                        victimStatementFileName: !v.victimStatementUploaded
                                          ? `victim_stmt_${(v.fullName || 'vic').toLowerCase().replace(/\s+/g, '_')}_164.pdf`
                                          : undefined,
                                        victimStatementDate: !v.victimStatementUploaded ? new Date().toISOString().split('T')[0] : undefined,
                                      }
                                    : v
                                )
                              )
                            }}
                          >
                            <Upload className="size-3 mr-1" />
                            {vic.victimStatementUploaded ? 'Change File' : 'Upload Statement'}
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block">Medical Examination / MLC Injury Certificate</span>
                          <span className="text-[11px] text-zinc-500">MLC report attached &amp; admitted in evidentiary docket</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={vic.medicalReportUploaded}
                          onChange={(e) =>
                            setVictimsList(
                              victimsList.map((v) =>
                                v.id === vic.id ? { ...v, medicalReportUploaded: e.target.checked } : v
                              )
                            )
                          }
                          className="size-4 rounded text-black focus:ring-black cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: WITNESSES AND PEOPLE INVOLVED                               */}
        {/* =================================================================== */}
        {activeStepKey === 'witnesses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  Step 4: Witnesses &amp; Key Depositions
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Record eyewitnesses, forensic specialists, panchnama signatories, and complainant testimonies.
                </p>
              </div>

              <Button type="button" variant="primary" size="sm" onClick={addWitness}>
                <Plus className="size-4 mr-1" />
                Add Witness
              </Button>
            </div>

            <div className="space-y-4">
              {witnessesList.map((wit, index) => (
                <Card key={wit.id} className="p-6 relative space-y-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs grid place-items-center">
                        PW-{index + 1}
                      </span>
                      <span className="font-bold text-sm text-zinc-900">
                        {wit.fullName || `Witness #${index + 1}`}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold uppercase">
                        {wit.type}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeWitness(wit.id)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Witness Full Name</label>
                      <Input
                        value={wit.fullName}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, fullName: e.target.value } : w))
                          )
                        }
                        placeholder="e.g. Rameshwar Lal"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Witness Type</label>
                      <Select
                        value={wit.type}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, type: e.target.value as any } : w))
                          )
                        }
                        className="w-full"
                      >
                        <option value="eyewitness">Eyewitness</option>
                        <option value="expert">Expert / Forensic Specialist</option>
                        <option value="complainant">Complainant / Informant</option>
                        <option value="police">Police / Panch Witness</option>
                        <option value="other">Other Character / Corroborative</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Contact Phone</label>
                      <Input
                        value={wit.contact}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, contact: e.target.value } : w))
                          )
                        }
                        placeholder="+91-98765-12345"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Statement Summary</label>
                      <textarea
                        value={wit.statementSummary}
                        onChange={(e) =>
                          setWitnessesList(
                            witnessesList.map((w) => (w.id === wit.id ? { ...w, statementSummary: e.target.value } : w))
                          )
                        }
                        rows={2}
                        className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                        placeholder="Summary of statement recorded under Section 161 BNSS or deposition in chief..."
                      />
                    </div>

                    <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="size-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-zinc-800 block">
                            Witness Statement Document (Signed Copy / Sec. 161 / 164 BNSS)
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {wit.documentUploaded
                              ? (wit.documentName || `statement_${(wit.fullName || 'witness').toLowerCase().replace(/\s+/g, '_')}.pdf`)
                              : 'No statement document attached yet'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            wit.documentUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {wit.documentUploaded ? 'Document Attached' : 'Pending Upload'}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-[11px] py-1 h-auto"
                          onClick={() => {
                            setWitnessesList(
                              witnessesList.map((w) =>
                                w.id === wit.id
                                  ? {
                                      ...w,
                                      documentUploaded: !w.documentUploaded,
                                      documentName: !w.documentUploaded
                                        ? `statement_${(w.fullName || 'witness').toLowerCase().replace(/\s+/g, '_')}_signed.pdf`
                                        : '',
                                    }
                                  : w
                              )
                            )
                          }}
                        >
                          <Upload className="size-3 mr-1" />
                          {wit.documentUploaded ? 'Change Document' : 'Upload Statement'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: EVIDENCE TRACKER                                            */}
        {/* =================================================================== */}
        {activeStepKey === 'evidence' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <FolderOpen className="size-5 text-amber-600" />
                  Step 5: Evidence Tracker &amp; Chain of Custody
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Track circumstantial, forensic, chemical, physical, and documentary exhibits with verified custody logs.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => addEvidence(activeEvidenceTab)}
              >
                <Plus className="size-4 mr-1" />
                Add {activeEvidenceTab.toUpperCase()} Evidence
              </Button>
            </div>

            {/* Evidence Count Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[
                { type: 'circumstantial', label: 'Circumstantial', count: evidenceItems.filter((e) => e.type === 'circumstantial').length },
                { type: 'forensic', label: 'Forensic', count: evidenceItems.filter((e) => e.type === 'forensic').length },
                { type: 'chemical', label: 'Chemical', count: evidenceItems.filter((e) => e.type === 'chemical').length },
                { type: 'physical', label: 'Physical', count: evidenceItems.filter((e) => e.type === 'physical').length },
                { type: 'documentary', label: 'Documentary', count: evidenceItems.filter((e) => e.type === 'documentary').length },
                { type: 'witness', label: 'Witness', count: evidenceItems.filter((e) => e.type === 'witness').length },
              ].map((item) => (
                <div
                  key={item.type}
                  onClick={() => setActiveEvidenceTab(item.type as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeEvidenceTab === item.type
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xl font-black block">{item.count}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider block mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Active Evidence Type Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['circumstantial', 'forensic', 'chemical', 'physical', 'documentary', 'witness'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveEvidenceTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                      activeEvidenceTab === tab
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {tab} ({evidenceItems.filter((e) => e.type === tab).length})
                  </button>
                )
              )}
            </div>

            {/* Filtered Evidence Items */}
            <div className="space-y-4">
              {evidenceItems
                .filter((item) => item.type === activeEvidenceTab)
                .map((ev) => (
                  <Card key={ev.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-900">
                          {ev.evidenceId}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 font-bold uppercase">
                          {ev.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvidenceItems(evidenceItems.filter((e) => e.id !== ev.id))}
                        className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Description</label>
                        <Input
                          value={ev.description}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, description: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Evidence item description"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Status</label>
                        <Select
                          value={ev.status}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, status: e.target.value as any } : item
                              )
                            )
                          }
                          className="w-full"
                        >
                          <option value="Collected">Collected</option>
                          <option value="Sent to lab">Sent to lab</option>
                          <option value="Report received">Report received</option>
                          <option value="Produced in court">Produced in court</option>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Recovery Source</label>
                        <Input
                          value={ev.source}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, source: e.target.value } : item
                              )
                            )
                          }
                          placeholder="Place/Person from where collected"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Collected By</label>
                        <Input
                          value={ev.collectedBy}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, collectedBy: e.target.value } : item
                              )
                            )
                          }
                          placeholder="IO or Crime Team member"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Date Collected</label>
                        <Input
                          type="date"
                          value={ev.dateCollected}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, dateCollected: e.target.value } : item
                              )
                            )
                          }
                        />
                      </div>

                      {(ev.type === 'forensic' || ev.type === 'chemical') && (
                        <>
                          <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1">
                              {ev.type === 'chemical' ? 'Chemical Laboratory' : 'Forensic Lab Name'}
                            </label>
                            <Input
                              value={ev.labName || ''}
                              onChange={(e) =>
                                setEvidenceItems(
                                  evidenceItems.map((item) =>
                                    item.id === ev.id ? { ...item, labName: e.target.value } : item
                                  )
                                )
                              }
                              placeholder={ev.type === 'chemical' ? 'e.g. CFSL Chemical Wing' : 'e.g. FSL Rohini'}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-zinc-700 block mb-1">Lab Report Number</label>
                            <Input
                              value={ev.reportNumber || ''}
                              onChange={(e) =>
                                setEvidenceItems(
                                  evidenceItems.map((item) =>
                                    item.id === ev.id ? { ...item, reportNumber: e.target.value } : item
                                  )
                                )
                              }
                              placeholder={ev.type === 'chemical' ? 'CCEL-2026/TOX-4819' : 'FSL-2026/BAL-8902'}
                            />
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-3">
                        <label className="text-xs font-bold text-zinc-700 block mb-1">
                          Relevance &amp; Link to the Crime
                        </label>
                        <Input
                          value={ev.linksToCrime}
                          onChange={(e) =>
                            setEvidenceItems(
                              evidenceItems.map((item) =>
                                item.id === ev.id ? { ...item, linksToCrime: e.target.value } : item
                              )
                            )
                          }
                          placeholder="How does this item connect to the accused and offence?"
                        />
                      </div>

                      {/* Evidence File Upload */}
                      <div className="sm:col-span-3 pt-2 border-t border-black/5">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                            <Upload className="size-3 text-amber-600" />
                            Exhibits &amp; Uploaded Files (Photos, Reports, Certificates)
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-[11px] py-1 h-auto"
                            onClick={() => {
                              const newFileName = `exhibit_${ev.evidenceId.toLowerCase()}_${Date.now().toString().slice(-4)}.pdf`
                              setEvidenceItems(
                                evidenceItems.map((item) =>
                                  item.id === ev.id
                                    ? { ...item, uploadedFiles: [...item.uploadedFiles, newFileName] }
                                    : item
                                )
                              )
                            }}
                          >
                            <Upload className="size-3 mr-1" /> Attach File
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ev.uploadedFiles.length === 0 ? (
                            <span className="text-[11px] text-zinc-400 italic">No files attached yet. Click "Attach File" to upload scans or photos.</span>
                          ) : (
                            ev.uploadedFiles.map((file, fIdx) => (
                              <span
                                key={fIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                              >
                                <FileCheck className="size-3 text-amber-600" />
                                <span>{file}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEvidenceItems(
                                      evidenceItems.map((item) =>
                                        item.id === ev.id
                                          ? { ...item, uploadedFiles: item.uploadedFiles.filter((_, idx) => idx !== fIdx) }
                                          : item
                                      )
                                    )
                                  }}
                                  className="text-amber-500 hover:text-rose-600 ml-1 cursor-pointer"
                                >
                                  &times;
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chain of Custody Table */}
                    <div className="pt-3 border-t border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800">
                          Chain of Custody Handover Log
                        </span>
                        <button
                          type="button"
                          onClick={() => addChainOfCustodyRow(ev.id)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Add Handover
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-zinc-100 font-bold text-zinc-700">
                            <tr>
                              <th className="p-2">Handed By</th>
                              <th className="p-2">Received By</th>
                              <th className="p-2">Date / Time</th>
                              <th className="p-2">Purpose</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 bg-white">
                            {ev.chainOfCustody.map((c, i) => (
                              <tr key={i}>
                                <td className="p-2 font-medium">{c.handedBy || '—'}</td>
                                <td className="p-2 font-medium">{c.receivedBy || '—'}</td>
                                <td className="p-2 text-zinc-500">{c.dateTime || '—'}</td>
                                <td className="p-2 text-zinc-600">{c.purpose || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 6: INVESTIGATION DOCUMENTS (POLICE / IO)                       */}
        {/* =================================================================== */}
        {activeStepKey === 'investigation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FileCheck className="size-5 text-purple-600" />
                Step 6: Police Investigation Records &amp; IO Log
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Checklist of police documents and timeline logs feeding the "no action taken" delay alerts.
              </p>
            </div>

            {/* Investigating Officer Details Card */}
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Lead Investigating Officer (IO) Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">IO Name</label>
                  <Input value={ioName} onChange={(e) => setIoName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Rank / Designation</label>
                  <Input value={ioRank} onChange={(e) => setIoRank(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Official Contact Phone</label>
                  <Input value={ioPhone} onChange={(e) => setIoPhone(e.target.value)} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">Official Email</label>
                  <Input value={ioEmail} onChange={(e) => setIoEmail(e.target.value)} />
                </div>
              </div>
            </Card>

            {/* Police Documents Checklist */}
            <Card className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Mandatory Police Documentation Checklist
              </h3>
              <div className="space-y-2.5">
                {investigationDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 text-zinc-500" />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">{doc.name}</span>
                        <span className="text-[11px] text-zinc-400">{doc.fileName || 'No file attached'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          doc.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'Uploaded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[11px] py-1 h-auto"
                        onClick={() => {
                          setInvestigationDocs(
                            investigationDocs.map((d) =>
                              d.id === doc.id ? { ...d, status: d.status === 'Verified' ? 'Uploaded' : 'Verified' } : d
                            )
                          )
                        }}
                      >
                        Toggle Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Investigation Progress Log */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Investigation Progress Log
                  </h3>
                  <p className="text-[11px] text-zinc-400">Chronological action diary</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newLog: ProgressLogEntry = {
                      id: `log-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      actionTaken: 'Supplementary statement and ballistic report examined.',
                      nextActionDate: '2026-10-30',
                    }
                    setProgressLogs([...progressLogs, newLog])
                  }}
                >
                  <Plus className="size-3.5 mr-1" /> Add Entry
                </Button>
              </div>

              <div className="space-y-2">
                {progressLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-500 font-medium">
                      <span>Date: <strong className="text-zinc-900">{log.date}</strong></span>
                      <span>Next Action Due: <strong className="text-amber-700">{log.nextActionDate}</strong></span>
                    </div>
                    <p className="text-zinc-800 font-semibold">{log.actionTaken}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 7: DOCUMENTS REQUIRED FOR JUDGEMENT                            */}
        {/* =================================================================== */}
        {/* =================================================================== */}
        {/* STEP 7: CASE READINESS CHECKLIST & JUDGMENT DRAFT STUDIO            */}
        {/* =================================================================== */}
        {activeStepKey === 'judgement-documents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Gavel className="size-5 text-indigo-600" />
                  Step 7: Final Case Readiness Checklist &amp; Judgment Draft Studio
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  8-Pillar Judicial Audit &bull; Tailored for <strong className="text-zinc-900 font-semibold">{caseType} Proceedings</strong> under applicable statutory law.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={outstandingCount > 0 && !isJudgeReviewedConfirmed}
                  onClick={() => setShowJudgmentDraftStudio(true)}
                  className={`font-bold transition-all shadow-sm ${
                    outstandingCount === 0 || isJudgeReviewedConfirmed
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="size-3.5 mr-1.5" />
                  Prepare Judgment Draft
                </Button>
              </div>
            </div>

            {/* Statutory Case-Type Adaptation Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Scale className="size-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-2 flex-wrap">
                    <span>Applicable Procedural Framework:</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 font-bold text-[10px]">
                      {caseType === 'Criminal' && 'BNSS 2023 / BNS 2023 / Bharatiya Sakshya Adhiniyam'}
                      {caseType === 'POCSO' && 'POCSO Act 2012 / BNSS 2023 (Child-Friendly In-Camera)'}
                      {caseType === 'Civil' && 'Code of Civil Procedure 1908 / Commercial Courts Act'}
                      {caseType === 'Divorce/Family' && 'Family Courts Act 1984 / Special Marriage Act / HMA'}
                      {caseType === 'Other' && 'General Statutory Civil & Administrative Precedents'}
                    </span>
                  </div>
                  <p className="text-indigo-900/80 text-[11px] leading-relaxed">
                    This checklist automatically adapts to {caseType} requirements. <strong>Judicial Discretion Principle:</strong> Missing items do not automatically block judgment when the law permits proceeding without them (e.g. ex-parte hearings, dispensing with formal proof u/s 58 BSA, or agreed admissions). Final determination rests with the presiding judge.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2 text-[11px] font-bold text-indigo-900">
                <span className="px-2.5 py-1 rounded-xl bg-white/80 border border-indigo-200 shadow-2xs">
                  {applicableReadinessItems.length} Requirements Active
                </span>
              </div>
            </div>

            {/* Judgement Readiness Progress & 5 Status Cards */}
            <Card className="p-5 space-y-4 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold tracking-wider uppercase text-zinc-400 text-[10px] block">
                    Bench Readiness &amp; Document Accounting
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-white">{readinessPercent}%</span>
                    <span className="text-xs text-zinc-300">
                      ({verifiedCount} of {totalAssessable} assessable requirements verified)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {outstandingCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <AlertTriangle className="size-3.5" />
                      {outstandingCount} Items Need Attention
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="size-3.5" />
                      Ready for Verdict
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-700/60">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              {/* 5 Status Badges breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setReadinessStatusFilter(readinessStatusFilter === 'Verified' ? 'All' : 'Verified')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    readinessStatusFilter === 'Verified'
                      ? 'bg-emerald-950/80 border-emerald-400 ring-1 ring-emerald-400'
                      : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Verified</span>
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">{verifiedCount}</div>
                  <div className="text-[10px] text-zinc-400 truncate">Checked &amp; accounted</div>
                </button>

                <button
                  type="button"
                  onClick={() => setReadinessStatusFilter(readinessStatusFilter === 'Outstanding' ? 'All' : 'Outstanding')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    readinessStatusFilter === 'Outstanding'
                      ? 'bg-amber-950/80 border-amber-400 ring-1 ring-amber-400'
                      : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending</span>
                    <Clock className="size-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">{pendingCount}</div>
                  <div className="text-[10px] text-zinc-400 truncate">Action still needed</div>
                </button>

                <button
                  type="button"
                  onClick={() => setReadinessStatusFilter(readinessStatusFilter === 'Outstanding' ? 'All' : 'Outstanding')}
                  className="p-2.5 rounded-xl border bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Disputed</span>
                    <ShieldAlert className="size-3.5 text-rose-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">{disputedCount}</div>
                  <div className="text-[10px] text-zinc-400 truncate">Conflicting / objection</div>
                </button>

                <button
                  type="button"
                  onClick={() => setReadinessStatusFilter(readinessStatusFilter === 'Requires Review' ? 'All' : 'Requires Review')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    readinessStatusFilter === 'Requires Review'
                      ? 'bg-purple-950/80 border-purple-400 ring-1 ring-purple-400'
                      : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Requires Review</span>
                    <Eye className="size-3.5 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">{requiresReviewCount}</div>
                  <div className="text-[10px] text-zinc-400 truncate">Human judicial review</div>
                </button>

                <div className="p-2.5 rounded-xl border bg-zinc-800/50 border-zinc-700/60 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Not Applicable</span>
                    <MinusCircle className="size-3.5 text-zinc-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5">{notApplicableCount}</div>
                  <div className="text-[10px] text-zinc-400 truncate">Excluded by law</div>
                </div>
              </div>
            </Card>

            {/* eCourts National CIS Real-Time Registry Badge */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  CIS
                </div>
                <div>
                  <div className="font-bold text-zinc-900 flex items-center gap-2">
                    eCourts Registry Cross-Verification: {ecourtCaseData?.cnr || 'DLST020314162024'}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {ecourtCaseSource === 'LIVE_API' ? '● Live API Connected' : '● Registry Verified'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Matches official docket ({ecourtCaseData?.caseNumber || 'SC/314/2024'}) &middot; Counsels: {ecourtCaseData?.petitionerAdvocate || 'APP'} / {ecourtCaseData?.respondentAdvocate || 'Adv. Prateek Sharma (D/2841/2012)'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!ecourtCaseData) handleFetchEcourtDocket('DLST020314162024')
                  setIsEcourtDocketModalOpen(true)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <Globe className="size-3.5" />
                Inspect Live eCourts Docket
              </button>
            </div>

            {/* 8-Pillars Category Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-zinc-200">
              {[
                { key: 'all', label: 'All 8 Pillars', count: applicableReadinessItems.length },
                { key: 'case-details', label: '1. Case Details', count: applicableReadinessItems.filter((i) => i.categoryKey === 'case-details').length },
                { key: 'case-documents', label: '2. All Case Documents', count: applicableReadinessItems.filter((i) => i.categoryKey === 'case-documents').length },
                { key: 'evidence-exhibits', label: '3. Evidence & Exhibits', count: applicableReadinessItems.filter((i) => i.categoryKey === 'evidence-exhibits').length },
                { key: 'witness-records', label: '4. Witness Records', count: applicableReadinessItems.filter((i) => i.categoryKey === 'witness-records').length },
                { key: 'legal-review', label: '5. Legal Review', count: applicableReadinessItems.filter((i) => i.categoryKey === 'legal-review').length },
                { key: 'final-hearing', label: '6. Final Hearing', count: applicableReadinessItems.filter((i) => i.categoryKey === 'final-hearing').length },
                { key: 'judgment-document', label: '7. Judgment Document', count: applicableReadinessItems.filter((i) => i.categoryKey === 'judgment-document').length },
                { key: 'finalisation-checks', label: '8. Pre-Finalisation', count: applicableReadinessItems.filter((i) => i.categoryKey === 'finalisation-checks').length },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setReadinessCategoryFilter(pill.key)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap text-xs transition-colors cursor-pointer shrink-0 ${
                    readinessCategoryFilter === pill.key
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>

            {/* Checklist Items Container */}
            <div className="space-y-3">
              {applicableReadinessItems
                .filter((item) => {
                  if (readinessCategoryFilter !== 'all' && item.categoryKey !== readinessCategoryFilter) {
                    return false
                  }
                  if (readinessStatusFilter === 'Outstanding') {
                    return item.status === 'Pending' || item.status === 'Disputed' || item.status === 'Requires Review'
                  }
                  if (readinessStatusFilter === 'Verified') {
                    return item.status === 'Verified'
                  }
                  if (readinessStatusFilter === 'Requires Review') {
                    return item.status === 'Requires Review'
                  }
                  return true
                })
                .map((item) => {
                  const statusColors: Record<ReadinessStatus, { bg: string; text: string; border: string }> = {
                    Verified: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
                    Pending: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
                    Disputed: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
                    'Not Applicable': { bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200' },
                    'Requires Review': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
                  }
                  const currentStyle = statusColors[item.status]

                  return (
                    <Card
                      key={item.id}
                      className={`p-4 transition-all duration-150 border-l-4 ${
                        item.status === 'Verified'
                          ? 'border-l-emerald-500 bg-white'
                          : item.status === 'Pending'
                          ? 'border-l-amber-500 bg-amber-50/20'
                          : item.status === 'Disputed'
                          ? 'border-l-rose-500 bg-rose-50/20'
                          : item.status === 'Requires Review'
                          ? 'border-l-purple-500 bg-purple-50/20'
                          : 'border-l-zinc-300 bg-zinc-50/40 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              {item.categoryTitle}
                            </span>
                            {item.isCoreRequirement && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                                Core Statutory
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-zinc-900">{item.title}</h3>
                          <p className="text-[11px] text-zinc-500 leading-snug">{item.description}</p>

                          {/* Notes if present or inline editor */}
                          {item.notes && editingItemNoteId !== item.id && (
                            <div className="mt-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-700 flex items-start justify-between gap-2">
                              <span><strong>Bench Note:</strong> {item.notes}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItemNoteId(item.id)
                                  setTempItemNote(item.notes || '')
                                }}
                                className="text-[10px] text-indigo-600 font-bold hover:underline shrink-0"
                              >
                                Edit Note
                              </button>
                            </div>
                          )}

                          {editingItemNoteId === item.id && (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="text"
                                value={tempItemNote}
                                onChange={(e) => setTempItemNote(e.target.value)}
                                placeholder="Add judicial findings or objection notes..."
                                className="flex-1 rounded-xl border border-zinc-300 px-2.5 py-1 text-xs focus:ring-1 focus:ring-black"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 py-0"
                                onClick={() => {
                                  setReadinessItems((prev) =>
                                    prev.map((i) => (i.id === item.id ? { ...i, notes: tempItemNote } : i))
                                  )
                                  setEditingItemNoteId(null)
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 py-0"
                                onClick={() => setEditingItemNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* 5 One-Click Status Selector Buttons */}
                        <div className="flex items-center gap-1 shrink-0 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                          {(['Verified', 'Pending', 'Disputed', 'Requires Review', 'Not Applicable'] as ReadinessStatus[]).map(
                            (st) => {
                              const isSelected = item.status === st
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => updateReadinessStatus(item.id, st)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? st === 'Verified'
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : st === 'Pending'
                                        ? 'bg-amber-600 text-white shadow-2xs'
                                        : st === 'Disputed'
                                        ? 'bg-rose-600 text-white shadow-2xs'
                                        : st === 'Requires Review'
                                        ? 'bg-purple-600 text-white shadow-2xs'
                                        : 'bg-zinc-700 text-white shadow-2xs'
                                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                  }`}
                                >
                                  {st === 'Verified' && '✓ Verified'}
                                  {st === 'Pending' && '⏳ Pending'}
                                  {st === 'Disputed' && '⚠ Disputed'}
                                  {st === 'Requires Review' && '👁 Review'}
                                  {st === 'Not Applicable' && '⊘ N/A'}
                                </button>
                              )
                            }
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
            </div>

            {/* Outstanding Items Assessment & Judicial Review Authorization */}
            <Card className="p-5 space-y-4 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-indigo-600" />
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Outstanding Items Assessment &amp; Judicial Discretion Protocol
                  </h3>
                </div>
                <span className="text-xs font-bold text-zinc-500">
                  {outstandingCount} outstanding items detected
                </span>
              </div>

              {outstandingCount > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-600">
                    The following requirements are currently flagged as <strong>Pending</strong>, <strong>Disputed</strong>, or <strong>Requires Review</strong>. Review each item prior to judgment preparation:
                  </p>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {outstandingItemsList.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white border border-zinc-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">{item.categoryTitle}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                item.status === 'Disputed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.status === 'Requires Review'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <span className="font-semibold text-zinc-900 block mt-0.5">{item.title}</span>
                          {item.notes && <span className="text-[10px] text-zinc-500 italic block">{item.notes}</span>}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-6 py-0 px-2 shrink-0"
                          onClick={() => updateReadinessStatus(item.id, 'Verified')}
                        >
                          Mark Verified
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>All applicable requirements have been verified and accounted for.</span>
                </div>
              )}

              {/* Statutory Exemption / Discretion Checkbox */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isJudgeReviewedConfirmed}
                    onChange={(e) => setIsJudgeReviewedConfirmed(e.target.checked)}
                    className="size-4.5 rounded text-indigo-600 focus:ring-indigo-600 cursor-pointer mt-0.5 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-900 block">
                      Authorised Human Review &amp; Statutory Exemption Confirmation
                    </span>
                    <span className="text-[11px] text-zinc-600 block leading-relaxed">
                      I have reviewed all outstanding, disputed, or review-flagged items. Missing items do not legally preclude judgment under applicable law (e.g., ex-parte procedure, admissions on record, or dispensed evidence), and I authorize generating the Judgment Draft.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Button: Prepare Judgment Draft */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-zinc-500">
                  {outstandingCount > 0 && !isJudgeReviewedConfirmed ? (
                    <span className="text-amber-700 font-medium flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      Check the confirmation box above to proceed with outstanding items.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      Authorized. Ready to formulate and compile official judgment document.
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={outstandingCount > 0 && !isJudgeReviewedConfirmed}
                  onClick={() => setShowJudgmentDraftStudio(true)}
                  className={`font-extrabold px-6 shadow-md transition-all ${
                    outstandingCount === 0 || isJudgeReviewedConfirmed
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Gavel className="size-4 mr-2" />
                  Prepare Judgment Draft
                </Button>
              </div>
            </Card>

            {/* Final Judgement & Operative Order Parameters */}
            <Card className="p-5 space-y-4 border-l-4 border-l-zinc-900">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Final Judgement &amp; Operative Order Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Final Finding / Verdict</label>
                  <Select
                    value={finalVerdict}
                    onChange={(e) => setFinalVerdict(e.target.value as any)}
                    className="w-full font-bold"
                  >
                    <option value="Convicted">Convicted</option>
                    <option value="Acquitted">Acquitted</option>
                    <option value="Discharged">Discharged</option>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Pronouncement / Judgement Date</label>
                  <Input
                    type="date"
                    value={judgementDate}
                    onChange={(e) => setJudgementDate(e.target.value)}
                  />
                </div>

                {/* Sections Applied in Judgement */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">
                    Sections of Law Applied in Judgement / Conviction (Tags)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                    {judgementSections.map((sec) => (
                      <span
                        key={sec}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-zinc-900 border border-zinc-300 shadow-2xs"
                      >
                        <Gavel className="size-3 text-indigo-600" />
                        <span>{sec}</span>
                        <button
                          type="button"
                          onClick={() => setJudgementSections(judgementSections.filter((s) => s !== sec))}
                          className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={newJudgementSectionInput}
                      onChange={(e) => setNewJudgementSectionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (newJudgementSectionInput.trim() && !judgementSections.includes(newJudgementSectionInput.trim())) {
                            setJudgementSections([...judgementSections, newJudgementSectionInput.trim()])
                            setNewJudgementSectionInput('')
                          }
                        }
                      }}
                      placeholder="e.g. BNS s. 103 (1), Arms Act s. 25"
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newJudgementSectionInput.trim() && !judgementSections.includes(newJudgementSectionInput.trim())) {
                          setJudgementSections([...judgementSections, newJudgementSectionInput.trim()])
                          setNewJudgementSectionInput('')
                        }
                      }}
                    >
                      <Plus className="size-3.5 mr-1" /> Add Section
                    </Button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Punishment / Sentence / Relief Decreed
                  </label>
                  <Input
                    value={punishmentSentence}
                    onChange={(e) => setPunishmentSentence(e.target.value)}
                    placeholder="e.g. Rigorous Imprisonment for 10 Years and Fine of ₹50,000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Operative Reasons &amp; Findings (Ratio Decidendi)
                  </label>
                  <textarea
                    value={judgementReasons}
                    onChange={(e) => setJudgementReasons(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>

                {/* Precedent References */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Verified Precedents &amp; Legal Authorities (SCC / AIR)
                  </label>
                  <textarea
                    value={precedentLinks}
                    onChange={(e) => setPrecedentLinks(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Add citations, SCC references, or High Court precedents..."
                  />
                </div>

                {/* Judge's Notes */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Judge's Notes &amp; Deliberations (Confidential Judicial Record)
                  </label>
                  <textarea
                    value={judgeNotes}
                    onChange={(e) => setJudgeNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                    placeholder="Record judicial findings, credibility assessments, and reasoning..."
                  />
                </div>

                {/* PDF Upload for Signed Final Judgement Decree */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="size-5 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">
                        Final Judgement &amp; Decree (Signed PDF Document)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {judgementPdfUploaded
                          ? (judgementPdfFileName || 'final_decree_signed_bench04.pdf')
                          : 'Upload the presiding judge sealed and signed decree PDF'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        judgementPdfUploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {judgementPdfUploaded ? 'Digitally Sealed' : 'Pending Upload'}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-[11px] py-1 h-auto"
                      onClick={() => {
                        setJudgementPdfUploaded(!judgementPdfUploaded)
                        if (!judgementPdfUploaded && !judgementPdfFileName) {
                          setJudgementPdfFileName(`final_decree_${caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}_signed.pdf`)
                        }
                      }}
                    >
                      <Upload className="size-3 mr-1" />
                      {judgementPdfUploaded ? 'Change PDF' : 'Upload Decree PDF'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 8: REVIEW & SUBMIT                                             */}
        {/* =================================================================== */}
        {activeStepKey === 'review' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Step 8: Review &amp; Submit Docket
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Comprehensive read-only summary across all 7 preceding pipeline stages. Verify documentation completeness before official registry submission.
              </p>
            </div>

            {/* Warnings Box for Missing Documents or Incomplete Checklist Items */}
            {(() => {
              const pendingPoliceDocs = investigationDocs.filter((d) => d.status === 'Pending')
              const unattachedVictims = victimsList.filter((v) => !v.victimStatementUploaded)
              const unreviewedJudgeDocs = judgementDocs.filter((d) => !d.isReviewed)
              const hasWarnings = pendingPoliceDocs.length > 0 || unattachedVictims.length > 0 || unreviewedJudgeDocs.length > 0 || !judgementPdfUploaded

              if (!hasWarnings) {
                return (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-950 text-xs">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <strong className="block font-bold">All Evidentiary &amp; Police Records Ready:</strong>
                      <span>All 8 mandatory police checklist documents verified, victim statements attached, and judicial exhibits marked. Ready for docket ingestion.</span>
                    </div>
                  </div>
                )
              }

              return (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-amber-950 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    <span>Documentation Warnings &amp; Missing Items:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-700">
                    {!firDocUploaded && (
                      <li>
                        <strong>FIR Document:</strong> Certified copy of the First Information Report (FIR) has not been uploaded.
                      </li>
                    )}
                    {pendingPoliceDocs.length > 0 && (
                      <li>
                        <strong>Police Checklist:</strong> {pendingPoliceDocs.length} documents still pending upload ({pendingPoliceDocs.map((d) => d.name).join(', ')}).
                      </li>
                    )}
                    {unattachedVictims.length > 0 && (
                      <li>
                        <strong>Victim Statements:</strong> {unattachedVictims.length} victims missing Sec. 164 deposition uploads.
                      </li>
                    )}
                    {unreviewedJudgeDocs.length > 0 && (
                      <li>
                        <strong>Judgement Readiness:</strong> Currently at {readinessPercent}% ({unreviewedJudgeDocs.length} checklist items unreviewed).
                      </li>
                    )}
                    {!judgementPdfUploaded && (
                      <li>
                        <strong>Final Judgement:</strong> Signed Decree PDF document has not yet been uploaded.
                      </li>
                    )}
                  </ul>
                </div>
              )
            })()}

            {/* Read-Only Summary Sections with Direct Edit Links */}
            <div className="space-y-4">
              {/* Summary Section 1 */}
              <Card className="p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="size-4 text-indigo-600" /> 1. Case Details &amp; FIR Dossier
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('details')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">CNR Docket:</span>
                    <strong className="font-mono">{caseNumber}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Case Type:</span>
                    <strong>{caseType}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Court:</span>
                    <strong>{courtName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Case Status:</span>
                    <strong className="text-indigo-700">{caseStatus}</strong>
                  </div>
                </div>

                {/* FIR Specific Summary Details */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-zinc-400 text-[10px] block">FIR Number:</span>
                      <strong className="font-mono text-zinc-900">{firNumber}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block">FIR Date &amp; Time:</span>
                      <span>{firDate} at {firTime}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block">Station / Precinct:</span>
                      <span>{policeStation}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block">General Diary (GD) Ref:</span>
                      <span className="font-mono">{gdEntryNo} ({gdEntryTime})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1.5 border-t border-black/5 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block">Complainant / Informant:</span>
                      <strong className="text-zinc-800">{firComplainantName} ({firComplainantContact})</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Duty Officer:</span>
                      <span className="text-zinc-800">{firDutyOfficer}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Certified FIR Copy Document:</span>
                      {firDocUploaded ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          {firDocFileName} ({firDocFileSize})
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">Unattached</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supporting Intake Documents List in Review */}
                <div className="text-xs">
                  <span className="text-zinc-400 block text-[10px] mb-1">
                    Attached Intake Documents ({intakeDocs.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {intakeDocs.map((doc) => (
                      <span
                        key={doc.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px]"
                      >
                        <FileText className="size-3 text-zinc-500" />
                        <span className="font-semibold">{doc.title}</span>
                        <span className="text-[10px] text-zinc-400">({doc.fileName})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-zinc-400 block text-[10px]">Sections Applied:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sectionsTags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-zinc-100 font-bold text-[10.5px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Summary Section 2 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="size-4 text-rose-600" /> 2. Accused ({accusedList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('accused')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="space-y-2">
                  {accusedList.map((a, i) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-zinc-200 overflow-hidden shrink-0 grid place-items-center">
                          {a.photoUploaded ? (
                            <img src={a.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"} alt="" className="size-full object-cover" />
                          ) : (
                            <User className="size-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <strong>{i + 1}. {a.fullName || 'Accused'}</strong> ({a.role})
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Status: <span className="font-semibold">{a.arrestStatus}</span> · Weapon: {a.weaponUsed ? 'Yes' : 'No'} · ID: {a.idProofType} ({a.idProofNumber})
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 font-bold h-fit">
                        {a.gender}, {a.age} yrs
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Summary Section 3 */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="size-4 text-emerald-600" /> 3. Victims ({victimsList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('victims')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="space-y-2">
                  {victimsList.map((v, i) => (
                    <div key={v.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex justify-between">
                      <div>
                        <strong>{i + 1}. {v.isConfidential ? '[PROTECTED IDENTITY]' : v.fullName}</strong>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Injury: {v.injuryOrLossDetails || 'Not specified'} · Statement: {v.victimStatementUploaded ? 'Attached' : 'Missing'}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold h-fit">
                        {v.isConfidential ? 'Masked' : 'Public'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Summary Section 4 & 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/5">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase">
                      4. Witnesses ({witnessesList.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateToStep('witnesses')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    {witnessesList.map((w) => `${w.fullName} (${w.type})`).join(', ') || 'No witnesses recorded'}
                  </p>
                </Card>

                <Card className="p-5 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-black/5">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase">
                      5. Evidence Items ({evidenceItems.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateToStep('evidence')}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Circumstantial ({evidenceItems.filter((e) => e.type === 'circumstantial').length}), Forensic (
                    {evidenceItems.filter((e) => e.type === 'forensic').length}), Chemical (
                    {evidenceItems.filter((e) => e.type === 'chemical').length}), Physical (
                    {evidenceItems.filter((e) => e.type === 'physical').length}), Documentary (
                    {evidenceItems.filter((e) => e.type === 'documentary').length}), Witness (
                    {evidenceItems.filter((e) => e.type === 'witness').length})
                  </p>
                </Card>
              </div>

              {/* Summary Section 6: Police Investigation */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="size-4 text-purple-600" /> 6. Police Investigation Checklist ({investigationDocs.filter((d) => d.status !== 'Pending').length} of {investigationDocs.length} Verified)
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToStep('investigation')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">IO Name:</span>
                    <strong>{ioName}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Rank:</span>
                    <strong>{ioRank}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Contact Phone:</span>
                    <strong>{ioPhone}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Progress Logs:</span>
                    <strong>{progressLogs.length} Entries Recorded</strong>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {investigationDocs.map((doc) => (
                    <span
                      key={doc.id}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'Uploaded'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {doc.name}: {doc.status}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Summary Section 7: 8-Pillar Judicial Readiness & Final Decree */}
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Gavel className="size-4 text-indigo-600" /> 7. 8-Pillar Case Readiness Audit &amp; Decree Parameters ({readinessPercent}% Verified)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowJudgmentDraftStudio(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="size-3" /> Preview Judgment Draft
                    </button>
                    <span className="text-zinc-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => navigateToStep('judgement-documents')}
                      className="text-xs font-bold text-zinc-600 hover:underline cursor-pointer"
                    >
                      Edit Section
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Final Verdict:</span>
                    <strong className="px-2 py-0.5 rounded bg-zinc-900 text-white font-bold">{finalVerdict}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Judgement Date:</span>
                    <strong className="text-zinc-900 font-bold">{judgementDate}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Audit Status:</span>
                    <strong className="text-emerald-700 font-bold">{verifiedCount} of {totalAssessable} Verified ({readinessPercent}%)</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Outstanding Items:</span>
                    <strong className={outstandingCount > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {outstandingCount > 0 ? `${outstandingCount} (Reviewed u/s Discretion)` : '0 (Complete)'}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-zinc-100">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Decree / Sentence Awarded:</span>
                    <p className="font-bold text-zinc-900 mt-0.5">{punishmentSentence}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Decree Document:</span>
                    <strong className="text-emerald-700 block mt-0.5 font-medium">
                      {judgementPdfUploaded ? (judgementPdfFileName || 'Digitally Signed Bench Decree') : 'Pending Upload'}
                    </strong>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-zinc-400 block text-[10px]">Operative Findings / Ratio Decidendi:</span>
                  <p className="text-zinc-700 text-[11px] mt-0.5 italic">{judgementReasons}</p>
                </div>
              </Card>

              {/* Submit Case Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 p-6 rounded-3xl text-white">
                <div>
                  <h4 className="font-bold text-sm">Ready to Register and Ingest Case Docket?</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Submitting will assign the official CNR case number and link all 8 sections to the active docket registry.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleSubmitDocket}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold shadow-md shrink-0 cursor-pointer"
                >
                  <Gavel className="size-4 mr-2" />
                  Submit Case Docket
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Bottom Stepper Footer */}
        <div className="mt-8 pt-4 border-t border-black/10 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStepNumber === 1}
            className="text-xs"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Previous Step
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">
              Step {currentStepNumber} of 8
            </span>
            {currentStepNumber < 8 ? (
              <Button type="button" variant="primary" onClick={handleNext} className="text-xs">
                Save &amp; Continue
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleSubmitDocket} className="text-xs bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="size-3.5 mr-1" />
                Complete &amp; Submit
              </Button>
            )}
          </div>
        </div>

        {/* Document Viewer & Verification Modal */}
        {previewingDoc && (
          <Modal
            open={!!previewingDoc}
            onClose={() => setPreviewingDoc(null)}
            title="Judicial Docket · Official Record Preview"
            size="lg"
          >
            <div className="space-y-5">
              {/* Official Court Seal Header */}
              <div className="p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 block">
                    HIGH COURT BENCH · DIGITAL RECORD REPOSITORY
                  </span>
                  <h3 className="text-sm font-bold mt-0.5">{previewingDoc.title}</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    CNR: {caseNumber} · FIR Ref: {firNumber} ({policeStation})
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Digitally Sealed
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <div>
                  <span className="text-zinc-400 text-[10px] block">Document File:</span>
                  <strong className="font-mono text-zinc-800 truncate block">{previewingDoc.fileName}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Category:</span>
                  <strong className="text-zinc-800">{previewingDoc.category}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">Filing / Upload Date:</span>
                  <strong className="text-zinc-800">{previewingDoc.date}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block">File Size:</span>
                  <strong className="text-zinc-800">{previewingDoc.size}</strong>
                </div>
              </div>

              {/* Document Summary / Excerpt */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <FileText className="size-4 text-indigo-600" />
                  <span>Document Abstract &amp; Case Notes</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans bg-zinc-50/70 p-3 rounded-xl border border-zinc-100">
                  {previewingDoc.summary}
                </p>
              </div>

              {/* Official Seal / Signature Bar */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <div>
                    <span className="font-bold block">Digital Authentication Verified</span>
                    <span className="text-[11px] text-emerald-800">Certified copy signed by SHO {policeStation} &amp; admitted to court docket.</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  SHA-256: 4f89...b92a
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast(`Downloading certified copy: ${previewingDoc.fileName}`, 'ok')
                  }}
                  className="text-xs"
                >
                  <Download className="size-3.5 mr-1" />
                  Download Document
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setPreviewingDoc(null)}
                  className="text-xs"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Intake Document Modal */}
        {showAddIntakeDocModal && (
          <Modal
            open={showAddIntakeDocModal}
            onClose={() => setShowAddIntakeDocModal(false)}
            title="Attach Supporting Case Intake Document"
            size="md"
          >
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Document Title</label>
                <Input
                  value={newIntakeDocTitle}
                  onChange={(e) => setNewIntakeDocTitle(e.target.value)}
                  placeholder="e.g. Original Tehrir / Written Complaint or Crime Scene Spot Map"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Document Category</label>
                  <Select
                    value={newIntakeDocCategory}
                    onChange={(e) => setNewIntakeDocCategory(e.target.value as any)}
                    className="w-full"
                  >
                    <option value="Complaint / Tehrir">Complaint / Tehrir</option>
                    <option value="FIR Copy">FIR Copy</option>
                    <option value="GD Extract">General Diary (GD) Extract</option>
                    <option value="Scene Sketch / Map">Crime Scene Spot Map / Sketch</option>
                    <option value="Medical / MLC">Medical / MLC Certificate</option>
                    <option value="Other">Other Intake Annexure</option>
                  </Select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">File Name</label>
                  <Input
                    value={newIntakeDocFileName}
                    onChange={(e) => setNewIntakeDocFileName(e.target.value)}
                    placeholder="e.g. complaint_signed_scan.pdf"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Notes / Document Description</label>
                <textarea
                  value={newIntakeDocNotes}
                  onChange={(e) => setNewIntakeDocNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-zinc-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/20"
                  placeholder="Enter details about this document, police station dispatch notes, or witness endorsements..."
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Simulate file attachment from scanner or local disk:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7.5 px-3"
                  onClick={() => {
                    const sampleName = `${newIntakeDocCategory.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}_verified_${Date.now().toString().slice(-4)}.pdf`
                    setNewIntakeDocFileName(sampleName)
                    toast(`Selected file: ${sampleName}`, 'ok')
                  }}
                >
                  <Upload className="size-3 mr-1" />
                  Select File
                </Button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddIntakeDocModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!newIntakeDocTitle.trim()) {
                      toast('Please provide a document title', 'info')
                      return
                    }
                    const newDoc: CaseIntakeDoc = {
                      id: `idoc-${Date.now()}`,
                      title: newIntakeDocTitle.trim(),
                      category: newIntakeDocCategory,
                      fileName: newIntakeDocFileName.trim() || `intake_doc_${Date.now().toString().slice(-4)}.pdf`,
                      fileSize: '1.2 MB',
                      uploadDate: new Date().toISOString().slice(0, 10),
                      status: 'Uploaded',
                      notes: newIntakeDocNotes.trim(),
                    }
                    setIntakeDocs([...intakeDocs, newDoc])
                    setShowAddIntakeDocModal(false)
                    toast(`Attached "${newDoc.title}" to docket`, 'ok')
                  }}
                >
                  Attach to Docket
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* =================================================================== */}
        {/* JUDGMENT DRAFT STUDIO MODAL (7-PART JUDICIAL STRUCTURE)             */}
        {/* =================================================================== */}
        {showJudgmentDraftStudio && (
          <Modal
            isOpen={showJudgmentDraftStudio}
            onClose={() => setShowJudgmentDraftStudio(false)}
            title="NyayaDesk Judicial Judgment Draft Studio"
            size="xl"
          >
            <div className="space-y-4">
              {/* Studio Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900 text-white shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Gavel className="size-4 text-emerald-400" />
                    <span className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">
                      Official Draft &bull; {caseNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-bold">
                      {caseType} Jurisdiction
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Bench Judgment, Operative Directions &amp; Decree
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-xs h-8"
                    onClick={() => {
                      const fullText = `IN THE COURT OF THE PRINCIPAL DISTRICT & SESSIONS JUDGE\n${courtName || 'PATIALA HOUSE COURTS, NEW DELHI'}\nPRESIDING: ${judgeName || 'PRESIDING JUDICIAL OFFICER'}\n\nCNR NO: ${caseNumber}\nCASE TYPE: ${caseType}\n\nBETWEEN:\nSTATE (NCT OF DELHI) THROUGH ${policeStation}\n... PROSECUTION\nVERSUS\n${accusedList.map((a) => a.fullName).join(', ')}\n... ACCUSED\n\nDATE OF DECISION: ${judgementDate}\nVERDICT: ${finalVerdict}\n\nOPERATIVE ORDER:\n${punishmentSentence}\n\nFINDINGS:\n${judgementReasons}\n\nPRECEDENTS CITED:\n${precedentLinks}`
                      navigator.clipboard.writeText(fullText)
                      toast('Judgment draft copied to clipboard', 'ok')
                    }}
                  >
                    <Copy className="size-3.5 mr-1" />
                    Copy Text
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 text-xs h-8"
                    onClick={() => {
                      window.print()
                    }}
                  >
                    <Printer className="size-3.5 mr-1" />
                    Print
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs h-8 shadow-sm"
                    onClick={() => {
                      setJudgementPdfUploaded(true)
                      setJudgementPdfFileName(`judgment_decree_${caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}_bench_signed.pdf`)
                      toast('Final Decree PDF generated and digitally sealed', 'ok')
                    }}
                  >
                    <FileDown className="size-3.5 mr-1" />
                    Export Decree PDF
                  </Button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setJudgmentDraftTab('preview')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    judgmentDraftTab === 'preview'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Full Judgment Document (7 Parts)
                </button>
                <button
                  type="button"
                  onClick={() => setJudgmentDraftTab('operative')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    judgmentDraftTab === 'operative'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Operative Order &amp; Sentencing Mandate
                </button>
                <button
                  type="button"
                  onClick={() => setJudgmentDraftTab('citations')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    judgmentDraftTab === 'citations'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  Statutory Provisions &amp; Precedents
                </button>
              </div>

              {/* TAB 1: FULL JUDGMENT DOCUMENT */}
              {judgmentDraftTab === 'preview' && (
                <div className="bg-amber-50/20 border border-amber-200/60 rounded-2xl p-6 font-serif text-zinc-900 text-xs space-y-6 max-h-[62vh] overflow-y-auto shadow-inner leading-relaxed select-text">
                  {/* Formal Court Heading & Case Title */}
                  <div className="text-center space-y-1.5 border-b border-zinc-300 pb-5">
                    <div className="flex justify-center mb-1">
                      <Scale className="size-8 text-indigo-900" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-wider font-sans text-zinc-900">
                      IN THE COURT OF THE PRINCIPAL DISTRICT &amp; SESSIONS JUDGE
                    </h2>
                    <p className="text-xs font-semibold uppercase text-zinc-700">
                      {courtName || 'NEW DELHI DISTRICT, PATIALA HOUSE COURTS, NEW DELHI'}
                    </p>
                    <p className="text-[11px] font-sans font-bold text-zinc-600 pt-1">
                      PRESIDING: HON'BLE {judgeName ? judgeName.toUpperCase() : 'SH. SANJAY SHARMA, DHJS'}
                    </p>
                    <div className="pt-2 text-[11px] font-mono font-bold text-zinc-800 flex items-center justify-center gap-4">
                      <span>CNR NO: {caseNumber}</span>
                      <span>&bull;</span>
                      <span>CASE REGISTRATION: {caseNumberSequence}</span>
                      <span>&bull;</span>
                      <span>SESSIONS TRIAL NO. {firNumber ? `ST/${firNumber}/2026` : 'ST/148/2026'}</span>
                    </div>
                  </div>

                  {/* Memo of Parties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-200 pb-4">
                    <div className="space-y-1">
                      <span className="font-sans font-bold text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Prosecuting State / Complainant:
                      </span>
                      <p className="font-bold text-zinc-900">STATE (NCT OF DELHI)</p>
                      <p className="text-[11px] text-zinc-700">
                        Through Station House Officer, {policeStation} Police Station
                      </p>
                      <p className="text-[11px] text-zinc-600 font-sans">
                        Represented by: <strong>Addl. Public Prosecutor (Directorate of Prosecution)</strong>
                      </p>
                    </div>

                    <div className="space-y-1 text-right md:text-right">
                      <span className="font-sans font-bold text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Accused Person(s):
                      </span>
                      {accusedList.map((acc, idx) => (
                        <div key={acc.id} className="text-right">
                          <p className="font-bold text-zinc-900">
                            {idx + 1}. {acc.fullName.toUpperCase()} {acc.alias ? `(Alias: "${acc.alias}")` : ''}
                          </p>
                          <p className="text-[11px] text-zinc-700">
                            Age: {acc.age || '32'} yrs, R/o {acc.address || 'Central Delhi'}
                          </p>
                          <p className="text-[11px] text-zinc-600 font-sans">
                            Role: {acc.role.toUpperCase()} &bull; Status: {acc.arrestStatus.toUpperCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates of Institution and Pronouncement */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] font-sans font-bold text-zinc-700 bg-white/80 p-2.5 rounded-xl border border-zinc-200">
                    <div>Date of FIR / Institution: <span className="text-zinc-900">{firDate || '2026-03-12'}</span></div>
                    <div>Charges Framed: <span className="text-zinc-900">2026-04-18</span></div>
                    <div>Arguments Concluded: <span className="text-zinc-900">2026-10-15</span></div>
                    <div>Date of Decision / Pronouncement: <span className="text-indigo-900 underline font-black">{judgementDate}</span></div>
                  </div>

                  {/* 1. Brief Facts & Procedural History */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900 border-l-2 border-indigo-600 pl-2">
                      1. Brief Facts and Procedural History
                    </h4>
                    <p className="indent-6 text-justify">
                      [1] The case of the prosecution originates from FIR No. <strong>{firNumber}</strong> registered at Police Station <strong>{policeStation}</strong> upon the complaint of {firComplainantName || 'the complainant'}. The incident occurred on {incidentDate || '2026-03-12'} at approximately {incidentTime || '22:15 hrs'} at {incidentPlace || 'Industrial Area'}.
                    </p>
                    <p className="indent-6 text-justify">
                      [2] Following spot inspection by the Investigating Officer, seizure panchnama was drawn, and upon completion of investigation, final report under Section 173 BNSS was submitted. The matter was committed to the Court of Session for trial. The accused person(s) pleaded not guilty to the charges and claimed trial.
                    </p>
                  </div>

                  {/* 2. Charges & Points for Determination */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900 border-l-2 border-indigo-600 pl-2">
                      2. Charges and Points for Determination
                    </h4>
                    <p className="indent-6 text-justify">
                      [3] The following specific charges/issues were framed by this Court for determination:
                    </p>
                    <div className="space-y-1.5 pl-4 font-sans text-xs">
                      {judgementSections.map((sec, idx) => (
                        <div key={sec} className="p-2 rounded-lg bg-white border border-zinc-200">
                          <strong>Point No. {idx + 1}:</strong> Whether the prosecution has proved beyond reasonable doubt that the accused committed the substantive offenses punishable under <strong>{sec}</strong>?
                        </div>
                      ))}
                      <div className="p-2 rounded-lg bg-white border border-zinc-200">
                        <strong>Point No. {judgementSections.length + 1}:</strong> Whether the recovery of the incriminating weapon/evidence under Section 27 was proved strictly in accordance with chain-of-custody protocols?
                      </div>
                    </div>
                  </div>

                  {/* 3. Summary of Evidence */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900 border-l-2 border-indigo-600 pl-2">
                      3. Summary and Marshalling of Evidentiary Record
                    </h4>
                    <p className="indent-6 text-justify">
                      [4] In support of its case, the prosecution examined <strong>{witnessesList.length} witnesses</strong> (PW-1 to PW-{witnessesList.length}) and tendered into evidence <strong>{evidenceItems.length} material exhibits</strong> (Ex. P-1 to Ex. P-{evidenceItems.length}). The depositions of star ocular witnesses, forensic ballistics experts, and medical officers were duly recorded and subjected to cross-examination.
                    </p>
                    <div className="p-3 rounded-xl bg-white border border-zinc-200 font-sans text-[11px] space-y-1.5">
                      <div className="font-bold text-zinc-800">Primary Exhibits Accounted On Record:</div>
                      {evidenceItems.slice(0, 4).map((ev, i) => (
                        <div key={ev.id} className="flex items-center justify-between text-zinc-600">
                          <span>&bull; <strong>Ex. P-{i + 1} ({ev.evidenceId}):</strong> {ev.description}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{ev.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Arguments of Both Parties */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900 border-l-2 border-indigo-600 pl-2">
                      4. Arguments of Both Parties
                    </h4>
                    <p className="indent-6 text-justify">
                      [5] <strong>Submissions on behalf of Prosecution:</strong> The Learned Additional Public Prosecutor argued that the ocular testimony of eye-witnesses is completely corroborated by medical jurisprudence, prompt FIR registration, and the scientific ballistic striation matching connecting the recovered firearm directly with the crime scene.
                    </p>
                    <p className="indent-6 text-justify">
                      [6] <strong>Submissions on behalf of Defence:</strong> Learned Defence Counsel contended that there are minor contradictions in witness timings, that independent public witnesses were not joined during recovery, and that the accused has been falsely implicated.
                    </p>
                  </div>

                  {/* 5. Applicable Laws and Precedents */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900 border-l-2 border-indigo-600 pl-2">
                      5. Applicable Laws and Verified Judicial Precedents
                    </h4>
                    <p className="indent-6 text-justify">
                      [7] This Court has carefully considered the authoritative rulings cited at the bar:
                    </p>
                    <div className="p-3 rounded-xl bg-white border border-zinc-200 font-sans text-xs italic text-zinc-800">
                      "{precedentLinks || 'State of UP v. Satish (2005) 3 SCC 114; Sharad Birdhichand Sarda v. State of Maharashtra (1984) 4 SCC 116'}"
                    </div>
                  </div>

                  {/* 6. Judicial Analysis, Findings & Reasons */}
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-900 border-l-2 border-indigo-600 pl-2">
                      6. Analysis, Credibility Assessment &amp; Findings
                    </h4>
                    <p className="indent-6 text-justify">
                      [8] <strong>Ratio Decidendi:</strong> {judgeNotes}
                    </p>
                    <p className="indent-6 text-justify">
                      [9] {judgementReasons}
                    </p>
                  </div>

                  {/* 7. Operative Order & Sentence */}
                  <div className="space-y-3 p-4 rounded-2xl bg-zinc-900 text-white font-sans">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                      7. Final Operative Order &amp; Decree
                    </h4>
                    <div className="space-y-2 text-xs">
                      <p>
                        In view of the findings recorded hereinabove, this Court holds the accused person(s) <strong>{finalVerdict.toUpperCase()}</strong> of the charges framed under <strong>{judgementSections.join(', ')}</strong>.
                      </p>
                      <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700 text-amber-300 font-bold">
                        SENTENCE AWARDED: {punishmentSentence}
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        Directions: The period of detention already undergone by the convict during inquiry and trial shall be set off against the substantive term of imprisonment in terms of Section 428 CrPC / Section 469 BNSS. Fine deposited shall be remitted to the Victim Compensation Fund.
                      </p>
                    </div>
                  </div>

                  {/* Authentication & Judicial Seal */}
                  <div className="pt-6 border-t border-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
                    <div>
                      <div className="font-bold text-zinc-900">Pronounced in Open Court</div>
                      <div className="text-zinc-500 text-[11px]">Date: {judgementDate}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-1">Digital Hash: SHA256-NYAYA-{Date.now().toString().slice(-8)}</div>
                    </div>

                    <div className="text-center sm:text-right space-y-1">
                      <div className="inline-block border-b border-zinc-900 pb-1 px-8 font-bold">
                        ( {judgeName || 'SH. SANJAY SHARMA, DHJS'} )
                      </div>
                      <div className="text-[11px] font-bold text-zinc-800">
                        Principal District &amp; Sessions Judge
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Patiala House Courts, New Delhi Division
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OPERATIVE ORDER & SENTENCING MANDATE */}
              {judgmentDraftTab === 'operative' && (
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-xs flex items-center gap-2">
                      <Gavel className="size-4 text-indigo-600" /> Dispositive Operative Directions
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white font-bold text-[10px]">
                      Verdict: {finalVerdict}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-700 block text-[11px]">Primary Sentence &amp; Decree Mandate:</span>
                    <p className="text-sm font-bold text-zinc-900">{punishmentSentence}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-700 block text-[11px]">Statutory Provisions Applied:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {judgementSections.map((sec) => (
                        <span key={sec} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-bold border border-indigo-200">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="font-bold text-zinc-700 block text-[11px]">Compliance Deadlines &amp; Bail Bond Cancellation:</span>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700 leading-relaxed">
                      <li>Convict committed to custody under warrant of commitment addressed to Superintendent, Central Jail Tihar.</li>
                      <li>Fine of ₹50,000 to be deposited within 30 days from pronouncement.</li>
                      <li>Free certified copy of this judgment supplied to the convict forthwith in terms of Section 404 BNSS.</li>
                      <li>Material exhibits (Ex. P-1 to P-8) to be preserved until expiry of statutory period of appeal.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: STATUTORY PROVISIONS & PRECEDENTS */}
              {judgmentDraftTab === 'citations' && (
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                  <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-xs">
                    Legal Authorities &amp; Statutory Bench Citations
                  </h4>

                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="font-bold text-indigo-950 block">Supreme Court of India Precedents:</span>
                    <p className="text-zinc-700 font-mono text-[11px] leading-relaxed">
                      {precedentLinks}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="font-bold text-indigo-950 block">Statutory Standard of Proof:</span>
                    <p className="text-zinc-700 leading-relaxed">
                      {caseType === 'Criminal' || caseType === 'POCSO'
                        ? 'Proof Beyond Reasonable Doubt — The prosecution must establish every link in the chain of circumstantial and direct evidence without leaving any reasonable hypothesis compatible with the innocence of the accused.'
                        : 'Preponderance of Probabilities — The party carrying the burden of proof must demonstrate that the factual occurrence is more probable than not based on legal admissible evidence.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="font-bold text-indigo-950 block">Electronic Evidence Compliance (Sec 63 BSA / Sec 65B IEA):</span>
                    <p className="text-zinc-700 leading-relaxed">
                      Certified electronic extraction logs, CCTV DVR data, and call detail records accompanied by statutory Section 63 certificate satisfying mandatory conditions laid down in <em>Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1</em>.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                <span className="text-[11px] text-zinc-500">
                  Judicial Draft Engine &bull; Ready for Digital Seal &amp; Pronouncement
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJudgmentDraftStudio(false)}
                >
                  Close Studio
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* =================================================================== */}
        {/* eCourts CIS Full Case Dossier & Orders Modal                        */}
        {/* =================================================================== */}
        {isEcourtDocketModalOpen && ecourtCaseData && (
          <Modal
            isOpen={isEcourtDocketModalOpen}
            onClose={() => setIsEcourtDocketModalOpen(false)}
            title="eCourts National Judicial Registry · Certified Docket View"
            size="lg"
          >
            <div className="space-y-5 text-xs">
              {/* Header Details */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-blue-900">
                        {ecourtCaseData.caseNumber}
                      </span>
                      <span className="font-mono font-bold text-xs text-[#FF5C5C]">
                        CNR: {ecourtCaseData.cnr}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {ecourtCaseData.status}
                      </span>
                    </div>
                    <div className="text-zinc-600 font-medium text-xs mt-0.5">
                      {ecourtCaseData.courtName} &middot; {ecourtCaseData.courtNumber}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleApplyEcourtData(ecourtCaseData)
                      setIsEcourtDocketModalOpen(false)
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Check className="size-3.5" />
                    Apply Docket to Workspace
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Filing Date:</span>
                    <span className="font-bold text-zinc-800">{ecourtCaseData.filingDate} (Filing No: {ecourtCaseData.filingNumber})</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Registration Date:</span>
                    <span className="font-bold text-zinc-800">{ecourtCaseData.registrationDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Current Stage:</span>
                    <span className="font-bold text-indigo-700">{ecourtCaseData.stage}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Next Hearing Date:</span>
                    <span className="font-bold text-emerald-700">{ecourtCaseData.nextHearingDate}</span>
                  </div>
                </div>
              </div>

              {/* Parties & Counsels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                    Prosecution / Petitioner Side:
                  </div>
                  <div className="font-bold text-zinc-900">{ecourtCaseData.petitioner}</div>
                  <div className="text-[11px] text-zinc-600">
                    Prosecuting Counsel: <span className="font-semibold">{ecourtCaseData.petitionerAdvocate}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                    Police Station: <span className="font-semibold text-zinc-800">{ecourtCaseData.policeStation}</span> (FIR No: {ecourtCaseData.firNumber}/{ecourtCaseData.firYear})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">
                    Defense / Respondent Side:
                  </div>
                  <div className="font-bold text-zinc-900">{ecourtCaseData.respondent}</div>
                  <div className="text-[11px] text-zinc-600">
                    Defense Advocate: <span className="font-semibold text-zinc-800">{ecourtCaseData.respondentAdvocate}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                    Presiding Judicial Officer: <span className="font-semibold text-zinc-800">{ecourtCaseData.presidingJudge}</span>
                  </div>
                </div>
              </div>

              {/* Acts & Sections */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="text-[11px] font-bold text-zinc-800 uppercase tracking-wide">
                  Codified Acts &amp; Statutory Sections Charged:
                </div>
                <div className="flex flex-wrap gap-2">
                  {ecourtCaseData.actsAndSections.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-zinc-300 font-mono text-[11px] text-zinc-800 shadow-2xs font-semibold"
                    >
                      {item.act} &bull; <strong className="text-indigo-700">{item.section}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hearing History Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                  Case Hearing History ({ecourtCaseData.history?.length || 0} Sessions)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-zinc-200">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-zinc-100 text-zinc-700 font-bold">
                      <tr>
                        <th className="p-2.5">HEARING DATE</th>
                        <th className="p-2.5">PURPOSE OF HEARING</th>
                        <th className="p-2.5">BUSINESS CONDUCTED</th>
                        <th className="p-2.5">PRESIDING BENCH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {ecourtCaseData.history?.map((h, i) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="p-2.5 font-bold font-mono text-zinc-900 whitespace-nowrap">
                            {h.hearingDate}
                          </td>
                          <td className="p-2.5 font-semibold text-indigo-700">{h.purpose}</td>
                          <td className="p-2.5 text-zinc-700">{h.business}</td>
                          <td className="p-2.5 text-zinc-500">{h.judgeName || ecourtCaseData.presidingJudge}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Certified Orders */}
              {ecourtCaseData.orders && ecourtCaseData.orders.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">
                    Interim &amp; Formal Orders on Record
                  </h4>
                  <div className="space-y-2">
                    {ecourtCaseData.orders.map((ord, oIdx) => (
                      <div
                        key={oIdx}
                        className="p-3 rounded-xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-zinc-900">{ord.orderDate}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {ord.orderType}
                            </span>
                          </div>
                          <p className="text-zinc-700 text-[11px]">{ord.summary}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 whitespace-nowrap bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          Certified Order
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                <span className="text-[11px] text-zinc-500">
                  Data sourced via National eCourts Services CIS &bull; Ready for judicial reference
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEcourtDocketModalOpen(false)}
                >
                  Close Dossier
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
