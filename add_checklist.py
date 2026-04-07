with open('/home/quarter-clean/src/App.tsx', 'r') as f:
    code = f.read()

# 1. Add ChecklistItem interface after JournalEntry interface
old_interface = "interface JournalEntry { id: string; author: 'yy'|'kk'; text: string; date: string }"
new_interface = """interface JournalEntry { id: string; author: 'yy'|'kk'; text: string; date: string }
interface ChecklistItem { id: string; text: string; done: boolean; owner: 'yy'|'kk'; created_at: string }"""
code = code.replace(old_interface, new_interface)

# 2. Add Checklist state variables after editText state
old_edit = "const [editText, setEditText] = useState('')\n\n  // Icon editor"
new_edit = """const [editText, setEditText] = useState('')

  // Checklist
  const [clTab, setClTab] = useState<'yy'|'kk'>(()=>load('identity','yy') as 'yy'|'kk')
  const [clItems, setClItems] = useState<ChecklistItem[]>(()=>load('checklist',[]))
  const [clInput, setClInput] = useState('')
  const [clBgYy, setClBgYy] = useState<string>(()=>load('cl_bg_yy',''))
  const [clBgKk, setClBgKk] = useState<string>(()=>load('cl_bg_kk',''))

  // Icon editor"""
code = code.replace(old_edit, new_edit)

# 3. Add checklist functions after cancelEdit
old_cancel = "const cancelEdit = () => { setEditingId(null); setEditText('') }\n\n  const addJournal"
new_cancel = """const cancelEdit = () => { setEditingId(null); setEditText('') }

  const addClItem = () => {
    if(!clInput.trim()) return
    const item: ChecklistItem = { id: Date.now().toString(), text: clInput.trim(), done: false, owner: clTab, created_at: new Date().toISOString() }
    const next = [item, ...clItems]; setClItems(next); save('checklist', next); setClInput('')
    fetch(SB_URL+'/checklist',{method:'POST',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify(item)}).catch(()=>{})
  }
  const toggleClItem = (id: string) => {
    const next = clItems.map(i=>i.id===id?{...i,done:!i.done}:i); setClItems(next); save('checklist', next)
    const item = next.find(i=>i.id===id)
    if(item) fetch(SB_URL+'/checklist?id=eq.'+id,{method:'PATCH',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify({done:item.done})}).catch(()=>{})
  }
  const deleteClItem = (id: string) => {
    const next = clItems.filter(i=>i.id!==id); setClItems(next); save('checklist', next)
    fetch(SB_URL+'/checklist?id=eq.'+id,{method:'DELETE',headers:SB_H}).catch(()=>{})
  }

  const addJournal"""
code = code.replace(old_cancel, new_cancel)

# 4. Add Supabase load for checklist after journal load useEffect
old_journal_load = """fetch(SB_URL+'/journal?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setEntries(data);save('journal',data)}})
      .catch(()=>{})
  }, [])"""
new_journal_load = """fetch(SB_URL+'/journal?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setEntries(data);save('journal',data)}})
      .catch(()=>{})
  }, [])

  // Load checklist from Supabase
  useEffect(() => {
    fetch(SB_URL+'/checklist?select=*&order=created_at.desc',{headers:SB_H})
      .then(r=>r.json()).then(data=>{if(Array.isArray(data)&&data.length>0){setClItems(data);save('checklist',data)}})
      .catch(()=>{})
  }, [])"""
code = code.replace(old_journal_load, new_journal_load)

# 5. Replace the checklist page placeholder with actual checklist UI
# Find the generic placeholder rendering
old_placeholder = """      {page && !['journal','settings'].includes(page) && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">{appDefs.find(a=>a.id===page)?.name||page}</span></div>
          <div className="page-body"><div className="empty"><div className="empty-icon">\u2728</div><div className="empty-text">\u5373\u5c06\u4e0a\u7ebf...</div></div></div>
        </div>
      )}"""

