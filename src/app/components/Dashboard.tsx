import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { StatusBadge } from './Badge';
import { C } from './tokens';
import { api, fmtINR, fmtDt } from '../lib/api';

const txVariant: Record<string, any> = { Completed:'success', Processing:'info', Flagged:'danger', Screening:'warning', Failed:'danger', Disputed:'warning' };

export function Dashboard() {
  const [stats, setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api('/dashboard/stats').then(setStats).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const liveFeed: any[] = stats?.liveFeed || [];
  const topFraud: any[] = stats?.topFraud || [];

  return (
    <div style={{ backgroundColor: C.gray100, minHeight: '100%' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: 24 }}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div style={{ fontSize: 12, color: C.gray500, marginBottom: 4 }}>{fmtDt(new Date().toISOString())} IST</div>
            <h1 style={{ fontSize: 28, lineHeight: '36px', fontWeight: 600, color: C.gray900 }}>Operations dashboard</h1>
            <p style={{ fontSize: 14, color: C.gray700, marginTop: 4 }}>Live queues, transactions, and open risk across your branch.</p>
          </div>
          <button onClick={load} className="rounded flex items-center gap-2" style={{ height: 40, padding: '0 14px', border: `1px solid ${C.gray300}`, backgroundColor: '#fff', fontSize: 14, color: C.gray900 }}>
            <RefreshCw size={14} strokeWidth={1.5} /> Refresh
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? [0,1,2,3].map(i => (
            <Card key={i} style={{ padding: 20 }}>
              <div className="animate-pulse rounded mb-3" style={{ height: 10, backgroundColor: C.gray200, width: '60%' }} />
              <div className="animate-pulse rounded" style={{ height: 32, backgroundColor: C.gray200 }} />
            </Card>
          )) : [
            { label:'KYC pending review',  value:String(stats?.kycPending ?? 0), delta:'+6',   dir:'up',   color:C.warning600 },
            { label:'Loan applications',   value:String(stats?.loanQueue ?? 0),  delta:'+3',   dir:'up',   color:C.success600 },
            { label:'Open fraud alerts',   value:String(stats?.fraudOpen ?? 0),  delta:'−2',   dir:'down', color:C.success600 },
            { label:'Disbursed (total)',   value:fmtINR(stats?.disbursed ?? 0),  delta:'+12%', dir:'up',   color:C.success600 },
          ].map((k, i) => (
            <Card key={i} style={{ padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: C.gray500, marginBottom: 8 }}>{k.label}</div>
              <div className="tabular" style={{ fontSize: i===3?20:32, fontWeight: 700, color: C.gray900 }}>{k.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                {k.dir==='up' ? <ArrowUpRight size={14} strokeWidth={2} color={k.color}/> : <ArrowDownRight size={14} strokeWidth={2} color={k.color}/>}
                <span className="tabular" style={{ fontSize: 13, fontWeight: 600, color: k.color }}>{k.delta}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '1fr 400px' }}>
          {/* Live feed */}
          <Card>
            <CardHeader title="Live transaction feed" action={
              <div className="flex items-center gap-2">
                <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: C.success600, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: C.gray500 }}>Live</span>
              </div>
            } />
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {loading ? [0,1,2,3].map(i => (
                <div key={i} style={{ padding: '14px 20px', borderTop: i>0?`1px solid ${C.gray200}`:'none' }}>
                  <div className="animate-pulse rounded mb-2" style={{ height: 12, backgroundColor: C.gray200, width: '70%' }} />
                  <div className="animate-pulse rounded" style={{ height: 10, backgroundColor: C.gray200, width: '40%' }} />
                </div>
              )) : liveFeed.map((tx: any, i: number) => (
                <div key={i} className="flex items-start gap-3" style={{ padding: '12px 20px', borderTop: i>0?`1px solid ${C.gray200}`:'none' }}>
                  <div className="tabular shrink-0" style={{ fontSize: 11, color: C.gray500, paddingTop: 2, width: 40 }}>
                    {new Date(tx.timestamp).toLocaleTimeString('en-IN',{ hour:'2-digit', minute:'2-digit' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.gray900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.desc}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ padding: '1px 6px', borderRadius: 4, backgroundColor: C.gray100, fontSize: 11, fontWeight: 600, color: C.gray700 }}>{tx.rail}</span>
                      <StatusBadge label={tx.status} variant={txVariant[tx.status]||'neutral'} />
                    </div>
                  </div>
                  <div className="tabular shrink-0" style={{ fontSize: 13, fontWeight: 600, color: tx.type==='credit'?C.success600:C.gray900 }}>
                    {tx.type==='credit'?'+':'−'}{fmtINR(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top fraud */}
          <Card>
            <CardHeader title="Top fraud alerts" action={<button style={{ color: C.blue600, fontSize: 13, fontWeight: 500 }}>View all</button>} />
            <div>
              {loading ? [0,1,2,3].map(i => (
                <div key={i} style={{ padding: '14px 20px', borderTop: i>0?`1px solid ${C.gray200}`:'none' }}>
                  <div className="animate-pulse rounded mb-2" style={{ height: 12, backgroundColor: C.gray200, width: '60%' }} />
                  <div className="animate-pulse rounded" style={{ height: 10, backgroundColor: C.gray200, width: '40%' }} />
                </div>
              )) : topFraud.map((f: any, i: number) => {
                const sc = f.severity==='Critical'?C.danger600:f.severity==='High'?C.warning600:C.gray700;
                return (
                  <div key={i} style={{ padding: '14px 20px', borderTop: i>0?`1px solid ${C.gray200}`:'none', borderLeft: `4px solid ${sc}` }}>
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>{f.customer}</div>
                        <div style={{ fontSize: 12, color: C.gray700, marginTop: 2 }}>{f.rule}</div>
                      </div>
                      <StatusBadge label={f.status} variant={f.status==='Cleared'?'success':f.status==='Open'?'danger':'warning'} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: sc }}><AlertCircle size={12} strokeWidth={2}/>{f.severity}</span>
                      {f.amount>0 && <span className="tabular" style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>{fmtINR(f.amount)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Footer stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Transactions today', value:loading?'…':String(stats?.txCount??0),           sub:'across all rails',      icon:TrendingUp  },
            { label:'AML alerts open',    value:'4',                                                sub:'2 critical open',       icon:AlertCircle },
            { label:'Audit events',       value:loading?'…':String(stats?.auditRecent?.length??0), sub:'recent staff actions',  icon:TrendingUp  },
          ].map((s, i) => (
            <Card key={i} style={{ padding: 20 }} className="flex items-center gap-4">
              <div className="rounded flex items-center justify-center shrink-0" style={{ width: 40, height: 40, backgroundColor: C.blue50, color: C.blue600 }}>
                <s.icon size={20} strokeWidth={1.5}/>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.gray500, fontWeight: 500 }}>{s.label}</div>
                <div className="tabular" style={{ fontSize: 20, fontWeight: 700, color: C.gray900 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: C.gray500 }}>{s.sub}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
