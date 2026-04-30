'use client'

import { useState } from 'react'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'
import type { BuddyEvolutionLevel } from '@/app/components/ui/BuddyAvatar'

type CohortType = 'international' | 'firstgen' | 'lowincome' | 'transfer'
type RiskLevel = 'on-track' | 'at-risk' | 'critical' | 'complete'

interface StudentRecord {
  id: string
  name: string
  school: string
  cohorts: CohortType[]
  completion: number
  lastActive: string
  criticalPending: number
  tasksTotal: number
  tasksDone: number
  email: string
  country?: string
}

const MOCK_STUDENTS: StudentRecord[] = [
  { id: '1', name: 'Amara Okafor', school: 'UCLA', cohorts: ['international', 'firstgen'], completion: 22, lastActive: '2h ago', criticalPending: 3, tasksTotal: 9, tasksDone: 2, email: 'amara@example.com', country: 'Nigeria' },
  { id: '2', name: 'Marcus Rivera', school: 'UCLA', cohorts: ['firstgen', 'lowincome'], completion: 67, lastActive: '1d ago', criticalPending: 1, tasksTotal: 9, tasksDone: 6, email: 'marcus@example.com' },
  { id: '3', name: 'Ji-Yeon Park', school: 'UCLA', cohorts: ['international'], completion: 44, lastActive: '3d ago', criticalPending: 2, tasksTotal: 9, tasksDone: 4, email: 'jiyeon@example.com', country: 'South Korea' },
  { id: '4', name: 'Destiny Johnson', school: 'UCLA', cohorts: ['firstgen', 'lowincome'], completion: 100, lastActive: '5h ago', criticalPending: 0, tasksTotal: 9, tasksDone: 9, email: 'destiny@example.com' },
  { id: '5', name: 'Rahul Sharma', school: 'UCLA', cohorts: ['international'], completion: 11, lastActive: '6d ago', criticalPending: 3, tasksTotal: 9, tasksDone: 1, email: 'rahul@example.com', country: 'India' },
  { id: '6', name: 'Keisha Williams', school: 'UCLA', cohorts: ['transfer', 'lowincome'], completion: 78, lastActive: '12h ago', criticalPending: 0, tasksTotal: 9, tasksDone: 7, email: 'keisha@example.com' },
  { id: '7', name: 'Carlos Mendez', school: 'UCLA', cohorts: ['firstgen'], completion: 0, lastActive: '9d ago', criticalPending: 3, tasksTotal: 9, tasksDone: 0, email: 'carlos@example.com' },
  { id: '8', name: 'Fatima Al-Rashid', school: 'UCLA', cohorts: ['international', 'firstgen'], completion: 33, lastActive: '2d ago', criticalPending: 2, tasksTotal: 9, tasksDone: 3, email: 'fatima@example.com', country: 'UAE' },
  { id: '9', name: 'Tyler Brooks', school: 'UCLA', cohorts: ['transfer'], completion: 89, lastActive: '4h ago', criticalPending: 0, tasksTotal: 9, tasksDone: 8, email: 'tyler@example.com' },
  { id: '10', name: 'Priya Patel', school: 'UCLA', cohorts: ['international'], completion: 56, lastActive: '1d ago', criticalPending: 1, tasksTotal: 9, tasksDone: 5, email: 'priya@example.com', country: 'India' },
]

const cohortColors: Record<CohortType, { bg: string; text: string; border: string; label: string }> = {
  international: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: '🌐 Intl' },
  firstgen:      { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: '⭐ First-gen' },
  lowincome:     { bg: '#FEF9C3', text: '#713F12', border: '#FEF08A', label: '💛 Fin. aid' },
  transfer:      { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', label: '↗ Transfer' },
}

function getRisk(s: StudentRecord): RiskLevel {
  if (s.completion === 100) return 'complete'
  if (s.criticalPending >= 2 || (s.lastActive.includes('9d') || s.lastActive.includes('6d'))) return 'critical'
  if (s.criticalPending >= 1) return 'at-risk'
  return 'on-track'
}

const riskStyle: Record<RiskLevel, { bg: string; text: string; label: string; dot: string }> = {
  complete:  { bg: '#F0FDF4', text: '#15803D', label: 'Complete ✓', dot: '#22C55E' },
  'on-track': { bg: '#EFF6FF', text: '#1D4ED8', label: 'On track', dot: '#3B82F6' },
  'at-risk':  { bg: '#FFF7ED', text: '#C2410C', label: 'At risk', dot: '#F97316' },
  critical:   { bg: '#FEF2F2', text: '#B91C1C', label: 'Critical', dot: '#EF4444' },
}

function getEvolutionLevel(pct: number): BuddyEvolutionLevel {
  if (pct === 100) return 5
  if (pct > 75) return 4
  if (pct > 50) return 3
  if (pct > 25) return 2
  if (pct > 0) return 1
  return 0
}

type FilterTab = 'all' | CohortType | 'at-risk'

