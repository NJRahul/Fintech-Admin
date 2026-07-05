Staff Portal

DESIGN SYSTEM — ENTERPRISE CORE BANKING. Apply exactly on every screen. The goal is a product that looks like it was designed by the in-house design team of a top-tier global bank: conventional, dense where needed, flawlessly consistent, zero decorative flourish.

=== COLOR ===
Brand & Action
- Primary Blue 600: #1B4DD8 (primary buttons, links, active nav, selected states)
- Primary Blue 700: #1539A8 (hover/pressed on primary)
- Primary Blue 50:  #EEF3FE (selected row background, active nav item background, info surfaces)

Neutrals (the backbone — 90% of the UI is these)
- Gray 900: #1A1F29 (headings, primary text)
- Gray 700: #3E4756 (body text)
- Gray 500: #6B7484 (secondary text, placeholders, inactive icons)
- Gray 300: #C8CDD6 (borders on inputs, disabled text)
- Gray 200: #E2E5EA (dividers, table rules)
- Gray 100: #F0F2F5 (page background, table header background)
- Gray 50:  #F7F8FA (hover row background, subtle wells)
- White:    #FFFFFF (cards, panels, nav surfaces)

Semantic (status — used small and precise, never as large fills)
- Success 600: #147D45 | Success 50: #E9F5EE (approved, completed, credit amounts)
- Warning 600: #A6660A | Warning 50: #FBF3E4 (pending, in review, expiring)
- Danger 600:  #C42B1C | Danger 50:  #FCEEEC (failed, rejected, fraud, debit alerts)
- Info 600:    #1B4DD8 | Info 50:    #EEF3FE (informational notices)

Dark surfaces (navigation chrome only)
- Navy 900: #0E1B33 (staff portal sidebar, web portal sidebar)
- Navy 800: #16264A (sidebar hover state)

Rules: never use pure black. Never use any color not listed. Semantic colors appear only in badges, small icons, text labels, left-accent borders, and the -50 tints as badge/notice backgrounds — never as full-bleed section backgrounds.

=== TYPOGRAPHY ===
Single family: Inter (fallback: SF Pro / Segoe UI / system-ui). No display font, no mono font. Enterprise credibility comes from a disciplined scale of one family.
- H1 Page title: 28/36, weight 600
- H2 Section title: 20/28, weight 600
- H3 Card/panel title: 16/24, weight 600
- Body: 14/20, weight 400
- Body strong: 14/20, weight 600 (amounts, key values)
- Caption/meta: 12/16, weight 400, Gray 500
- Overline/table header: 12/16, weight 600, letter-spacing 0.03em, uppercase, Gray 500
- Large amount (dashboard balance): 32/40, weight 700, with currency symbol at 20/28 weight 500
Numerals: Inter with tabular-nums enabled on ALL amounts, account numbers, dates, and any column of figures — so digits align vertically in tables.
Amount color convention: credits in Success 600 with "+" prefix, debits in Gray 900 with "−" prefix. Never color debits red in lists (red is reserved for failed/fraud states).

=== SPACING, GRID, RADIUS, ELEVATION ===
- 8px base grid (4px allowed inside compact components)
- Radius: 6px inputs/buttons, 8px cards, 10px modals, 999px badges/pills/avatars
- Elevation levels:
  L0 flat: page background elements
  L1 card: white + 1px Gray 200 border + shadow 0 1px 2px rgba(16,24,40,0.05)
  L2 dropdown/popover: shadow 0 4px 8px rgba(16,24,40,0.10)
  L3 modal: shadow 0 12px 24px rgba(16,24,40,0.14) + Gray 900 40% overlay behind
- Page padding: mobile 16px; web/staff 24px content padding inside a max-width 1440px shell
- Card internal padding: 20px mobile, 24px desktop

=== COMPONENTS — every component must implement ALL listed states ===

BUTTONS (heights: 40px default, 32px compact for tables, 48px mobile-primary)
- Primary: Blue 600 fill, white text, 6px radius | hover Blue 700 | pressed Blue 700 + inner shadow | disabled Gray 100 fill + Gray 300 text | loading: spinner replaces label, width locked
- Secondary: white fill, 1px Gray 300 border, Gray 900 text | hover Gray 50 fill
- Tertiary/ghost: no fill, Blue 600 text | hover Blue 50 fill
- Danger: Danger 600 fill, white — only for irreversible actions (reject, freeze, delete)

