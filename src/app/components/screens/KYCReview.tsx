import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { CheckCircle, XCircle, Info, ChevronRight, FileText, Eye, AlertTriangle, Copy, RefreshCw, Upload, Trash2, ZoomIn } from 'lucide-react';
import { PageShell, TableToolbar, Th, Td, Pagination, SkeletonRow } from '../PageShell';
import { StatusBadge } from '../Badge';
import { Card } from '../Card';
import { C } from '../tokens';
import { api, queueAge } from '../../lib/api';
import { FB_KYC } from '../../lib/fallback';

const sV: Record<string, any> = { Submitted:'info','In Review':'warning','More Info Needed':'warning',Approved:'success',Rejected:'danger' };
const rC: Record<string, string> = { Low:C.success600, Medium:C.warning600, High:C.danger600 };

const INFO_R = ['Document image unclear — re-upload required','Address mismatch — proof of address needed','Selfie quality insufficient — retake required','PAN not linked to Aadhaar — please complete linking','Income proof required for account type','Date of birth mismatch between documents'];
const REJ_R  = ['Forged or tampered document detected','Identity mismatch — liveness failure','Sanctions / watchlist match confirmed','Duplicate CIF detected for same PAN','Non-resident — ineligible for this account type','Supporting documents not genuine'];

