'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
}

function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <circle cx="5" cy="7" r="2" fill={active ? '#ED1C24' : 'none'} stroke={active ? '#ED1C24' : '#C0C0C0'} strokeWidth="1.8" />
      <line x1="10" y1="7" x2="20" y2="7" stroke={active ? '#ED1C24' : '#C0C0C0'} strokeWidth="1.8" />
      <circle cx="5" cy="12" r="2" fill={active ? '#ED1C24' : 'none'} stroke={active ? '#ED1C24' : '#C0C0C0'} strokeWidth="1.8" />
      <line x1="10" y1="12" x2="20" y2="12" stroke={active ? '#ED1C24' : '#C0C0C0'} strokeWidth="1.8" />
      <circle cx="5" cy="17" r="2" fill={active ? '#ED1C24' : 'none'} stroke={active ? '#ED1C24' : '#C0C0C0'} strokeWidth="1.8" />
      <line x1="10" y1="17" x2="20" y2="17" stroke={active ? '#ED1C24' : '#C0C0C0'} strokeWidth="1.8" />
    </svg>
  )
}

function GuidesIcon({ active }: { active: boolean }) {
  const c = active ? '#ED1C24' : '#C0C0C0'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  )
}

function AskIcon({ active }: { active: boolean }) {
  const c = active ? '#ED1C24' : '#C0C0C0'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={c} strokeWidth="1.8" fill={active ? '#ED1C24' : 'none'} />
      {active && <>
        <line x1="9" y1="9" x2="15" y2="9" stroke="white" strokeWidth="1.4" />
        <line x1="9" y1="13" x2="13" y2="13" stroke="white" strokeWidth="1.4" />
      </>}
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? '#ED1C24' : '#C0C0C0'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={active ? '#ED1C24' : 'none'} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const tabs: { id: TabName; label: string; Icon: React.ComponentType<{ active: boolean }> }[] = [
  { id: 'timeline', label: 'Timeline', Icon: TimelineIcon },
  { id: 'guides',   label: 'Guides',   Icon: GuidesIcon },
  { id: 'ask',      label: 'Ask',      Icon: AskIcon },
  { id: 'profile',  label: 'Profile',  Icon: ProfileIcon },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div style={{ display: 'flex', borderTop: '1px solid #F0F0F0', padding: '10px 0 24px', flexShrink: 0, background: 'white' }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 2px', background: 'none', border: 'none' }}
          >
            <Icon active={isActive} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#ED1C24' : '#C0C0C0', transition: 'color 0.15s', letterSpacing: '-0.1px' }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