BADGES (status)
- Pill, 999px radius, 12/16 weight 500 text, 8px horizontal padding, tinted background + matching 600-level text: Success 50/Success 600 "Completed · Approved · Active", Warning 50/Warning 600 "Pending · In Review", Danger 50/Danger 600 "Failed · Rejected · Flagged", Gray 100/Gray 700 "Draft · Closed · Scheduled", Blue 50/Blue 600 "Processing · Disbursed"
- Same label vocabulary across all three apps, always.

INPUTS (height 40px, 44px on mobile)
- Default: white fill, 1px Gray 300 border, 6px radius, 14px text, Gray 500 placeholder
- States: hover Gray 500 border | focus 1px Blue 600 border + 3px Blue 50 outer ring | error Danger 600 border + 12px Danger 600 helper text below stating the fix, not just "invalid" | disabled Gray 100 fill | read-only Gray 50 fill no border change
- Every input has a 12/16 weight 500 Gray 700 label above it. No floating labels, no placeholder-as-label.
- Amount inputs: currency prefix inside the field, right-aligned numerals, tabular-nums.

CARDS
- L1 elevation, 8px radius. Card header = H3 + optional action link right-aligned + 1px Gray 200 divider below. KPI/stat cards: caption label top, 24/32 weight 700 value, delta indicator (▲ Success 600 / ▼ Danger 600 + percentage) below.

DATA TABLE (primary pattern for web portal + staff portal)
- Header row: Gray 100 background, overline-style labels, sortable columns show chevron on hover, 44px height
- Body rows: white, 1px Gray 200 bottom border, 52px height (44px in compact density mode — staff portal defaults to compact)
- Row states: hover Gray 50 | selected Blue 50 + Blue 600 3px left accent | expandable rows chevron-left
- Amount columns right-aligned tabular-nums; status column always a Badge; row-end overflow menu (⋯) for actions
- Table toolbar above every table: search field (left) + filter chips + column/density controls + primary action button (right)
- Pagination footer: "1–25 of 1,240" + page controls; staff queues additionally show a count chip in the nav (e.g., "KYC Review 38")
- Empty state: centered icon + one-line explanation + primary action. Loading state: skeleton rows, never spinners over blank space.

TRANSACTION LIST ITEM (mobile + web feed pattern)
- 64px row: left 40px circular icon container (Gray 100 fill, Gray 700 outline icon by category: transfer, card, UPI, EMI, wallet)
- Middle: 14/20 weight 500 merchant/description + 12/16 Gray 500 meta line (date · channel · reference)
- Right: amount (Body strong, +/− convention) + status badge beneath if not Completed
- Rows divided by 1px Gray 200, grouped under sticky date headers (12/16 weight 600 Gray 500, Gray 100 background band)

NAVIGATION
- Mobile app: bottom tab bar, white background, 1px Gray 200 top border, 5 tabs (Home, Payments, central raised 56px Blue 600 circular Scan/Pay action, Loans, More). Active tab Blue 600 icon+label, inactive Gray 500. Top app bar per screen: 56px, white, title center or left, back chevron left.
- Internet banking portal: left sidebar 264px Navy 900, white logo area 64px, nav items 44px (icon + 14/20 label, Gray 300 text, hover Navy 800, active = white text + Blue 600 4px left bar + Navy 800 background). Top bar 64px white: global search center-left, notifications bell + profile menu right.
- Staff portal: same sidebar spec at 248px with grouped sections (overline group labels: CUSTOMERS, LOANS, PAYMENTS, RISK & FRAUD, COMPLIANCE, ADMIN), queue count chips on relevant items. Top bar adds: environment/role badge (e.g., "Credit Officer · Branch 014") and branch switcher.

MODALS & PANELS
- Modal: max 560px (forms) / 720px (review screens), 10px radius, header H2 + close ×, footer right-aligned button pair (Secondary "Cancel" + Primary verb: "Approve loan", "Confirm transfer")
- Side panel (staff drill-in): 480px right slide-over, L2 shadow — used for viewing a record from a table without losing queue context
- Confirmation pattern for money movement & irreversible staff actions: modal restates the action in full ("Transfer ₹50,000.00 from Savings ••4821 to Rahul Traders — HDFC ••0092"), amount in Large-amount type, then Primary confirm.

