with open('/home/quarter-clean/src/App.tsx', 'r') as f:
    code = f.read()

# Find and replace the entire checklist page block
old_cl = """      {page==='checklist' && (
        <div className="page-overlay">
          <div className="page-header"><button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button><span className="page-title">\u6e05\u5355</span></div>
          <div className="page-body" style={clTab==='yy'&&clBgYy?{backgroundImage:`url(${clBgYy})`,backgroundSize:'cover',backgroundPosition:'center'}:clTab==='kk'&&clBgKk?{backgroundImage:`url(${clBgKk})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>"""

new_cl = """      {page==='checklist' && (
        <div className="page-overlay" style={clTab==='yy'&&clBgYy?{backgroundImage:`url(${clBgYy})`,backgroundSize:'cover',backgroundPosition:'center'}:clTab==='kk'&&clBgKk?{backgroundImage:`url(${clBgKk})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
          <div className="page-header" style={{background:'rgba(255,255,255,0.85)'}}>
            <button className="page-back" onClick={()=>setPage(null)}><ArrowLeft size={20} weight="bold" /></button>
            <span className="page-title">{clTab==='yy'?'\u538c\u538c\u7684\u6e05\u5355':'kk\u7684\u6e05\u5355'}</span>
            <button onClick={()=>setClBgModal(true)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--accent)',fontFamily:'var(--font)',fontWeight:600}}>\u2699</button>
          </div>
          <div className="page-body">"""

if old_cl in code:
    code = code.replace(old_cl, new_cl)
    print('Header replaced')
else:
    print('ERROR: header not found')

# Replace the tab section + add progress bar
old_tabs = """            <div style={{display:'flex',gap:0,marginBottom:16,borderRadius:10,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)'}}>
              <button onClick={()=>setClTab('yy')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='yy'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='yy'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>\u538c\u538c\u7684\u6e05\u5355</button>
              <button onClick={()=>setClTab('kk')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='kk'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='kk'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>kk\u7684\u6e05\u5355</button>
            </div>"""

new_tabs = """            <div style={{display:'flex',gap:0,marginBottom:12,borderRadius:10,overflow:'hidden',border:'1px solid rgba(0,0,0,0.08)'}}>
              <button onClick={()=>setClTab('yy')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='yy'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='yy'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>\u538c\u538c</button>
              <button onClick={()=>setClTab('kk')} style={{flex:1,padding:'10px 0',textAlign:'center',fontSize:13,fontWeight:500,cursor:'pointer',border:'none',background:clTab==='kk'?'var(--accent)':'rgba(255,255,255,0.5)',color:clTab==='kk'?'white':'#888',transition:'all 0.2s',fontFamily:'var(--font)'}}>kk</button>
            </div>
            {(()=>{
              const mine=clItems.filter(i=>i.owner===clTab)
              const total=mine.length, doneC=mine.filter(i=>i.done).length
              const pct=total>0?Math.round(doneC/total*100):0
              return total>0?(
                <div style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#999',marginBottom:4}}>
                    <span>{doneC}/{total} \u5df2\u5b8c\u6210</span><span>{pct}%</span>
                  </div>
                  <div style={{height:4,borderRadius:2,background:'rgba(0,0,0,0.06)',overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:'var(--accent)',borderRadius:2,transition:'width 0.3s ease'}} />
                  </div>
                </div>
              ):null
            })()}"""

if old_tabs in code:
    code = code.replace(old_tabs, new_tabs)
    print('Tabs replaced with progress bar')
else:
    print('ERROR: tabs not found')

# Remove the old background settings block at bottom, replace with nothing
old_bg = """            <div style={{marginTop:24,padding:16}} className="glass">
              <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:'#666'}}>\u6e05\u5355\u80cc\u666f ({clTab==='yy'?'\u538c\u538c':'kk'})</div>
              <input className="input" placeholder="\u7c98\u8d34\u56fe\u7247URL..." value={clTab==='yy'?clBgYy:clBgKk} onChange={e=>{if(clTab==='yy'){setClBgYy(e.target.value);save('cl_bg_yy',e.target.value)}else{setClBgKk(e.target.value);save('cl_bg_kk',e.target.value)}}} style={{marginBottom:8}} />
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-accent" style={{fontSize:12}} onClick={()=>{if(clTab==='yy'){save('cl_bg_yy',clBgYy)}else{save('cl_bg_kk',clBgKk)}}}>\u5e94\u7528</button>
                {(clTab==='yy'?clBgYy:clBgKk)&&<button className="btn" style={{background:'#ddd',color:'#666',fontSize:12}} onClick={()=>{if(clTab==='yy'){setClBgYy('');save('cl_bg_yy','')}else{setClBgKk('');save('cl_bg_kk','')}}}>\u6e05\u9664</button>}
              </div>
            </div>"""

if old_bg in code:
    code = code.replace(old_bg, '')
    print('Old bg settings removed')
else:
    print('ERROR: old bg not found')

# Now add the background settings modal before the Icon Editor Modal
old_icon_modal = "      {/* Icon Editor Modal */}"
new_icon_modal = """      {/* Checklist Background Modal */}
      {clBgModal && (
        <div style={{position:'fixed',inset:0,zIndex:999,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setClBgModal(false)}>
          <div className="glass" style={{padding:20,width:'100%',maxWidth:320,borderRadius:16}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:14}}>\u6e05\u5355\u80cc\u666f ({clTab==='yy'?'\u538c\u538c':'kk'})</div>
            {(clTab==='yy'?clBgYy:clBgKk)&&<div style={{marginBottom:12,borderRadius:10,overflow:'hidden',height:100}}><img src={clTab==='yy'?clBgYy:clBgKk} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
            <input className="input" placeholder="\u7c98\u8d34\u56fe\u7247URL..." value={clTab==='yy'?clBgYy:clBgKk} onChange={e=>{if(clTab==='yy'){setClBgYy(e.target.value);save('cl_bg_yy',e.target.value)}else{setClBgKk(e.target.value);save('cl_bg_kk',e.target.value)}}} style={{marginBottom:8}} />
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-accent" style={{fontSize:12}} onClick={()=>setClBgModal(false)}>\u5e94\u7528</button>
              <button className="btn btn-accent" style={{fontSize:12}} onClick={()=>clBgRef.current?.click()}>\u4e0a\u4f20\u56fe\u7247</button>
              {(clTab==='yy'?clBgYy:clBgKk)&&<button className="btn" style={{background:'#ddd',color:'#666',fontSize:12}} onClick={()=>{if(clTab==='yy'){setClBgYy('');save('cl_bg_yy','')}else{setClBgKk('');save('cl_bg_kk','')};setClBgModal(false)}}>\u6e05\u9664</button>}
            </div>
            <input ref={clBgRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleClBgFile} />
          </div>
        </div>
      )}

      {/* Icon Editor Modal */}"""

if old_icon_modal in code:
    code = code.replace(old_icon_modal, new_icon_modal)
    print('Background modal added')
else:
    print('ERROR: icon modal marker not found')

with open('/home/quarter-clean/src/App.tsx', 'w') as f:
    f.write(code)

print('Done.')
print('clBgModal count:', code.count('clBgModal'))
print('handleClBgFile count:', code.count('handleClBgFile'))
print('clBgRef count:', code.count('clBgRef'))
