// Static fallback data — shown immediately while API loads.
// These mirror the seed data so the UI is never blank.

export const FB_CUSTOMERS = [
  { cif:"CIF-882140", name:"Rohan Sharma",     mobile:"+91 98201 12340", pan:"ABCPS4821H", kyc_status:"Approved",         risk_tier:"Low",    rm:"A. Kapoor", accounts:2, branch:"Mumbai Andheri",        created_at:"2019-03-12T00:00:00Z" },
  { cif:"CIF-882138", name:"Priya Ramaswamy",  mobile:"+91 96321 88210", pan:"CDRPR7392J", kyc_status:"In Review",        risk_tier:"Medium", rm:"S. Bhatt",  accounts:1, branch:"Chennai Anna Nagar",    created_at:"2021-08-04T00:00:00Z" },
  { cif:"CIF-882135", name:"Vikram Iyer",      mobile:"+91 99001 44551", pan:"BCFVI1104K", kyc_status:"Approved",         risk_tier:"High",   rm:"R. Iyer",   accounts:2, branch:"Bangalore Indiranagar", created_at:"2017-01-22T00:00:00Z" },
  { cif:"CIF-882131", name:"Aditi Menon",      mobile:"+91 87654 32109", pan:"EJMAM5678L", kyc_status:"Approved",         risk_tier:"Low",    rm:"A. Kapoor", accounts:1, branch:"Mumbai Andheri",        created_at:"2022-11-30T00:00:00Z" },
  { cif:"CIF-882129", name:"Kabir Chatterjee", mobile:"+91 91234 56780", pan:"GHPKC2291M", kyc_status:"More Info Needed", risk_tier:"Medium", rm:"P. Menon",  accounts:1, branch:"Kolkata Salt Lake",     created_at:"2020-05-14T00:00:00Z" },
  { cif:"CIF-882124", name:"Meera Nair",       mobile:"+91 94001 77823", pan:"LMNRN9981N", kyc_status:"Approved",         risk_tier:"High",   rm:"S. Bhatt",  accounts:2, branch:"Kochi Edapally",        created_at:"2018-02-09T00:00:00Z" },
  { cif:"CIF-882118", name:"Arjun Kapoor",     mobile:"+91 98765 43210", pan:"PQRAK4510P", kyc_status:"Approved",         risk_tier:"Low",    rm:"R. Iyer",   accounts:1, branch:"Delhi Connaught Place", created_at:"2020-09-17T00:00:00Z" },
  { cif:"CIF-882110", name:"Neha Verma",       mobile:"+91 93822 11092", pan:"RSTVN6610Q", kyc_status:"Submitted",        risk_tier:"Low",    rm:"A. Kapoor", accounts:1, branch:"Mumbai Andheri",        created_at:"2023-06-03T00:00:00Z" },
];

export const FB_KYC = [
  { cif:"CIF-882140", name:"Rohan Sharma",     channel:"Mobile", risk:"Low",    docs:"Aadhaar + PAN",                 status:"Submitted",        score:94, submitted_at:new Date(Date.now()-14*60000).toISOString() },
  { cif:"CIF-882138", name:"Priya Ramaswamy",  channel:"Web",    risk:"Medium", docs:"Aadhaar + PAN + Bank stmt",      status:"In Review",        score:81, submitted_at:new Date(Date.now()-42*60000).toISOString() },
  { cif:"CIF-882135", name:"Vikram Iyer",      channel:"Branch", risk:"High",   docs:"Aadhaar + PAN + ITR",            status:"More Info Needed", score:62, submitted_at:new Date(Date.now()-72*60000).toISOString() },
  { cif:"CIF-882131", name:"Aditi Menon",      channel:"Mobile", risk:"Low",    docs:"Aadhaar + PAN",                 status:"Submitted",        score:97, submitted_at:new Date(Date.now()-124*60000).toISOString() },
  { cif:"CIF-882129", name:"Kabir Chatterjee", channel:"Mobile", risk:"Medium", docs:"Aadhaar + PAN + Address proof",  status:"In Review",        score:78, submitted_at:new Date(Date.now()-138*60000).toISOString() },
  { cif:"CIF-882124", name:"Meera Nair",       channel:"Mobile", risk:"High",   docs:"Aadhaar + PAN",                 status:"Approved",         score:91, submitted_at:new Date(Date.now()-27*60*60000).toISOString() },
  { cif:"CIF-882118", name:"Arjun Kapoor",     channel:"Branch", risk:"High",   docs:"Aadhaar + Passport + ITR",       status:"In Review",        score:59, submitted_at:new Date(Date.now()-262*60000).toISOString() },
];

