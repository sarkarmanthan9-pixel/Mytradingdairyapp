import { useApp, SYNC } from './context/AppContext.jsx'
import { NavItem, Toast } from './components/UI.jsx'
import Dashboard    from './pages/Dashboard.jsx'
import Journal      from './pages/Journal.jsx'
import SheetsSetup  from './pages/SheetsSetup.jsx'
import ChartJournal from './pages/ChartJournal.jsx'
import { Analytics, Calendar, Reports } from './pages/Analytics.jsx'
import { Capital, Playbook, Risk, Diary, Settings, Profile } from './pages/OtherPages.jsx'
import { calcPnL, inr, sign, pnlColor } from './utils/helpers.js'

const NAV = [
  { section: 'MAIN' },
  { id:'dashboard',    icon:'▣',  label:'Dashboard' },
  { id:'journal',      icon:'📓', label:'Trade Journal' },
  { id:'capital',      icon:'💰', label:'Capital' },
  { section: 'ANALYSIS' },
  { id:'analytics',    icon:'📊', label:'Analytics' },
  { id:'calendar',     icon:'📅', label:'P&L Calendar' },
  { id:'reports',      icon:'📋', label:'Reports' },
  { section: 'CHART JOURNAL' },
  { id:'chartjournal', icon:'🖼️', label:'Chart Journal', badge:'ICT' },
  { section: 'TOOLS' },
  { id:'playbook',     icon:'🎯', label:'Playbook' },
  { id:'risk',         icon:'🧠', label:'Risk & Emotion' },
  { id:'diary',        icon:'✍️', label:'Trading Diary' },
  { section: 'SYNC & ACCOUNT' },
  { id:'sheets',       icon:'🔗', label:'Google Sheets' },
  { id:'profile',      icon:'👤', label:'Profile' },
  { id:'settings',     icon:'⚙️', label:'Settings' },
]

const SYNC_DOT = {
  [SYNC.IDLE]:    { color:'var(--muted)',   label:'Not connected' },
  [SYNC.SYNCING]: { color:'var(--warning)', label:'Syncing…' },
  [SYNC.SYNCED]:  { color:'var(--profit)',  label:'Synced ✓' },
  [SYNC.ERROR]:   { color:'var(--loss)',    label:'Sync error' },
  [SYNC.OFFLINE]: { color:'var(--muted)',   label:'Offline' },
}

function SyncBadge() {
  const { syncStatus, syncMsg, gsConfig, manualSync } = useApp()
  if (!gsConfig.enabled) return null
  const { color, label } = SYNC_DOT[syncStatus] || SYNC_DOT[SYNC.IDLE]
  return (
    <div title={syncMsg} onClick={manualSync} style={{
      display:'flex', alignItems:'center', gap:6, padding:'5px 10px',
      background:'var(--surface2)', borderRadius:8, cursor:'pointer',
      border:'1px solid var(--border)', fontSize:11, color:'var(--muted)',
    }}>
      <div style={{
        width:7, height:7, borderRadius:'50%', background:color,
        boxShadow: syncStatus===SYNC.SYNCED ? `0 0 6px ${color}` : 'none',
        animation: syncStatus===SYNC.SYNCING ? 'pulse 1s infinite' : 'none'
      }}/>
      {label}
    </div>
  )
}

function Sidebar() {
  const { page, setPage, trades, capital, toggleTheme, settings, gsConfig } = useApp()
  const totalPnL = trades.reduce((a,t)=>a+calcPnL(t),0)
  const roi = capital.total > 0 ? ((totalPnL/capital.total)*100).toFixed(1) : '0.0'

  return (
    <div style={{
      width:220, background:'var(--surface)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', padding:'0 10px 16px',
      position:'fixed', height:'100vh', zIndex:100, overflowY:'auto',
    }}>
      {/* Logo */}
      <div style={{ padding:'18px 6px 14px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
        <div style={{ fontSize:17, fontWeight:800, letterSpacing:-0.5, lineHeight:1.3 }}>
          <span style={{ color:'var(--accent)' }}>mytrading</span><br/>
          <span style={{ color:'var(--text)' }}>dairy</span>
          <span style={{ color:'var(--muted)', fontSize:11, fontWeight:400 }}>.com</span>
        </div>
        <div style={{ fontSize:10, color:'var(--muted)', marginTop:3 }}>Indian Trading Journal</div>
        <div style={{ marginTop:8 }}><SyncBadge/></div>
      </div>

      {/* Nav */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:1 }}>
        {NAV.map((n,i) => n.section
          ? <div key={i} style={{ fontSize:9, color:'var(--muted)', letterSpacing:1.5, textTransform:'uppercase', padding:'12px 12px 4px', marginTop:4 }}>{n.section}</div>
          : <NavItem key={n.id} {...n}
              badge={n.badge || (n.id==='sheets' && !gsConfig.enabled ? '!' : undefined)}
              active={page===n.id}
              onClick={()=>setPage(n.id)}/>
        )}
      </div>

      {/* Theme + Stats */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:12, marginTop:8 }}>
        <button onClick={toggleTheme} className="btn btn-ghost"
          style={{ width:'100%', padding:'8px 12px', fontSize:12, marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          {settings.theme==='dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <div style={{ padding:'0 4px' }}>
          <div style={{ fontSize:9, color:'var(--muted)', marginBottom:4, letterSpacing:1, textTransform:'uppercase' }}>Net P&L</div>
          <div className="mono" style={{ fontSize:18, fontWeight:700, color:pnlColor(totalPnL) }}>
            {sign(totalPnL)}{inr(totalPnL)}
          </div>
          <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{trades.length} trades · {sign(+roi)}{Math.abs(roi)}% ROI</div>
          <div style={{ fontSize:9, color:'var(--border)', marginTop:6 }}>
            {gsConfig.enabled ? '🔗 Synced to Google Sheets' : '💾 Saved to browser'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { page } = useApp()

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar/>
      <div style={{ marginLeft:220, flex:1, padding:'28px 28px 40px', minWidth:0 }}>
        {page==='dashboard'    && <Dashboard/>}
        {page==='journal'      && <Journal/>}
        {page==='capital'      && <Capital/>}
        {page==='analytics'    && <Analytics/>}
        {page==='calendar'     && <Calendar/>}
        {page==='reports'      && <Reports/>}
        {page==='chartjournal' && <ChartJournal/>}
        {page==='playbook'     && <Playbook/>}
        {page==='risk'         && <Risk/>}
        {page==='diary'        && <Diary/>}
        {page==='sheets'       && <SheetsSetup/>}
        {page==='profile'      && <Profile/>}
        {page==='settings'     && <Settings/>}
      </div>
      <Toast/>
    </div>
  )
}
