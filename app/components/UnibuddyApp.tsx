'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import BottomNav from './ui/BottomNav'
import Toast from './ui/Toast'
import Timeline from './screens/Timeline'
import GuideDetail from './screens/GuideDetail'
import AllGuides from './screens/AllGuides'
import AskScreen from './screens/AskScreen'
import ProfileScreen from './screens/ProfileScreen'
import OnboardingFlow from './OnboardingFlow'
import BuddyAvatar from './ui/BuddyAvatar'
import type { BuddyMood } from './ui/BuddyAvatar'
import { initialMoves } from '@/app/lib/data'
import type { TabName, Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { loadProfile, saveProfile, clearProfile } from '@/app/lib/profile'

export default function UnibuddyApp() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabName>('timeline')
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const [askPrompt, setAskPrompt] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [moves, setMoves] = useState<Record<string, Move>>(initialMoves)
  const [streak, setStreak] = useState(1)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    setProfile(loadProfile())
    setProfileLoaded(true)
    // Streak tracking
    const today = new Date().toDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const data = JSON.parse(localStorage.getItem('ub_streak') || `{"count":1,"last":""}`)
    if (data.last === today) {
      setStreak(data.count)
    } else if (data.last === yesterday.toDateString()) {
      const next = { count: data.count + 1, last: today }
      localStorage.setItem('ub_streak', JSON.stringify(next))
      setStreak(next.count)
    } else {
      const reset = { count: 1, last: today }
      localStorage.setItem('ub_streak', JSON.stringify(reset))
      setStreak(1)
    }
  }, [])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const handleProfileComplete = useCallback((p: UserProfile) => {
    saveProfile(p)
    setProfile(p)
  }, [])

  const handleSignOut = useCallback(() => {
    clearProfile()
    setProfile(null)
    setActiveTab('timeline')
  }, [])

  const openGuide = useCallback((key: string) => {
    setActiveGuide(key)
  }, [])

  const closeGuide = useCallback(() => {
    setActiveGuide(null)
  }, [])

  const navigateToAsk = useCallback((prompt: string) => {
    setAskPrompt(prompt)
    setActiveGuide(null)
    setActiveTab('ask')
  }, [])

  const markDone = useCallback((key: string) => {
    setMoves(prev => ({ ...prev, [key]: { ...prev[key], done: true } }))
    showToast('Marked as done ✓')
  }, [showToast])

  // If a guide is open, show it full-screen (overlay)
  const guideOpen = activeGuide && moves[activeGuide]

  const criticalCount = Object.values(moves).filter(m => !m.done && m.urgency === 'critical').length
  const completedCount = Object.values(moves).filter(m => m.done).length
  const totalCount = Object.values(moves).length
  const allDone = completedCount === totalCount
  const buddyMood: BuddyMood = allDone ? 'celebrate' : criticalCount > 0 ? 'urgent' : 'happy'

  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const evolutionLevel = (
    allDone ? 5 :
    pct > 75 ? 4 :
    pct > 50 ? 3 :
    pct > 25 ? 2 :
    pct > 0  ? 1 : 0
  ) as 0 | 1 | 2 | 3 | 4 | 5

  const phoneFrame = (children: React.ReactNode, showNav = false) => (
    <div style={{
      minHeight: '100dvh',
      background: '#F8F4F0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '24px 0',
    }}>
      <div style={{
        width: 375,
        minHeight: 780,
        maxHeight: 'calc(100dvh - 48px)',
        background: 'var(--bg-primary)',
        borderRadius: 40,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 32px 80px rgba(78,54,41,0.18), 0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 4px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>●●●</span>
        </div>
        {children}
        {showNav && (
          <BottomNav
            active={activeTab}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
      </div>
    </div>
  )

  if (!profileLoaded) return null
  if (!profile) {
    return phoneFrame(<OnboardingFlow onComplete={handleProfileComplete} />)
  }

  const headerBar = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 8px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BuddyAvatar mood={buddyMood} size={36} evolutionLevel={evolutionLevel} />
        <div style={{ fontSize: 17, fontWeight: 800, color: '#4E3629', letterSpacing: '-0.5px' }}>UniBuddy</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Streak counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
          <span style={{ fontSize: 14 }}>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#EA580C' }}>{streak}</span>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#4E3629', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
        >
          {profile.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#F8F4F0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 0' }}>
      <div style={{ width: 375, minHeight: 780, maxHeight: 'calc(100dvh - 48px)', background: 'var(--bg-primary)', borderRadius: 40, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 32px 80px rgba(78,54,41,0.18), 0 8px 32px rgba(0,0,0,0.08)' }}>

        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px 4px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>●●●</span>
        </div>

        {headerBar}
        <Toast message={toast} />

        {/* Guide overlay */}
        {guideOpen ? (
          <GuideDetail
            moveKey={activeGuide}
            move={moves[activeGuide]}
            profile={profile}
            onBack={closeGuide}
            onMarkDone={markDone}
            onAskBruno={navigateToAsk}
          />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {activeTab === 'timeline' && (
                <Timeline
                  profile={profile}
                  moves={moves}
                  openGuide={openGuide}
                  evolutionLevel={evolutionLevel}
                />
              )}
              {activeTab === 'guides' && (
                <AllGuides
                  moves={moves}
                  profile={profile}
                  openGuide={openGuide}
                />
              )}
              {activeTab === 'ask' && (
                <AskScreen
                  profile={profile}
                  moves={moves}
                  openGuide={openGuide}
                  initialInput={askPrompt}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileScreen
                  profile={profile}
                  onSignOut={handleSignOut}
                  onProfileUpdate={(p) => setProfile(p)}
                />
              )}
            </div>
            <BottomNav
              active={activeTab}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          </>
        )}
      </div>
    </div>
  )
}
