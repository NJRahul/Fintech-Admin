import { useState, useEffect } from 'react';
import { FileBarChart, Download, Calendar, RefreshCw, CheckCircle } from 'lucide-react';
import { PageShell, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card, CardHeader } from '../Card';
import { C } from '../tokens';
import { api, fmtDt } from '../../lib/api';

const catalog = [
  {id:'RPT-KYC-001',   name:'KYC status summary',              desc:'Submissions, approvals, rejections by branch and risk tier', category:'Compliance',  frequency:'Daily'    },
  {id:'RPT-AML-001',   name:'AML disposition report',          desc:'Alert counts, disposition outcomes, SAR filings by period', category:'Compliance',  frequency:'Weekly'   },
  {id:'RPT-TXN-001',   name:'Transaction volume & failure',    desc:'Volume by rail, success/failure rates, peak hour analysis', category:'Operations',  frequency:'Daily'    },
  {id:'RPT-LOAN-001',  name:'Loan origination & disbursement', desc:'Application counts, approval rates, disbursed amounts',     category:'Credit',      frequency:'Monthly'  },
  {id:'RPT-EMI-001',   name:'EMI collection efficiency',       desc:'DPD buckets, collection rates, mandate failure analysis',   category:'Collections', frequency:'Weekly'   },
  {id:'RPT-FRAUD-001', name:'Fraud alert & resolution',        desc:'Alert volume, severity distribution, resolution times',     category:'Risk',        frequency:'Daily'    },
  {id:'RPT-RBI-001',   name:'RBI Basel III capital adequacy',  desc:'Regulatory capital computation — CET1, Tier 1, Tier 2',    category:'Regulatory',  frequency:'Quarterly'},
  {id:'RPT-FEMA-001',  name:'FEMA cross-border report',        desc:'Outward remittances, inward receipts, SWIFT/SEPA corridor', category:'Regulatory', frequency:'Monthly'  },
];

const cV: Record<string,any> = {Compliance:'info',Operations:'neutral',Credit:'success',Collections:'warning',Risk:'danger',Regulatory:'warning'};

