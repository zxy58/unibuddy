'use client'

export type BuddyMood = 'happy' | 'celebrate' | 'thinking' | 'urgent' | 'wave'

interface Props {
  mood?: BuddyMood
  size?: number
  animate?: boolean
}

export default function BuddyAvatar({ mood = 'happy', size = 80, animate = false }: Props) {
  // Eye and mouth configs per mood
  const moods = {
    happy: {
      leftEye: <circle cx="39" cy="37" r="5" fill="#1F2937" />,
      rightEye: <circle cx="61" cy="37" r="5" fill="#1F2937" />,
      mouth: <path d="M 40 49 Q 50 57 60 49" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      blush: true,
    },
    celebrate: {
      leftEye: <path d="M 34 34 Q 39 29 44 34" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      rightEye: <path d="M 56 34 Q 61 29 66 34" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      mouth: <path d="M 38 49 Q 50 60 62 49" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />,
      blush: true,
    },
    thinking: {
      leftEye: <circle cx="39" cy="37" r="5" fill="#1F2937" />,
      rightEye: <circle cx="61" cy="37" r="5" fill="#1F2937" />,
      mouth: <path d="M 41 51 Q 50 49 59 51" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      blush: false,
    },
    urgent: {
      leftEye: <path d="M 34 39 Q 39 34 44 39" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      rightEye: <path d="M 56 39 Q 61 34 66 39" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      mouth: <path d="M 41 53 Q 50 49 59 53" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      blush: false,
    },
    wave: {
      leftEye: <circle cx="39" cy="37" r="5" fill="#1F2937" />,
      rightEye: <path d="M 56 34 Q 61 29 66 34" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      mouth: <path d="M 40 49 Q 50 57 60 49" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      blush: true,
    },
  }

  const m = moods[mood]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      {/* Drop shadow */}
      <ellipse cx="50" cy="95" rx="22" ry="5" fill="rgba(124,58,237,0.15)" />

      {/* Body (rounded base) */}
      <ellipse cx="50" cy="72" rx="18" ry="10" fill="#5B21B6" />

      {/* Head */}
      <circle cx="50" cy="44" r="28" fill="url(#buddyGrad)" />

      {/* Ear bumps */}
      <circle cx="24" cy="26" r="8" fill="#6D28D9" />
      <circle cx="76" cy="26" r="8" fill="#6D28D9" />
      <circle cx="24" cy="26" r="4" fill="#EDE9FE" />
      <circle cx="76" cy="26" r="4" fill="#EDE9FE" />

      {/* Graduation cap board */}
      <rect x="27" y="17" width="46" height="7" rx="2" fill="#4C1D95" />
      {/* Cap top */}
      <rect x="35" y="9" width="30" height="10" rx="3" fill="#3C1578" />
      {/* Tassel string */}
      <line x1="68" y1="13" x2="78" y2="25" stroke="#F97316" strokeWidth="2" />
      <circle cx="79" cy="27" r="4" fill="#F97316" />

      {/* Eye whites */}
      <circle cx="39" cy="37" r="10" fill="white" />
      <circle cx="61" cy="37" r="10" fill="white" />

      {/* Pupils */}
      {m.leftEye}
      {m.rightEye}

      {/* Eye shine */}
      <circle cx="41" cy="34" r="2.5" fill="white" />
      <circle cx="63" cy="34" r="2.5" fill="white" />

      {/* Blush */}
      {m.blush && (
        <>
          <circle cx="28" cy="46" r="7" fill="#F97316" opacity="0.35" />
          <circle cx="72" cy="46" r="7" fill="#F97316" opacity="0.35" />
        </>
      )}

      {/* Mouth */}
      {m.mouth}

      {/* Belly patch */}
      <ellipse cx="50" cy="64" rx="11" ry="7" fill="#EDE9FE" opacity="0.6" />

      {/* Gradient def */}
      <defs>
        <radialGradient id="buddyGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>

      {/* Celebrate sparkles */}
      {mood === 'celebrate' && (
        <>
          <text x="8" y="22" fontSize="14" style={{ animation: animate ? 'bounce 0.5s ease infinite alternate' : undefined }}>✨</text>
          <text x="76" y="18" fontSize="12">⭐</text>
          <text x="82" y="55" fontSize="11">🎉</text>
        </>
      )}

      {/* Wave arm */}
      {mood === 'wave' && (
        <path d="M 78 44 Q 90 35 88 52" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}