export const FB_ACCOUNTS = [
  { no:"ACC-4821",  full:"MERI00014821", cif:"CIF-882140", type:"Savings", balance:284312.50,  status:"Active",  ifsc:"MERI0001001", branch:"Mumbai Andheri",        limit:200000,  opened:"2019-03-12T00:00:00Z" },
  { no:"ACC-7392",  full:"MERI00017392", cif:"CIF-882140", type:"Current", balance:1842600.00, status:"Active",  ifsc:"MERI0001001", branch:"Mumbai Andheri",        limit:1000000, opened:"2019-05-01T00:00:00Z" },
  { no:"ACC-1104",  full:"MERI00011104", cif:"CIF-882135", type:"Savings", balance:44812.00,   status:"Frozen",  ifsc:"MERI0003003", branch:"Bangalore Indiranagar", limit:200000,  opened:"2017-01-22T00:00:00Z" },
  { no:"ACC-5566",  full:"MERI00015566", cif:"CIF-882131", type:"Savings", balance:112900.75,  status:"Active",  ifsc:"MERI0001001", branch:"Mumbai Andheri",        limit:200000,  opened:"2022-11-30T00:00:00Z" },
  { no:"ACC-8820",  full:"MERI00088200", cif:"CIF-882129", type:"Current", balance:678450.00,  status:"Dormant", ifsc:"MERI0004004", branch:"Kolkata Salt Lake",      limit:500000,  opened:"2020-05-14T00:00:00Z" },
  { no:"ACC-2291",  full:"MERI00022910", cif:"CIF-882124", type:"Savings", balance:92140.00,   status:"Active",  ifsc:"MERI0005005", branch:"Kochi Edapally",        limit:200000,  opened:"2018-02-09T00:00:00Z" },
  { no:"ACC-4510",  full:"MERI00045100", cif:"CIF-882118", type:"Savings", balance:321800.00,  status:"Active",  ifsc:"MERI0006006", branch:"Delhi Connaught Place", limit:200000,  opened:"2020-09-17T00:00:00Z" },
];

