'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
}

const tabs: { id: TabName; label: string; activeIcon: string; icon: string }[] = [
  { id: 'timeline', label: 'Timeline', icon: '○', activeIcon: '◉' },
  { id: 'guides',   label: 'Guides',   icon: '☰', activeIcon: '☰' },
  { id: 'profile',  label: 'Profile',  icon: '◯', activeIcon: '◎' },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <div style={{
      display: 'flex',
      borderTop: '1px solid var(--border-tertiary)',
      padding: '8px 0 20px',
      flexShrink: 0,
      background: 'var(--bg-primary)',
    }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              padding: '4px 2px',
              position: 'relative',
              background: 'none',
              border: 'none',
            }}
          >
            {/* Orange top indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 24,
                height: 3,
                borderRadius: 2,
                background: '#F97316',
              }} />
            )}

            {/* Icon pill */}
            <div style={{
              width: 44,
              height: 30,
              borderRadius: 10,
              background: isActive ? '#EDE9FE' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}>
              <span style={{
                fontSize: 18,
                color: isActive ? '#7C3AED' : 'var(--text-tertiary)',
                transition: 'color 0.15s',
                lineHeight: 1,
              }}>
                {isActive ? tab.activeIcon : tab.icon}
              </span>
            </div>

            <span style={{
              fontSize: 10,
              color: isActive ? '#7C3AED' : 'var(--text-tertiary)',
              fontWeight: isActive ? 700 : 400,
              letterSpacing: '0.1px',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
