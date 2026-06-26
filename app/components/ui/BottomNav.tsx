'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
}

const tabs: { id: TabName; label: string; emoji: string }[] = [
  { id: 'timeline', label: 'Timeline', emoji: '📋' },
  { id: 'guides',   label: 'Guides',   emoji: '📖' },
  { id: 'ask',      label: 'Ask',      emoji: '💬' },
  { id: 'profile',  label: 'Profile',  emoji: '👤' },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div style={{ display: 'flex', borderTop: '1px solid #F0F0F0', padding: '8px 0 22px', flexShrink: 0, background: 'white' }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '4px 2px', background: 'none', border: 'none' }}
          >
            <div style={{ fontSize: isActive ? 22 : 20, lineHeight: 1, filter: isActive ? 'none' : 'grayscale(1) opacity(0.4)', transition: 'all 0.15s' }}>
              {tab.emoji}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? '#ED1C24' : '#A1A1AA', transition: 'color 0.15s', letterSpacing: '-0.1px' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
