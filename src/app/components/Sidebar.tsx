import {
  LayoutDashboard,
  Users,
  UserCheck,
  Landmark,
  FileText,
  Wallet,
  ArrowLeftRight,
  ShieldAlert,
  Fingerprint,
  Scale,
  FileBarChart,
  Settings,
  ShieldCheck,
  History,
} from 'lucide-react';
import { C } from './tokens';

export type NavKey =
  | 'dashboard'
  | 'customers'
  | 'kyc'
  | 'accounts'
  | 'loans'
  | 'emi'
  | 'collections'
  | 'payments'
  | 'swift'
  | 'fraud'
  | 'disputes'
  | 'aml'
  | 'audit'
  | 'reports'
  | 'admin';

type Item = { key: NavKey; label: string; icon: any; count?: number };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: '',
    items: [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'CUSTOMERS',
    items: [
      { key: 'customers', label: 'Customer Search', icon: Users },
      { key: 'kyc', label: 'KYC Review', icon: UserCheck, count: 38 },
    ],
  },
  {
    label: 'LOANS',
    items: [
      { key: 'loans', label: 'Origination Queue', icon: FileText, count: 24 },
      { key: 'emi', label: 'EMI Operations', icon: Landmark },
      { key: 'collections', label: 'Collections', icon: Wallet, count: 12 },
    ],
  },
  {
    label: 'PAYMENTS',
    items: [
      { key: 'payments', label: 'Payment Ops', icon: ArrowLeftRight },
      { key: 'swift', label: 'SWIFT / SEPA', icon: FileBarChart, count: 6 },
    ],
  },
  {
    label: 'RISK & FRAUD',
    items: [
      { key: 'fraud', label: 'Fraud Alerts', icon: ShieldAlert, count: 17 },
      { key: 'disputes', label: 'Disputes', icon: Fingerprint, count: 9 },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { key: 'aml', label: 'AML / Sanctions', icon: Scale, count: 4 },
      { key: 'reports', label: 'Regulatory Reports', icon: FileBarChart },
      { key: 'audit', label: 'Audit Trail', icon: History },
      { key: 'accounts', label: 'Account Ops', icon: ShieldCheck },
    ],
  },
  {
    label: 'ADMIN',
    items: [{ key: 'admin', label: 'Staff & Roles', icon: Settings }],
  },
];

export function Sidebar({ active, onSelect }: { active: NavKey; onSelect: (k: NavKey) => void }) {
  return (
    <aside
      className="flex flex-col shrink-0"
      style={{ width: 248, backgroundColor: C.navy900, height: '100vh' }}
    >
      {/* Logo area */}
      <div
        className="flex items-center gap-2 px-5"
        style={{ height: 64, borderBottom: `1px solid ${C.navy800}` }}
      >
        <div
          className="flex items-center justify-center rounded"
          style={{ width: 28, height: 28, backgroundColor: C.blue600 }}
        >
          <Landmark size={16} color="#fff" strokeWidth={2} />
        </div>
        <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, letterSpacing: 0.2 }}>
          Meridian Bank
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {groups.map((g, gi) => (
          <div key={gi} className="mb-2">
            {g.label && (
              <div
                className="px-5 pt-3 pb-1"
                style={{
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: C.gray500,
                }}
              >
                {g.label}
              </div>
            )}
            {g.items.map((item) => {
              const isActive = item.key === active;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  className="w-full flex items-center gap-3 relative transition-colors"
                  style={{
                    height: 40,
                    padding: '0 20px',
                    color: isActive ? '#fff' : C.gray300,
                    backgroundColor: isActive ? C.navy800 : 'transparent',
                    fontSize: 14,
                    lineHeight: '20px',
                    fontWeight: isActive ? 500 : 400,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = C.navy800;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        backgroundColor: C.blue600,
                      }}
                    />
                  )}
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className="rounded-full tabular"
                      style={{
                        backgroundColor: isActive ? C.blue600 : C.navy800,
                        color: '#fff',
                        fontSize: 11,
                        lineHeight: '16px',
                        fontWeight: 600,
                        padding: '0 8px',
                        border: isActive ? 'none' : `1px solid ${C.gray700}`,
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{ borderTop: `1px solid ${C.navy800}` }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, backgroundColor: C.blue600, color: '#fff', fontSize: 12, fontWeight: 600 }}
        >
          AK
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Ananya Kapoor</div>
          <div style={{ color: C.gray500, fontSize: 11 }}>Credit Officer</div>
        </div>
      </div>
    </aside>
  );
}
