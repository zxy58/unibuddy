'use client'

import { useState } from 'react'
import type { Move, Contact } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getGuideAI } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'

interface Props {
  moveKey: string
  move: Move
  profile: UserProfile
  onBack: () => void
  onMarkDone: (key: string) => void
}

const categoryIcon: Record<string, string> = {
  enrollment: '🎓', financial: '💰', visa: '🛂',
  housing: '🏠', health: '🏥', academic: '📚',
}

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  enrollment: { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  financial:  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  visa:       { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
  housing:    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  health:     { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
  academic:   { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
}

// Build the school email from the profile (best-effort)
function resolveEmail(emailFormat: string, profile: UserProfile): string {
  const school = profile.schoolName?.toLowerCase().replace(/\s+/g, '') || 'yourschool'
  // Common domain mappings
  const domainMap: Record<string, string> = {
    ucla: 'ucla.edu', 'utaustin': 'utexas.edu', nyu: 'nyu.edu',
    columbia: 'columbia.edu', risd: 'risd.edu', mit: 'mit.edu',
    stanford: 'stanford.edu', caltech: 'caltech.edu',
    'universityofmichigan': 'umich.edu', uchicago: 'uchicago.edu',
  }
  const domain = domainMap[school] || `${school}.edu`
  return emailFormat.replace('[school]', domain.split('.')[0])
}

// Email draft templates per moveKey
function buildEmailDraft(
  moveKey: string,
  contact: Contact,
  profile: UserProfile
): { subject: string; body: string } {
  const name = profile.name || '[Your Name]'
  const school = profile.schoolName || '[Your School]'

  const templates: Record<string, { subject: string; body: string }> = {
    enrolldeposit: {
      subject: `Enrollment Deposit Confirmation — ${name}`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school} for the upcoming academic year. I am writing to confirm my enrollment and to ask about the deposit process.

I would like to:
  1. Confirm the deposit deadline and exact amount
  2. Verify that my portal is showing the correct status after payment
  3. Understand what unlocks next (housing, orientation, etc.)

Could you confirm that my record is in order once I complete payment? Please let me know if there are any additional steps I should take.

Thank you,
${name}
Admitted Student — ${school}
${profile.email || '[your email]'}`,
    },

    fafsa: {
      subject: `FAFSA Status Inquiry — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school}. I am writing regarding my FAFSA submission and would like to confirm:

  1. That my FAFSA has been received and linked to my account
  2. Your priority deadline for institutional grant consideration
  3. Whether I have been selected for verification (and what documents are needed)

I want to make sure I do not miss any institutional aid windows. Please let me know my current status and any action items on my end.

Thank you,
${name}
Admitted Student — ${school}
${profile.email || '[your email]'}`,
    },

    aidaccept: {
      subject: `Financial Aid Package Question — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school}. I have reviewed my financial aid award letter and have a few questions before I finalize my acceptance:

  1. Can you confirm the deadline to accept my award?
  2. I would like to understand the difference between the grants, scholarships, and loans listed — specifically which are "free money" vs. which I will need to repay.
  3. Am I required to accept the full loan amount, or can I accept a partial amount?

I want to make a careful, informed decision. Thank you for your time.

${name}
${profile.email || '[your email]'}`,
    },

    housingdeposit: {
      subject: `Housing Deposit Inquiry — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}${profile.cohorts.includes('international') ? ' (international student)' : ''}. I am writing about the on-campus housing deposit process.

I would like to confirm:
  1. The exact deadline to submit my housing deposit to maintain queue priority
  2. Whether I can apply before my${profile.cohorts.includes('international') ? ' visa is confirmed' : ' enrollment is finalized'}
  3. The cancellation policy if my plans change

Please let me know if there are any forms I need to complete alongside the deposit.

Thank you,
${name}
Incoming Student — ${school}
${profile.email || '[your email]'}`,
    },

    orientation: {
      subject: `Orientation Registration — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}${profile.cohorts.includes('international') ? ' (international student)' : profile.cohorts.includes('transfer') ? ' (transfer student)' : ''}. I am writing to confirm my orientation registration.

I have a few questions:
  1. ${profile.cohorts.includes('international') ? 'I understand there is a separate International Student Orientation — should I attend both?' : 'Which orientation session is recommended for my start date?'}
  2. Are there any pre-orientation tasks (immunization records, placement tests) I should complete first?
  3. When does course registration open relative to orientation?

Thank you for your guidance.

${name}
${profile.email || '[your email]'}`,
    },

    i20: {
      subject: `I-20 Request — ${name} — [Student ID] — Arriving [Date]`,
      body: `Dear ${contact.office},

My name is ${name}, and I have been admitted to ${school} as an F-1 student from ${profile.country || '[your country]'}. I am writing to formally request my initial I-20 document.

My information:
  • Full legal name (as on passport): ${name}
  • Student ID: [your Student ID]
  • Program: [your program and degree level]
  • Intended arrival date: [your arrival date]
  • Country of citizenship: ${profile.country || '[your country]'}

I have attached the following documents to this email:
  1. Acceptance letter
  2. Bank statement showing sufficient funds for tuition and living expenses
  3. Passport photo page

Please let me know if any additional documents are required. I need the I-20 to pay my SEVIS fee and schedule my visa interview.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    sevis: {
      subject: `SEVIS Fee Payment Issue — ${name} — SEVIS ID: [N-XXXXXXXXXX]`,
      body: `Dear ${contact.office},

My name is ${name}, an incoming F-1 student at ${school}. I am writing regarding an issue with my SEVIS fee payment.

[Describe your specific issue — e.g.:]
  • I believe I may have paid on an unofficial site. My SEVIS ID is [N-XXXXXXXXXX] and I paid on [date].
  • The fmjfee.com website is not reflecting my payment after 3 business days.
  • I need to confirm my I-901 receipt is valid before my visa interview on [date].

I would appreciate any guidance or documentation you can provide to support my case.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    visaapp: {
      subject: `F-1 Visa Application Support — ${name}`,
      body: `Dear ${contact.office},

My name is ${name}, an incoming F-1 student at ${school} from ${profile.country || '[your country]'}. I am in the process of completing my visa application and have a question.

[Describe your specific question — e.g.:]
  • I am preparing for my visa interview on [date] and want to confirm I have all required documents.
  • My visa appointment is scheduled but I have a question about my DS-160 application.
  • I received a visa denial and am seeking guidance on next steps before reapplying.

Attached: I-20 from ${school} (for context).

Thank you for your support,
${name}
${profile.email || '[your email]'}`,
    },

    healthinsurance: {
      subject: `Health Insurance Waiver Request — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming student at ${school}. I am writing to submit a health insurance waiver request, as I am currently covered under [your insurance plan / parent's plan].

My coverage details:
  • Insurance provider: [provider name]
  • Policy number: [policy number]
  • Group number: [group number]
  • Coverage period: [dates]

I have attached proof of coverage to this email. Please confirm the waiver deadline and let me know if any additional documentation is required.

Thank you,
${name}
${profile.email || '[your email]'}`,
    },

    credittransfer: {
      subject: `Transfer Credit Appeal — ${name} — [Student ID]`,
      body: `Dear ${contact.office},

My name is ${name}, and I am an incoming transfer student at ${school}. I have reviewed my official credit evaluation and would like to appeal the classification of several courses that I believe should satisfy degree requirements rather than counting as general electives.

Courses I am appealing:
  • [Course name] → should satisfy [requirement]
  • [Course name] → should satisfy [requirement]

I have attached the syllabi for each course, which demonstrate the content overlap with your equivalent requirements.

I understand that appeals must be filed within the first semester. I wanted to begin this process proactively and would welcome a brief meeting to discuss.

Thank you for your consideration,
${name}
Transfer Student — ${school}
${profile.email || '[your email]'}`,
    },
  }

  return templates[moveKey] ?? {
    subject: `Question about ${moveKey} — ${name}`,
    body: `Dear ${contact.office},\n\nMy name is ${name}, an incoming student at ${school}. I have a question about [topic].\n\nThank you,\n${name}\n${profile.email || '[your email]'}`,
  }
}

// Contact card with expandable email draft
function ContactCard({ contact, moveKey, profile, col }: {
  contact: Contact
  moveKey: string
  profile: UserProfile
  col: { bg: string; text: string; border: string }
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'subject' | 'body' | 'all' | null>(null)

  const resolvedEmail = resolveEmail(contact.emailFormat, profile)
  const draft = buildEmailDraft(moveKey, contact, profile)

  const copy = (type: 'subject' | 'body' | 'all') => {
    const text = type === 'subject' ? draft.subject
      : type === 'body' ? draft.body
      : `To: ${resolvedEmail}\nSubject: ${draft.subject}\n\n${draft.body}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div style={{ borderRadius: 12, border: `1.5px solid ${open ? col.border : 'var(--border-secondary)'}`, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      {/* Contact header */}
      <div style={{ padding: '12px 14px', background: open ? col.bg : 'white' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{contact.office}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{contact.role}</div>
            <a
              href={`mailto:${resolvedEmail}`}
              style={{ fontSize: 12, color: col.text, fontWeight: 600, fontFamily: 'monospace', marginTop: 5, display: 'block', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {resolvedEmail}
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Response: {contact.responseTime}</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 8, background: col.bg, border: `1px solid ${col.border}`, color: col.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {open ? 'Close' : '✉ Draft email'}
          </button>
        </div>

        {contact.tip && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: 11 }}>💡</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.45 }}>{contact.tip}</span>
          </div>
        )}
      </div>

      {/* Email draft — expanded */}
      {open && (
        <div style={{ borderTop: `1px solid ${col.border}`, background: '#FAFAFA' }}>
          {/* Buddy intro */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px 0' }}>
            <BuddyAvatar mood="thinking" size={30} />
            <div style={{ flex: 1, padding: '8px 11px', borderRadius: '4px 12px 12px 12px', background: '#F5F3FF', border: '1.5px solid #DDD6FE' }}>
              <div style={{ fontSize: 12, color: '#4C1D95', lineHeight: 1.5 }}>
                Here&apos;s a ready-to-send draft. Fill in the bracketed parts, then copy and send from your email.
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Subject line */}
            <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</span>
                <button
                  onClick={() => copy('subject')}
                  style={{ fontSize: 10, fontWeight: 700, color: col.text, border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, background: col.bg }}
                >
                  {copied === 'subject' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', color: '#1E293B', lineHeight: 1.5 }}>
                {draft.subject}
              </div>
            </div>

            {/* Body */}
            <div style={{ borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Body</span>
                <button
                  onClick={() => copy('body')}
                  style={{ fontSize: 10, fontWeight: 700, color: col.text, background: col.bg, border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}
                >
                  {copied === 'body' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '10px', fontSize: 11, fontFamily: 'monospace', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
                {draft.body}
              </div>
            </div>

            {/* Copy all + open mail */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => copy('all')}
                style={{ flex: 1, padding: '10px', borderRadius: 9, background: copied === 'all' ? 'linear-gradient(135deg, #059669, #047857)' : `linear-gradient(135deg, ${col.text}, ${col.text}dd)`, border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                {copied === 'all' ? '✓ Copied everything' : 'Copy full email'}
              </button>
              <a
                href={`mailto:${resolvedEmail}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
                style={{ padding: '10px 14px', borderRadius: 9, background: 'white', border: `1.5px solid ${col.border}`, color: col.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
              >
                Open in Mail ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GuideDetail({ moveKey, move, profile, onBack, onMarkDone }: Props) {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({})
  const [aiOpen, setAiOpen] = useState(false)
  const [showPeer, setShowPeer] = useState(false)

  const personalizedAI = getGuideAI(profile, moveKey)
  const col = categoryColor[move.category] || categoryColor.enrollment

  const toggleStep = (i: number) =>
    setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }))

  const checkedCount = Object.values(checkedSteps).filter(Boolean).length
  const allChecked = checkedCount === move.steps.length

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>

      {/* Sticky header */}
      <div style={{ padding: '10px 18px 14px', borderBottom: '1px solid var(--border-tertiary)', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12 }}>
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: col.bg, border: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {categoryIcon[move.category]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.2px' }}>{move.title}</div>
            {!move.done && move.daysUntil !== null && (
              <div style={{ fontSize: 11, color: move.daysUntil <= 7 ? '#DC2626' : '#EA580C', fontWeight: 700, marginTop: 3 }}>
                {move.daysUntil === 0 ? 'Due today' : `${move.daysUntil} days left`}
              </div>
            )}
            {move.done && <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 3 }}>Completed ✓</div>}
          </div>
        </div>

        {!move.done && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Steps</span>
              <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>{checkedCount} / {move.steps.length}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#E9E4FF', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: '#7C3AED', width: `${(checkedCount / move.steps.length) * 100}%`, transition: 'width 0.25s ease' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Consequence */}
        {!move.done && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>⚠</span>
            <span style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.4 }}>If missed: <strong>{move.consequence}</strong></span>
          </div>
        )}

        {/* Gather chips */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Have ready</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {move.gather.map((item, i) => (
              <div key={i} style={{ padding: '5px 11px', borderRadius: 20, background: col.bg, border: `1px solid ${col.border}`, fontSize: 12, fontWeight: 500, color: col.text }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Steps</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {move.steps.map((step, i) => {
              const checked = !!checkedSteps[i]
              return (
                <div key={i} style={{ borderRadius: 12, border: `1px solid ${checked ? '#D1FAE5' : 'var(--border-secondary)'}`, background: checked ? '#F0FDF4' : 'white', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 12px' }}>
                    <button
                      onClick={() => toggleStep(i)}
                      style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? '#10B981' : col.border}`, background: checked ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
                    >
                      {checked && <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: col.text, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)', lineHeight: 1.4, textDecoration: checked ? 'line-through' : 'none' }}>
                          {step.action}
                        </span>
                      </div>
                      {step.detail && !checked && (
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 3, marginLeft: 16, lineHeight: 1.4 }}>{step.detail}</div>
                      )}
                    </div>
                  </div>
                  {step.link && !checked && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: col.bg, borderTop: `1px solid ${col.border}`, textDecoration: 'none' }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>🔗 {step.link.label}</span>
                      <span style={{ fontSize: 12, color: col.text }}>↗</span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* If wrong */}
        <div style={{ padding: '11px 13px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🔧</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>If something goes wrong</div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{move.ifWrong}</div>
          </div>
        </div>

        {/* Contacts + email generation */}
        {move.contacts && move.contacts.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
              Who to contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {move.contacts.map((contact, i) => (
                <ContactCard key={i} contact={contact} moveKey={moveKey} profile={profile} col={col} />
              ))}
            </div>
          </div>
        )}

        {/* Peer insight */}
        <button
          onClick={() => setShowPeer(p => !p)}
          style={{ width: '100%', textAlign: 'left', padding: '11px 13px', borderRadius: 12, background: col.bg, border: `1px solid ${col.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>💬 From a peer</span>
            <span style={{ fontSize: 12, color: col.text }}>{showPeer ? '▲' : '▼'}</span>
          </div>
          {showPeer && (
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55, fontStyle: 'italic', marginTop: 8 }}>{move.peerInsight}</div>
          )}
        </button>

        {/* Ask UniBuddy AI */}
        <button
          onClick={() => setAiOpen(o => !o)}
          style={{ width: '100%', textAlign: 'left', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #7C3AED', cursor: 'pointer', background: 'none' }}
        >
          <div style={{ padding: '11px 13px', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>✦ Ask UniBuddy</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{aiOpen ? '▲' : '▼'}</span>
          </div>
          {aiOpen && (
            <div style={{ padding: '12px 13px', background: '#F5F3FF' }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, textAlign: 'left' }}>
                {personalizedAI || move.ai}
              </div>
            </div>
          )}
        </button>

        {/* Mark done */}
        {!move.done && (
          <button
            onClick={() => onMarkDone(moveKey)}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              background: allChecked
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px',
              transition: 'background 0.3s ease',
            }}
          >
            {allChecked ? 'All steps done — Mark complete ✓' : 'Mark as done ✓'}
          </button>
        )}

      </div>
    </div>
  )
}
