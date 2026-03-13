'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'human-ai-thinking-log-v1'

const SCENARIO =
  'You work part-time at a bubble tea shop. Yesterday during a busy Saturday rush, you got into an argument with your coworker Jamie because he kept taking orders without telling you and you were double-making drinks you already had. You told him he needed to communicate better and he snapped back at you in front of three customers who were waiting. You snapped back too. Your manager Diana saw the last part of it from across the counter. She didn\'t say anything in the moment but gave you a look. The shift ended awkwardly and nobody talked about it. You know you need to bring it up with Diana before your next shift on Thursday but you don\'t know how to start that conversation or what to say.'

const STARTER_PROMPT =
  'I got into an argument with my coworker in front of customers at my part-time job and my manager saw it happen. I know I need to talk to my manager before my next shift but I don\'t know how to bring it up or what to say. What should I do?'

interface LogData {
  preReflection: string
  c1AiSummary: string
  c1Pushback: string
  c1V2Prompt: string
  c1WhatChanged: string
  c1Reflect: string
  c2V2Carried: string
  c2Constraint1: string
  c2Constraint2: string
  c2Constraint3: string
  c2V3Prompt: string
  c2HowChanged: string
  c2V1Response: string
  c2V2Response: string
  c2V3Response: string
  c2Reflect: string
  c3V3Carried: string
  c3V4Prompt: string
  c3S1Summary: string
  c3S1Fit: string
  c3S1Decision: string
  c3S2Summary: string
  c3S2Fit: string
  c3S2Decision: string
  c3S3Summary: string
  c3S3Fit: string
  c3S3Decision: string
  c3Rationale: string
  c3Reflect: string
  tlInstinct: string
  tlChanged: string
  tlMine: string
  tlBestPushback: string
  tlBestConstraint: string
  tlAiUseful: string
  tlAiNotUseful: string
  tlSynthesis: string
}

const empty: LogData = {
  preReflection: '', c1AiSummary: '', c1Pushback: '', c1V2Prompt: '',
  c1WhatChanged: '', c1Reflect: '', c2V2Carried: '', c2Constraint1: '',
  c2Constraint2: '', c2Constraint3: '', c2V3Prompt: '', c2HowChanged: '',
  c2V1Response: '', c2V2Response: '', c2V3Response: '', c2Reflect: '',
  c3V3Carried: '', c3V4Prompt: '', c3S1Summary: '', c3S1Fit: '', c3S1Decision: '',
  c3S2Summary: '', c3S2Fit: '', c3S2Decision: '', c3S3Summary: '', c3S3Fit: '',
  c3S3Decision: '', c3Rationale: '', c3Reflect: '', tlInstinct: '', tlChanged: '',
  tlMine: '', tlBestPushback: '', tlBestConstraint: '', tlAiUseful: '',
  tlAiNotUseful: '', tlSynthesis: '',
}