export const FB_LOANS = [
  { id:"LN-2026-08901", cif:"CIF-882140", name:"Rohan Sharma",     type:"Home Loan",     amount:4200000,  status:"In Review",        score:724, dti:"32%", channel:"Web",    officer:"A. Kapoor", rate:9.0,  tenure:240, submitted_at:new Date(Date.now()-26*60*60000).toISOString() },
  { id:"LN-2026-08892", cif:"CIF-882138", name:"Priya Ramaswamy",  type:"Personal Loan", amount:850000,   status:"Credit Assessment",score:681, dti:"28%", channel:"Mobile", officer:"S. Bhatt",  rate:12.5, tenure:60,  submitted_at:new Date(Date.now()-28*60*60000).toISOString() },
  { id:"LN-2026-08884", cif:"CIF-882135", name:"Vikram Iyer",      type:"Auto Loan",     amount:1800000,  status:"Counter-Offer",    score:612, dti:"44%", channel:"Branch", officer:"R. Iyer",   rate:9.5,  tenure:84,  submitted_at:new Date(Date.now()-48*60*60000).toISOString() },
  { id:"LN-2026-08870", cif:"CIF-882131", name:"Aditi Menon",      type:"Home Loan",     amount:5600000,  status:"Submitted",        score:758, dti:"24%", channel:"Web",    officer:"A. Kapoor", rate:8.9,  tenure:240, submitted_at:new Date(Date.now()-52*60*60000).toISOString() },
  { id:"LN-2026-08842", cif:"CIF-882124", name:"Meera Nair",       type:"Personal Loan", amount:500000,   status:"Approved",         score:698, dti:"30%", channel:"Mobile", officer:"S. Bhatt",  rate:13.0, tenure:48,  submitted_at:new Date(Date.now()-5*24*60*60000).toISOString() },
  { id:"LN-2026-08801", cif:"CIF-882129", name:"Kabir Chatterjee", type:"Business Loan", amount:2400000,  status:"Rejected",         score:642, dti:"38%", channel:"Branch", officer:"P. Menon",  rate:0,    tenure:0,   submitted_at:new Date(Date.now()-7*24*60*60000).toISOString() },
  { id:"LN-2026-08780", cif:"CIF-882118", name:"Arjun Kapoor",     type:"Home Loan",     amount:3800000,  status:"Disbursed",        score:710, dti:"35%", channel:"Web",    officer:"R. Iyer",   rate:9.0,  tenure:240, submitted_at:new Date(Date.now()-30*24*60*60000).toISOString() },
];

export const FB_EMIS = [
  { id:"EMI-8780-JUL", loan_id:"LN-2026-08780", cif:"CIF-882118", name:"Arjun Kapoor",     type:"Home Loan",     amount:38000, due:"05 Jul 2026", status:"Upcoming",     overdue_days:0, mandate:"NACH", bank:"HDFC ••0092" },
  { id:"EMI-8742-JUN", loan_id:"LN-2026-08742", cif:"CIF-882138", name:"Priya Ramaswamy",  type:"Personal Loan", amount:18500, due:"03 Jul 2026", status:"Overdue",      overdue_days:2, mandate:"NACH", bank:"SBI ••4821"  },
  { id:"EMI-8710-JUN", loan_id:"LN-2026-08710", cif:"CIF-882135", name:"Vikram Iyer",      type:"Auto Loan",     amount:22800, due:"02 Jul 2026", status:"Overdue",      overdue_days:3, mandate:"NACH", bank:"ICICI ••7392"},
  { id:"EMI-8684-JUL", loan_id:"LN-2026-08780", cif:"CIF-882140", name:"Rohan Sharma",     type:"Home Loan",     amount:42600, due:"05 Jul 2026", status:"Paid",         overdue_days:0, mandate:"NACH", bank:"HDFC ••1104" },
  { id:"EMI-8660-JUL", loan_id:"LN-2026-08660", cif:"CIF-882131", name:"Aditi Menon",      type:"Personal Loan", amount:9400,  due:"07 Jul 2026", status:"Upcoming",     overdue_days:0, mandate:"NACH", bank:"AXIS ••5566" },
  { id:"EMI-8640-JUN", loan_id:"LN-2026-08640", cif:"CIF-882124", name:"Meera Nair",       type:"Home Loan",     amount:31200, due:"28 Jun 2026", status:"Overdue",      overdue_days:7, mandate:"NACH", bank:"HDFC ••2291" },
  { id:"EMI-8612-MAY", loan_id:"LN-2026-08612", cif:"CIF-882129", name:"Kabir Chatterjee", type:"Business Loan", amount:54900, due:"01 Jun 2026", status:"Restructured", overdue_days:0, mandate:"SI",   bank:"SBI ••8820"  },
];