export default function AdminDashboard() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = MOCK_STUDENTS.filter(s => {
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'at-risk' ? (getRisk(s) === 'at-risk' || getRisk(s) === 'critical') :
      s.cohorts.includes(filter as CohortType)
    const matchesSearch = search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const avgCompletion = Math.round(MOCK_STUDENTS.reduce((sum, s) => sum + s.completion, 0) / MOCK_STUDENTS.length)
  const atRiskCount = MOCK_STUDENTS.filter(s => getRisk(s) === 'at-risk' || getRisk(s) === 'critical').length
  const completeCount = MOCK_STUDENTS.filter(s => s.completion === 100).length

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: `All (${MOCK_STUDENTS.length})` },
    { id: 'at-risk', label: `⚠ At risk (${atRiskCount})` },
    { id: 'international', label: '🌐 International' },
    { id: 'firstgen', label: '⭐ First-gen' },
    { id: 'lowincome', label: '💛 Fin. aid' },
    { id: 'transfer', label: '↗ Transfer' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4C1D95, #6D28D9)', padding: '20px 32px 24px', color: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <BuddyAvatar mood="happy" size={36} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>UniBuddy School Portal</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>UCLA — Class of 2029 · Pre-arrival tracking</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 32px 48px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total students', value: MOCK_STUDENTS.length, sub: 'enrolled in UniBuddy', color: '#7C3AED', bg: 'white' },
            { label: 'Avg completion', value: `${avgCompletion}%`, sub: 'across all tasks', color: '#7C3AED', bg: 'white' },
            { label: 'At risk', value: atRiskCount, sub: 'need intervention', color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Fully done', value: completeCount, sub: 'checklist complete', color: '#059669', bg: '#F0FDF4' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '18px 20px', borderRadius: 16, background: stat.bg, border: '1px solid var(--border-secondary, #E9E4FF)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: stat.color, letterSpacing: '-1px', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress by cohort mini-chart */}
        <div style={{ padding: '18px 20px', borderRadius: 16, background: 'white', border: '1px solid #E9E4FF', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>Completion by cohort</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {(['international', 'firstgen', 'lowincome', 'transfer'] as CohortType[]).map(c => {
              const cohortStudents = MOCK_STUDENTS.filter(s => s.cohorts.includes(c))
              const avg = cohortStudents.length > 0 ? Math.round(cohortStudents.reduce((sum, s) => sum + s.completion, 0) / cohortStudents.length) : 0
              const col = cohortColors[c]
              return (
                <div key={c}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: col.text }}>{col.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col.text }}>{avg}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: col.bg, border: `1px solid ${col.border}` }}>
                    <div style={{ height: '100%', borderRadius: 3, background: col.text, width: `${avg}%`, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>{cohortStudents.length} students</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter + search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filter === tab.id ? '#7C3AED' : '#E9E4FF'}`, background: filter === tab.id ? '#7C3AED' : 'white', color: filter === tab.id ? 'white' : '#6B7280', transition: 'all 0.15s' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #DDD6FE', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: 200 }}
          />
        </div>

        {/* Student table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(student => {
            const risk = getRisk(student)
            const rs = riskStyle[risk]
            const evLevel = getEvolutionLevel(student.completion)
            const isExpanded = expandedId === student.id

            return (
              <div
                key={student.id}
                style={{ borderRadius: 14, background: 'white', border: `1.5px solid ${risk === 'critical' ? '#FECACA' : risk === 'at-risk' ? '#FED7AA' : '#E9E4FF'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}
              >
                {/* Main row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                >
                  {/* Buddy avatar with evolution */}
                  <div style={{ flexShrink: 0 }}>
                    <BuddyAvatar mood={risk === 'complete' ? 'celebrate' : risk === 'critical' ? 'urgent' : 'happy'} size={44} evolutionLevel={evLevel} />
                  </div>

                  {/* Name + cohorts */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{student.name}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {student.cohorts.map(c => (
                        <span key={c} style={{ padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: cohortColors[c].bg, color: cohortColors[c].text, border: `1px solid ${cohortColors[c].border}` }}>
                          {cohortColors[c].label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>{student.tasksDone}/{student.tasksTotal} tasks</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>{student.completion}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#E9E4FF' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: student.completion === 100 ? '#10B981' : '#7C3AED', width: `${student.completion}%` }} />
                    </div>
                  </div>

                  {/* Last active */}
                  <div style={{ width: 70, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>Last active</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: student.lastActive.includes('d ago') && parseInt(student.lastActive) > 4 ? '#DC2626' : '#374151', marginTop: 2 }}>{student.lastActive}</div>
                  </div>

                  {/* Risk badge */}
                  <div style={{ padding: '4px 12px', borderRadius: 20, background: rs.bg, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: rs.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: rs.text }}>{rs.label}</span>
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <span style={{ color: '#9CA3AF', fontSize: 14, flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                      <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFAFA', border: '1px solid #F3F4F6' }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Contact</div>
                        <div style={{ fontSize: 13, color: '#374151' }}>{student.email}</div>
                        {student.country && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>From: {student.country}</div>}
                      </div>
                      <div style={{ padding: '12px 14px', borderRadius: 10, background: student.criticalPending > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${student.criticalPending > 0 ? '#FECACA' : '#BBF7D0'}` }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Critical tasks pending</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: student.criticalPending > 0 ? '#DC2626' : '#15803D' }}>{student.criticalPending}</div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>tasks with urgent deadlines</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button style={{ flex: 1, padding: '9px', borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Send nudge →
                      </button>
                      <button style={{ padding: '9px 14px', borderRadius: 9, background: 'white', border: '1.5px solid #DDD6FE', color: '#7C3AED', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        View full checklist
                      </button>
                      {risk === 'critical' && (
                        <button style={{ padding: '9px 14px', borderRadius: 9, background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Flag for outreach
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: 14 }}>
              No students match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
