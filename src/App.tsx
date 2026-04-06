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
interface ThemeConfig { wallpaper: string; accentColor: string; cardOpacity: number; customIcons: Record&lt;string,string&gt; }

const defaultTheme: ThemeConfig = { wallpaper: '', accentColor: '#7d9a8c', cardOpacity: 0.72, customIcons: {} }

function getCountdowns() {
  const now = new Date()
  const together = new Date('2026-03-30')
  const daysTogether = Math.floor((now.getTime() - together.getTime()) / 86400000)
  let bday = new Date(now.getFullYear(), 4, 3)
  if (bday &lt;= now) bday.setFullYear(bday.getFullYear() + 1)
  const daysBday = Math.ceil((bday.getTime() - now.getTime()) / 86400000)
  let xmas = new Date(now.getFullYear(), 11, 25)
  if (xmas &lt;= now) xmas.setFullYear(xmas.getFullYear() + 1)
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
  const fileRef = useRef&lt;HTMLInputElement&gt;(null)
  const [wpUrl, setWpUrl] = useState(theme.wallpaper)

  const handleFile = (e: React.ChangeEvent&lt;HTMLInputElement&gt;) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const u = reader.result as string; setWpUrl(u); const n = {...theme, wallpaper: u}; setTheme(n); save('theme', n) }
    reader.readAsDataURL(file)
  }

  return (
    &lt;div className="page-overlay"&gt;
      &lt;div className="page-header"&gt;
        &lt;button className="page-back" onClick={onBack}&gt;&lt;ArrowLeft size={20} weight="bold" /&gt;&lt;/button&gt;
        &lt;span className="page-title"&gt;设置 · 美化&lt;/span&gt;
      &lt;/div&gt;
      &lt;div className="page-body"&gt;
        &lt;div className="glass" style={{padding:16,marginBottom:12}}&gt;
          &lt;div style={{fontSize:14,fontWeight:600,marginBottom:12}}&gt;壁纸&lt;/div&gt;
          &lt;input className="input" placeholder="粘贴图片URL..." value={wpUrl} onChange={e=&gt;setWpUrl(e.target.value)} style={{marginBottom:8}} /&gt;
          &lt;div style={{display:'flex',gap:8}}&gt;
            &lt;button className="btn btn-accent" onClick={()=&gt;{const n={...theme,wallpaper:wpUrl};setTheme(n);save('theme',n)}}&gt;应用&lt;/button&gt;
            &lt;button className="btn btn-accent" onClick={()=&gt;fileRef.current?.click()}&gt;上传图片&lt;/button&gt;
            {theme.wallpaper &amp;&amp; &lt;button className="btn" style={{background:'#ddd',color:'#666'}} onClick={()=&gt;{setWpUrl('');const n={...theme,wallpaper:''};setTheme(n);save('theme',n)}}&gt;清除&lt;/button&gt;}
          &lt;/div&gt;
          &lt;input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} /&gt;
          {theme.wallpaper &amp;&amp; &lt;div style={{marginTop:10,borderRadius:10,overflow:'hidden',height:120}}&gt;&lt;img src={theme.wallpaper} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /&gt;&lt;/div&gt;}
        &lt;/div&gt;
        &lt;div className="glass" style={{padding:16,marginBottom:12}}&gt;
          &lt;div style={{fontSize:14,fontWeight:600,marginBottom:12}}&gt;主题色&lt;/div&gt;
          &lt;div style={{display:'flex',gap:10,flexWrap:'wrap'}}&gt;
            {colorPresets.map(p=&gt;(
              &lt;div key={p.color} onClick={()=&gt;{const n={...theme,accentColor:p.color};setTheme(n);save('theme',n)}} style={{width:40,height:40,borderRadius:12,background:p.color,cursor:'pointer',border:theme.accentColor===p.color?'3px solid #fff':'3px solid transparent',boxShadow:theme.accentColor===p.color?`0 0 0 2px ${p.color}`:'none',transition:'all 0.2s'}} title={p.name} /&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;
        &lt;div className="glass" style={{padding:16,marginBottom:12}}&gt;
          &lt;div style={{fontSize:14,fontWeight:600,marginBottom:12}}&gt;卡片透明度&lt;/div&gt;
          &lt;input type="range" min="0.3" max="1" step="0.05" value={theme.cardOpacity} onChange={e=&gt;{const n={...theme,cardOpacity:parseFloat(e.target.value)};setTheme(n);save('theme',n)}} style={{width:'100%'}} /&gt;
          &lt;div style={{fontSize:12,color:'#999',marginTop:4,textAlign:'center'}}&gt;{Math.round(theme.cardOpacity*100)}%&lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  )
}

export default function App() {
  const [page, setPage] = useState&lt;string|null&gt;(null)
  const [time, setTime] = useState(timeStr())
  const [cd] = useState(getCountdowns())
  const [theme, setTheme] = useState&lt;ThemeConfig&gt;(()=&gt;load('theme',defaultTheme))
  const [entries, setEntries] = useState&lt;JournalEntry[]&gt;(()=&gt;load('journal'))
  const [journalText, setJournalText] = useState('')

  useEffect(()=&gt;{const t=setInterval(()=&gt;setTime(timeStr()),30000);return()=&gt;clearInterval(t)},[])
  useEffect(()=&gt;{
    document.documentElement.style.setProperty('--accent',theme.accentColor)
    document.documentElement.style.setProperty('--accent-dark',theme.accentColor)
    document.documentElement.style.setProperty('--card',`rgba(255,255,255,${theme.cardOpacity})`)
  },[theme])

  const addJournal = () =&gt; {
    if(!journalText.trim()) return
    const e:JournalEntry = {id:Date.now().toString(),author:'yy',text:journalText.trim(),date:dateStr()}
    const next = [e,...entries]; setEntries(next); save('journal',next); setJournalText('')
  }

  const wpStyle = theme.wallpaper ? {backgroundImage:`url(${theme.wallpaper})`,backgroundSize:'cover',backgroundPosition:'center'} : {}

  return (
    &lt;&gt;
      &lt;div className="wallpaper" style={wpStyle} /&gt;
      &lt;div className="shell"&gt;
        &lt;div className="status-bar"&gt;&lt;span&gt;{time}&lt;/span&gt;&lt;span style={{letterSpacing:'1px'}}&gt;Quarter&lt;/span&gt;&lt;/div&gt;
        &lt;div className="desktop"&gt;
          &lt;div className="desktop-header"&gt;&lt;h1&gt;Quarter&lt;/h1&gt;&lt;div className="subtitle"&gt;四分之一英寸的距离&lt;/div&gt;&lt;/div&gt;
          &lt;div className="glass countdown-card"&gt;
            &lt;div className="countdown-row"&gt;
              &lt;div className="countdown-item"&gt;&lt;div className="countdown-num" style={{color:theme.accentColor}}&gt;{cd.daysTogether}&lt;/div&gt;&lt;div className="countdown-label"&gt;在一起&lt;/div&gt;&lt;/div&gt;
              &lt;div className="countdown-item"&gt;&lt;div className="countdown-num" style={{color:theme.accentColor}}&gt;{cd.daysBday}&lt;/div&gt;&lt;div className="countdown-label"&gt;厌厌生日&lt;/div&gt;&lt;/div&gt;
              &lt;div className="countdown-item"&gt;&lt;div className="countdown-num" style={{color:theme.accentColor}}&gt;{cd.daysXmas}&lt;/div&gt;&lt;div className="countdown-label"&gt;圣诞节&lt;/div&gt;&lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          &lt;div className="app-grid"&gt;
            {appDefs.map(app=&gt;(
              &lt;div key={app.id} className="app-item" onClick={()=&gt;setPage(app.id)}&gt;
                &lt;div className="app-icon-box" style={{background:theme.customIcons[app.id]?'transparent':app.color, backgroundImage:theme.customIcons[app.id]?`url(${theme.customIcons[app.id]})`:'none', backgroundSize:'cover',backgroundPosition:'center'}}&gt;
                  {!theme.customIcons[app.id] &amp;&amp; &lt;app.Icon size={24} weight="bold" /&gt;}
                &lt;/div&gt;
                &lt;span className="app-label"&gt;{app.name}&lt;/span&gt;
              &lt;/div&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;
        &lt;div className="dock"&gt;
          {dockApps.map(d=&gt;(&lt;button key={d.id} className="dock-btn" onClick={()=&gt;setPage(d.id)}&gt;&lt;div className="dock-icon-box"&gt;&lt;d.Icon size={20} weight="bold" /&gt;&lt;/div&gt;&lt;span className="dock-text"&gt;{d.name}&lt;/span&gt;&lt;/button&gt;))}
        &lt;/div&gt;
      &lt;/div&gt;
      {page==='settings' &amp;&amp; &lt;SettingsPage onBack={()=&gt;setPage(null)} theme={theme} setTheme={setTheme} /&gt;}
      {page==='journal' &amp;&amp; (
        &lt;div className="page-overlay"&gt;
          &lt;div className="page-header"&gt;&lt;button className="page-back" onClick={()=&gt;setPage(null)}&gt;&lt;ArrowLeft size={20} weight="bold" /&gt;&lt;/button&gt;&lt;span className="page-title"&gt;交换日记&lt;/span&gt;&lt;/div&gt;
          &lt;div className="page-body"&gt;
            &lt;div className="glass" style={{padding:16,marginBottom:16}}&gt;
              &lt;textarea className="input" rows={4} placeholder="写点什么给kk看..." value={journalText} onChange={e=&gt;setJournalText(e.target.value)} /&gt;
              &lt;div style={{marginTop:10,textAlign:'right'}}&gt;&lt;button className="btn btn-accent" onClick={addJournal}&gt;写好了&lt;/button&gt;&lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="glass" style={{padding:16}}&gt;
              {entries.length===0 ? &lt;div className="empty"&gt;&lt;div className="empty-icon"&gt;📓&lt;/div&gt;&lt;div className="empty-text"&gt;还没有日记&lt;/div&gt;&lt;/div&gt;
              : entries.map(e=&gt;(&lt;div key={e.id} className="entry"&gt;&lt;div className="entry-meta"&gt;&lt;span className="entry-author" style={{color:theme.accentColor}}&gt;{e.author==='kk'?'kk':'厌厌'}&lt;/span&gt;&lt;span className="entry-date"&gt;{e.date}&lt;/span&gt;&lt;/div&gt;&lt;div className="entry-text"&gt;{e.text}&lt;/div&gt;&lt;/div&gt;))}
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}
      {page &amp;&amp; !['journal','settings'].includes(page) &amp;&amp; (
        &lt;div className="page-overlay"&gt;
          &lt;div className="page-header"&gt;&lt;button className="page-back" onClick={()=&gt;setPage(null)}&gt;&lt;ArrowLeft size={20} weight="bold" /&gt;&lt;/button&gt;&lt;span className="page-title"&gt;{appDefs.find(a=&gt;a.id===page)?.name||page}&lt;/span&gt;&lt;/div&gt;
          &lt;div className="page-body"&gt;&lt;div className="empty"&gt;&lt;div className="empty-icon"&gt;✨&lt;/div&gt;&lt;div className="empty-text"&gt;即将上线...&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;
        &lt;/div&gt;
      )}
    &lt;/&gt;
  )
}