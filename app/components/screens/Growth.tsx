'use client'

import { useState } from 'react'

interface GrowthProps {
  openShareModal: (moveKey?: string) => void
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const activeDays = [0, 1, 2, 3]

const reflectionOptions = [
  { label: 'Go to office hours', response: 'Perfect timing — office hours in week 2 is the highest-leverage move you can make this semester. Your playbook has the full guide.' },
  { label: 'Email a professor', response: 'The office hours move covers professor email etiquette too. Try going in person first — it\'s 10× more effective for building a real connection.' },
  { label: 'Review my aid package', response: 'The financial aid appeal move is coming up in your playbook. It unlocks after your first semester starts.' },
  { label: 'Open a bank account', response: 'For international students, Chase and Bank of America both accept your passport + I-20 as ID. Bring both plus your acceptance letter.' },
]

export default function Growth({ openShareModal }: GrowthProps) {
  const [selectedRefl, setSelectedRefl] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  const sectionLabel: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 500,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 20px 12px',
          borderBottom: '0.5px solid var(--border-tertiary)',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>Growth</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Your moves, documented</div>
        </div>
      </div>

      <div
        className="no-scroll"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { value: '5', label: 'Learned', color: '#534AB7' },
            { value: '3', label: 'Made', color: '#1D9E75' },
            { value: '4', label: 'Day streak', color: '#BA7517' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 500, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* AI reflection */}
        <div
          style={{
            background: '#EEEDFE',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            border: '0.5px solid #AFA9EC',
          }}
        >
          <div style={{ fontSize: 11, color: '#534AB7', fontWeight: 500, marginBottom: 4 }}>
            UniBuddy reflects
          </div>
          <div style={{ fontSize: 13, color: '#3C3489', lineHeight: 1.6 }}>
            You&apos;ve learned 5 moves and made 3 of them — including the DSO email move which you
            executed and logged. That&apos;s not just knowledge, that&apos;s capability you&apos;ve
            built.
          </div>
        </div>

        {/* Growth moments */}
        <div style={sectionLabel}>Growth moments</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              icon: '✓',
              title: 'DSO email formula — made it',
              date: '2 days ago',
              note: '"Used the exact subject line format and got my I-20 in 48 hours. Min-jun was right — it actually works. Going to share this move with Tolu."',
              showShare: true,
              moveKey: 'dso',
            },
            {
              icon: '✓',
              title: 'SEVIS fee — made it',
              date: '3 days ago',
              note: '"Almost paid on the wrong site — the move warned me about unofficial sites. Paid on fmjfee.com and got confirmation immediately."',
              showShare: false,
              moveKey: 'sevis',
            },
            {
              icon: '✓',
              title: 'Onboarding — made it',
              date: '4 days ago',
              note: '"Set up calendar sync and university email connection. Dashboard already feels relevant to my situation."',
              showShare: false,
              moveKey: null,
            },
          ].map((gm) => (
            <div
              key={gm.title}
              style={{
                border: '0.5px solid var(--border-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                background: 'var(--bg-primary)',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
                onClick={() =>
                  setExpandedNotes((prev) => ({ ...prev, [gm.title]: !prev[gm.title] }))
                }
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#E1F5EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                    color: '#0F6E56',
                  }}
                >
                  {gm.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {gm.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#1D9E75' }}>{gm.date}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1, alignSelf: 'center' }}>
                  {expandedNotes[gm.title] ? '▴' : '▾'}
                </div>
              </div>
              {expandedNotes[gm.title] && (
                <>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '0.5px solid var(--border-tertiary)',
                    }}
                  >
                    {gm.note}
                  </div>
                  {gm.showShare && gm.moveKey && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        onClick={() => openShareModal(gm.moveKey!)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          color: '#534AB7',
                          background: '#EEEDFE',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        Share this move →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Weekly streak */}
        <div style={sectionLabel}>This week</div>
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {weekDays.map((day, i) => {
              const isDone = activeDays.includes(i)
              const isCurrent = i === 4
              return (
                <div
                  key={`${day}-${i}`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 500,
                    background: isDone
                      ? '#534AB7'
                      : isCurrent
                      ? '#EEEDFE'
                      : 'var(--bg-secondary)',
                    color: isDone
                      ? 'white'
                      : isCurrent
                      ? '#534AB7'
                      : 'var(--text-tertiary)',
                    border: isCurrent ? '1.5px solid #534AB7' : 'none',
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 12, color: '#1D9E75' }}>
            4-day streak — you&apos;re building real momentum.
          </div>
        </div>

        {/* Knowledge areas */}
        <div style={sectionLabel}>Knowledge areas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { area: 'Visa + immigration', level: 'Strong', levelColor: '#534AB7', width: '78%', barColor: '#534AB7' },
            { area: 'Financial navigation', level: 'Building', levelColor: '#BA7517', width: '40%', barColor: '#BA7517' },
            { area: 'Academic culture', level: 'Just started', levelColor: '#1D9E75', width: '20%', barColor: '#1D9E75' },
            { area: 'Career strategy', level: 'Not started', levelColor: 'var(--text-tertiary)', width: '0%', barColor: '#534AB7' },
          ].map((ka) => (
            <div key={ka.area}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  alignItems: 'baseline',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{ka.area}</div>
                <div style={{ fontSize: 12, color: ka.levelColor }}>{ka.level}</div>
              </div>
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 4,
                  height: 5,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: ka.width,
                    height: '100%',
                    background: ka.barColor,
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Weekly check-in */}
        <div style={sectionLabel}>Weekly check-in</div>
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: 10,
              lineHeight: 1.4,
            }}
          >
            What move do you want to make this week?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {reflectionOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelectedRefl(opt.label)}
                style={{
                  border: selectedRefl === opt.label ? 'none' : '0.5px solid var(--border-secondary)',
                  borderRadius: 20,
                  padding: '6px 12px',
                  fontSize: 12,
                  background: selectedRefl === opt.label ? '#534AB7' : 'var(--bg-primary)',
                  color: selectedRefl === opt.label ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: selectedRefl === opt.label ? 500 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {selectedRefl && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                paddingTop: 10,
                borderTop: '0.5px solid var(--border-tertiary)',
              }}
            >
              {reflectionOptions.find((o) => o.label === selectedRefl)?.response}
            </div>
          )}
        </div>

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
