'use client'

import { useId } from 'react'

export type BuddyMood = 'happy' | 'celebrate' | 'thinking' | 'urgent' | 'wave'
export type BuddyEvolutionLevel = 0 | 1 | 2 | 3 | 4 | 5

// Brown University palette
const FUR_DARK  = '#4A3728'
const FUR_MID   = '#8B5E3C'
const FUR_LIGHT = '#C8956C'
const CAP_RED   = '#C00B0B'  // Brown University cardinal
const CAP_BROWN = '#4E3629'  // Brown University brown

const SCHOOL_CAPS: Record<string, { capColor: string; capDark: string; letter: string }> = {
  brown: { capColor: '#C00B0B', capDark: '#4E3629', letter: 'B' },
  risd:  { capColor: '#003DA5', capDark: '#1B2A4A', letter: 'R' },
}

interface Props {
  mood?: BuddyMood
  size?: number
  animate?: boolean
  evolutionLevel?: BuddyEvolutionLevel
  school?: 'brown' | 'risd'
}

export default function BuddyAvatar({ mood = 'happy', size = 80, animate = false, evolutionLevel = 0, school = 'brown' }: Props) {
  const uid = useId().replace(/:/g, '_')
  const gradId = `brunoGrad_${uid}`
  const glowId = `brunoGlow_${uid}`

  const moods = {
    happy: {
      leftEye:  <circle cx="38" cy="38" r="4.5" fill="#1F2937" />,
      rightEye: <circle cx="62" cy="38" r="4.5" fill="#1F2937" />,
      mouth: <path d="M 43 53 Q 50 59 57 53" stroke={FUR_DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />,
      brow: null,
      blush: true,
    },
    celebrate: {
      leftEye:  <path d="M 33 36 Q 38 31 43 36" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      rightEye: <path d="M 57 36 Q 62 31 67 36" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      mouth: <path d="M 41 52 Q 50 61 59 52" stroke={FUR_DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      brow: null,
      blush: true,
    },
    thinking: {
      leftEye:  <circle cx="38" cy="38" r="4.5" fill="#1F2937" />,
      rightEye: <circle cx="62" cy="38" r="4.5" fill="#1F2937" />,
      mouth: <path d="M 44 55 Q 50 53 57 55" stroke={FUR_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />,
      brow: <path d="M 58 31 Q 65 28 68 32" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />,
      blush: false,
    },
    urgent: {
      leftEye:  <path d="M 33 40 Q 38 35 43 40" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      rightEye: <path d="M 57 40 Q 62 35 67 40" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      mouth: <path d="M 43 56 Q 50 53 57 56" stroke={FUR_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />,
      brow: null,
      blush: false,
    },
    wave: {
      leftEye:  <circle cx="38" cy="38" r="4.5" fill="#1F2937" />,
      rightEye: <path d="M 57 35 Q 62 30 67 35" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
      mouth: <path d="M 43 53 Q 50 59 57 53" stroke={FUR_DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />,
      brow: null,
      blush: true,
    },
  }

  const m = moods[mood]
  const cap         = SCHOOL_CAPS[school] ?? SCHOOL_CAPS.brown
  const tassleColor = evolutionLevel >= 2 ? '#FFD700' : FUR_LIGHT
  const capOffset   = evolutionLevel === 5 ? -8 : 0

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={gradId} cx="45%" cy="38%" r="60%">
          <stop offset="0%"   stopColor={evolutionLevel >= 4 ? '#B07D55' : FUR_MID} />
          <stop offset="100%" stopColor={FUR_DARK} />
        </radialGradient>
        {evolutionLevel >= 4 && (
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#D4A574" stopOpacity="0.55" />
            <stop offset="100%" stopColor={FUR_DARK} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Level 4+: warm glow ring */}
      {evolutionLevel >= 4 && (
        <circle cx="50" cy="46" r="38" fill={`url(#${glowId})`} />
      )}

      {/* Drop shadow */}
      <ellipse cx="50" cy="103" rx="22" ry="5" fill="rgba(74,55,40,0.22)" />

      {/* Body */}
      <ellipse cx="50" cy="82" rx="20" ry="12" fill={FUR_DARK} />

      {/* Belly patch */}
      <ellipse cx="50" cy="78" rx="12" ry="8" fill={FUR_LIGHT} opacity="0.65" />

      {/* Level 2+: medal */}
      {evolutionLevel >= 2 && (
        <>
          <circle cx="50" cy="76" r="7" fill="#FFD700" />
          <circle cx="50" cy="76" r="5" fill="#FFA500" />
          <text x="47" y="80" fontSize="6" fill="white" fontWeight="bold">★</text>
        </>
      )}

      {/* Head */}
      <circle cx="50" cy="46" r="28" fill={`url(#${gradId})`} />

      {/* Ears — bear-round with inner ear */}
      <circle cx="24" cy="23" r="12" fill={FUR_DARK} />
      <circle cx="76" cy="23" r="12" fill={FUR_DARK} />
      <circle cx="24" cy="23" r="7"  fill={FUR_LIGHT} />
      <circle cx="76" cy="23" r="7"  fill={FUR_LIGHT} />

      {/* Muzzle */}
      <ellipse cx="50" cy="55" rx="15" ry="11" fill={FUR_LIGHT} />

      {/* Nose */}
      <ellipse cx="50" cy="49" rx="5.5" ry="3.5" fill={FUR_DARK} />

      {/* Graduation cap — floats at level 5 */}
      <g transform={`translate(0, ${capOffset})`}>
        {/* Cap body */}
        <rect x="33" y="9"  width="34" height="12" rx="3" fill={cap.capDark} />
        {/* Mortarboard brim */}
        <rect x="22" y="19" width="56" height="7"  rx="2" fill={cap.capColor} />
        {/* School letter on cap */}
        <text x="44" y="19" fontSize="9" fill={cap.capColor} fontWeight="900">{cap.letter}</text>
        {/* Tassel */}
        <line x1="72" y1="13" x2="83" y2="27" stroke={tassleColor} strokeWidth="2.2" />
        <circle cx="84" cy="29" r="4.5" fill={tassleColor} />
        {/* Level 1+: star badge */}
        {evolutionLevel >= 1 && (
          <text x="25" y="18" fontSize="8">⭐</text>
        )}
      </g>

      {/* Eye whites */}
      <circle cx="38" cy="38" r="9.5" fill="white" />
      <circle cx="62" cy="38" r="9.5" fill="white" />

      {/* Pupils */}
      {m.leftEye}
      {m.rightEye}

      {/* Eye shine */}
      <circle cx="40" cy="35" r="2.5" fill="white" />
      <circle cx="64" cy="35" r="2.5" fill="white" />

      {/* Brow (thinking) */}
      {m.brow}

      {/* Blush — cardinal red tint */}
      {m.blush && (
        <>
          <circle cx="25" cy="51" r="7" fill={CAP_RED} opacity="0.2" />
          <circle cx="75" cy="51" r="7" fill={CAP_RED} opacity="0.2" />
        </>
      )}

      {/* Mouth — sits on muzzle */}
      {m.mouth}

      {/* Level 3+: sparkles */}
      {evolutionLevel >= 3 && (
        <>
          <circle cx="10" cy="20" r="2.5" fill="#FFD700"  opacity="0.85" />
          <circle cx="14" cy="54" r="1.5" fill={FUR_LIGHT} opacity="0.9" />
          <circle cx="88" cy="15" r="2"   fill="#FFD700"  opacity="0.85" />
          <circle cx="92" cy="52" r="1.5" fill={CAP_RED}  opacity="0.8" />
          <circle cx="50" cy="2"  r="2"   fill={FUR_LIGHT} opacity="0.9" />
          <text x="3"  y="37" fontSize="8" opacity="0.8">✦</text>
          <text x="87" y="68" fontSize="7" opacity="0.8">✦</text>
        </>
      )}

      {/* Celebrate burst */}
      {mood === 'celebrate' && (
        <>
          <text x="2"  y="22" fontSize="14" style={{ animation: animate ? 'bounce 0.5s ease infinite alternate' : undefined }}>✨</text>
          <text x="76" y="12" fontSize="12">⭐</text>
          <text x="82" y="58" fontSize="11">🎉</text>
        </>
      )}

      {/* Level 5: confetti burst */}
      {evolutionLevel === 5 && (
        <>
          <circle cx="20" cy="10" r="3"   fill={CAP_RED} />
          <circle cx="80" cy="8"  r="2.5" fill="#10B981" />
          <circle cx="5"  cy="62" r="2"   fill="#FFD700" />
          <circle cx="95" cy="30" r="2.5" fill={FUR_LIGHT} />
          <text x="0"  y="15" fontSize="10">🎉</text>
          <text x="80" y="97" fontSize="10">🎊</text>
        </>
      )}

      {/* Wave arm */}
      {mood === 'wave' && (
        <path d="M 78 50 Q 93 38 91 56" stroke={FUR_MID} strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}
