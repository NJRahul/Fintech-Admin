import { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR, fmtDt } from '../../lib/api';
import { FB_LOANS } from '../../lib/fallback';

const sV: Record<string, any> = { Submitted:'info','In Review':'warning','Credit Assessment':'warning','Counter-Offer':'warning',Approved:'success',Rejected:'danger',Disbursed:'info',Closed:'neutral' };
const scoreFactors = [
  {label:'Payment history',score:88,weight:'35%'},{label:'Credit utilization',score:72,weight:'30%'},
  {label:'Credit age',score:65,weight:'15%'},{label:'Credit mix',score:80,weight:'10%'},{label:'New inquiries',score:91,weight:'10%'},
];
const docs = [{name:'Form 16 / ITR – 3 years',ok:true},{name:'Bank statements – 6 months',ok:true},{name:'Aadhaar + PAN',ok:true},{name:'Property documents',ok:false},{name:'Salary slips – 3 months',ok:true}];

export function LoansQueue() {
  const [loans, setLoans]     = useState<any[]>(FB_LOANS);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [view, setView]       = useState<'queue'|'underwriting'>('queue');
  const [loading, setLoading] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [chipFilter, setChipFilter] = useState('All');
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmt, setOfferAmt] = useState('');
  const [offerRate, setOfferRate] = useState('');
  const [offerTenure, setOfferTenure] = useState('');

  const load = () => {
    setLoading(true);
    api('/loans').then(data => { if (Array.isArray(data) && data.length > 0) setLoans(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = loans.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) || a.id?.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase());
    const matchChip = chipFilter==='All' || a.type===chipFilter || (chipFilter==='Personal' && a.type==='Personal Loan') || (chipFilter==='Auto' && a.type==='Auto Loan') || (chipFilter==='Business' && a.type==='Business Loan') || (chipFilter==='Home Loan' && a.type==='Home Loan');
    return matchSearch && matchChip;
  });

  const decide = async (decision: string, extra?: any) => {
    if (!selected) return;
    setDeciding(true);
    try {
      const updated = await api(`/loans/${selected.id}/decision`, 'POST', { decision, officer:'A. Kapoor', ...extra });
      setLoans(prev => prev.map(l => l.id===selected.id ? updated : l));
      setSelected(updated);
      if (['approve','reject'].includes(decision)) { setView('queue'); setSelected(null); }
    } finally { setDeciding(false); }
  };

  if (view==='underwriting' && selected) {
    const emi = Math.round((selected.amount||0)*(selected.rate||9)/100/12+(selected.amount||0)/(selected.tenure||240));
    return (
      <PageShell title={`Underwriting — ${selected.id}`} subtitle={`${selected.name} · ${selected.type} · ${fmtINR(selected.amount)} · ${selected.channel}`}
        actions={<><button onClick={()=>{setView('queue');setSelected(null);}} style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, borderRadius:6, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}>← Queue</button><StatusBadge label={selected.status} variant={sV[selected.status]}/></>}
      >
        <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 380px' }}>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:16 }}>Credit assessment</div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[{label:'CIBIL score',val:selected.score,color:(selected.score||0)>=700?C.success600:(selected.score||0)>=650?C.warning600:C.danger600,sub:(selected.score||0)>=700?'Good':(selected.score||0)>=650?'Fair':'Poor',size:32},{label:'Debt-to-income',val:selected.dti,color:parseFloat(selected.dti||'0')<35?C.success600:C.warning600,sub:'Threshold: 40%',size:28},{label:'Est. EMI/month',val:`₹${emi.toLocaleString('en-IN')}`,color:C.gray900,sub:`${selected.rate||9}% · ${(selected.tenure||240)/12}yr`,size:22}].map((item,i)=>(
                  <div key={i} style={{ textAlign:'center', padding:16, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
                    <div style={{ fontSize:12, color:C.gray500, marginBottom:6 }}>{item.label}</div>
                    <div className="tabular" style={{ fontSize:item.size, fontWeight:700, color:item.color }}>{item.val}</div>
                    <div style={{ fontSize:11, color:C.gray500 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:C.gray700, marginBottom:10 }}>Score factor breakdown</div>
              {scoreFactors.map((f,i)=>(
                <div key={i} className="flex items-center gap-3 mb-2">
                  <div style={{ width:140, fontSize:13, color:C.gray700 }}>{f.label}</div>
                  <div style={{ flex:1, height:8, backgroundColor:C.gray200, borderRadius:999 }}><div style={{ height:'100%', width:`${f.score}%`, backgroundColor:f.score>=80?C.success600:f.score>=65?C.warning600:C.danger600, borderRadius:999 }}/></div>
                  <div className="tabular" style={{ width:28, fontSize:12, fontWeight:600, color:C.gray900, textAlign:'right' }}>{f.score}</div>
                  <div style={{ width:36, fontSize:11, color:C.gray500 }}>{f.weight}</div>
                </div>
              ))}
            </Card>
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:12 }}>Document verification</div>
              {docs.map((d,i)=>(
                <div key={i} className="flex items-center justify-between" style={{ padding:'10px 0', borderBottom:i<docs.length-1?`1px solid ${C.gray200}`:'none' }}>
                  <div className="flex items-center gap-3"><FileText size={16} strokeWidth={1.5} color={C.gray500}/><span style={{ fontSize:14, color:C.gray900 }}>{d.name}</span></div>
                  {d.ok?<CheckCircle size={18} strokeWidth={2} color={C.success600}/>:<button className="rounded" style={{ height:28, padding:'0 10px', backgroundColor:C.warning600, color:'#fff', fontSize:12, fontWeight:500 }}>Verify</button>}
                </div>
              ))}
            </Card>
          </div>
          <div className="flex flex-col gap-4">
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:8 }}>Application summary</div>
              {[{label:'Type',val:selected.type},{label:'Amount',val:fmtINR(selected.amount)},{label:'Tenure',val:`${selected.tenure} months`},{label:'Rate',val:`${selected.rate}% p.a.`},{label:'Channel',val:selected.channel},{label:'Officer',val:selected.officer},{label:'Submitted',val:fmtDt(selected.submitted_at)}].map(({label,val},i)=>(
                <div key={i} style={{ display:'flex', padding:'8px 0', borderBottom:`1px solid ${C.gray200}` }}>
                  <div style={{ width:100, fontSize:13, color:C.gray500 }}>{label}</div>
                  <div className="tabular" style={{ fontSize:13, fontWeight:500, color:C.gray900 }}>{val}</div>
                </div>
              ))}
            </Card>
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:12 }}>Decision</div>
              <div className="flex flex-col gap-3">
                <button onClick={()=>decide('approve')} disabled={deciding} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:44, backgroundColor:C.success600, color:'#fff', fontSize:14, fontWeight:600 }}>
                  {deciding?<RefreshCw size={16} className="animate-spin"/>:<CheckCircle size={18} strokeWidth={2}/>} Approve (→ dual-auth)
                </button>
                <button onClick={()=>setOfferOpen(!offerOpen)} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:40, backgroundColor:C.warning50, border:`1px solid ${C.warning600}40`, color:C.warning600, fontSize:14, fontWeight:600 }}>
                  <MessageSquare size={16} strokeWidth={2}/> Counter-offer {offerOpen?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
                </button>
                {offerOpen && (
                  <div style={{ padding:16, borderRadius:8, border:`1px solid ${C.warning600}40`, backgroundColor:C.warning50 }}>
                    <div className="grid gap-3">
                      {[{label:'New amount (₹)',v:offerAmt,s:setOfferAmt},{label:'Rate (%)',v:offerRate,s:setOfferRate},{label:'Tenure (months)',v:offerTenure,s:setOfferTenure}].map(({label,v,s},i)=>(
                        <div key={i}><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>{label}</label><input value={v} onChange={e=>s(e.target.value)} className="w-full rounded outline-none tabular" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
                      ))}
                      <button onClick={()=>decide('counter',{counter_amount:parseFloat(offerAmt.replace(/,/g,'')),counter_rate:parseFloat(offerRate),counter_tenure:parseInt(offerTenure)})} disabled={deciding||!offerAmt} className="rounded w-full" style={{ height:36, backgroundColor:offerAmt?C.warning600:C.gray300, color:'#fff', fontSize:13, fontWeight:600 }}>
                        Send counter-offer to customer
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={()=>decide('reject')} disabled={deciding} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:40, backgroundColor:C.danger600, color:'#fff', fontSize:14, fontWeight:600 }}>
                  <XCircle size={16} strokeWidth={2}/> Reject application
                </button>
                <button onClick={()=>decide('info')} disabled={deciding} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:40, border:`1px solid ${C.gray300}`, backgroundColor:'#fff', color:C.gray700, fontSize:14 }}>
                  <MessageSquare size={16} strokeWidth={1.5}/> Request more info
                </button>
              </div>
            </Card>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Loan origination queue" subtitle="All loan applications across channels."
      actions={<div style={{ padding:'6px 12px', borderRadius:6, backgroundColor:C.warning50, border:`1px solid ${C.warning600}30`, fontSize:13, fontWeight:600, color:C.warning600 }}>SLA target: 8h</div>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
        {[{label:'Submitted',value:loans.filter(l=>l.status==='Submitted').length,color:C.blue600},{label:'In review',value:loans.filter(l=>['In Review','Credit Assessment'].includes(l.status)).length,color:C.warning600},{label:'Approved',value:loans.filter(l=>l.status==='Approved').length,color:C.success600},{label:'Rejected',value:loans.filter(l=>l.status==='Rejected').length,color:C.danger600},{label:'Disbursed (₹)',value:fmtINR(loans.filter(l=>l.status==='Disbursed').reduce((s,l)=>s+(l.amount||0),0)),color:C.gray900}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}><div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div><div className="tabular" style={{ fontSize:i===4?16:24, fontWeight:700, color:k.color }}>{loading?'…':k.value}</div></Card>
        ))}
      </div>
      <Card>
        <TableToolbar search={search} onSearch={setSearch} placeholder="Application ID · name · loan type…"
          filters={<div className="flex items-center gap-2">{['All','Home Loan','Personal','Auto','Business'].map((f)=><button key={f} onClick={()=>setChipFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===chipFilter?C.blue600:C.gray300}`, backgroundColor:f===chipFilter?C.blue50:'#fff', color:f===chipFilter?C.blue600:C.gray700 }}>{f}</button>)}</div>}
        />
        <div className="table-scroll-wrap">
          <table className="w-full" style={{ borderCollapse:'collapse', minWidth:900 }}>
          <thead><tr><Th>Application</Th><Th>Applicant</Th><Th>Type</Th><Th right>Amount</Th><Th right>CIBIL</Th><Th right>DTI</Th><Th>Channel</Th><Th>Status</Th><Th>Submitted</Th><Th></Th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={10}/>) :
             filtered.length===0 ? <tr><td colSpan={10}><EmptyState icon={FileText} message="No loan applications found."/></td></tr> :
             filtered.map((a:any)=>(
              <tr key={a.id} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                <Td><div className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{a.id}</div><div style={{ fontSize:11, color:C.gray500 }}>{a.officer}</div></Td>
                <Td><div style={{ fontWeight:500, color:C.gray900 }}>{a.name}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{a.cif}</div></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{a.type}</span></Td>
                <Td right><span className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{fmtINR(a.amount)}</span></Td>
                <Td right><span className="tabular" style={{ fontWeight:700, fontSize:15, color:(a.score||0)>=700?C.success600:(a.score||0)>=650?C.warning600:C.danger600 }}>{a.score}</span></Td>
                <Td right><span className="tabular" style={{ fontSize:13, color:parseFloat(a.dti||'0')>=40?C.danger600:C.gray900 }}>{a.dti}</span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{a.channel}</span></Td>
                <Td><StatusBadge label={a.status} variant={sV[a.status]}/></Td>
                <Td><span className="tabular" style={{ fontSize:12, color:C.gray500 }}>{fmtDt(a.submitted_at)}</span></Td>
                <Td right><button onClick={()=>{setSelected(a);setView('underwriting');}} className="inline-flex items-center gap-1 rounded" style={{ height:32, padding:'0 12px', backgroundColor:C.blue600, color:'#fff', fontSize:13, fontWeight:500 }}>Underwrite <ChevronDown size={12} strokeWidth={2}/></button></Td>
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
