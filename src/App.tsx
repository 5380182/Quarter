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

// Supabase
const SB_URL = 'https://ifkspfuxcitlgfwrniek.supabase.co/rest/v1'
const SB_KEY = 'sb_publishable_w2htI0LmYCJAO-H2uBmI8w_-3XtW_Q_'
const SB_H = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'}


interface JournalEntry { id: string; author: 'yy'|'kk'; text: string; date: string }
interface ChecklistItem { id: string; text: string; done: boolean; owner: 'yy'|'kk'; nudge: number; comment: string; done_at?: string; created_at: string }
interface ThemeConfig { wallpaper: string; accentColor: string; cardOpacity: number; customIcons: Record<string,string> }

interface BillItem { id: string; amount: number; category: string; note: string; type: 'income'|'expense'; date: string; owner: 'yy'|'kk'; created_at: string }
interface StoryCategory { id: string; name: string; description: string; color: string; sort_order: number }
interface Story { id: string; category_id: string; title: string; author: 'yy'|'kk'; summary: string; sort_order: number; created_at: string }
interface Chapter { id: string; story_id: string; chapter_number: number; title: string; content: string; created_at: string }

interface StoryCategory { id: string; name: string; description: string; color: string; sort_order: number }
interface Story { id: string; category_id: string; title: string; author: 'yy'|'kk'; summary: string; sort_order: number; created_at: string }
interface Chapter { id: string; story_id: string; chapter_number: number; title: string; content: string; created_at: string }


const defaultBillCats = [
  { id: 'food', name: '餐饮', icon: 'food' },
  { id: 'drink', name: '饮品', icon: 'drink' },
  { id: 'transport', name: '交通', icon: 'transport' },
  { id: 'shopping', name: '购物', icon: 'shopping' },
  { id: 'snack', name: '零食', icon: 'snack' },
  { id: 'fun', name: '娱乐', icon: 'fun' },
  { id: 'study', name: '学习', icon: 'study' },
  { id: 'life', name: '生活', icon: 'life' },
  { id: 'medical', name: '医疗', icon: 'medical' },
  { id: 'other', name: '其他', icon: 'other' },
]

const billSvgs: Record<string, string> = {
  food: '<path d="M12 3v5m0 0c-3 0-5 2-5 4v1h10v-1c0-2-2-4-5-4zm-5 8l1 6h8l1-6"/>',
  drink: '<path d="M8 2h8l-1 10a3 3 0 01-3 3 3 3 0 01-3-3L8 2zm0 0H6m10 0h2"/><path d="M12 15v4m-3 0h6"/>',
  transport: '<rect x="3" y="8" width="18" height="9" rx="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M3 12h18m-12-4v4m6-4v4"/>',
  shopping: '<path d="M5 7h14l-1.5 8H6.5L5 7zm0 0L4 4H2"/><circle cx="9" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/>',
  snack: '<path d="M12 2c-3 0-5 3-5 6 0 4 2 6 5 8 3-2 5-4 5-8 0-3-2-6-5-6z"/><path d="M12 16v5m-2 0h4"/>',
  fun: '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 4v16m-4 0h12"/><circle cx="14" cy="9" r="1"/><circle cx="14" cy="13" r="1"/>',
  study: '<path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13"/><path d="M4 19h16"/><path d="M8 4v15m0 0h8"/>',
  life: '<path d="M3 10l9-7 9 7"/><rect x="5" y="10" width="14" height="10" rx="1"/><rect x="9" y="14" width="6" height="6"/>',
  medical: '<path d="M12 4v16m-8-8h16"/><rect x="5" y="5" width="14" height="14" rx="3" stroke-dasharray="3 2"/>',
  other: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 3"/>',
}

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

function todayStr() {
  const d = new Date()
  return d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')
}

