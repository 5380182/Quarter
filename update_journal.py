import re

with open('/home/quarter-clean/src/App.tsx', 'r') as f:
    code = f.read()

# 1. Add identity state and editing state to App component
# Find the line with journalTab state and add after it
old_journal_tab = "const [journalTab, setJournalTab] = useState<'all'|'yy'|'kk'>('all')"
new_journal_tab = """const [journalTab, setJournalTab] = useState<'all'|'yy'|'kk'>('all')
  const [identity, setIdentity] = useState<'yy'|'kk'>(()=>load('identity','yy') as 'yy'|'kk')
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editText, setEditText] = useState('')"""
code = code.replace(old_journal_tab, new_journal_tab)

# 2. Update addJournal to use identity as author
old_add = "const e:JournalEntry = {id:Date.now().toString(),author:'yy',text:journalText.trim(),date:dateStr()}"
new_add = "const e:JournalEntry = {id:Date.now().toString(),author:identity,text:journalText.trim(),date:dateStr()}"
code = code.replace(old_add, new_add)

# 3. Update the placeholder text based on identity
old_placeholder = '''placeholder="今天想对kk说什么..."'''
new_placeholder = '''placeholder={identity==='yy'?'今天想对kk说什么...':'今天想对厌厌说什么...'}'''
code = code.replace(old_placeholder, new_placeholder)

# 4. Update the "写给" header to reflect identity
old_write_to = "{journalTab==='kk'?'写给厌厌':'写给kk'}"
new_write_to = "{identity==='yy'?'写给kk':'写给厌厌'}"
code = code.replace(old_write_to, new_write_to)

# 5. Add startEdit and saveEdit functions before addJournal
old_add_journal = "  const addJournal = () => {"
edit_functions = """  const startEdit = (e: JournalEntry) => { setEditingId(e.id); setEditText(e.text) }
  const saveEdit = () => {
    if(!editingId) return
    const next = entries.map(e=>e.id===editingId?{...e,text:editText.trim()}:e)
    setEntries(next); save('journal',next); setEditingId(null); setEditText('')
    fetch(SB_URL+'/journal?id=eq.'+editingId,{method:'PATCH',headers:{...SB_H,'Prefer':'return=representation'},body:JSON.stringify({text:editText.trim()})}).catch(()=>{})
  }
  const cancelEdit = () => { setEditingId(null); setEditText('') }

  const addJournal = () => {"""
code = code.replace(old_add_journal, edit_functions)

print('Replacements done. Checking...')
print('identity count:', code.count('identity'))
print('startEdit count:', code.count('startEdit'))
print('saveEdit count:', code.count('saveEdit'))

with open('/home/quarter-clean/src/App.tsx', 'w') as f:
    f.write(code)

print('File written successfully.')
