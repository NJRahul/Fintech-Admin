import { useState, useEffect } from 'react';
import { Users, ChevronRight, Phone, Mail, MapPin, CreditCard, FileText, ArrowLeftRight, ShieldAlert, X, CheckCircle, ChevronLeft, Copy } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, CompactBtn, Pagination, SkeletonRow, EmptyState } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, fmtINR } from '../../lib/api';
import { FB_CUSTOMERS } from '../../lib/fallback';

const kycV: Record<string,any> = { Approved:'success','In Review':'warning','More Info Needed':'warning',Submitted:'info',Rejected:'danger' };
const rC: Record<string,string> = { Low:C.success600, Medium:C.warning600, High:C.danger600 };

// ── New customer wizard ────────────────────────────────────
type Step = 'personal'|'address'|'account'|'review'|'success';
const STEPS: {key:Step;label:string}[] = [{key:'personal',label:'Personal info'},{key:'address',label:'Address'},{key:'account',label:'Account'},{key:'review',label:'Review'}];

function Field({label,children,req}:{label:string;children:React.ReactNode;req?:boolean}) {
  return <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>{label}{req&&<span style={{ color:C.danger600, marginLeft:2 }}>*</span>}</label>{children}</div>;
}
function Inp({value,onChange,placeholder,type='text'}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}) {
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}/>;
}

