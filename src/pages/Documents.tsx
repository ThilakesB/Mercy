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
  Plus,
  Trash2,
  UploadCloud,
  FilePlus,
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
  Field,
  useApp,
} from '../ui'

export default function Documents() {
  const { toast } = useApp()
  const [, setTick] = useState(0)

  useEffect(() => {
    return judicialStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  const cases = judicialStore.getCases()
  const documents = judicialStore.getDocuments()

  const [query, setQuery] = useState('')
  const [filterParty, setFilterParty] = useState<string>('ALL')

  // Renaming state
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null)
  const [renameInput, setRenameInput] = useState('')

  // Preview OCR modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null)

  // Add Document Modal state
  const [isAddDocOpen, setIsAddDocOpen] = useState(false)
  const [docCaseId, setDocCaseId] = useState(cases[0]?.id || '')
  const [docTitle, setDocTitle] = useState('')
  const [docFileName, setDocFileName] = useState('')
  const [docKind, setDocKind] = useState('Affidavit (.docx)')
  const [docParty, setDocParty] = useState<SubmittingParty>('DEFENSE_ADVOCATE')
  const [docSubmitter, setDocSubmitter] = useState('')
  const [docPages, setDocPages] = useState('6')
  const [docFileSize, setDocFileSize] = useState('1.8 MB')
  const [docOcrExcerpt, setDocOcrExcerpt] = useState('')

  // Delete confirmation state
  const [deletingDoc, setDeletingDoc] = useState<DocumentRecord | null>(null)

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

  const handleAddDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetCase = cases.find((c) => c.id === docCaseId) || cases[0]
    if (!targetCase) {
      toast('Please select an active case docket', 'bad')
      return
    }
    if (!docTitle.trim()) {
      toast('Document title is required', 'bad')
      return
    }

    const finalFileName =
      docFileName.trim() ||
      `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}${docKind.includes('.docx') ? '.docx' : '.pdf'}`

    const sha = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

    const added = judicialStore.addDocument({
      caseId: targetCase.id,
      caseNumber: targetCase.number,
      canonicalName: docTitle,
      originalFileName: finalFileName,
      submittingParty: docParty,
      advocateOrOfficer: docSubmitter.trim() || (docParty === 'DEFENSE_ADVOCATE' ? 'Adv. R. K. Anand' : targetCase.io.name),
      submissionDate: new Date().toISOString().slice(0, 10),
      fileSize: docFileSize.trim() || '2.1 MB',
      pages: parseInt(docPages, 10) || 6,
      kind: docKind,
      sha256: sha,
      ocrExcerpt:
        docOcrExcerpt.trim() ||
        `Official evidentiary submission [${docKind}]: ${docTitle}. Lodged before Principal Sessions Court in matter of ${targetCase.title}. Cryptographically certified under Bharatiya Sakshya Adhiniyam, 2023.`,
    })

    setIsAddDocOpen(false)
    setDocTitle('')
    setDocFileName('')
    setDocOcrExcerpt('')
    toast(`Document "${added.canonicalName}" successfully added & indexed!`, 'ok')
  }

  const handleConfirmDelete = () => {
    if (!deletingDoc) return
    const docName = deletingDoc.canonicalName
    const success = judicialStore.deleteDocument(deletingDoc.id)
    if (success) {
      toast(`Document "${docName}" removed from vault.`, 'ok')
      setDeletingDoc(null)
    } else {
      toast('Failed to delete document', 'bad')
    }
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
        sub="Master evidentiary repository of police charge sheets, defense briefs (.docx), forensic reports, and judicial decrees. Index, retrieve, inspect OCR transcripts, add new files, and delete obsolete assets."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddDocOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#121316] text-white hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              <FilePlus className="size-4 text-emerald-400" />
              + Add Document (.docx / .pdf)
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold">
              Total Indexed: {documents.length} Dockets
            </span>
          </div>
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
              Cryptographically verified SHA-256 records with OCR text extraction, renaming, and removal controls.
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
                <Th>SUBMISSION DATE</Th>
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
                      <p className="text-[11px] text-zinc-400">Your electronic court vault is clean. Click below to add your first document or brief.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddDocOpen(true)}
                        className="mt-2 px-4 py-2 rounded-full bg-[#121316] text-white font-bold text-xs cursor-pointer"
                      >
                        + Add Document (.docx)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isEditing = renamingDocId === doc.id
                  const badge = partyBadge[doc.submittingParty] || {
                    label: doc.submittingParty,
                    bg: 'bg-zinc-100',
                    text: 'text-zinc-800',
                  }

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
                              title="Rename document under custom alias"
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
                        {doc.submissionDate}
                      </Td>

                      <Td className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                        {doc.pages} pp · {doc.fileSize}
                      </Td>

                      <Td className="font-mono text-[10.5px] text-zinc-400 whitespace-nowrap">
                        {doc.sha256.slice(0, 12)}...
                      </Td>

                      <Td className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Eye className="size-3.5" />
                            Inspect OCR
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingDoc(doc)}
                            className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* OCR Inspection Modal */}
      {previewDoc && (
        <Modal
          open={!!previewDoc}
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
                {previewDoc.ocrExcerpt || 'No OCR transcript generated for this binary asset.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast(`Downloaded verified cryptographic asset: ${previewDoc.canonicalName}`, 'ok')
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

      {/* Add Document (.docx / .pdf) Modal */}
      <Modal
        open={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Add &amp; Index Document (.docx / .pdf)"
        size="lg"
      >
        <form onSubmit={handleAddDocumentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Target Case Docket">
              <Select
                value={docCaseId}
                onChange={(e) => setDocCaseId(e.target.value)}
                className="w-full"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.number} · {c.title.slice(0, 32)}...
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Document Kind / Format">
              <Select
                value={docKind}
                onChange={(e) => setDocKind(e.target.value)}
                className="w-full"
              >
                <option value="Affidavit (.docx)">Affidavit (.docx)</option>
                <option value="Written Arguments (.docx)">Written Arguments (.docx)</option>
                <option value="Bail Petition (.docx)">Bail Petition (.docx)</option>
                <option value="Legal Opinion Brief (.docx)">Legal Opinion Brief (.docx)</option>
                <option value="Police Chargesheet (.pdf)">Police Chargesheet (.pdf)</option>
                <option value="FIR First Information (.pdf)">FIR First Information (.pdf)</option>
                <option value="Forensic FSL Report (.pdf)">Forensic FSL Report (.pdf)</option>
                <option value="Judicial Decree / Order (.pdf)">Judicial Decree / Order (.pdf)</option>
              </Select>
            </Field>

            <Field label="Document Title / Canonical Alias">
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Defense Written Arguments on Bail"
                required
              />
            </Field>

            <Field label="File Name (e.g. defense_arguments.docx)">
              <Input
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                placeholder="e.g. bail_defense_submission.docx"
              />
            </Field>

            <Field label="Submitting Party">
              <Select
                value={docParty}
                onChange={(e) => setDocParty(e.target.value as SubmittingParty)}
                className="w-full"
              >
                <option value="DEFENSE_ADVOCATE">Defense Advocate</option>
                <option value="POLICE_INVESTIGATION">Police Investigation / IO</option>
                <option value="PUBLIC_PROSECUTOR">Public Prosecutor</option>
                <option value="REGISTRY_DIRECT">Court Registry / Judicial Decree</option>
              </Select>
            </Field>

            <Field label="Advocate or Submitting Officer">
              <Input
                value={docSubmitter}
                onChange={(e) => setDocSubmitter(e.target.value)}
                placeholder="e.g. Adv. R. K. Anand"
              />
            </Field>

            <Field label="Page Count">
              <Input
                type="number"
                min="1"
                value={docPages}
                onChange={(e) => setDocPages(e.target.value)}
              />
            </Field>

            <Field label="File Size">
              <Input
                value={docFileSize}
                onChange={(e) => setDocFileSize(e.target.value)}
                placeholder="e.g. 1.8 MB"
              />
            </Field>
          </div>

          <Field label="Document Content / OCR Excerpt (Optional)">
            <textarea
              value={docOcrExcerpt}
              onChange={(e) => setDocOcrExcerpt(e.target.value)}
              placeholder="Paste document text or extracted arguments here..."
              rows={3}
              className="w-full rounded-2xl border border-black/10 p-3 text-xs focus:border-black focus:outline-hidden"
            />
          </Field>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-950">
            <UploadCloud className="size-5 text-emerald-600 shrink-0" />
            <span>Document will be encrypted with SHA-256 integrity hash and indexed into the Mercy Vault.</span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/10">
            <Button variant="outline" type="button" onClick={() => setIsAddDocOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FilePlus className="size-4" />
              Index Document to Case Vault
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Document Confirmation Modal */}
      {deletingDoc && (
        <Modal
          open={!!deletingDoc}
          onClose={() => setDeletingDoc(null)}
          title="Confirm Document Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete document <strong className="text-zinc-900">{deletingDoc.canonicalName}</strong> from case <strong className="text-zinc-900">{deletingDoc.caseNumber}</strong>?
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
              This will remove the file index and OCR cache from the judicial database.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setDeletingDoc(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Permanently Delete Document
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
