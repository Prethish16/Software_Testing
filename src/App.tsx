import { useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { Activity, AlertOctagon, AlertTriangle, ArrowDownRight, ArrowRight, Bell, Check, ChevronRight, CircleHelp, ClipboardList, Clock3, FileText, FlaskConical, Gauge, Home, LockKeyhole, Mail, Menu, MessageSquareText, ScanSearch, Search, Settings as SettingsIcon, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, UserRound, Wallet, X } from 'lucide-react';
import { Analysis, analyzeMessage, assessPayment, PaymentInput } from './engine';
import { getFirebaseAuth } from './firebase';

type Page = 'Dashboard'|'Scan Message'|'Scam Lab'|'Fraud Chain'|'Before I Pay'|'Reports'|'Settings';
type Report = { id: string; source: string; preview: string; result: Analysis; time: string };
const nav: Array<{name:Page;icon:typeof Home}> = [
  {name:'Dashboard',icon:Home},{name:'Scan Message',icon:ScanSearch},{name:'Scam Lab',icon:FlaskConical},{name:'Fraud Chain',icon:Activity},{name:'Before I Pay',icon:Wallet},{name:'Reports',icon:FileText},{name:'Settings',icon:SettingsIcon}
];
const samples = [
  {title:'Fake bank alert',tag:'CRITICAL',text:'URGENT: Your bank account will be blocked today. Click now to verify your account and enter your OTP and UPI PIN.'},
  {title:'Delivery fee scam',tag:'HIGH',text:'Your parcel is held. Pay a fee immediately to release your package. Click to verify delivery details.'},
  {title:'Unexpected prize',tag:'CAUTION',text:'Congratulations, you have won a free gift. Claim your prize today.'},
  {title:'Routine statement',tag:'SAFE',text:'Your monthly account statement is available in your official banking application. Contact support using the official website if you need help.'}
];
const levelClass = (level:string) => level.toLowerCase();
function RiskPill({level}:{level:string}) { return <span className={`risk-pill ${levelClass(level)}`}><span className="risk-dot" />{level}</span>; }
function ScoreRing({score}:{score:number}) { return <div className={`score-ring ${score>75?'critical':score>50?'high':score>25?'caution':'safe'}`} style={{'--score':`${score*3.6}deg`} as React.CSSProperties}><div><strong>{score}%</strong><span>Risk score</span></div></div>; }
function Stat({label,value,sub,icon:Icon,tone}:{label:string;value:string;sub:string;icon:typeof Shield; tone:string}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>; }

function AuthScreen({onAuthenticated}:{onAuthenticated:(name:string)=>void}) {
  const [mode,setMode] = useState<'login'|'register'>('login');
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [showPassword,setShowPassword] = useState(false);
  const [submitting,setSubmitting] = useState(false);

  const submit = async (event:React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Enter your name to create an account.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const auth = getFirebaseAuth();
      const normalizedEmail = trimmedEmail.toLowerCase();
      if (mode === 'register') {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(credential.user, {displayName:name.trim()});
        await signOut(auth);
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setMessage('Account created. Sign in with your new credentials.');
      } else {
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        onAuthenticated(credential.user.displayName || normalizedEmail.split('@')[0]);
      }
    } catch (cause) {
      const code = cause && typeof cause === 'object' && 'code' in cause ? cause.code : '';
      setError(code === 'auth/email-already-in-use' ? 'An account with this email already exists. Sign in instead.'
        : code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' ? 'Incorrect email or password.'
        : code === 'auth/too-many-requests' ? 'Too many attempts. Please wait and try again.'
        : cause instanceof Error ? cause.message : 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode:'login'|'register') => {
    setMode(nextMode);
    setError('');
    setMessage('');
  };

  return <div className="auth-shell">
    <div className="auth-brand"><div className="brand-mark"><ShieldCheck size={23}/></div><div><b>FINWALL</b><span>SCAMSTOP <i>DEMO</i></span></div></div>
    <div className="auth-layout">
      <section className="auth-story">
        <span className="auth-kicker"><span className="live-dot"/> YOUR PERSONAL SCAM CHECKPOINT</span>
        <h1>Pause the pressure.<br/><em>Protect your money.</em></h1>
        <p>Make safer decisions with a calm, clear second opinion before you click, share, or pay.</p>
        <div className="auth-points">
          <div><span><Check size={15}/></span><div><b>Spot suspicious signals</b><small>Understand the patterns behind risky messages.</small></div></div>
          <div><span><Check size={15}/></span><div><b>Check before you pay</b><small>Take a moment to review unexpected requests.</small></div></div>
          <div><span><Check size={15}/></span><div><b>Keep your decisions private</b><small>This educational demo runs locally in your browser.</small></div></div>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-card-heading"><div className="auth-icon"><LockKeyhole size={19}/></div><div><h2>{mode==='login'?'Welcome back':'Create your account'}</h2><p>{mode==='login'?'Sign in to continue to your safety center.':'Start building safer financial habits today.'}</p></div></div>
        <div className="auth-tabs" role="tablist"><button className={mode==='login'?'active':''} onClick={()=>switchMode('login')} type="button">Sign in</button><button className={mode==='register'?'active':''} onClick={()=>switchMode('register')} type="button">Register</button></div>
        <form onSubmit={submit} noValidate>
          {mode==='register'&&<label className="auth-field"><span>Full name</span><div className="auth-input"><UserRound size={17}/><input value={name} onChange={e=>{setName(e.target.value);setError('');}} placeholder="Your name" autoComplete="name"/></div></label>}
          <label className="auth-field"><span>Email address</span><div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError('');}} placeholder="you@example.com" autoComplete="email"/></div></label>
          <label className="auth-field"><span>Password</span><div className="auth-input"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('');}} placeholder="At least 6 characters" autoComplete={mode==='login'?'current-password':'new-password'}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?'Hide':'Show'}</button></div></label>
          {mode==='register'&&<label className="auth-field"><span>Confirm password</span><div className="auth-input"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);setError('');}} placeholder="Re-enter your password" autoComplete="new-password"/></div></label>}
          {message&&<div className="auth-message" role="status"><Check size={15}/>{message}</div>}
          {error&&<div className="auth-error" role="alert"><AlertTriangle size={15}/>{error}</div>}
          <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting?'Please wait…':mode==='login'?'Sign in to FINWALL':'Create account'}<ArrowRight size={16}/></button>
        </form>
        <p className="auth-disclaimer"><LockKeyhole size={13}/> Demo mode: no real personal or banking information is required.</p>
      </section>
    </div>
    <div className="auth-footer"><span>FINWALL · SCAMSTOP</span><span>Educational prototype · Always verify independently</span></div>
  </div>;
}