export const FB_COLLECTIONS = [
  { loan_id:"LN-2026-08742", cif:"CIF-882138", name:"Priya Ramaswamy",  type:"Personal Loan", emi_amount:18500, dpd:2,   total_overdue:18500,  agent:"A. Singh", last_contact:new Date(Date.now()-24*60*60000).toISOString(), outcome:"No answer",              bucket:"1-30",  contacts:[] },
  { loan_id:"LN-2026-08710", cif:"CIF-882135", name:"Vikram Iyer",      type:"Auto Loan",     emi_amount:22800, dpd:3,   total_overdue:22800,  agent:"A. Singh", last_contact:new Date(Date.now()-48*60*60000).toISOString(), outcome:"Promise to pay",          bucket:"1-30",  contacts:[] },
  { loan_id:"LN-2026-08640", cif:"CIF-882124", name:"Meera Nair",       type:"Home Loan",     emi_amount:31200, dpd:7,   total_overdue:31200,  agent:"R. Kumar", last_contact:new Date(Date.now()-72*60*60000).toISOString(), outcome:"Disputed",                bucket:"1-30",  contacts:[] },
  { loan_id:"LN-2025-07990", cif:"CIF-882129", name:"Kabir Chatterjee", type:"Business Loan", emi_amount:48000, dpd:34,  total_overdue:96000,  agent:"R. Kumar", last_contact:new Date(Date.now()-96*60*60000).toISOString(), outcome:"Restructuring requested", bucket:"31-60", contacts:[] },
  { loan_id:"LN-2025-07880", cif:"CIF-882110", name:"Neha Verma",       type:"Personal Loan", emi_amount:12200, dpd:42,  total_overdue:24400,  agent:"M. Das",   last_contact:new Date(Date.now()-144*60*60000).toISOString(),outcome:"No answer",              bucket:"31-60", contacts:[] },
  { loan_id:"LN-2025-07440", cif:"CIF-882118", name:"Arjun Kapoor",     type:"Home Loan",     emi_amount:35800, dpd:68,  total_overdue:107400, agent:"M. Das",   last_contact:new Date(Date.now()-168*60*60000).toISOString(),outcome:"Payment plan agreed",     bucket:"61-90", contacts:[] },
  { loan_id:"LN-2025-06820", cif:"CIF-880775", name:"Sanjay Gupta",     type:"Business Loan", emi_amount:62000, dpd:112, total_overdue:682000, agent:"Legal",    last_contact:new Date(Date.now()-480*60*60000).toISOString(),outcome:"Legal notice issued",      bucket:"90+",   contacts:[] },
];

export const FB_TRANSACTIONS = [
  { ref:"IMPS2026071501234", cif:"CIF-882140", account:"ACC-4821", desc:"Infosys Ltd — Salary credit",         type:"credit", amount:184200,  currency:"INR", rail:"IMPS",  status:"Completed", channel:"NACH",   timestamp:new Date(Date.now()-5*60000).toISOString()  },
  { ref:"UPI2660178821001",  cif:"CIF-882140", account:"ACC-4821", desc:"UPI · anish@paytm — Zomato",          type:"debit",  amount:412,     currency:"INR", rail:"UPI",   status:"Completed", channel:"Mobile", timestamp:new Date(Date.now()-10*60000).toISOString() },
  { ref:"CARDVIS0071230",    cif:"CIF-882124", account:"ACC-2291", desc:"Card · GameStop Poland — Kyiv UA",    type:"debit",  amount:18499,   currency:"INR", rail:"Card",  status:"Flagged",   channel:"Card",   timestamp:new Date(Date.now()-15*60000).toISOString() },
  { ref:"RTGS2026071504411", cif:"CIF-882140", account:"ACC-7392", desc:"Tata Motors — corporate transfer",    type:"credit", amount:8420000, currency:"INR", rail:"RTGS",  status:"Completed", channel:"Branch", timestamp:new Date(Date.now()-20*60000).toISOString() },
  { ref:"SWIFT2026MERI8823", cif:"CIF-882135", account:"ACC-1104", desc:"HDFC→Deutsche Bank Frankfurt",        type:"debit",  amount:350280,  currency:"INR", rail:"SWIFT", status:"Screening", channel:"Web",    timestamp:new Date(Date.now()-25*60000).toISOString() },
  { ref:"NEFT26183012345",   cif:"CIF-882140", account:"ACC-4821", desc:"LIC India — premium auto-debit",      type:"debit",  amount:12500,   currency:"INR", rail:"NEFT",  status:"Failed",    channel:"NACH",   timestamp:new Date(Date.now()-30*60000).toISOString() },
  { ref:"UPI2660178810882",  cif:"CIF-882138", account:"ACC-4821", desc:"UPI · priya.r → anish@paytm",        type:"debit",  amount:850,     currency:"INR", rail:"UPI",   status:"Completed", channel:"Mobile", timestamp:new Date(Date.now()-35*60000).toISOString() },
  { ref:"CARDVIS0071002",    cif:"CIF-882140", account:"ACC-4821", desc:"Flipkart Pvt Ltd — MCC 5411",         type:"debit",  amount:18499,   currency:"INR", rail:"Card",  status:"Disputed",  channel:"Web",    timestamp:new Date(Date.now()-2880*60000).toISOString()},
];

