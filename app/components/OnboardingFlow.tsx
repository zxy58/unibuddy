'use client'

import { useState } from 'react'
import type { UserProfile, CohortType } from '@/app/lib/profile'
import { cohortLabels } from '@/app/lib/profile'
import BuddyAvatar from './ui/BuddyAvatar'

interface Props {
  onComplete: (profile: UserProfile) => void
}

const RED    = '#ED1C24'
const BROWN  = '#4E3629'
const RED_BG = '#FFF5F5'
const RED_BR = '#FECACA'

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

const SCHOOL_MAP: Record<string, string> = {
  'brown.edu': 'Brown University',
  'risd.edu': 'RISD',
  'ucla.edu': 'UCLA',
  'mit.edu': 'MIT',
  'stanford.edu': 'Stanford University',
  'harvard.edu': 'Harvard University',
  'yale.edu': 'Yale University',
  'columbia.edu': 'Columbia University',
  'nyu.edu': 'New York University',
  'uchicago.edu': 'University of Chicago',
}

function detectSchool(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  if (SCHOOL_MAP[domain]) return SCHOOL_MAP[domain]
  const part = domain.split('.')[0] ?? ''
  return part.charAt(0).toUpperCase() + part.slice(1)
}

// TOTAL steps after SSO (steps 1–3 shown in progress bar)
const POST_SSO_STEPS = 3

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0)         // 0 = SSO, 1–3 = post-login
  const [ssoLoading, setSsoLoading] = useState(false)
  const [name, setName] = useState('')
  const [cohorts, setCohorts] = useState<CohortType[]>([])
  const [schoolName, setSchoolName] = useState('')
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notifySMS, setNotifySMS] = useState(false)

  const isIntl = cohorts.includes('international')

  const canNext = () => {
    if (step === 0) return email.includes('@') && email.includes('.')
    if (step === 1) return name.trim().length >= 2 && cohorts.length > 0
    if (step === 2) return country.trim().length > 1 && startDate.length >= 4
    if (step === 3) return true
    return true
  }

  const handleSSO = () => {
    if (!canNext()) return
    setSsoLoading(true)
    setSchoolName(detectSchool(email))
    setTimeout(() => {
      setSsoLoading(false)
      setStep(1)
    }, 1400)
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
      notifyEmail: true,
      notifySMS,
    })
  }

  const pct = step === 0 ? 0 : ((step - 1) / POST_SSO_STEPS) * 100

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px', borderRadius: 10,
    border: `1.5px solid #E5E7EB`, fontSize: 15,
    color: '#111827', background: 'white', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const primaryBtn: React.CSSProperties = {
    flex: 1, padding: '14px', borderRadius: 10, border: 'none',
    cursor: 'pointer', background: RED, color: 'white',
    fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px',
  }

  const disabledBtn: React.CSSProperties = {
    ...primaryBtn, background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed',
  }

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* Progress bar — only shown after SSO */}
      {step > 0 && (
        <div style={{ height: 3, background: '#F3F4F6', flexShrink: 0 }}>
          <div style={{ height: '100%', background: RED, width: `${pct}%`, transition: 'width 0.35s ease' }} />
        </div>
      )}

      <div style={{ flex: 1, padding: step === 0 ? '0' : '20px 22px 28px', display: 'flex', flexDirection: 'column' }}>

        {/* ── Step 0: SSO login ── */}
        {step === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Top band */}
            <div style={{ background: BROWN, padding: '32px 28px 28px', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6 }}>UniBuddy</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Sign in with your<br />school account
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
                We&apos;ll connect to your institution&apos;s SSO — no new password needed.
              </div>
            </div>

            {/* Form */}
            <div style={{ flex: 1, padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>
                  Institutional email
                </label>
                <input
                  style={inputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@brown.edu"
                  type="email"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && canNext() && handleSSO()}
                />
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
                  Use your university-issued email address.
                </div>
              </div>

              <button
                onClick={handleSSO}
                disabled={!canNext() || ssoLoading}
                style={canNext() && !ssoLoading ? primaryBtn : disabledBtn}
              >
                {ssoLoading ? 'Connecting to school SSO…' : 'Continue with school SSO →'}
              </button>

              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.6, textAlign: 'center' }}>
                  UniBuddy uses your school&apos;s authentication.<br />
                  We never store your password.<br />
                  <span style={{ color: '#6B7280' }}>Don&apos;t see your school? Contact us.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Name + who you are ── */}
        {step === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: RED, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
                {schoolName}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
                Tell us about yourself
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 }}>
                Personalizes your deadline checklist from day one.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>First name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amara"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>Which describes you?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(Object.keys(cohortLabels) as CohortType[]).map(c => {
                    const selected = cohorts.includes(c)
                    return (
                      <button
                        key={c}
                        onClick={() => setCohorts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', border: `2px solid ${selected ? RED : '#E5E7EB'}`, background: selected ? RED_BG : 'white' }}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{cohortIcons[c]}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{cohortLabels[c]}</div>
                          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{cohortDescriptions[c]}</div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected ? RED : '#D1D5DB'}`, background: selected ? RED : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {selected && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Background + start date ── */}
        {step === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px', marginBottom: 4 }}>
              A bit more context
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Used to surface the right deadlines and contacts.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>
                  {isIntl ? 'Home country' : 'Home state'}
                </label>
                <input
                  style={inputStyle}
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder={isIntl ? 'e.g. Nigeria, South Korea, Brazil' : 'e.g. California, Texas'}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'block' }}>When do you start?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Fall 2025', sub: 'August / September 2025', value: '2025-09' },
                    { label: 'Spring 2026', sub: 'January 2026', value: '2026-01' },
                    { label: 'Fall 2026', sub: 'August / September 2026', value: '2026-09' },
                    { label: 'Other / not sure yet', sub: '', value: '2025-08' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStartDate(opt.value)}
                      style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', border: `2px solid ${startDate === opt.value ? RED : '#E5E7EB'}`, background: startDate === opt.value ? RED_BG : 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{opt.label}</div>
                        {opt.sub && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{opt.sub}</div>}
                      </div>
                      {startDate === opt.value && <span style={{ color: RED, fontSize: 16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Notifications + welcome ── */}
        {step === 3 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, marginTop: 4 }}>
              <BuddyAvatar mood="wave" size={80} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px', marginBottom: 4, textAlign: 'center' }}>
              You&apos;re almost in, {name.split(' ')[0]}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, textAlign: 'center', lineHeight: 1.55 }}>
              Want a text reminder before each deadline?
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: 16 }}>
              <span style={{ fontSize: 15 }}>✉️</span>
              <span style={{ fontSize: 12, color: '#15803D', fontWeight: 600 }}>Email reminders on — {email}</span>
              <span style={{ marginLeft: 'auto', fontSize: 13 }}>✓</span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ borderRadius: 10, border: `2px solid ${notifySMS ? RED : '#E5E7EB'}`, overflow: 'hidden' }}>
                <button
                  onClick={() => setNotifySMS(v => !v)}
                  style={{ width: '100%', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, background: notifySMS ? RED_BG : 'white', border: 'none', cursor: 'pointer', borderBottom: notifySMS ? `1px solid ${RED_BR}` : 'none' }}
                >
                  <span style={{ fontSize: 20 }}>💬</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Add text / SMS reminders</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Quick nudges before each deadline</div>
                  </div>
                  <div style={{ width: 44, height: 26, borderRadius: 13, background: notifySMS ? RED : '#D1D5DB', position: 'relative', flexShrink: 0 }}>
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
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Reply STOP anytime to unsubscribe.</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '11px 14px', borderRadius: 10, background: RED_BG, border: `1px solid ${RED_BR}` }}>
                <div style={{ fontSize: 12, color: BROWN, lineHeight: 1.55 }}>
                  I&apos;ll remind you <strong>7 days, 3 days, and the day before</strong> each deadline — with a direct link to your guide.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        {step > 0 && (
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ padding: '13px 18px', borderRadius: 10, background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#6B7280' }}
            >←</button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                style={canNext() ? primaryBtn : disabledBtn}
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                style={primaryBtn}
              >
                Build my timeline →
              </button>
            )}
          </div>
        )}

        {/* Step dots — post SSO only */}
        {step > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
            {Array.from({ length: POST_SSO_STEPS }).map((_, i) => (
              <div key={i} style={{ width: (i + 1) === step ? 20 : 6, height: 6, borderRadius: 3, background: (i + 1) <= step ? RED : '#E5E7EB', transition: 'all 0.2s' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