export default function App() {
  const [authenticated,setAuthenticated] = useState(false);
  const [userName,setUserName] = useState('');
  const [profileOpen,setProfileOpen] = useState(false);
  const [page,setPage] = useState<Page>('Dashboard');
  const [message,setMessage] = useState('');
  const [analysis,setAnalysis] = useState<Analysis|null>(null);
  const [error,setError] = useState('');
  const [reports,setReports] = useState<Report[]>([]);
  const [protection,setProtection] = useState(true);
  const [sensitivity,setSensitivity] = useState('Balanced');
  const [notice,setNotice] = useState('');
  const [payment,setPayment] = useState<PaymentInput>({recipient:'',purpose:'',amount:0,newRecipient:false,urgency:false});
  const [paymentResult,setPaymentResult] = useState<Analysis|null>(null);
  const [scenario,setScenario] = useState(0);
  const [chainReport,setChainReport] = useState<Report|null>(null);
  const totalScans = reports.length;
  const threats = reports.filter(r=>r.result.score>25).length;
  const latest = reports[0];
  const runScan = (value=message) => {
    try {
      const result = analyzeMessage(value);
      const item:Report = {id:`FW-${Date.now().toString().slice(-7)}`,source:'Message scan',preview:value.slice(0,100),result,time:new Date().toLocaleString()};
      setAnalysis(result); setMessage(value); setError(''); setReports(old=>[item,...old]); setNotice('Scan completed and added to Reports.');
    } catch(e) { setAnalysis(null); setError(e instanceof Error?e.message:'Unable to analyze this input.'); setNotice(''); }
  };
  const runPayment = () => {
    try {
      const result=assessPayment(payment);
      setPaymentResult(result); setError(''); setReports(old=>[{id:`FW-${Date.now().toString().slice(-7)}`,source:'Before I Pay',preview:`${payment.recipient} · ₹${payment.amount}`,result,time:new Date().toLocaleString()},...old]); setNotice('Payment assessment saved to Reports.');
    } catch(e) { setPaymentResult(null); setError(e instanceof Error?e.message:'Unable to assess payment.'); }
  };
  const openReport = (r:Report) => { setChainReport(r); setAnalysis(r.result); setMessage(r.preview); setPage('Fraud Chain'); };
  const logOut = async () => {
    try {
      await signOut(getFirebaseAuth());
      setAuthenticated(false); setUserName(''); setPage('Dashboard'); setProfileOpen(false); setNotice(''); setError('');
    } catch (cause) {
      setProfileOpen(false);
      setError(cause instanceof Error ? cause.message : 'Unable to log out. Please try again.');
    }
  };
  const title = page==='Dashboard'?'Your financial safety, at a glance':page==='Scan Message'?'Analyze before you act':page==='Scam Lab'?'Learn to recognize the playbook':page==='Fraud Chain'?'Understand how risk builds':page==='Before I Pay'?'Pause. Verify. Then pay.':page==='Reports'?'Your security activity': 'Make protection work for you';
  const description = page==='Dashboard'?'A clearer view of suspicious signals and your recent activity.':page==='Scan Message'?'Paste a message or payment request to check for common scam indicators.':page==='Scam Lab'?'Explore safe simulations. No real links, transactions, or money are involved.':page==='Fraud Chain'?'Review the signals contributing to a scan result.':page==='Before I Pay'?'Assess a payment request using the details you know.':page==='Reports'?'Review scan history captured during this browser session.':'Control demo protection and analysis preferences.';
  const currentResult = chainReport?.result || analysis;
  const chartData = useMemo(()=>[ {label:'Safe',count:reports.filter(r=>r.result.level==='Safe').length,color:'var(--safe)'},{label:'Caution',count:reports.filter(r=>r.result.level==='Caution').length,color:'var(--caution)'},{label:'High',count:reports.filter(r=>r.result.level==='High').length,color:'var(--high)'},{label:'Critical',count:reports.filter(r=>r.result.level==='Critical').length,color:'var(--critical)'}], [reports]);
  if (!authenticated) return <AuthScreen onAuthenticated={name=>{setUserName(name);setAuthenticated(true);}} />;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ShieldCheck size={23}/></div><div><b>FINWALL</b><span>SCAMSTOP <i>DEMO</i></span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(({name,icon:Icon})=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>{setPage(name);setNotice('');setError('');}}><Icon size={18}/><span>{name}</span>{name==='Reports'&&reports.length>0&&<em>{reports.length}</em>}{page===name&&<ChevronRight className="nav-arrow" size={15}/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="protection-mini"><span className={`live-dot ${protection?'':'off'}`}/><div><b>{protection?'Protection enabled':'Protection paused'}</b><small>Browser demo only</small></div><button aria-label="Toggle protection" onClick={()=>setProtection(!protection)} className={`switch ${protection?'on':''}`}><span/></button></div><div className="privacy-note"><LockKeyhole size={14}/></div><div className="version">FINWALL · Prototype v1.0</div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><b>{page}</b></div><div className="top-actions"><span className="demo-label"></span><button className="icon-button" aria-label="Notifications" onClick={()=>setNotice('No new notifications in this demo.')}><Bell size={18}/></button><div className="profile-menu"><button className={`avatar profile-trigger ${profileOpen?'open':''}`} title={userName} aria-label="Open profile menu" aria-expanded={profileOpen} onClick={()=>setProfileOpen(open=>!open)}>{userName.slice(0,2).toUpperCase()||'FW'}</button>{profileOpen&&<div className="profile-dropdown" role="menu"><button role="menuitem" onClick={()=>{setPage('Settings');setProfileOpen(false);setNotice('');setError('');}}><SettingsIcon size={15}/>Settings</button><button role="menuitem" onClick={logOut}><LockKeyhole size={15}/>Log out</button></div>}</div></div></header>
      <div className="content-wrap">
        <div className="page-heading"><div><div className="eyebrow"><Sparkles size={13}/> FINANCIAL SECURITY CENTER</div><h1>{title}</h1><p>{description}</p></div>{page==='Dashboard'&&<button className="button button-primary" onClick={()=>setPage('Scan Message')}><ScanSearch size={16}/> New scan <ArrowRight size={15}/></button>}</div>
        {notice&&<div className="notice"><Check size={16}/>{notice}<button aria-label="Dismiss notice" onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {error&&<div className="error-banner" role="alert"><AlertTriangle size={16}/>{error}</div>}
        {page==='Dashboard'&&<div className="page-content">
          <div className="hero-card"><div className="hero-copy"><div className="hero-kicker"><span className="live-dot"/> YOUR PERSONAL SCAM CHECKPOINT</div><h2>Pause the pressure.<br/><em>Protect your money.</em></h2><p>Spot common social-engineering patterns before they turn into costly decisions.</p><button className="button button-light" onClick={()=>setPage('Scan Message')}>Analyze a message <ArrowRight size={16}/></button><div className="hero-foot"><ShieldCheck size={15}/> Educational demo · Always verify independently</div></div><div className="hero-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-shield"><ShieldCheck size={67} strokeWidth={1.2}/></div><div className="float-card float-card-top"><span className="float-icon green"><Check size={14}/></span><div><b>Signals analyzed</b><small>Rule-based checks</small></div></div><div className="float-card float-card-bottom"><span className="float-icon amber"><Activity size={14}/></span><div><b>Risk explained</b><small>Clear indicators</small></div></div></div></div>
          <div className="stats-grid"><Stat label="Messages scanned" value={String(totalScans)} sub="This browser session" icon={MessageSquareText} tone="blue"/><Stat label="Potential threats" value={String(threats)} sub="Score above 25%" icon={ShieldAlert} tone="red"/><Stat label="Safe classifications" value={String(reports.filter(r=>r.result.level==='Safe').length)} sub="Based on demo rules" icon={ShieldCheck} tone="green"/><Stat label="Protection status" value={protection?'Active':'Paused'} sub="Local demo toggle" icon={Activity} tone="purple"/></div>
          <div className="dashboard-grid"><section className="panel quick-panel"><div className="panel-heading"><div><h3>Security tools</h3><p>Choose a place to start</p></div><SlidersHorizontal size={18}/></div><div className="tool-list">{[{name:'Scan a message',desc:'Check SMS, email or payment text',icon:ScanSearch,p:'Scan Message' as Page,color:'blue'},{name:'Before I Pay',desc:'Review a payment request',icon:Wallet,p:'Before I Pay' as Page,color:'green'},{name:'Explore Scam Lab',desc:'Practice spotting red flags',icon:FlaskConical,p:'Scam Lab' as Page,color:'orange'}].map(t=><button className="tool-row" key={t.name} onClick={()=>setPage(t.p)}><span className={`tool-icon ${t.color}`}><t.icon size={18}/></span><span className="tool-copy"><b>{t.name}</b><small>{t.desc}</small></span><ArrowRight size={16}/></button>)}</div></section>
          <section className="panel recent-panel"><div className="panel-heading"><div><h3>Recent activity</h3><p>Your latest scans</p></div><button className="text-button" onClick={()=>setPage('Reports')}>View all <ArrowRight size={14}/></button></div>{latest?<div className="recent-item"><div className="recent-file"><FileText size={18}/></div><div className="recent-copy"><b>{latest.source}</b><small>{latest.preview}</small><span>{latest.time}</span></div><RiskPill level={latest.result.level}/></div>:<div className="empty-state compact"><div className="empty-icon"><Clock3 size={22}/></div><b>No scans yet</b><p>Your completed scans will appear here.</p><button className="text-button" onClick={()=>setPage('Scan Message')}>Run your first scan <ArrowRight size={14}/></button></div>}</section></div>
          <div className="bottom-note"><div className="note-icon"><CircleHelp size={18}/></div><div><b>A helpful reminder</b><p>This prototype uses local, rule-based checks. A low score doesn't prove a message is legitimate. Never share your OTP or UPI PIN, and verify requests through official channels.</p></div></div>
        </div>}
        {page==='Scan Message'&&<div className="page-content scan-layout"><section className="panel scan-form"><div className="panel-heading"><div><h3>Message analyzer</h3><p>Paste the text you want to check</p></div><span className="step-badge">01 / ANALYZE</span></div><label className="field-label" htmlFor="message">Message or payment request</label><textarea id="message" value={message} onChange={e=>{setMessage(e.target.value);setError('');}} placeholder="Paste a suspicious SMS, email, URL text or payment request here…" maxLength={5100}/><div className="input-meta"><span>Don't include real personal or banking information.</span><span>{message.length.toLocaleString()} / 5,000</span></div><button className="button button-primary full-button" onClick={()=>runScan()}><ScanSearch size={17}/> Analyze message <ArrowRight size={16}/></button><div className="divider-label"><span/>TRY A SAMPLE<span/></div><div className="sample-grid">{samples.map(s=><button key={s.title} className="sample-button" onClick={()=>{setMessage(s.text);setError('');setAnalysis(null);}}><span className={`sample-dot ${s.tag.toLowerCase()}`}/><span>{s.title}</span><ArrowDownRight size={14}/></button>)}</div></section><section className="panel result-panel"><div className="panel-heading"><div><h3>Analysis result</h3><p>Signals and recommendations</p></div><span className="result-live"><span className="live-dot"/> LIVE RESULT</span></div>{analysis?<><div className="result-summary"><ScoreRing score={analysis.score}/><div className="result-meta"><span className="eyebrow">CLASSIFICATION</span><RiskPill level={analysis.level}/><h4>{analysis.level==='Safe'?'No configured signals found':analysis.level==='Caution'?'Some signals deserve attention':analysis.level==='High'?'High-risk patterns detected':'Critical risk indicators detected'}</h4><p>{analysis.summary}</p></div></div><div className="signal-heading"><b>Contributing indicators</b><span>{analysis.signals.length} found</span></div>{analysis.signals.length?analysis.signals.map(s=><div className="signal-row" key={s.label}><span className="signal-mark"><AlertTriangle size={15}/></span><div><b>{s.label}</b><p>{s.detail}</p></div><strong>+{s.weight}</strong></div>):<div className="no-signals"><Check size={17}/> No configured risk patterns matched this input.</div>}<div className="recommendation"><ShieldCheck size={18}/><div><b>Recommended next step</b><p>{analysis.recommendation}</p></div></div><button className="button button-secondary full-button" onClick={()=>{setChainReport(reports[0]||null);setPage('Fraud Chain')}}>View risk breakdown <ArrowRight size={15}/></button></>:<div className="empty-state"><div className="empty-icon"><ScanSearch size={24}/></div><b>Ready when you are</b><p>Run a scan to see a risk score, matched indicators and a suggested next step.</p><div className="empty-steps"><span><Check size={13}/> Rule-based checks</span><span><Check size={13}/> Explainable results</span><span><Check size={13}/> Local-only demo</span></div></div>}</section></div>}
        {page==='Scam Lab'&&<div className="page-content"><div className="lab-intro"><div className="lab-symbol"><FlaskConical size={26}/></div><div><h2>Practice without the risk</h2><p>Explore common scam scripts and learn what makes them suspicious. These are fictional training examples.</p></div></div><div className="scenario-grid">{samples.map((s,i)=><button key={s.title} className={`scenario-card ${scenario===i?'selected':''}`} onClick={()=>setScenario(i)}><div className="scenario-top"><span className={`scenario-index ${s.tag.toLowerCase()}`}>0{i+1}</span><RiskPill level={s.tag==='SAFE'?'Safe':s.tag==='CAUTION'?'Caution':s.tag==='HIGH'?'High':'Critical'}/></div><h3>{s.title}</h3><p>{s.text}</p><span className="scenario-action">{scenario===i?'Selected scenario':'Explore scenario'} <ArrowRight size={14}/></span></button>)}</div><section className="panel simulation-panel"><div className="panel-heading"><div><h3>Simulation workbench</h3><p>Selected training scenario</p></div><span className="step-badge">SAFE SIMULATION</span></div><div className="fake-message"><div className="fake-message-head"><span className="fake-avatar">?</span><div><b>Unknown sender</b><small>Fictional training message</small></div><span className="fake-time">Now</span></div><p>{samples[scenario].text}</p></div><div className="simulation-footer"><div><b>Ready to analyze this example?</b><p>It will be saved to your local session report history.</p></div><button className="button button-primary" onClick={()=>{setMessage(samples[scenario].text);runScan(samples[scenario].text);setPage('Scan Message');}}>Analyze scenario <ArrowRight size={15}/></button></div></section></div>}
        {page==='Fraud Chain'&&<div className="page-content"><section className="panel chain-summary"><div className="panel-heading"><div><h3>Risk contribution timeline</h3><p>Signals are shown in the order used by the rules engine.</p></div><Activity size={19}/></div>{currentResult?<><div className="chain-score"><ScoreRing score={currentResult.score}/><div><span className="eyebrow">OVERALL RESULT</span><h2>{currentResult.level} risk</h2><p>{currentResult.summary}</p><RiskPill level={currentResult.level}/></div></div><div className="timeline">{currentResult.signals.length?currentResult.signals.map((s,i)=><div className="timeline-row" key={s.label}><div className="timeline-rail"><span>{i+1}</span></div><div className="timeline-content"><div className="timeline-title"><b>{s.label}</b><strong>+{s.weight} pts</strong></div><p>{s.detail}</p><div className="contribution-track"><span style={{width:`${s.weight}%`}}/></div></div></div>):<div className="no-signals"><Check size={17}/> No configured risk indicators contributed to this result.</div>}</div><div className="risk-scale"><span>0 · Safe</span><span>26 · Caution</span><span>51 · High</span><span>76 · Critical</span></div></>:<div className="empty-state"><div className="empty-icon"><Activity size={23}/></div><b>No analysis to visualize</b><p>Scan a message or assess a payment first to see its risk breakdown.</p><button className="button button-primary" onClick={()=>setPage('Scan Message')}>Start a scan</button></div>}</section><div className="bottom-note"><div className="note-icon"><CircleHelp size={18}/></div><div><b>How to interpret this timeline</b><p>Each listed signal contributes a fixed number of points. The total is capped at 100. This is a transparent demonstration rule set, not a validated fraud prediction model.</p></div></div></div>}
        {page==='Before I Pay'&&<div className="page-content scan-layout"><section className="panel payment-form"><div className="panel-heading"><div><h3>Payment details</h3><p>Use fictional sample details only.</p></div><Wallet size={19}/></div><label className="field-label" htmlFor="recipient">Who are you paying?</label><input id="recipient" value={payment.recipient} onChange={e=>setPayment({...payment,recipient:e.target.value})} placeholder="Recipient or business name"/><label className="field-label" htmlFor="purpose">What is the payment for?</label><input id="purpose" value={payment.purpose} onChange={e=>setPayment({...payment,purpose:e.target.value})} placeholder="e.g. dinner, service, delivery fee"/><label className="field-label" htmlFor="amount">Amount (INR ₹)</label><input id="amount" type="number" min="1" max="100000000" value={payment.amount||''} onChange={e=>setPayment({...payment,amount:Number(e.target.value)})} placeholder="Enter amount"/><label className="check-row"><input type="checkbox" checked={payment.newRecipient} onChange={e=>setPayment({...payment,newRecipient:e.target.checked})}/><span><b>I've never paid this recipient before</b><small>New recipients deserve extra verification.</small></span></label><label className="check-row"><input type="checkbox" checked={payment.urgency} onChange={e=>setPayment({...payment,urgency:e.target.checked})}/><span><b>I'm being pressured to pay urgently</b><small>Pressure is a common social-engineering tactic.</small></span></label><button className="button button-primary full-button" onClick={runPayment}><ShieldCheck size={17}/> Assess payment risk</button><div className="secure-foot"><LockKeyhole size={14}/> Demo-only assessment. No payment is made.</div></section><section className="panel result-panel"><div className="panel-heading"><div><h3>Payment risk assessment</h3><p>Review the result before deciding</p></div><Shield size={19}/></div>{paymentResult?<><div className="result-summary"><ScoreRing score={paymentResult.score}/><div className="result-meta"><span className="eyebrow">ESTIMATED RISK</span><RiskPill level={paymentResult.level}/><h4>{paymentResult.level==='Safe'?'Few configured warning signs':`${paymentResult.level} payment risk`}</h4><p>{paymentResult.summary}</p></div></div>{paymentResult.signals.map(s=><div className="signal-row" key={s.label}><span className="signal-mark"><AlertTriangle size={15}/></span><div><b>{s.label}</b><p>{s.detail}</p></div><strong>+{s.weight}</strong></div>)}<div className="recommendation"><ShieldCheck size={18}/><div><b>Before sending money</b><p>{paymentResult.recommendation}</p></div></div></>:<div className="empty-state"><div className="empty-icon"><Wallet size={24}/></div><b>Check before you pay</b><p>Complete the details on the left. We'll explain which configured risk signals were triggered.</p><div className="empty-steps"><span><Check size={13}/> Recipient checks</span><span><Check size={13}/> Amount checks</span><span><Check size={13}/> Pressure indicators</span></div></div>}</section></div>}
        {page==='Reports'&&<div className="page-content"><div className="stats-grid"><Stat label="Total records" value={String(reports.length)} sub="Current session only" icon={ClipboardList} tone="blue"/><Stat label="High / Critical" value={String(reports.filter(r=>r.result.score>50).length)} sub="Scores above 50%" icon={AlertOctagon} tone="red"/><Stat label="Safe" value={String(reports.filter(r=>r.result.level==='Safe').length)} sub="No configured signals" icon={ShieldCheck} tone="green"/><Stat label="Caution" value={String(reports.filter(r=>r.result.level==='Caution').length)} sub="Review suggested" icon={AlertTriangle} tone="purple"/></div><section className="panel report-panel"><div className="panel-heading"><div><h3>Scan history</h3><p>Stored in memory for this browser session only.</p></div><button className="button button-secondary button-small" disabled={!reports.length} onClick={()=>{setReports([]);setChainReport(null);setAnalysis(null);setNotice('Session report history cleared.');}}>Clear history</button></div>{reports.length?<div className="report-table-wrap"><table className="report-table"><thead><tr><th>Reference</th><th>Source / preview</th><th>Risk score</th><th>Classification</th><th>Action</th></tr></thead><tbody>{reports.map(r=><tr key={r.id}><td><b>{r.id}</b><small>{r.time}</small></td><td><b>{r.source}</b><small>{r.preview}</small></td><td><strong>{r.result.score}%</strong></td><td><RiskPill level={r.result.level}/></td><td><button className="table-action" onClick={()=>openReport(r)}>View chain <ArrowRight size={13}/></button></td></tr>)}</tbody></table></div>:<div className="empty-state compact"><div className="empty-icon"><FileText size={23}/></div><b>No report records</b><p>Complete a message scan or payment assessment to create a record.</p><button className="button button-primary" onClick={()=>setPage('Scan Message')}>Create first report</button></div>}</section><section className="panel distribution-panel"><div className="panel-heading"><div><h3>Risk distribution</h3><p>Count by classification, based on actual session records</p></div></div><div className="distribution">{chartData.map(c=><div className="distribution-row" key={c.label}><span>{c.label}</span><div className="distribution-track"><span style={{width:`${reports.length?c.count/reports.length*100:0}%`,background:c.color}}/></div><b>{c.count}</b></div>)}</div><p className="chart-caption">Use these recorded counts to prepare the assignment's test-result pie chart after executing your test cases.</p></section></div>}
        {page==='Settings'&&<div className="page-content settings-layout"><section className="panel settings-panel"><div className="panel-heading"><div><h3>Protection preferences</h3><p>These settings only affect this demo interface.</p></div><SettingsIcon size={19}/></div><div className="setting-row"><div className="setting-icon"><ShieldCheck size={18}/></div><div className="setting-copy"><b>Protection status</b><p>Toggle the demo protection indicator shown in the sidebar.</p></div><button aria-label="Toggle protection status" onClick={()=>setProtection(!protection)} className={`switch ${protection?'on':''}`}><span/></button></div><div className="setting-row"><div className="setting-icon"><SlidersHorizontal size={18}/></div><div className="setting-copy"><b>Analysis sensitivity</b><p>Preference placeholder for the demo; rules are unchanged by this setting.</p></div><select aria-label="Analysis sensitivity" value={sensitivity} onChange={e=>setSensitivity(e.target.value)}><option>Conservative</option><option>Balanced</option><option>Strict</option></select></div><div className="setting-row"><div className="setting-icon"><Bell size={18}/></div><div className="setting-copy"><b>Notifications</b><p>Show a confirmation notice after demo actions.</p></div><span className="setting-state">In-app</span></div><div className="setting-row"><div className="setting-icon"><LockKeyhole size={18}/></div><div className="setting-copy"><b>Privacy & data</b><p>Analysis happens in the browser. This prototype has no backend and does not transmit your messages.</p></div><span className="setting-state green-text">Local-only</span></div></section><div className="bottom-note"><div className="note-icon"><CircleHelp size={18}/></div><div><b>Prototype limitations</b><p>OCR, live SMS/WhatsApp access, QR camera scanning, remote monitoring and real banking integrations are not implemented in this version.</p></div></div></div>}
        <footer className="footer"><span>© 2026 FINWALL · Educational prototype</span></footer>
      </div>
    </main>
  </div>;
}