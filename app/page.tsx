import UnibuddyApp from './components/UnibuddyApp'
import type { UserProfile } from './lib/profile'

const brownProfile: UserProfile = {
  name: 'Elaine Zhang',
  email: 'elaine@brown.edu',
  schoolName: 'Brown University',
  country: 'China',
  cohorts: ['international'],
  startDate: '2025-09',
  phone: '',
  notifySMS: false,
  notifyEmail: true,
}

const risdProfile: UserProfile = {
  name: 'Marcus Rivera',
  email: 'marcus@risd.edu',
  schoolName: 'RISD',
  country: 'Mexico',
  cohorts: ['international', 'firstgen'],
  startDate: '2025-09',
  phone: '',
  notifySMS: false,
  notifyEmail: true,
}

export default function Page() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0F0F14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      padding: '40px 32px',
      flexWrap: 'wrap',
    }}>
      {/* Brown University */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <UnibuddyApp theme="brown" embed demoProfile={brownProfile} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C00B0B', letterSpacing: '0.5px' }}>BROWN UNIVERSITY</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Bruno the Bear</div>
        </div>
      </div>

      {/* RISD */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <UnibuddyApp theme="risd" embed demoProfile={risdProfile} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#003DA5', letterSpacing: '0.5px' }}>RISD</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Rhode Island School of Design</div>
        </div>
      </div>
    </div>
  )
}
