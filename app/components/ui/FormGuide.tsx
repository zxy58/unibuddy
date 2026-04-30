'use client'

import { useState } from 'react'
import type { UserProfile } from '@/app/lib/profile'
import BuddyAvatar from './BuddyAvatar'

interface FormField {
  label: string
  hint: string
  type: 'text' | 'email' | 'select' | 'readonly'
  placeholder?: string
  options?: string[]
  prefill?: string
  required?: boolean
}

interface FormConfig {
  title: string
  description: string
  outputLabel: string
  fields: FormField[]
  buildOutput: (values: string[], profile: UserProfile) => string
}

const formConfigs: Record<string, (profile: UserProfile) => FormConfig> = {
  i20: (profile) => ({
    title: 'I-20 Request Email',
    description: 'I\'ll help you write the exact email to send to your school\'s International Students Office.',
    outputLabel: 'Your completed email — copy and send',
    fields: [
      {
        label: 'Your full legal name (as on passport)',
        hint: 'This must match your passport exactly.',
        type: 'text',
        placeholder: 'e.g. Amara Okafor',
        prefill: profile.name,
        required: true,
      },
      {
        label: 'Student ID',
        hint: 'Find this in your admission letter or student portal.',
        type: 'text',
        placeholder: 'e.g. 123456789',
        required: true,
      },
      {
        label: 'Your program / major',
        hint: 'Exactly as listed in your admission letter.',
        type: 'text',
        placeholder: 'e.g. Computer Science, Bachelor\'s',
        required: true,
      },
      {
        label: 'Intended U.S. arrival date',
        hint: 'You can arrive up to 30 days before your program start date.',
        type: 'text',
        placeholder: 'e.g. August 15, 2025',
        required: true,
      },
      {
        label: 'School & department to contact',
        hint: 'Your school\'s International Students Office (ISS/DSO).',
        type: 'readonly',
        prefill: `${profile.schoolName || 'Your school'} — International Students Office`,
      },
    ],
    buildOutput: (values, p) => {
      const [name, studentId, program, arrivalDate] = values
      return `Subject: I-20 Request — ${name || '[Your Name]'} — ${studentId || '[Student ID]'} — Arriving ${arrivalDate || '[Date]'}

Dear International Students Office,

My name is ${name || '[Your Name]'}, and I have been admitted to ${p.schoolName || 'your institution'} for the ${program || '[program]'} program.

I am writing to request my initial I-20 document. My details are as follows:

  • Full legal name (as on passport): ${name || '[Your Name]'}
  • Student ID: ${studentId || '[Student ID]'}
  • Program: ${program || '[Program Name]'}
  • Intended arrival date: ${arrivalDate || '[Date]'}
  • Country of citizenship: ${p.country || '[Country]'}

I understand I need the I-20 to pay my SEVIS fee and schedule my visa interview. Please let me know if you need any additional documents.

Thank you for your time.

Best regards,
${name || '[Your Name]'}
${studentId ? `Student ID: ${studentId}` : ''}
Email: ${p.email || '[your email]'}`
    },
  }),

  fafsa: (profile) => ({
    title: 'FAFSA Field Guide',
    description: 'I\'ll walk you through the sections that trip most students up. Have your tax returns ready.',
    outputLabel: 'Your FAFSA checklist — save this',
    fields: [
      {
        label: 'Tax filing status (your parents\' or yours if independent)',
        hint: 'Use the IRS Data Retrieval Tool if available — it auto-fills tax data.',
        type: 'select',
        options: ['Filed taxes — will use IRS tool', 'Filed taxes — will enter manually', 'Did not file / not required to file'],
        required: true,
      },
      {
        label: 'Dependency status',
        hint: 'Most undergrads are "dependent" — meaning your parents\' income is counted.',
        type: 'select',
        options: ['Dependent (under 24, unmarried, not a veteran)', 'Independent'],
        required: true,
      },
      {
        label: `School code for ${profile.schoolName || 'your school'}`,
        hint: 'You must add your school to your FAFSA for them to receive it.',
        type: 'readonly',
        prefill: profile.schoolName
          ? `Search "${profile.schoolName}" at studentaid.gov/fafsa when adding schools`
          : 'Search your school name at studentaid.gov/fafsa when adding schools',
      },
      {
        label: 'Do you have an FSA ID?',
        hint: 'Your FSA ID is your login. Create it at studentaid.gov — it takes 1–3 days to verify.',
        type: 'select',
        options: ['Yes, I have an FSA ID', 'No — I need to create one first'],
        required: true,
      },
    ],
    buildOutput: (values) => {
      const [taxStatus, depStatus, , fsaStatus] = values
      const needsFSA = fsaStatus?.includes('No')
      return `FAFSA Preparation Checklist for ${profile.name}
━━━━━━━━━━━━━━━━━━━━━━━━
${needsFSA ? '⚠ FIRST: Create your FSA ID at studentaid.gov\n   (Takes 1–3 days to verify — do this today)\n' : '✓ FSA ID: Ready\n'}
Tax approach: ${taxStatus || 'Not set'}
Dependency: ${depStatus || 'Not set'}
School: ${profile.schoolName || 'Add your school code'}

HAVE READY:
  □ Your (and parent's) Social Security Number
  □ Your driver's license (if you have one)
  □ 2023 federal tax return (or parents')
  □ Records of untaxed income
  □ Bank statements and investment records

SCHOOL DEADLINES:
  ⚠ Your school's PRIORITY deadline matters more
    than the federal June 30 deadline.
  → Check ${profile.schoolName || 'your school'}'s financial aid page now.

After submitting: Watch for a Student Aid Report (SAR)
in your email within 3–5 days.`
    },
  }),

  enrolldeposit: (profile) => ({
    title: 'Enrollment Deposit Walkthrough',
    description: 'Let me make sure you have everything before you log in. This takes 5 minutes.',
    outputLabel: 'Your confirmation checklist',
    fields: [
      {
        label: 'Portal login confirmed?',
        hint: 'Log into your admitted student portal — not the general school website.',
        type: 'select',
        options: ['Yes — I can log in', 'I\'m having trouble logging in'],
        required: true,
      },
      {
        label: 'Deposit amount',
        hint: 'This varies by school. Check your admission letter.',
        type: 'text',
        placeholder: 'e.g. $250 or $500',
        required: true,
      },
      {
        label: 'Payment method',
        hint: 'Most schools accept credit card (may have a fee) and e-check (free).',
        type: 'select',
        options: ['Credit / debit card', 'E-check (bank transfer — usually free)', 'Not sure yet'],
        required: true,
      },
      {
        label: 'Your confirmation number (after paying)',
        hint: 'Screenshot this page. You\'ll need it if something goes wrong.',
        type: 'text',
        placeholder: 'Enter after you pay',
        required: false,
      },
    ],
    buildOutput: (values, p) => {
      const [loginStatus, amount, payment, confirmation] = values
      return `Enrollment Deposit Record — ${p.name}
School: ${p.schoolName || 'Your school'}
━━━━━━━━━━━━━━━━━━━
Portal access: ${loginStatus || 'Not confirmed'}
Deposit amount: ${amount || 'Unknown'}
Payment method: ${payment || 'Not chosen'}
Confirmation #: ${confirmation || '(fill in after paying)'}

NEXT STEPS AFTER PAYING:
  □ Screenshot your confirmation page
  □ Check email for receipt (save it)
  □ Your housing + orientation registration
    should unlock within 24–48 hours
  □ Watch for your NetID / student email
    activation in the next few days

Keep this confirmation number safe — ${p.schoolName || 'your school'}
will ask for it if there are any issues.`
    },
  }),
}

