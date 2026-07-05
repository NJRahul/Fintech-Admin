import { C } from './tokens';

type Variant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const map: Record<Variant, { bg: string; fg: string }> = {
  success: { bg: C.success50, fg: C.success600 },
  warning: { bg: C.warning50, fg: C.warning600 },
  danger: { bg: C.danger50, fg: C.danger600 },
  neutral: { bg: C.gray100, fg: C.gray700 },
  info: { bg: C.blue50, fg: C.blue600 },
};

export function StatusBadge({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  const { bg, fg } = map[variant];
  return (
    <span
      className="inline-flex items-center rounded-full"
      style={{
        backgroundColor: bg,
        color: fg,
        padding: '2px 8px',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}
