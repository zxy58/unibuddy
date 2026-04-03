'use client'

import { useState } from 'react'

interface CommunityProps {
  openMove: (key: string) => void
  openShareModal: (moveKey?: string) => void
  likedPosts: Record<string, boolean>
  toggleLike: (postId: string) => void
  savedMoves: Record<string, boolean>
  toggleSave: (moveKey: string) => void
  showToast: (msg: string) => void
}

type CategoryFilter = 'all' | 'visa' | 'academic' | 'career' | 'financial'

const posts = [
  {
    id: 'post1',
    category: 'academic' as CategoryFilter,
    avatar: { initials: 'MK', bg: '#EEEDFE', text: '#3C3489' },
    name: 'Min-jun K.',
    action: 'shared a move',
    detail: 'South Korea · RISD · 2h ago',
    moveDot: '#1D9E75',
    moveLabel: 'From peer',
    moveLabelColor: '#0F6E56',
    moveTitle: 'How to survive — and use — critique culture',
    moveKey: 'critique',
    quote: '"The third person language move alone changed my entire crit experience. I wish someone had told me this in week 1."',
    likes: 12,
  },
  {
    id: 'post2',
    category: 'financial' as CategoryFilter,
    avatar: { initials: 'AL', bg: '#E1F5EE', text: '#0F6E56' },
    name: 'Amara L.',
    action: 'made a move',
    detail: 'Nigeria · RISD · Yesterday',
    moveDot: '#534AB7',
    moveLabel: 'Earned',
    moveLabelColor: '#3C3489',
    moveTitle: 'How to appeal your financial aid package',
    moveKey: 'i20',
    quote: '"I got an extra $4,000 by making this move. Nobody told me appealing was even possible. The framing in this guide is exactly what worked."',
    likes: 28,
  },
  {
    id: 'post3',
    category: 'visa' as CategoryFilter,
    avatar: { initials: 'PJ', bg: 'var(--bg-secondary)', text: 'var(--text-primary)' },
    name: 'Priya J.',
    action: 'made a move',
    detail: 'India · Columbia · 3 days ago',
    moveDot: '#BA7517',
    moveLabel: 'From peer',
    moveLabelColor: '#633806',
    moveTitle: 'The DSO email formula that gets a response in 48h',
    moveKey: 'dso',
    quote: '"I spent 2 weeks waiting before someone told me about the subject line formula. Making this move got my I-20 in 48 hours."',
    likes: 41,
  },
]

export default function Community({
  openMove,
  openShareModal,
  likedPosts,
  toggleLike,
  savedMoves,
  toggleSave,
  showToast,
}: CommunityProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({})

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'visa', label: 'Visa' },
    { id: 'academic', label: 'Academic' },
    { id: 'career', label: 'Career' },
    { id: 'financial', label: 'Financial' },
  ]

  const visible = posts.filter((p) => filter === 'all' || p.category === filter)

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
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>Community</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Moves shared by students like you
          </div>
        </div>
      </div>

      <div
        className="no-scroll"
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {/* Filters */}
        <div className="filter-row">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              style={{
                border: filter === c.id ? 'none' : '0.5px solid var(--border-secondary)',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
                background: filter === c.id ? '#534AB7' : 'var(--bg-primary)',
                color: filter === c.id ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: filter === c.id ? 500 : 400,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {visible.map((post) => {
          const liked = likedPosts[post.id]
          const saved = savedMoves[post.moveKey]
          return (
            <div
              key={post.id}
              style={{
                border: '0.5px solid var(--border-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                background: 'var(--bg-primary)',
              }}
            >
              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: post.avatar.bg,
                    color: post.avatar.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {post.avatar.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {post.name}{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>
                      {post.action}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{post.detail}</div>
                </div>
              </div>

              {/* Move card */}
              <div
                onClick={() => openMove(post.moveKey)}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  marginBottom: 10,
                  cursor: 'pointer',
                  border: '0.5px solid var(--border-tertiary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: post.moveDot,
                    }}
                  />
                  <div style={{ fontSize: 10, fontWeight: 500, color: post.moveLabelColor }}>
                    {post.moveLabel}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    marginBottom: 3,
                  }}
                >
                  {post.moveTitle}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  Tap to add to your playbook →
                </div>
              </div>

              {/* Quote — truncated until expanded */}
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    overflow: expandedQuotes[post.id] ? 'visible' : 'hidden',
                    display: expandedQuotes[post.id] ? 'block' : '-webkit-box',
                    WebkitLineClamp: expandedQuotes[post.id] ? undefined : 2,
                    WebkitBoxOrient: 'vertical',
                  } as React.CSSProperties}
                >
                  {post.quote}
                </div>
                <button
                  onClick={() => setExpandedQuotes((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 11,
                    color: '#534AB7',
                    cursor: 'pointer',
                    padding: '3px 0 0',
                    display: 'block',
                  }}
                >
                  {expandedQuotes[post.id] ? 'Read less' : 'Read more'}
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleLike(post.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: liked ? '#D85A30' : 'var(--text-secondary)',
                    background: liked ? '#FAECE7' : 'none',
                    border: liked ? '0.5px solid #D85A30' : '0.5px solid var(--border-secondary)',
                    borderRadius: 20,
                    padding: '5px 11px',
                    cursor: 'pointer',
                  }}
                >
                  {liked ? '♥' : '♡'} {post.likes + (liked ? 1 : 0)}
                </button>
                <button
                  onClick={() => {
                    if (!saved) {
                      toggleSave(post.moveKey)
                    } else {
                      showToast('Already in your playbook')
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: saved ? '#534AB7' : 'var(--text-secondary)',
                    background: saved ? '#EEEDFE' : 'none',
                    border: saved ? '0.5px solid #534AB7' : '0.5px solid var(--border-secondary)',
                    borderRadius: 20,
                    padding: '5px 11px',
                    cursor: 'pointer',
                  }}
                >
                  {saved ? '✓ In playbook' : '+ Add to playbook'}
                </button>
                <button
                  onClick={() => openShareModal(post.moveKey)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: '0.5px solid var(--border-secondary)',
                    borderRadius: 20,
                    padding: '5px 11px',
                    cursor: 'pointer',
                  }}
                >
                  ↗ Pass on
                </button>
              </div>
            </div>
          )
        })}
        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
