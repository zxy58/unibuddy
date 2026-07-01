'use client'

import type { Move, MoveCategory } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { getPrioritizedMoves } from '@/app/lib/recommendations'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'

interface Props {
  moves: Record<string, Move>
  profile: UserProfile
  openGuide: (key: string) => void
  onDescribeSituation?: () => void
}

const NEUTRAL = { bg: '#F5F5F5', text: '#1A1A1A', border: '#E5E5E5' }

function EnrollmentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l10-4 10 4-10 4z" />
      <path d="M6 9.5V15c0 1.5 2.7 3 6 3s6-1.5 6-3V9.5" />
      <line x1="22" y1="7" x2="22" y2="13" />
    </svg>
  )
}

function FinancialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 16c0 1.1 1.3 2 3 2s3-.9 3-2-1.3-1.8-3-2-3-.9-3-2 1.3-2 3-2 3 .9 3 2" />
      <line x1="12" y1="6" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="18" />
    </svg>
  )
}

function VisaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2.2" />
      <line x1="13" y1="10" x2="18" y2="10" />
      <line x1="13" y1="14" x2="18" y2="14" />
    </svg>
  )
}

function HousingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
      <line x1="10" y1="20" x2="10" y2="14" />
      <line x1="14" y1="20" x2="14" y2="14" />
    </svg>
  )
}

function HealthIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l2-5 4 10 2-5h8" />
    </svg>
  )
}

function AcademicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  )
}

const categoryIcons: Record<MoveCategory, () => JSX.Element> = {
  enrollment: EnrollmentIcon,
  financial:  FinancialIcon,
  visa:       VisaIcon,
  housing:    HousingIcon,
  health:     HealthIcon,
  academic:   AcademicIcon,
}

const RED    = '#E85028'
const PURPLE = '#8878CC'
const BROWN  = '#5C3D2E'

export default function AllGuides({ moves, profile, openGuide, onDescribeSituation }: Props) {
  const ordered = getPrioritizedMoves(profile, moves)

  // Group by category
  const byCategory: Partial<Record<MoveCategory, string[]>> = {}
  for (const key of ordered) {
    const cat = moves[key].category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat]!.push(key)
  }

  const categories = Object.keys(byCategory) as MoveCategory[]

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '8px 20px 96px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Process guides</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>Step-by-step instructions for every admin task</div>
        </div>

        {/* Describe your situation entry card */}
        {onDescribeSituation && (
          <button
            onClick={onDescribeSituation}
            style={{
              width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 16,
              background: 'linear-gradient(135deg, #F9F7FF 0%, #FFF5F5 100%)',
              border: '1.5px solid #DDD8F0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 2px 8px rgba(136,120,204,0.10)',
            }}
          >
            <BuddyAvatar mood="thinking" size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: BROWN, letterSpacing: '-0.2px' }}>
                Not sure which guide you need?
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.45 }}>
                Describe your situation. I&apos;ll generate the right workflow for you
              </div>
            </div>
            <span style={{ fontSize: 18, color: PURPLE, flexShrink: 0 }}>→</span>
          </button>
        )}

        {categories.map(cat => {
          const keys = byCategory[cat]!
          const Icon = categoryIcons[cat]
          return (
            <div key={cat}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: NEUTRAL.bg, border: `1px solid ${NEUTRAL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NEUTRAL.text, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
              </div>

              {/* Guide cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {keys.map(key => {
                  const move = moves[key]
                  return (
                    <button
                      key={key}
                      onClick={() => openGuide(key)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '13px 14px',
                        borderRadius: 14, background: move.done ? '#F9FAFB' : 'white',
                        border: `1px solid ${move.done ? '#E5E7EB' : NEUTRAL.border}`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                        opacity: move.done ? 0.7 : 1,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, textDecoration: move.done ? 'line-through' : 'none' }}>
                          {move.title}
                        </div>
                        {!move.done && move.daysUntil !== null && (
                          <div style={{ fontSize: 11, color: move.daysUntil <= 7 ? '#DC2626' : '#EA580C', fontWeight: 600, marginTop: 3 }}>
                            {move.daysUntil === 0 ? 'Due today' : `${move.daysUntil}d left`}
                          </div>
                        )}
                        {move.done && <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 3 }}>Complete ✓</div>}
                      </div>
                      <span style={{ fontSize: 16, color: 'var(--text-tertiary)', flexShrink: 0 }}>›</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
