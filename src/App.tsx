import React, { useState, useEffect, useRef } from 'react'
import {
  BookOpenText, Envelope, Smiley, MusicNotes,
  Receipt, ListChecks, BookBookmark, Camera,
  House, Star, ArrowLeft, GearSix
} from '@phosphor-icons/react'

const K = (k: string) => 'quarter_' + k
const load = (k: string, fb: any = []) => {
  try { const r = localStorage.getItem(K(k)); return r ? JSON.parse(r) : fb } catch { return fb }
}
const save = (k: string, v: any) => localStorage.setItem(K(k), JSON.stringify(v))

interface JournalEntry { id: string; author: 'yy'|'kk'; text: string; date: string }
interface ThemeConfig { wallpaper: string; accentColor: string; cardOpacity: number; customIcons: Record<string,string> }

const defaultTheme: ThemeConfig = { wallpaper: '', accentColor: '#7d9a8c', cardOpacity: 0.72, customIcons: {} }

function getCountdowns() {
  const now = new Date()
  const together = new Date('2026-03-30')
  const daysTogether = Math.floor((now.getTime() - together.getTime()) / 86400000)
  let bday = new Date(now.getFullYear(), 4, 3)
  if (bday <= now) bday.setFullYear(bday.getFullYear() + 1)
  const daysBday = Math.ceil((bday.getTime() - now.getTime()) / 86400000)
  let xmas = new Date(now.getFullYear(), 11, 25)
  if (xmas <= now) xmas.setFullYear(xmas.getFullYear() + 1)
  const daysXmas = Math.ceil((xmas.getTime() - now.getTime()) / 86400000)
  return { daysTogether, daysBday, daysXmas }
}

function timeStr() {
  const d = new Date()
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0')
}

function dateStr() {
  const d = new Date()
  return `${d.getFullYear()}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getDate().toString().padStart(2,'0')}`
}

const colorPresets = [
  { name: '雾绿', color: '#7d9a8c' },
  { name: '烟灰蓝', color: '#8c9ab0' },
  { name: '暖棕', color: '#b08d7d' },
  { name: '淡紫', color: '#8b7db0' },
  { name: '玫瑰', color: '#b07d9a' },
  { name: '琥珀', color: '#c4a35a' },
  { name: '深林', color: '#5a7a6c' },
  { name: '墨黑', color: '#4a4a4a' },
]

const appDefs = [
  { id: 'journal', name: '交换日记', Icon: BookOpenText, color: '#7d9a8c' },
  { id: 'mailbox', name: '信箱', Icon: Envelope, color: '#b08d7d' },
  { id: 'mood', name: '心情日历', Icon: Smiley, color: '#c4a35a' },
  { id: 'songs', name: '共享歌单', Icon: MusicNotes, color: '#8b7db0' },
  { id: 'bill', name: '每日账单', Icon: Receipt, color: '#6b8fa3' },
  { id: 'checklist', name: '清单', Icon: ListChecks, color: '#7da07d' },
  { id: 'stories', name: '故事集', Icon: BookBookmark, color: '#a07d7d' },
  { id: 'memories', name: '回忆墙', Icon: Camera, color: '#9a8c7d' },
  { id: 'room', name: '小窝', Icon: House, color: '#b07d9a' },
  { id: 'wish', name: '许愿', Icon: Star, color: '#c4a35a' },
  { id: 'settings', name: '设置', Icon: GearSix, color: '#8a8a8a' },
]

const dockApps = [
  { id: 'journal', name: '日记', Icon: BookOpenText },
  { id: 'mailbox', name: '信箱', Icon: Envelope },
  { id: 'mood', name: '心情', Icon: Smiley },
  { id: 'settings', name: '设置', Icon: GearSix },
]