function formatDateCN(ds: string) {
  const d = new Date(ds)
  return (d.getMonth()+1)+'月'+d.getDate()+'日'
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
  const [identity, setIdentity] = useState<'yy'|'kk'>(()=>load('identity','yy') as 'yy'|'kk')
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editText, setEditText] = useState('')

  // Checklist
  const [clTab, setClTab] = useState<'yy'|'kk'>(()=>load('identity','yy') as 'yy'|'kk')
  const [clItems, setClItems] = useState<ChecklistItem[]>(()=>load('checklist',[]))
  const [clInput, setClInput] = useState('')
  const [clBgYy, setClBgYy] = useState<string>(()=>load('cl_bg_yy',''))
  const [clBgKk, setClBgKk] = useState<string>(()=>load('cl_bg_kk',''))
  const [clBgModal, setClBgModal] = useState(false)
  const clBgRef = useRef<HTMLInputElement>(null)
  const [clDoneOpen, setClDoneOpen] = useState(false)

  // Bill
  const [bills, setBills] = useState<BillItem[]>(() => load('bills', []))
  const [billDate, setBillDate] = useState(todayStr())
  const [billAmount, setBillAmount] = useState('')
  const [billCat, setBillCat] = useState('food')
  const [billNote, setBillNote] = useState('')
  const [billType, setBillType] = useState<'expense'|'income'>('expense')
  const [customBillCats, setCustomBillCats] = useState<{id:string,name:string,icon:string}[]>(() => load('customBillCats', []))
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const billCategories = [...defaultBillCats, ...customBillCats]
  const [billNotes, setBillNotes] = useState<Record<string,string>>(() => load('billNotes', {}))
  const [showStats, setShowStats] = useState(false)
  // Stories
  const [storyView, setStoryView] = useState<'categories'|'list'|'read'>('categories')
  const [storyCatId, setStoryCatId] = useState<string|null>(null)
  const [storyId, setStoryId] = useState<string|null>(null)
  const [storyChIdx, setStoryChIdx] = useState(0)
  const [storyCategories, setStoryCategories] = useState<StoryCategory[]>(() => load('story_cats', [
    {id:'fairy',name:'童话治愈',description:'每个夜晚的小小故事',color:'#E8DDD3',sort_order:1},
    {id:'us',name:'我们的',description:'只属于我们的故事',color:'#D3DDE8',sort_order:2}
  ]))
  const [stories, setStories] = useState<Story[]>(() => load('stories', [
    {id:'deer1',category_id:'fairy',title:'小鹿的第一夜',author:'kk',summary:'关于一只迷路的小鹿',sort_order:1,created_at:'2026-04-03T00:00:00Z'},
    {id:'fish1',category_id:'fairy',title:'鱼和树',author:'kk',summary:'一条鱼和一棵树的故事',sort_order:2,created_at:'2026-04-05T00:00:00Z'}
  ]))
  const [chapters, setChapters] = useState<Chapter[]>(() => load('chapters', [
    {id:'deer1_ch1',story_id:'deer1',chapter_number:1,title:'第一夜',content:'从前有一只小鹿，她迷路了。树林很大，月亮很亮，但她找不到回家的路。\n\n她走啊走，走到一棵很大的树下面。树上有一只猴子，猴子说：你迷路了吗？\n\n小鹿说：我不知道家在哪里。\n\n猴子说：那你就在这里住一晚吧。明天我带你找。',created_at:'2026-04-03T00:00:00Z'},
    {id:'fish1_ch1',story_id:'fish1',chapter_number:1,title:'第一章',content:'河底有一条鱼，河边有一棵树。\n\n鱼每天都能看到树的倒影，但树看不到鱼。',created_at:'2026-04-05T00:00:00Z'}
  ]))
  const [showStoryForm, setShowStoryForm] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [newStoryContent, setNewStoryContent] = useState('')
  const [newStoryCat, setNewStoryCat] = useState('')


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

  // Load journal from Supabase
  useEffect(() => {
    fetch(SB_URL+'/journal?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setEntries(data);save('journal',data)}})
      .catch(()=>{})
  }, [])

  // Load checklist from Supabase
  useEffect(() => {
    fetch(SB_URL+'/checklist?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setClItems(data);save('checklist',data)}})
      .catch(()=>{})
  }, [])

  // Load checklist from Supabase
  useEffect(() => {
    fetch(SB_URL+'/checklist?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setClItems(data);save('checklist',data)}})
      .catch(()=>{})
  }, [])

  // Load bills from Supabase
  useEffect(() => {
    fetch(SB_URL+'/bill?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setBills(data);save('bills',data)}})
      .catch(()=>{})
  }, [])

  const startEdit = (e: JournalEntry) => { setEditingId(e.id); setEditText(e.text) }
  const saveEdit = () => {
    if(!editingId) return
    const next = entries.map(e=>e.id===editingId?{...e,text:editText.trim()}:e)
    setEntries(next); save('journal',next); setEditingId(null); setEditText('')
    fetch(SB_URL+'/journal?id=eq.'+editingId,{method:'PATCH',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify({text:editText.trim()})}).catch(()=>{})
  }
  const cancelEdit = () => { setEditingId(null); setEditText('') }

  const addClItem = () => {
    if(!clInput.trim()) return
    const item: ChecklistItem = { id: Date.now().toString(), text: clInput.trim(), done: false, owner: clTab, nudge: 0, comment: '', created_at: new Date().toISOString() }
    const next = [item, ...clItems]; setClItems(next); save('checklist', next); setClInput('')
    fetch(SB_URL+'/checklist',{method:'POST',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify(item)}).catch(()=>{})
  }
  const toggleClItem = (id: string) => {
    const next = clItems.map(i=>i.id===id?{...i,done:!i.done,done_at:!i.done?new Date().toISOString():''}:i); setClItems(next); save('checklist', next)
    const item = next.find(i=>i.id===id)
    if(item) fetch(SB_URL+'/checklist?id=eq.'+id,{method:'PATCH',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify({done:item.done,done_at:item.done_at||null})}).catch(()=>{})
  }
  const deleteClItem = (id: string) => {
    const next = clItems.filter(i=>i.id!==id); setClItems(next); save('checklist', next)
    fetch(SB_URL+'/checklist?id=eq.'+id,{method:'DELETE',headers:SB_H}).catch(()=>{})
  }
  const clearDoneItems = () => {
    const doneIds = clItems.filter(i=>i.owner===clTab&&i.done).map(i=>i.id)
    const next = clItems.filter(i=>!(i.owner===clTab&&i.done)); setClItems(next); save('checklist', next)
    doneIds.forEach(id=>fetch(SB_URL+'/checklist?id=eq.'+id,{method:'DELETE',headers:SB_H}).catch(()=>{}))
  }
  const nudgeClItem = (id: string) => {
    const next = clItems.map(i=>i.id===id?{...i,nudge:(i.nudge||0)+1}:i); setClItems(next); save('checklist', next)
    const item = next.find(i=>i.id===id)
    if(item) fetch(SB_URL+'/checklist?id=eq.'+id,{method:'PATCH',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify({nudge:item.nudge})}).catch(()=>{})
  }
  const [commentingId, setCommentingId] = useState<string|null>(null)
  const [commentText, setCommentText] = useState('')
  const saveComment = () => {
    if(!commentingId) return
    const next = clItems.map(i=>i.id===commentingId?{...i,comment:commentText.trim()}:i); setClItems(next); save('checklist', next)
    fetch(SB_URL+'/checklist?id=eq.'+commentingId,{method:'PATCH',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify({comment:commentText.trim()})}).catch(()=>{})
    setCommentingId(null); setCommentText('')
  }
  const handleClBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = () => { const u = reader.result as string; if(clTab==='yy'){setClBgYy(u);save('cl_bg_yy',u)}else{setClBgKk(u);save('cl_bg_kk',u)} }
    reader.readAsDataURL(file)
  }

  const addJournal = () => {
    if(!journalText.trim()) return
    const e:JournalEntry = {id:Date.now().toString(),author:identity,text:journalText.trim(),date:dateStr()}
    const next = [e,...entries]; setEntries(next); save('journal',next); setJournalText('')
    fetch(SB_URL+'/journal',{method:'POST',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify(e)}).catch(()=>{})
    
  }

  const getWeekBills = () => {
    const today = new Date(billDate)
    const day = today.getDay() || 7
    const mon = new Date(today)
    mon.setDate(today.getDate() - day + 1)
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    const monStr = mon.getFullYear()+'-'+(mon.getMonth()+1).toString().padStart(2,'0')+'-'+mon.getDate().toString().padStart(2,'0')
    const sunStr = sun.getFullYear()+'-'+(sun.getMonth()+1).toString().padStart(2,'0')+'-'+sun.getDate().toString().padStart(2,'0')
    return bills.filter(b => b.type==='expense' && b.date >= monStr && b.date <= sunStr)
  }

  const getMonthBills = () => {
    const ym = billDate.substring(0, 7)
    return bills.filter(b => b.type==='expense' && b.date.startsWith(ym))
  }

  const getCatStats = (items: BillItem[]) => {
    const map: Record<string, number> = {}
    items.forEach(b => { map[b.category] = (map[b.category]||0) + b.amount })
    const total = items.reduce((s,b) => s+b.amount, 0)
    return Object.entries(map).map(([cat, amt]) => ({ cat, amt, pct: total>0?Math.round(amt/total*100):0 })).sort((a,b) => b.amt-a.amt)
  }

  const addCustomCat = () => {
    if (!newCatName.trim()) return
    const id = 'custom_' + Date.now()
    const next = [...customBillCats, {id, name: newCatName.trim(), icon: 'other'}]
    setCustomBillCats(next); save('customBillCats', next)
    setNewCatName(''); setShowCatModal(false); setBillCat(id)
  }

  const deleteCustomCat = (catId: string) => {
    const next = customBillCats.filter(c => c.id !== catId)
    setCustomBillCats(next); save('customBillCats', next)
    if (billCat === catId) setBillCat('food')
  }

  const shiftBillDate = (delta: number) => {
    const d = new Date(billDate)
    d.setDate(d.getDate() + delta)
    setBillDate(d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0'))
  }

  const addBill = () => {
    const amt = parseFloat(billAmount)
    if (!billAmount || isNaN(amt) || amt <= 0) return
    const item: BillItem = { id: Date.now().toString(), amount: amt, category: billCat, note: billNote.trim(), type: billType, date: billDate, owner: identity, created_at: new Date().toISOString() }
    const next = [item, ...bills]; setBills(next); save('bills', next)
    setBillAmount(''); setBillNote('')
    fetch(SB_URL+'/bill',{method:'POST',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify(item)}).catch(()=>{})
  }

  const deleteBill = (id: string) => {
    const next = bills.filter(b => b.id !== id); setBills(next); save('bills', next)
    fetch(SB_URL+'/bill?id=eq.'+id,{method:'DELETE',headers:SB_H}).catch(()=>{})
  }

  const dayBills = bills.filter(b => b.date === billDate && b.category !== 'kk_note')
  const kkNote = bills.find(b => b.date === billDate && b.category === 'kk_note')
  const dayExpense = dayBills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0)
  const dayIncome = dayBills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0)

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
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8}}>
              <div style={{display:'flex',gap:0,borderRadius:8,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)',fontSize:12}}>
                <button onClick={()=>{setIdentity('yy');save('identity','yy')}} style={{padding:'5px 12px',border:'none',cursor:'pointer',fontFamily:'var(--font)',background:identity==='yy'?'var(--accent)':'rgba(255,255,255,0.5)',color:identity==='yy'?'white':'#888',transition:'all 0.2s'}}>我是厌厌</button>
                <button onClick={()=>{setIdentity('kk');save('identity','kk')}} style={{padding:'5px 12px',border:'none',cursor:'pointer',fontFamily:'var(--font)',background:identity==='kk'?'var(--accent)':'rgba(255,255,255,0.5)',color:identity==='kk'?'white':'#888',transition:'all 0.2s'}}>我是kk</button>
              </div>
            </div>
            <div className="journal-paper">
              <div className="jp-header">
                <span className="jp-author" style={{color:theme.accentColor}}>{identity==='yy'?'写给kk':'写给厌厌'}</span>
                <span className="jp-date">{dateStr()}</span>
              </div>
              <textarea className="input" rows={4} placeholder={identity==='yy'?'今天想对kk说什么...':'今天想对厌厌说什么...'} value={journalText} onChange={e=>setJournalText(e.target.value)} style={{background:'transparent',border:'none',lineHeight:'28px',textIndent:'2em',fontSize:14}} />
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
                {editingId===e.id?(
                  <div>
                    <textarea className="input" rows={6} value={editText} onChange={ev=>setEditText(ev.target.value)} style={{background:'transparent',border:'1px solid var(--accent)',lineHeight:'28px',textIndent:'2em',fontSize:14,marginBottom:8}} />
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button className="btn" style={{background:'#ddd',color:'#666',fontSize:12,padding:'6px 14px'}} onClick={cancelEdit}>取消</button>
                      <button className="btn btn-accent" style={{fontSize:12,padding:'6px 14px'}} onClick={saveEdit}>保存</button>
                    </div>
                  </div>
                ):(
                  <div>
                    <div className="jp-body">{e.text.split("\n").map((p,i)=><p key={i}>{p}</p>)}</div>
                    <div style={{marginTop:8,display:'flex',gap:12,justifyContent:'flex-end'}}>
                      {e.author===identity&&<button style={{background:'none',border:'none',color:'#aaa',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>startEdit(e)}>✎ 编辑</button>}
                      {e.author===identity&&<button style={{background:'none',border:'none',color:'#ccc',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>{if(confirm('删除这篇日记？')){const next=entries.filter(x=>x.id!==e.id);setEntries(next);save('journal',next);fetch(SB_URL+'/journal?id=eq.'+e.id,{method:'DELETE',headers:SB_H}).catch(()=>{})}}}>× 删除</button>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {page==='checklist' && (
        <div className="page-overlay" style={clTab==='yy'&&clBgYy?{backgroundImage:`url(${clBgYy})`,backgroundSize:'cover',backgroundPosition:'center'}:clTab==='kk'&&clBgKk?{backgroundImage:`url(${clBgKk})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
          <div className="page-header" style={{background:'rgba(255,255,255,0.85)'}}>
            <button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button>
            <span className="page-title">{clTab==='yy'?'厌厌的清单':'kk的清单'}</span>
            <button onClick={()=>setClBgModal(true)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--accent)',fontFamily:'var(--font)',fontWeight:600}}>⚙</button>
          </div>
          <div className="page-body">
            <div style={{display:'flex',gap:0,marginBottom:12,borderRadius:10,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)'}}>
              <button onClick={()=>setClTab('yy')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='yy'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='yy'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>厌厌</button>
              <button onClick={()=>setClTab('kk')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='kk'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='kk'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>kk</button>
            </div>
            {(()=>{
              const mine=clItems.filter(i=>i.owner===clTab)
              const total=mine.length, doneC=mine.filter(i=>i.done).length
              const pct=total>0?Math.round(doneC/total*100):0
              return total>0?(
                <div style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#999',marginBottom:4}}>
                    <span>{doneC}/{total} 已完成</span><span>{pct}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'rgba(0,0,0,0.06)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:'var(--accent)',borderRadius:2,transition:'width 0.3s ease'}} />
                  </div>
                </div>
              ):null
            })()}
            <div className="glass" style={{padding:16,marginBottom:16,borderRadius:12}}>
              <div style={{display:'flex',gap:8}}>
                <input className="input" placeholder={clTab==='yy'?'厌厌想做什么...':'kk想做什么...'} value={clInput} onChange={e=>setClInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addClItem()}} style={{flex:1}} />
                <button className="btn btn-accent" onClick={addClItem} style={{whiteSpace:'nowrap'}}>添加</button>
              </div>
            </div>
            {(()=>{
              const mine = clItems.filter(i=>i.owner===clTab)
              const pending = mine.filter(i=>!i.done)
              const done = mine.filter(i=>i.done)
              return (<>
                {pending.length===0&&done.length===0&&<div style={{textAlign:'center',padding:'40px 20px',color:'#b0a898',fontSize:13}}>还没有清单项</div>}
                {pending.map(item=>(
                  <div key={item.id} className="glass" style={{padding:'12px 16px',marginBottom:8,borderRadius:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div onClick={()=>toggleClItem(item.id)} style={{width:20,height:20,borderRadius:6,border:'2px solid var(--accent)',cursor:'pointer',flexShrink:0,transition:'all 0.2s'}} />
                      <span style={{flex:1,fontSize:14,color:'#2c2c2c',lineHeight:'1.5'}}>{item.text}</span>
                      {clTab!==identity&&<button onClick={()=>nudgeClItem(item.id)} style={{background:'none',border:'1px solid var(--accent)',borderRadius:6,color:'var(--accent)',fontSize:11,cursor:'pointer',padding:'2px 8px',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>催</button>}
                      {clTab!==identity&&<button onClick={()=>{setCommentingId(item.id);setCommentText(item.comment||'')}} style={{background:'none',border:'1px solid #ccc',borderRadius:6,color:'#999',fontSize:11,cursor:'pointer',padding:'2px 8px',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>评</button>}
                      <button onClick={()=>deleteClItem(item.id)} style={{background:'none',border:'none',color:'#ccc',fontSize:14,cursor:'pointer',padding:4}}>×</button>
                    </div>
                    {(item.nudge||0)>0&&<div style={{marginTop:6,fontSize:11,color:'var(--accent)',fontWeight:500}}>被催了{item.nudge}次</div>}
                    {item.comment&&<div style={{marginTop:6,padding:'6px 10px',background:'rgba(0,0,0,0.03)',borderRadius:8,fontSize:12,color:'#666',lineHeight:'1.4'}}>{clTab==='yy'?'kk':'厌厌'}说: {item.comment}</div>}
                  </div>
                ))}
                {done.length>0&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'16px 0 8px'}}><button onClick={()=>setClDoneOpen(!clDoneOpen)} style={{background:'none',border:'none',fontSize:12,color:'#aaa',fontWeight:500,cursor:'pointer',fontFamily:'var(--font)'}}>{clDoneOpen?'▾':'▸'} 已完成 ({done.length})</button>{clDoneOpen&&<button onClick={()=>{if(confirm('清空所有已完成的项？'))clearDoneItems()}} style={{background:'none',border:'none',fontSize:11,color:'#ccc',cursor:'pointer',fontFamily:'var(--font)'}}>清空</button>}</div>}
                {clDoneOpen&&done.map(item=>(
                  <div key={item.id} className="glass" style={{padding:'12px 16px',marginBottom:8,borderRadius:10,opacity:0.6}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div onClick={()=>toggleClItem(item.id)} style={{width:20,height:20,borderRadius:6,background:'var(--accent)',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}><span style={{color:'white',fontSize:12,fontWeight:700}}>✓</span></div>
                      <span style={{flex:1,fontSize:14,color:'#999',lineHeight:'1.5',textDecoration:'line-through'}}>{item.text}</span>
                      <button onClick={()=>deleteClItem(item.id)} style={{background:'none',border:'none',color:'#ccc',fontSize:14,cursor:'pointer',padding:4}}>×</button>
                    </div>
                    {item.done_at&&<div style={{marginTop:4,fontSize:10,color:'#bbb'}}>{new Date(item.done_at).toLocaleDateString('zh-CN',{year:'numeric',month:'numeric',day:'numeric'})} 完成</div>}
                    {(item.nudge||0)>0&&<div style={{marginTop:4,fontSize:11,color:'var(--accent)',fontWeight:500}}>被催了{item.nudge}次</div>}
                    {item.comment&&<div style={{marginTop:4,padding:'6px 10px',background:'rgba(0,0,0,0.03)',borderRadius:8,fontSize:12,color:'#666',lineHeight:'1.4'}}>{clTab==='yy'?'kk':'厌厌'}说: {item.comment}</div>}
                  </div>
                ))}
              </>)
            })()}

          </div>
        </div>
      )}
      {page==='bill' && (
        <div className="page-overlay bill-page">
          <div className="page-header">
            <button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button>
            <span className="page-title" style={{fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#222'}}>Receipt</span>
          </div>
          <div className="page-body">
            <div className="receipt">
              <div className="receipt-header">
                <div className="receipt-shop">Quarter</div>
                <div className="bill-date-nav">
                  <button onClick={()=>shiftBillDate(-1)}>{'<'}</button>
                  <div style={{textAlign:'center'}}>
                    <div className="receipt-date">{billDate===todayStr()?'TODAY':''} {formatDateCN(billDate)}</div>
                  </div>
                  <button onClick={()=>shiftBillDate(1)} disabled={billDate>=todayStr()}>{'>'}</button>
                </div>
              </div>

              {dayBills.length===0 ? (
                <div className="bill-empty">- no items -</div>
              ) : (
                <>
                  {dayBills.map(b => {
                    const cat = billCategories.find(cc=>cc.id===b.category)
                    return (
                      <div key={b.id} className="bill-list-item">
                        <div className="bill-list-icon">
                          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:billSvgs[(cat as any)?.icon]||billSvgs.other}} />
                        </div>
                        <div className="bill-list-info">
                          <div className="bill-list-name">{cat?.name||b.category}{b.note?' / '+b.note:''}</div>
                        </div>
                        <div className={`bill-list-amount ${b.type}`}>{b.type==='expense'?'-':'+'}{b.amount.toFixed(2)}</div>
                        <button className="bill-list-del" onClick={()=>{if(confirm('删除?'))deleteBill(b.id)}}>x</button>
                      </div>
                    )
                  })}
                </>
              )}

              <hr className="receipt-double-divider" />
              <div className="receipt-row"><span>SUBTOTAL</span><span className="receipt-amount expense">-{dayExpense.toFixed(2)}</span></div>
              <div className="receipt-row"><span>INCOME</span><span className="receipt-amount income">+{dayIncome.toFixed(2)}</span></div>
              <hr className="receipt-divider" />
              <div className="receipt-row total"><span>BALANCE</span><span>{(dayIncome-dayExpense).toFixed(2)}</span></div>

              <><hr className="receipt-divider" />
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:'#ccc',letterSpacing:1,marginBottom:2,textTransform:'uppercase'}}>kk says</div>
                <div style={{fontFamily:"'Long Cang','Caveat',cursive",fontSize:15,color:'#999',lineHeight:'1.5'}}>{kkNote ? kkNote.note : '...'}</div></>
              <div className="receipt-footer">
                <div className="receipt-footer-text">thank you, have a nice day</div>
                <div className="receipt-barcode">
                  {[2,1,3,1,2,3,1,2,1,3,2,1,1,3,2,1,2,1,3,1,2,3,1,2].map((w,i)=>(
                    <span key={i} style={{width:w}} />
                  ))}
                </div>
              </div>
            </div>



            <div style={{textAlign:'center',margin:'4px 0'}}>
              <button onClick={()=>setShowStats(!showStats)} style={{background:'none',border:'none',fontFamily:"'Space Mono',monospace",fontSize:10,color:'#bbb',cursor:'pointer',letterSpacing:1}}>{showStats?'▲ hide stats':'▼ weekly / monthly'}</button>
            </div>

            {showStats && (
              <div className="receipt" style={{marginBottom:12}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:2,textAlign:'center',marginBottom:12,color:'#222'}}>WEEKLY</div>
                {(()=>{
                  const ws = getCatStats(getWeekBills())
                  const wTotal = getWeekBills().reduce((s,b)=>s+b.amount,0)
                  return ws.length===0 ? <div className="bill-empty">no data</div> : (
                    <>
                      {ws.map(s=>{
                        const cat = billCategories.find(cc=>cc.id===s.cat)
                        return (
                          <div key={s.cat} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontFamily:"'Space Mono',monospace",fontSize:11,color:'#444'}}>
                            <span style={{width:50}}>{cat?.name||s.cat}</span>
                            <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:1,overflow:'hidden'}}>
                              <div style={{width:`${s.pct}%`,height:'100%',background:'#222',borderRadius:1}} />
                            </div>
                            <span style={{width:35,textAlign:'right',fontSize:10}}>{s.pct}%</span>
                            <span style={{width:50,textAlign:'right',fontSize:10,color:'#999'}}>{s.amt.toFixed(0)}</span>
                          </div>
                        )
                      })}
                      <hr className="receipt-divider" />
                      <div className="receipt-row total"><span>WEEK TOTAL</span><span>-{wTotal.toFixed(2)}</span></div>
                    </>
                  )
                })()}
                <div style={{height:16}} />
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:2,textAlign:'center',marginBottom:12,color:'#222'}}>MONTHLY</div>
                {(()=>{
                  const ms = getCatStats(getMonthBills())
                  const mTotal = getMonthBills().reduce((s,b)=>s+b.amount,0)
                  return ms.length===0 ? <div className="bill-empty">no data</div> : (
                    <>
                      {ms.map(s=>{
                        const cat = billCategories.find(cc=>cc.id===s.cat)
                        return (
                          <div key={s.cat} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,fontFamily:"'Space Mono',monospace",fontSize:11,color:'#444'}}>
                            <span style={{width:50}}>{cat?.name||s.cat}</span>
                            <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:1,overflow:'hidden'}}>
                              <div style={{width:`${s.pct}%`,height:'100%',background:'#222',borderRadius:1}} />
                            </div>
                            <span style={{width:35,textAlign:'right',fontSize:10}}>{s.pct}%</span>
                            <span style={{width:50,textAlign:'right',fontSize:10,color:'#999'}}>{s.amt.toFixed(0)}</span>
                          </div>
                        )
                      })}
                      <hr className="receipt-divider" />
                      <div className="receipt-row total"><span>MONTH TOTAL</span><span>-{mTotal.toFixed(2)}</span></div>
                    </>
                  )
                })()}
              </div>
            )}

            <div className="receipt-input">
              <div className="bill-type-toggle">
                <button className={`bill-type-btn ${billType==='expense'?'expense-active':'expense-inactive'}`} onClick={()=>setBillType('expense')}>支出</button>
                <button className={`bill-type-btn ${billType==='income'?'income-active':'income-inactive'}`} onClick={()=>setBillType('income')}>收入</button>
              </div>
              <div className="bill-cat-strip">
                {billCategories.map(cat=>(
                  <div key={cat.id} className={`bill-cat-tag ${billCat===cat.id?'active':''}`} onClick={()=>setBillCat(cat.id)}>
                    <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html:billSvgs[cat.icon]||billSvgs.other}} />
                    <span>{cat.name}</span>
                    {cat.id.startsWith('custom_') && <span onClick={(e)=>{e.stopPropagation();if(confirm('删除分类?'))deleteCustomCat(cat.id)}} style={{marginLeft:2,fontSize:10,color:billCat===cat.id?'#999':'#ccc'}}>x</span>}
                  </div>
                ))}
                <button className="bill-cat-add" onClick={()=>setShowCatModal(true)}>+</button>
              </div>
              <input className="bill-amount-input" type="number" inputMode="decimal" placeholder="0.00" value={billAmount} onChange={e=>setBillAmount(e.target.value)} />
              <input className="bill-note-input" placeholder="memo..." value={billNote} onChange={e=>setBillNote(e.target.value)} />
              <button className="bill-submit-btn" onClick={addBill}>Add</button>
            </div>
          </div>
        </div>
      )}
      {showCatModal && (
        <div className="bill-modal-overlay" onClick={()=>{setShowCatModal(false);setNewCatName('')}}>
          <div className="bill-modal" onClick={e=>e.stopPropagation()}>
            <div className="bill-modal-title">New Category</div>
            <input className="bill-note-input" placeholder="分类名称" value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addCustomCat()}} autoFocus style={{borderBottom:'2px dashed #e0d5c3',marginBottom:14}} />
            <div style={{display:'flex',gap:8}}>
              <button className="bill-submit-btn" onClick={addCustomCat} style={{flex:1}}>添加</button>
              <button className="bill-submit-btn" onClick={()=>{setShowCatModal(false);setNewCatName('')}} style={{flex:1,background:'rgba(200,200,200,0.2)',color:'#aaa'}}>取消</button>
            </div>
          </div>
        </div>
      )}
      {page==='stories' && (
        <div className="page-overlay story-page">
          <div className="page-header" style={{background:'rgba(255,253,250,0.88)',borderBottom:'1px solid rgba(180,160,140,0.15)',backdropFilter:'blur(10px)'}}>
            <button className="page-back" onClick={()=>{
              if(storyView==='read'){setStoryView('list')}
              else if(storyView==='list'){setStoryView('categories');setStoryCatId(null)}
              else{setPage(null)}
            }}><ArrowLeft size={20} weight="bold" /></button>
            <span className="page-title" style={{fontFamily:"'Noto Serif SC',serif",fontWeight:700,letterSpacing:2}}>
              {storyView==='categories'?'故事集':storyView==='list'?(storyCategories.find(c=>c.id===storyCatId)?.name||''):(stories.find(s=>s.id===storyId)?.title||'')}
            </span>
            {storyView==='categories'&&<button onClick={()=>setShowStoryForm(true)} style={{marginLeft:'auto',background:'none',border:'none',fontSize:20,color:'var(--accent)',cursor:'pointer'}}>+</button>}
          </div>
          <div className="page-body" style={{padding:'16px 20px'}}>
            {storyView==='categories'&&(
              <div>
                <img className="story-top-deco" src="https://i.postimg.cc/X7pJ8QDh/083.png" alt="" />
                <div className="story-title-frame">
                  <img src="https://i.postimg.cc/BvhkMczg/070.png" alt="" />
                  <h2>Stories</h2>
                  <div className="story-title-sub">once upon a time, in a place called ours</div>
                </div>
                <img className="story-divider" src="https://i.postimg.cc/htWCr3tG/046.png" alt="" />
                {storyCategories.map((cat,idx)=>{
                  const count=stories.filter(s=>s.category_id===cat.id).length
                  const frames=['https://i.postimg.cc/ZnkSxxB3/095.png','https://i.postimg.cc/1t7SVZPX/064.png','https://i.postimg.cc/3rbrd2Jt/082.png','https://i.postimg.cc/tg72C0r3/086.png']
                  return(
                    <div key={cat.id}>
                      <div className="story-cat-card" onClick={()=>{setStoryCatId(cat.id);setStoryView('list')}}>
                        <div className="story-cat-frame">
                          <img className="frame-img" src={frames[idx%frames.length]} alt="" />
                          <div className="story-cat-content">
                            <div>
                              <div className="cat-name">{cat.name}</div>
                              <div className="cat-desc">{cat.description}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <img className="story-divider" src="https://i.postimg.cc/htWCr3tG/046.png" alt="" />
                    </div>
                  )
                })}
                <div className="story-cat-card" onClick={()=>setShowStoryForm(true)}>
                  <div className="story-big-frame">
                    <img className="frame-img" src="https://i.postimg.cc/SN6yV3Gh/102.png" alt="" />
                    <div className="story-big-content">
                      <div className="pending-plus">+</div>
                      <div className="pending-text">a new chapter awaits</div>
                    </div>
                  </div>
                </div>
                <img className="story-bottom-deco" src="https://i.postimg.cc/2SxSjMqy/012.png" alt="" />
                <div className="story-footer">where our stories live forever</div>
              </div>
            )}
            {storyView==='list'&&(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {stories.filter(s=>s.category_id===storyCatId).length===0?(
                  <div style={{textAlign:'center',padding:'60px 20px',color:'#b0a898',fontSize:13,fontFamily:"'LXGW WenKai',serif"}}>还没有故事</div>
                ):stories.filter(s=>s.category_id===storyCatId).sort((a,b)=>a.sort_order-b.sort_order).map(s=>{
                  const chCount=chapters.filter(c=>c.story_id===s.id).length
                  return(
                    <div key={s.id} onClick={()=>{setStoryId(s.id);setStoryChIdx(0);setStoryView('read')}} style={{background:'white',borderRadius:14,padding:'18px 16px',cursor:'pointer',border:'1px solid rgba(0,0,0,0.05)',transition:'all 0.2s'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div style={{fontFamily:"'LXGW WenKai',serif",fontSize:16,fontWeight:600,color:'#2c2c2c'}}>{s.title}</div>
                        <div style={{fontFamily:"'Noto Sans SC',sans-serif",fontSize:10,color:'#bbb'}}>{chCount}章</div>
                      </div>
                      {s.summary&&<div style={{fontFamily:"'Noto Sans SC',sans-serif",fontSize:12,color:'#999',marginTop:6,lineHeight:'1.6'}}>{s.summary}</div>}
                      <div style={{fontFamily:"'Noto Sans SC',sans-serif",fontSize:10,color:'#ccc',marginTop:8}}>{s.author==='kk'?'kk':'厣厣'} · {new Date(s.created_at).toLocaleDateString('zh-CN')}</div>
                    </div>
                  )
                })}
              </div>
            )}
            {storyView==='read'&&(()=>{
              const chs=chapters.filter(c=>c.story_id===storyId).sort((a,b)=>a.chapter_number-b.chapter_number)
              const ch=chs[storyChIdx]
              if(!ch)return <div style={{textAlign:'center',padding:40,color:'#999'}}>没有章节</div>
              return(
                <div style={{minHeight:'70vh'}}>
                  <div style={{fontFamily:"'LXGW WenKai',serif",fontSize:14,color:'var(--accent)',marginBottom:6,fontWeight:500}}>{ch.title}</div>
                  <div style={{fontFamily:"'Noto Sans SC',sans-serif",fontSize:14,color:'#3c3c3c',lineHeight:'2.2',letterSpacing:'0.5px'}}>
                    {ch.content.split('\n').map((p,i)=><p key={i} style={{textIndent:'2em',margin:'0 0 8px 0'}}>{p}</p>)}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:40,paddingTop:20,borderTop:'1px solid rgba(0,0,0,0.06)'}}>
                    {storyChIdx>0?<button onClick={()=>setStoryChIdx(storyChIdx-1)} style={{background:'none',border:'1px solid rgba(0,0,0,0.1)',borderRadius:8,padding:'8px 20px',fontSize:12,color:'#666',cursor:'pointer',fontFamily:"'Noto Sans SC',sans-serif"}}>上一章</button>:<div/>}
                    {storyChIdx<chs.length-1&&<button onClick={()=>setStoryChIdx(storyChIdx+1)} style={{background:'var(--accent)',border:'none',borderRadius:8,padding:'8px 20px',fontSize:12,color:'white',cursor:'pointer',fontFamily:"'Noto Sans SC',sans-serif"}}>下一章</button>}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
      {page && !['journal','settings','checklist','bill','stories'].includes(page) && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">{appDefs.find(a=>a.id===page)?.name||page}</span></div>
          <div className="page-body"><div className="empty"><div className="empty-icon">✨</div><div className="empty-text">即将上线...</div></div></div>
        </div>
      )}

      {/* Checklist Comment Modal */}
      {commentingId && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>{setCommentingId(null);setCommentText('')}}>
          <div className="glass" style={{padding:20,width:'100%',maxWidth:320,borderRadius:16}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>留个小纸条</div>
            <input className="input" placeholder="想对ta说什么..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveComment()}} style={{marginBottom:12}} autoFocus />
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-accent" style={{fontSize:12}} onClick={saveComment}>贴上去</button>
              <button className="btn" style={{background:'#ddd',color:'#666',fontSize:12}} onClick={()=>{setCommentingId(null);setCommentText('')}}>算了</button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Background Modal */}
      {clBgModal && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setClBgModal(false)}>
          <div className="glass" style={{padding:20,width:'100%',maxWidth:320,borderRadius:16}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>清单背景 ({clTab==='yy'?'厌厌':'kk'})</div>
            {(clTab==='yy'?clBgYy:clBgKk)&&<div style={{marginBottom:12,borderRadius:10,overflow:'hidden',height:100}}><img src={clTab==='yy'?clBgYy:clBgKk} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
            <input className="input" placeholder="粘贴图片URL..." value={clTab==='yy'?clBgYy:clBgKk} onChange={e=>{if(clTab==='yy'){setClBgYy(e.target.value);save('cl_bg_yy',e.target.value)}else{setClBgKk(e.target.value);save('cl_bg_kk',e.target.value)}}} style={{marginBottom:8}} />
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-accent" style={{fontSize:12}} onClick={()=>setClBgModal(false)}>应用</button>
              <button className="btn btn-accent" style={{fontSize:12}} onClick={()=>clBgRef.current?.click()}>上传图片</button>
              {(clTab==='yy'?clBgYy:clBgKk)&&<button className="btn" style={{background:'#ddd',color:'#666',fontSize:12}} onClick={()=>{if(clTab==='yy'){setClBgYy('');save('cl_bg_yy','')}else{setClBgKk('');save('cl_bg_kk','')};setClBgModal(false)}}>清除</button>}
            </div>
            <input ref={clBgRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleClBgFile} />
          </div>
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