export const FB_SWIFT = [
  { ref:"SWIFT/REF8823019", sender:"Meridian Bank (MERIINBBXXX)", receiver:"Deutsche Bank (DEUTDEDBXXX)",   amount:350280,  currency:"INR", orig_currency:"USD", orig_amount:4200,  corridor:"SWIFT MT103",  status:"Screening",  customer:"CIF-882135", purpose:"Education fees",     date:new Date(Date.now()-90*60000).toISOString()  },
  { ref:"SWIFT/REF8822904", sender:"Meridian Bank (MERIINBBXXX)", receiver:"Citibank London (CITIGB2LXXX)", amount:1067200, currency:"INR", orig_currency:"GBP", orig_amount:12800, corridor:"SWIFT MT103",  status:"In Transit", customer:"CIF-882138", purpose:"Property deposit",   date:new Date(Date.now()-180*60000).toISOString() },
  { ref:"SEPA/2026070500182",sender:"Meridian Bank",               receiver:"ING Belgium (INGBEBB)",         amount:756000,  currency:"INR", orig_currency:"EUR", orig_amount:8400,  corridor:"SEPA Credit",  status:"Delivered",  customer:"CIF-882140", purpose:"Vendor payment",     date:new Date(Date.now()-300*60000).toISOString() },
  { ref:"SWIFT/REF8822611", sender:"Meridian Bank (MERIINBBXXX)", receiver:"HSBC HK (HSBCHKHHHKH)",        amount:1420000, currency:"INR", orig_currency:"HKD", orig_amount:142000,corridor:"SWIFT MT103",  status:"Returned",   customer:"CIF-882118", purpose:"Investment",         date:new Date(Date.now()-32*60*60000).toISOString()},
  { ref:"SWIFT/REF8822490", sender:"Meridian Bank (MERIINBBXXX)", receiver:"BNP Paribas (BNPAFRPPXXX)",    amount:1980000, currency:"INR", orig_currency:"EUR", orig_amount:22000, corridor:"SWIFT MT202",  status:"Sent",       customer:"CIF-882124", purpose:"Business advance",   date:new Date(Date.now()-25*60*60000).toISOString()},
  { ref:"SEPA/2026070400198",sender:"ABN AMRO (ABNANL2A)",         receiver:"Meridian Bank",                amount:432000,  currency:"INR", orig_currency:"EUR", orig_amount:4800,  corridor:"SEPA Inbound", status:"Delivered",  customer:"CIF-882118", purpose:"Inbound remittance", date:new Date(Date.now()-30*60*60000).toISOString()},
];

