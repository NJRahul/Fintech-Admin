import { useState, useEffect } from 'react';
import { Users, ShieldCheck, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtDt } from '../../lib/api';
import { FB_STAFF } from '../../lib/fallback';

const roles = [
  {role:'Super Admin',         perms:['All modules','Staff management','Permission editor','Dual-auth override']},
  {role:'Branch Manager',      perms:['Dashboard','All queues','Approve dual-auth','Reports']},
  {role:'Credit Officer',      perms:['Loans queue','Underwriting','Disbursement auth','Customer-360']},
  {role:'Fraud Analyst',       perms:['Fraud queue','Investigation','Freeze/unfreeze','AML queue']},
  {role:'KYC Officer',         perms:['KYC queue','Compare view','Customer-360 (KYC tab)']},
  {role:'Collections Agent',   perms:['Collections pipeline','EMI ops','Contact log']},
  {role:'Compliance Officer',  perms:['AML dashboard','SAR workspace','Regulatory reports','KYC escalations']},
  {role:'Teller',              perms:['Teller ops','Customer lookup','Reconciliation']},
];

const permMatrix = [
  {module:'Customer search',  Teller:true,  'KYC Officer':true,  'Credit Officer':true,  'Fraud Analyst':true,  'Collections Agent':true,  'Compliance Officer':true,  'Branch Manager':true },
  {module:'KYC review queue', Teller:false, 'KYC Officer':true,  'Credit Officer':false, 'Fraud Analyst':false, 'Collections Agent':false, 'Compliance Officer':true,  'Branch Manager':true },
  {module:'Loan origination', Teller:false, 'KYC Officer':false, 'Credit Officer':true,  'Fraud Analyst':false, 'Collections Agent':false, 'Compliance Officer':false, 'Branch Manager':true },
  {module:'Fraud alerts',     Teller:false, 'KYC Officer':false, 'Credit Officer':false, 'Fraud Analyst':true,  'Collections Agent':false, 'Compliance Officer':true,  'Branch Manager':true },
  {module:'Collections',      Teller:false, 'KYC Officer':false, 'Credit Officer':false, 'Fraud Analyst':false, 'Collections Agent':true,  'Compliance Officer':false, 'Branch Manager':true },
  {module:'AML / Sanctions',  Teller:false, 'KYC Officer':false, 'Credit Officer':false, 'Fraud Analyst':true,  'Collections Agent':false, 'Compliance Officer':true,  'Branch Manager':true },
  {module:'Dual-auth',        Teller:false, 'KYC Officer':false, 'Credit Officer':false, 'Fraud Analyst':false, 'Collections Agent':false, 'Compliance Officer':true,  'Branch Manager':true },
];
const roleCols = ['Teller','KYC Officer','Credit Officer','Fraud Analyst','Collections Agent','Compliance Officer','Branch Manager'];

