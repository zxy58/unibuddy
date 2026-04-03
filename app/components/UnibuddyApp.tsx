'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import BottomNav from './ui/BottomNav'
import Toast from './ui/Toast'
import Dashboard from './screens/Dashboard'
import Playbook from './screens/Playbook'
import Growth from './screens/Growth'
import Community from './screens/Community'
import Inbox from './screens/Inbox'
import ShareModal from './modals/ShareModal'
import LogModal from './modals/LogModal'
import OnboardingFlow from './OnboardingFlow'
import { initialMoves, peers } from '@/app/lib/data'
import type { TabName, Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import { loadProfile, saveProfile, clearProfile } from '@/app/lib/profile'

export default function UnibuddyApp() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabName>('dash')
  const [activeMove, setActiveMove] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [aiExpanded, setAiExpanded] = useState<Record<string, boolean>>({})
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [savedMoves, setSavedMoves] = useState<Record<string, boolean>>({})
  const [moves, setMoves] = useState<Record<string, Move>>(initialMoves)
  const [currentShareMove, setCurrentShareMove] = useState<string>('i20')

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
  }, [])

  const goTo = useCallback((tab: TabName, moveKey?: string) => {
    setActiveTab(tab)
    if (moveKey) setActiveMove(moveKey)
    else if (tab !== 'playbook') setActiveMove(null)
  }, [])

  const openMove = useCallback((key: string) => {
    setActiveMove(key)
    setActiveTab('playbook')
  }, [])

  const closeMove = useCallback(() => setActiveMove(null), [])

  const openShareModal = useCallback((moveKey?: string) => {
    setCurrentShareMove(moveKey || activeMove || 'i20')
    setShareModalOpen(true)
  }, [activeMove])

  const closeShareModal = useCallback(() => setShareModalOpen(false), [])

  const openLogModal = useCallback((key?: string) => {
    if (key) setActiveMove(key)
    setLogModalOpen(true)
  }, [])

  const closeLogModal = useCallback(() => setLogModalOpen(false), [])

  const toggleAI = useCallback((id: string) => {
    setAiExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const toggleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }, [])

  const toggleSave = useCallback((moveKey: string) => {
    setSavedMoves((prev) => ({ ...prev, [moveKey]: !prev[moveKey] }))
    showToast('Move added to your playbook')
  }, [showToast])

  const handleLogConfirm = useCallback(() => {
    const key = activeMove
    if (key && moves[key]) {
      setMoves((prev) => ({
        ...prev,
        [key]: { ...prev[key], madeit: true },
      }))
    }
    showToast('Growth moment logged')
  }, [activeMove, moves, showToast])

  const handleShareConfirm = useCallback(() => {
    setShareModalOpen(false)
    showToast('Move shared to their playbook')
  }, [showToast])

  const handleShareAfterLog = useCallback(() => {
    setLogModalOpen(false)
    openShareModal(activeMove || undefined)
  }, [activeMove, openShareModal])

  const currentMoveData = currentShareMove ? moves[currentShareMove] : null
  const logMoveData = activeMove ? moves[activeMove] : null

  const screens: Record<TabName, React.ReactNode> = {
    dash: (
      <Dashboard
        goTo={goTo}
        openMove={openMove}
        openShareModal={openShareModal}
        aiExpanded={aiExpanded}
        toggleAI={toggleAI}
        profile={profile}
        onSignOut={handleSignOut}
      />
    ),
    playbook: (
      <Playbook
        moves={moves}
        activeMove={activeMove}
        openMove={openMove}
        closeMove={closeMove}
        openShareModal={openShareModal}
        openLogModal={openLogModal}
      />
    ),
    growth: <Growth openShareModal={openShareModal} />,
    community: (
      <Community
        openMove={openMove}
        openShareModal={openShareModal}
        likedPosts={likedPosts}
        toggleLike={toggleLike}
        savedMoves={savedMoves}
        toggleSave={toggleSave}
        showToast={showToast}
      />
    ),
    inbox: (
      <Inbox
        openMove={openMove}
        openShareModal={openShareModal}
        showToast={showToast}
        goTo={goTo}
      />
    ),
  }

  const phoneFrame = (children: React.ReactNode, showNav = false) => (
    <div
      style={{
        minHeight: '100dvh',
        background: '#EEE9FF',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 0',
      }}
    >
      <div
        style={{
          width: 375,
          minHeight: 780,
          maxHeight: 'calc(100dvh - 48px)',
          background: 'var(--bg-primary)',
          border: 'none',
          borderRadius: 40,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 32px 80px rgba(124,58,237,0.18), 0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 24px 4px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>●●●</span>
        </div>
        {children}
        {showNav && (
          <BottomNav
            active={activeTab}
            onNavigate={(tab) => {
              setActiveTab(tab)
              if (tab !== 'playbook') setActiveMove(null)
            }}
            inboxCount={1}
          />
        )}
      </div>
    </div>
  )

  // Show onboarding until profile is saved
  if (!profileLoaded) return null
  if (!profile) {
    return phoneFrame(
      <OnboardingFlow onComplete={handleProfileComplete} />
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#EEE9FF',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 0',
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 375,
          minHeight: 780,
          maxHeight: 'calc(100dvh - 48px)',
          background: 'var(--bg-primary)',
          border: 'none',
          borderRadius: 40,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 32px 80px rgba(124,58,237,0.18), 0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 24px 4px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>●●●</span>
        </div>

        {/* Brand header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px 10px',
            flexShrink: 0,
          }}
        >
          <button
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--bg-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: 'var(--text-secondary)',
            }}
          >
            ≡
          </button>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#7C3AED',
              letterSpacing: '-0.5px',
            }}
          >
            UniBuddy
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--bg-secondary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                color: 'var(--text-secondary)',
              }}
            >
              🔔
            </button>
            {profile && (
              <button
                onClick={handleSignOut}
                title="Sign out"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        <Toast message={toast} />

        {/* Modal overlay */}
        {(shareModalOpen || logModalOpen) && (
          <div
            onClick={() => {
              setShareModalOpen(false)
              setLogModalOpen(false)
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 20,
              display: 'flex',
              alignItems: 'flex-end',
              borderRadius: 36,
              overflow: 'hidden',
            }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
              {shareModalOpen && (
                <ShareModal
                  move={currentMoveData}
                  moveKey={currentShareMove}
                  peers={peers}
                  onClose={closeShareModal}
                  onConfirm={handleShareConfirm}
                />
              )}
              {logModalOpen && (
                <LogModal
                  move={logMoveData}
                  moveKey={activeMove || ''}
                  onClose={closeLogModal}
                  onConfirm={handleLogConfirm}
                  onShareAfter={handleShareAfterLog}
                />
              )}
            </div>
          </div>
        )}

        {/* Active screen */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {screens[activeTab]}
        </div>

        {/* Bottom nav */}
        <BottomNav
          active={activeTab}
          onNavigate={(tab) => {
            setActiveTab(tab)
            if (tab !== 'playbook') setActiveMove(null)
          }}
          inboxCount={1}
        />
      </div>
    </div>
  )
}
