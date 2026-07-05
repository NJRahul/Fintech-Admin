import { useState, useEffect } from 'react';
import { Sidebar, NavKey } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { CustomerSearch } from './components/screens/CustomerSearch';
import { KYCReview } from './components/screens/KYCReview';
import { AccountOps } from './components/screens/AccountOps';
import { LoansQueue } from './components/screens/LoansQueue';
import { EMIOperations } from './components/screens/EMIOperations';
import { Collections } from './components/screens/Collections';
import { PaymentOps } from './components/screens/PaymentOps';
import { SwiftSepa } from './components/screens/SwiftSepa';
import { FraudAlerts } from './components/screens/FraudAlerts';
import { Disputes } from './components/screens/Disputes';
import { AMLSanctions } from './components/screens/AMLSanctions';
import { Reports } from './components/screens/Reports';
import { AuditTrail } from './components/screens/AuditTrail';
import { StaffAdmin } from './components/screens/StaffAdmin';
import { C } from './components/tokens';
import { api } from './lib/api';

function Screen({ active }: { active: NavKey }) {
  switch (active) {
    case 'dashboard':   return <Dashboard />;
    case 'customers':   return <CustomerSearch />;
    case 'kyc':         return <KYCReview />;
    case 'accounts':    return <AccountOps />;
    case 'loans':       return <LoansQueue />;
    case 'emi':         return <EMIOperations />;
    case 'collections': return <Collections />;
    case 'payments':    return <PaymentOps />;
    case 'swift':       return <SwiftSepa />;
    case 'fraud':       return <FraudAlerts />;
    case 'disputes':    return <Disputes />;
    case 'aml':         return <AMLSanctions />;
    case 'reports':     return <Reports />;
    case 'audit':       return <AuditTrail />;
    case 'admin':       return <StaffAdmin />;
    default:            return <Dashboard />;
  }
}

export default function App() {
  const [active, setActive] = useState<NavKey>('dashboard');
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    api('/seed', 'POST').finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: '100vh', backgroundColor: C.navy900, gap: 20 }}>
        <div className="rounded flex items-center justify-center" style={{ width: 56, height: 56, backgroundColor: C.blue600 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Meridian Bank — Staff Portal</div>
        <div style={{ color: C.gray500, fontSize: 14 }}>Initialising data…</div>
        <div style={{ width: 200, height: 3, backgroundColor: C.navy800, borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
          <div className="animate-pulse" style={{ height: '100%', width: '60%', backgroundColor: C.blue600, borderRadius: 999 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ height: '100vh', backgroundColor: C.gray100, color: C.gray900, fontFamily: "'Inter', 'SF Pro', 'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar active={active} onSelect={setActive} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <Screen active={active} />
        </main>
      </div>
    </div>
  );
}
