'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
}

function TimelineIcon({ active }: { active: boolean }) {
  const c = active ? '#FFFFFF' : '#AAAAAA'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <circle cx="5" cy="7"  r="2" fill={active ? c : 'none'} stroke={c} strokeWidth="1.8" />
      <line x1="10" y1="7"  x2="20" y2="7"  stroke={c} strokeWidth="1.8" />
      <circle cx="5" cy="12" r="2" fill={active ? c : 'none'} stroke={c} strokeWidth="1.8" />
      <line x1="10" y1="12" x2="20" y2="12" stroke={c} strokeWidth="1.8" />
      <circle cx="5" cy="17" r="2" fill={active ? c : 'none'} stroke={c} strokeWidth="1.8" />
      <line x1="10" y1="17" x2="20" y2="17" stroke={c} strokeWidth="1.8" />
    </svg>
  )
}

function GuidesIcon({ active }: { active: boolean }) {
  const c = active ? '#FFFFFF' : '#AAAAAA'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7"  x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  )
}

function AskIcon({ active }: { active: boolean }) {
  const c = active ? '#FFFFFF' : '#AAAAAA'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={c} strokeWidth="1.8"
        fill={active ? 'rgba(255,255,255,0.18)' : 'none'} />
      <line x1="9" y1="9"  x2="15" y2="9"  stroke={c} strokeWidth="1.4" />
      <line x1="9" y1="13" x2="13" y2="13" stroke={c} strokeWidth="1.4" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? '#FFFFFF' : '#AAAAAA'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={active ? 'rgba(255,255,255,0.18)' : 'none'} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const tabs: { id: TabName; Icon: React.ComponentType<{ active: boolean }> }[] = [
  { id: 'timeline', Icon: TimelineIcon },
  { id: 'guides',   Icon: GuidesIcon },
  { id: 'ask',      Icon: AskIcon },
  { id: 'profile',  Icon: ProfileIcon },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 14, right: 14, zIndex: 10,
      display: 'flex', alignItems: 'center',
      borderRadius: 40, padding: 6,
      background: 'rgba(255,255,255,0.70)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    }}>
      {tabs.map(({ id, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: 'none', border: 'none', padding: '4px 0',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 24,
              background: isActive ? '#F4442E' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s',
            }}>
              <Icon active={isActive} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
