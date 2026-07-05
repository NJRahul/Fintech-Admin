import { ReactNode } from 'react';
import { C } from './tokens';

const CARD_BASE: React.CSSProperties = {
  backgroundColor: '#fff',
  border: `1px solid ${C.gray200}`,
  borderRadius: 8,
  boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
};

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} style={{ ...CARD_BASE, ...style }}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${C.gray200}`,
      }}
    >
      <h3 style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: C.gray900, whiteSpace: 'nowrap' }}>
        {title}
      </h3>
      {action && <div style={{ flexShrink: 0, marginLeft: 12 }}>{action}</div>}
    </div>
  );
}

/* TableCard — Card variant that wraps its table in a horizontal scroll zone.
   Use this when the table has 7+ columns that might squeeze action buttons. */
export function TableCard({
  children,
  toolbar,
  footer,
  style,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...CARD_BASE, ...style }}>
      {toolbar}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {footer}
    </div>
  );
}
