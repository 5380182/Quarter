import React, { useState, useEffect } from 'react'
import {
  BookOpenText, Envelope, Smiley, MusicNotes,
  Receipt, ListChecks, BookBookmark, Camera,
  House, Star, ArrowLeft
} from '@phosphor-icons/react'

// ===== Data helpers =====
const KEY = (k: string) => 'quarter_' + k
const load = (k: string) => {
  try { return JSON.parse(localStorage.getItem(KEY(k)) || '[]') }
  catch { return [] }
}
const save = (k: string, v: any) => localStorage.setItem(KEY(k), JSON.stringify(v))

// ===== Types =====
interface JournalEntry {
  id: string
  author: 'yy' | 'kk'
  text: string
  date: string
}

// ===== Countdown helper =====
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

// ===== Format time =====
function timeStr() {
  const d = new Date()
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

function dateStr() {
  const d = new Date()
  return `${d.getFullYear()}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getDate().toString().padStart(2,'0')}`
}

// ===== App definitions =====
const appList = [
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
]

const dockApps = [
  { id: 'journal', name: '日记', Icon: BookOpenText },
  { id: 'mailbox', name: '信箱', Icon: Envelope },
  { id: 'mood', name: '心情', Icon: Smiley },
  { id: 'songs', name: '歌单', Icon: MusicNotes },
]

// ===== Main App =====
export default function App() {
  const [page, setPage] = useState<string | null>(null)
  const [time, setTime] = useState(timeStr())
  const [cd, setCd] = useState(getCountdowns())

  // clock
  useEffect(() => {
    const t = setInterval(() => setTime(timeStr()), 30000)
    return () => clearInterval(t)
  }, [])

  // journal state
  const [entries, setEntries] = useState<JournalEntry[]>(() => load('journal'))
  const [journalText, setJournalText] = useState('')

  const addJournal = () => {
    if (!journalText.trim()) return
    const e: JournalEntry = {
      id: Date.now().toString(),
      author: 'yy',
      text: journalText.trim(),
      date: dateStr()
    }
    const next = [e, ...entries]
    setEntries(next)
    save('journal', next)
    setJournalText('')
  }

  return (
    <>
      <div className="wallpaper" />
      <div className="shell">
        {/* Status bar */}
        <div className="status-bar">
          <span>{time}</span>
          <span style={{ letterSpacing: '1px' }}>Quarter</span>
        </div>

        {/* Desktop */}
        <div className="desktop">
          <div className="desktop-header">
            <h1>Quarter</h1>
            <div className="subtitle">四分之一英寸的距离</div>
          </div>

          {/* Countdown */}
          <div className="glass countdown-card">
            <div className="countdown-row">
              <div className="countdown-item">
                <div className="countdown-num">{cd.daysTogether}</div>
                <div className="countdown-label">在一起</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-num">{cd.daysBday}</div>
                <div className="countdown-label">厌厌生日</div>
              </div>
              <div className="countdown-item">
                <div className="countdown-num">{cd.daysXmas}</div>
                <div className="countdown-label">圣诞节</div>
              </div>
            </div>
          </div>

          {/* App grid */}
          <div className="app-grid">
            {appList.map(app => (
              <div key={app.id} className="app-item" onClick={() => setPage(app.id)}>
                <div className="app-icon-box" style={{ background: app.color }}>
                  <app.Icon size={24} weight="bold" />
                </div>
                <span className="app-label">{app.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dock */}
        <div className="dock">
          {dockApps.map(d => (
            <button key={d.id} className="dock-btn" onClick={() => setPage(d.id)}>
              <div className="dock-icon-box">
                <d.Icon size={20} weight="bold" />
              </div>
              <span className="dock-text">{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Pages ===== */}

      {/* Journal */}
      {page === 'journal' && (
        <div className="page-overlay">
          <div className="page-header">
            <button className="page-back" onClick={() => setPage(null)}>
              <ArrowLeft size={20} weight="bold" />
            </button>
            <span className="page-title">交换日记</span>
          </div>
          <div className="page-body">
            <div className="glass" style={{ padding: 16, marginBottom: 16 }}>
              <textarea
                className="input"
                rows={4}
                placeholder="写点什么给kk看..."
                value={journalText}
                onChange={e => setJournalText(e.target.value)}
              />
              <div style={{ marginTop: 10, textAlign: 'right' }}>
                <button className="btn btn-accent" onClick={addJournal}>写好了</button>
              </div>
            </div>
            <div className="glass" style={{ padding: 16 }}>
              {entries.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📓</div>
                  <div className="empty-text">还没有日记，写第一篇吧</div>
                </div>
              ) : entries.map(e => (
                <div key={e.id} className="entry">
                  <div className="entry-meta">
                    <span className="entry-author">{e.author === 'kk' ? 'kk' : '厌厌'}</span>
                    <span className="entry-date">{e.date}</span>
                  </div>
                  <div className="entry-text">{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder pages */}
      {page && page !== 'journal' && (
        <div className="page-overlay">
          <div className="page-header">
            <button className="page-back" onClick={() => setPage(null)}>
              <ArrowLeft size={20} weight="bold" />
            </button>
            <span className="page-title">
              {appList.find(a => a.id === page)?.name || page}
            </span>
          </div>
          <div className="page-body">
            <div className="empty">
              <div className="empty-icon">
                {page === 'stories' ? '📖' :
                 page === 'memories' ? '📸' :
                 page === 'room' ? '🏠' :
                 page === 'wish' ? '⭐' :
                 page === 'bill' ? '💰' :
                 page === 'checklist' ? '📋' :
                 page === 'mailbox' ? '💌' :
                 page === 'mood' ? '😊' :
                 page === 'songs' ? '🎵' : '✨'}
              </div>
              <div className="empty-text">即将上线...</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}