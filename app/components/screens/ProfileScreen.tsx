'use client'

import type { UserProfile } from '@/app/lib/profile'
import { cohortColors } from '@/app/lib/recommendations'
import { cohortLabels, stageLabels, schoolTypeLabels } from '@/app/lib/profile'

interface Props {
  profile: UserProfile
  onSignOut: () => void
}

export default function ProfileScreen({ profile, onSignOut }: Props) {
  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '8px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {profile.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>{profile.email}</div>
          </div>
        </div>

        {/* Cohort badges */}
        {profile.cohorts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {profile.cohorts.map(c => (
              <span key={c} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cohortColors[c].bg, color: cohortColors[c].text, border: `1px solid ${cohortColors[c].border}` }}>
                {cohortLabels[c]}
              </span>
            ))}
          </div>
        )}

        {/* Profile details */}
        <div style={{ borderRadius: 16, border: '1px solid var(--border-secondary)', overflow: 'hidden' }}>
          {[
            { label: 'School', value: profile.schoolName || '—' },
            { label: 'School type', value: schoolTypeLabels[profile.schoolType] },
            { label: 'Country / State', value: profile.country || '—' },
            { label: 'Stage', value: stageLabels[profile.stage] },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-tertiary)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Goals */}
        {profile.goals.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Your goals</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.goals.map(g => (
                <span key={g} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--bg-secondary)', color: '#7C3AED', border: '1px solid var(--purple-border)' }}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About UniBuddy */}
        <div style={{ padding: '14px 16px', borderRadius: 14, background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5B21B6', marginBottom: 6 }}>What UniBuddy does</div>
          <div style={{ fontSize: 12, color: '#4C1D95', lineHeight: 1.6 }}>
            UniBuddy makes college bureaucracy legible. It gives you a personalized, step-by-step guide through the administrative processes that determine whether you successfully enroll, stay enrolled, and navigate your first semester — delivering the right information at exactly the moment you need to act on it.
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Sign out
        </button>

      </div>
    </div>
  )
}
