import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import {
  FileText,
  Search,
  Filter,
  Download,
  Edit2,
  Check,
  X,
  FileCheck,
  Shield,
  Eye,
  FileCode,
} from 'lucide-react'
import {
  judicialStore,
  type DocumentRecord,
  type SubmittingParty,
} from '../lib/judicialStore'
import {
  Button,
  Card,
  CardHeader,
  Modal,
  PageHeader,
  Tag,
  Th,
  Td,
  Input,
  Select,
  useApp,
} from '../ui'

export default function Documents() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const documents = judicialStore.getDocuments()

  const [query, setQuery] = useState('')
  const [filterParty, setFilterParty] = useState<string>('ALL')

  // Renaming state
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null)
  const [renameInput, setRenameInput] = useState('')

  // Preview OCR modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null)

  const filteredDocs = documents.filter((doc) => {
    const q = query.trim().toLowerCase()
    const matchesQ =
      !q ||
      doc.canonicalName.toLowerCase().includes(q) ||
      doc.caseNumber.toLowerCase().includes(q) ||
      doc.originalFileName.toLowerCase().includes(q) ||
      doc.advocateOrOfficer.toLowerCase().includes(q)

    const matchesParty = filterParty === 'ALL' || doc.submittingParty === filterParty
    return matchesQ && matchesParty
  })

  const handleStartRename = (doc: DocumentRecord) => {
    setRenamingDocId(doc.id)
    setRenameInput(doc.canonicalName)
  }

  const handleSaveRename = (id: string) => {
    if (!renameInput.trim()) {
      toast('Canonical name cannot be blank', 'bad')
      return
    }
    judicialStore.renameDocument(id, renameInput)
    toast('Document alias updated in registry index', 'ok')
    setRenamingDocId(null)
  }

  const partyBadge: Record<SubmittingParty, { label: string; bg: string; text: string }> = {
    POLICE_INVESTIGATION: { label: 'Police Investigation', bg: 'bg-rose-100', text: 'text-rose-800' },
    DEFENSE_ADVOCATE: { label: 'Defense Counsel', bg: 'bg-blue-100', text: 'text-blue-800' },
    PUBLIC_PROSECUTOR: { label: 'Prosecution', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    REGISTRY_DIRECT: { label: 'Judicial Decree', bg: 'bg-amber-100', text: 'text-amber-800' },
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Docket & Submission History"
        sub="Master evidentiary repository of police charge sheets, forensic reports, defense petitions, and judicial orders. Index, retrieve, inspect OCR transcripts, and assign canonical court aliases."
        actions={
          <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold">
            Total Indexed: {documents.length} Dockets
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 size-5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by document name, case number, or filing advocate..."
              className="pl-12 pr-5 h-13 text-sm sm:text-[15px] font-semibold rounded-full border-black/10 focus:border-black"
            />
          </div>

          <Select
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
            className="w-full h-13 text-xs sm:text-sm font-semibold rounded-full border-black/10"
          >
            <option value="ALL">All Submitting Parties</option>
            <option value="POLICE_INVESTIGATION">Police Investigation Submissions</option>
            <option value="DEFENSE_ADVOCATE">Defense Advocate Submissions</option>
            <option value="PUBLIC_PROSECUTOR">Public Prosecutor Submissions</option>
            <option value="REGISTRY_DIRECT">Court Registry / Judicial Decrees</option>
          </Select>
        </div>
      </Card>

      {/* Document Records Table */}
      <Card className="bg-white overflow-hidden">
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Indexed Document History ({filteredDocs.length} Dockets)
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Cryptographically verified SHA-256 records with OCR text extraction and renaming controls.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] bg-[#F7F4EB]/50">
                <Th>CANONICAL SYSTEM ALIAS (CLICK TO RENAME)</Th>
                <Th>CASE NO.</Th>
                <Th>SUBMITTING PARTY</Th>
                <Th>SUBMITTED BY</Th>
                <Th>DATE</Th>
                <Th>PAGES / SIZE</Th>
                <Th>SHA-256 CHECKSUM</Th>
                <Th>ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-14 text-center text-xs text-zinc-400">
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <p className="font-extrabold text-sm text-zinc-700">No Document Records Found</p>
                      <p className="text-[11px] text-zinc-400">Your electronic court vault is clean. Indexed filings, FIRs, and decrees will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isEditing = renamingDocId === doc.id
                  const badge = partyBadge[doc.submittingParty]
                  return (
                  <tr key={doc.id} className="hover:bg-[#F7F4EB]/30 transition-colors border-b border-black/[0.04]">
                    <Td className="max-w-xs">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            className="h-8 text-xs font-bold rounded-lg"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(doc.id)}
                            className="size-8 rounded-lg bg-emerald-100 text-emerald-800 grid place-items-center hover:bg-emerald-200 cursor-pointer"
                            title="Save"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingDocId(null)}
                            className="size-8 rounded-lg bg-zinc-100 text-zinc-700 grid place-items-center hover:bg-zinc-200 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="font-extrabold text-xs text-zinc-900 group-hover:text-[#FF5C5C] transition-colors">
                            {doc.canonicalName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartRename(doc)}
                            className="opacity-40 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-900 cursor-pointer transition-opacity"
                            title="Rename document under custom name"
                          >
                            <Edit2 className="size-3" />
                          </button>
                        </div>
                      )}
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5 truncate">
                        Orig: {doc.originalFileName} ({doc.kind})
                      </div>
                    </Td>

                    <Td>
                      <Link
                        to={`/cases/${doc.caseId}`}
                        className="text-xs font-bold text-[#FF5C5C] hover:underline"
                      >
                        {doc.caseNumber}
                      </Link>
                    </Td>

                    <Td className="whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </Td>

                    <Td className="text-xs text-zinc-800 font-medium max-w-xs truncate">
                      {doc.advocateOrOfficer}
                    </Td>

                    <Td className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {doc.dateSubmitted}
                    </Td>

                    <Td className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {doc.pageCount} pp · {doc.fileSizeBytes}
                    </Td>

                    <Td className="font-mono text-[10.5px] text-zinc-400 whitespace-nowrap">
                      {doc.sha256.slice(0, 12)}...
                    </Td>

                    <Td className="whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="size-3.5" />
                        Inspect OCR
                      </button>
                    </Td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* OCR Inspection Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Document Inspection: ${previewDoc.canonicalName}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F7F4EB] text-xs">
              <div>
                <span className="text-zinc-500 font-medium">Original Filename:</span>
                <div className="font-bold text-zinc-900 mt-0.5">{previewDoc.originalFileName}</div>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Submitting Party:</span>
                <div className="font-bold text-zinc-900 mt-0.5">{previewDoc.advocateOrOfficer}</div>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">Case Associated:</span>
                <div className="font-bold text-[#FF5C5C] mt-0.5">{previewDoc.caseNumber}</div>
              </div>
              <div>
                <span className="text-zinc-500 font-medium">SHA-256 Checksum:</span>
                <div className="font-mono text-[10.5px] text-zinc-700 truncate mt-0.5">{previewDoc.sha256}</div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-zinc-700 block mb-1.5">
                Extracted OCR Full-Text Content:
              </span>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/[0.05] text-xs font-mono text-zinc-800 max-h-72 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {previewDoc.ocrSnippet || 'No OCR transcript generated for this binary asset.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast(`Downloaded cryptographic asset: ${previewDoc.canonicalName}`, 'ok')
                  setPreviewDoc(null)
                }}
                className="px-4 py-2 rounded-full bg-[#121316] text-white text-xs font-bold cursor-pointer hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="size-3.5" />
                Download Verified PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