NOTICES & ALERTS
- Inline notice: -50 tint background, 600-level 4px left border + icon, 14/20 text, optional action link. Info/Success/Warning/Danger variants.
- Toast: bottom-left web / top mobile, white L2, status icon, auto-dismiss 5s except Danger (manual dismiss).
- Fraud/security notices always Danger variant + always include one clear action ("Review this transaction").

FORMS & FLOWS
- Multi-step flows (onboarding, KYC, loan application, cross-border payment): horizontal stepper on web (numbered circles + labels, completed = Blue 600 check, current = Blue 600 ring, upcoming = Gray 300), thin progress bar on mobile ("Step 2 of 5" caption)
- Review-before-submit screen is mandatory for every flow that moves money or submits an application: read-only summary list (label Gray 500 left, value Gray 900 right) + edit links per section
- Success screen: Success 600 circular check icon 64px, H2 confirmation, reference ID in a copyable Gray 50 well, secondary actions (Download receipt · Share · Done)

=== ICONS & IMAGERY ===
- One icon set: outlined, 1.5px stroke, 20px in components / 24px in nav (use Lucide or equivalent). No emoji, no illustrations, no stock imagery, no gradients, no glassmorphism, no decorative blobs.

=== MOTION ===
- 120ms ease-out micro interactions, 200ms panel/modal enter, fade+4px-rise only. No bounce, no parallax, no animated numbers.

=== ACCESSIBILITY & QUALITY FLOOR ===
- 4.5:1 text contrast minimum; 2px Blue 600 focus ring offset 2px on all interactives; touch targets ≥44px on mobile; status always icon/text + color, never color alone; all amounts include currency code or symbol; dates in one format everywhere: DD MMM YYYY, HH:mm.


0. SHARED SYSTEM CONTEXT — paste at the top of each application prompt, together with the Design System v2 block

Build instruction preamble (include verbatim):


Build every screen listed in the screen inventory. For every screen, implement three additional states: loading (skeleton placeholders matching the layout), empty (icon + one-line explanation + primary action), and error (what went wrong + how to recover). Populate all lists, tables, and dashboards with realistic Indian banking data — Indian names, ₹ amounts with Indian digit grouping (₹1,24,500.00), IFSC codes, UPI IDs (name@bankupi), masked account numbers (••4821), realistic dates in DD MMM YYYY format. Never use lorem ipsum or generic placeholders.



Shared Data Entities (single source of truth):


Customer Profile — KYC status, risk tier, linked accounts, registered devices, notification preferences
Account — type (savings/current/loan/wallet), balance, ledger, status (Active/Frozen/Dormant/Closed), limits (daily transfer, withdrawal)
Transaction — type, amount, currency, status, channel (Mobile/Web/Branch/ATM/UPI/Wallet), timestamp, reference ID, fraud flag, dispute link
Beneficiary/Payee — verification status, cooling-period timestamp, rails enabled (domestic/ACH/wire/UPI)
Loan — application, status, credit score snapshot, EMI schedule, mandate, collections stage, assigned officer
Payment Instruction — rail (ACH/wire/card/UPI/wallet/internal), currency, corridor (SWIFT/SEPA/domestic), FX rate, fees, compliance-screening status
Fraud Alert — severity, rule triggered, linked transaction, customer response (confirmed/denied), case status, assigned analyst
Dispute — linked transaction, reason, evidence, status, resolution, refund reference
Staff User — role, permissions, branch, maker-checker authority level
Notification — event, recipient, channel, read status


Canonical status vocabulary (identical badge labels in all 3 apps):


Transaction: Processing · Completed · Failed · Flagged · Disputed · Reversed
KYC: Submitted · In Review · More Info Needed · Approved · Rejected
Loan application: Submitted · In Review · Credit Assessment · Counter-Offer · Approved · Rejected · Disbursed · Closed
EMI: Upcoming · Paid · Overdue · Restructured
Fraud alert: Open · Customer Notified · Confirmed Fraud · Cleared · Escalated
Dispute: Open · Under Investigation · Resolved – Refunded · Resolved – Declined
Cross-border payment: Screening · Sent · In Transit · Delivered · Returned
Account: Active · Frozen · Dormant · Closed


