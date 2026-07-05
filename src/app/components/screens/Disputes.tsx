import { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle, FileText, ChevronRight, RefreshCw } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDtShort } from '../../lib/api';
import { FB_DISPUTES } from '../../lib/fallback';

const sV: Record<string, any> = { Open:'info','Under Investigation':'warning','Resolved – Refunded':'success','Resolved – Declined':'neutral' };

const evidence = [{doc:'Customer transaction screenshot',ok:true},{doc:'Bank statement extract',ok:true},{doc:'Merchant order confirmation',ok:false},{doc:'Chargeback form',ok:false}];

export function Disputes() {
  const [disputes, setDisputes] = useState<any[]>(FB_DISPUTES);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [decision, setDecision] = useState('');
  const [notes, setNotes]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [resolving, setResolving] = useState(false);
  const [chipFilter, setChipFilter] = useState('All');

  const load = () => {
    setLoading(true);
    api('/disputes').then(data => { if (Array.isArray(data) && data.length > 0) setDisputes(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = disputes.filter(d => {
    const matchSearch = d.customer?.toLowerCase().includes(search.toLowerCase()) ||
      d.id?.toLowerCase().includes(search.toLowerCase()) ||
      d.merchant?.toLowerCase().includes(search.toLowerCase());
    const matchChip = chipFilter==='All' ||
      (chipFilter==='Open' && d.status==='Open') ||
      (chipFilter==='Under Investigation' && d.status==='Under Investigation');
    return matchSearch && matchChip;
  });

  const resolve = async () => {
    if (!selected||!decision) return;
    setResolving(true);
    try {
      const updated = await api(`/disputes/${selected.id}/resolve`, 'POST', { decision, notes, officer:'A. Kapoor' });
      setDisputes(prev => prev.map(d => d.id===selected.id ? updated : d));
      setSelected(updated);
      setDecision(''); setNotes('');
    } finally { setResolving(false); }
  };

  const open=disputes.filter(d=>d.status==='Open').length;
  const inProg=disputes.filter(d=>d.status==='Under Investigation').length;
  const refunded=disputes.filter(d=>d.status==='Resolved – Refunded').length;
  const declined=disputes.filter(d=>d.status==='Resolved – Declined').length;

  return (
    <PageShell title="Dispute case management" subtitle="Customer transaction disputes across all channels. SLA: 7 business days."
      actions={<div style={{ padding:'6px 12px', borderRadius:6, backgroundColor:C.warning50, border:`1px solid ${C.warning600}30`, fontSize:13, fontWeight:600, color:C.warning600 }}>{inProg>0?`${inProg} near SLA`:'All within SLA'}</div>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[{label:'Open',value:loading?'…':open,color:C.blue600},{label:'Under investigation',value:loading?'…':inProg,color:C.warning600},{label:'Resolved – refunded',value:loading?'…':refunded,color:C.success600},{label:'Resolved – declined',value:loading?'…':declined,color:C.gray700}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:28, fontWeight:700, color:k.color }}>{k.value}</div></Card>
        ))}
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns:selected?'1fr 420px':'1fr' }}>
        <Card>
          <TableToolbar search={search} onSearch={setSearch} placeholder="Dispute ID · customer · merchant…"
            filters={<div className="flex items-center gap-2">{['All','Open','Under Investigation'].map((f)=><button key={f} onClick={()=>setChipFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===chipFilter?C.blue600:C.gray300}`, backgroundColor:f===chipFilter?C.blue50:'#fff', color:f===chipFilter?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          />
          <table className="w-full" style={{ borderCollapse:'collapse' }}>
            <thead><tr><Th>Dispute ID</Th><Th>Customer</Th><Th>Merchant</Th><Th>Reason</Th><Th right>Amount</Th><Th>Filed</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={8}/>) :
               filtered.length===0 ? <tr><td colSpan={8}><EmptyState icon={Fingerprint} message="No disputes found."/></td></tr> :
               filtered.map((d:any)=>(
                <tr key={d.id} onClick={()=>setSelected(d)}
                  style={{ borderTop:`1px solid ${C.gray200}`, height:52, cursor:'pointer', backgroundColor:selected?.id===d.id?C.blue50:'#fff' }}
                  onMouseEnter={e=>{if(selected?.id!==d.id)e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor=selected?.id===d.id?C.blue50:'#fff'}}>
                  <Td><span className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{d.id}</span></Td>
                  <Td><div style={{ fontWeight:500, color:C.gray900 }}>{d.customer}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{d.cif}</div></Td>
                  <Td><span style={{ fontSize:13, color:C.gray900 }}>{d.merchant}</span></Td>
                  <Td><span style={{ fontSize:13, color:C.gray700 }}>{d.reason}</span></Td>
                  <Td right><span className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{fmtINR(d.amount)}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray500 }}>{fmtDtShort(d.filed)}</span></Td>
                  <Td><StatusBadge label={d.status} variant={sV[d.status]}/></Td>
                  <Td right><button className="inline-flex items-center gap-1 rounded" style={{ height:32, padding:'0 10px', backgroundColor:C.blue600, color:'#fff', fontSize:13, fontWeight:500 }}>Open <ChevronRight size={12} strokeWidth={2}/></button></Td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination from={1} to={filtered.length} total={filtered.length}/>
        </Card>

        {selected && (
          <Card style={{ padding:0 }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.gray200}` }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900 }}>Case workspace — {selected.id}</div>
              <div style={{ fontSize:13, color:C.gray500, marginTop:2 }}>{selected.customer} · {selected.merchant} · {fmtINR(selected.amount)}</div>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.gray700, marginBottom:8 }}>Case timeline</div>
              {[{label:'Dispute filed',sub:fmtDtShort(selected.filed)+' via '+selected.channel},{label:'Assigned for investigation',sub:'Case created'},{label:'Merchant response requested',sub:'5-day SLA'}].map((ev,i)=>(
                <div key={i} className="flex gap-3 mb-3">
                  <div style={{ width:2, backgroundColor:i===2?C.gray300:C.blue600, borderRadius:1, flexShrink:0, minHeight:32 }}/>
                  <div><div style={{ fontSize:13, color:C.gray900, fontWeight:500 }}>{ev.label}</div><div style={{ fontSize:12, color:C.gray500 }}>{ev.sub}</div></div>
                </div>
              ))}
              <div style={{ fontSize:13, fontWeight:600, color:C.gray700, marginBottom:8, marginTop:16 }}>Evidence checklist</div>
              {evidence.map((e,i)=>(
                <div key={i} className="flex items-center justify-between" style={{ padding:'8px 0', borderBottom:`1px solid ${C.gray200}` }}>
                  <div className="flex items-center gap-2"><FileText size={14} strokeWidth={1.5} color={C.gray500}/><span style={{ fontSize:13, color:C.gray900 }}>{e.doc}</span></div>
                  {e.ok?<CheckCircle size={16} strokeWidth={2} color={C.success600}/>:<button className="rounded" style={{ height:26, padding:'0 10px', backgroundColor:C.gray100, color:C.gray700, fontSize:12 }}>Upload</button>}
                </div>
              ))}
              {selected.resolution ? (
                <div style={{ marginTop:16, padding:14, borderRadius:8, backgroundColor:selected.status.includes('Refunded')?'#E9F5EE':C.gray50, border:`1px solid ${C.gray200}` }}>
                  <div style={{ fontSize:13, fontWeight:600, color:selected.status.includes('Refunded')?C.success600:C.gray700, marginBottom:4 }}>Resolution</div>
                  <p style={{ fontSize:13, color:C.gray900 }}>{selected.resolution}</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:13, fontWeight:600, color:C.gray700, marginBottom:8, marginTop:16 }}>Decision</div>
                  <div className="flex flex-col gap-2">
                    <select value={decision} onChange={e=>setDecision(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>
                      <option value="">Select decision…</option>
                      <option>Refund — full amount to customer</option>
                      <option>Refund — partial (specify in notes)</option>
                      <option>Decline — merchant has evidence</option>
                    </select>
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Resolution notes…" className="w-full rounded outline-none" style={{ padding:12, border:`1px solid ${C.gray300}`, fontSize:14, resize:'vertical', minHeight:70, backgroundColor:'#fff' }}/>
                    <div className="flex gap-2">
                      <button onClick={resolve} disabled={!decision||resolving} className="flex-1 rounded flex items-center justify-center gap-2" style={{ height:40, backgroundColor:decision?C.blue600:C.gray300, color:'#fff', fontSize:14, fontWeight:600 }}>
                        {resolving?<RefreshCw size={14} className="animate-spin"/>:<CheckCircle size={16} strokeWidth={2}/>} Resolve case
                      </button>
                      <CompactBtn onClick={()=>setSelected(null)}>Close</CompactBtn>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
