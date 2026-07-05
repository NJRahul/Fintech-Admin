import { useState, useEffect } from 'react';
import { Scale, CheckCircle, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card, CardHeader } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDtShort } from '../../lib/api';
import { FB_AML } from '../../lib/fallback';

const rC: Record<string,string> = { Critical:C.danger600, High:C.danger600, Medium:C.warning600, Low:C.gray700 };
const sV: Record<string,any>   = { Open:'danger','Under Review':'warning',Cleared:'success',Escalated:'warning' };

export function AMLSanctions() {
  const [alerts, setAlerts]   = useState<any[]>(FB_AML);
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState<'alerts'|'sar'>('alerts');
  const [loading, setLoading] = useState(false);
  const [disposing, setDisposing] = useState<string|null>(null);
  const [sarDesc, setSarDesc] = useState('Structured cross-border transfers totalling ₹48,00,000 across 12 transactions below ₹4,00,000 each within a 72-hour window, suggesting layering.');
  const [filing, setFiling]   = useState(false);
  const [filed, setFiled]     = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api('/aml'), api('/reports')]).then(([a,r])=>{ if (Array.isArray(a) && a.length > 0) setAlerts(a); setReports(r); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = alerts.filter(a =>
    a.customer?.toLowerCase().includes(search.toLowerCase()) ||
    a.id?.toLowerCase().includes(search.toLowerCase()) ||
    a.type?.toLowerCase().includes(search.toLowerCase())
  );

  const dispose = async (id: string, action: string) => {
    setDisposing(id);
    try {
      const updated = await api(`/aml/${id}/dispose`, 'POST', { action, officer:'P. Menon', reason:`${action} by Compliance Officer` });
      setAlerts(prev => prev.map(a => a.id===id ? updated : a));
    } finally { setDisposing(null); }
  };

  const fileSAR = async () => {
    setFiling(true);
    try {
      const r = await api('/reports/generate', 'POST', { name:'SAR — Sanjay Gupta', category:'Compliance', description:sarDesc });
      setReports(prev => [r, ...prev]);
      setFiled(true);
    } finally { setFiling(false); }
  };

  return (
    <PageShell title="AML / Sanctions" subtitle="Anti-money laundering alert disposition and sanctions screening."
      actions={<div style={{ padding:'6px 12px', borderRadius:6, backgroundColor:C.danger50, border:`1px solid ${C.danger600}30`, fontSize:13, fontWeight:600, color:C.danger600 }}>{loading?'…':alerts.filter(a=>a.status==='Open'&&(a.risk==='Critical'||a.risk==='High')).length} critical open</div>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[{label:'Open alerts',value:alerts.filter(a=>a.status==='Open').length,color:C.danger600},{label:'Critical hits',value:alerts.filter(a=>a.risk==='Critical').length,color:C.danger600},{label:'Cleared (all)',value:alerts.filter(a=>a.status==='Cleared').length,color:C.success600},{label:'SARs filed',value:reports.filter(r=>r.category==='Compliance').length,color:C.gray900}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:28, fontWeight:700, color:k.color }}>{loading?'…':k.value}</div></Card>
        ))}
      </div>

      <div className="flex mb-4" style={{ borderBottom:`1px solid ${C.gray200}` }}>
        {[{key:'alerts',label:'AML alerts'},{key:'sar',label:'SAR workspace'}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as any)} style={{ padding:'10px 24px', fontSize:14, fontWeight:500, color:tab===t.key?C.blue600:C.gray700, borderBottom:`2px solid ${tab===t.key?C.blue600:'transparent'}`, backgroundColor:'transparent' }}>{t.label}</button>
        ))}
      </div>

      {tab==='alerts' ? (
        <Card>
          <TableToolbar search={search} onSearch={setSearch} placeholder="Alert ID · customer · alert type…"
            filters={<div className="flex items-center gap-2">{['All','Critical','High','Open'].map((f,i)=><button key={f} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${i===0?C.blue600:C.gray300}`, backgroundColor:i===0?C.blue50:'#fff', color:i===0?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          />
          <table className="w-full" style={{ borderCollapse:'collapse' }}>
            <thead><tr><Th>Risk</Th><Th>Alert ID</Th><Th>Customer</Th><Th>Alert type</Th><Th right>Amount</Th><Th>Context</Th><Th>Date</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {loading ? Array.from({length:4}).map((_,i)=><SkeletonRow key={i} cols={9}/>) :
               filtered.length===0 ? <tr><td colSpan={9}><EmptyState icon={Scale} message="No AML alerts found."/></td></tr> :
               filtered.map((a:any)=>(
                <tr key={a.id} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                  onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                  <Td><span className="inline-flex items-center gap-1" style={{ fontWeight:700, color:rC[a.risk] }}><AlertCircle size={14} strokeWidth={2}/>{a.risk}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{a.id}</span></Td>
                  <Td><div style={{ fontWeight:500, color:C.gray900 }}>{a.customer}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{a.cif||'—'}</div></Td>
                  <Td><span style={{ fontSize:13, color:C.gray900 }}>{a.type}</span></Td>
                  <Td right><span className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{fmtINR(a.amount)}</span></Td>
                  <Td><span style={{ fontSize:12, color:C.gray700 }}>{a.context}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray500 }}>{fmtDtShort(a.date)}</span></Td>
                  <Td><StatusBadge label={a.status} variant={sV[a.status]}/></Td>
                  <Td right>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, flexShrink:0, whiteSpace:"nowrap" }}>
                      {a.status==='Open' && (
                        <>
                          <button onClick={()=>dispose(a.id,'clear')} disabled={disposing===a.id} className="rounded flex items-center gap-1" style={{ height:32, padding:'0 10px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:12, fontWeight:500, color:C.success600 }}>
                            {disposing===a.id?<RefreshCw size={12} className="animate-spin"/>:<CheckCircle size={12} strokeWidth={2}/>} Clear
                          </button>
                          <CompactBtn danger onClick={()=>dispose(a.id,'escalate')}>Escalate</CompactBtn>
                        </>
                      )}
                      {a.status==='Under Review' && <CompactBtn onClick={()=>setTab('sar')}>File SAR</CompactBtn>}
                    </div>
                  </Td>
                </tr>
               ))}
            </tbody>
          </table>
          <Pagination from={1} to={filtered.length} total={filtered.length}/>
        </Card>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 380px' }}>
          <Card style={{ padding:24 }}>
            <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:4 }}>Suspicious Activity Report (SAR)</div>
            <div style={{ fontSize:13, color:C.gray500, marginBottom:20 }}>Filed to Financial Intelligence Unit – India (FIU-IND)</div>
            {filed ? (
              <div style={{ padding:24, borderRadius:8, backgroundColor:'#E9F5EE', border:`1px solid ${C.success600}30`, textAlign:'center' }}>
                <CheckCircle size={40} strokeWidth={2} color={C.success600} style={{ margin:'0 auto 12px' }}/>
                <div style={{ fontSize:16, fontWeight:600, color:C.success600, marginBottom:4 }}>SAR filed successfully</div>
                <p style={{ fontSize:13, color:C.gray700 }}>Report submitted to FIU-IND. Reference recorded in audit trail.</p>
                <button onClick={()=>setFiled(false)} className="rounded mt-4" style={{ height:36, padding:'0 16px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray700 }}>File another</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {[{label:'Subject customer',def:'Sanjay Gupta (CIF-880775)'},{label:'Transaction date range',def:'01 Jul 2026 — 05 Jul 2026'},{label:'Suspicious amount (₹)',def:'48,00,000.00'},{label:'Reporting officer',def:'Preethi Menon (EMP-20341)'}].map(({label,def},i)=>(
                  <div key={i}><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>{label}</label><input defaultValue={def} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
                ))}
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Description</label><textarea value={sarDesc} onChange={e=>setSarDesc(e.target.value)} className="w-full rounded outline-none" style={{ padding:12, border:`1px solid ${C.gray300}`, fontSize:14, resize:'vertical', minHeight:110, backgroundColor:'#fff' }}/></div>
                <div className="flex gap-2">
                  <button onClick={fileSAR} disabled={filing} className="flex-1 rounded flex items-center justify-center gap-2" style={{ height:40, backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:600 }}>
                    {filing?<><RefreshCw size={14} className="animate-spin"/> Submitting…</>:<><Send size={14} strokeWidth={1.5}/> Submit SAR to FIU-IND</>}
                  </button>
                  <button className="rounded" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray700 }}>Save draft</button>
                </div>
              </div>
            )}
          </Card>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, color:C.gray900, marginBottom:10 }}>Filing checklist</div>
              {[{label:'Customer identity verified',done:true},{label:'Transaction records attached',done:true},{label:'Supervisor review completed',done:false},{label:'Legal sign-off',done:false},{label:'FIU-IND portal submission',done:filed}].map((item,i)=>(
                <div key={i} className="flex items-center gap-3" style={{ padding:'8px 0', borderBottom:i<4?`1px solid ${C.gray200}`:'none' }}>
                  {item.done?<CheckCircle size={16} strokeWidth={2} color={C.success600}/>:<div style={{ width:16, height:16, borderRadius:999, border:`2px solid ${C.gray300}` }}/>}
                  <span style={{ fontSize:13, color:item.done?C.gray900:C.gray500 }}>{item.label}</span>
                </div>
              ))}
            </Card>
            <Card>
              <CardHeader title="Previously filed SARs"/>
              {reports.filter(r=>r.category==='Compliance').slice(0,3).map((r:any,i:number)=>(
                <div key={i} className="flex items-center justify-between" style={{ padding:'12px 20px', borderBottom:`1px solid ${C.gray200}` }}>
                  <div><div className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{r.id}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{fmtDtShort(r.generated_at)}</div></div>
                  <StatusBadge label={r.status||'Filed'} variant="success"/>
                </div>
              ))}
              {reports.filter(r=>r.category==='Compliance').length===0 && <div style={{ padding:'24px 20px', textAlign:'center', color:C.gray500, fontSize:14 }}>No SARs filed yet.</div>}
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
