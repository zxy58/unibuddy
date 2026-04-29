'use client'

import { useState } from 'react'
import type { UserProfile, CohortType, SchoolType, JourneyStage, GoalType } from '@/app/lib/profile'
import { cohortLabels, schoolTypeLabels, stageLabels } from '@/app/lib/profile'
import { cohortColors } from '@/app/lib/recommendations'

const goalLabels: Record<GoalType, string> = {
  visa: 'Visa & immigration',
  financial: 'Financial aid',
  academic: 'Academic success',
  career: 'Career planning',
  social: 'Social belonging',
}

interface Props {
  onComplete: (profile: UserProfile) => void
}

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cohorts, setCohorts] = useState<CohortType[]>([])
  const [schoolType, setSchoolType] = useState<SchoolType | ''>('')
  const [schoolName, setSchoolName] = useState('')
  const [country, setCountry] = useState('')
  const [stage, setStage] = useState<JourneyStage | ''>('')
  const [goals, setGoals] = useState<GoalType[]>([])
  const [approach, setApproach] = useState<'' | 'solo' | 'help' | 'wait'>('')
  const [newSituation, setNewSituation] = useState<'' | 'jump' | 'observe' | 'guide'>('')
  const [trustSource, setTrustSource] = useState<'' | 'experience' | 'official' | 'peers'>('')

  const TOTAL_STEPS = 7
  const isIntl = cohorts.includes('international')

  const toggleArr = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]

  const canNext = (): boolean => {
    switch (step) {
      case 0: return name.trim().length > 0 && email.includes('@')
      case 1: return cohorts.length > 0
      case 2: return !!schoolType && schoolName.trim().length > 0 && (!isIntl || country.trim().length > 0)
      case 3: return !!stage
      case 4: return goals.length > 0
      case 5: return !!approach && !!newSituation && !!trustSource
      default: return true
    }
  }

  const handleComplete = () => {
    onComplete({
      name: name.trim(),
      email: email.trim(),
      cohorts,
      schoolType: schoolType as SchoolType,
      schoolName: schoolName.trim(),
      country: country.trim(),
      stage: stage as JourneyStage,
      goals,
      approach: approach as 'solo' | 'help' | 'wait',
      newSituation: newSituation as 'jump' | 'observe' | 'guide',
      trustSource: trustSource as 'experience' | 'official' | 'peers',
    })
  }

  // --- Shared styles ---
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-secondary)',
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const primaryBtn = (disabled = false): React.CSSProperties => ({
    width: '100%',
    padding: '13px',
    background: disabled ? 'var(--border-secondary)' : '#F97316',
    color: disabled ? 'var(--text-tertiary)' : 'white',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  const backBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    padding: '10px 0 0',
    display: 'block',
    textAlign: 'center',
    width: '100%',
  }

  const radioCard = (active: boolean): React.CSSProperties => ({
    padding: '11px 14px',
    borderRadius: 'var(--radius-lg)',
    border: active ? '1.5px solid #7C3AED' : '1px solid var(--border-secondary)',
    background: active ? '#F5F3FF' : 'var(--bg-primary)',
    cursor: 'pointer',
    marginBottom: 8,
    transition: 'border-color 0.15s, background 0.15s',
  })

  // --- Progress bar ---
  const progressBar = step > 0 ? (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < step ? '#7C3AED' : i === step ? '#C4B5FD' : 'var(--border-secondary)',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  ) : null

  // --- Step content ---
  let content: React.ReactNode = null

  // STEP 0 — Welcome + sign in
  if (step === 0) {
    content = (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#7C3AED',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              margin: '0 auto 16px',
              letterSpacing: '-0.5px',
            }}
          >
            U
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.3px' }}>
            Welcome to UniBuddy
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
            The playbook for students who navigate college without a roadmap — first-gen, international, transfer, and beyond.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Your name</div>
            <input
              style={inputStyle}
              placeholder="First name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</div>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button style={primaryBtn(!canNext())} disabled={!canNext()} onClick={() => setStep(1)}>
          Get started →
        </button>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>
          No spam. Your profile stays on your device.
        </div>
      </div>
    )
  }

  // STEP 1 — Cohort
  if (step === 1) {
    const descriptions: Record<CohortType, string> = {
      international: 'F-1 or J-1 visa, studying from abroad',
      firstgen: 'First in your family to attend college',
      lowincome: 'Receiving financial aid or a Pell grant',
      transfer: 'Coming from a different college',
    }
    content = (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            Which of these describe you?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Select all that apply — this shapes your playbook.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {(Object.entries(cohortLabels) as [CohortType, string][]).map(([key, label]) => {
            const active = cohorts.includes(key)
            const colors = cohortColors[key]
            return (
              <div
                key={key}
                onClick={() => setCohorts(toggleArr(cohorts, key))}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: active ? `1.5px solid ${colors.text}` : '1px solid var(--border-secondary)',
                  background: active ? colors.bg : 'var(--bg-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: active ? 500 : 400, color: active ? colors.text : 'var(--text-primary)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {descriptions[key]}
                  </div>
                </div>
                {active && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: colors.text,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button style={primaryBtn(!canNext())} disabled={!canNext()} onClick={() => setStep(2)}>
          Continue →
        </button>
        <button style={backBtn} onClick={() => setStep(0)}>
          ← Back
        </button>
      </div>
    )
  }

  // STEP 2 — School
  if (step === 2) {
    content = (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            Your school
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            We use this to give you school-specific guidance.
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Type of school</div>
          {(Object.entries(schoolTypeLabels) as [SchoolType, string][]).map(([key, label]) => (
            <div key={key} onClick={() => setSchoolType(key)} style={radioCard(schoolType === key)}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: schoolType === key ? 500 : 400,
                  color: schoolType === key ? '#7C3AED' : 'var(--text-primary)',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>School name</div>
            <input
              style={inputStyle}
              placeholder="e.g. RISD, Columbia, UT Austin..."
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>
          {isIntl && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Home country</div>
              <input
                style={inputStyle}
                placeholder="e.g. South Korea, Nigeria, India..."
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          )}
        </div>
        <button style={primaryBtn(!canNext())} disabled={!canNext()} onClick={() => setStep(3)}>
          Continue →
        </button>
        <button style={backBtn} onClick={() => setStep(1)}>
          ← Back
        </button>
      </div>
    )
  }

  // STEP 3 — Stage
  if (step === 3) {
    const stageDescriptions: Record<JourneyStage, string> = {
      'pre-arrival': "Accepted — haven't started yet",
      'first-semester': 'Currently in your first semester',
      'sophomore': 'Second year or beyond',
      'transfer-first': 'Transfer — first semester at new school',
    }
    content = (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            Where are you in your journey?
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          {(Object.entries(stageLabels) as [JourneyStage, string][]).map(([key, label]) => (
            <div key={key} onClick={() => setStage(key)} style={radioCard(stage === key)}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: stage === key ? 500 : 400,
                  color: stage === key ? '#7C3AED' : 'var(--text-primary)',
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
                {stageDescriptions[key]}
              </div>
            </div>
          ))}
        </div>
        <button style={primaryBtn(!canNext())} disabled={!canNext()} onClick={() => setStep(4)}>
          Continue →
        </button>
        <button style={backBtn} onClick={() => setStep(2)}>
          ← Back
        </button>
      </div>
    )
  }

  // STEP 4 — Goals
  if (step === 4) {
    content = (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            What are you focused on?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Pick your top priorities — we&apos;ll surface the most relevant moves first.
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {(Object.entries(goalLabels) as [GoalType, string][]).map(([key, label]) => {
            const active = goals.includes(key)
            return (
              <button
                key={key}
                onClick={() => setGoals(toggleArr(goals, key))}
                style={{
                  padding: '9px 15px',
                  borderRadius: 20,
                  border: active ? '1.5px solid #7C3AED' : '1px solid var(--border-secondary)',
                  background: active ? '#EDE9FE' : 'var(--bg-primary)',
                  color: active ? '#7C3AED' : 'var(--text-secondary)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        <button style={primaryBtn(!canNext())} disabled={!canNext()} onClick={() => setStep(5)}>
          Continue →
        </button>
        <button style={backBtn} onClick={() => setStep(3)}>
          ← Back
        </button>
      </div>
    )
  }

  // STEP 5 — Personality
  if (step === 5) {
    const q1: Array<{ val: 'solo' | 'help' | 'wait'; label: string }> = [
      { val: 'solo', label: 'Figure it out on my own' },
      { val: 'help', label: 'Ask for help right away' },
      { val: 'wait', label: 'Wait and see if it resolves' },
    ]
    const q2: Array<{ val: 'jump' | 'observe' | 'guide'; label: string }> = [
      { val: 'jump', label: 'Jump in and learn as I go' },
      { val: 'observe', label: 'Observe how others handle it first' },
      { val: 'guide', label: 'Look for someone to show me the ropes' },
    ]
    const q3: Array<{ val: 'experience' | 'official' | 'peers'; label: string }> = [
      { val: 'experience', label: "Someone who's been through it" },
      { val: 'official', label: "Official sources (school, gov't)" },
      { val: 'peers', label: 'Peers currently at my school' },
    ]
    const qLabel: React.CSSProperties = {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-primary)',
      marginBottom: 8,
    }
    content = (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            How you operate
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            No wrong answers — this shapes how UniBuddy talks to you.
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={qLabel}>When you hit a problem, you usually...</div>
          {q1.map((o) => (
            <div key={o.val} onClick={() => setApproach(o.val)} style={radioCard(approach === o.val)}>
              <div style={{ fontSize: 13, fontWeight: approach === o.val ? 500 : 400, color: approach === o.val ? '#7C3AED' : 'var(--text-primary)' }}>
                {o.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={qLabel}>In a new environment, you tend to...</div>
          {q2.map((o) => (
            <div key={o.val} onClick={() => setNewSituation(o.val)} style={radioCard(newSituation === o.val)}>
              <div style={{ fontSize: 13, fontWeight: newSituation === o.val ? 500 : 400, color: newSituation === o.val ? '#7C3AED' : 'var(--text-primary)' }}>
                {o.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={qLabel}>You trust advice most when it comes from...</div>
          {q3.map((o) => (
            <div key={o.val} onClick={() => setTrustSource(o.val)} style={radioCard(trustSource === o.val)}>
              <div style={{ fontSize: 13, fontWeight: trustSource === o.val ? 500 : 400, color: trustSource === o.val ? '#7C3AED' : 'var(--text-primary)' }}>
                {o.label}
              </div>
            </div>
          ))}
        </div>

        <button style={primaryBtn(!canNext())} disabled={!canNext()} onClick={() => setStep(6)}>
          Continue →
        </button>
        <button style={backBtn} onClick={() => setStep(4)}>
          ← Back
        </button>
      </div>
    )
  }

  // STEP 6 — Review
  if (step === 6) {
    content = (
      <div>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
            You&apos;re set, {name.split(' ')[0]}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your personalized playbook is ready.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {/* Identity */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#EDE9FE',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {name[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{email}</div>
              </div>
            </div>
          </div>

          {/* Cohorts */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Your cohorts
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cohorts.map((c) => (
                <span
                  key={c}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    background: cohortColors[c].bg,
                    color: cohortColors[c].text,
                    border: `1px solid ${cohortColors[c].border}`,
                  }}
                >
                  {cohortLabels[c]}
                </span>
              ))}
            </div>
          </div>

          {/* School */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              School
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{schoolName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {schoolTypeLabels[schoolType as SchoolType]}
              {country ? ` · ${country}` : ''}
            </div>
          </div>

          {/* Goals */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Goals
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {goals.map((g) => (
                <span
                  key={g}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    background: '#EDE9FE',
                    color: '#5B21B6',
                    border: '1px solid #C4B5FD',
                  }}
                >
                  {goalLabels[g]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button style={primaryBtn()} onClick={handleComplete}>
          Build my playbook →
        </button>
        <button style={backBtn} onClick={() => setStep(5)}>
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 32px' }}>
      {progressBar}
      {content}
    </div>
  )
}
