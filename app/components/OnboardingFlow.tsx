'use client'

import { useState } from 'react'
import type { UserProfile, CohortType } from '@/app/lib/profile'
import { cohortLabels } from '@/app/lib/profile'

interface Props {
  onComplete: (profile: UserProfile) => void
}

const cohortDescriptions: Record<CohortType, string> = {
  international: 'Coming from outside the U.S.',
  firstgen: 'First in your family to go to college',
  lowincome: 'Navigating financial aid or FAFSA',
  transfer: 'Moving from another institution',
}

const cohortIcons: Record<CohortType, string> = {
  international: '🌐',
  firstgen: '⭐',
  lowincome: '💛',
  transfer: '↗',
}

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [cohorts, setCohorts] = useState<CohortType[]>([])
  const [schoolName, setSchoolName] = useState('')
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState('')

  const TOTAL = 4
  const isIntl = cohorts.includes('international')

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2
    if (step === 1) return cohorts.length > 0
    if (step === 2) return schoolName.trim().length > 1 && country.trim().length > 1
    if (step === 3) return startDate.length >= 4
    return true
  }

  const handleFinish = () => {
    onComplete({
      name: name.trim(),
      cohorts,
      schoolName: schoolName.trim(),
      country: country.trim(),
      startDate,
      phone: '',
      email: '',
      notifySMS: false,
      notifyEmail: true,
    })
  }

  const pct = ((step) / TOTAL) * 100

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px', borderRadius: 12,
    border: '1.5px solid var(--border-secondary)', fontSize: 15,
    color: 'var(--text-primary)', background: 'white', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: '#EDE9FE', flexShrink: 0 }}>
        <div style={{ height: '100%', background: '#7C3AED', width: `${pct}%`, transition: 'width 0.3s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      <div style={{ flex: 1, padding: '24px 22px 32px', display: 'flex', flexDirection: 'column' }}>

        {/* ── Step 0: Name ── */}
        {step === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 8 }}>
              Welcome to UniBuddy
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 28 }}>
              We make college bureaucracy legible — step by step, personalized to your situation. What should we call you?
            </div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>Your first name</label>
            <input
              style={inputStyle}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Amara"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && canNext() && setStep(1)}
            />
          </div>
        )}

        {/* ── Step 1: Who are you ── */}
        {step === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
              Hi {name} — which describes you?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>Select all that apply. This personalizes everything.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {(Object.keys(cohortLabels) as CohortType[]).map(c => {
                const selected = cohorts.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() => setCohorts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                      border: `2px solid ${selected ? '#7C3AED' : 'var(--border-secondary)'}`,
                      background: selected ? '#F5F3FF' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{cohortIcons[c]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{cohortLabels[c]}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{cohortDescriptions[c]}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected ? '#7C3AED' : '#D1D5DB'}`, background: selected ? '#7C3AED' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {selected && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: School + origin ── */}
        {step === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
              Where are you headed?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>We use this to surface school-specific info and deadlines.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>School name</label>
                <input style={inputStyle} value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. UCLA, RISD, UT Austin" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>
                  {isIntl ? 'Home country' : 'Home state'}
                </label>
                <input style={inputStyle} value={country} onChange={e => setCountry(e.target.value)} placeholder={isIntl ? 'e.g. Nigeria, South Korea, Brazil' : 'e.g. California, Texas'} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Start date ── */}
        {step === 3 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
              When do you start?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
              We use this to count down deadlines and show what&apos;s urgent right now.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {[
                { label: 'Fall 2025', value: '2025-09' },
                { label: 'Spring 2026', value: '2026-01' },
                { label: 'Fall 2026', value: '2026-09' },
                { label: 'Other / not sure', value: '2025-08' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStartDate(opt.value)}
                  style={{
                    padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${startDate === opt.value ? '#7C3AED' : 'var(--border-secondary)'}`,
                    background: startDate === opt.value ? '#F5F3FF' : 'white',
                    fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  {opt.label}
                  {startDate === opt.value && <span style={{ color: '#7C3AED', fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ padding: '13px 20px', borderRadius: 12, background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              ←
            </button>
          )}
          <button
            onClick={() => step < TOTAL - 1 ? setStep(s => s + 1) : handleFinish()}
            disabled={!canNext()}
            style={{
              flex: 1, padding: '14px', borderRadius: 12, border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed',
              background: canNext() ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E5E7EB',
              color: canNext() ? 'white' : '#9CA3AF',
              fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px',
              transition: 'all 0.15s',
            }}
          >
            {step < TOTAL - 1 ? 'Continue →' : `Build my timeline →`}
          </button>
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i <= step ? '#7C3AED' : '#E9E4FF', transition: 'all 0.2s' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
