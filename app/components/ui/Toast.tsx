'use client'

interface ToastProps {
  message: string | null
}

export default function Toast({ message }: ToastProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#534AB7',
        color: 'white',
        fontSize: 12,
        padding: '8px 18px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
        zIndex: 40,
        minWidth: 160,
        textAlign: 'center',
        fontWeight: 500,
        pointerEvents: 'none',
        transition: 'opacity 0.25s ease',
        opacity: message ? 1 : 0,
        boxShadow: '0 4px 16px rgba(83,74,183,0.3)',
      }}
    >
      {message}
    </div>
  )
}
