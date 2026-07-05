import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { STAFF, CUSTOMERS, ACCOUNTS, TRANSACTIONS, KYC, LOANS, EMIS, COLLECTIONS, FRAUD, DISPUTES, AML, SWIFT, AUDIT, makeTs } from "./data.ts";

const app = new Hono();
const P = "/make-server-63e5b79e";

app.use("*", logger(console.log));
app.use("/*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization"], allowMethods: ["GET","POST","PUT","DELETE","OPTIONS"], exposeHeaders: ["Content-Length"], maxAge: 600 }));

async function writeAudit(who: string, entity: string, ref: string, action: string, before: string, after: string) {
  const id = `AUD-${Date.now()}`;
  const ev = { id, when: new Date().toISOString(), who, role: "Staff", entity, entity_ref: ref, action, before, after, ip: "10.14.2.88", branch: "014" };
  await kv.set(`audit:${id}`, ev);
}
async function writeNotif(cif: string, event: string, message: string) {
  const id = `NOTIF-${Date.now()}`;
  await kv.set(`notification:${cif}:${id}`, { id, cif, event, message, read: false, created_at: new Date().toISOString(), source: "staff_portal" });
}

// Health
app.get(`${P}/health`, (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

// Seed
app.post(`${P}/seed`, async (c) => {
  try {
    const done = await kv.get("_seeded_v5");
    if (done) return c.json({ already_seeded: true });
    for (const s of STAFF)        await kv.set(`staff:${s.id}`, s);
    for (const c2 of CUSTOMERS)   await kv.set(`customer:${c2.cif}`, c2);
    for (const a of ACCOUNTS)     await kv.set(`account:${a.no}`, a);
    for (const t of TRANSACTIONS)  await kv.set(`tx:${t.ref}`, t);
    for (const k of KYC)          await kv.set(`kyc:${k.cif}`, k);
    for (const l of LOANS)        await kv.set(`loan:${l.id}`, l);
    for (const e of EMIS)         await kv.set(`emi:${e.id}`, e);
    for (const col of COLLECTIONS) await kv.set(`collection:${col.loan_id}`, col);
    for (const f of FRAUD)        await kv.set(`fraud:${f.id}`, f);
    for (const d of DISPUTES)     await kv.set(`dispute:${d.id}`, d);
    for (const a2 of AML)         await kv.set(`aml:${a2.id}`, a2);
    for (const s2 of SWIFT)       await kv.set(`swift:${s2.ref}`, s2);
    for (const a3 of AUDIT)       await kv.set(`audit:${a3.id}`, a3);
    await kv.set("_seeded_v5", true);
    return c.json({ seeded: true, customers: CUSTOMERS.length });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.delete(`${P}/seed`, async (c) => {
  await kv.del("_seeded_v5");
  return c.json({ reset: true });
});

// Dashboard
app.get(`${P}/dashboard/stats`, async (c) => {
  try {
    const kycs: any[] = await kv.getByPrefix("kyc:") as any[];
    const loans: any[] = await kv.getByPrefix("loan:") as any[];
    const frauds: any[] = await kv.getByPrefix("fraud:") as any[];
    const txs: any[] = await kv.getByPrefix("tx:") as any[];
    const audits: any[] = await kv.getByPrefix("audit:") as any[];
    return c.json({
      kycPending: kycs.filter((k) => k.status === "Submitted" || k.status === "In Review").length,
      loanQueue:  loans.filter((l) => ["Submitted","In Review","Credit Assessment"].includes(l.status)).length,
      fraudOpen:  frauds.filter((f) => f.status === "Open").length,
      disbursed:  loans.filter((l) => l.status === "Disbursed").reduce((s: number, l: any) => s + (l.amount || 0), 0),
      txCount:    txs.length,
      liveFeed:   txs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8),
      topFraud:   frauds.sort((a: any, b: any) => ({ Critical:0, High:1, Medium:2, Low:3 } as any)[a.severity] - ({ Critical:0, High:1, Medium:2, Low:3 } as any)[b.severity]).slice(0, 5),
      auditRecent: audits.sort((a: any, b: any) => new Date(b.when).getTime() - new Date(a.when).getTime()).slice(0, 5),
    });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Customers
app.get(`${P}/customers`, async (c) => {
  try {
    const q = c.req.query("q") || "";
    const all: any[] = await kv.getByPrefix("customer:") as any[];
    const out = q ? all.filter((x) => x.name?.toLowerCase().includes(q.toLowerCase()) || x.cif?.includes(q) || x.pan?.toLowerCase().includes(q.toLowerCase()) || x.mobile?.includes(q)) : all;
    return c.json(out.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/customers`, async (c) => {
  try {
    const body = await c.req.json();
    const cif = `CIF-${880000 + Math.floor(Math.random() * 9999)}`;
    const customer = { ...body, cif, kyc_status: "Submitted", created_at: new Date().toISOString() };
    await kv.set(`customer:${cif}`, customer);
    await kv.set(`kyc:${cif}`, { cif, name: `${body.first} ${body.last}`, channel: "Branch", risk: body.riskTier || "Low", docs: "Aadhaar + PAN", status: "Submitted", score: 85, submitted_at: new Date().toISOString(), officer: null, reason: null });
    await writeAudit("Staff", "Customer", cif, "Customer created", "—", customer.name);
    return c.json(customer, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get(`${P}/customers/:cif`, async (c) => {
  try {
    const cif = c.req.param("cif");
    const customer: any = await kv.get(`customer:${cif}`);
    if (!customer) return c.json({ error: "Not found" }, 404);
    const accs: any[] = await kv.getByPrefix("account:") as any[];
    const txs: any[] = await kv.getByPrefix("tx:") as any[];
    const kyc = await kv.get(`kyc:${cif}`);
    const notifs: any[] = await kv.getByPrefix(`notification:${cif}:`) as any[];
    return c.json({ customer, accounts: accs.filter((a) => a.cif === cif), transactions: txs.filter((t) => t.cif === cif).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10), kyc, notifications: notifs });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// KYC
app.get(`${P}/kyc`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("kyc:") as any[];
    return c.json(all.sort((a: any, b: any) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/kyc/:cif/decision`, async (c) => {
  try {
    const cif = c.req.param("cif");
    const body = await c.req.json();
    const entry: any = await kv.get(`kyc:${cif}`);
    if (!entry) return c.json({ error: "Not found" }, 404);
    const statusMap: Record<string, string> = { approved: "Approved", rejected: "Rejected", info_requested: "More Info Needed" };
    const newStatus = statusMap[body.decision] || "In Review";
    const updated = { ...entry, status: newStatus, officer: body.officer || "A. Kapoor", decision_at: new Date().toISOString(), reason: body.reason || null };
    await kv.set(`kyc:${cif}`, updated);
    const cust: any = await kv.get(`customer:${cif}`);
    if (cust) await kv.set(`customer:${cif}`, { ...cust, kyc_status: newStatus });
    const msgs: Record<string, string> = { approved: "Your KYC is complete! Account is now active.", rejected: `KYC rejected. Reason: ${body.reason}`, info_requested: `Additional info required: ${body.reason}` };
    await writeNotif(cif, `kyc_${body.decision}`, msgs[body.decision] || "KYC updated.");
    await writeAudit(body.officer || "A. Kapoor", "KYC", cif, `KYC ${body.decision}`, entry.status, newStatus);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Accounts
app.get(`${P}/accounts`, async (c) => {
  try {
    const cif = c.req.query("cif");
    const all: any[] = await kv.getByPrefix("account:") as any[];
    return c.json(cif ? all.filter((a) => a.cif === cif) : all);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/accounts/:no/toggle-freeze`, async (c) => {
  try {
    const no = c.req.param("no");
    let officer = "Staff";
    try { const b = await c.req.json(); officer = b.officer || officer; } catch { /* ignore */ }
    const account: any = await kv.get(`account:${no}`);
    if (!account) return c.json({ error: "Not found" }, 404);
    const newStatus = account.status === "Frozen" ? "Active" : "Frozen";
    const updated = { ...account, status: newStatus };
    await kv.set(`account:${no}`, updated);
    await writeNotif(account.cif, "account_status", newStatus === "Frozen" ? `Account ••${no.slice(-4)} frozen.` : `Account ••${no.slice(-4)} unfrozen.`);
    await writeAudit(officer, "Account", no, newStatus === "Frozen" ? "Account frozen" : "Account unfrozen", account.status, newStatus);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get(`${P}/accounts/:no/ledger`, async (c) => {
  try {
    const no = c.req.param("no");
    const account = await kv.get(`account:${no}`);
    if (!account) return c.json({ error: "Not found" }, 404);
    const txs: any[] = await kv.getByPrefix("tx:") as any[];
    const ledger = txs.filter((t) => t.account === no).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ account, ledger });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Transactions
app.get(`${P}/transactions`, async (c) => {
  try {
    const cif = c.req.query("cif");
    const all: any[] = await kv.getByPrefix("tx:") as any[];
    const sorted = all.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json(cif ? sorted.filter((t) => t.cif === cif) : sorted);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Loans
app.get(`${P}/loans`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("loan:") as any[];
    return c.json(all.sort((a: any, b: any) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/loans/:id/decision`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const loan: any = await kv.get(`loan:${id}`);
    if (!loan) return c.json({ error: "Not found" }, 404);
    const statusMap: Record<string, string> = { approve: "Approved", reject: "Rejected", counter: "Counter-Offer", info: "In Review" };
    const newStatus = statusMap[body.decision] || loan.status;
    const extra = body.counter_amount ? { counter_amount: body.counter_amount, counter_rate: body.counter_rate, counter_tenure: body.counter_tenure } : {};
    const updated = { ...loan, status: newStatus, ...extra };
    await kv.set(`loan:${id}`, updated);
    const msgs: Record<string, string> = { approve: `Your ${loan.type} has been approved!`, reject: `Loan application rejected. ${body.reason || ""}`, counter: "Counter-offer sent. Please review." };
    await writeNotif(loan.cif, `loan_${body.decision}`, msgs[body.decision] || "Loan status updated.");
    await writeAudit(body.officer || "A. Kapoor", "Loan", id, `Loan ${body.decision}`, loan.status, newStatus);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// EMIs
app.get(`${P}/emis`, async (c) => {
  try { return c.json(await kv.getByPrefix("emi:")); }
  catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${P}/emis/:id/status`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const emi: any = await kv.get(`emi:${id}`);
    if (!emi) return c.json({ error: "Not found" }, 404);
    const updated = { ...emi, status: body.status };
    await kv.set(`emi:${id}`, updated);
    if (body.status === "Paid") await writeNotif(emi.cif, "emi_paid", `EMI payment received for ${emi.type}.`);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Collections
app.get(`${P}/collections`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("collection:") as any[];
    return c.json(all.sort((a: any, b: any) => b.dpd - a.dpd));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/collections/:loanId/contact`, async (c) => {
  try {
    const loanId = c.req.param("loanId");
    const body = await c.req.json();
    const col: any = await kv.get(`collection:${loanId}`);
    if (!col) return c.json({ error: "Not found" }, 404);
    const entry = { date: new Date().toISOString(), agent: body.agent || "Agent", channel: body.channel || "Phone", outcome: body.outcome, note: body.note || "" };
    const updated = { ...col, last_contact: new Date().toISOString(), outcome: body.outcome, contacts: [...(col.contacts || []), entry] };
    await kv.set(`collection:${loanId}`, updated);
    await writeAudit(body.agent || "Agent", "Loan", loanId, "Contact logged", col.outcome, body.outcome);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Payments
app.get(`${P}/payments`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("tx:") as any[];
    const sorted = all.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ transactions: sorted, exceptions: sorted.filter((t) => t.status === "Failed" || t.status === "Disputed"), stats: { total: all.length } });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// SWIFT
app.get(`${P}/swift`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("swift:") as any[];
    return c.json(all.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/swift/:ref/decision`, async (c) => {
  try {
    const ref = decodeURIComponent(c.req.param("ref"));
    const body = await c.req.json();
    const msg: any = await kv.get(`swift:${ref}`);
    if (!msg) return c.json({ error: "Not found" }, 404);
    const statusMap: Record<string, string> = { clear: "Sent", block: "Returned", escalate: "Screening" };
    const updated = { ...msg, status: statusMap[body.decision] || msg.status };
    await kv.set(`swift:${ref}`, updated);
    await writeAudit(body.officer || "P. Menon", "SWIFT", ref, `Compliance ${body.decision}`, msg.status, updated.status);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Fraud
app.get(`${P}/fraud`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("fraud:") as any[];
    const ord: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return c.json(all.sort((a: any, b: any) => (ord[a.severity] || 3) - (ord[b.severity] || 3)));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/fraud/:id/resolve`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const alert: any = await kv.get(`fraud:${id}`);
    if (!alert) return c.json({ error: "Not found" }, 404);
    const statusMap: Record<string, string> = { cleared: "Cleared", confirmed_fraud: "Confirmed Fraud", escalated: "Escalated" };
    const newStatus = statusMap[body.outcome] || body.outcome;
    const updated = { ...alert, status: newStatus, notes: body.notes || "", resolved_at: new Date().toISOString() };
    await kv.set(`fraud:${id}`, updated);
    if (body.outcome === "cleared") await writeNotif(alert.cif, "fraud_cleared", "Security alert resolved. Account unfrozen.");
    if (body.outcome === "confirmed_fraud") await writeNotif(alert.cif, "fraud_confirmed", `Case #${id} opened. Account secured.`);
    await writeAudit(body.officer || "S. Bhatt", "Fraud alert", id, `Alert ${body.outcome}`, alert.status, newStatus);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Disputes
app.get(`${P}/disputes`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("dispute:") as any[];
    return c.json(all.sort((a: any, b: any) => new Date(b.filed).getTime() - new Date(a.filed).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/disputes/:id/resolve`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const dispute: any = await kv.get(`dispute:${id}`);
    if (!dispute) return c.json({ error: "Not found" }, 404);
    const isRefund = body.decision.toLowerCase().includes("refund");
    const newStatus = isRefund ? "Resolved – Refunded" : "Resolved – Declined";
    const updated = { ...dispute, status: newStatus, resolution: body.notes || body.decision, resolved_at: new Date().toISOString() };
    await kv.set(`dispute:${id}`, updated);
    await writeNotif(dispute.cif, "dispute_resolved", isRefund ? `Dispute resolved. Refund of ₹${dispute.amount} credited.` : `Dispute resolved – declined. ${body.notes || ""}`);
    await writeAudit(body.officer || "A. Kapoor", "Dispute", id, isRefund ? "Refunded" : "Declined", dispute.status, newStatus);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// AML
app.get(`${P}/aml`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("aml:") as any[];
    return c.json(all.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/aml/:id/dispose`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const alert: any = await kv.get(`aml:${id}`);
    if (!alert) return c.json({ error: "Not found" }, 404);
    const statusMap: Record<string, string> = { clear: "Cleared", escalate: "Escalated", review: "Under Review" };
    const updated = { ...alert, status: statusMap[body.action] || alert.status, disposed_by: body.officer, disposed_at: new Date().toISOString() };
    await kv.set(`aml:${id}`, updated);
    await writeAudit(body.officer || "P. Menon", "AML alert", id, `AML ${body.action}`, alert.status, updated.status);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Staff
app.get(`${P}/staff`, async (c) => {
  try { return c.json(await kv.getByPrefix("staff:")); }
  catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/staff`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `EMP-${10000 + Math.floor(Math.random() * 89999)}`;
    const member = { ...body, id, status: "Active", last_login: null, actions_30d: 0, created_at: new Date().toISOString() };
    await kv.set(`staff:${id}`, member);
    await writeAudit("Admin", "Staff", id, "Staff created", "—", `${member.name} (${member.role})`);
    return c.json(member, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${P}/staff/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const existing: any = await kv.get(`staff:${id}`);
    if (!existing) return c.json({ error: "Not found" }, 404);
    const body = await c.req.json();
    const updated = { ...existing, ...body };
    await kv.set(`staff:${id}`, updated);
    await writeAudit("Admin", "Staff", id, "Staff updated", existing.status, updated.status || existing.status);
    return c.json(updated);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Audit
app.get(`${P}/audit`, async (c) => {
  try {
    const entity = c.req.query("entity") || "";
    const who = c.req.query("who") || "";
    const ref = c.req.query("ref") || "";
    let events: any[] = await kv.getByPrefix("audit:") as any[];
    if (entity) events = events.filter((e) => e.entity?.toLowerCase().includes(entity.toLowerCase()));
    if (who) events = events.filter((e) => e.who?.toLowerCase().includes(who.toLowerCase()));
    if (ref) events = events.filter((e) => e.entity_ref?.toLowerCase().includes(ref.toLowerCase()));
    return c.json(events.sort((a: any, b: any) => new Date(b.when).getTime() - new Date(a.when).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Notifications
app.get(`${P}/notifications/:cif`, async (c) => {
  try {
    const cif = c.req.param("cif");
    const all: any[] = await kv.getByPrefix(`notification:${cif}:`) as any[];
    return c.json(all.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// Reports
app.get(`${P}/reports`, async (c) => {
  try {
    const all: any[] = await kv.getByPrefix("report:") as any[];
    return c.json(all.sort((a: any, b: any) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()));
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${P}/reports/generate`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `RPT-${Date.now()}`;
    const report = { id, ...body, status: "Ready", generated_at: new Date().toISOString(), generated_by: "A. Kapoor", size_mb: (Math.random() * 8 + 0.5).toFixed(1) };
    await kv.set(`report:${id}`, report);
    return c.json(report, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

Deno.serve(app.fetch);
