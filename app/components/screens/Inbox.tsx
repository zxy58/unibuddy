'use client'

interface InboxProps {
  openMove: (key: string) => void
  openShareModal: (moveKey?: string) => void
  showToast: (msg: string) => void
  goTo: (tab: 'dash' | 'playbook' | 'growth' | 'community' | 'inbox') => void
}

export default function Inbox({ openMove, openShareModal, showToast, goTo }: InboxProps) {
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
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>Inbox</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Moves sent directly to you
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
        {/* Unread message */}
        <div
          style={{
            background: '#FAEEDA',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            border: '0.5px solid #FAC775',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#FAC775',
                color: '#412402',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              MK
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#412402' }}>
                Min-jun K. shared a move
              </div>
              <div style={{ fontSize: 11, color: '#633806' }}>2 hours ago · unread</div>
            </div>
          </div>

          {/* Move card */}
          <div
            onClick={() => openMove('critique')}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              marginBottom: 10,
              cursor: 'pointer',
              border: '0.5px solid #FAC775',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75' }} />
              <div style={{ fontSize: 10, fontWeight: 500, color: '#0F6E56' }}>From peer</div>
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
              How to survive — and use — critique culture
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Tap to open full move guide →
            </div>
          </div>

          {/* Peer note */}
          <div
            style={{
              background: '#FFF8EC',
              borderRadius: `0 var(--radius-md) var(--radius-md) 0`,
              borderLeft: '2px solid #BA7517',
              padding: '10px 12px',
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: '#633806', fontWeight: 500, marginBottom: 3 }}>
              Min-jun&apos;s note
            </div>
            <div style={{ fontSize: 13, color: '#412402', lineHeight: 1.5, fontStyle: 'italic' }}>
              &quot;This is the one thing I wish someone had told me before my first RISD crit. The
              third person language move alone changed everything.&quot;
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                showToast('Move added to your playbook')
                goTo('playbook')
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: '#633806',
                background: '#FAEEDA',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '6px 11px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Add to playbook
            </button>
            <button
              onClick={() => openShareModal('critique')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: '#534AB7',
                background: '#EEEDFE',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '6px 11px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Pass it on →
            </button>
          </div>
        </div>

        {/* Read message */}
        <div
          style={{
            border: '0.5px solid var(--border-tertiary)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            opacity: 0.7,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                flexShrink: 0,
              }}
            >
              PJ
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                Priya J. shared a move
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                3 days ago · added
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            The DSO email formula
          </div>
          <div style={{ fontSize: 12, color: '#1D9E75' }}>
            Added to your playbook ✓ · You made this move 2 days ago
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: 5,
            }}
          >
            Pass a move to someone
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: 10,
            }}
          >
            A move you&apos;ve made is worth more than one you&apos;ve only learned. When you share
            it, your growth moment travels with it.
          </div>
          <button
            onClick={() => goTo('playbook')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              color: '#534AB7',
              background: '#EEEDFE',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '6px 11px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Go to my playbook →
          </button>
        </div>

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