function DecisionPanel({ entry, onDone }: { entry: any; onDone: (updated: any) => void }) {
  const [phase, setPhase]         = useState<'idle'|'submitting'|'done'>('idle');
  const [outcome, setOutcome]     = useState('');
  const [detail, setDetail]       = useState('');
  const [infoR, setInfoR]         = useState('');
  const [infoN, setInfoN]         = useState('');
  const [rejR, setRejR]           = useState('');
  const [copied, setCopied]       = useState(false);

  const submit = async (dec: string, reason: string, note?: string) => {
    setPhase('submitting');
    try {
      const updated = await api(`/kyc/${entry.cif}/decision`, 'POST', { decision: dec, reason, note, officer: 'A. Kapoor' });
      setOutcome(dec); setDetail(reason + (note ? ` — ${note}` : ''));
      setPhase('done');
      onDone(updated);
    } catch { setPhase('idle'); }
  };

  if (phase === 'submitting') return (
    <Card style={{ padding: 24 }}>
      <div className="flex flex-col items-center" style={{ gap: 12, padding: '24px 0' }}>
        <RefreshCw size={32} strokeWidth={1.5} color={C.blue600} className="animate-spin" />
        <p style={{ fontSize: 14, color: C.gray700 }}>Processing decision…</p>
      </div>
    </Card>
  );

  if (phase === 'done') {
    const ref = `KYC-${Date.now().toString().slice(-8)}`;
    const ok = outcome==='approved', rej = outcome==='rejected';
    return (
      <Card style={{ padding: 24 }}>
        <div className="flex flex-col items-center text-center" style={{ gap: 14, padding: '16px 0' }}>
          <div className="rounded-full flex items-center justify-center" style={{ width: 64, height: 64, backgroundColor: ok?'#E9F5EE':rej?C.danger50:C.warning50 }}>
            {ok?<CheckCircle size={36} strokeWidth={2} color={C.success600}/>:rej?<XCircle size={36} strokeWidth={2} color={C.danger600}/>:<Info size={36} strokeWidth={2} color={C.warning600}/>}
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.gray900 }}>{ok?'KYC Approved':rej?'Application Rejected':'More Information Requested'}</h3>
            <p style={{ fontSize: 13, color: C.gray700, marginTop: 4 }}>{ok?`${entry.name}'s KYC approved.`:rej?'Customer notified with reason.':`Request sent to ${entry.name} via push + SMS.`}</p>
          </div>
          {!ok && <div style={{ width:'100%', padding:12, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}`, textAlign:'left' }}><div style={{ fontSize:11, fontWeight:600, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:4 }}>Reason</div><p style={{ fontSize:13, color:C.gray900 }}>{detail}</p></div>}
          <div style={{ width:'100%', padding:14, borderRadius:8, backgroundColor:C.gray50, border:`1px solid ${C.gray200}` }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.03em', marginBottom:4 }}>Reference ID</div>
            <div className="flex items-center justify-between">
              <span className="tabular" style={{ fontSize:16, fontWeight:700, color:C.gray900 }}>{ref}</span>
              <button onClick={()=>{navigator.clipboard.writeText(ref);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{ color:C.blue600, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                <Copy size={13} strokeWidth={2}/> {copied?'Copied!':'Copy'}
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.gray900, marginBottom: 16 }}>Decision</div>
      {entry.risk==='High' && (
        <div style={{ padding:12, borderRadius:8, backgroundColor:C.warning50, border:`1px solid ${C.warning600}30`, marginBottom:16, display:'flex', alignItems:'flex-start', gap:8 }}>
          <AlertTriangle size={14} strokeWidth={2} color={C.warning600} style={{ flexShrink:0, marginTop:1 }}/>
          <span style={{ fontSize:12, color:C.warning600, fontWeight:500 }}>High-risk — escalates to Compliance Officer for dual-auth.</span>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <button onClick={()=>submit('approved','KYC documents verified and approved.')} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:44, backgroundColor:C.success600, color:'#fff', fontSize:14, fontWeight:600 }}>
          <CheckCircle size={18} strokeWidth={2}/> Approve KYC
        </button>
        <div style={{ border:`1px solid ${C.gray200}`, borderRadius:8, padding:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.warning600, marginBottom:10 }}>Request more information</div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Reason <span style={{ color:C.danger600 }}>*</span></label>
          <select value={infoR} onChange={e=>setInfoR(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff', marginBottom:8 }}>
            <option value="">Select reason…</option>
            {INFO_R.map(r=><option key={r}>{r}</option>)}
          </select>
          <textarea value={infoN} onChange={e=>setInfoN(e.target.value)} placeholder="Optional note for customer…" className="w-full rounded outline-none" style={{ padding:'10px 12px', border:`1px solid ${C.gray300}`, fontSize:14, backgroundColor:'#fff', resize:'vertical', minHeight:60, marginBottom:8 }}/>
          <button onClick={()=>{if(infoR)submit('info_requested',infoR,infoN);}} disabled={!infoR} className="rounded w-full" style={{ height:36, backgroundColor:infoR?C.warning600:C.gray300, color:'#fff', fontSize:13, fontWeight:600, cursor:infoR?'pointer':'not-allowed' }}>Send request</button>
        </div>
        <div style={{ border:`1px solid ${C.gray200}`, borderRadius:8, padding:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.danger600, marginBottom:10 }}>Reject application</div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.gray700, marginBottom:4 }}>Rejection reason <span style={{ color:C.danger600 }}>*</span></label>
          <select value={rejR} onChange={e=>setRejR(e.target.value)} className="w-full rounded outline-none" style={{ height:40, padding:'0 12px', border:`1px solid ${rejR?C.danger600:C.gray300}`, fontSize:14, backgroundColor:'#fff', marginBottom:8 }}>
            <option value="">Select reason (mandatory)…</option>
            {REJ_R.map(r=><option key={r}>{r}</option>)}
          </select>
          {rejR && <div style={{ padding:10, borderRadius:6, backgroundColor:C.danger50, border:`1px solid ${C.danger600}20`, marginBottom:8 }}><span style={{ fontSize:12, color:C.danger600, fontWeight:500 }}>⚠ Irreversible. Customer will be notified.</span></div>}
          <button onClick={()=>{if(rejR)submit('rejected',rejR);}} disabled={!rejR} className="rounded w-full" style={{ height:36, backgroundColor:rejR?C.danger600:C.gray300, color:'#fff', fontSize:13, fontWeight:600, cursor:rejR?'pointer':'not-allowed' }}>Reject application</button>
        </div>
      </div>
    </Card>
  );
}

// ── Document slot types ──────────────────────────────────────
type DocSlot = {
  id: string;
  label: string;
  required: boolean;
  customerFile: string | null;  // base64 or null
  adminFile: string | null;
  adminFileName: string | null;
  adminFileType: string | null;
  status: 'missing' | 'customer_uploaded' | 'admin_uploaded' | 'verified';
  notes: string;
};

const DOC_TYPES = [
  { id:'aadhaar_front', label:'Aadhaar Card (front)', required:true },
  { id:'aadhaar_back',  label:'Aadhaar Card (back)',  required:true },
  { id:'pan',           label:'PAN Card',              required:true },
  { id:'selfie',        label:'Live selfie / photo',   required:true },
  { id:'address',       label:'Address proof',         required:false },
  { id:'income',        label:'Income proof (ITR / Form 16)', required:false },
];

function DocumentUploadZone({ doc, onUpload, onRemove, onNote, onVerify }: {
  doc: DocSlot;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onNote: (n: string) => void;
  onVerify: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState<string|null>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const activeFile = doc.adminFile || doc.customerFile;
  const activeLabel = doc.adminFile ? doc.adminFileName : (doc.customerFile ? 'Customer upload' : null);
  const isImage = doc.adminFileType?.startsWith('image/') || doc.customerFile?.startsWith('data:image');

  const borderColor = dragging ? C.blue600 : doc.status==='verified' ? C.success600 : doc.status==='admin_uploaded' ? C.blue600 : doc.status==='customer_uploaded' ? C.warning600 : C.gray300;
  const bgColor = dragging ? C.blue50 : doc.status==='verified' ? '#E9F5EE' : '#fff';

  return (
    <>
      <div style={{ marginBottom:16 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize:13, fontWeight:600, color:C.gray900 }}>{doc.label}</span>
            {doc.required && <span style={{ fontSize:11, color:C.danger600 }}>Required</span>}
          </div>
          <div className="flex items-center gap-2">
            {doc.status==='verified' && (
              <span className="inline-flex items-center gap-1" style={{ fontSize:12, fontWeight:600, color:C.success600 }}>
                <CheckCircle size={13} strokeWidth={2}/> Verified
              </span>
            )}
            {doc.status==='admin_uploaded' && (
              <button onClick={onVerify} className="rounded flex items-center gap-1" style={{ height:26, padding:'0 8px', backgroundColor:C.success600, color:'#fff', fontSize:12, fontWeight:500 }}>
                <CheckCircle size={12} strokeWidth={2}/> Mark verified
              </button>
            )}
            {doc.status==='customer_uploaded' && (
              <button onClick={onVerify} className="rounded flex items-center gap-1" style={{ height:26, padding:'0 8px', backgroundColor:C.success600, color:'#fff', fontSize:12, fontWeight:500 }}>
                <CheckCircle size={12} strokeWidth={2}/> Verify
              </button>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={handleDrop}
          style={{ border:`2px dashed ${borderColor}`, borderRadius:8, backgroundColor:bgColor, transition:'all 150ms', overflow:'hidden' }}
        >
          {activeFile ? (
            <div style={{ position:'relative' }}>
              {isImage ? (
                <img src={activeFile} alt={doc.label} style={{ width:'100%', height:140, objectFit:'cover', display:'block' }}/>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2" style={{ height:100, backgroundColor:C.blue50 }}>
                  <FileText size={32} strokeWidth={1} color={C.blue600}/>
                  <span style={{ fontSize:13, fontWeight:500, color:C.blue600 }}>{activeLabel}</span>
                </div>
              )}
              {/* Overlay actions */}
              <div className="flex items-center gap-2" style={{ position:'absolute', top:8, right:8 }}>
                {isImage && (
                  <button onClick={()=>setLightbox(activeFile)} className="rounded flex items-center justify-center" style={{ width:28, height:28, backgroundColor:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}>
                    <ZoomIn size={14} strokeWidth={2} color="#fff"/>
                  </button>
                )}
                <button onClick={onRemove} className="rounded flex items-center justify-center" style={{ width:28, height:28, backgroundColor:'rgba(220,38,38,0.85)', backdropFilter:'blur(4px)' }}>
                  <Trash2 size={14} strokeWidth={2} color="#fff"/>
                </button>
              </div>
              {/* Status strip */}
              <div style={{ padding:'6px 12px', backgroundColor:doc.status==='verified'?C.success600:doc.adminFile?C.blue600:C.warning600, display:'flex', alignItems:'center', gap:6 }}>
                {doc.status==='verified'
                  ? <><CheckCircle size={13} strokeWidth={2} color="#fff"/><span style={{ fontSize:12, fontWeight:600, color:'#fff' }}>Verified by admin</span></>
                  : doc.adminFile
                  ? <><Upload size={13} strokeWidth={2} color="#fff"/><span style={{ fontSize:12, fontWeight:500, color:'#fff' }}>Admin upload — {activeLabel}</span></>
                  : <><FileText size={13} strokeWidth={2} color="#fff"/><span style={{ fontSize:12, fontWeight:500, color:'#fff' }}>Customer uploaded</span></>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2" style={{ height:110, cursor:'pointer' }} onClick={()=>inputRef.current?.click()}>
              <div className="rounded-full flex items-center justify-center" style={{ width:36, height:36, backgroundColor:dragging?C.blue600:C.gray200 }}>
                <Upload size={18} strokeWidth={1.5} color={dragging?'#fff':C.gray500}/>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.gray700 }}>Drop file here or <span style={{ color:C.blue600 }}>browse</span></div>
                <div style={{ fontSize:11, color:C.gray500 }}>PDF, JPG, PNG · max 10 MB</div>
              </div>
            </div>
          )}
        </div>

        {/* Admin note */}
        <input
          value={doc.notes}
          onChange={e=>onNote(e.target.value)}
          placeholder="Admin note on this document (optional)…"
          className="w-full rounded outline-none"
          style={{ marginTop:6, height:34, padding:'0 10px', border:`1px solid ${C.gray200}`, fontSize:12, color:C.gray700, backgroundColor:C.gray50 }}
        />

        {/* Hidden file input */}
        <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={handleChange}/>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={()=>setLightbox(null)} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
          <img src={lightbox} alt="Document" style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:8, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}/>
          <button onClick={()=>setLightbox(null)} style={{ position:'absolute', top:20, right:24, color:'#fff', fontSize:28, fontWeight:300, background:'none', border:'none' }}>×</button>
        </div>
      )}
    </>
  );
}

function CompareView({ entry, onBack, onDone }: { entry: any; onBack: ()=>void; onDone: (u: any)=>void }) {
  const [docTab, setDocTab] = useState<'customer'|'admin'>('customer');
  const [docs, setDocs] = useState<DocSlot[]>(
    DOC_TYPES.map(dt => ({
      id: dt.id, label: dt.label, required: dt.required,
      customerFile: null, adminFile: null, adminFileName: null, adminFileType: null,
      status: 'missing' as const, notes: '',
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const fields = [
    { label:'Full name', ext:entry.name?.toUpperCase(), dec:entry.name, ok:true },
    { label:'Date of birth', ext:'12/03/1990', dec:'12 Mar 1990', ok:true },
    { label:'Aadhaar', ext:'XXXX XXXX 4821', dec:'XXXX XXXX 4821', ok:true },
    { label:'Gender', ext:'MALE', dec:'Male', ok:true },
    { label:'PAN', ext:'Verified', dec:'Verified', ok:true },
  ];

  const updateDoc = (id: string, patch: Partial<DocSlot>) => {
    setDocs(prev => prev.map(d => d.id===id ? { ...d, ...patch } : d));
    setSaved(false);
  };

  const handleUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      updateDoc(id, {
        adminFile: dataUrl,
        adminFileName: file.name,
        adminFileType: file.type,
        status: 'admin_uploaded',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (id: string) => {
    const d = docs.find(x=>x.id===id);
    updateDoc(id, {
      adminFile: null, adminFileName: null, adminFileType: null,
      status: d?.customerFile ? 'customer_uploaded' : 'missing',
    });
  };

  const handleVerify = (id: string) => updateDoc(id, { status: 'verified' });

  const saveDocuments = async () => {
    setSaving(true);
    try {
      // Save document metadata (not binary) to mark progress
      const metadata = docs.map(d => ({ id:d.id, label:d.label, status:d.status, notes:d.notes, adminFileName:d.adminFileName }));
      await api(`/kyc/${entry.cif}/decision`, 'POST', {
        decision: 'info_requested',
        reason: 'Documents uploaded by admin — pending verification',
        note: `Admin uploaded ${docs.filter(d=>d.adminFile).length} document(s): ${docs.filter(d=>d.adminFile).map(d=>d.label).join(', ')}`,
        officer: 'A. Kapoor',
        documents: metadata,
      });
      setSaved(true);
    } catch { setSaved(false); }
    finally { setSaving(false); }
  };

  const verifiedCt = docs.filter(d=>d.status==='verified').length;
  const uploadedCt = docs.filter(d=>d.adminFile||d.customerFile).length;
  const requiredDocs = docs.filter(d=>d.required);
  const allRequiredUploaded = requiredDocs.every(d=>d.adminFile||d.customerFile);

  return (
    <PageShell title={`KYC review — ${entry.name}`} subtitle={`${entry.cif} · ${entry.channel} · Age: ${queueAge(entry.submitted_at)} · Liveness: ${entry.score}%`}
      actions={<div className="flex items-center gap-3"><StatusBadge label={entry.status} variant={sV[entry.status]}/><button onClick={onBack} style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, borderRadius:6, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}>← Back to queue</button></div>}
    >
      <div className="grid gap-4" style={{ gridTemplateColumns:'1fr 1fr' }}>

        {/* Left column — Documents */}
        <Card style={{ padding:0 }}>
          {/* Tabs: Customer docs vs Admin upload */}
          <div className="flex items-center justify-between" style={{ padding:'12px 20px', borderBottom:`1px solid ${C.gray200}` }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:C.gray900 }}>Documents</h3>
            <div className="flex items-center gap-2">
              <div className="flex rounded overflow-hidden" style={{ border:`1px solid ${C.gray200}` }}>
                {([{k:'customer',l:'Customer submitted'},{k:'admin',l:'Admin upload'}] as const).map(t=>(
                  <button key={t.k} onClick={()=>setDocTab(t.k)} style={{ padding:'6px 14px', fontSize:12, fontWeight:500, backgroundColor:docTab===t.k?C.blue600:'#fff', color:docTab===t.k?'#fff':C.gray700, border:'none' }}>
                    {t.l}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:12, color:C.gray500 }}>{uploadedCt}/{docs.length} uploaded · {verifiedCt} verified</div>
            </div>
          </div>

          <div style={{ padding:20 }}>
            {docTab==='customer' ? (
              <>
                {/* Simulated customer-submitted documents */}
                {['Aadhaar (front)', 'Aadhaar (back)', 'PAN Card'].map((doc, i) => (
                  <div key={i} style={{ marginBottom:16 }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize:13, fontWeight:600, color:C.gray900 }}>{doc}</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge label={i < 2 ? 'Submitted' : 'Submitted'} variant="info"/>
                      </div>
                    </div>
                    <div className="rounded flex flex-col items-center justify-center gap-2" style={{ height:120, backgroundColor:C.gray100, border:`1px solid ${C.gray200}`, position:'relative' }}>
                      <FileText size={28} strokeWidth={1} color={C.gray500}/>
                      <span style={{ fontSize:12, color:C.gray500 }}>{doc}</span>
                      <div className="flex gap-2">
                        <button className="rounded flex items-center gap-1" style={{ height:28, padding:'0 10px', backgroundColor:C.blue600, color:'#fff', fontSize:12, fontWeight:500 }}>
                          <Eye size={12} strokeWidth={2}/> View full
                        </button>
                        <button onClick={()=>setDocTab('admin')} className="rounded flex items-center gap-1" style={{ height:28, padding:'0 10px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:12, fontWeight:500, color:C.gray700 }}>
                          <Upload size={12} strokeWidth={2}/> Replace
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Liveness score */}
                <div style={{ padding:14, borderRadius:8, backgroundColor:C.blue50, border:`1px solid ${C.blue600}20` }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.blue600, marginBottom:4 }}>Liveness & selfie match</div>
                  <div className="flex items-center justify-between mb-2"><span style={{ fontSize:13, color:C.gray900 }}>Score</span><span className="tabular" style={{ fontSize:22, fontWeight:700, color:entry.score>=80?C.success600:C.warning600 }}>{entry.score}%</span></div>
                  <div style={{ height:8, backgroundColor:C.gray200, borderRadius:999 }}><div style={{ height:'100%', width:`${entry.score}%`, backgroundColor:entry.score>=80?C.success600:C.warning600, borderRadius:999 }}/></div>
                  <div style={{ fontSize:12, color:C.gray500, marginTop:4 }}>Threshold 75% · {entry.score>=75?<span style={{ color:C.success600, fontWeight:600 }}>Pass</span>:<span style={{ color:C.danger600, fontWeight:600 }}>Fail</span>}</div>
                </div>
              </>
            ) : (
              <>
                {/* Progress bar */}
                <div style={{ padding:14, borderRadius:8, backgroundColor:allRequiredUploaded?'#E9F5EE':C.blue50, border:`1px solid ${allRequiredUploaded?C.success600:C.blue600}20`, marginBottom:16 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize:13, fontWeight:600, color:allRequiredUploaded?C.success600:C.blue600 }}>
                      {allRequiredUploaded ? '✓ All required documents uploaded' : `Upload documents on behalf of customer`}
                    </span>
                    <span className="tabular" style={{ fontSize:12, color:C.gray500 }}>{uploadedCt} / {docs.length}</span>
                  </div>
                  <div style={{ height:6, backgroundColor:C.gray200, borderRadius:999 }}>
                    <div style={{ height:'100%', width:`${(uploadedCt/docs.length)*100}%`, backgroundColor:allRequiredUploaded?C.success600:C.blue600, borderRadius:999, transition:'width 300ms' }}/>
                  </div>
                  <div style={{ fontSize:11, color:C.gray500, marginTop:6 }}>
                    Required: {requiredDocs.filter(d=>d.adminFile||d.customerFile).length}/{requiredDocs.length} ·
                    Verified: {verifiedCt}/{docs.length} ·
                    Drop files directly onto a slot or click to browse
                  </div>
                </div>

                {/* Document slots */}
                {docs.map(doc => (
                  <DocumentUploadZone
                    key={doc.id}
                    doc={doc}
                    onUpload={file => handleUpload(doc.id, file)}
                    onRemove={() => handleRemove(doc.id)}
                    onNote={n => updateDoc(doc.id, { notes: n })}
                    onVerify={() => handleVerify(doc.id)}
                  />
                ))}

                {/* Save button */}
                <div style={{ marginTop:4 }}>
                  {saved ? (
                    <div className="flex items-center gap-2 rounded" style={{ padding:'10px 14px', backgroundColor:'#E9F5EE', border:`1px solid ${C.success600}30` }}>
                      <CheckCircle size={16} strokeWidth={2} color={C.success600}/>
                      <span style={{ fontSize:13, fontWeight:600, color:C.success600 }}>Documents saved and linked to this KYC case.</span>
                    </div>
                  ) : (
                    <button onClick={saveDocuments} disabled={saving||uploadedCt===0} className="rounded flex items-center justify-center gap-2 w-full" style={{ height:40, backgroundColor:uploadedCt>0?C.blue600:C.gray300, color:'#fff', fontSize:14, fontWeight:600, cursor:uploadedCt>0?'pointer':'not-allowed' }}>
                      {saving ? <><RefreshCw size={16} className="animate-spin"/> Saving…</> : <><Upload size={16} strokeWidth={2}/> Save {uploadedCt} uploaded document{uploadedCt!==1?'s':''}</>}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Right column — Fields + Decision */}
        <div className="flex flex-col gap-4">
          <Card style={{ padding:0 }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.gray200}` }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:C.gray900 }}>Extracted vs. declared</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'100px 1fr 1fr 28px', gap:8, padding:'8px 16px', backgroundColor:C.gray100 }}>
              {['Field','Extracted','Declared',''].map((h,i)=><div key={i} style={{ fontSize:11, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500 }}>{h}</div>)}
            </div>
            {fields.map((f,i)=>(
              <div key={i} style={{ display:'grid', gridTemplateColumns:'100px 1fr 1fr 28px', alignItems:'center', gap:8, padding:'10px 16px', borderTop:`1px solid ${C.gray200}` }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.gray700 }}>{f.label}</div>
                <div className="tabular" style={{ fontSize:13, color:C.gray900 }}>{f.ext}</div>
                <div className="tabular" style={{ fontSize:13, color:C.gray700 }}>{f.dec}</div>
                {f.ok?<CheckCircle size={16} strokeWidth={2} color={C.success600}/>:<XCircle size={16} strokeWidth={2} color={C.danger600}/>}
              </div>
            ))}
            <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.gray200}`, backgroundColor:'#E9F5EE' }}>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} strokeWidth={2} color={C.success600}/>
                <span style={{ fontSize:13, fontWeight:600, color:C.success600 }}>All {fields.length} fields match</span>
              </div>
            </div>
          </Card>

          {/* Document checklist summary */}
          <Card style={{ padding:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.gray900, marginBottom:10 }}>Document checklist</div>
            {docs.map(d=>(
              <div key={d.id} className="flex items-center justify-between" style={{ padding:'6px 0', borderBottom:`1px solid ${C.gray200}` }}>
                <div className="flex items-center gap-2">
                  <div style={{ width:6, height:6, borderRadius:999, backgroundColor:d.status==='verified'?C.success600:d.status.includes('uploaded')?C.blue600:d.required?C.danger600:C.gray300, flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:C.gray900 }}>{d.label}</span>
                  {d.required && <span style={{ fontSize:10, color:C.danger600, fontWeight:600 }}>REQ</span>}
                </div>
                <div className="flex items-center gap-2">
                  {d.status==='verified' && <CheckCircle size={14} strokeWidth={2} color={C.success600}/>}
                  {d.status==='admin_uploaded' && <span style={{ fontSize:11, fontWeight:600, color:C.blue600 }}>Admin upload</span>}
                  {d.status==='customer_uploaded' && <span style={{ fontSize:11, fontWeight:600, color:C.warning600 }}>Customer</span>}
                  {d.status==='missing' && <span style={{ fontSize:11, color:d.required?C.danger600:C.gray400 }}>Missing</span>}
                </div>
              </div>
            ))}
            <button onClick={()=>setDocTab('admin')} className="rounded w-full mt-3 flex items-center justify-center gap-2" style={{ height:34, border:`1px solid ${C.blue600}`, backgroundColor:C.blue50, color:C.blue600, fontSize:13, fontWeight:500 }}>
              <Upload size={14} strokeWidth={2}/> Upload missing documents
            </button>
          </Card>

          <DecisionPanel entry={entry} onDone={u=>{onDone(u);onBack();}}/>
        </div>
      </div>
    </PageShell>
  );
}

export function KYCReview() {
  const [queue, setQueue]   = useState<any[]>(FB_KYC);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [view, setView]     = useState<'list'|'compare'>('list');
  const [loading, setLoading] = useState(false);
  const [chipFilter, setChipFilter] = useState('All');

  const load = () => {
    setLoading(true);
    api('/kyc').then(data => { if (Array.isArray(data) && data.length > 0) setQueue(data); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const filtered = queue.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) || r.cif?.toLowerCase().includes(search.toLowerCase());
    const matchChip = chipFilter==='All' ||
      (chipFilter==='High risk' && r.risk==='High') ||
      (chipFilter==='Submitted' && r.status==='Submitted') ||
      (chipFilter==='In Review' && r.status==='In Review');
    return matchSearch && matchChip;
  });

  if (view==='compare'&&selected) return <CompareView entry={selected} onBack={()=>{setView('list');setSelected(null);}} onDone={updated=>{setQueue(q=>q.map(e=>e.cif===updated.cif?updated:e));setView('list');setSelected(null);}}/>;

  const pending=filtered.filter(q=>['Submitted','In Review'].includes(q.status)).length;
  const approved=filtered.filter(q=>q.status==='Approved').length;
  const rejected=filtered.filter(q=>q.status==='Rejected').length;

  return (
    <PageShell title="KYC review queue" subtitle="Review customer identity verifications. High-risk auto-escalates to Compliance."
      actions={<div className="flex items-center gap-2"><button onClick={load} className="rounded flex items-center gap-2" style={{ height:40, padding:'0 14px', border:`1px solid ${C.gray300}`, backgroundColor:'#fff', fontSize:14, color:C.gray900 }}><RefreshCw size={14} strokeWidth={1.5}/> Refresh</button><div style={{ padding:'6px 12px', borderRadius:6, backgroundColor:C.warning50, border:`1px solid ${C.warning600}30`, fontSize:13, fontWeight:600, color:C.warning600 }}>SLA target: 4h</div></div>}
    >
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        {[{label:'In queue',value:loading?'…':filtered.length,color:C.gray900},{label:'Pending decision',value:loading?'…':pending,color:C.warning600},{label:'Approved',value:loading?'…':approved,color:C.success600},{label:'Rejected',value:loading?'…':rejected,color:C.danger600}].map((k,i)=>(
          <Card key={i} style={{ padding:20 }}>
            <div style={{ fontSize:12, fontWeight:600, letterSpacing:'0.03em', textTransform:'uppercase', color:C.gray500, marginBottom:6 }}>{k.label}</div>
            <div className="tabular" style={{ fontSize:28, fontWeight:700, color:k.color }}>{k.value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <TableToolbar search={search} onSearch={setSearch} placeholder="Name or CIF…" filters={
          <div className="flex items-center gap-2">{['All','High risk','Submitted','In Review'].map((f)=>(
            <button key={f} onClick={()=>setChipFilter(f)} className="rounded-full" style={{ height:32, padding:'0 12px', fontSize:13, fontWeight:500, border:`1px solid ${f===chipFilter?C.blue600:C.gray300}`, backgroundColor:f===chipFilter?C.blue50:'#fff', color:f===chipFilter?C.blue600:C.gray700 }}>{f}</button>
          ))}</div>
        }/>
        <table className="w-full" style={{ borderCollapse:'collapse' }}>
          <thead><tr><Th>Customer</Th><Th>Channel</Th><Th>Risk</Th><Th>Documents</Th><Th>Liveness</Th><Th>Age in queue</Th><Th>Status</Th><Th></Th></tr></thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={8}/>) :
             filtered.map((r:any)=>(
              <tr key={r.cif} onClick={()=>{setSelected(r);setView('compare');}} style={{ borderTop:`1px solid ${C.gray200}`, height:52, cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.backgroundColor=C.gray50}} onMouseLeave={e=>{e.currentTarget.style.backgroundColor='#fff'}}>
                <Td><div style={{ fontWeight:500, color:C.gray900 }}>{r.name}</div><div className="tabular" style={{ fontSize:12, color:C.gray500 }}>{r.cif}</div></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{r.channel}</span></Td>
                <Td><span className="inline-flex items-center gap-1.5" style={{ fontSize:13 }}><span className="rounded-full" style={{ width:6, height:6, backgroundColor:rC[r.risk], display:'inline-block' }}/><span style={{ color:rC[r.risk], fontWeight:500 }}>{r.risk}</span></span></Td>
                <Td><span style={{ fontSize:13, color:C.gray700 }}>{r.docs}</span></Td>
                <Td><div className="flex items-center gap-2"><div style={{ height:6, width:64, backgroundColor:C.gray200, borderRadius:999 }}><div style={{ height:'100%', width:`${r.score}%`, backgroundColor:r.score>=80?C.success600:C.warning600, borderRadius:999 }}/></div><span className="tabular" style={{ fontSize:12, fontWeight:600, color:r.score>=80?C.success600:C.warning600 }}>{r.score}%</span></div></Td>
                <Td><span className="tabular" style={{ fontSize:13, color:C.gray700 }}>{queueAge(r.submitted_at)}</span></Td>
                <Td><StatusBadge label={r.status} variant={sV[r.status]}/></Td>
                <Td right>
                  <button onClick={e=>{e.stopPropagation();setSelected(r);setView('compare');}} className="inline-flex items-center gap-1 rounded" style={{ height:32, padding:'0 12px', backgroundColor:['Approved','Rejected'].includes(r.status)?C.gray100:C.blue600, color:['Approved','Rejected'].includes(r.status)?C.gray700:'#fff', fontSize:13, fontWeight:500 }}>
                    {['Approved','Rejected'].includes(r.status)?'View':'Review'} <ChevronRight size={14} strokeWidth={2}/>
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination from={1} to={filtered.length} total={filtered.length}/>
      </Card>
    </PageShell>
  );
}
