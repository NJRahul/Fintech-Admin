import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, AlertCircle, MapPin, Smartphone, ChevronRight, RefreshCw, Copy } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDt } from '../../lib/api';
import { FB_FRAUD } from '../../lib/fallback';

const sV: Record<string, any> = { Open:'danger','Customer Notified':'warning','Confirmed Fraud':'danger',Cleared:'success',Escalated:'warning' };
const sC: Record<string, string> = { Critical:C.danger600, High:C.warning600, Medium:C.gray700, Low:C.gray500 };

export function FraudAlerts() {
  const [alerts, setAlerts]   = useState<any[]>(FB_FRAUD);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [view, setView]       = useState<'queue'|'investigate'>('queue');
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes]     = useState('');
  const [copied, setCopied]   = useState(false);

  const load = () => {
    setLoading(true);
    api('/fraud').then(data => { if (Array.isArray(data) && data.length > 0) setAlerts(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = alerts.filter(a =>
    a.customer?.toLowerCase().includes(search.toLowerCase()) ||
    a.id?.toLowerCase().includes(search.toLowerCase()) ||
    a.rule?.toLowerCase().includes(search.toLowerCase())
  );

  const resolve = async (outcome: string) => {
    if (!selected) return;
    setResolving(true);
    try {
      const updated = await api(`/fraud/${selected.id}/resolve`, 'POST', { outcome, notes, officer:'S. Bhatt' });
      setAlerts(prev => prev.map(a => a.id===selected.id ? updated : a));
      setSelected(updated);
    } finally { setResolving(false); }
  };

  if (view==='investigate' && selected) {
    const caseRef = `FR-CASE-${selected.id?.slice(-5)}`;
    const isDone = ['Cleared','Confirmed Fraud'].includes(selected.status);
    return (
      <PageShell title={`Investigation — ${selected.id}`} subtitle={`${selected.customer} · ${selected.rule} · ${fmtDt(selected.created_at)}`}
        actions={<button onClick={()=>setView('queue')} style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, borderRadius:6, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}>← Alert queue</button>}
      >
        <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 380px' }}>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ padding:16, borderRadius:8, backgroundColor:C.danger50, border:`1px solid ${C.danger600}30`, marginBottom:16 }}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} strokeWidth={2} color={C.danger600} style={{ flexShrink:0, marginTop:2 }}/>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:C.danger600, marginBottom:4 }}>{selected.severity} severity — {selected.rule}</div>
                    <div style={{ fontSize:13, color:C.gray900 }}>Triggered {fmtDt(selected.created_at)} · Amount: {selected.amount>0?fmtINR(selected.amount):'—'}</div>
                    {selected.frozen && <div style={{ fontSize:12, fontWeight:600, color:C.danger600, marginTop:6 }}>⚠ Account auto-frozen pending review</div>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{icon:Smartphone,label:'Device',val:'Samsung Galaxy S24'},{icon:MapPin,label:'Location',val:'Kyiv, Ukraine (last: Mumbai, IN)'},{icon:AlertCircle,label:'Channel',val:selected.channel||'Card'}].map(({icon:Icon,label,val},i)=>(
                  <div key={i} style={{ padding:14, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
                    <div className="flex items-center gap-2 mb-2"><Icon size={14} strokeWidth={1.5} color={C.gray500}/><span style={{ fontSize:11, fontWeight:600, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.03em' }}>{label}</span></div>
                    <div style={{ fontSize:13, color:C.gray900 }}>{val}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.gray900, marginBottom:10 }}>Customer response</div>
              <div style={{ padding:16, borderRadius:8, backgroundColor:selected.response==='Denied'?C.danger50:selected.response==='Pending'?C.warning50:'#E9F5EE', border:`1px solid ${selected.response==='Denied'?C.danger600:selected.response==='Pending'?C.warning600:C.success600}30` }}>
                <div style={{ fontSize:14, fontWeight:600, color:selected.response==='Denied'?C.danger600:selected.response==='Pending'?C.warning600:C.success600, marginBottom:4 }}>
                  {selected.response==='Denied'?'"Was this you?" → Customer: NOT ME':selected.response==='Pending'?'Awaiting customer response…':'"Was this you?" → Customer: YES, THIS WAS ME'}
                </div>
                <div style={{ fontSize:13, color:C.gray700 }}>{selected.response==='Denied'?'Account auto-frozen. Customer notified.':selected.response==='Pending'?'Alert sent. No response yet.':'Transaction confirmed genuine.'}</div>
              </div>
            </Card>
            {selected.notes && <Card style={{ padding:20 }}><div style={{ fontSize:14, fontWeight:600, color:C.gray900, marginBottom:8 }}>Investigation notes</div><p style={{ fontSize:14, color:C.gray700 }}>{selected.notes}</p></Card>}
          </div>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:12 }}>Resolution</div>
              {isDone ? (
                <div style={{ padding:16, borderRadius:8, backgroundColor:'#E9F5EE', border:`1px solid ${C.success600}30` }}>
                  <div className="flex items-center gap-2 mb-2"><ShieldCheck size={18} strokeWidth={2} color={C.success600}/><span style={{ fontSize:14, fontWeight:600, color:C.success600 }}>Case {selected.status}</span></div>
                  <p style={{ fontSize:13, color:C.gray700, marginBottom:12 }}>{selected.notes||'Resolution recorded.'}</p>
                  <div style={{ padding:10, borderRadius:6, backgroundColor:'#fff', border:`1px solid ${C.gray200}` }}>
                    <div style={{ fontSize:11, color:C.gray500, marginBottom:4 }}>Case reference</div>
                    <div className="flex items-center gap-2">
                      <span className="tabular" style={{ fontSize:14, fontWeight:700, color:C.gray900 }}>{caseRef}</span>
                      <button onClick={()=>{navigator.clipboard.writeText(caseRef);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{ color:C.blue600, fontSize:12 }}>
                        <Copy size={13} strokeWidth={2}/> {copied?'Copied':'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Investigation notes (required for Confirmed Fraud)…" className="w-full rounded outline-none" style={{ padding:12, border:`1px solid ${C.gray300}`, fontSize:14, resize:'vertical', minHeight:100, backgroundColor:'#fff' }}/>
                  <button onClick={()=>resolve('cleared')} disabled={resolving} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:44, backgroundColor:C.success600, color:'#fff', fontSize:14, fontWeight:600 }}>
                    {resolving?<RefreshCw size={16} strokeWidth={2} className="animate-spin"/>:<ShieldCheck size={18} strokeWidth={2}/>} Clear — unfreeze & notify
                  </button>
                  <button onClick={()=>resolve('confirmed_fraud')} disabled={resolving||!notes} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:44, backgroundColor:!notes?C.gray300:C.danger600, color:'#fff', fontSize:14, fontWeight:600 }}>
                    {resolving?<RefreshCw size={16} strokeWidth={2} className="animate-spin"/>:<ShieldAlert size={18} strokeWidth={2}/>} Confirmed fraud — freeze + file case
                  </button>
                  <button onClick={()=>resolve('escalated')} disabled={resolving} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:40, border:`1px solid ${C.warning600}`, backgroundColor:C.warning50, color:C.warning600, fontSize:14, fontWeight:500 }}>Escalate</button>
                </div>
              )}
            </Card>
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.gray900, marginBottom:10 }}>Case details</div>
              {[{label:'Case ID',val:selected.id},{label:'Severity',val:selected.severity},{label:'Status',val:selected.status},{label:'Analyst',val:selected.analyst},{label:'Triggered',val:fmtDt(selected.created_at)},{label:'Amount',val:selected.amount>0?fmtINR(selected.amount):'—'}].map(({label,val},i)=>(
                <div key={i} style={{ display:'flex', padding:'8px 0', borderBottom:`1px solid ${C.gray200}` }}>
                  <div style={{ width:120, fontSize:13, color:C.gray500 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:C.gray900 }}>{val}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Fraud alert queue" subtitle="Real-time fraud rule triggers, severity-sorted. Customer responses update automatically."
      actions={<div className="flex items-center gap-2">
        <button onClick={load} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}><RefreshCw size={14} strokeWidth={1.5}/> Refresh</button>
        <div style={{ padding:'6px 12px', borderRadius:6, backgroundColor:C.danger50, border:`1px solid ${C.danger600}30`, fontSize:13, fontWeight:600, color:C.danger600 }}>
          {loading?'…':alerts.filter(a=>a.status==='Open').length} open alerts
        </div>
      </div>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[{label:'Open',value:alerts.filter(a=>a.status==='Open').length,color:C.danger600},{label:'Awaiting customer',value:alerts.filter(a=>a.status==='Customer Notified').length,color:C.warning600},{label:'Confirmed fraud',value:alerts.filter(a=>a.status==='Confirmed Fraud').length,color:C.danger600},{label:'Cleared',value:alerts.filter(a=>a.status==='Cleared').length,color:C.success600}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:28, fontWeight:700, color:k.color }}>{loading?'…':k.value}</div></Card>
        ))}
      </div>
      <Card>
        <TableToolbar search={search} onSearch={setSearch} placeholder="Alert ID · customer · rule…"
          filters={<div className="flex items-center gap-2">{['All','Critical','High','Open','Cleared'].map((f,i)=><button key={f} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${i===0?C.blue600:C.gray300}`, backgroundColor:i===0?C.blue50:'#fff', color:i===0?C.blue600:C.gray700 }}>{f}</button>)}</div>}
        />
        <div className="table-scroll-wrap">
          <table className="w-full" style={{ borderCollapse:'collapse', minWidth:900 }}>
          <thead><tr><Th>Severity</Th><Th>Alert ID</Th><Th>Customer</Th><Th>Rule triggered</Th><Th right>Amount</Th><Th>Response</Th><Th>Status</Th><Th>Analyst</Th><Th></Th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={9}/>) :
             filtered.map((a:any)=>(
              <tr key={a.id} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                <Td><span className="inline-flex items-center gap-1.5" style={{ fontWeight:600, color:sC[a.severity] }}><AlertCircle size={14} strokeWidth={2}/>{a.severity}</span></Td>
                <Td><span className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{a.id}</span></Td>
                <Td><div style={{ fontWeight:500, color:C.gray900 }}>{a.customer}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{a.cif}</div></Td>
                <Td><span style={{ fontSize:13, color:C.gray900 }}>{a.rule}</span></Td>
                <Td right><span className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{a.amount>0?fmtINR(a.amount):'—'}</span></Td>
                <Td><StatusBadge label={a.response||'Pending'} variant={a.response==='Denied'?'danger':a.response==='Confirmed'?'success':'warning'}/></Td>
                <Td><StatusBadge label={a.status} variant={sV[a.status]}/></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{a.analyst}</span></Td>
                <Td right>
                  <button onClick={()=>{setSelected(a);setView('investigate');setNotes(a.notes||'');}} className="inline-flex items-center gap-1 rounded" style={{ height:32, padding:'0 12px', backgroundColor:C.blue600, color:'#fff', fontSize:13, fontWeight:500 }}>
                    Investigate <ChevronRight size={14} strokeWidth={2}/>
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <Pagination from={1} to={filtered.length} total={filtered.length}/>
      </Card>
    </PageShell>
  );
}