export const FB_FRAUD = [
  { id:"FR-2026-01148", cif:"CIF-882124", customer:"Meera Nair",        rule:"Geo-velocity — IN → UA in 3m",                 amount:18499,  severity:"Critical", status:"Open",             response:"Denied",    analyst:"S. Bhatt", created_at:new Date(Date.now()-5*60000).toISOString(),   frozen:true,  notes:"" },
  { id:"FR-2026-01145", cif:"CIF-882118", customer:"Arjun Kapoor",      rule:"Card-not-present — new merchant",              amount:42300,  severity:"High",     status:"Customer Notified",response:"Pending",   analyst:"S. Bhatt", created_at:new Date(Date.now()-60*60000).toISOString(),  frozen:false, notes:"" },
  { id:"FR-2026-01142", cif:"CIF-882110", customer:"Neha Verma",        rule:"Multiple failed OTP — 5 attempts",             amount:0,      severity:"High",     status:"Open",             response:"Pending",   analyst:"R. Iyer",  created_at:new Date(Date.now()-87*60000).toISOString(),  frozen:false, notes:"" },
  { id:"FR-2026-01138", cif:"CIF-880775", customer:"Sanjay Gupta",      rule:"Beneficiary added → immediate large transfer", amount:450000, severity:"Medium",   status:"Confirmed Fraud",  response:"Confirmed", analyst:"R. Iyer",  created_at:new Date(Date.now()-192*60000).toISOString(), frozen:true,  notes:"Customer confirmed fraud." },
  { id:"FR-2026-01131", cif:"CIF-882129", customer:"Kabir Chatterjee",  rule:"Velocity — 12 transactions in 10m",            amount:8200,   severity:"Medium",   status:"Cleared",          response:"Confirmed", analyst:"S. Bhatt", created_at:new Date(Date.now()-24*60*60000).toISOString(),frozen:false, notes:"Confirmed genuine." },
  { id:"FR-2026-01120", cif:"CIF-882140", customer:"Rohan Sharma",      rule:"Login — unrecognised device",                  amount:0,      severity:"Low",      status:"Cleared",          response:"Denied",    analyst:"P. Menon", created_at:new Date(Date.now()-29*60*60000).toISOString(),frozen:false, notes:"New device confirmed." },
];

export const FB_DISPUTES = [
  { id:"DSP-2026-04481", cif:"CIF-882140", customer:"Rohan Sharma",    tx_ref:"CARDVIS0071002",    merchant:"Flipkart Pvt Ltd",    amount:18499, reason:"Item not received",       status:"Under Investigation", filed:new Date(Date.now()-2*24*60*60000).toISOString(),  channel:"Mobile", resolution:null },
  { id:"DSP-2026-04472", cif:"CIF-882138", customer:"Priya Ramaswamy", tx_ref:"UPI2660100221001",  merchant:"BookMyShow",           amount:3200,  reason:"Duplicate charge",         status:"Open",                filed:new Date(Date.now()-24*60*60000).toISOString(),   channel:"Web",    resolution:null },
  { id:"DSP-2026-04460", cif:"CIF-882135", customer:"Vikram Iyer",     tx_ref:"CARDVIS0068811",    merchant:"Airtel Payments Bank", amount:1500,  reason:"Unauthorized transaction", status:"Resolved – Refunded", filed:new Date(Date.now()-7*24*60*60000).toISOString(), channel:"Mobile", resolution:"Full refund processed" },
  { id:"DSP-2026-04441", cif:"CIF-882124", customer:"Meera Nair",      tx_ref:"IMPS2026062801188", merchant:"Unknown payee",        amount:80000, reason:"Fraud — not initiated",    status:"Under Investigation", filed:new Date(Date.now()-7*24*60*60000).toISOString(), channel:"Branch", resolution:null },
  { id:"DSP-2026-04420", cif:"CIF-882118", customer:"Arjun Kapoor",    tx_ref:"CARDVIS0060990",    merchant:"MakeMyTrip",           amount:24800, reason:"Service not delivered",    status:"Resolved – Declined", filed:new Date(Date.now()-13*24*60*60000).toISOString(),channel:"Web",    resolution:"Merchant evidence provided" },
  { id:"DSP-2026-04410", cif:"CIF-882131", customer:"Aditi Menon",     tx_ref:"UPI2659901100001",  merchant:"Swiggy",               amount:412,   reason:"Wrong amount charged",     status:"Open",                filed:new Date(Date.now()-2*60*60000).toISOString(),    channel:"Mobile", resolution:null },
];

