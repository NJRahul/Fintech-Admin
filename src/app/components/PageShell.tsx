import { ReactNode } from 'react';
import { C } from './tokens';

const BTN_BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  cursor: 'pointer',
};

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div style={{ backgroundColor: C.gray100, minHeight: '100%' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: 24 }}>
        <div className="flex items-end justify-between mb-6" style={{ gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 28, lineHeight: '36px', fontWeight: 600, color: C.gray900 }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 14, color: C.gray700, marginTop: 4 }}>{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center" style={{ gap: 8, flexShrink: 0 }}>
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function TableToolbar({
  search,
  onSearch,
  placeholder = 'Search…',
  filters,
  action,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${C.gray200}`,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0, width: 280 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.gray500}
          strokeWidth="1.5"
          style={{ position: 'absolute', left: 10, top: 12, pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none rounded"
          style={{
            height: 40,
            paddingLeft: 34,
            paddingRight: 12,
            border: `1px solid ${C.gray300}`,
            fontSize: 14,
            color: C.gray900,
            backgroundColor: '#fff',
          }}
        />
      </div>
      {filters && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{filters}</div>}
      <div style={{ flex: 1 }} />
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...BTN_BASE,
        height: 32,
        padding: '0 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        border: `1px solid ${active ? C.blue600 : C.gray300}`,
        backgroundColor: active ? C.blue50 : '#fff',
        color: active ? C.blue600 : C.gray700,
      }}
    >
      {label}
    </button>
  );
}

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      style={{
        textAlign: right ? 'right' : 'left',
        padding: '0 16px',
        height: 44,
        fontSize: 11,
        lineHeight: '16px',
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase' as const,
        color: C.gray500,
        backgroundColor: C.gray100,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right,
  style,
}: {
  children: ReactNode;
  right?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        textAlign: right ? 'right' : 'left',
        padding: '0 16px',
        fontSize: 14,
        color: C.gray900,
        whiteSpace: right ? 'nowrap' : undefined,
        ...style,
      }}
    >
      {children}
    </td>
  );
}

export function PrimaryBtn({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BTN_BASE,
        gap: 6,
        height: 40,
        padding: '0 16px',
        borderRadius: 6,
        backgroundColor: disabled ? C.gray300 : C.blue600,
        color: '#fff',
        fontSize: 14,
        fontWeight: 500,
        border: 'none',
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...BTN_BASE,
        gap: 6,
        height: 40,
        padding: '0 14px',
        borderRadius: 6,
        border: `1px solid ${C.gray300}`,
        backgroundColor: '#fff',
        fontSize: 14,
        fontWeight: 500,
        color: C.gray900,
      }}
    >
      {children}
    </button>
  );
}

export function CompactBtn({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BTN_BASE,
        gap: 4,
        height: 32,
        padding: '0 10px',
        borderRadius: 6,
        border: danger ? 'none' : `1px solid ${C.gray300}`,
        backgroundColor: disabled ? C.gray200 : danger ? C.danger600 : '#fff',
        color: disabled ? C.gray500 : danger ? '#fff' : C.gray900,
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

/* Wrap a <table> + <Pagination> in this to enable horizontal scroll
   without affecting the Card's rounded corners. */
export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, message, action }: { icon: any; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: '64px 0', gap: 12 }}>
      <div style={{ color: C.gray300 }}>
        <Icon size={40} strokeWidth={1} />
      </div>
      <p style={{ fontSize: 14, color: C.gray500 }}>{message}</p>
      {action}
    </div>
  );
}

export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr style={{ borderTop: `1px solid ${C.gray200}`, height: 44 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '0 16px' }}>
          <div
            className="rounded animate-pulse"
            style={{
              height: 12,
              backgroundColor: C.gray200,
              width: i === 0 ? '70%' : i === cols - 1 ? '40%' : '55%',
            }}
          />
        </td>
      ))}
    </tr>
  );
}

export function Pagination({ from, to, total }: { from: number; to: number; total: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: `1px solid ${C.gray200}`,
        fontSize: 13,
        color: C.gray700,
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <span className="tabular" style={{ whiteSpace: 'nowrap' }}>
        {from}–{to} of {total.toLocaleString('en-IN')} results
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {['‹ Prev', '1', '2', '3', '…', 'Next ›'].map((p, i) => (
          <button
            key={i}
            style={{
              ...BTN_BASE,
              height: 32,
              minWidth: 32,
              padding: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              border: `1px solid ${p === '1' ? C.blue600 : C.gray300}`,
              backgroundColor: p === '1' ? C.blue50 : '#fff',
              color: p === '1' ? C.blue600 : C.gray700,
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