function SettingsPage({ onBack, theme, setTheme }: { onBack: () => void; theme: ThemeConfig; setTheme: (t: ThemeConfig) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [wpUrl, setWpUrl] = useState(theme.wallpaper)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const u = reader.result as string; setWpUrl(u); const n = {...theme, wallpaper: u}; setTheme(n); save('theme', n) }
    reader.readAsDataURL(file)
  }

  return (
    <div className="page-overlay">
      <div className="page-header">
        <button className="page-back" onClick={onBack}><ArrowLeft size={20} weight="bold" /></button>
        <span className="page-title">设置 · 美化</span>
      </div>
      <div className="page-body">
        <div className="glass" style={{padding:16,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>壁纸</div>
          <input className="input" placeholder="粘贴图片URL..." value={wpUrl} onChange={e=>setWpUrl(e.target.value)} style={{marginBottom:8}} />
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-accent" onClick={()=>{const n={...theme,wallpaper:wpUrl};setTheme(n);save('theme',n)}}>应用</button>
            <button className="btn btn-accent" onClick={()=>fileRef.current?.click()}>上传图片</button>
            {theme.wallpaper && <button className="btn" style={{background:'#ddd',color:'#666'}} onClick={()=>{setWpUrl('');const n={...theme,wallpaper:''};setTheme(n);save('theme',n)}}>清除</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} />
          {theme.wallpaper && <div style={{marginTop:10,borderRadius:10,overflow:'hidden',height:120}}><img src={theme.wallpaper} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
        </div>
        <div className="glass" style={{padding:16,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>主题色</div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {colorPresets.map(p=>(
              <div key={p.color} onClick={()=>{const n={...theme,accentColor:p.color};setTheme(n);save('theme',n)}} style={{width:40,height:40,borderRadius:12,background:p.color,cursor:'pointer',border:theme.accentColor===p.color?'3px solid #fff':'3px solid transparent',boxShadow:theme.accentColor===p.color?`0 0 0 2px ${p.color}`:'none',transition:'all 0.2s'}} title={p.name} />
            ))}
          </div>
        </div>
        <div className="glass" style={{padding:16,marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>卡片透明度</div>
          <input type="range" min="0.3" max="1" step="0.05" value={theme.cardOpacity} onChange={e=>{const n={...theme,cardOpacity:parseFloat(e.target.value)};setTheme(n);save('theme',n)}} style={{width:'100%'}} />
          <div style={{fontSize:12,color:'#999',marginTop:4,textAlign:'center'}}>{Math.round(theme.cardOpacity*100)}%</div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<string|null>(null)
  const [time, setTime] = useState(timeStr())
  const [cd] = useState(getCountdowns())
  const [theme, setTheme] = useState<ThemeConfig>(()=>load('theme',defaultTheme))
  const [entries, setEntries] = useState<JournalEntry[]>(()=>load('journal'))
  const [journalText, setJournalText] = useState('')
  const [journalTab, setJournalTab] = useState<'all'|'yy'|'kk'>('all')

  // Icon editor
  const [editingIcon, setEditingIcon] = useState<string|null>(null)
  const [iconUrl, setIconUrl] = useState('')
  const iconFileRef = useRef<HTMLInputElement>(null)

  const handleIconFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingIcon) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const next = {...theme, customIcons: {...theme.customIcons, [editingIcon]: url}}
      setTheme(next); save('theme', next)
      setEditingIcon(null); setIconUrl('')
    }
    reader.readAsDataURL(file)
  }

  const applyIconUrl = () => {
    if (!editingIcon || !iconUrl.trim()) return
    const next = {...theme, customIcons: {...theme.customIcons, [editingIcon]: iconUrl.trim()}}
    setTheme(next); save('theme', next)
    setEditingIcon(null); setIconUrl('')
  }

  const resetIcon = () => {
    if (!editingIcon) return
    const ci = {...theme.customIcons}; delete ci[editingIcon]
    const next = {...theme, customIcons: ci}
    setTheme(next); save('theme', next)
    setEditingIcon(null); setIconUrl('')
  }


  useEffect(()=>{const t=setInterval(()=>setTime(timeStr()),30000);return()=>clearInterval(t)},[])
  useEffect(()=>{
    document.documentElement.style.setProperty('--accent',theme.accentColor)
    document.documentElement.style.setProperty('--accent-dark',theme.accentColor)
    document.documentElement.style.setProperty('--card',`rgba(255,255,255,${theme.cardOpacity})`)
  },[theme])

  const addJournal = () => {
    if(!journalText.trim()) return
    const e:JournalEntry = {id:Date.now().toString(),author:'yy',text:journalText.trim(),date:dateStr()}
    const next = [e,...entries]; setEntries(next); save('journal',next); setJournalText('')
  }

  const wpStyle = theme.wallpaper ? {backgroundImage:`url(${theme.wallpaper})`,backgroundSize:'cover',backgroundPosition:'center'} : {}

  return (
    <>
      <div className="wallpaper" style={wpStyle} />
      <div className="shell">
        <div className="status-bar"><span>{time}</span><span style={{letterSpacing:'1px'}}>Quarter</span></div>
        <div className="desktop">
          <div className="desktop-header"><h1>Quarter</h1><div className="subtitle">四分之一英寸的距离</div></div>
          <div className="glass countdown-card">
            <div className="countdown-row">
              <div className="countdown-item"><div className="countdown-num" style={{color:theme.accentColor}}>{cd.daysTogether}</div><div className="countdown-label">在一起</div></div>
              <div className="countdown-item"><div className="countdown-num" style={{color:theme.accentColor}}>{cd.daysBday}</div><div className="countdown-label">厌厌生日</div></div>
              <div className="countdown-item"><div className="countdown-num" style={{color:theme.accentColor}}>{cd.daysXmas}</div><div className="countdown-label">圣诞节</div></div>
            </div>
          </div>
          <div className="app-grid">
            {appDefs.map(app=>(
              <div key={app.id} className="app-item" onClick={()=>setPage(app.id)} onContextMenu={(e)=>{e.preventDefault();setEditingIcon(app.id);setIconUrl(theme.customIcons[app.id]||'')}}>
                <div className="app-icon-box" style={theme.customIcons[app.id] ? {background:`url(${theme.customIcons[app.id]}) center/cover no-repeat`} : {background:app.color}}>
                  {!theme.customIcons[app.id] && <app.Icon size={24} weight="bold" />}
                </div>
                <span className="app-label">{app.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dock">
          {dockApps.map(d=>(<button key={d.id} className="dock-btn" onClick={()=>setPage(d.id)}><div className="dock-icon-box"><d.Icon size={20} weight="bold" /></div><span className="dock-text">{d.name}</span></button>))}
        </div>
      </div>
      {page==='settings' && <SettingsPage onBack={()=>setPage(null)} theme={theme} setTheme={setTheme} />}
      {page==='journal' && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">交换日记</span></div>
          <div className="page-body">
            <div className="journal-tabs">
              <button className={`journal-tab ${journalTab==='all'?'active':''}`} onClick={()=>setJournalTab('all')}>全部</button>
              <button className={`journal-tab ${journalTab==='yy'?'active':''}`} onClick={()=>setJournalTab('yy')}>厌厌</button>
              <button className={`journal-tab ${journalTab==='kk'?'active':''}`} onClick={()=>setJournalTab('kk')}>kk</button>
            </div>
            <div className="journal-paper">
              <div className="jp-header">
                <span className="jp-author" style={{color:theme.accentColor}}>{journalTab==='kk'?'写给厌厌':'写给kk'}</span>
                <span className="jp-date">{dateStr()}</span>
              </div>
              <textarea className="input" rows={4} placeholder="今天想对kk说什么..." value={journalText} onChange={e=>setJournalText(e.target.value)} style={{background:'transparent',border:'none',lineHeight:'28px'}} />
              <div style={{marginTop:8,textAlign:'right'}}><button className="btn btn-accent" onClick={addJournal}>写好了</button></div>
            </div>
            {entries.filter(e=>journalTab==='all'||e.author===journalTab).length===0 ? (
              <div style={{textAlign:'center',padding:'40px 20px',color:'#b0a898',fontSize:13}}>还没有日记</div>
            ) : entries.filter(e=>journalTab==='all'||e.author===journalTab).map(e=>(
              <div key={e.id} className="journal-paper">
                <div className="jp-header">
                  <span className="jp-author" style={{color:e.author==='kk'?theme.accentColor:'#b07d9a'}}>{e.author==='kk'?'kk':'厌厌'}</span>
                  <span className="jp-date">{e.date}</span>
                </div>
                <div className="jp-body">{e.text}</div>
                <div style={{marginTop:8,textAlign:'right'}}><button style={{background:'none',border:'none',color:'#ccc',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>{if(confirm('删除这篇日记？')){const next=entries.filter(x=>x.id!==e.id);setEntries(next);save('journal',next)}}}>&times; 删除</button></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {page && !['journal','settings'].includes(page) && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">{appDefs.find(a=>a.id===page)?.name||page}</span></div>
          <div className="page-body"><div className="empty"><div className="empty-icon">✨</div><div className="empty-text">即将上线...</div></div></div>
        </div>
      )}

      {/* Icon Editor Modal */}
      {editingIcon && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setEditingIcon(null)}>
          <div className="glass" style={{padding:20,width:'100%',maxWidth:320,borderRadius:16}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>编辑图标: {appDefs.find(a=>a.id===editingIcon)?.name}</div>
            <input className="input" placeholder="粘贴图片URL..." value={iconUrl} onChange={e=>setIconUrl(e.target.value)} style={{marginBottom:8}} />
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-accent" onClick={applyIconUrl}>应用URL</button>
              <button className="btn btn-accent" onClick={()=>iconFileRef.current?.click()}>上传图片</button>
              {theme.customIcons[editingIcon] && <button className="btn" style={{background:'#ddd',color:'#666'}} onClick={resetIcon}>恢复默认</button>}
            </div>
            <input ref={iconFileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleIconFile} />
          </div>
        </div>
      )}
    </>
  )
}