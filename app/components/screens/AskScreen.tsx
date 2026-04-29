'use client'

import { useState, useRef, useEffect } from 'react'
import type { Move } from '@/app/lib/types'
import type { UserProfile } from '@/app/lib/profile'
import BuddyAvatar from '@/app/components/ui/BuddyAvatar'

interface Props {
  profile: UserProfile
  moves: Record<string, Move>
  openGuide: (key: string) => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  guideKey?: string     // surfaces a guide card inline
  quickReplies?: string[]
}

// ── Smart response engine ──────────────────────────────────────────────────

function generateResponse(
  input: string,
  profile: UserProfile,
  moves: Record<string, Move>,
  history: Message[]
): Message {
  const q = input.toLowerCase()
  const name = profile.name.split(' ')[0]
  const school = profile.schoolName || 'your school'
  const isIntl = profile.cohorts.includes('international')
  const isFirstgen = profile.cohorts.includes('firstgen') || profile.cohorts.includes('lowincome')
  const isTransfer = profile.cohorts.includes('transfer')

  const urgent = Object.entries(moves)
    .filter(([, m]) => !m.done && m.urgency === 'critical')
    .sort((a, b) => (a[1].daysUntil ?? 99) - (b[1].daysUntil ?? 99))

  const nextUp = urgent[0]

  // ── Match patterns ──

  if (/what.*(should|do|next|first|start|urgent|important)/i.test(q) || q === 'help') {
    if (nextUp) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Your most urgent task right now is **${nextUp[1].title}**.\n\n${nextUp[1].daysUntil === 0 ? "This is due **today**." : nextUp[1].daysUntil === 1 ? "You have **1 day** left." : `You have **${nextUp[1].daysUntil} days** left.`}\n\nIf you miss it: ${nextUp[1].consequence}. Want me to walk you through it?`,
        guideKey: nextUp[0],
        quickReplies: ['Walk me through it', 'What else is urgent?', 'Show all my tasks'],
      }
    }
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `${name}, you're looking good — no critical deadlines right now. Your next steps are in the "Coming up" section of your timeline. Is there a specific topic I can help with?`,
      quickReplies: ['FAFSA help', 'Visa questions', 'Housing deadline', 'What is summer melt?'],
    }
  }

  if (/fafsa|financial aid|aid|grant|pell|loan/i.test(q)) {
    const m = moves['fafsa']
    const aid = moves['aidaccept']
    if (m && !m.done) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: isFirstgen
          ? `${name}, FAFSA is one of the most impactful things you can do right now. The high school class of 2021 left $3.75 billion in Pell Grant aid unclaimed — mostly because students missed their school's **priority deadline**, not the federal one.\n\nYour school's priority deadline is almost always months before June 30. Open the guide and I'll walk you through each step.`
          : `Your FAFSA is pending. The key thing to know: the federal deadline (June 30) is not the one that matters — your school's priority deadline is when institutional grants run out. Open the guide to complete it step by step.`,
        guideKey: 'fafsa',
        quickReplies: ['What is verification?', 'How do I accept my aid?', 'What if I missed the deadline?'],
      }
    }
    if (aid && !aid.done) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Your FAFSA is submitted — now you need to **accept your financial aid package**. It is not automatic. Grants and loans sit unaccepted in your student portal until you log in and confirm. This is where a lot of students lose money they earned.`,
        guideKey: 'aidaccept',
        quickReplies: ['What\'s the difference between grants and loans?', 'Do I have to accept everything?'],
      }
    }
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Great news — your financial aid steps are complete. If your package changed or you want to appeal, I can explain how that works. Just ask.`,
      quickReplies: ['How do I appeal my aid?', 'What is work-study?'],
    }
  }

  if (/visa|i-?20|i20|sevis|ds.?160|consulate|embassy|f.?1/i.test(q)) {
    if (!isIntl) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Visa questions are mainly for international students. Is there something specific about the process you're trying to understand, or are you helping someone else navigate it?`,
        quickReplies: ['Explain F-1 visa', 'What is an I-20?', 'Actually never mind'],
      }
    }
    const i20 = moves['i20']
    const sevis = moves['sevis']
    const visa = moves['visaapp']
    if (i20 && !i20.done) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Your I-20 is the first thing — without it, you can't book a visa appointment or pay your SEVIS fee. It comes from your school's International Students Office (DSO).\n\nThe subject line formula matters: **"I-20 request — [Full Name] — [Student ID] — arriving [date]"**. Students who use this get responses 3× faster. Open the guide for the full email template.`,
        guideKey: 'i20',
        quickReplies: ['What is a DSO?', 'After I-20, what\'s next?', 'How long does it take?'],
      }
    }
    if (sevis && !sevis.done) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Next up: SEVIS fee. This is **only payable at fmjfee.com** — fraudulent sites that look identical appear in search results. The fee is exactly $350 for F-1 students. Once paid, wait 3 business days before your visa appointment.`,
        guideKey: 'sevis',
        quickReplies: ['I already paid — what\'s next?', 'What happens if I paid the wrong site?'],
      }
    }
    if (visa && !visa.done) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Time to book your visa interview. At peak season (June–August), appointment slots at major consulates book out 60–90 days in advance.\n\n**Book your slot before finishing your DS-160** — slots disappear faster than forms are completed. You can finish the DS-160 after you have a date.`,
        guideKey: 'visaapp',
        quickReplies: ['What documents do I bring?', 'What if my visa is denied?'],
      }
    }
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Your visa steps look complete. If you have a question about your status after arrival, OPT/CPT eligibility, or SEVIS reporting — just ask.`,
      quickReplies: ['What is OPT?', 'Do I need to report my address?'],
    }
  }

  if (/housing|dorm|deposit|roommate|move.?in/i.test(q)) {
    const m = moves['housingdeposit']
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: m && !m.done
        ? `Housing spots at ${school} are assigned in the order deposits are received. The queue is literally first-come, first-served.\n\nFor international students especially: apply before your visa is confirmed. You can cancel penalty-free if your visa is denied — but you can't get a good room assignment back once it's gone.`
        : `Your housing deposit is complete. If you have questions about move-in dates, what to bring, or off-campus options, I can help.`,
      guideKey: m && !m.done ? 'housingdeposit' : undefined,
      quickReplies: ['When do I find out my room?', 'What if I\'m on the waitlist?', 'Off-campus safety tips'],
    }
  }

  if (/enroll|deposit|confirm|spot|may 1|decision day/i.test(q)) {
    const m = moves['enrolldeposit']
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: m && !m.done
        ? `The enrollment deposit is the step that converts your acceptance into an enrolled status. Without it, ${school} will release your spot — regardless of your admission.\n\nMay 1 is National Decision Day, but your school may have an earlier deadline. Check your admissions portal now.`
        : `Your enrollment deposit is paid — you're confirmed. Your next steps are unlocked in your timeline.`,
      guideKey: m && !m.done ? 'enrolldeposit' : undefined,
      quickReplies: ['What unlocks after the deposit?', 'Can I get a refund?'],
    }
  }

  if (/orientation|register|course|class|schedule/i.test(q)) {
    const m = moves['orientation']
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: isIntl
        ? `International student orientation runs the **week before** general orientation and covers I-20 check-in, campus ID, and local banking. Go to both if you can — general orientation assumes you already know things that international orientation explains.`
        : `Orientation is where course registration opens. The best sections — small class sizes, popular professors, good time slots — fill within hours. Arrive with a course list already prepared.`,
      guideKey: m && !m.done ? 'orientation' : undefined,
      quickReplies: ['How do I register for courses?', 'What if I can\'t make my session?'],
    }
  }

  if (/summer melt|melt|not enroll|dropout|not show/i.test(q)) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Summer melt is the name researchers gave to something specific: students who are **accepted to college, intend to enroll, but never show up in the fall**.\n\nNational estimates put the rate at 10–20% for first-gen and low-income students. The cause is almost always a missed deadline — not motivation, not academics. A deposit not paid, an aid package not accepted, an orientation not registered for.\n\nThat's exactly what your timeline is designed to prevent. Every task with a consequence line is a documented summer melt risk.`,
      quickReplies: ['Am I at risk?', 'What deadlines matter most?', 'What should I do right now?'],
    }
  }

  if (/credit|transfer credit|transcript/i.test(q)) {
    if (!isTransfer) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Credit transfer questions are mainly for transfer students. Is there something else I can help with?`,
        quickReplies: ['Go back', 'What should I focus on?'],
      }
    }
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Credit transfer appeals must be filed in your **first semester** at most schools — after that it requires Dean-level approval.\n\nThe key is going directly to the **department chair** (not admin staff) with your syllabi as evidence. They have the authority to reclassify credits. If they say no, escalate — don't accept the first answer.`,
      guideKey: 'credittransfer',
      quickReplies: ['What documents do I need?', 'What if the department says no?'],
    }
  }

  if (/health|insurance|waive|medical/i.test(q)) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Most schools auto-enroll you in their health insurance plan and charge $1,500–$3,000/year — unless you actively submit a waiver before the deadline.\n\nIf you're under 26 and on a parent's plan, you can usually waive. International students often can't waive unless they have U.S.-equivalent coverage. Check with your ISS office if you're unsure.`,
      guideKey: 'healthinsurance',
      quickReplies: ['When is the waiver deadline?', 'What counts as equivalent coverage?'],
    }
  }

  if (/notification|remind|sms|text|email|alert/i.test(q)) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `You can set up SMS and email reminders in your **Profile** tab. We'll send you a nudge 7 days, 3 days, and the day before each deadline — with a direct link to the guide.\n\nWant me to tell you what your next reminder would say?`,
      quickReplies: ['Open profile settings', 'What would the reminder say?', 'Yes, tell me'],
    }
  }

  if (/what is unibud|how does this work|explain|what can you/i.test(q)) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `UniBuddy makes college bureaucracy legible. It gives you a personalized, step-by-step guide through every administrative task between now and your first semester.\n\nI'm your in-app guide. Ask me anything about a specific task ("how do I do FAFSA?"), a deadline ("when is orientation?"), or a concept ("what is SEVIS?"). I'll surface the right guide and walk you through it.`,
      quickReplies: ['What should I do first?', 'Show me what\'s urgent', 'How do deadlines work?'],
    }
  }

  // Fallback
  const topics = [
    isFirstgen && 'FAFSA and financial aid',
    isIntl && 'I-20 and visa',
    'enrollment deposit',
    'housing',
    'orientation',
  ].filter(Boolean)

  return {
    id: Date.now().toString(),
    role: 'assistant',
    text: `I can help with that, ${name}. To give you the most specific answer, could you tell me which task you're working on?\n\nOr pick a topic:`,
    quickReplies: topics.slice(0, 4) as string[],
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AskScreen({ profile, moves, openGuide }: Props) {
  const name = profile.name.split(' ')[0]
  const urgent = Object.entries(moves).filter(([, m]) => !m.done && m.urgency === 'critical')

  const initialMessage: Message = {
    id: '0',
    role: 'assistant',
    text: urgent.length > 0
      ? `Hi ${name}! You have ${urgent.length} urgent task${urgent.length > 1 ? 's' : ''} right now. Want me to walk you through the most pressing one?`
      : `Hi ${name}! No critical deadlines right now. Ask me anything about your checklist, a specific process, or what to focus on next.`,
    quickReplies: urgent.length > 0
      ? ['Yes, walk me through it', 'What\'s urgent?', 'FAFSA help', 'Visa questions']
      : ['What should I do next?', 'FAFSA help', 'Visa questions', 'What is summer melt?'],
  }

  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() }
    const reply = generateResponse(text.trim(), profile, moves, messages)
    setMessages(prev => [...prev, userMsg, reply])
    setInput('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 18px 12px', borderBottom: '1px solid var(--border-tertiary)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <BuddyAvatar mood="thinking" size={36} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Ask UniBuddy</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>Step-by-step guidance, personalized to you</div>
        </div>
      </div>

      {/* Messages */}
      <div className="no-scroll" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id}>
            {/* Bubble */}
            <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: msg.guideKey || msg.quickReplies ? 6 : 0 }}>
              {msg.role === 'assistant' && (
                <div style={{ flexShrink: 0, marginRight: 4, alignSelf: 'flex-end' }}>
                  <BuddyAvatar mood="happy" size={28} />
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : 'white',
                border: msg.role === 'assistant' ? '1px solid var(--border-secondary)' : 'none',
                fontSize: 13, color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                lineHeight: 1.55, whiteSpace: 'pre-wrap',
              }}>
                {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </div>

            {/* Inline guide card */}
            {msg.guideKey && moves[msg.guideKey] && (
              <div style={{ marginLeft: 36, marginBottom: 6 }}>
                <button
                  onClick={() => openGuide(msg.guideKey!)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 12, background: '#F5F3FF', border: '1.5px solid #C4B5FD', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <span style={{ fontSize: 18 }}>📋</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#5B21B6' }}>{moves[msg.guideKey].title}</div>
                    <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 2 }}>{moves[msg.guideKey].steps.length} steps · Tap to open</div>
                  </div>
                  <span style={{ color: '#7C3AED', fontSize: 14 }}>→</span>
                </button>
              </div>
            )}

            {/* Quick replies */}
            {msg.quickReplies && msg.id === messages[messages.length - 1].id && (
              <div style={{ marginLeft: msg.role === 'assistant' ? 36 : 0, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {msg.quickReplies.map(qr => (
                  <button
                    key={qr}
                    onClick={() => send(qr)}
                    style={{ padding: '6px 12px', borderRadius: 20, background: 'white', border: '1.5px solid #C4B5FD', fontSize: 12, fontWeight: 600, color: '#7C3AED', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '10px 14px 16px', borderTop: '1px solid var(--border-tertiary)', background: 'var(--bg-primary)', flexShrink: 0, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
          placeholder="Ask anything about your checklist..."
          style={{ flex: 1, padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border-secondary)', fontSize: 13, color: 'var(--text-primary)', background: 'white', outline: 'none', fontFamily: 'inherit' }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          style={{ width: 42, height: 42, borderRadius: 12, background: input.trim() ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E9E4FF', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