export const FB_AML = [
  { id:"AML-2026-00881", cif:"CIF-882140", customer:"Rohan Sharma",    type:"Cross-border structuring", amount:4800000, context:"12 transfers just below ₹4L threshold in 3 days",          risk:"High",     status:"Open",        source:"Loan disbursement",   date:new Date(Date.now()-2*60*60000).toISOString()  },
  { id:"AML-2026-00872", cif:"",           customer:"Unknown entity",   type:"SWIFT sanctions match",    amount:350280,  context:"OFAC SDN match — Al-Fayed Trading LLC (82% confidence)",   risk:"Critical", status:"Open",        source:"SWIFT MT103",         date:new Date(Date.now()-60*60000).toISOString()    },
  { id:"AML-2026-00861", cif:"CIF-882135", customer:"Vikram Iyer",     type:"PEP screening hit",        amount:12000000,context:"Customer flagged as PEP — enhanced due diligence required", risk:"High",     status:"Under Review", source:"Onboarding KYC",      date:new Date(Date.now()-24*60*60000).toISOString() },
  { id:"AML-2026-00844", cif:"CIF-880775", customer:"Sanjay Gupta",    type:"Unusual cash deposits",    amount:840000,  context:"6 ATM deposits of ₹1.4L each in 1 hour at 3 ATMs",         risk:"Medium",   status:"Cleared",     source:"Teller ops",          date:new Date(Date.now()-48*60*60000).toISOString() },
  { id:"AML-2026-00821", cif:"CIF-882129", customer:"Kabir Chatterjee",type:"Round-tripping",           amount:2000000, context:"Funds sent and returned within 24h via 3 accounts",         risk:"Medium",   status:"Open",        source:"Transaction monitor", date:new Date(Date.now()-72*60*60000).toISOString() },
];

export const FB_STAFF = [
  { id:"EMP-20481", name:"Ananya Kapoor",  email:"a.kapoor@meridianbank.in",  role:"Credit Officer",     branch:"014 Mumbai Andheri",        status:"Active",   last_login:new Date(Date.now()-5*60*60000).toISOString(),  actions_30d:281 },
  { id:"EMP-20412", name:"Suresh Bhatt",   email:"s.bhatt@meridianbank.in",   role:"Fraud Analyst",      branch:"014 Mumbai Andheri",        status:"Active",   last_login:new Date(Date.now()-6*60*60000).toISOString(),  actions_30d:194 },
  { id:"EMP-20388", name:"Rajesh Iyer",    email:"r.iyer@meridianbank.in",    role:"Collections Agent",  branch:"014 Mumbai Andheri",        status:"Active",   last_login:new Date(Date.now()-4*60*60000).toISOString(),  actions_30d:142 },
  { id:"EMP-20341", name:"Preethi Menon",  email:"p.menon@meridianbank.in",   role:"Compliance Officer", branch:"014 Mumbai Andheri",        status:"Active",   last_login:new Date(Date.now()-8*60*60000).toISOString(),  actions_30d:89  },
  { id:"EMP-20298", name:"Mukesh Das",     email:"m.das@meridianbank.in",     role:"Collections Agent",  branch:"022 Delhi Connaught Place", status:"Active",   last_login:new Date(Date.now()-4*60*60000).toISOString(),  actions_30d:118 },
  { id:"EMP-20191", name:"Sonali Rao",     email:"s.rao@meridianbank.in",     role:"KYC Officer",        branch:"031 Chennai Anna Nagar",   status:"Inactive", last_login:new Date(Date.now()-7*24*60*60000).toISOString(),actions_30d:0   },
  { id:"EMP-19882", name:"Anil Krishnan",  email:"a.krishnan@meridianbank.in",role:"Teller",             branch:"014 Mumbai Andheri",        status:"Active",   last_login:new Date(Date.now()-5*60*60000).toISOString(),  actions_30d:44  },
];

