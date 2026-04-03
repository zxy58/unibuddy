'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
  inboxCount?: number
}

const tabs: { id: TabName; icon: string; label: string }[] = [
  { id: 'dash',      icon: '⊞', label: 'Home' },
  { id: 'playbook',  icon: '◫', label: 'Playbook' },
  { id: 'growth',    icon: '↑', label: 'Growth' },
  { id: 'community', icon: '◈', label: 'Community' },
  { id: 'inbox',     icon: '↓', label: 'Inbox' },
]

export default function BottomNav({ active, onNavigate, inboxCount = 0 }: BottomNavProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderTop: '1px solid var(--border-tertiary)',
        padding: '8px 0 20px',
        flexShrink: 0,
        background: 'var(--bg-primary)',
      }}
    >
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
            {/* Orange active indicator dot at top */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 3,
                  borderRadius: 2,
                  background: '#F97316',
                }}
              />
            )}

            {/* Icon container — pill bg when active */}
            <div
              style={{
                width: 36,
                height: 28,
                borderRadius: 8,
                background: isActive ? '#EDE9FE' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <span
                style={{
                  fontSize: 17,
                  color: isActive ? '#7C3AED' : 'var(--text-tertiary)',
                  transition: 'color 0.15s',
                }}
              >
                {tab.icon}
              </span>
            </div>

            <span
              style={{
                fontSize: 10,
                color: isActive ? '#7C3AED' : 'var(--text-tertiary)',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: isActive ? '0.1px' : '0',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </span>

            {/* Inbox badge */}
            {tab.id === 'inbox' && inboxCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 4,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  background: '#F97316',
                  color: 'white',
                  fontSize: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {inboxCount}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
