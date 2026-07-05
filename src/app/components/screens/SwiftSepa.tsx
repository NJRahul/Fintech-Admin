import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDt } from '../../lib/api';
import { FB_SWIFT } from '../../lib/fallback';

const sV: Record<string,any> = { Screening:'warning','In Transit':'info',Delivered:'success',Returned:'danger',Sent:'info' };

export function SwiftSepa() {
  const [messages, setMessages] = useState<any[]>(FB_SWIFT);
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState<'messages'|'screening'>('messages');
  const [loading, setLoading]   = useState(false);
  const [deciding, setDeciding] = useState<string|null>(null);

  const load = () => {
    setLoading(true);
    api('/swift').then(data => { if (Array.isArray(data) && data.length > 0) setMessages(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const screening = messages.filter(m => m.status==='Screening');
  const filtered  = messages.filter(m =>
    m.ref?.toLowerCase().includes(search.toLowerCase()) ||
    m.receiver?.toLowerCase().includes(search.toLowerCase()) ||
    m.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  const decide = async (ref: string, decision: string) => {
    setDeciding(ref);
    try {
      const updated = await api(`/swift/${encodeURIComponent(ref)}/decision`, 'POST', { decision, officer:'P. Menon' });
      setMessages(prev => prev.map(m => m.ref===ref ? updated : m));
    } finally { setDeciding(null); }
  };

  return (
    <PageShell title="SWIFT / SEPA console" subtitle="Cross-border payment messages, compliance screening, and resolution."
      actions={<div className="flex items-center gap-2">
        {screening.length>0 && <div style={{ padding:'6px 12px', borderRadius:6, backgroundColor:C.warning50, border:`1px solid ${C.warning600}30`, fontSize:13, fontWeight:600, color:C.warning600 }}>{screening.length} screening {screening.length===1?'hit':'hits'}</div>}
        <button onClick={load} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}><RefreshCw size={14} strokeWidth={1.5}/> Sync</button>
      </div>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {[{label:'Messages today',value:messages.length,color:C.gray900},{label:'In transit',value:messages.filter(m=>m.status==='In Transit').length,color:C.blue600},{label:'Delivered',value:messages.filter(m=>m.status==='Delivered').length,color:C.success600},{label:'Screening hits',value:screening.length,color:C.warning600},{label:'Returned',value:messages.filter(m=>m.status==='Returned').length,color:C.danger600}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:28, fontWeight:700, color:k.color }}>{loading?'…':k.value}</div></Card>
        ))}
      </div>

      <div className="flex mb-4" style={{ borderBottom:`1px solid ${C.gray200}` }}>
        {[{key:'messages',label:'Message status'},{key:'screening',label:`Compliance screening (${screening.length})`}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as any)} style={{ padding:'10px 24px', fontSize:14, fontWeight:500, color:tab===t.key?C.blue600:C.gray700, borderBottom:`2px solid ${tab===t.key?C.blue600:'transparent'}`, backgroundColor:'transparent' }}>{t.label}</button>
        ))}
      </div>

      {tab==='messages' ? (
        <Card>
          <TableToolbar search={search} onSearch={setSearch} placeholder="SWIFT ref · receiver · purpose…"
            filters={<div className="flex items-center gap-2">{['All','Outbound','Inbound','Screening','Returned'].map((f,i)=><button key={f} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${i===0?C.blue600:C.gray300}`, backgroundColor:i===0?C.blue50:'#fff', color:i===0?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          />
          <table className="w-full" style={{ borderCollapse:'collapse' }}>
            <thead><tr><Th>Reference</Th><Th>Receiver</Th><Th>Corridor</Th><Th right>Amount</Th><Th>Purpose</Th><Th>Date</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={8}/>) :
               filtered.map((m:any,i:number)=>(
                <tr key={i} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                  onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                  <Td><span className="tabular" style={{ fontSize:12, fontWeight:600, color:C.blue600 }}>{m.ref}</span></Td>
                  <Td><div style={{ fontSize:13, color:C.gray900 }}>{m.receiver?.split('(')[0]?.trim()}</div><div className="tabular" style={{ fontSize:11, color:C.gray500 }}>{m.receiver?.match(/\(([^)]+)\)/)?.[1]}</div></Td>
                  <Td><span style={{ padding:'2px 8px', borderRadius:4, backgroundColor:C.blue50, fontSize:11, fontWeight:600, color:C.blue600 }}>{m.corridor}</span></Td>
                  <Td right><span className="tabular" style={{ fontWeight:700, color:C.gray900 }}>{fmtINR(m.amount)}</span></Td>
                  <Td><span style={{ fontSize:13, color:C.gray700 }}>{m.purpose}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:12, color:C.gray500 }}>{fmtDt(m.date)}</span></Td>
                  <Td><StatusBadge label={m.status} variant={sV[m.status]}/></Td>
                  <Td right>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, flexShrink:0, whiteSpace:"nowrap" }}>
                      {m.status==='Returned' && <CompactBtn onClick={()=>decide(m.ref,'clear')}>Repair & resend</CompactBtn>}
                      {m.status==='Screening' && <CompactBtn onClick={()=>decide(m.ref,'clear')}>Review</CompactBtn>}
                    </div>
                  </Td>
                </tr>
               ))}
            </tbody>
          </table>
          <Pagination from={1} to={filtered.length} total={filtered.length}/>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {screening.length===0 ? (
            <Card style={{ padding:40, textAlign:'center' }}><CheckCircle size={40} strokeWidth={1.5} color={C.success600} style={{ margin:'0 auto 12px' }}/><p style={{ fontSize:15, color:C.gray700 }}>No active screening hits. All messages clear.</p></Card>
          ) : screening.map((m:any,i:number)=>(
            <Card key={i} style={{ padding:0, borderLeft:`4px solid ${C.danger600}` }}>
              <div style={{ padding:20 }}>
                <div className="flex items-start justify-between mb-4">
                  <div><div className="flex items-center gap-2 mb-1"><AlertCircle size={16} strokeWidth={2} color={C.danger600}/><span style={{ fontSize:15, fontWeight:600, color:C.danger600 }}>Sanctions match — manual review required</span></div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{m.ref}</div></div>
                  <div style={{ padding:'4px 12px', borderRadius:999, backgroundColor:C.danger50, color:C.danger600, fontSize:13, fontWeight:700 }}>82% match</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[{label:'Receiver',val:m.receiver?.split('(')[0]?.trim()},{label:'Amount',val:fmtINR(m.amount)},{label:'Corridor',val:m.corridor}].map(({label,val},j)=>(
                    <div key={j} style={{ padding:12, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}><div style={{ fontSize:11, color:C.gray500, marginBottom:4 }}>{label}</div><div style={{ fontSize:14, fontWeight:600, color:C.gray900 }}>{val}</div></div>
                  ))}
                </div>
                <div style={{ padding:14, borderRadius:8, backgroundColor:C.danger50, border:`1px solid ${C.danger600}20`, marginBottom:16 }}>
                  <p style={{ fontSize:13, color:C.gray900 }}>OFAC SDN list — potential match detected. Review counterparty identity before releasing or blocking.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>decide(m.ref,'clear')} disabled={deciding===m.ref} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 16px', backgroundColor:C.success600, color:'#fff', fontSize:14, fontWeight:600 }}>
                    {deciding===m.ref?<RefreshCw size={14} className="animate-spin"/>:<CheckCircle size={16} strokeWidth={2}/>} Clear — release
                  </button>
                  <button onClick={()=>decide(m.ref,'escalate')} disabled={deciding===m.ref} className="rounded" style={{ height:40, padding:'0 16px', backgroundColor:'#fff', border:`1px solid ${C.warning600}`, color:C.warning600, fontSize:14, fontWeight:600 }}>Escalate</button>
                  <button onClick={()=>decide(m.ref,'block')} disabled={deciding===m.ref} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 16px', backgroundColor:C.danger600, color:'#fff', fontSize:14, fontWeight:600 }}><XCircle size={16} strokeWidth={2}/> Block & return</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
