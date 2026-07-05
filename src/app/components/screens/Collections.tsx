import { useState, useEffect } from 'react';
import { Phone, CheckCircle, AlertTriangle, ArrowRight, MessageSquare, RefreshCw } from 'lucide-react';
import { PageShell, Th, Td } from '../PageShell';
import { Card, CardHeader } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDtShort } from '../../lib/api';
import { FB_COLLECTIONS } from '../../lib/fallback';

const bColors: Record<string,string> = { '1-30':C.warning600,'31-60':C.danger600,'61-90':'#8B1A1A','90+':C.gray700 };
const bLabels: Record<string,string> = { '1-30':'1–30 DPD','31-60':'31–60 DPD','61-90':'61–90 DPD','90+':'90+ DPD (NPA)' };

export function Collections() {
  const [collections, setCollections] = useState<any[]>(FB_COLLECTIONS);
  const [activeTab, setActiveTab]     = useState<'board'|'workspace'>('board');
  const [selected, setSelected]       = useState<any>(null);
  const [outcome, setOutcome]         = useState('');
  const [note, setNote]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [logging, setLogging]         = useState(false);
  const [actioning, setActioning]     = useState<string|null>(null);
  const [showReassign, setShowReassign] = useState(false);
  const [reassignAgent, setReassignAgent] = useState('');

  const load = () => {
    setLoading(true);
    api('/collections').then(data => { if (Array.isArray(data) && data.length > 0) setCollections(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const buckets = ['1-30','31-60','61-90','90+'];
  const grouped: Record<string,any[]> = {};
  buckets.forEach(b => { grouped[b] = collections.filter(c=>c.bucket===b); });

  const quickAction = async (outcome: string) => {
    if (!selected) return;
    setActioning(outcome);
    try {
      const updated = await api(`/collections/${selected.loan_id}/contact`, 'POST', { agent:'A. Singh', channel:'Phone', outcome, note:'' });
      setCollections(prev => prev.map(c=>c.loan_id===selected.loan_id?updated:c));
      setSelected(updated);
    } finally { setActioning(null); }
  };

  const reassign = async () => {
    if (!selected || !reassignAgent) return;
    setActioning('reassign');
    try {
      const updated = await api(`/collections/${selected.loan_id}/contact`, 'POST', { agent:reassignAgent, channel:'Internal', outcome:'Agent reassigned', note:`Reassigned from ${selected.agent} to ${reassignAgent}` });
      setCollections(prev => prev.map(c=>c.loan_id===selected.loan_id?updated:c));
      setSelected(updated);
      setShowReassign(false); setReassignAgent('');
    } finally { setActioning(null); }
  };

  const logContact = async () => {
    if (!selected||!outcome) return;
    setLogging(true);
    try {
      const updated = await api(`/collections/${selected.loan_id}/contact`, 'POST', { agent:'A. Singh', channel:'Phone', outcome, note });
      setCollections(prev => prev.map(c=>c.loan_id===selected.loan_id?updated:c));
      setSelected(updated);
      setOutcome(''); setNote('');
    } finally { setLogging(false); }
  };

  return (
    <PageShell title="Collections pipeline" subtitle="DPD bucket board · agent assignment · contact log · restructuring approvals"
      actions={<div className="flex gap-2">{(['board','workspace'] as const).map(t=>(
        <button key={t} onClick={()=>setActiveTab(t)} className="rounded" style={{ height:40, padding:'0 16px', border:`1px solid ${activeTab===t?C.blue600:C.gray300}`, backgroundColor:activeTab===t?C.blue50:'#fff', color:activeTab===t?C.blue600:C.gray900, fontSize:14, fontWeight:500 }}>
          {t==='board'?'Bucket board':'Account workspace'}
        </button>
      ))}</div>}
    >
      {activeTab==='board' ? (
        <>
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            {buckets.map(b=>(
              <Card key={b} style={{ padding:20, borderTop:`4px solid ${bColors[b]}` }}>
                <div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{bLabels[b]}</div>
                <div className="tabular" style={{ fontSize:28, fontWeight:700, color:bColors[b] }}>{loading?'…':grouped[b]?.length||0}</div>
                <div className="tabular" style={{ fontSize:13, color:C.gray700, marginTop:4 }}>{fmtINR(grouped[b]?.reduce((s,c)=>s+(c.total_overdue||0),0)||0)}</div>
              </Card>
            ))}
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            {buckets.map(bucket=>(
              <div key={bucket} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div style={{ fontSize:13, fontWeight:600, color:bColors[bucket] }}>{bLabels[bucket]}</div>
                  <div style={{ padding:'2px 8px', borderRadius:999, backgroundColor:bColors[bucket]+'20', color:bColors[bucket], fontSize:12, fontWeight:600 }}>{grouped[bucket]?.length||0}</div>
                </div>
                {loading ? <div className="animate-pulse rounded" style={{ height:120, backgroundColor:C.gray200 }}/> :
                 (grouped[bucket]||[]).map((item:any,i:number)=>(
                  <div key={i} onClick={()=>{setSelected(item);setActiveTab('workspace');}}
                    style={{ backgroundColor:'#fff', border:`1px solid ${C.gray200}`, borderRadius:8, padding:16, cursor:'pointer', borderLeft:`4px solid ${bColors[bucket]}`, boxShadow:'0 1px 2px rgba(16,24,40,0.05)' }}
                    onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                    <div style={{ fontSize:14, fontWeight:600, color:C.gray900, marginBottom:2 }}>{item.name}</div>
                    <div className="tabular" style={{ fontSize:12, color:C.gray500, marginBottom:8 }}>{item.loan_id} · {item.type}</div>
                    <div className="flex items-center justify-between mb-2"><span style={{ fontSize:12, color:C.gray700 }}>Total due</span><span className="tabular" style={{ fontSize:14, fontWeight:700, color:C.danger600 }}>{fmtINR(item.total_overdue)}</span></div>
                    <div className="flex items-center justify-between mb-3"><span style={{ fontSize:12, color:C.gray700 }}>DPD</span><span className="tabular" style={{ fontSize:13, fontWeight:600, color:bColors[bucket] }}>{item.dpd} days</span></div>
                    <div style={{ height:1, backgroundColor:C.gray200, marginBottom:10 }}/>
                    <div className="flex items-center justify-between">
                      <div><div style={{ fontSize:11, color:C.gray500 }}>Last: {fmtDtShort(item.last_contact)}</div><div style={{ fontSize:11, fontWeight:500, color:item.outcome==='Promise to pay'?C.success600:item.outcome==='No answer'?C.gray500:C.warning600 }}>{item.outcome}</div></div>
                      <button className="rounded" style={{ height:28, padding:'0 10px', backgroundColor:C.blue600, color:'#fff', fontSize:12, fontWeight:500 }}>Open</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 380px' }}>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:12 }}>
                {selected?`${selected.name} — ${selected.loan_id}`:'Select an account from the bucket board'}
              </div>
              {selected && (
                <div className="grid grid-cols-2 gap-3">
                  {[{label:'Loan type',val:selected.type},{label:'Monthly EMI',val:fmtINR(selected.emi_amount)},{label:'Total overdue',val:fmtINR(selected.total_overdue)},{label:'Days past due',val:`${selected.dpd} days`},{label:'Agent',val:selected.agent},{label:'Last outcome',val:selected.outcome}].map(({label,val},i)=>(
                    <div key={i} style={{ padding:12, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
                      <div style={{ fontSize:11, color:C.gray500, marginBottom:4 }}>{label}</div>
                      <div className="tabular" style={{ fontSize:14, fontWeight:600, color:C.gray900 }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            {selected && (
              <Card>
                <CardHeader title="Contact log"/>
                {(selected.contacts||[]).length===0 ? (
                  <div style={{ padding:'24px 20px', textAlign:'center', color:C.gray500, fontSize:14 }}>No contacts logged yet.</div>
                ) : (
                  <table className="w-full" style={{ borderCollapse:'collapse' }}>
                    <thead><tr><Th>Date</Th><Th>Agent</Th><Th>Channel</Th><Th>Outcome</Th><Th>Note</Th></tr></thead>
                    <tbody>
                      {selected.contacts.map((c:any,i:number)=>(
                        <tr key={i} style={{ borderTop:`1px solid ${C.gray200}`, height:44 }}>
                          <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{fmtDtShort(c.date)}</span></Td>
                          <Td><span style={{ fontSize:13, color:C.gray900 }}>{c.agent}</span></Td>
                          <Td><span style={{ fontSize:13, color:C.gray700 }}>{c.channel}</span></Td>
                          <Td><span style={{ fontSize:13, fontWeight:500, color:c.outcome==='Promise to pay'||c.outcome==='Payment received'?C.success600:C.warning600 }}>{c.outcome}</span></Td>
                          <Td><span style={{ fontSize:13, color:C.gray500 }}>{c.note}</span></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:12 }}>Log contact</div>
              <div className="flex flex-col gap-3">
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Outcome code</label>
                  <select value={outcome} onChange={e=>setOutcome(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>
                    <option value="">Select outcome…</option>
                    {['No answer','Promise to pay','Payment received','Disputed','Restructuring requested','Refused to pay','Wrong number'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Notes</label>
                  <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add contact note…" className="w-full rounded outline-none" style={{ padding:12, border:`1px solid ${C.gray300}`, fontSize:14, resize:'vertical', minHeight:80, backgroundColor:'#fff' }}/>
                </div>
                <button onClick={logContact} disabled={!selected||!outcome||logging} className="rounded flex items-center justify-center gap-2" style={{ height:40, backgroundColor:selected&&outcome?C.blue600:C.gray300, color:'#fff', fontSize:14, fontWeight:500 }}>
                  {logging?<RefreshCw size={16} className="animate-spin"/>:<Phone size={16} strokeWidth={1.5}/>} Log contact
                </button>
              </div>
            </Card>
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:12 }}>Actions</div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>selected&&quickAction('Restructuring requested')} disabled={!selected||actioning==='Restructuring requested'} className="rounded w-full flex items-center justify-center gap-2" style={{ height:40, backgroundColor:C.warning50, border:`1px solid ${C.warning600}40`, color:C.warning600, fontSize:14, fontWeight:600 }}>
                  {actioning==='Restructuring requested'?<RefreshCw size={16} className="animate-spin"/>:<MessageSquare size={16} strokeWidth={1.5}/>} Review restructuring request
                </button>
                <button onClick={()=>selected&&quickAction('Payment received')} disabled={!selected||actioning==='Payment received'} className="rounded w-full flex items-center justify-center gap-2" style={{ height:40, border:`1px solid ${C.gray300}`, backgroundColor:'#fff', color:C.gray900, fontSize:14, fontWeight:500 }}>
                  {actioning==='Payment received'?<RefreshCw size={16} className="animate-spin"/>:<CheckCircle size={16} strokeWidth={1.5}/>} Mark payment received
                </button>
                <button onClick={()=>selected&&quickAction('Escalated to legal')} disabled={!selected||actioning==='Escalated to legal'} className="rounded w-full flex items-center justify-center gap-2" style={{ height:40, backgroundColor:C.danger50, border:`1px solid ${C.danger600}40`, color:C.danger600, fontSize:14, fontWeight:600 }}>
                  {actioning==='Escalated to legal'?<RefreshCw size={16} className="animate-spin"/>:<AlertTriangle size={16} strokeWidth={1.5}/>} Escalate to legal
                </button>
                <button onClick={()=>setShowReassign(!showReassign)} disabled={!selected} className="rounded w-full flex items-center justify-center gap-2" style={{ height:40, border:`1px solid ${C.gray300}`, backgroundColor:'#fff', color:C.gray700, fontSize:14, fontWeight:500 }}>
                  <ArrowRight size={16} strokeWidth={1.5}/> Reassign agent
                </button>
                {showReassign && (
                  <div style={{ padding:12, borderRadius:8, border:`1px solid ${C.gray200}`, backgroundColor:C.gray50 }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Select agent</label>
                    <select value={reassignAgent} onChange={e=>setReassignAgent(e.target.value)} className="w-full rounded outline-none" style={{ height:36, padding:'0 10px', border:`1px solid ${C.gray300}`, fontSize:13, backgroundColor:'#fff', marginBottom:8 }}>
                      <option value="">Choose agent…</option>
                      {['A. Singh','B. Patel','C. Rao','D. Kumar','E. Sharma'].map(a=><option key={a}>{a}</option>)}
                    </select>
                    <button onClick={reassign} disabled={!reassignAgent||actioning==='reassign'} className="rounded w-full flex items-center justify-center gap-2" style={{ height:34, backgroundColor:reassignAgent?C.blue600:C.gray300, color:'#fff', fontSize:13, fontWeight:600 }}>
                      {actioning==='reassign'?<RefreshCw size={14} className="animate-spin"/>:null} Confirm reassign
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