Shared Rules:


Every customer action (KYC submission, transfer, loan application, dispute, fraud response) creates a record that appears in the matching staff queue in real time, tagged with source channel (Mobile/Web).
Every staff decision (KYC verdict, loan verdict, fraud resolution, dispute resolution, restructuring approval) updates the customer's status in both customer apps in real time and fires the notification defined in the matrix below.
Auth, KYC status, limits, and beneficiary list are shared across Mobile App and Internet Banking Portal — one identity, two channels.
All money movement funnels through one Transaction Engine; the staff monitoring dashboard sees every channel.
High-value staff actions (loan approval above threshold, disbursement, account unfreeze, fraud write-off) require dual authorization: a second staff member with approver authority must confirm before the action executes (staff-side maker-checker).
Every state change on every entity writes an immutable audit event (who, what, when, before→after value) viewable in the staff portal Audit Trail.


Notification Matrix (implement exactly — this is the visible integration layer):

EventCustomer gets (Mobile push + in-app; Web in-app bell)Staff getsKYC submitted"Application received — In Review"New item in KYC queue with count chip +1KYC verdictApproved: "Account ready" / More info: reason + re-upload deep-link / Rejected: reasonQueue item closes; audit eventDebit/credit postedAmount, counterparty, balance afterAppears in live monitoring feedTransaction failedReason + retry actionException queue if system-side failureLoan status changeEach stage transition; Counter-Offer includes new terms + Accept/Decline deep-linkQueue movement; disbursement task on approvalEMI T-3 days / due today / missedReminder → reminder → overdue notice with penalty disclosure + repayment options linkMissed EMI auto-appears in collections 30-day bucketFraud rule triggered"Was this you?" push with Confirm/Deny actionsAlert in fraud queue, severity-sortedCustomer denies transaction"Account protected — case #" + card/account auto-freeze noticeAlert escalates to Confirmed-pending-investigationDispute raisedCase # + expected resolution windowNew item in dispute queueDispute resolvedOutcome + refund reference if refundedCase closes; audit eventNew device loginSecurity alert with "Not you? Secure account" actionVisible in customer-360 device listBeneficiary added"New payee added — transfers enabled after 30-min cooling period"Visible in customer-360; flagged if added right before large transfer


3. BANK MANAGEMENT PORTAL — Build Prompt v2 (Staff)

Portal purpose: Role-based operations console. Every customer-side action above has a staff-side surface here; staff-side actions push back to customers per the Notification Matrix.

Screen inventory (build all): Staff login + MFA · Role-based dashboards (8 role variants) · Global customer search · Customer-360 (8 tabs) · KYC review queue · KYC compare view · KYC escalation view · Live transaction monitor · Exception queue · Teller operations (deposit/withdrawal entry) · Reconciliation dashboard · Loan origination queue · Loan underwriting workspace · Counter-offer composer · Disbursement authorization queue · Credit risk console · Manual score override · EMI operations · Missed-EMI dashboard · Reminder campaign composer · Collections pipeline (bucket board) · Collection account workspace · Restructuring approval · Write-off/legal escalation · Payment operations dashboard · SWIFT/SEPA console · Compliance screening queue · Card operations · Dispute case workspace · Fraud rule dashboard · Fraud alert queue · Fraud investigation workspace · Wallet oversight · UPI operations · Mandate oversight · AML/sanctions dashboard · Regulatory reports · Audit trail viewer · Staff admin (users, roles, permissions) · Dual-authorization approval queue · System health.

3.1 Auth, Roles & Dual Authorization


Login → MFA → role-scoped landing dashboard. Roles: Teller, KYC Officer, Credit Officer, Fraud Analyst, Collections Agent, Compliance Officer, Branch Manager, Super Admin — each sees only permitted nav groups; role + branch badge always visible in top bar
Dual-authorization queue (new): actions above configured thresholds (loan approval > ₹X, disbursement, account unfreeze, fraud write-off, manual score override) create a pending item for a second approver → approver sees full context + initiator identity → Approve/Reject with reason → both actions audited
Admin: staff CRUD, role/permission matrix editor, deactivate with session-kill, staff-action audit feed


