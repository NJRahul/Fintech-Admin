import { useState, useEffect } from 'react';
import { History, Download, RefreshCw } from 'lucide-react';
import { PageShell, Th, Td, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtDt } from '../../lib/api';
import { FB_AUDIT } from '../../lib/fallback';

const eV: Record<string,any> = { Loan:'info','Fraud alert':'danger',Account:'warning',KYC:'success','AML alert':'warning',Customer:'neutral',Dispute:'neutral',Staff:'neutral',SWIFT:'info' };

export function AuditTrail() {
  const [events, setEvents]         = useState<any[]>(FB_AUDIT);
  const [search, setSearch]         = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [expanded, setExpanded]     = useState<string|null>(null);
  const [loading, setLoading]       = useState(false);

  const load = (entity = '', who = '', ref = '') => {
    setLoading(true);
    const q = [entity&&`entity=${encodeURIComponent(entity)}`,who&&`who=${encodeURIComponent(who)}`,ref&&`ref=${encodeURIComponent(ref)}`].filter(Boolean).join('&');
    api(`/audit${q?`?${q}`:''}`).then(data => { if (Array.isArray(data) && data.length > 0) setEvents(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>load(), []);

  const filtered = events.filter(e =>
    (entityFilter==='All' || e.entity===entityFilter) &&
    (e.id?.toLowerCase().includes(search.toLowerCase()) ||
     e.who?.toLowerCase().includes(search.toLowerCase()) ||
     e.entity_ref?.toLowerCase().includes(search.toLowerCase()) ||
     e.action?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageShell title="Audit trail" subtitle="Immutable event log — every state change on every entity. Read-only."
      actions={<div className="flex items-center gap-2">
        <button onClick={()=>load()} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}><RefreshCw size={14} strokeWidth={1.5}/> Refresh</button>
        <button className="rounded flex items-center gap-2" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}><Download size={14} strokeWidth={1.5}/> Export CSV</button>
      </div>}
    >
      <Card>
        <div className="flex items-center gap-3 flex-wrap" style={{ padding:'12px 16px', borderBottom:`1px solid ${C.gray200}` }}>
          <div className="relative" style={{ minWidth:220 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.gray500} strokeWidth="1.5" style={{ position:'absolute', left:10, top:12 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Staff · entity ref · event ID…" className="w-full outline-none rounded" style={{ height:40, paddingLeft:34, paddingRight:12, border:`1px solid ${C.gray300}`, fontSize:14, color:C.gray900, backgroundColor:'#fff' }}/>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['All','Loan','KYC','Fraud alert','AML alert','Account','Customer'].map(f=>(
              <button key={f} onClick={()=>setEntityFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===entityFilter?C.blue600:C.gray300}`, backgroundColor:f===entityFilter?C.blue50:'#fff', color:f===entityFilter?C.blue600:C.gray700 }}>{f}</button>
            ))}
          </div>
          <div style={{ marginLeft:'auto' }}><div className="tabular" style={{ fontSize:13, color:C.gray500 }}>{loading?'…':filtered.length} events</div></div>
        </div>

        <div className="table-scroll-wrap">
          <table className="w-full" style={{ borderCollapse:'collapse', minWidth:900 }}>
          <thead><tr><Th>Event ID</Th><Th>When</Th><Th>By</Th><Th>Entity</Th><Th>Reference</Th><Th>Action</Th><Th>Before</Th><Th>After</Th><Th>Branch</Th></tr></thead>
          <tbody>
            {loading ? Array.from({length:8}).map((_,i)=><SkeletonRow key={i} cols={9}/>) :
             filtered.length===0 ? <tr><td colSpan={9}><EmptyState icon={History} message="No audit events match your filters."/></td></tr> :
             filtered.map((e:any)=>(
              <>
                <tr key={e.id} onClick={()=>setExpanded(expanded===e.id?null:e.id)}
                  style={{ borderTop:`1px solid ${C.gray200}`, height:44, cursor:'pointer', backgroundColor:expanded===e.id?C.blue50:'#fff' }}
                  onMouseEnter={el=>{if(expanded!==e.id)el.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={el=>{el.currentTarget.style.backgroundColor=expanded===e.id?C.blue50:'#fff'}}>
                  <Td><span className="tabular" style={{ fontSize:12, color:C.gray500 }}>{e.id}</span></Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray700, whiteSpace:'nowrap' }}>{fmtDt(e.when)}</span></Td>
                  <Td><div style={{ fontSize:13, fontWeight:500, color:C.gray900 }}>{e.who}</div><div style={{ fontSize:11, color:C.gray500 }}>{e.role}</div></Td>
                  <Td><StatusBadge label={e.entity} variant={eV[e.entity]||'neutral'}/></Td>
                  <Td><span className="tabular" style={{ fontSize:13, fontWeight:600, color:C.blue600 }}>{e.entity_ref}</span></Td>
                  <Td><span style={{ fontSize:13, fontWeight:500, color:C.gray900 }}>{e.action}</span></Td>
                  <Td>{e.before&&e.before!=='—'&&<span style={{ fontSize:12, color:C.gray500, padding:'2px 8px', borderRadius:4, backgroundColor:C.gray100 }}>{e.before}</span>}</Td>
                  <Td><span style={{ fontSize:12, fontWeight:500, color:C.success600, padding:'2px 8px', borderRadius:4, backgroundColor:'#E9F5EE' }}>{e.after}</span></Td>
                  <Td><span style={{ fontSize:13, color:C.gray700 }}>{e.branch}</span></Td>
                </tr>
                {expanded===e.id && (
                  <tr key={e.id+'_x'} style={{ backgroundColor:C.blue50 }}>
                    <td colSpan={9} style={{ padding:'12px 16px 16px 48px', borderBottom:`1px solid ${C.gray200}` }}>
                      <div className="flex items-center gap-8">
                        {[{label:'IP address',val:e.ip},{label:'Branch code',val:e.branch},{label:'Role at time',val:e.role},{label:'Full timestamp',val:fmtDt(e.when)}].map(({label,val},i)=>(
                          <div key={i}><div style={{ fontSize:11, fontWeight:600, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:2 }}>{label}</div><div className="tabular" style={{ fontSize:13, color:C.gray900 }}>{val}</div></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
             ))}
          </tbody>
        </table>
        </div>
        <Pagination from={1} to={filtered.length} total={events.length}/>
      </Card>
    </PageShell>
  );
}
