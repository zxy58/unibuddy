'use client'

import type { TabName } from '@/app/lib/types'

interface BottomNavProps {
  active: TabName
  onNavigate: (tab: TabName) => void
  inboxCount?: number
}

const tabs: { id: TabName; icon: string; label: string }[] = [
  { id: 'dash', icon: '⊞', label: 'Home' },
  { id: 'playbook', icon: '◫', label: 'Playbook' },
  { id: 'growth', icon: '↑', label: 'Growth' },
  { id: 'community', icon: '◈', label: 'Community' },
  { id: 'inbox', icon: '↓', label: 'Inbox' },
]

export default function BottomNav({ active, onNavigate, inboxCount = 0 }: BottomNavProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderTop: '0.5px solid var(--border-tertiary)',
        padding: '10px 0 18px',
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
              padding: 4,
              position: 'relative',
              background: 'none',
              border: 'none',
            }}
          >
            <span style={{ fontSize: 18, color: isActive ? '#534AB7' : 'var(--text-primary)' }}>
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                color: isActive ? '#534AB7' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {tab.label}
            </span>
            {tab.id === 'inbox' && inboxCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#D85A30',
                  color: 'white',
                  fontSize: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 500,
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
