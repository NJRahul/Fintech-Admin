import { useState, useEffect } from 'react';
import { AlertTriangle, Send, RefreshCw, CheckCircle } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR } from '../../lib/api';
import { FB_EMIS } from '../../lib/fallback';

const sV: Record<string,any> = { Upcoming:'info',Paid:'success',Overdue:'danger',Restructured:'warning' };

export function EMIOperations() {
  const [emis, setEmis]       = useState<any[]>(FB_EMIS);
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState<'all'|'overdue'|'upcoming'|'schedule'|'campaign'>('all');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string|null>(null);

  const load = () => {
    setLoading(true);
    api('/emis').then(data => { if (Array.isArray(data) && data.length > 0) setEmis(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = emis.filter(e =>
    (tab==='all' || (tab==='overdue'&&e.status==='Overdue') || (tab==='upcoming'&&e.status==='Upcoming')) &&
    (e.name?.toLowerCase().includes(search.toLowerCase()) || e.loan_id?.toLowerCase().includes(search.toLowerCase()))
  );

  const markPaid = async (id: string) => {
    setUpdating(id);
    try {
      const updated = await api(`/emis/${id}/status`, 'PUT', { status:'Paid' });
      setEmis(prev => prev.map(e => e.id===id ? updated : e));
    } finally { setUpdating(null); }
  };

  const overdueCt = emis.filter(e=>e.status==='Overdue').length;
  const paidCt    = emis.filter(e=>e.status==='Paid').length;
  const totalDue  = emis.filter(e=>e.status!=='Paid').reduce((s,e)=>s+(e.amount||0),0);

  return (
    <PageShell title="EMI operations" subtitle="Monitor EMI schedule, missed payments, and send reminder campaigns."
      actions={<button className="rounded" style={{ height:40, padding:'0 16px', backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:500 }}>+ New campaign</button>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[{label:'Outstanding EMIs',value:fmtINR(totalDue),sub:`${emis.filter(e=>e.status!=='Paid').length} EMIs`,color:C.gray900},{label:'Overdue',value:String(overdueCt),sub:'require action',color:C.danger600},{label:'Paid',value:String(paidCt),sub:'this period',color:C.success600},{label:'Restructured',value:String(emis.filter(e=>e.status==='Restructured').length),sub:'modified',color:C.warning600}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:i===0?18:28, fontWeight:700, color:k.color }}>{loading?'…':k.value}</div><div style={{ fontSize:12, color:C.gray500, marginTop:4 }}>{k.sub}</div></Card>
        ))}
      </div>

      <div className="flex mb-4" style={{ borderBottom:`1px solid ${C.gray200}` }}>
        {[{key:'all',label:'All EMIs'},{key:'overdue',label:`Overdue (${overdueCt})`},{key:'upcoming',label:'Upcoming'},{key:'schedule',label:'Amortisation'},{key:'campaign',label:'Campaigns'}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as any)} style={{ padding:'10px 20px', fontSize:14, fontWeight:500, color:tab===t.key?C.blue600:C.gray700, borderBottom:`2px solid ${tab===t.key?C.blue600:'transparent'}`, backgroundColor:'transparent', whiteSpace:'nowrap' }}>{t.label}</button>
        ))}
      </div>

      {tab==='campaign' ? (
        <Card style={{ padding:24 }}>
          <div style={{ fontSize:16, fontWeight:600, color:C.gray900, marginBottom:20 }}>Reminder campaign composer</div>
          <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Audience</label><select className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}><option>Overdue — 1-3 days ({overdueCt} loans)</option><option>Upcoming — due in 3 days</option></select></div>
            <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Channel</label><select className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}><option>SMS + Push notification</option><option>Email only</option></select></div>
            <div className="col-span-2"><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Message template</label><textarea className="w-full rounded outline-none" style={{ padding:12, border:`1px solid ${C.gray300}`, fontSize:14, resize:'vertical', minHeight:100, backgroundColor:'#fff' }} defaultValue="Dear {{name}}, your EMI of ₹{{amount}} for loan {{loan_id}} is due on {{due_date}}. Please ensure funds are available."/></div>
            <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Schedule</label><input type="datetime-local" className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
            <div className="flex items-end"><button className="rounded flex items-center gap-2" style={{ height:40, padding:'0 20px', backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:500 }}><Send size={16} strokeWidth={1.5}/> Schedule campaign</button></div>
          </div>
        </Card>
      ) : tab==='schedule' ? (
        <Card>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.gray200}` }}><h3 style={{ fontSize:15, fontWeight:600, color:C.gray900 }}>Amortisation — LN-2026-08780 (Sanjay Gupta)</h3><p style={{ fontSize:13, color:C.gray500, marginTop:4 }}>Home Loan · ₹38,00,000 · 9.0% p.a. · 240 months</p></div>
          <table className="w-full" style={{ borderCollapse:'collapse' }}>
            <thead><tr><Th>Month</Th><Th right>Instalment</Th><Th right>Principal</Th><Th right>Interest</Th><Th right>Total EMI</Th><Th>Status</Th></tr></thead>
            <tbody>
              {[{m:'Aug 2026',n:1,p:'₹4,800',i:'₹33,200',t:'₹38,000',s:'Upcoming'},{m:'Jul 2026',n:2,p:'₹4,832',i:'₹33,168',t:'₹38,000',s:'Upcoming'},{m:'Jun 2026',n:3,p:'₹4,864',i:'₹33,136',t:'₹38,000',s:'Paid'},{m:'May 2026',n:4,p:'₹4,898',i:'₹33,102',t:'₹38,000',s:'Paid'}].map((r,i)=>(
                <tr key={i} style={{ borderTop:`1px solid ${C.gray200}`, height:44 }}><Td><span style={{ fontWeight:500, color:C.gray900 }}>{r.m}</span></Td><Td right><span className="tabular" style={{ fontSize:13, color:C.gray500 }}>{r.n}</span></Td><Td right><span className="tabular" style={{ fontWeight:500, color:C.gray900 }}>{r.p}</span></Td><Td right><span className="tabular" style={{ color:C.gray700 }}>{r.i}</span></Td><Td right><span className="tabular" style={{ fontWeight:700, color:C.gray900 }}>{r.t}</span></Td><Td><StatusBadge label={r.s} variant={r.s==='Paid'?'success':'info'}/></Td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.gray200}`, fontSize:13, color:C.gray500, textAlign:'right' }}>Showing 4 of 240 instalments</div>
        </Card>
      ) : (
        <Card>
          <TableToolbar search={search} onSearch={setSearch} placeholder="Loan ID · borrower…"
            filters={<div className="flex items-center gap-2">{['All','NACH','SI'].map((f,i)=><button key={f} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${i===0?C.blue600:C.gray300}`, backgroundColor:i===0?C.blue50:'#fff', color:i===0?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          />
          <table className="w-full" style={{ borderCollapse:'collapse' }}>
            <thead><tr><Th>Loan</Th><Th>Borrower</Th><Th>Type</Th><Th right>EMI</Th><Th>Due date</Th><Th>Mandate</Th><Th>Bank</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={9}/>) :
               filtered.map((e:any)=>(
                <tr key={e.id} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                  onMouseEnter={el=>{el.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={el=>{el.currentTarget.style.backgroundColor='#fff'}}>
                  <Td><div className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{e.loan_id}</div></Td>
                  <Td><div style={{ fontWeight:500, color:C.gray900 }}>{e.name}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{e.cif}</div></Td>
                  <Td><span style={{ fontSize:13, color:C.gray700 }}>{e.type}</span></Td>
                  <Td right><span className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{fmtINR(e.amount)}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:e.status==='Overdue'?C.danger600:C.gray900 }}>{e.due}{e.overdue_days>0&&<span style={{ color:C.danger600, fontWeight:600 }}> ({e.overdue_days}d late)</span>}</span></Td>
                  <Td><span style={{ fontSize:13, color:C.gray700 }}>{e.mandate}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{e.bank}</span></Td>
                  <Td><StatusBadge label={e.status} variant={sV[e.status]}/></Td>
                  <Td right>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, flexShrink:0, whiteSpace:"nowrap" }}>
                      {e.status==='Overdue' && (
                        <button onClick={()=>markPaid(e.id)} disabled={updating===e.id} className="rounded flex items-center gap-1" style={{ height:32, padding:'0 10px', backgroundColor:C.success600, color:'#fff', fontSize:12, fontWeight:500 }}>
                          {updating===e.id?<RefreshCw size={12} className="animate-spin"/>:<CheckCircle size={12} strokeWidth={2}/>} Mark paid
                        </button>
                      )}
                      <CompactBtn danger={e.status==='Overdue'}><AlertTriangle size={12} strokeWidth={2} style={{ display:'inline', marginRight:4 }}/>Notify</CompactBtn>
                    </div>
                  </Td>
                </tr>
               ))}
            </tbody>
          </table>
          <Pagination from={1} to={filtered.length} total={filtered.length}/>
        </Card>
      )}
    </PageShell>
  );
}
