'use client'

import { useState } from 'react'
import type { UserProfile } from '@/app/lib/profile'
import { cohortLabels, cohortShort, saveProfile } from '@/app/lib/profile'
import { cohortColors } from '@/app/lib/recommendations'

const DARK = '#1C1C1C'
const BLUE = '#5567D4'
const LIME = '#CCFA4E'
const RED  = '#E85028'

interface Props {
  profile: UserProfile
  onSignOut: () => void
  onProfileUpdate: (p: UserProfile) => void
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ width: 44, height: 26, borderRadius: 13, background: on ? DARK : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}
    >
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: on ? LIME : 'white', position: 'absolute', top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  )
}

export default function ProfileScreen({ profile, onSignOut, onProfileUpdate }: Props) {
  const [phone, setPhone] = useState(profile.phone || '')
  const [email, setEmail] = useState(profile.email || '')
  const [notifySMS, setNotifySMS] = useState(profile.notifySMS)
  const [notifyEmail, setNotifyEmail] = useState(profile.notifyEmail)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const updated = { ...profile, phone, email, notifySMS, notifyEmail }
    saveProfile(updated)
    onProfileUpdate(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const nextUrgentLabel = 'Enrollment deposit — due in 3 days'

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '8px 18px 96px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero card */}
        <div style={{ background: DARK, borderRadius: 22, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: LIME, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: DARK, flexShrink: 0 }}>
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3, fontWeight: 600 }}>{profile.schoolName}</div>
            </div>
          </div>
          {profile.cohorts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {profile.cohorts.map(c => (
                <span key={c} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {cohortShort[c]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Profile details */}
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid var(--border-secondary)', overflow: 'hidden' }}>
          {[
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 12 15 2 8.5" /><polyline points="17 11 17 18 12 21 7 18 7 11" /></svg>,
              label: 'School', value: profile.schoolName || '—',
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
              label: profile.cohorts.includes('international') ? 'Home country' : 'Home state', value: profile.country || '—',
            },
            {
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
              label: 'Start date', value: profile.startDate ? new Date(profile.startDate + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—',
            },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid #F5F5F5' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{row.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)', flex: 1 }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* ── Notification Settings ── */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.2px' }}>Reminders &amp; notifications</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12, lineHeight: 1.5 }}>
            We&apos;ll nudge you 7 days, 3 days, and the day before each deadline — with a direct link to the guide.
          </div>

          {/* Preview of what a reminder looks like */}
          <div style={{ padding: '13px 14px', borderRadius: 16, background: DARK, marginBottom: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginBottom: 3, letterSpacing: '-0.2px' }}>UniBuddy · 3 days left</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{nextUrgentLabel}. Tap to complete this step.</div>
                <div style={{ fontSize: 11, color: LIME, fontWeight: 700, marginTop: 6 }}>Open guide →</div>
              </div>
            </div>
          </div>

          {/* Email toggle */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border-secondary)', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: notifyEmail ? '1px solid #F5F5F5' : 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Email reminders</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Deadline alerts + step-by-step links</div>
              </div>
              <Toggle on={notifyEmail} onToggle={() => setNotifyEmail(v => !v)} />
            </div>
            {notifyEmail && (
              <div style={{ padding: '10px 15px', background: '#FAFAFA' }}>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: '1.5px solid var(--border-secondary)', fontSize: 13, color: 'var(--text-primary)', background: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>

          {/* SMS toggle */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border-secondary)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: notifySMS ? '1px solid #F5F5F5' : 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>SMS / text reminders</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Text nudges before each deadline</div>
              </div>
              <Toggle on={notifySMS} onToggle={() => setNotifySMS(v => !v)} />
            </div>
            {notifySMS && (
              <div style={{ padding: '10px 15px', background: '#FAFAFA' }}>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: '1.5px solid var(--border-secondary)', fontSize: 13, color: 'var(--text-primary)', background: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>Standard SMS rates apply. Reply STOP to unsubscribe anytime.</div>
              </div>
            )}
          </div>
        </div>

        {/* Notification frequency */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Remind me</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['7 days before', '3 days before', 'Day of'].map(opt => (
              <div key={opt} style={{ padding: '6px 12px', borderRadius: 20, background: `${LIME}33`, border: `1.5px solid ${LIME}88`, fontSize: 12, fontWeight: 700, color: DARK }}>
                ✓ {opt}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>All three reminders are on by default.</div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: saved ? LIME : DARK, border: 'none', color: saved ? DARK : 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'background 0.3s, color 0.3s' }}
        >
          {saved ? 'Saved ✓' : 'Save notification settings'}
        </button>

        {/* About */}
        <div style={{ padding: '16px 17px', borderRadius: 18, background: '#F5F5F3', border: '1px solid #E8E8E5' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: DARK, marginBottom: 6, letterSpacing: '-0.1px' }}>About UniBuddy</div>
          <div style={{ fontSize: 12, color: '#555555', lineHeight: 1.7 }}>
            UniBuddy makes college bureaucracy legible for first-gen and international students — delivering the right step at exactly the moment you need to take it.
          </div>
        </div>

        {/* Sign out */}
        <button onClick={onSignOut} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'white', border: `1px solid ${RED}44`, color: RED, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Sign out
        </button>

      </div>
    </div>
  )
}
