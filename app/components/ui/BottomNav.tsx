'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
}

const tabs: { id: TabName; label: string; icon: string; activeIcon: string }[] = [
  { id: 'timeline', label: 'Timeline', icon: '○', activeIcon: '◉' },
  { id: 'guides',   label: 'Guides',   icon: '☰', activeIcon: '☰' },
  { id: 'ask',      label: 'Ask',      icon: '◇', activeIcon: '◆' },
  { id: 'profile',  label: 'Profile',  icon: '◯', activeIcon: '◎' },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div style={{ display: 'flex', borderTop: '1px solid var(--border-tertiary)', padding: '8px 0 20px', flexShrink: 0, background: 'var(--bg-primary)' }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '4px 2px', position: 'relative', background: 'none', border: 'none' }}
          >
            {isActive && (
              <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 20, height: 3, borderRadius: 2, background: '#F97316' }} />
            )}
            <div style={{ width: 40, height: 28, borderRadius: 9, background: isActive ? 'var(--clr-primary-light)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
              <span style={{ fontSize: 17, color: isActive ? 'var(--clr-primary)' : 'var(--text-tertiary)', transition: 'color 0.15s', lineHeight: 1 }}>
                {isActive ? tab.activeIcon : tab.icon}
              </span>
            </div>
            <span style={{ fontSize: 10, color: isActive ? 'var(--clr-primary)' : 'var(--text-tertiary)', fontWeight: isActive ? 700 : 400 }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