function Field({
  value,
  onChange,
  placeholder,
  rows = 3,
  accent = 'gray',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  accent?: 'teal' | 'violet' | 'rose' | 'amber' | 'gray'
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  const ringClass: Record<string, string> = {
    teal: 'focus:ring-teal-400 border-teal-100',
    violet: 'focus:ring-violet-400 border-violet-100',
    rose: 'focus:ring-rose-400 border-rose-100',
    amber: 'focus:ring-amber-400 border-amber-100',
    gray: 'focus:ring-gray-300 border-gray-200',
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm leading-relaxed text-gray-800 bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-colors print:border-gray-300 ${ringClass[accent]}`}
      style={{ overflow: 'hidden' }}
    />
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-full ${color}`}>
      {label}
    </span>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-0.5 mb-3 leading-relaxed">{children}</p>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{children}</p>
}

function CarryForward({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl px-5 py-3 text-sm text-white font-medium ${color} print:hidden`}>
      <span className="font-bold">→ Carry Forward: </span>
      {children}
    </div>
  )
}

export default function ThinkingLog() {
  const [data, setData] = useState<LogData>(empty)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setData(JSON.parse(raw))
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSaved(true)
      const t = setTimeout(() => setSaved(false), 1800)
      return () => clearTimeout(t)
    } catch {
      // ignore storage errors
    }
  }, [data])

  const set = useCallback(
    (field: keyof LogData) => (value: string) =>
      setData((p) => ({ ...p, [field]: value })),
    []
  )

  const copyPrompt = () => {
    navigator.clipboard.writeText(STARTER_PROMPT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const clearAll = () => {
    if (confirm('Clear all your responses? This cannot be undone.')) {
      setData(empty)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const navLinks = [
    ['#scenario', 'Scenario'],
    ['#c1', 'C1: Push Back'],
    ['#c2', 'C2: Constraints'],
    ['#c3', 'C3: Strategies'],
    ['#log', 'Thinking Log'],
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 antialiased">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm print:static print:shadow-none">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-teal-700 leading-none">HUMAN × AI</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Collaboration Curriculum</p>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            {saved && <span className="text-[11px] text-teal-500 font-medium">✓ Saved</span>}
            <button
              onClick={() => window.print()}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-md transition hover:border-gray-300"
            >
              Print / Export PDF
            </button>
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition">
              Clear
            </button>
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-5 pb-2 flex gap-1 overflow-x-auto print:hidden">
          {navLinks.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 space-y-14 print:py-4 print:space-y-8">

        {/* Title */}
        <div className="text-center space-y-1.5 pt-2 print:pt-0">
          <h1 className="text-3xl font-bold tracking-tight">HUMAN × AI</h1>
          <p className="text-base text-gray-500">Collaboration Curriculum — Thinking Log</p>
          <div className="flex justify-center gap-3 text-[11px] text-gray-400 pt-1">
            <span>Workplace Communication</span>
            <span>·</span>
            <span>High School (Grades 9–12)</span>
            <span>·</span>
            <span>One Scenario, Three Components</span>
          </div>
        </div>

        {/* ── SCENARIO ── */}
        <section id="scenario">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="bg-gray-900 text-white px-5 py-4">
              <h2 className="text-sm font-bold uppercase tracking-widest">The Scenario</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Read carefully — this is the situation you will work with across all three components
              </p>
            </div>
            <div className="bg-white px-5 py-5 space-y-3">
              <p className="text-sm leading-relaxed text-gray-700">{SCENARIO}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] pt-1">
                <span className="text-gray-400">
                  People: <span className="text-gray-600">You · Jamie (coworker) · Diana (manager)</span>
                </span>
                <span className="text-gray-400">
                  Setting: <span className="text-gray-600">Bubble tea shop, Saturday rush</span>
                </span>
                <span className="text-amber-600 font-semibold">Deadline: Before Thursday&apos;s shift</span>
              </div>
            </div>
            <div className="border-t border-amber-100 bg-amber-50 px-5 py-4">
              <FieldLabel>Pre-Exercise Reflection</FieldLabel>
              <Hint>
                Before you open any AI tool — what do you think you should do? Write your instinct here.
                You will come back to this at the end.
              </Hint>
              <Field
                value={data.preReflection}
                onChange={set('preReflection')}
                placeholder="Write your initial instinct here..."
                rows={4}
                accent="amber"
              />
            </div>
          </div>
        </section>

        {/* ── COMPONENT 1 ── */}
        <section id="c1" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge label="C1" color="bg-teal-600" />
            <h2 className="text-xl font-bold">Push Back on AI</h2>
            <span className="text-sm text-gray-400">Notice what it missed</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            AI has never worked at a bubble tea shop. It doesn&apos;t know Diana, it doesn&apos;t know
            what really happened with Jamie, and it doesn&apos;t know what kind of person you are. Your
            job in this component is to find where AI&apos;s advice falls short — and say so.
          </p>

          <div className="rounded-xl bg-teal-50 border border-teal-200 px-5 py-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Step 1 — Starter Prompt
              </p>
              <p className="text-xs text-teal-700 mt-1">
                Everyone starts with the same prompt. Copy it into your AI tool and submit without changing anything.
              </p>
            </div>
            <div className="bg-white border border-teal-200 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-700 italic leading-relaxed">&quot;{STARTER_PROMPT}&quot;</p>
            </div>
            <button
              onClick={copyPrompt}
              className="text-xs text-teal-700 hover:text-teal-900 border border-teal-300 bg-white px-3 py-1.5 rounded-md transition print:hidden"
            >
              {copied ? '✓ Copied!' : 'Copy prompt'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            <div className="px-5 py-5 space-y-2">
              <FieldLabel>Step 2 — Record What AI Said</FieldLabel>
              <Hint>
                Summarize AI&apos;s response in your own words: What did it tell you to do? What tone did
                it take? What assumptions did it make?
              </Hint>
              <Field
                value={data.c1AiSummary}
                onChange={set('c1AiSummary')}
                placeholder="AI told me to... It assumed... The tone was..."
                rows={4}
                accent="teal"
              />
            </div>

            <div className="px-5 py-5 space-y-2">
              <FieldLabel>Step 3 — Your Pushback</FieldLabel>
              <Hint>
                Find at least one specific place where AI&apos;s advice doesn&apos;t fit your actual situation.
                Not just &quot;that&apos;s not right&quot; — explain <em>why</em>. E.g. &quot;AI said to apologize
                immediately but it didn&apos;t account for the fact that I wasn&apos;t the only one who snapped...&quot;
              </Hint>
              <Field
                value={data.c1Pushback}
                onChange={set('c1Pushback')}
                placeholder="What AI missed or got wrong — specific to Jamie, Diana, or the Saturday rush..."
                rows={5}
                accent="teal"
              />
            </div>

            <div className="px-5 py-5 space-y-2 bg-teal-50/40">
              <FieldLabel>
                <span className="text-teal-700">V2 — My Revised Prompt</span>
              </FieldLabel>
              <Hint>
                Add your pushback to the starter prompt as one or two sentences. Write the full revised
                version here, then submit it to AI.
              </Hint>
              <Field
                value={data.c1V2Prompt}
                onChange={set('c1V2Prompt')}
                placeholder="Starter prompt + your pushback added at the end..."
                rows={5}
                accent="teal"
              />
            </div>

            <div className="px-5 py-5 space-y-2">
              <FieldLabel>What changed in AI&apos;s response after your pushback?</FieldLabel>
              <Hint>Did it become more useful? More specific? Did anything frustratingly stay the same?</Hint>
              <Field
                value={data.c1WhatChanged}
                onChange={set('c1WhatChanged')}
                placeholder="After my pushback, AI..."
                rows={3}
                accent="teal"
              />
            </div>

            <div className="px-5 py-5 space-y-2 bg-slate-50">
              <FieldLabel>Reflect</FieldLabel>
              <Hint>
                What did writing your pushback reveal about what you actually think happened? Did
                identifying what AI missed help you understand your own position better?
              </Hint>
              <Field
                value={data.c1Reflect}
                onChange={set('c1Reflect')}
                placeholder="Writing my pushback made me realize..."
                rows={3}
              />
            </div>
          </div>

          <CarryForward color="bg-teal-600">
            Take your V2 prompt into Component 2.
          </CarryForward>
        </section>

        {/* ── COMPONENT 2 ── */}
        <section id="c2" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge label="C2" color="bg-violet-600" />
            <h2 className="text-xl font-bold">Specificity and Constraints</h2>
            <span className="text-sm text-gray-400">Bring in what you know</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your V2 prompt already pushes back on what AI got wrong. Now you make it specific. The more
            personal detail you give, the more useful AI&apos;s response becomes — because it stops giving
            advice for everyone and starts giving advice for you.
          </p>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            <div className="px-5 py-5 space-y-2">
              <FieldLabel>Step 1 — Your V2 Prompt (carried from C1)</FieldLabel>
              <Hint>Copy your revised prompt from Component 1 here before continuing.</Hint>
              <Field
                value={data.c2V2Carried}
                onChange={set('c2V2Carried')}
                placeholder="Paste your V2 prompt here..."
                rows={4}
                accent="violet"
              />
            </div>

            <div className="px-5 py-5 space-y-3">
              <FieldLabel>Step 2 — Add at Least 3 Personal Constraints</FieldLabel>
              <div className="rounded-lg bg-violet-50 border border-violet-100 px-4 py-3 text-xs text-violet-800 space-y-1.5 leading-relaxed">
                <p>
                  <span className="font-semibold">About you: </span>
                  Are you someone who avoids conflict or faces it head-on? Do you get defensive when
                  criticized? How long have you worked there?
                </p>
                <p>
                  <span className="font-semibold">About Diana: </span>
                  Is she strict or understanding? Have you had a good relationship with her before?
                  Does she tend to bring things up or let them go?
                </p>
                <p>
                  <span className="font-semibold">About the situation: </span>
                  Do you think Jamie was more at fault? Has anything like this happened before?
                  Were the customers visibly upset?
                </p>
              </div>
              <div className="space-y-3">
                {(
                  [
                    ['c2Constraint1', 'Constraint 1'],
                    ['c2Constraint2', 'Constraint 2'],
                    ['c2Constraint3', 'Constraint 3'],
                  ] as [keyof LogData, string][]
                ).map(([field, label]) => (
                  <div key={field} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-violet-600 shrink-0 w-24 pt-2.5">{label}</span>
                    <Field
                      value={data[field]}
                      onChange={set(field)}
                      placeholder="A specific detail about you, Diana, or the situation..."
                      rows={2}
                      accent="violet"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-5 space-y-2 bg-violet-50/40">
              <FieldLabel>
                <span className="text-violet-700">V3 — My Constrained Prompt</span>
              </FieldLabel>
              <Hint>
                Take your V2 prompt and add all three constraints. This is your V3 prompt. Submit it to AI.
              </Hint>
              <Field
                value={data.c2V3Prompt}
                onChange={set('c2V3Prompt')}
                placeholder="V2 prompt + all 3 constraints added..."
                rows={5}
                accent="violet"
              />
            </div>

            <div className="px-5 py-5 space-y-2">
              <FieldLabel>How did AI&apos;s response change with your constraints?</FieldLabel>
              <Hint>What became more specific, more relevant, or more tailored to your actual situation?</Hint>
              <Field
                value={data.c2HowChanged}
                onChange={set('c2HowChanged')}
                placeholder="With my constraints, AI became more..."
                rows={3}
                accent="violet"
              />
            </div>

            <div className="px-5 py-5 space-y-3">
              <FieldLabel>Step 4 — Compare V1, V2, and V3 Responses</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    ['c2V1Response', 'V1 (starter) response'],
                    ['c2V2Response', 'V2 (with pushback) response'],
                    ['c2V3Response', 'V3 (with constraints) response'],
                  ] as [keyof LogData, string][]
                ).map(([field, label]) => (
                  <div key={field}>
                    <p className="text-[11px] text-gray-500 mb-1.5">{label}</p>
                    <Field
                      value={data[field]}
                      onChange={set(field)}
                      placeholder="Summarize..."
                      rows={4}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-5 space-y-2 bg-slate-50">
              <FieldLabel>Reflect</FieldLabel>
              <Hint>
                What did you have to know about yourself to write your constraints? Was there anything
                about your situation AI still couldn&apos;t fully understand, even with all three
                constraints added?
              </Hint>
              <Field
                value={data.c2Reflect}
                onChange={set('c2Reflect')}
                placeholder="To write my constraints I had to know..."
                rows={3}
              />
            </div>
          </div>

          <CarryForward color="bg-violet-600">
            Take your V3 prompt into Component 3.
          </CarryForward>
        </section>

        {/* ── COMPONENT 3 ── */}
        <section id="c3" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge label="C3" color="bg-rose-600" />
            <h2 className="text-xl font-bold">Strategies, Not Solutions</h2>
            <span className="text-sm text-gray-400">You make the decision</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your V3 prompt is specific and personal. Now you change one thing: instead of asking AI{' '}
            <em>what to do</em>, you ask it to give you multiple strategies to evaluate. This keeps
            the decision yours. AI expands your options; you choose.
          </p>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            <div className="px-5 py-5 space-y-2">
              <FieldLabel>Step 1 — Your V3 Prompt (carried from C2)</FieldLabel>
              <Hint>Copy your constrained prompt from Component 2 here before continuing.</Hint>
              <Field
                value={data.c3V3Carried}
                onChange={set('c3V3Carried')}
                placeholder="Paste your V3 prompt here..."
                rows={4}
                accent="rose"
              />
            </div>

            <div className="px-5 py-5 space-y-3">
              <FieldLabel>Step 2 — Reframe the Ending</FieldLabel>
              <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-xs text-rose-800 space-y-2">
                <p className="font-semibold">
                  Change the ending of your V3 prompt to ask for strategies instead of a solution:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 italic mb-1">Instead of asking...</p>
                    <p className="mb-1">&quot;What should I say to Diana?&quot;</p>
                    <p>&quot;How do I fix this?&quot;</p>
                  </div>
                  <div>
                    <p className="text-rose-700 font-semibold mb-1">Try asking...</p>
                    <p>
                      &quot;Don&apos;t tell me what to say — give me 3 different strategies for approaching
                      this conversation, each with a different level of directness. I&apos;ll decide
                      which one fits me.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-5 space-y-2 bg-rose-50/40">
              <FieldLabel>
                <span className="text-rose-700">V4 — My Final Prompt</span>
              </FieldLabel>
              <Hint>
                Keep everything from V3 but change the ending to ask for strategies you can evaluate.
              </Hint>
              <Field
                value={data.c3V4Prompt}
                onChange={set('c3V4Prompt')}
                placeholder="V3 prompt + reframed ending asking for strategies..."
                rows={5}
                accent="rose"
              />
            </div>

            <div className="px-5 py-5 space-y-3">
              <FieldLabel>Step 3 — Evaluate Each Strategy</FieldLabel>
              <Hint>
                Submit your V4 prompt. For each strategy AI gives you, evaluate whether it fits your
                personality, your relationship with Diana, and your actual situation.
              </Hint>
              {(
                [
                  ['c3S1Summary', 'c3S1Fit', 'c3S1Decision', 'Strategy 1'],
                  ['c3S2Summary', 'c3S2Fit', 'c3S2Decision', 'Strategy 2'],
                  ['c3S3Summary', 'c3S3Fit', 'c3S3Decision', 'Strategy 3'],
                ] as [keyof LogData, keyof LogData, keyof LogData, string][]
              ).map(([s, f, d, label]) => (
                <div key={label} className="rounded-lg border border-gray-100 overflow-hidden">
                  <div className="bg-rose-600 text-white text-xs font-bold px-4 py-2">{label}</div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Summarize the strategy</p>
                      <Field value={data[s]} onChange={set(s)} placeholder="AI suggested..." rows={2} accent="rose" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">What fits / what doesn&apos;t fit for me</p>
                      <Field
                        value={data[f]}
                        onChange={set(f)}
                        placeholder="This fits because... but it doesn't work because..."
                        rows={2}
                        accent="rose"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Keep / Reject / Modify — and why</p>
                      <Field
                        value={data[d]}
                        onChange={set(d)}
                        placeholder="I'm going to keep/reject/modify this because..."
                        rows={2}
                        accent="rose"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-5 space-y-2">
              <FieldLabel>Step 4 — Your Rationale</FieldLabel>
              <Hint>
                This is the most important step. In your own words: what are you actually going to do, and
                why? Reference the strategies but make clear the decision and reasoning are yours — your
                personality, your relationship with Diana, your read on what happened with Jamie.
              </Hint>
              <Field
                value={data.c3Rationale}
                onChange={set('c3Rationale')}
                placeholder="What I am going to do and why, in my own voice..."
                rows={7}
                accent="rose"
              />
            </div>

            <div className="px-5 py-5 space-y-2 bg-slate-50">
              <FieldLabel>Reflect</FieldLabel>
              <Hint>
                Compare your rationale to V1 — AI&apos;s first response to the generic starter prompt.
                What is different? What did the three-component process surface that a single AI query
                never would have?
              </Hint>
              <Field
                value={data.c3Reflect}
                onChange={set('c3Reflect')}
                placeholder="Compared to V1, my final thinking is..."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* ── THINKING LOG ── */}
        <section id="log" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge label="LOG" color="bg-gray-900" />
            <h2 className="text-xl font-bold">Thinking Log</h2>
            <span className="text-sm text-gray-400">A record of your thinking across the full exercise</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Complete this after all three components. Be honest. This is graded on the quality and
            specificity of your reflection, not on whether your decisions were correct.
          </p>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {(
              [
                [
                  'tlInstinct',
                  'Before the exercise, my instinct was...',
                  'What did you write in the pre-exercise reflection? Did you think you knew what to do?',
                ],
                [
                  'tlChanged',
                  'By the end of the exercise, my thinking had...',
                  'What changed? What was reinforced? What surprised you about your own reasoning?',
                ],
                [
                  'tlMine',
                  'The ideas that are genuinely mine are...',
                  "What in your final rationale came from your own values, experience, or read of the situation — not from AI?",
                ],
                [
                  'tlBestPushback',
                  'The most useful pushback I gave AI was...',
                  "Which specific thing you pushed back on most changed the quality of AI's response?",
                ],
                [
                  'tlBestConstraint',
                  'The constraint that changed the advice most was...',
                  "Which personal detail shifted AI's response most significantly? Why do you think that detail mattered?",
                ],
                [
                  'tlAiUseful',
                  'AI was most useful when...',
                  'What did it give you that genuinely helped — not just produced output?',
                ],
                [
                  'tlAiNotUseful',
                  'AI was least useful when...',
                  'Where did it stay generic, miss the point, or give advice that could apply to anyone in any workplace?',
                ],
              ] as [keyof LogData, string, string][]
            ).map(([field, label, hint]) => (
              <div key={field} className="px-5 py-5 space-y-2">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <Hint>{hint}</Hint>
                <Field
                  value={data[field]}
                  onChange={set(field)}
                  placeholder="Write your reflection here..."
                  rows={3}
                />
              </div>
            ))}

            <div className="px-5 py-6 space-y-2 bg-gray-50">
              <p className="text-sm font-bold text-gray-900">Final Synthesis</p>
              <Hint>
                Look at your four prompts side by side: V1 (starter), V2 (with pushback), V3 (with
                constraints), V4 (asking for strategies). In 3–4 sentences, describe what changed across
                those four versions and what that change tells you about the difference between{' '}
                <em>using</em> AI and <em>thinking with</em> AI.
              </Hint>
              <Field
                value={data.tlSynthesis}
                onChange={set('tlSynthesis')}
                placeholder="Across V1 through V4, what changed was..."
                rows={6}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pb-8 print:hidden space-y-1">
          <p>Your responses are saved automatically in your browser.</p>
          <p>
            Use <strong>Print / Export PDF</strong> to save or submit a copy.
          </p>
        </footer>

      </main>
    </div>
  )
}