export function StaffAdmin() {
  const [staff, setStaff]       = useState<any[]>(FB_STAFF);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tab, setTab]           = useState<'staff'|'roles'|'permissions'>('staff');
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [togglingId, setTogglingId] = useState<string|null>(null);
  const [form, setForm]         = useState({ first:'', last:'', email:'', role:'Credit Officer', branch:'014 Mumbai Andheri' });
  const [editForm, setEditForm] = useState({ first:'', last:'', email:'', role:'', branch:'' });

  const load = () => {
    setLoading(true);
    api('/staff').then(data => { if (Array.isArray(data) && data.length > 0) setStaff(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = staff.filter(s =>
    (statusFilter==='All' || s.status===statusFilter) &&
    (s.name?.toLowerCase().includes(search.toLowerCase()) ||
     s.id?.toLowerCase().includes(search.toLowerCase()) ||
     s.role?.toLowerCase().includes(search.toLowerCase()) ||
     s.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const create = async () => {
    if (!form.first||!form.last||!form.email) return;
    setSaving(true);
    try {
      const member = await api('/staff', 'POST', { name:`${form.first} ${form.last}`, email:form.email, role:form.role, branch:form.branch });
      setStaff(prev => [member, ...prev]);
      setShowModal(false);
      setForm({ first:'', last:'', email:'', role:'Credit Officer', branch:'014 Mumbai Andheri' });
    } finally { setSaving(false); }
  };

  const openEdit = (member: any) => {
    const [first, ...rest] = (member.name||'').split(' ');
    setEditForm({ first, last:rest.join(' '), email:member.email||'', role:member.role||'Credit Officer', branch:member.branch||'014 Mumbai Andheri' });
    setEditTarget(member);
  };

  const saveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await api(`/staff/${editTarget.id}`, 'PUT', { name:`${editForm.first} ${editForm.last}`, email:editForm.email, role:editForm.role, branch:editForm.branch });
      setStaff(prev => prev.map(s => s.id===editTarget.id ? updated : s));
      setEditTarget(null);
    } finally { setSaving(false); }
  };

  const toggle = async (member: any) => {
    setTogglingId(member.id);
    try {
      const updated = await api(`/staff/${member.id}`, 'PUT', { status:member.status==='Active'?'Inactive':'Active' });
      setStaff(prev => prev.map(s => s.id===member.id ? updated : s));
    } finally { setTogglingId(null); }
  };

  return (
    <PageShell title="Staff & roles" subtitle="Manage staff accounts, role assignments, and module-level permissions."
      actions={<button onClick={()=>setShowModal(true)} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 16px', backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:500 }}><Plus size={16} strokeWidth={2}/> Add staff member</button>}
    >
      <div className="flex mb-4" style={{ borderBottom:`1px solid ${C.gray200}` }}>
        {[{key:'staff',label:'Staff accounts'},{key:'roles',label:'Role definitions'},{key:'permissions',label:'Permission matrix'}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key as any)} style={{ padding:'10px 24px', fontSize:14, fontWeight:500, color:tab===t.key?C.blue600:C.gray700, borderBottom:`2px solid ${tab===t.key?C.blue600:'transparent'}`, backgroundColor:'transparent' }}>{t.label}</button>
        ))}
      </div>

      {tab==='staff' && (
        <Card>
          <TableToolbar search={search} onSearch={setSearch} placeholder="Name · EMP ID · role · email…"
            filters={<div className="flex items-center gap-2">{['All','Active','Inactive'].map((f)=><button key={f} onClick={()=>setStatusFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===statusFilter?C.blue600:C.gray300}`, backgroundColor:f===statusFilter?C.blue50:'#fff', color:f===statusFilter?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          />
          <div className="table-scroll-wrap">
          <table className="w-full" style={{ borderCollapse:'collapse', minWidth:900 }}>
            <thead><tr><Th>Staff member</Th><Th>EMP ID</Th><Th>Role</Th><Th>Branch</Th><Th>Status</Th><Th>Last login</Th><Th right>Actions (30d)</Th><Th></Th></tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={8}/>) :
               filtered.length===0 ? <tr><td colSpan={8}><EmptyState icon={Users} message="No staff members found."/></td></tr> :
               filtered.map((s:any)=>(
                <tr key={s.id} style={{ borderTop:`1px solid ${C.gray200}`, height:52 }}
                  onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full flex items-center justify-center" style={{ width:32, height:32, backgroundColor:C.blue50, color:C.blue600, fontSize:12, fontWeight:700, flexShrink:0 }}>
                        {s.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                      </div>
                      <div><div style={{ fontWeight:500, color:C.gray900 }}>{s.name}</div><div style={{ fontSize:12, color:C.gray500 }}>{s.email}</div></div>
                    </div>
                  </Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{s.id}</span></Td>
                  <Td><span style={{ padding:'2px 8px', borderRadius:4, backgroundColor:C.blue50, fontSize:12, fontWeight:600, color:C.blue600 }}>{s.role}</span></Td>
                  <Td><span style={{ fontSize:13, color:C.gray700 }}>{s.branch}</span></Td>
                  <Td><StatusBadge label={s.status} variant={s.status==='Active'?'success':'neutral'}/></Td>
                  <Td><span className="tabular" style={{ fontSize:13, color:C.gray500 }}>{s.last_login?fmtDt(s.last_login):'Never'}</span></Td>
                  <Td right><span className="tabular" style={{ fontWeight:600, color:C.gray900 }}>{s.actions_30d}</span></Td>
                  <Td right>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:8, flexShrink:0, whiteSpace:"nowrap" }}>
                      <CompactBtn onClick={()=>openEdit(s)}><Edit size={12} strokeWidth={2} style={{ display:'inline', marginRight:4 }}/>Edit</CompactBtn>
                      <button onClick={()=>toggle(s)} disabled={togglingId===s.id} className="rounded flex items-center gap-1" style={{ height:32, padding:'0 10px', backgroundColor:s.status==='Active'?C.danger600:'#fff', border:`1px solid ${s.status==='Active'?C.danger600:C.gray300}`, color:s.status==='Active'?'#fff':C.success600, fontSize:12, fontWeight:500 }}>
                        {togglingId===s.id?<RefreshCw size={12} className="animate-spin"/>:s.status==='Active'?<><Trash2 size={12} style={{ display:'inline', marginRight:4 }}/>Deactivate</>:'Reactivate'}
                      </button>
                    </div>
                  </Td>
                </tr>
               ))}
            </tbody>
          </table>
          </div>
          <Pagination from={1} to={filtered.length} total={filtered.length}/>
        </Card>
      )}

      {tab==='roles' && (
        <div className="grid gap-4" style={{ gridTemplateColumns:'repeat(2,1fr)' }}>
          {roles.map((r,i)=>(
            <Card key={i} style={{ padding:20 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><div className="rounded flex items-center justify-center" style={{ width:36, height:36, backgroundColor:C.blue50 }}><ShieldCheck size={18} strokeWidth={1.5} color={C.blue600}/></div><div style={{ fontSize:15, fontWeight:600, color:C.gray900 }}>{r.role}</div></div>
                <button className="rounded" style={{ height:32, padding:'0 10px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:13, color:C.gray700 }}><Edit size={12} strokeWidth={2} style={{ display:'inline', marginRight:4 }}/>Edit</button>
              </div>
              <div className="flex flex-wrap gap-2">{r.perms.map((p,j)=><span key={j} style={{ padding:'2px 10px', borderRadius:999, backgroundColor:C.gray100, fontSize:12, color:C.gray700, fontWeight:500 }}>{p}</span>)}</div>
            </Card>
          ))}
        </div>
      )}

      {tab==='permissions' && (
        <Card style={{ overflowX:'auto' }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.gray200}` }}><h3 style={{ fontSize:15, fontWeight:600, color:C.gray900 }}>Module permission matrix</h3><p style={{ fontSize:13, color:C.gray500, marginTop:4 }}>Read-only. Changes require Super Admin + dual-auth.</p></div>
          <table style={{ borderCollapse:'collapse', width:'100%' }}>
            <thead><tr style={{ backgroundColor:C.gray100 }}>
              <th style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, minWidth:160 }}>Module</th>
              {roleCols.map(r=><th key={r} style={{ textAlign:'center', padding:'12px 12px', fontSize:11, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, whiteSpace:'nowrap' }}>{r}</th>)}
            </tr></thead>
            <tbody>
              {permMatrix.map((row,i)=>(
                <tr key={i} style={{ borderTop:`1px solid ${C.gray200}`, height:44 }}
                  onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                  <td style={{ padding:'0 16px', fontSize:14, fontWeight:500, color:C.gray900 }}>{row.module}</td>
                  {roleCols.map(col=>(
                    <td key={col} style={{ textAlign:'center', padding:'0 12px' }}>
                      {(row as any)[col]?<CheckCircle size={18} strokeWidth={2} color={C.success600}/>:<XCircle size={18} strokeWidth={1.5} color={C.gray300}/>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editTarget && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(26,31,41,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ backgroundColor:'#fff', borderRadius:10, width:520, boxShadow:'0 12px 24px rgba(16,24,40,0.14)', overflow:'hidden' }}>
            <div className="flex items-center justify-between" style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}` }}>
              <h2 style={{ fontSize:18, fontWeight:600, color:C.gray900 }}>Edit staff member</h2>
              <button onClick={()=>setEditTarget(null)} style={{ color:C.gray500 }}><X size={20} strokeWidth={1.5}/></button>
            </div>
            <div style={{ padding:24 }} className="flex flex-col gap-4">
              <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
                {[{label:'First name',key:'first',placeholder:'Ananya'},{label:'Last name',key:'last',placeholder:'Kapoor'}].map(({label,key,placeholder})=>(
                  <div key={key}><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>{label}</label><input value={(editForm as any)[key]} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
                ))}
              </div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Corporate email</label><input value={editForm.email} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))} type="email" className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Role</label><select value={editForm.role} onChange={e=>setEditForm(f=>({...f,role:e.target.value}))} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>{roles.map(r=><option key={r.role}>{r.role}</option>)}</select></div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Branch</label><select value={editForm.branch} onChange={e=>setEditForm(f=>({...f,branch:e.target.value}))} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>{['014 Mumbai Andheri','022 Delhi Connaught Place','031 Chennai Anna Nagar','044 Bangalore Indiranagar'].map(b=><option key={b}>{b}</option>)}</select></div>
            </div>
            <div className="flex items-center justify-end gap-3" style={{ padding:'16px 24px', borderTop:`1px solid ${C.gray200}` }}>
              <button onClick={()=>setEditTarget(null)} className="rounded" style={{ height:40, padding:'0 16px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray700 }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 16px', backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:600 }}>
                {saving?<RefreshCw size={14} className="animate-spin"/>:null} Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(26,31,41,0.4)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ backgroundColor:'#fff', borderRadius:10, width:520, boxShadow:'0 12px 24px rgba(16,24,40,0.14)', overflow:'hidden' }}>
            <div className="flex items-center justify-between" style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}` }}>
              <h2 style={{ fontSize:18, fontWeight:600, color:C.gray900 }}>Add staff member</h2>
              <button onClick={()=>setShowModal(false)} style={{ color:C.gray500 }}><X size={20} strokeWidth={1.5}/></button>
            </div>
            <div style={{ padding:24 }} className="flex flex-col gap-4">
              <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
                {[{label:'First name',placeholder:'Ananya',key:'first'},{label:'Last name',placeholder:'Kapoor',key:'last'}].map(({label,placeholder,key})=>(
                  <div key={key}><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>{label} <span style={{ color:C.danger600 }}>*</span></label><input value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
                ))}
              </div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Corporate email <span style={{ color:C.danger600 }}>*</span></label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="a.kapoor@meridianbank.in" type="email" className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/></div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Role</label><select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>{roles.map(r=><option key={r.role}>{r.role}</option>)}</select></div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Branch</label><select value={form.branch} onChange={e=>setForm(f=>({...f,branch:e.target.value}))} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>{['014 Mumbai Andheri','022 Delhi Connaught Place','031 Chennai Anna Nagar','044 Bangalore Indiranagar'].map(b=><option key={b}>{b}</option>)}</select></div>
            </div>
            <div className="flex items-center justify-end gap-3" style={{ padding:'16px 24px', borderTop:`1px solid ${C.gray200}` }}>
              <button onClick={()=>setShowModal(false)} className="rounded" style={{ height:40, padding:'0 16px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray700 }}>Cancel</button>
              <button onClick={create} disabled={!form.first||!form.last||!form.email||saving} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 16px', backgroundColor:form.first&&form.last&&form.email?C.blue600:C.gray300, color:'#fff', fontSize:14, fontWeight:600 }}>
                {saving?<RefreshCw size={14} className="animate-spin"/>:null} Create account
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