new_placeholder = """      {page==='checklist' && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">\u6e05\u5355</span></div>
          <div className="page-body" style={clTab==='yy'&&clBgYy?{backgroundImage:`url(${clBgYy})`,backgroundSize:'cover',backgroundPosition:'center'}:clTab==='kk'&&clBgKk?{backgroundImage:`url(${clBgKk})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
            <div style={{display:'flex',gap:0,marginBottom:16,borderRadius:10,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)'}}>
              <button onClick={()=>setClTab('yy')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='yy'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='yy'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>\u538c\u538c\u7684\u6e05\u5355</button>
              <button onClick={()=>setClTab('kk')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='kk'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='kk'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>kk\u7684\u6e05\u5355</button>
            </div>
            <div className="glass" style={{padding:16,marginBottom:16,borderRadius:12}}>
              <div style={{display:'flex',gap:8}}>
                <input className="input" placeholder={clTab==='yy'?'\u538c\u538c\u60f3\u505a\u4ec0\u4e48...':'kk\u60f3\u505a\u4ec0\u4e48...'} value={clInput} onChange={e=>setClInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addClItem()}} style={{flex:1}} />
                <button className="btn btn-accent" onClick={addClItem} style={{whiteSpace:'nowrap'}}>\u6dfb\u52a0</button>
              </div>
            </div>
            {(()=>{
              const mine = clItems.filter(i=>i.owner===clTab)
              const pending = mine.filter(i=>!i.done)
              const done = mine.filter(i=>i.done)
              return (<>
                {pending.length===0&&done.length===0&&<div style={{textAlign:'center',padding:'40px 20px',color:'#b0a898',fontSize:13}}>\u8fd8\u6ca1\u6709\u6e05\u5355\u9879</div>}
                {pending.map(item=>(
                  <div key={item.id} className="glass" style={{padding:'12px 16px',marginBottom:8,borderRadius:10,display:'flex',alignItems:'center',gap:12}}>
                    <div onClick={()=>toggleClItem(item.id)} style={{width:20,height:20,borderRadius:6,border:'2px solid var(--accent)',cursor:'pointer',flexShrink:0,transition:'all 0.2s'}} />
                    <span style={{flex:1,fontSize:14,color:'#2c2c2c',lineHeight:'1.5'}}>{item.text}</span>
                    <button onClick={()=>deleteClItem(item.id)} style={{background:'none',border:'none',color:'#ccc',fontSize:14,cursor:'pointer',padding:4}}>\u00d7</button>
                  </div>
                ))}
                {done.length>0&&<div style={{fontSize:12,color:'#aaa',margin:'16px 0 8px',fontWeight:500}}>\u5df2\u5b8c\u6210 ({done.length})</div>}
                {done.map(item=>(
                  <div key={item.id} className="glass" style={{padding:'12px 16px',marginBottom:8,borderRadius:10,display:'flex',alignItems:'center',gap:12,opacity:0.6}}>
                    <div onClick={()=>toggleClItem(item.id)} style={{width:20,height:20,borderRadius:6,background:'var(--accent)',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}><span style={{color:'white',fontSize:12,fontWeight:700}}>\u2713</span></div>
                    <span style={{flex:1,fontSize:14,color:'#999',lineHeight:'1.5',textDecoration:'line-through'}}>{item.text}</span>
                    <button onClick={()=>deleteClItem(item.id)} style={{background:'none',border:'none',color:'#ccc',fontSize:14,cursor:'pointer',padding:4}}>\u00d7</button>
                  </div>
                ))}
              </>)
            })()}
            <div style={{marginTop:24,padding:16}} className="glass">
              <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:'#666'}}>\u6e05\u5355\u80cc\u666f ({clTab==='yy'?'\u538c\u538c':'kk'})</div>
              <input className="input" placeholder="\u7c98\u8d34\u56fe\u7247URL..." value={clTab==='yy'?clBgYy:clBgKk} onChange={e=>{if(clTab==='yy'){setClBgYy(e.target.value);save('cl_bg_yy',e.target.value)}else{setClBgKk(e.target.value);save('cl_bg_kk',e.target.value)}}} style={{marginBottom:8}} />
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-accent" style={{fontSize:12}} onClick={()=>{if(clTab==='yy'){save('cl_bg_yy',clBgYy)}else{save('cl_bg_kk',clBgKk)}}}>\u5e94\u7528</button>
                {(clTab==='yy'?clBgYy:clBgKk)&&<button className="btn" style={{background:'#ddd',color:'#666',fontSize:12}} onClick={()=>{if(clTab==='yy'){setClBgYy('');save('cl_bg_yy','')}else{setClBgKk('');save('cl_bg_kk','')}}}>\u6e05\u9664</button>}
              </div>
            </div>
          </div>
        </div>
      )}
      {page && !['journal','settings','checklist'].includes(page) && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">{appDefs.find(a=>a.id===page)?.name||page}</span></div>
          <div className="page-body"><div className="empty"><div className="empty-icon">\u2728</div><div className="empty-text">\u5373\u5c06\u4e0a\u7ebf...</div></div></div>
        </div>
      )}"""

if old_placeholder in code:
    code = code.replace(old_placeholder, new_placeholder)
    print('Placeholder replaced successfully')
else:
    print('ERROR: Could not find placeholder block')
    idx = code.find("!['journal','settings'].includes")
    if idx > -1:
        print('Found at index', idx)
        print(repr(code[idx-50:idx+200]))

with open('/home/quarter-clean/src/App.tsx', 'w') as f:
    f.write(code)

print('Done.')
print('ChecklistItem count:', code.count('ChecklistItem'))
print('clTab count:', code.count('clTab'))
print('addClItem count:', code.count('addClItem'))
