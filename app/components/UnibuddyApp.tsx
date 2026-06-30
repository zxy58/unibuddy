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

  const iPhoneFrame = (children: React.ReactNode) => (
    <div style={{ minHeight: '100dvh', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 0' }}>
      <div style={{ position: 'relative' }}>
        {/* Left side buttons */}
        <div style={{ position: 'absolute', left: -3, top: 102, width: 3, height: 28, background: '#3A3A3A', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 148, width: 3, height: 58, background: '#3A3A3A', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 220, width: 3, height: 58, background: '#3A3A3A', borderRadius: '2px 0 0 2px' }} />
        {/* Right side button */}
        <div style={{ position: 'absolute', right: -3, top: 162, width: 3, height: 84, background: '#3A3A3A', borderRadius: '0 2px 2px 0' }} />
        {/* Bezel */}
        <div style={{ background: '#1C1C1E', borderRadius: 56, padding: 10, boxShadow: '0 28px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06)' }}>
          {/* Screen — iPhone 17 logical resolution 393×852 pt */}
          <div style={{ width: 393, height: 'min(852px, calc(100dvh - 96px))', background: '#F8F7F6', borderRadius: 48, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Dynamic Island + status bar */}
            <div style={{ flexShrink: 0, background: '#F8F7F6', paddingTop: 12 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', height: 34 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#000', letterSpacing: '-0.3px', zIndex: 2 }}>9:41</span>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 120, height: 34, background: 'black', borderRadius: 50, zIndex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <rect x="0"    y="6" width="2.5" height="5"  rx="0.6" fill="black" opacity="0.35"/>
                    <rect x="4.5"  y="4" width="2.5" height="7"  rx="0.6" fill="black" opacity="0.55"/>
                    <rect x="9"    y="2" width="2.5" height="9"  rx="0.6" fill="black" opacity="0.8"/>
                    <rect x="13.5" y="0" width="2.5" height="11" rx="0.6" fill="black"/>
                  </svg>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <circle cx="8" cy="10.5" r="1.2" fill="black"/>
                    <path d="M5.2 7.8C6 7 7 6.6 8 6.6s2 .4 2.8 1.2" stroke="black" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M2.5 5.2C4 3.6 5.9 2.7 8 2.7s4 .9 5.5 2.5" stroke="black" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 23, height: 11, border: '1.5px solid black', borderRadius: 3, padding: '1.5px 2px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '78%', height: '100%', background: 'black', borderRadius: 1.5 }} />
                    </div>
                    <div style={{ width: 2, height: 5, background: 'black', borderRadius: '0 1px 1px 0', opacity: 0.35, marginLeft: 1 }} />
                  </div>
                </div>
              </div>
              <div style={{ height: 8 }} />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  const phoneFrame = (children: React.ReactNode) => iPhoneFrame(children)

  if (!profileLoaded) return null
  if (!profile) {
    return phoneFrame(<OnboardingFlow onComplete={handleProfileComplete} />)
  }

  const headerBar = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 10px', flexShrink: 0, background: '#F8F7F6', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <div style={{ fontSize: 17, fontWeight: 900, color: '#0A0A0A', letterSpacing: '-0.6px' }}>UniBuddy</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#0A0A0A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800, letterSpacing: '-0.3px' }}
        >
          {profile.name?.[0]?.toUpperCase() || 'U'}
        </button>
      </div>
    </div>
  )

  const screenContent = (
    <div style={{ display: 'contents' }}>
      {headerBar}
      <Toast message={toast} />
      {guideOpen ? (
        <div key={activeGuide} className="slide-in-right" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <GuideDetail
            moveKey={activeGuide}
            move={moves[activeGuide]}
            profile={profile}
            onBack={closeGuide}
            onMarkDone={markDone}
            onAskBruno={navigateToAsk}
          />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
            {activeTab === 'timeline' && <div key="timeline" className="fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><Timeline profile={profile} moves={moves} openGuide={openGuide} evolutionLevel={evolutionLevel} /></div>}
            {activeTab === 'guides'   && <div key="guides"   className="fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><AllGuides moves={moves} profile={profile} openGuide={openGuide} /></div>}
            {activeTab === 'ask'      && <div key="ask"      className="fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><AskScreen profile={profile} moves={moves} openGuide={openGuide} initialInput={askPrompt} /></div>}
            {activeTab === 'profile'  && <div key="profile"  className="fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><ProfileScreen profile={profile} onSignOut={handleSignOut} onProfileUpdate={(p) => setProfile(p)} /></div>}
            {/* Ambient glow behind nav */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 130, zIndex: 9, background: 'linear-gradient(to top, rgba(136,120,204,0.10) 0%, rgba(136,120,204,0.03) 55%, transparent 100%)', pointerEvents: 'none' }} />
            <BottomNav active={activeTab} onNavigate={(tab) => setActiveTab(tab)} />
          </div>
        </>
      )}
    </div>
  )

  return iPhoneFrame(screenContent)
}