3.2 Core Banking Operations


Customer-360: header (name, CIF, KYC badge, risk tier, RM) + tabs: Accounts · Transactions · Loans · Cards & Wallet · UPI · Alerts & Disputes · Documents · Audit Trail. Every tab uses standard tables; every customer-initiated item is visible here with source-channel tag
KYC queue: sortable by age/risk/channel → compare view (document image left, extracted fields right with per-field match indicators, liveness score badge) → Approve / Request more info (reason picker + free text → notifies customer with deep-link) / Reject (reason mandatory) → high-risk auto-escalates to Compliance Officer with escalation notes thread
Bulk KYC actions (new): multi-select low-risk auto-verified items → batch approve with dual-auth if above count threshold
Live transaction monitor: real-time feed, filters (channel/branch/amount/status), anomaly highlighting, click-through to full transaction audit trail
Teller ops: assisted deposit/withdrawal entry with customer lookup, cash-drawer session totals; Exception queue: failed/mismatched transactions → investigate → resolve (retry/reverse/escalate) with mandatory note
Reconciliation: daily channel-wise summary, break list, mark-resolved workflow


3.3 Loans & Credit Operations


Origination queue: applications from both channels, columns for channel/amount/score/age, SLA countdown per item
Underwriting workspace: application summary, document viewer with verify-checkbox per doc, auto credit score with factor breakdown, debt-to-income auto-calc, decision bar: Approve (→ dual-auth if above threshold) / Reject (reason) / Counter-offer composer: modify amount/rate/tenure → preview new EMI → send (customer gets Accept/Decline flow) / Request more info
Disbursement authorization: approved + e-signed loans queue → verify account → authorize (dual-auth) → status Disbursed pushes to customer
Risk console: model performance dashboard, manual override with mandatory justification (audited + dual-auth), bulk re-score trigger with preview of affected accounts
EMI ops: all-loans schedule view, missed-EMI dashboard (auto-flagged), reminder campaign composer (audience filter → template with merge fields → schedule → delivery/read report)
Collections: pipeline board with 30/60/90+ buckets (drag or auto-move), agent assignment, account workspace (contact log with outcome codes, promise-to-pay tracker, customer's restructuring proposal review: Approve/Counter/Reject → updates customer apps), write-off/legal escalation flow with checklist + dual-auth


3.4 Payment, Fraud & Dispute Operations


Payment ops dashboard: all rails real-time, volume/failure KPIs, drill-down per rail
SWIFT/SEPA console: per-payment message status, stuck/returned resolution actions (repair & resend / return funds), compliance screening queue — sanctions/AML hits show matched-list context → Clear (reason) / Escalate / Block (dual-auth)
Card ops: issuance approvals, customer block/unblock requests, dispute workspace: evidence viewer, merchant response tracker, decision (refund → auto-credits customer + notification / decline → reason to customer), chargeback status
Fraud: rule dashboard (rules, hit rates, false-positive rates), alert queue severity-sorted with customer-response column (shows Confirm/Deny result), investigation workspace: transaction + customer history + device/location panel → resolve Cleared (unfreeze + notify) / Confirmed Fraud (freeze, case file, refund initiation, regulatory-report flag) / Escalated


3.5 Wallet, UPI & Compliance


Wallet oversight: portfolio dashboard, funding-source verification queue, suspicious-activity flags feeding fraud queue, KYC-tier upgrade review
UPI ops: transaction monitor, dispute/chargeback queue, mandate oversight (suspicious mandate flags → review → cancel with customer notification)
AML dashboard: screening across onboarding/loans/cross-border, alert disposition workflow
Regulatory reports: report catalog → parameter form → generate → download/schedule; SAR draft workspace
Audit trail viewer: global search by customer/staff/entity/date → immutable event list (who, what, when, before→after) → export
System health: transaction volume graphs, uptime, failed-job queue with retry action


Note: "Render every list/table with realistic banking data (Indian names, ₹ amounts with Indian digit grouping, IFSC/UPI IDs, realistic dates) — never lorem ipsum or placeholder text." 