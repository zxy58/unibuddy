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
import { initialMoves } from '@/app/lib/data'
import type { TabName, Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { loadProfile, saveProfile, clearProfile } from '@/app/lib/profile'

export default function UnibuddyApp() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabName>('timeline')
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [moves, setMoves] = useState<Record<string, Move>>(initialMoves)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    setProfile(loadProfile())
    setProfileLoaded(true)
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

  const markDone = useCallback((key: string) => {
    setMoves(prev => ({ ...prev, [key]: { ...prev[key], done: true } }))
    showToast('Marked as done ✓')
  }, [showToast])

  // If a guide is open, show it full-screen (overlay)
  const guideOpen = activeGuide && moves[activeGuide]

  const phoneFrame = (children: React.ReactNode, showNav = false) => (
    <div style={{
      minHeight: '100dvh',
      background: '#EEE9FF',
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
        boxShadow: '0 32px 80px rgba(124,58,237,0.18), 0 8px 32px rgba(0,0,0,0.08)',
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 10px', flexShrink: 0 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#7C3AED', letterSpacing: '-0.5px' }}>UniBuddy</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔔</button>
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
        >
          {profile.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#EEE9FF', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 0' }}>
      <div style={{ width: 375, minHeight: 780, maxHeight: 'calc(100dvh - 48px)', background: 'var(--bg-primary)', borderRadius: 40, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 32px 80px rgba(124,58,237,0.18), 0 8px 32px rgba(0,0,0,0.08)' }}>

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
          />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {activeTab === 'timeline' && (
                <Timeline
                  profile={profile}
                  moves={moves}
                  openGuide={openGuide}
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
