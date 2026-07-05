import { useState, useEffect } from 'react';
import { CreditCard, Snowflake, RefreshCw, ArrowUpDown, X } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDtShort } from '../../lib/api';
import { FB_ACCOUNTS } from '../../lib/fallback';

const sV: Record<string, any> = { Active:'success', Frozen:'danger', Dormant:'warning', Closed:'neutral' };

export function AccountOps() {
  const [accounts, setAccounts] = useState<any[]>(FB_ACCOUNTS);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showLedger, setShowLedger] = useState(true);
  const [ledger, setLedger]     = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [freezing, setFreezing] = useState<string|null>(null);
  const [chipFilter, setChipFilter] = useState('All');

  const load = () => {
    setLoading(true);
    api('/accounts').then(data => { if (Array.isArray(data) && data.length > 0) setAccounts(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = accounts.filter(a => {
    const matchSearch = a.no?.toLowerCase().includes(search.toLowerCase()) ||
      a.full?.toLowerCase().includes(search.toLowerCase()) ||
      a.cif?.toLowerCase().includes(search.toLowerCase()) ||
      a.type?.toLowerCase().includes(search.toLowerCase());
    const matchChip = chipFilter==='All' ||
      (chipFilter==='Savings' && a.type==='Savings') ||
      (chipFilter==='Current' && a.type==='Current') ||
      (chipFilter==='Loan' && a.type==='Loan') ||
      (chipFilter==='Frozen' && a.status==='Frozen');
    return matchSearch && matchChip;
  });

  const openLedger = async (acc: any) => {
    setSelected(acc); setShowLedger(true); setLedgerLoading(true);
    try { const r = await api(`/accounts/${acc.no}/ledger`); setLedger(r.ledger||[]); }
    catch { setLedger([]); }
    finally { setLedgerLoading(false); }
  };

  const freeze = async (acc: any) => {
    setFreezing(acc.no);
    try {
      const updated = await api(`/accounts/${acc.no}/toggle-freeze`, 'POST', { officer:'A. Kapoor' });
      setAccounts(prev => prev.map(a => a.no===acc.no ? updated : a));
      if (selected?.no===acc.no) setSelected(updated);
    } finally { setFreezing(null); }
  };

  return (
    <PageShell title="Account operations" subtitle="View, freeze, unfreeze, and manage all customer accounts."
      actions={<button className="rounded" style={{ height:40, padding:'0 16px', backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:500 }}>+ Open new account</button>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[
          {label:'Total accounts', value:accounts.length,                                         color:C.gray900  },
          {label:'Active',         value:accounts.filter(a=>a.status==='Active').length,           color:C.success600},
          {label:'Frozen',         value:accounts.filter(a=>a.status==='Frozen').length,           color:C.danger600 },
          {label:'Dormant',        value:accounts.filter(a=>a.status==='Dormant').length,          color:C.warning600},
        ].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:28, fontWeight:700, color:k.color }}>{loading?'…':k.value}</div></Card>
        ))}
      </div>

      <Card>
        <TableToolbar search={search} onSearch={setSearch} placeholder="Account no. · type · CIF…"
          filters={<div className="flex items-center gap-2">{['All','Savings','Current','Loan','Frozen'].map((f)=><button key={f} onClick={()=>setChipFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===chipFilter?C.blue600:C.gray300}`, backgroundColor:f===chipFilter?C.blue50:'#fff', color:f===chipFilter?C.blue600:C.gray700 }}>{f}</button>)}</div>}
        />
        <table className="w-full" style={{ borderCollapse:'collapse' }}>
          <thead><tr><Th>Account</Th><Th>CIF</Th><Th>Type</Th><Th>IFSC</Th><Th>Branch</Th><Th>Status</Th><Th right>Balance</Th><Th></Th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={8}/>) :
             filtered.length===0 ? <tr><td colSpan={8}><EmptyState icon={CreditCard} message="No accounts match your search."/></td></tr> :
             filtered.map((a:any)=>(
              <tr key={a.no} style={{ borderTop:`1px solid ${C.gray200}`, height:52, cursor:'pointer', backgroundColor:selected?.no===a.no?C.blue50:'#fff' }}
                onMouseEnter={e=>{if(selected?.no!==a.no)e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor=selected?.no===a.no?C.blue50:'#fff'}}
                onClick={()=>openLedger(a)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="rounded flex items-center justify-center" style={{ width:32, height:32, backgroundColor:C.gray100, flexShrink:0 }}><CreditCard size={16} strokeWidth={1.5} color={C.gray700}/></div>
                    <div><div className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{a.no}</div><div className="tabular" style={{ fontSize:11, color:C.gray500 }}>{a.full}</div></div>
                  </div>
                </Td>
                <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{a.cif}</span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{a.type}</span></Td>
                <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{a.ifsc||'—'}</span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{a.branch}</span></Td>
                <Td><StatusBadge label={a.status} variant={sV[a.status]}/></Td>
                <Td right><span className="tabular" style={{ fontSize:14, fontWeight:700, color:C.gray900 }}>{fmtINR(a.balance||0)}</span></Td>
                <Td right>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, flexShrink:0, whiteSpace:"nowrap" }} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>freeze(a)} disabled={freezing===a.no} className="rounded flex items-center gap-1" style={{ height:32, padding:'0 10px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:13, fontWeight:500, color:C.gray900 }}>
                      {freezing===a.no?<RefreshCw size={12} strokeWidth={2} className="animate-spin"/>:a.status==='Frozen'?<><RefreshCw size={12} strokeWidth={2} style={{ marginRight:4 }}/>Unfreeze</>:<><Snowflake size={12} strokeWidth={2} style={{ marginRight:4 }}/>Freeze</>}
                    </button>
                    <CompactBtn onClick={()=>openLedger(a)}>Ledger</CompactBtn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination from={1} to={filtered.length} total={filtered.length}/>
      </Card>

      {selected && (
        <div style={{ position:'fixed', top:0, right:0, bottom:0, width:520, backgroundColor:'#fff', boxShadow:'0 4px 24px rgba(16,24,40,0.18)', zIndex:50, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded flex items-center justify-center" style={{ width:40, height:40, backgroundColor:C.gray100 }}><CreditCard size={20} strokeWidth={1.5} color={C.gray700}/></div>
                <div><div style={{ fontSize:16, fontWeight:600, color:C.gray900 }}>{selected.type} {selected.no}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{selected.full} · {selected.ifsc}</div></div>
              </div>
              <button onClick={()=>setSelected(null)}><X size={20} strokeWidth={1.5} color={C.gray500}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div style={{ padding:16, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:12, color:C.gray500, marginBottom:4 }}>Balance</div>
                <div className="tabular" style={{ fontSize:20, fontWeight:700, color:C.gray900 }}>{fmtINR(selected.balance||0)}</div>
              </div>
              <div style={{ padding:16, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:12, color:C.gray500, marginBottom:4 }}>Status</div>
                <StatusBadge label={selected.status} variant={sV[selected.status]}/>
                <div style={{ fontSize:12, color:C.gray500, marginTop:6 }}>Opened: {fmtDtShort(selected.opened)}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>freeze(selected)} className="flex-1 rounded flex items-center justify-center gap-2" style={{ height:36, backgroundColor:selected.status==='Frozen'?C.success600:C.danger600, color:'#fff', fontSize:13, fontWeight:600 }}>
                {selected.status==='Frozen'?<><RefreshCw size={14}/>Unfreeze account</>:<><Snowflake size={14}/>Freeze account</>}
              </button>
              <button className="rounded flex items-center justify-center gap-2" style={{ height:36, padding:'0 12px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:13, color:C.gray900 }}>
                <ArrowUpDown size={14} strokeWidth={1.5}/> Adjust limit
              </button>
            </div>
          </div>
          <div className="flex" style={{ borderBottom:`1px solid ${C.gray200}` }}>
            {['Ledger','Details'].map(t=>(
              <button key={t} onClick={()=>setShowLedger(t==='Ledger')} style={{ flex:1, height:44, fontSize:13, fontWeight:500, color:(showLedger?t==='Ledger':t==='Details')?C.blue600:C.gray700, borderBottom:`2px solid ${(showLedger?t==='Ledger':t==='Details')?C.blue600:'transparent'}`, backgroundColor:'#fff' }}>{t}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {showLedger ? (
              ledgerLoading ? <div style={{ padding:20 }}>{Array.from({length:4}).map((_,i)=><div key={i} className="animate-pulse rounded mb-3" style={{ height:40, backgroundColor:C.gray200 }}/>)}</div> :
              ledger.length===0 ? <div style={{ padding:40, textAlign:'center', color:C.gray500, fontSize:14 }}>No transactions on this account yet.</div> :
              <table className="w-full" style={{ borderCollapse:'collapse' }}>
                <thead><tr style={{ backgroundColor:C.gray100, position:'sticky', top:0 }}>
                  {['Date','Description','Rail','Amount'].map((h,i)=><th key={h} style={{ textAlign:i>=2?'right':'left', padding:'10px 16px', fontSize:11, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {ledger.map((tx:any,i:number)=>(
                    <tr key={i} style={{ borderTop:`1px solid ${C.gray200}` }}>
                      <td style={{ padding:'10px 16px', fontSize:12, color:C.gray500, whiteSpace:'nowrap' }}>{fmtDtShort(tx.timestamp)}</td>
                      <td style={{ padding:'10px 16px', fontSize:13, color:C.gray900 }}><div>{tx.desc}</div><div className="tabular" style={{ fontSize:11, color:C.gray500 }}>{tx.ref}</div></td>
                      <td style={{ padding:'10px 16px', textAlign:'right' }}><span style={{ padding:'2px 8px', borderRadius:4, backgroundColor:C.gray100, fontSize:11, fontWeight:600, color:C.gray700 }}>{tx.rail}</span></td>
                      <td className="tabular" style={{ padding:'10px 16px', textAlign:'right', fontSize:13, fontWeight:700, color:tx.type==='credit'?C.success600:C.gray900 }}>{tx.type==='credit'?'+':'−'}{fmtINR(tx.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding:20 }}>
                {[{label:'Account no.',val:selected.full},{label:'CIF',val:selected.cif},{label:'IFSC',val:selected.ifsc||'—'},{label:'Branch',val:selected.branch},{label:'Daily limit',val:selected.limit?fmtINR(selected.limit):'—'},{label:'Type',val:selected.type},{label:'Opened',val:fmtDtShort(selected.opened)}].map(({label,val},i)=>(
                  <div key={i} style={{ display:'flex', padding:'12px 0', borderBottom:`1px solid ${C.gray200}` }}>
                    <div style={{ width:140, fontSize:13, color:C.gray500, flexShrink:0 }}>{label}</div>
                    <div className="tabular" style={{ fontSize:13, fontWeight:500, color:C.gray900 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
