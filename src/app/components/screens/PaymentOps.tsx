import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card, CardHeader } from '../Card';
import { C } from '../tokens';
import { api, fmtINR } from '../../lib/api';
import { FB_TRANSACTIONS } from '../../lib/fallback';

const sV: Record<string,any> = { Completed:'success',Processing:'info',Flagged:'danger',Screening:'warning',Failed:'danger',Disputed:'warning' };

export function PaymentOps() {
  const [data, setData]       = useState<any>({ transactions: FB_TRANSACTIONS, exceptions: FB_TRANSACTIONS.filter(t => t.status === 'Failed' || t.status === 'Disputed'), stats: { total: FB_TRANSACTIONS.length } });
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api('/payments').then(result => { if (result && Array.isArray(result.transactions) && result.transactions.length > 0) setData(result); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const txs: any[]  = data.transactions||[];
  const excs: any[] = data.exceptions||[];

  const filtered = txs.filter((t: any) =>
    t.ref?.toLowerCase().includes(search.toLowerCase()) ||
    t.desc?.toLowerCase().includes(search.toLowerCase()) ||
    t.rail?.toLowerCase().includes(search.toLowerCase())
  );

  const rails = [
    {name:'UPI',       count:txs.filter(t=>t.rail==='UPI').length,   fail:txs.filter(t=>t.rail==='UPI'&&t.status==='Failed').length},
    {name:'IMPS/NEFT', count:txs.filter(t=>['IMPS','NEFT'].includes(t.rail)).length, fail:0},
    {name:'Card',      count:txs.filter(t=>t.rail==='Card').length,  fail:txs.filter(t=>t.rail==='Card'&&['Failed','Flagged'].includes(t.status)).length},
    {name:'NACH',      count:txs.filter(t=>t.rail==='NACH').length,  fail:txs.filter(t=>t.rail==='NACH'&&t.status==='Failed').length},
    {name:'RTGS',      count:txs.filter(t=>t.rail==='RTGS').length,  fail:0},
    {name:'SWIFT/SEPA',count:txs.filter(t=>['SWIFT','SEPA'].includes(t.rail)).length, fail:txs.filter(t=>['SWIFT','SEPA'].includes(t.rail)&&t.status==='Screening').length},
  ];

  return (
    <PageShell title="Payment operations" subtitle="Real-time transaction monitor across all payment rails."
      actions={<div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded" style={{ padding:'6px 12px', backgroundColor:'#E9F5EE', border:`1px solid ${C.success600}30` }}>
          <span className="rounded-full" style={{ width:8, height:8, backgroundColor:C.success600, display:'inline-block' }}/>
          <span style={{ fontSize:13, fontWeight:600, color:C.success600 }}>All systems operational</span>
        </div>
        <button onClick={load} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}><RefreshCw size={14} strokeWidth={1.5}/> Refresh</button>
      </div>}
    >
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns:'repeat(6,1fr)' }}>
        {rails.map((r,i)=>(
          <Card key={i} style={{ padding:16 }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{r.name}</div>
            <div className="tabular" style={{ fontSize:20, fontWeight:700, color:C.gray900 }}>{loading?'…':r.count}</div>
            <div style={{ marginTop:6 }}><span className="tabular" style={{ fontSize:12, color:r.fail>0?C.danger600:C.gray500, fontWeight:500 }}>{loading?'…':`${r.fail} failed`}</span></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 380px' }}>
        <Card>
          <TableToolbar search={search} onSearch={setSearch} placeholder="Ref ID · description · rail…"
            filters={<div className="flex items-center gap-2">{['All','UPI','IMPS','Card','RTGS','SWIFT','Failed'].map((f,i)=><button key={f} className="rounded-full" style={{ height:32, padding:'0 10px', fontSize:12, fontWeight:500, border:`1px solid ${i===0?C.blue600:C.gray300}`, backgroundColor:i===0?C.blue50:'#fff', color:i===0?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          />
          <div className="table-scroll-wrap">
          <table className="w-full" style={{ borderCollapse:'collapse', minWidth:900 }}>
            <thead><tr><Th>Time</Th><Th>Reference</Th><Th>Description</Th><Th>Rail</Th><Th right>Amount</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {loading ? Array.from({length:6}).map((_,i)=><SkeletonRow key={i} cols={7}/>) :
               filtered.slice(0,20).map((t:any,i:number)=>(
                <tr key={i} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                  onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray500 }}>{new Date(t.timestamp).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:12, color:C.blue600, fontWeight:500 }}>{t.ref}</span></Td>
                  <Td><span style={{ fontSize:13, color:C.gray900 }}>{t.desc}</span></Td>
                  <Td><span style={{ padding:'2px 8px', borderRadius:4, backgroundColor:C.gray100, fontSize:11, fontWeight:600, color:C.gray700 }}>{t.rail}</span></Td>
                  <Td right><span className="tabular" style={{ fontWeight:600, color:t.type==='credit'?C.success600:C.gray900 }}>{t.type==='credit'?'+':'−'}{fmtINR(t.amount)}</span></Td>
                  <Td><StatusBadge label={t.status} variant={sV[t.status]||'neutral'}/></Td>
                  <Td right><CompactBtn>Audit trail</CompactBtn></Td>
                </tr>
               ))}
            </tbody>
          </table>
          </div>
          <Pagination from={1} to={Math.min(filtered.length,20)} total={filtered.length}/>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Exception queue" action={<span style={{ padding:'2px 8px', borderRadius:999, backgroundColor:C.danger50, color:C.danger600, fontSize:12, fontWeight:600 }}>{excs.length} open</span>}/>
            <div>
              {excs.length===0 ? <div style={{ padding:'24px 20px', textAlign:'center', color:C.gray500, fontSize:14 }}>No exceptions. ✓</div> :
               excs.slice(0,5).map((ex:any,i:number)=>(
                <div key={i} style={{ padding:'14px 20px', borderBottom:i<excs.length-1?`1px solid ${C.gray200}`:'none', borderLeft:`4px solid ${C.danger600}` }}>
                  <div className="flex items-start justify-between mb-1"><div className="tabular" style={{ fontSize:12, fontWeight:600, color:C.blue600 }}>{ex.ref}</div><StatusBadge label={ex.status} variant="danger"/></div>
                  <div style={{ fontSize:13, color:C.gray900, marginBottom:4 }}>{ex.desc}</div>
                  <div style={{ fontSize:12, color:C.gray500, marginBottom:10 }}>{fmtINR(ex.amount)}</div>
                  <div className="flex gap-2"><button className="rounded" style={{ height:28, padding:'0 10px', backgroundColor:C.blue600, color:'#fff', fontSize:12, fontWeight:500 }}>Retry</button><button className="rounded" style={{ height:28, padding:'0 10px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', color:C.gray700, fontSize:12 }}>Reverse</button></div>
                </div>
               ))}
            </div>
          </Card>
          <Card style={{ padding:20 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.gray900, marginBottom:12 }}>Today's summary</div>
            {[{label:'Total transactions',value:String(txs.length),color:C.gray900},{label:'Completed',value:String(txs.filter(t=>t.status==='Completed').length),color:C.success600},{label:'Failed / Flagged',value:String(txs.filter(t=>['Failed','Flagged','Disputed'].includes(t.status)).length),color:C.danger600}].map(({label,value,color},i)=>(
              <div key={i} className="flex items-center justify-between" style={{ padding:'10px 0', borderBottom:i<2?`1px solid ${C.gray200}`:'none' }}>
                <div style={{ fontSize:13, color:C.gray700 }}>{label}</div>
                <div className="tabular" style={{ fontSize:14, fontWeight:700, color }}>{loading?'…':value}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
