import { useState } from 'react'
import { CalendarDays, Languages } from 'lucide-react'
import { Button, Card, cn, Field, Input, PageHeader, StatusChip, useApp } from '../ui'

const L = {
  English: {
    title: 'Check Your Case Status',
    num: 'Case Number',
    otp: 'Verification OTP',
    go: 'View Official Status',
    stage: 'Current Trial Stage',
    next: 'Next Hearing Date',
    exp: 'Plain Language Explanation',
    text: 'Your case is currently listed for witness examination. The court has scheduled the hearing date shown above. You do not need to appear unless instructed by your counsel on record.',
    stageV: 'Witness Examination Stage',
  },
  தமிழ்: {
    title: 'உங்கள் வழக்கு நிலையை சரிபார்க்கவும்',
    num: 'வழக்கு எண்',
    otp: 'OTP குறியீடு',
    go: 'நிலையைக் காண்க',
    stage: 'தற்போதைய நிலை',
    next: 'அடுத்த விசாரணைத் தேதி',
    exp: 'இதன் பொருள்',
    text: 'உங்கள் வழக்கில் சாட்சிகளை விசாரிக்க நீதிமன்றம் திட்டமிட்டுள்ளது. அடுத்த தேதி மேலே குறிப்பிடப்பட்டுள்ளது. உங்கள் வழக்கறிஞர் கேட்டால் மட்டுமே நீங்கள் நீதிமன்றத்திற்கு வர வேண்டும்.',
    stageV: 'சாட்சியங்கள் விசாரணை நிலை',
  },
  हिन्दी: {
    title: 'अपने मामले की वर्तमान स्थिति देखें',
    num: 'केस नंबर',
    otp: 'ओटीपी (OTP)',
    go: 'स्थिति देखें',
    stage: 'वर्तमान चरण',
    next: 'अगली सुनवाई की तारीख',
    exp: 'सरल भाषा में व्याख्या',
    text: 'आपका मामला वर्तमान में गवाहों की गवाही के लिए सूचीबद्ध है। अदालत ने अगली तारीख तय की है। जब तक आपके वकील द्वारा सूचित न किया जाए, आपको उपस्थित होने की आवश्यकता नहीं है।',
    stageV: 'गवाही एवं साक्ष्य चरण',
  },
}
type Lang = keyof typeof L

export default function Public() {
  const [lang, setLang] = useState<Lang>('English')
  const [num, setNum] = useState('S.C. 77/2025')
  const [otp, setOtp] = useState('')
  const [shown, setShown] = useState(false)
  const [err, setErr] = useState('')
  const { toast } = useApp()
  const t = L[lang]

  return (
    <>
      <PageHeader
        title="Citizen Public Portal Preview"
        sub="Citizen-facing interface. Judge observations, internal notes, and sensitive party names are filtered out."
      />

      <div className="mx-auto max-w-lg">
        <div
          className="mb-4 flex items-center justify-end gap-1"
          role="group"
          aria-label="Portal Language"
        >
          <Languages className="mr-1.5 size-3.5 text-muted-foreground" />
          {(Object.keys(L) as Lang[]).map((l) => (
            <Button
              key={l}
              size="sm"
              variant={lang === l ? 'primary' : 'outline'}
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
            >
              {l}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="mb-4 font-serif text-lg font-semibold text-foreground tracking-tight">
            {t.title}
          </h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!num.trim() || otp.length < 4)
                return setErr('Enter a valid case number and the OTP sent to your phone.')
              setErr('')
              setShown(true)
              toast('Citizen case status loaded', 'info')
            }}
          >
            <Field label={t.num}>
              <Input
                value={num}
                onChange={(e) => setNum(e.target.value)}
                placeholder="e.g. S.C. 77/2025"
              />
            </Field>

            <Field label={t.otp} hint="Demo verification: any 4+ digits accepted">
              <Input
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                placeholder="1234"
              />
            </Field>

            {err && (
              <p role="alert" className="text-xs text-bad">
                {err}
              </p>
            )}

            <Button type="submit" className="w-full">
              {t.go}
            </Button>
          </form>
        </Card>

        {shown && (
          <Card className={cn('slidein mt-4 p-6')}>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="font-mono text-xs font-semibold text-accent">{num}</span>
              <StatusChip s="ontrack" />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  {t.stage}
                </dt>
                <dd className="mt-1 font-serif text-sm font-semibold text-foreground">
                  {t.stageV}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  {t.next}
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-serif text-sm font-semibold text-foreground">
                  <CalendarDays className="size-3.5 text-accent" /> 23 Oct 2026
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-lg border border-border bg-[#10131a] p-4 text-xs leading-relaxed text-muted-foreground">
              <div className="mb-1 font-semibold text-foreground font-serif">{t.exp}</div>
              <p>{t.text}</p>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
