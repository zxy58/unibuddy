'use client'

import { useId } from 'react'

export type BuddyMood = 'happy' | 'celebrate' | 'thinking' | 'urgent' | 'wave'
export type BuddyEvolutionLevel = 0 | 1 | 2 | 3 | 4 | 5

interface Props {
  mood?: BuddyMood
  size?: number
  animate?: boolean
  evolutionLevel?: BuddyEvolutionLevel
}

export default function BuddyAvatar({ mood = 'happy', size = 80, animate = false, evolutionLevel = 0 }: Props) {
  const uid = useId().replace(/:/g, '_')
  const gradId = `buddyGrad_${uid}`
  const glowId = `buddyGlow_${uid}`

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

  // Evolution: head gradient shifts gold at higher levels
  const headColor1 = evolutionLevel >= 4 ? '#A78BFA' : '#8B5CF6'
  const headColor2 = evolutionLevel >= 4 ? '#7C3AED' : '#6D28D9'
  const tassleColor = evolutionLevel >= 2 ? '#FFD700' : '#F97316'
  const capOffset = evolutionLevel === 5 ? -8 : 0 // cap floats at level 5

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={gradId} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={headColor1} />
          <stop offset="100%" stopColor={headColor2} />
        </radialGradient>
        {evolutionLevel >= 4 && (
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Level 4+: glow ring behind head */}
      {evolutionLevel >= 4 && (
        <circle cx="50" cy="44" r="36" fill={`url(#${glowId})`} />
      )}

      {/* Drop shadow */}
      <ellipse cx="50" cy="100" rx="22" ry="5" fill="rgba(124,58,237,0.15)" />

      {/* Body */}
      <ellipse cx="50" cy="77" rx="18" ry="10" fill="#5B21B6" />

      {/* Level 2+: medal on body */}
      {evolutionLevel >= 2 && (
        <>
          <circle cx="50" cy="72" r="7" fill="#FFD700" />
          <circle cx="50" cy="72" r="5" fill="#FFA500" />
          <text x="47" y="76" fontSize="6" fill="white" fontWeight="bold">★</text>
        </>
      )}

      {/* Head */}
      <circle cx="50" cy="44" r="28" fill={`url(#${gradId})`} />

      {/* Ear bumps */}
      <circle cx="24" cy="26" r="8" fill="#6D28D9" />
      <circle cx="76" cy="26" r="8" fill="#6D28D9" />
      <circle cx="24" cy="26" r="4" fill="#EDE9FE" />
      <circle cx="76" cy="26" r="4" fill="#EDE9FE" />

      {/* Graduation cap — floats at level 5 */}
      <g transform={`translate(0, ${capOffset})`}>
        <rect x="27" y="17" width="46" height="7" rx="2" fill="#4C1D95" />
        <rect x="35" y="9" width="30" height="10" rx="3" fill="#3C1578" />
        <line x1="68" y1="13" x2="78" y2="25" stroke={tassleColor} strokeWidth="2" />
        <circle cx="79" cy="27" r="4" fill={tassleColor} />
        {/* Level 1+: star badge on cap */}
        {evolutionLevel >= 1 && (
          <text x="30" y="16" fontSize="8">⭐</text>
        )}
      </g>

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
      <ellipse cx="50" cy="69" rx="11" ry="7" fill="#EDE9FE" opacity="0.6" />

      {/* Level 3+: sparkles */}
      {evolutionLevel >= 3 && (
        <>
          <circle cx="10" cy="20" r="2.5" fill="#FFD700" opacity="0.8" />
          <circle cx="14" cy="50" r="1.5" fill="#A78BFA" opacity="0.9" />
          <circle cx="88" cy="15" r="2" fill="#FFD700" opacity="0.8" />
          <circle cx="91" cy="48" r="1.5" fill="#F97316" opacity="0.9" />
          <circle cx="50" cy="2" r="2" fill="#C4B5FD" opacity="0.9" />
          <text x="3" y="35" fontSize="8" opacity="0.8">✦</text>
          <text x="87" y="65" fontSize="7" opacity="0.8">✦</text>
        </>
      )}

      {/* Celebrate sparkles (mood) */}
      {mood === 'celebrate' && (
        <>
          <text x="2" y="22" fontSize="14" style={{ animation: animate ? 'bounce 0.5s ease infinite alternate' : undefined }}>✨</text>
          <text x="76" y="12" fontSize="12">⭐</text>
          <text x="82" y="55" fontSize="11">🎉</text>
        </>
      )}

      {/* Level 5: confetti burst */}
      {evolutionLevel === 5 && (
        <>
          <circle cx="20" cy="10" r="3" fill="#F97316" />
          <circle cx="80" cy="8" r="2.5" fill="#10B981" />
          <circle cx="5" cy="60" r="2" fill="#FFD700" />
          <circle cx="95" cy="30" r="2.5" fill="#EC4899" />
          <text x="0" y="15" fontSize="10">🎉</text>
          <text x="80" y="95" fontSize="10">🎊</text>
        </>
      )}

      {/* Wave arm */}
      {mood === 'wave' && (
        <path d="M 78 44 Q 90 35 88 52" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}
