'use client'

import { useState } from 'react'
import type { UserProfile, CohortType } from '@/app/lib/profile'
import { cohortLabels } from '@/app/lib/profile'
import BuddyAvatar from './ui/BuddyAvatar'

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
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySMS, setNotifySMS] = useState(false)

  const TOTAL = 5
  const isIntl = cohorts.includes('international')

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2 && email.includes('@')
    if (step === 1) return cohorts.length > 0
    if (step === 2) return schoolName.trim().length > 1 && country.trim().length > 1
    if (step === 3) return startDate.length >= 4
    if (step === 4) return true
    return true
  }

  const handleFinish = () => {
    onComplete({
      name: name.trim(),
      cohorts,
      schoolName: schoolName.trim(),
      country: country.trim(),
      startDate,
      email: email.trim(),
      phone: phone.trim(),
      notifyEmail,
      notifySMS,
    })
  }

  const pct = (step / TOTAL) * 100

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
        <div style={{ height: '100%', background: '#7C3AED', width: `${pct}%`, transition: 'width 0.35s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      <div style={{ flex: 1, padding: '20px 22px 28px', display: 'flex', flexDirection: 'column' }}>

        {/* ── Step 0: Welcome + account creation ── */}
        {step === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ marginBottom: 16, marginTop: 8 }}>
              <BuddyAvatar mood="wave" size={100} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Meet UniBuddy
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 24, maxWidth: 270 }}>
              Your personal guide through college bureaucracy — deadlines, steps, and reminders all in one place.
            </div>
            <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>Your first name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amara"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>Email for deadline reminders</label>
                <input
                  style={inputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  onKeyDown={e => e.key === 'Enter' && canNext() && setStep(1)}
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
                  We&apos;ll send reminders 7, 3, and 1 day before each deadline.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Student type ── */}
        {step === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 }}>
              Hi {name}! Which describes you?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>Select all that apply — this personalizes your entire checklist.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {(Object.keys(cohortLabels) as CohortType[]).map(c => {
                const selected = cohorts.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() => setCohorts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: `2px solid ${selected ? '#7C3AED' : 'var(--border-secondary)'}`, background: selected ? '#F5F3FF' : 'white', transition: 'all 0.15s' }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{cohortIcons[c]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{cohortLabels[c]}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{cohortDescriptions[c]}</div>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selected ? '#7C3AED' : '#D1D5DB'}`, background: selected ? '#7C3AED' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {selected && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
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
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 }}>
              Where are you headed?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>I use this to surface school-specific deadlines and info.</div>
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
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 }}>
              When do you start?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20 }}>
              I use this to count down your deadlines and show what&apos;s urgent right now.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {[
                { label: 'Fall 2025', sub: 'August / September 2025', value: '2025-09' },
                { label: 'Spring 2026', sub: 'January 2026', value: '2026-01' },
                { label: 'Fall 2026', sub: 'August / September 2026', value: '2026-09' },
                { label: 'Other / not sure yet', sub: '', value: '2025-08' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStartDate(opt.value)}
                  style={{ padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: `2px solid ${startDate === opt.value ? '#7C3AED' : 'var(--border-secondary)'}`, background: startDate === opt.value ? '#F5F3FF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{opt.label}</div>
                    {opt.sub && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{opt.sub}</div>}
                  </div>
                  {startDate === opt.value && <span style={{ color: '#7C3AED', fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: SMS reminders ── */}
        {step === 4 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <BuddyAvatar mood="happy" size={80} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4, textAlign: 'center' }}>
              Want text reminders too?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 6, textAlign: 'center', lineHeight: 1.55 }}>
              Email is already set up. Text reminders are a second line of defense.
            </div>

            {/* Email confirmed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 18 }}>
              <span style={{ fontSize: 16 }}>✉️</span>
              <span style={{ fontSize: 12, color: '#15803D', fontWeight: 600 }}>Email reminders on — {email}</span>
              <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {/* SMS */}
              <div style={{ borderRadius: 14, border: `2px solid ${notifySMS ? '#7C3AED' : 'var(--border-secondary)'}`, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                <button
                  onClick={() => setNotifySMS(v => !v)}
                  style={{ width: '100%', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, background: notifySMS ? '#F5F3FF' : 'white', border: 'none', cursor: 'pointer', borderBottom: notifySMS ? '1px solid #DDD6FE' : 'none' }}
                >
                  <span style={{ fontSize: 22 }}>💬</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Add text / SMS reminders</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Quick nudges before each deadline</div>
                  </div>
                  <div style={{ width: 44, height: 26, borderRadius: 13, background: notifySMS ? '#7C3AED' : '#D1D5DB', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifySMS ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </button>
                {notifySMS && (
                  <div style={{ padding: '10px 15px', background: 'white' }}>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      style={{ ...inputStyle, padding: '10px 12px', fontSize: 14 }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Reply STOP anytime to unsubscribe.</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '11px 14px', borderRadius: 12, background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                <div style={{ fontSize: 12, color: '#4C1D95', lineHeight: 1.55 }}>
                  I&apos;ll remind you <strong>7 days, 3 days, and the day before</strong> each deadline — with a direct link to the guide.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ padding: '13px 18px', borderRadius: 12, background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}
            >←</button>
          )}
          {step < TOTAL - 1 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed', background: canNext() ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E5E7EB', color: canNext() ? 'white' : '#9CA3AF', fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px', transition: 'all 0.15s' }}
            >
              Continue →
            </button>
          )}
          {step === TOTAL - 1 && (
            <button
              onClick={handleFinish}
              disabled={!canNext()}
              style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', cursor: canNext() ? 'pointer' : 'not-allowed', background: canNext() ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E5E7EB', color: canNext() ? 'white' : '#9CA3AF', fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px' }}
            >
              Build my timeline →
            </button>
          )}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i <= step ? '#7C3AED' : '#E9E4FF', transition: 'all 0.2s' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