function NewCustomerModal({onClose,onCreated}:{onClose:()=>void;onCreated:(c:any)=>void}) {
  const [step,setStep]   = useState<Step>('personal');
  const [saving,setSaving] = useState(false);
  const [newCif,setNewCif] = useState('');
  const [copied,setCopied] = useState(false);
  const [form,setForm]   = useState({ first:'', last:'', dob:'', mobile:'', email:'', pan:'', gender:'', occupation:'', address1:'', address2:'', city:'', state:'', pincode:'', country:'India', accountType:'Savings', branch:'Mumbai Andheri (014)', rm:'A. Kapoor', riskTier:'Low' });
  const set = (k:string) => (v:string) => setForm(f=>({...f,[k]:v}));
  const disabled = step==='personal' ? !form.first||!form.last||!form.mobile||!form.pan||!form.dob||!form.gender : step==='address' ? !form.address1||!form.city||!form.state||!form.pincode : step==='account' ? !form.branch : false;

  const order: Step[] = ['personal','address','account','review'];
  const idx = order.indexOf(step);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const customer = await api('/customers', 'POST', { ...form, name:`${form.first} ${form.last}` });
      setNewCif(customer.cif);
      onCreated(customer);
      setStep('success');
    } catch {
      // Fallback: create locally
      const cif = `CIF-${880000+Math.floor(Math.random()*9999)}`;
      setNewCif(cif);
      onCreated({ cif, name:`${form.first} ${form.last}`, mobile:form.mobile, pan:form.pan, kyc_status:'Submitted', risk_tier:form.riskTier, rm:form.rm, branch:form.branch, created_at:new Date().toISOString() });
      setStep('success');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(26,31,41,0.48)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ backgroundColor:'#fff', borderRadius:10, width:'100%', maxWidth:640, boxShadow:'0 12px 24px rgba(16,24,40,0.14)', display:'flex', flexDirection:'column', maxHeight:'90vh' }}>
        <div className="flex items-center justify-between" style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, flexShrink:0 }}>
          <div><h2 style={{ fontSize:18, fontWeight:600, color:C.gray900 }}>{step==='success'?'Customer created':'New customer onboarding'}</h2>{step!=='success'&&<p style={{ fontSize:13, color:C.gray500, marginTop:2 }}>Fields marked * are required.</p>}</div>
          <button onClick={onClose}><X size={20} strokeWidth={1.5} color={C.gray500}/></button>
        </div>

        {step!=='success' && (
          <div className="flex items-center" style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}`, gap:0, flexShrink:0 }}>
            {STEPS.map((s,i)=>{
              const done=i<idx, active=i===idx;
              return (
                <div key={s.key} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full flex items-center justify-center" style={{ width:28, height:28, fontSize:12, fontWeight:700, backgroundColor:done||active?C.blue600:C.gray200, color:done||active?'#fff':C.gray500, flexShrink:0 }}>
                      {done?<CheckCircle size={14} strokeWidth={2.5}/>:i+1}
                    </div>
                    <span style={{ fontSize:13, fontWeight:active?600:400, color:active?C.blue600:done?C.gray900:C.gray500 }}>{s.label}</span>
                  </div>
                  {i<STEPS.length-1&&<div style={{ width:40, height:1, backgroundColor:i<idx?C.blue600:C.gray300, margin:'0 12px' }}/>}
                </div>
              );
            })}
          </div>
        )}

        <div className="overflow-y-auto flex-1" style={{ padding:24 }}>
          {step==='personal'&&<div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <Field label="First name" req><Inp value={form.first} onChange={set('first')} placeholder="Rohan"/></Field>
            <Field label="Last name" req><Inp value={form.last} onChange={set('last')} placeholder="Sharma"/></Field>
            <Field label="Date of birth" req><Inp type="date" value={form.dob} onChange={set('dob')}/></Field>
            <Field label="Gender" req><select value={form.gender} onChange={e=>set('gender')(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}><option value="">Select…</option>{['Male','Female','Other'].map(o=><option key={o}>{o}</option>)}</select></Field>
            <Field label="Mobile number" req><Inp value={form.mobile} onChange={set('mobile')} placeholder="+91 98201 12340" type="tel"/></Field>
            <Field label="Email address"><Inp value={form.email} onChange={set('email')} placeholder="rohan@email.com" type="email"/></Field>
            <Field label="PAN number" req><Inp value={form.pan} onChange={v=>set('pan')(v.toUpperCase())} placeholder="ABCPS4821H"/></Field>
            <div className="col-span-2"><Field label="Occupation"><select value={form.occupation} onChange={e=>set('occupation')(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}><option value="">Select…</option>{['Salaried','Self-employed','Business owner','Student','Retired','Homemaker'].map(o=><option key={o}>{o}</option>)}</select></Field></div>
          </div>}

          {step==='address'&&<div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <div className="col-span-2"><Field label="Address line 1" req><Inp value={form.address1} onChange={set('address1')} placeholder="14-B, Lokhandwala Complex"/></Field></div>
            <div className="col-span-2"><Field label="Address line 2"><Inp value={form.address2} onChange={set('address2')} placeholder="Andheri West"/></Field></div>
            <Field label="City" req><Inp value={form.city} onChange={set('city')} placeholder="Mumbai"/></Field>
            <Field label="Pincode" req><Inp value={form.pincode} onChange={set('pincode')} placeholder="400053"/></Field>
            <Field label="State" req><select value={form.state} onChange={e=>set('state')(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}><option value="">Select…</option>{['Maharashtra','Karnataka','Tamil Nadu','Delhi','West Bengal','Kerala','Gujarat','Rajasthan'].map(o=><option key={o}>{o}</option>)}</select></Field>
            <Field label="Country"><Inp value={form.country} onChange={set('country')} placeholder="India"/></Field>
          </div>}

          {step==='account'&&<div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <div className="col-span-2">
              <Field label="Account type" req>
                <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                  {[{t:'Savings',d:'Standard savings, 4% p.a.'},{t:'Current',d:'No interest, high limits'},{t:'Salary',d:'Salary credits, 0 min balance'}].map(({t,d})=>(
                    <button key={t} onClick={()=>set('accountType')(t)} className="rounded text-left" style={{ padding:14, border:`2px solid ${form.accountType===t?C.blue600:C.gray200}`, backgroundColor:form.accountType===t?C.blue50:'#fff' }}>
                      <div style={{ fontSize:14, fontWeight:600, color:form.accountType===t?C.blue600:C.gray900 }}>{t}</div>
                      <div style={{ fontSize:12, color:C.gray500, marginTop:2 }}>{d}</div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Home branch" req><select value={form.branch} onChange={e=>set('branch')(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>{['Mumbai Andheri (014)','Delhi Connaught Place (022)','Chennai Anna Nagar (031)','Bangalore Indiranagar (044)'].map(o=><option key={o}>{o}</option>)}</select></Field>
            <Field label="Relationship manager"><select value={form.rm} onChange={e=>set('rm')(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff' }}>{['A. Kapoor','S. Bhatt','R. Iyer','P. Menon','M. Das'].map(o=><option key={o}>{o}</option>)}</select></Field>
            <div className="col-span-2">
              <Field label="Risk tier">
                <div className="flex gap-3">{(['Low','Medium','High'] as const).map(t=>(
                  <button key={t} onClick={()=>set('riskTier')(t)} className="rounded flex items-center gap-2 flex-1 justify-center" style={{ height:40, fontWeight:600, fontSize:13, border:`2px solid ${form.riskTier===t?rC[t]:C.gray200}`, backgroundColor:form.riskTier===t?rC[t]+'15':'#fff', color:form.riskTier===t?rC[t]:C.gray700 }}>
                    <span className="rounded-full" style={{ width:8, height:8, backgroundColor:rC[t], display:'inline-block' }}/>{t}
                  </button>
                ))}</div>
              </Field>
            </div>
          </div>}

          {step==='review'&&<div className="flex flex-col gap-5">
            {[{section:'Personal',rows:[{label:'Full name',val:`${form.first} ${form.last}`},{label:'Date of birth',val:form.dob},{label:'Gender',val:form.gender},{label:'Mobile',val:form.mobile},{label:'PAN',val:form.pan}]},{section:'Address',rows:[{label:'Address',val:[form.address1,form.address2].filter(Boolean).join(', ')},{label:'City',val:form.city},{label:'State',val:form.state},{label:'Pincode',val:form.pincode}]},{section:'Account',rows:[{label:'Account type',val:form.accountType},{label:'Branch',val:form.branch},{label:'Risk tier',val:form.riskTier}]}].map(({section,rows})=>(
              <div key={section}>
                <div style={{ fontSize:12, fontWeight:600, color:C.gray500, letterSpacing:'0.03em', textTransform:'uppercase', marginBottom:10 }}>{section}</div>
                <div style={{ border:`1px solid ${C.gray200}`, borderRadius:8, overflow:'hidden' }}>
                  {rows.filter(r=>r.val).map(({label,val},i,arr)=>(
                    <div key={label} className="flex" style={{ padding:'10px 16px', borderBottom:i<arr.length-1?`1px solid ${C.gray200}`:'none', backgroundColor:i%2===0?'#fff':C.gray50 }}>
                      <div style={{ width:140, fontSize:13, color:C.gray500, flexShrink:0 }}>{label}</div>
                      <div className="tabular" style={{ fontSize:13, fontWeight:500, color:C.gray900 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ padding:14, borderRadius:8, backgroundColor:C.warning50, border:`1px solid ${C.warning600}30` }}>
              <p style={{ fontSize:13, color:C.warning600, fontWeight:500 }}>Submitting will create the customer record, open a {form.accountType} account, and queue a KYC review. The customer will receive an SMS with their CIF number.</p>
            </div>
          </div>}

          {step==='success'&&<div className="flex flex-col items-center text-center" style={{ padding:'24px 0', gap:16 }}>
            <div className="rounded-full flex items-center justify-center" style={{ width:72, height:72, backgroundColor:'#E9F5EE' }}><CheckCircle size={40} strokeWidth={2} color={C.success600}/></div>
            <h2 style={{ fontSize:22, fontWeight:600, color:C.gray900 }}>Customer created successfully</h2>
            <p style={{ fontSize:14, color:C.gray700, maxWidth:400 }}>{form.first} {form.last}'s record has been created, a {form.accountType} account opened, and KYC queued.</p>
            <div style={{ width:'100%', maxWidth:360, padding:16, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
              <div style={{ fontSize:12, color:C.gray500, marginBottom:6 }}>Customer Identification Number</div>
              <div className="flex items-center gap-3 justify-center">
                <span className="tabular" style={{ fontSize:22, fontWeight:700, color:C.gray900, letterSpacing:'0.04em' }}>{newCif}</span>
                <button onClick={()=>{navigator.clipboard.writeText(newCif);setCopied(true);setTimeout(()=>setCopied(false),2000);}} className="rounded flex items-center gap-1" style={{ height:32, padding:'0 10px', backgroundColor:copied?C.success600:C.blue600, color:'#fff', fontSize:12, fontWeight:600 }}>
                  {copied?<CheckCircle size={13} strokeWidth={2.5}/>:<Copy size={13} strokeWidth={2}/>} {copied?'Copied':'Copy'}
                </button>
              </div>
            </div>
            {[{label:'✓ KYC queued for review',ok:true},{label:`✓ ${form.accountType} account opened`,ok:true},{label:'✓ Welcome SMS sent to '+form.mobile,ok:true},{label:'○ KYC documents pending upload',ok:false}].map((s,i)=>(
              <div key={i} className="flex items-center gap-2 rounded" style={{ padding:'8px 12px', backgroundColor:s.ok?'#E9F5EE':C.gray50, border:`1px solid ${s.ok?C.success600+'30':C.gray200}`, width:'100%', maxWidth:360 }}>
                <span style={{ fontSize:13, color:s.ok?C.success600:C.gray700, fontWeight:500 }}>{s.label}</span>
              </div>
            ))}
          </div>}
        </div>

        <div className="flex items-center justify-between" style={{ padding:'16px 24px', borderTop:`1px solid ${C.gray200}`, flexShrink:0 }}>
          {step==='success' ? (
            <button onClick={onClose} className="w-full rounded" style={{ height:44, backgroundColor:C.blue600, color:'#fff', fontSize:15, fontWeight:600 }}>Done — go to customer list</button>
          ) : (
            <>
              <button onClick={()=>{ if(idx>0) setStep(order[idx-1]); else onClose(); }} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 16px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray700 }}>
                <ChevronLeft size={16} strokeWidth={2}/> {idx===0?'Cancel':'Back'}
              </button>
              {step==='review' ? (
                <button onClick={handleSubmit} disabled={saving} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 20px', backgroundColor:saving?C.gray300:C.success600, color:'#fff', fontSize:14, fontWeight:600 }}>
                  {saving?'Creating…':<><CheckCircle size={16} strokeWidth={2}/> Confirm & create</>}
                </button>
              ) : (
                <button onClick={()=>setStep(order[idx+1])} disabled={disabled} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 20px', backgroundColor:disabled?C.gray300:C.blue600, color:'#fff', fontSize:14, fontWeight:600, cursor:disabled?'not-allowed':'pointer' }}>
                  Continue <ChevronRight size={16} strokeWidth={2}/>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────
export function CustomerSearch() {
  const [customers, setCustomers] = useState<any[]>(FB_CUSTOMERS);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'|'kyc'|'alerts'>('accounts');
  const [showNew, setShowNew]     = useState(false);
  const [detail, setDetail]       = useState<any>(null);
  const [chipFilter, setChipFilter] = useState('All');
  const [freezingNo, setFreezingNo] = useState<string|null>(null);
  const [ledgerLoading, setLedgerLoading] = useState<string|null>(null);
  const [ledgers, setLedgers] = useState<Record<string,any[]>>({});

  // Sync with Supabase in background — replace fallback when data arrives
  useEffect(() => {
    api('/customers')
      .then((data: any[]) => { if (data && data.length > 0) setCustomers(data); })
      .catch(() => {});
  }, []);

  const loadDetail = async (c: any) => {
    setSelected(c); setActiveTab('accounts'); setDetail(null);
    try { const d = await api(`/customers/${c.cif}`); setDetail(d); } catch { setDetail(null); }
  };

  const freezeAccount = async (no: string) => {
    setFreezingNo(no);
    try {
      const updated = await api(`/accounts/${no}/toggle-freeze`, 'POST', { officer:'A. Kapoor' });
      setDetail((d: any) => d ? { ...d, accounts: d.accounts?.map((a: any) => a.no===no ? updated : a) } : d);
    } finally { setFreezingNo(null); }
  };

  const viewLedger = async (no: string) => {
    if (ledgers[no]) return;
    setLedgerLoading(no);
    try {
      const r = await api(`/accounts/${no}/ledger`);
      setLedgers(prev => ({ ...prev, [no]: r.ledger||[] }));
    } finally { setLedgerLoading(null); }
  };

  const filtered = customers.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.cif?.toLowerCase().includes(search.toLowerCase()) ||
      c.pan?.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile?.includes(search);
    const matchesChip =
      chipFilter==='All' ||
      (chipFilter==='High risk' && c.risk_tier==='High') ||
      (chipFilter==='KYC pending' && ['Submitted','In Review'].includes(c.kyc_status)) ||
      (chipFilter==='Flagged' && c.risk_tier==='High' && !['Approved'].includes(c.kyc_status));
    return matchesSearch && matchesChip;
  });

  return (
    <PageShell title="Customer search" subtitle="Search by name, CIF, PAN, mobile, or account number.">
      <Card>
        <TableToolbar search={search} onSearch={setSearch} placeholder="Name · CIF · PAN · mobile…"
          filters={<div className="flex items-center gap-2">{['All','High risk','KYC pending','Flagged'].map((f)=><button key={f} onClick={()=>setChipFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===chipFilter?C.blue600:C.gray300}`, backgroundColor:f===chipFilter?C.blue50:'#fff', color:f===chipFilter?C.blue600:C.gray700 }}>{f}</button>)}</div>}
          action={<button onClick={()=>setShowNew(true)} className="rounded" style={{ height:40, padding:'0 16px', backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:500 }}>+ New customer</button>}
        />
        <div className="table-scroll-wrap">
          <table className="w-full" style={{ borderCollapse:'collapse', minWidth:900 }}>
          <thead><tr><Th>Customer</Th><Th>CIF</Th><Th>Mobile</Th><Th>PAN</Th><Th>KYC</Th><Th>Risk</Th><Th>RM</Th><Th>Branch</Th><Th></Th></tr></thead>
          <tbody>
            {filtered.length===0 ? <tr><td colSpan={9}><EmptyState icon={Users} message="No customers match your search."/></td></tr> :
             filtered.map((c:any)=>(
              <tr key={c.cif} style={{ borderTop:`1px solid ${C.gray200}`, height:52, cursor:'pointer', backgroundColor:selected?.cif===c.cif?C.blue50:'#fff' }}
                onMouseEnter={e=>{if(selected?.cif!==c.cif)e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor=selected?.cif===c.cif?C.blue50:'#fff'}}
                onClick={()=>loadDetail(c)}>
                <Td style={{ paddingLeft:selected?.cif===c.cif?19:16 }}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full flex items-center justify-center" style={{ width:32, height:32, backgroundColor:C.blue50, color:C.blue600, fontSize:12, fontWeight:600, flexShrink:0 }}>{c.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                    <div><div style={{ fontWeight:500, color:C.gray900 }}>{c.name}</div><div style={{ fontSize:12, color:C.gray500 }}>CIF: {c.cif}</div></div>
                  </div>
                </Td>
                <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{c.cif}</span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{c.mobile}</span></Td>
                <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{c.pan}</span></Td>
                <Td><StatusBadge label={c.kyc_status} variant={kycV[c.kyc_status]}/></Td>
                <Td><span className="inline-flex items-center gap-1.5" style={{ fontSize:13 }}><span className="rounded-full" style={{ width:6, height:6, backgroundColor:rC[c.risk_tier]||C.gray500, display:'inline-block' }}/>{c.risk_tier}</span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{c.rm}</span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{c.branch}</span></Td>
                <Td right>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, flexShrink:0, whiteSpace:'nowrap' }}>
                    <CompactBtn onClick={(e:any)=>{e?.stopPropagation();loadDetail(c);}}>View 360°</CompactBtn>
                    <ChevronRight size={16} strokeWidth={1.5} color={C.gray500} style={{ flexShrink:0 }}/>
                  </div>
                </Td>
              </tr>
             ))}
          </tbody>
        </table>
        </div>
        <Pagination from={1} to={filtered.length} total={filtered.length}/>
      </Card>

      {/* Customer 360 slide-over */}
      {selected && (
        <div style={{ position:'fixed', top:0, right:0, bottom:0, width:520, backgroundColor:'#fff', boxShadow:'0 4px 24px rgba(16,24,40,0.18)', zIndex:50, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'20px 24px', borderBottom:`1px solid ${C.gray200}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full flex items-center justify-center" style={{ width:44, height:44, backgroundColor:C.blue50, color:C.blue600, fontSize:16, fontWeight:700 }}>{selected.name?.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                <div>
                  <div style={{ fontSize:18, fontWeight:600, color:C.gray900 }}>{selected.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tabular" style={{ fontSize:12, color:C.gray500 }}>{selected.cif}</span>
                    <span style={{ color:C.gray300 }}>·</span>
                    <StatusBadge label={selected.kyc_status} variant={kycV[selected.kyc_status]}/>
                    <span style={{ color:C.gray300 }}>·</span>
                    <span className="inline-flex items-center gap-1" style={{ fontSize:12 }}><span className="rounded-full" style={{ width:6, height:6, backgroundColor:rC[selected.risk_tier]||C.gray500, display:'inline-block' }}/><span style={{ color:C.gray700 }}>{selected.risk_tier} risk</span></span>
                  </div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)}><X size={20} strokeWidth={1.5} color={C.gray500}/></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{icon:Phone,val:selected.mobile},{icon:Mail,val:selected.email||'—'},{icon:MapPin,val:selected.branch}].map(({icon:Icon,val},i)=>(
                <div key={i} className="flex items-center gap-2"><Icon size={14} strokeWidth={1.5} color={C.gray500}/><span style={{ fontSize:12, color:C.gray700 }}>{val}</span></div>
              ))}
            </div>
          </div>
          <div className="flex" style={{ borderBottom:`1px solid ${C.gray200}` }}>
            {(['accounts','transactions','kyc','alerts'] as const).map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{ flex:1, height:44, fontSize:13, fontWeight:500, color:activeTab===t?C.blue600:C.gray700, borderBottom:`2px solid ${activeTab===t?C.blue600:'transparent'}`, backgroundColor:'#fff', textTransform:'capitalize' }}>
                {t==='accounts'?'Accounts':t==='transactions'?'Transactions':t==='kyc'?'KYC docs':'Alerts'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab==='accounts' && (
              <div style={{ padding:20 }}>
                <div style={{ marginBottom:12, fontSize:12, fontWeight:600, color:C.gray500, letterSpacing:'0.03em', textTransform:'uppercase' }}>Linked accounts</div>
                {(detail?.accounts||[{no:'••4821',type:'Savings',balance:284312.50,status:'Active',limit:200000},{no:'••7392',type:'Current',balance:1842600.00,status:'Active',limit:1000000}]).map((a:any,i:number)=>(
                  <div key={i} style={{ padding:16, border:`1px solid ${C.gray200}`, borderRadius:8, marginBottom:10 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><CreditCard size={18} strokeWidth={1.5} color={C.blue600}/><div><div style={{ fontSize:14, fontWeight:600, color:C.gray900 }}>{a.type} {a.no}</div><div style={{ fontSize:12, color:C.gray500 }}>Daily limit: {typeof a.limit==='number'?fmtINR(a.limit):a.limit}</div></div></div>
                      <StatusBadge label={a.status} variant={a.status==='Active'?'success':a.status==='Frozen'?'danger':'warning'}/>
                    </div>
                    <div className="tabular" style={{ fontSize:20, fontWeight:700, color:C.gray900, marginTop:12 }}>{typeof a.balance==='number'?fmtINR(a.balance):a.balance}</div>
                    {ledgers[a.no] && (
                      <div style={{ marginTop:8, maxHeight:140, overflowY:'auto', borderRadius:6, border:`1px solid ${C.gray200}` }}>
                        {ledgers[a.no].slice(0,5).map((tx:any,ti:number)=>(
                          <div key={ti} className="flex items-center justify-between" style={{ padding:'6px 10px', borderBottom:ti<4?`1px solid ${C.gray200}`:'none' }}>
                            <span style={{ fontSize:12, color:C.gray700 }}>{tx.desc}</span>
                            <span className="tabular" style={{ fontSize:12, fontWeight:600, color:tx.type==='credit'?C.success600:C.gray900 }}>{tx.type==='credit'?'+':'−'}{typeof tx.amount==='number'?fmtINR(tx.amount):tx.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <CompactBtn onClick={()=>viewLedger(a.no)}>{ledgerLoading===a.no?'Loading…':ledgers[a.no]?'Refresh ledger':'View ledger'}</CompactBtn>
                      <CompactBtn onClick={()=>freezeAccount(a.no)} danger={a.status==='Active'}>{freezingNo===a.no?'…':a.status==='Frozen'?'Unfreeze':'Freeze'}</CompactBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab==='transactions' && (
              <div>
                {(detail?.transactions||[{desc:'IMPS – Salary credit',amount:184200,type:'credit',rail:'IMPS',timestamp:new Date().toISOString()},{desc:'UPI – Zomato',amount:412,type:'debit',rail:'UPI',timestamp:new Date(Date.now()-3600000).toISOString()}]).map((tx:any,i:number)=>(
                  <div key={i} style={{ padding:'14px 20px', borderBottom:`1px solid ${C.gray200}`, display:'flex', alignItems:'center', gap:12 }}>
                    <div className="rounded-full flex items-center justify-center" style={{ width:36, height:36, backgroundColor:C.gray100, flexShrink:0 }}><ArrowLeftRight size={16} strokeWidth={1.5} color={C.gray700}/></div>
                    <div className="flex-1 min-w-0"><div style={{ fontSize:14, fontWeight:500, color:C.gray900 }}>{tx.desc}</div><div style={{ fontSize:12, color:C.gray500 }}>{new Date(tx.timestamp).toLocaleDateString('en-IN')} · {tx.rail}</div></div>
                    <div className="tabular" style={{ fontSize:13, fontWeight:600, color:tx.type==='credit'?C.success600:C.gray900 }}>{tx.type==='credit'?'+':'−'}{typeof tx.amount==='number'?fmtINR(tx.amount):tx.amount}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab==='kyc' && (
              <div style={{ padding:20 }}>
                {[{doc:'Aadhaar Card',num:'XXXX XXXX 4821',ok:true},{doc:'PAN Card',num:selected.pan,ok:true},{doc:'Address proof',num:'Utility bill – Jun 2026',ok:selected.kyc_status==='Approved'}].map((d,i)=>(
                  <div key={i} style={{ padding:16, border:`1px solid ${C.gray200}`, borderRadius:8, marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div className="flex items-center gap-3"><FileText size={18} strokeWidth={1.5} color={C.gray500}/><div><div style={{ fontSize:14, fontWeight:500, color:C.gray900 }}>{d.doc}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{d.num}</div></div></div>
                    <StatusBadge label={d.ok?'Verified':'Pending'} variant={d.ok?'success':'warning'}/>
                  </div>
                ))}
              </div>
            )}
            {activeTab==='alerts' && (
              <div style={{ padding:20 }}>
                {(detail?.notifications||[{event:'fraud_alert',message:'Suspicious transaction detected.',created_at:new Date().toISOString()}]).map((n:any,i:number)=>(
                  <div key={i} style={{ padding:16, border:`1px solid ${C.gray200}`, borderRadius:8, marginBottom:10, borderLeft:`4px solid ${n.event?.includes('fraud')?C.danger600:C.blue600}`, backgroundColor:n.event?.includes('fraud')?C.danger50:C.blue50 }}>
                    <div className="flex items-center gap-2 mb-1"><ShieldAlert size={14} strokeWidth={1.5} color={n.event?.includes('fraud')?C.danger600:C.blue600}/><span style={{ fontSize:13, fontWeight:600, color:n.event?.includes('fraud')?C.danger600:C.blue600 }}>{n.event?.replace(/_/g,' ')}</span></div>
                    <div style={{ fontSize:13, color:C.gray900 }}>{n.message}</div>
                    <div style={{ fontSize:12, color:C.gray500, marginTop:4 }}>{new Date(n.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding:'16px 24px', borderTop:`1px solid ${C.gray200}`, display:'flex', gap:8 }}>
            <button className="flex-1 rounded" style={{ height:40, backgroundColor:C.blue600, color:'#fff', fontSize:14, fontWeight:500 }}>Open full Customer-360</button>
            <CompactBtn>Contact log</CompactBtn>
          </div>
        </div>
      )}

      {showNew && (
        <NewCustomerModal
          onClose={()=>setShowNew(false)}
          onCreated={(c)=>{
            // Add to top of list immediately — persists until next API sync
            setCustomers(prev => [c, ...prev.filter(x=>x.cif!==c.cif)]);
            setShowNew(false);
          }}
        />
      )}
    </PageShell>
  );
}