export function Reports() {
  const [selected, setSelected]   = useState<typeof catalog[0]|null>(null);
  const [reports, setReports]     = useState<any[]>([]);
  const [dateFrom, setDateFrom]   = useState('2026-07-01');
  const [dateTo, setDateTo]       = useState('2026-07-05');
  const [branch, setBranch]       = useState('All branches');
  const [format, setFormat]       = useState('Excel (.xlsx)');
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api('/reports').then(setReports).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const generate = async () => {
    if (!selected) return;
    setGenerating(true); setGeneratedId('');
    try {
      const r = await api('/reports/generate', 'POST', { name:selected.name, category:selected.category, date_from:dateFrom, date_to:dateTo, branch, format });
      setReports(prev => [r, ...prev]);
      setGeneratedId(r.id);
    } finally { setGenerating(false); }
  };

  return (
    <PageShell title="Regulatory reports" subtitle="Generate, schedule, and download compliance and operational reports.">
      <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 420px' }}>
        <Card style={{ padding:0 }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.gray200}` }}>
            <input placeholder="Search reports…" className="w-full outline-none rounded" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/>
          </div>
          {catalog.map((r,i)=>(
            <div key={r.id} onClick={()=>{setSelected(r);setGeneratedId('');}}
              style={{ padding:'16px 20px', borderBottom:i<catalog.length-1?`1px solid ${C.gray200}`:'none', cursor:'pointer', backgroundColor:selected?.id===r.id?C.blue50:'#fff', borderLeft:`4px solid ${selected?.id===r.id?C.blue600:'transparent'}` }}
              onMouseEnter={e=>{if(selected?.id!==r.id)e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor=selected?.id===r.id?C.blue50:'#fff'}}>
              <div className="flex items-start justify-between mb-1">
                <div><div style={{ fontSize:14, fontWeight:600, color:C.gray900 }}>{r.name}</div><div className="tabular" style={{ fontSize:11, color:C.gray500 }}>{r.id}</div></div>
                <StatusBadge label={r.category} variant={cV[r.category]}/>
              </div>
              <div style={{ fontSize:13, color:C.gray700, marginBottom:4 }}>{r.desc}</div>
              <div style={{ fontSize:12, color:C.gray500 }}>Frequency: {r.frequency}</div>
            </div>
          ))}
        </Card>

        <div className="flex flex-col gap-4">
          {selected ? (
            <Card style={{ padding:20 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:4 }}>{selected.name}</div>
              <div style={{ marginBottom:16 }}><StatusBadge label={selected.category} variant={cV[selected.category]}/></div>
              <div className="flex flex-col gap-3">
                {[{label:'From',type:'date',val:dateFrom,set:setDateFrom},{label:'To',type:'date',val:dateTo,set:setDateTo}].map(({label,type,val,set},i)=>(
                  <div key={i}><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>{label}</label><input type={type} value={val} onChange={e=>set(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
                ))}
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Branch / scope</label>
                  <select value={branch} onChange={e=>setBranch(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>
                    {['All branches','Mumbai Andheri (014)','Chennai Anna Nagar','Delhi Connaught Place'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Format</label>
                  <select value={format} onChange={e=>setFormat(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>
                    {['Excel (.xlsx)','PDF','CSV'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                {generatedId ? (
                  <div style={{ padding:16, borderRadius:8, backgroundColor:'#E9F5EE', border:`1px solid ${C.success600}30` }}>
                    <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} strokeWidth={2} color={C.success600}/><span style={{ fontSize:14, fontWeight:600, color:C.success600 }}>Report ready</span></div>
                    <div className="tabular" style={{ fontSize:12, color:C.gray500, marginBottom:10 }}>{generatedId}</div>
                    <button className="rounded flex items-center gap-2 w-full justify-center" style={{ height:40, backgroundColor:C.success600, color:'#fff', fontSize:14, fontWeight:600 }}><Download size={16} strokeWidth={2}/> Download report</button>
                  </div>
                ) : (
                  <button onClick={generate} disabled={generating} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:44, backgroundColor:generating?C.gray300:C.blue600, color:'#fff', fontSize:14, fontWeight:600 }}>
                    {generating?<><RefreshCw size={16} className="animate-spin"/> Generating…</>:<><FileBarChart size={16} strokeWidth={2}/> Generate report</>}
                  </button>
                )}
                <button className="rounded flex items-center justify-center gap-2 w-full" style={{ height:40, border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, fontWeight:500, color:C.gray700 }}>
                  <Calendar size={16} strokeWidth={1.5}/> Schedule recurring
                </button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding:40 }}><EmptyState icon={FileBarChart} message="Select a report from the catalog to generate or download."/></Card>
          )}

          <Card>
            <CardHeader title="Recent runs"/>
            {loading ? [0,1,2].map(i=><div key={i} className="animate-pulse" style={{ height:60, margin:12, borderRadius:6, backgroundColor:C.gray200 }}/>) :
             reports.length===0 ? <div style={{ padding:'24px 20px', textAlign:'center', color:C.gray500, fontSize:14 }}>No reports generated yet. Generate your first above.</div> :
             reports.slice(0,5).map((r:any,i:number)=>(
              <div key={r.id} style={{ padding:'12px 20px', borderBottom:i<Math.min(reports.length,5)-1?`1px solid ${C.gray200}`:'none' }}>
                <div className="flex items-start justify-between mb-1">
                  <div style={{ fontSize:13, fontWeight:600, color:C.gray900 }}>{r.name}</div>
                  <button className="rounded flex items-center gap-1" style={{ height:28, padding:'0 10px', backgroundColor:C.blue50, color:C.blue600, fontSize:12, fontWeight:600 }}><Download size={12} strokeWidth={2}/> .xlsx</button>
                </div>
                <div className="tabular flex items-center gap-2" style={{ fontSize:12, color:C.gray500 }}><span>{fmtDt(r.generated_at)}</span><span style={{ color:C.gray300 }}>·</span><span>{r.size_mb} MB</span></div>
              </div>
             ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
