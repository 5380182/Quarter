with open('/home/quarter-clean/src/App.tsx', 'r') as f:
    code = f.read()

# 1. Add identity switcher in journal page header area, right after the journal-tabs div
# We'll add it before the journal-paper (the writing area)
old_tabs_end = '''</div>
            <div className="journal-paper">'''
new_tabs_end = '''</div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8}}>
              <div style={{display:'flex',gap:0,borderRadius:8,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)',fontSize:12}}>
                <button onClick={()=>{setIdentity('yy');save('identity','yy')}} style={{padding:'5px 12px',border:'none',cursor:'pointer',fontFamily:'var(--font)',background:identity==='yy'?'var(--accent)':'rgba(255,255,255,0.5)',color:identity==='yy'?'white':'#888',transition:'all 0.2s'}}>\u6211\u662f\u538c\u538c</button>
                <button onClick={()=>{setIdentity('kk');save('identity','kk')}} style={{padding:'5px 12px',border:'none',cursor:'pointer',fontFamily:'var(--font)',background:identity==='kk'?'var(--accent)':'rgba(255,255,255,0.5)',color:identity==='kk'?'white':'#888',transition:'all 0.2s'}}>\u6211\u662fkk</button>
              </div>
            </div>
            <div className="journal-paper">'''
code = code.replace(old_tabs_end, new_tabs_end)

# 2. Replace the journal entry rendering to include edit mode
# Find the existing entry rendering block
old_entry_render = '''<div key={e.id} className="journal-paper">
                <div className="jp-header">
                  <span className="jp-author" style={{color:e.author==='kk'?theme.accentColor:'#b07d9a'}}>{e.author==='kk'?'kk':'\u538c\u538c'}</span>
                  <span className="jp-date">{e.date}</span>
                </div>
                <div className="jp-body">{e.text.split("\\n").map((p,i)=><p key={i}>{p}</p>)}</div>
                <div style={{marginTop:8,textAlign:'right'}}><button style={{background:'none',border:'none',color:'#ccc',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>{if(confirm('\u5220\u9664\u8fd9\u7bc7\u65e5\u8bb0\uff1f')){const next=entries.filter(x=>x.id!==e.id);setEntries(next);save('journal',next);fetch(SB_URL+'/journal?id=eq.'+e.id,{method:'DELETE',headers:SB_H}).catch(()=>{})}}}>\u00d7 \u5220\u9664</button></div>
              </div>'''

new_entry_render = '''<div key={e.id} className="journal-paper">
                <div className="jp-header">
                  <span className="jp-author" style={{color:e.author==='kk'?theme.accentColor:'#b07d9a'}}>{e.author==='kk'?'kk':'\u538c\u538c'}</span>
                  <span className="jp-date">{e.date}</span>
                </div>
                {editingId===e.id?(<><textarea className="input" rows={6} value={editText} onChange={ev=>setEditText(ev.target.value)} style={{background:'transparent',border:'1px solid var(--accent)',lineHeight:'28px',textIndent:'2em',fontSize:14,marginBottom:8}} /><div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button className="btn" style={{background:'#ddd',color:'#666',fontSize:12,padding:'6px 14px'}} onClick={cancelEdit}>\u53d6\u6d88</button><button className="btn btn-accent" style={{fontSize:12,padding:'6px 14px'}} onClick={saveEdit}>\u4fdd\u5b58</button></div></>):(<><div className="jp-body">{e.text.split("\\n").map((p,i)=><p key={i}>{p}</p>)}</div><div style={{marginTop:8,textAlign:'right',display:'flex',gap:12,justifyContent:'flex-end'}}>{e.author===identity&&<button style={{background:'none',border:'none',color:'#aaa',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>startEdit(e)}>\u270e \u7f16\u8f91</button>}{e.author===identity&&<button style={{background:'none',border:'none',color:'#ccc',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>{if(confirm('\u5220\u9664\u8fd9\u7bc7\u65e5\u8bb0\uff1f')){const next=entries.filter(x=>x.id!==e.id);setEntries(next);save('journal',next);fetch(SB_URL+'/journal?id=eq.'+e.id,{method:'DELETE',headers:SB_H}).catch(()=>{})}}}>\u00d7 \u5220\u9664</button>}</div></>)}
              </div>'''

if old_entry_render in code:
    code = code.replace(old_entry_render, new_entry_render)
    print('Entry render replaced successfully')
else:
    print('ERROR: Could not find entry render block')
    # Let's print a portion to debug
    idx = code.find('jp-body')
    if idx > -1:
        print('Found jp-body at index', idx)
        print(repr(code[idx-100:idx+200]))

with open('/home/quarter-clean/src/App.tsx', 'w') as f:
    f.write(code)

print('Done.')
