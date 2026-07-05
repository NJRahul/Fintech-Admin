import { Search, Bell, ChevronDown, HelpCircle } from 'lucide-react';
import { C } from './tokens';

export function TopBar() {
  return (
    <header
      className="flex items-center px-6 shrink-0"
      style={{
        height: 64,
        backgroundColor: '#fff',
        borderBottom: `1px solid ${C.gray200}`,
        gap: 16,
      }}
    >
      {/* Role badge */}
      <div
        className="flex items-center gap-2 rounded"
        style={{
          padding: '6px 10px',
          backgroundColor: C.blue50,
          color: C.blue600,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '16px',
        }}
      >
        <span
          className="rounded-full"
          style={{ width: 6, height: 6, backgroundColor: C.blue600, display: 'inline-block' }}
        />
        Credit Officer · Branch 014 Mumbai Andheri
      </div>

      {/* Branch switcher */}
      <button
        className="flex items-center gap-1.5 rounded"
        style={{
          padding: '6px 10px',
          border: `1px solid ${C.gray300}`,
          color: C.gray700,
          fontSize: 13,
          fontWeight: 500,
          backgroundColor: '#fff',
        }}
      >
        Switch branch <ChevronDown size={14} strokeWidth={1.5} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search
          size={16}
          strokeWidth={1.5}
          style={{ position: 'absolute', left: 12, top: 12, color: C.gray500 }}
        />
        <input
          placeholder="Search customers, CIF, account, transaction ref…"
          className="w-full rounded outline-none"
          style={{
            height: 40,
            paddingLeft: 36,
            paddingRight: 12,
            border: `1px solid ${C.gray300}`,
            backgroundColor: '#fff',
            fontSize: 14,
            color: C.gray900,
          }}
        />
      </div>

      <button
        className="flex items-center justify-center rounded"
        style={{ width: 40, height: 40, color: C.gray700 }}
      >
        <HelpCircle size={18} strokeWidth={1.5} />
      </button>
      <button
        className="flex items-center justify-center rounded relative"
        style={{ width: 40, height: 40, color: C.gray700 }}
      >
        <Bell size={18} strokeWidth={1.5} />
        <span
          className="absolute rounded-full"
          style={{
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            backgroundColor: C.danger600,
            border: '2px solid #fff',
          }}
        />
      </button>

      <div className="flex items-center gap-2 pl-3" style={{ borderLeft: `1px solid ${C.gray200}` }}>
        <div
          className="rounded-full flex items-center justify-center"
          style={{ width: 32, height: 32, backgroundColor: C.blue600, color: '#fff', fontSize: 12, fontWeight: 600 }}
        >
          AK
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.gray900, lineHeight: '16px' }}>
            Ananya Kapoor
          </div>
          <div style={{ fontSize: 11, color: C.gray500, lineHeight: '14px' }}>EMP-20481</div>
        </div>
        <ChevronDown size={14} strokeWidth={1.5} color={C.gray500} />
      </div>
    </header>
  );
}