export const FB_AUDIT = [
  { id:"AUD-082941", when:new Date(Date.now()-5*60000).toISOString(),   who:"A. Kapoor", role:"Credit Officer",     entity:"Loan",       entity_ref:"LN-2026-08901", action:"Status updated",    before:"In Review",       after:"Credit Assessment", ip:"10.14.2.88",  branch:"014" },
  { id:"AUD-082938", when:new Date(Date.now()-5*60000).toISOString(),   who:"S. Bhatt",  role:"Fraud Analyst",      entity:"Fraud alert",entity_ref:"FR-2026-01148", action:"Alert created",     before:"—",               after:"Open · Critical",   ip:"10.14.2.91",  branch:"014" },
  { id:"AUD-082934", when:new Date(Date.now()-12*60000).toISOString(),  who:"System",    role:"Automated",          entity:"Account",    entity_ref:"ACC-2291",      action:"Auto-frozen",       before:"Active",          after:"Frozen",            ip:"—",           branch:"—"   },
  { id:"AUD-082930", when:new Date(Date.now()-27*60000).toISOString(),  who:"A. Kapoor", role:"Credit Officer",     entity:"KYC",        entity_ref:"CIF-882124",    action:"KYC approved",      before:"In Review",       after:"Approved",          ip:"10.14.2.88",  branch:"014" },
  { id:"AUD-082925", when:new Date(Date.now()-42*60000).toISOString(),  who:"R. Iyer",   role:"Collections Agent",  entity:"Loan",       entity_ref:"LN-2026-08742", action:"Contact logged",    before:"—",               after:"Outcome: No answer",ip:"10.14.2.102", branch:"014" },
  { id:"AUD-082918", when:new Date(Date.now()-70*60000).toISOString(),  who:"P. Menon",  role:"Compliance Officer", entity:"AML alert",  entity_ref:"AML-2026-00861",action:"Status updated",    before:"Open",            after:"Under Review",      ip:"10.14.2.99",  branch:"014" },
  { id:"AUD-082901", when:new Date(Date.now()-100*60000).toISOString(), who:"S. Bhatt",  role:"Fraud Analyst",      entity:"Fraud alert",entity_ref:"FR-2026-01131", action:"Alert cleared",     before:"Confirmed Fraud", after:"Cleared",           ip:"10.14.2.91",  branch:"014" },
  { id:"AUD-082882", when:new Date(Date.now()-172*60000).toISOString(), who:"A. Kapoor", role:"Credit Officer",     entity:"Loan",       entity_ref:"LN-2026-08842", action:"Dual-auth approved",before:"Approved (pending)",after:"Disbursed",        ip:"10.14.2.88",  branch:"014" },
  { id:"AUD-082870", when:new Date(Date.now()-240*60000).toISOString(), who:"R. Iyer",   role:"Credit Officer",     entity:"Loan",       entity_ref:"LN-2026-08801", action:"Loan rejected",     before:"Credit Assessment",after:"Rejected",          ip:"10.14.2.102", branch:"014" },
  { id:"AUD-082841", when:new Date(Date.now()-338*60000).toISOString(), who:"M. Das",    role:"Collections Agent",  entity:"Customer",   entity_ref:"CIF-882110",    action:"Contact outcome",   before:"No answer",       after:"Promise to pay",    ip:"10.14.2.120", branch:"022" },
];