interface Props {
  moveKey: string
  profile: UserProfile
}

export default function FormGuide({ moveKey, profile }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const configFn = formConfigs[moveKey]
  if (!configFn) return null

  const config = configFn(profile)
  const fields = config.fields
  const currentField = fields[step]

  const getValue = (i: number) => values[i] ?? (fields[i]?.prefill || '')
  const setValue = (i: number, val: string) => {
    setValues(prev => { const next = [...prev]; next[i] = val; return next })
  }

  const canAdvance = !currentField?.required || (getValue(step)?.trim().length > 0)

  const handleNext = () => {
    if (step < fields.length - 1) setStep(s => s + 1)
    else setDone(true)
  }

  const output = config.buildOutput(fields.map((_, i) => getValue(i)), profile)

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleReset = () => {
    setOpen(false)
    setStep(0)
    setValues([])
    setDone(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(135deg, #1E1B4B, #312E81)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
      >
        <span style={{ fontSize: 20 }}>📄</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Fill this form with Buddy</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{config.description.slice(0, 55)}…</div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>→</span>
      </button>
    )
  }

  return (
    <div style={{ borderRadius: 14, border: '1.5px solid #312E81', overflow: 'hidden', background: 'white' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 10px', background: 'linear-gradient(135deg, #1E1B4B, #312E81)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>📄 {config.title}</div>
        <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>

      {/* Step dots */}
      {!done && (
        <div style={{ display: 'flex', gap: 5, padding: '10px 14px 0', justifyContent: 'center' }}>
          {fields.map((_, i) => (
            <div key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i < step ? '#7C3AED' : i === step ? '#7C3AED' : '#E9E4FF', transition: 'all 0.2s' }} />
          ))}
        </div>
      )}

      <div style={{ padding: '14px' }}>
        {!done ? (
          <>
            {/* Buddy speech bubble */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
              <BuddyAvatar mood="thinking" size={38} />
              <div style={{ flex: 1, padding: '10px 12px', borderRadius: '4px 14px 14px 14px', background: '#F5F3FF', border: '1.5px solid #DDD6FE' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#4C1D95', lineHeight: 1.5 }}>
                  {currentField?.label}
                </div>
                {currentField?.hint && (
                  <div style={{ fontSize: 11, color: '#6D28D9', marginTop: 4, lineHeight: 1.45 }}>
                    💡 {currentField.hint}
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            {currentField?.type === 'readonly' ? (
              <div style={{ padding: '11px 13px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: 13, color: '#15803D', fontWeight: 500 }}>
                ✓ {getValue(step)}
              </div>
            ) : currentField?.type === 'select' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentField.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setValue(step, opt)}
                    style={{ padding: '11px 13px', borderRadius: 10, textAlign: 'left', border: `2px solid ${getValue(step) === opt ? '#7C3AED' : 'var(--border-secondary)'}`, background: getValue(step) === opt ? '#F5F3FF' : 'white', cursor: 'pointer', fontSize: 13, fontWeight: getValue(step) === opt ? 600 : 400, color: 'var(--text-primary)' }}
                  >
                    {getValue(step) === opt && '✓ '}{opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={getValue(step)}
                onChange={e => setValue(step, e.target.value)}
                placeholder={currentField?.placeholder}
                type={currentField?.type}
                style={{ width: '100%', padding: '12px 13px', borderRadius: 10, border: '1.5px solid var(--border-secondary)', fontSize: 13, color: 'var(--text-primary)', background: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && canAdvance && handleNext()}
              />
            )}

            <button
              onClick={handleNext}
              disabled={!canAdvance && currentField?.type !== 'readonly'}
              style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 11, background: (canAdvance || currentField?.type === 'readonly') ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E9E4FF', border: 'none', color: (canAdvance || currentField?.type === 'readonly') ? 'white' : '#A78BFA', fontSize: 14, fontWeight: 700, cursor: (canAdvance || currentField?.type === 'readonly') ? 'pointer' : 'not-allowed' }}
            >
              {step === fields.length - 1 ? 'Generate →' : 'Next →'}
            </button>
          </>
        ) : (
          <>
            {/* Done — show Buddy celebrating + output */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
              <BuddyAvatar mood="celebrate" size={52} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#5B21B6', marginTop: 6 }}>Done! Here&apos;s your {config.title.toLowerCase()}</div>
            </div>

            <div style={{ padding: '12px 13px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, color: '#334155', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 240, overflowY: 'auto' }}>
              {output}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={handleCopy}
                style={{ flex: 1, padding: '11px', borderRadius: 10, background: copied ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7C3AED, #5B21B6)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                {copied ? 'Copied ✓' : 'Copy to clipboard'}
              </button>
              <button
                onClick={handleReset}
                style={{ padding: '11px 14px', borderRadius: 10, background: 'white', border: '1.5px solid var(--border-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
