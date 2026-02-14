import React, { useState, useEffect } from 'react';
import {
  Shield, Menu, X, ChevronRight, ChevronDown, Lock, Plane,
  CreditCard, CheckCircle, User, MapPin, Clock, AlertCircle,
  Check, DollarSign, Calendar, Filter, XCircle, Search
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from 'firebase/auth';
import {
  getFirestore, collection, doc, getDoc, setDoc, onSnapshot,
  serverTimestamp, runTransaction, query, orderBy
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDv7h3M2UIB-ApGaPW-ptBvus336p2Q0_s",
  authDomain: "club-94d16.firebaseapp.com",
  projectId: "club-94d16",
  storageBucket: "club-94d16.firebasestorage.app",
  messagingSenderId: "753611483043",
  appId: "1:753611483043:web:2458e9a7afcff92b2e5c16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = '57-club-v1';

// --- STYLING & UTILS ---
const COLORS = {
  bg: 'bg-zinc-50',
  card: 'bg-white',
  text: 'text-zinc-900',
  subtext: 'text-zinc-500',
  border: 'border-zinc-200',
  primary: 'bg-zinc-900',
  primaryText: 'text-white',
  accent: 'text-zinc-600',
};

// --- COMPONENT: BUTTON ---
const Button = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false, type = "button" }) => {
  const baseStyle = "py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: `${COLORS.primary} ${COLORS.primaryText} hover:bg-zinc-800 shadow-sm`,
    outline: `bg-transparent border ${COLORS.border} ${COLORS.text} hover:bg-zinc-100`,
    ghost: `bg-transparent ${COLORS.subtext} hover:text-zinc-900 hover:bg-zinc-100/50`,
    cta: "bg-zinc-900 text-white hover:bg-black shadow-md"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// --- COMPONENT: SPINNER ---
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin mb-4"></div>
    <h2 className="font-serif text-lg text-zinc-900">57 Club</h2>
  </div>
);

// --- COMPONENT: BOTTOM DOCK ---
const BottomDock = ({ foundingCount, onJoin }) => (
  <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-in slide-in-from-bottom-4 duration-700 delay-500">
    <div className="bg-zinc-900/95 backdrop-blur-md text-white rounded-full p-2 pl-6 pr-2 flex items-center gap-6 shadow-2xl border border-zinc-800 ring-1 ring-black/5 max-w-md w-full md:w-auto justify-between md:justify-start">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Founding Member</span>
        </div>
        <div className="text-sm font-medium text-white flex gap-1">
          <span className="font-serif italic text-zinc-400">#</span>
          {foundingCount} <span className="text-zinc-500">/ 200 claimed</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-xs text-zinc-400 font-medium tracking-wide">$57/mo locked</span>
        <button
          onClick={onJoin}
          className="bg-white text-zinc-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors"
        >
          Join Club
        </button>
      </div>
    </div>
  </div>
);

// --- COMPONENT: FIT CHECK MODAL ---
const FitCheckModal = ({ isOpen, onClose, onQualified }) => {
  const [step, setStep] = useState(0); // 0: Intro, 1: Q1, 2: Q2, 3: Fail
  const [answers, setAnswers] = useState({ flexibleDates: null, flexibleDestination: null });

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers({ flexibleDates: null, flexibleDestination: null });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFail = () => setStep(3);

  const handleQ1 = (yes) => {
    setAnswers((p) => ({ ...p, flexibleDates: yes }));
    if (!yes) return handleFail();
    setStep(2);
  };

  const handleQ2 = (yes) => {
    setAnswers((p) => ({ ...p, flexibleDestination: yes }));
    if (!yes) return handleFail();
    onQualified({ ...answers, flexibleDestination: true });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fit Check</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {step === 0 && (
            <>
              <h3 className="font-serif text-2xl text-zinc-900 mb-4">Is 57 Club right for you?</h3>
              <p className="text-zinc-500 mb-8">We restrict membership to ensure inventory access. Please answer 2 quick questions.</p>
              <Button onClick={() => setStep(1)} fullWidth>Start Check</Button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="mb-6 flex justify-center"><Calendar size={32} className="text-zinc-900" /></div>
              <h3 className="font-serif text-xl text-zinc-900 mb-4">Can you travel mid-week (Sun-Thu) OR book last-minute (within 30 days)?</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleQ1(false)}>No</Button>
                <Button variant="primary" onClick={() => handleQ1(true)}>Yes</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6 flex justify-center"><MapPin size={32} className="text-zinc-900" /></div>
              <h3 className="font-serif text-xl text-zinc-900 mb-4">Are you flexible on destination or specific hotel brands?</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleQ2(false)}>No</Button>
                <Button variant="primary" onClick={() => handleQ2(true)}>Yes</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-6 flex justify-center"><XCircle size={32} className="text-zinc-400" /></div>
              <h3 className="font-serif text-xl text-zinc-900 mb-4">We might not be a fit.</h3>
              <p className="text-zinc-500 mb-8">Our membership is best for flexible travelers. We don't want you paying for something you won't use.</p>
              <Button variant="outline" onClick={onClose} fullWidth>Close</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: DROP DETAIL MODAL ---
const DropDetailModal = ({ drop, onClose }) => {
  if (!drop) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="relative h-64 bg-zinc-200 shrink-0">
          {drop.image ? (
            <img src={drop.image} alt={drop.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400"><Plane size={48} /></div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-zinc-900 hover:bg-white"><X size={20} /></button>
          <div className="absolute bottom-4 left-4 bg-zinc-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
            {drop.type}
          </div>
        </div>
        <div className="p-8 overflow-y-auto">
          <h2 className="font-serif text-3xl text-zinc-900 mb-2">{drop.title}</h2>
          <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
            <MapPin size={16} /> {drop.location}
          </div>
          <p className="text-zinc-600 leading-relaxed mb-8">{drop.description}</p>

          <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100 mb-8">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-4">
              <span className="text-sm font-medium text-zinc-500">Member Access</span>
              <span className="font-serif text-xl text-zinc-900">Taxes Only</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 items-start text-sm text-zinc-600">
                <Check size={16} className="text-zinc-900 shrink-0 mt-0.5" /> Direct Booking Link
              </div>
              <div className="flex gap-2 items-start text-sm text-zinc-600">
                <Check size={16} className="text-zinc-900 shrink-0 mt-0.5" /> Rate Code Included
              </div>
            </div>
          </div>

          <Button fullWidth onClick={() => window.open(drop.link, '_blank')}>
            Proceed to Booking
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- HELPERS ---
const toMillisSafe = (v) => {
  if (!v) return null;
  try {
    if (typeof v?.toDate === 'function') return v.toDate().getTime(); // Firestore Timestamp
    if (v instanceof Date) return v.getTime();
    if (typeof v === 'string' || typeof v === 'number') {
      const d = new Date(v);
      const t = d.getTime();
      return Number.isFinite(t) ? t : null;
    }
    return null;
  } catch {
    return null;
  }
};

// --- COMPONENT: DROP CARD ---
const DropCard = ({ drop, onClick }) => {
  const expiresAtMs = toMillisSafe(drop.expiresAt);
  const isExpiring = expiresAtMs ? (expiresAtMs - Date.now() < 259200000) : false; // 72 hours

  return (
    <div
      onClick={() => onClick(drop)}
      className={`group flex flex-col ${COLORS.card} rounded-xl overflow-hidden border ${COLORS.border} shadow-sm transition-all hover:shadow-md cursor-pointer`}
    >
      <div className="relative h-48 w-full bg-zinc-200 overflow-hidden">
        <div className="absolute inset-0 bg-zinc-300 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400">
          {drop.image ? (
            <img src={drop.image} alt={drop.title} className="w-full h-full object-cover" />
          ) : (
            <Plane size={32} />
          )}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide text-zinc-900 shadow-sm">
          {drop.type}
        </div>
        {drop.isNew && (
          <div className="absolute top-3 left-3 bg-zinc-900 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
            NEW DROP
          </div>
        )}
        {isExpiring && !drop.isNew && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
            <Clock size={10} /> EXPIRING
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-medium text-zinc-900 leading-tight">{drop.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-zinc-500 text-sm mb-3">
          <MapPin size={14} />
          {drop.location}
        </div>
        <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
          {drop.description}
        </p>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 uppercase tracking-wider">MEMBER PRICE</span>
            <span className="text-sm font-semibold text-zinc-900">Taxes & Fees Only</span>
          </div>
          <Button variant="outline" className="!py-2 !px-4 text-sm pointer-events-none">
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: BLURRED LIST ITEM ---
const BlurredListItem = () => (
  <div className="flex items-center justify-between p-4 border-b border-zinc-100 last:border-0">
    <div className="space-y-2 w-1/3">
      <div className="h-4 bg-zinc-200 rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-zinc-100 rounded w-1/2"></div>
    </div>
    <div className="hidden md:block w-1/4">
      <div className="h-6 bg-zinc-100 rounded-full w-20 mx-auto"></div>
    </div>
    <div className="w-1/4 flex flex-col items-end gap-1">
      <div className="h-5 bg-zinc-300 rounded w-16 filter blur-[2px]"></div>
      <div className="h-3 bg-zinc-100 rounded w-10"></div>
    </div>
  </div>
);

// --- PAGE COMPONENTS ---
const Navbar = ({ view, setView, userData, handleLogout, handleJoinClick, handleLoginClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${view === 'landing' ? 'bg-white/80 backdrop-blur border-b border-zinc-100' : 'bg-white border-b border-zinc-200'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div
          onClick={() => userData?.status === 'active' ? setView('portal') : setView('landing')}
          className="font-serif text-2xl font-bold tracking-tighter cursor-pointer flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-white font-sans text-xs font-bold">57</div>
          57 Club
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          {userData?.status === 'active' ? (
            <>
              <button onClick={() => setView('portal')} className="hover:text-zinc-900">Drops</button>
              <button onClick={() => setView('account')} className="hover:text-zinc-900">Account</button>
              <span className="text-zinc-300">|</span>
              <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-900">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={handleLoginClick} className="hover:text-zinc-900">Member Login</button>
              <Button onClick={handleJoinClick} variant="primary" className="!py-2 !px-4 text-xs">
                Join Club
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-zinc-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-zinc-200 p-6 flex flex-col gap-4 shadow-xl md:hidden">
          {userData?.status === 'active' ? (
            <>
              <button onClick={() => { setView('portal'); setMobileMenuOpen(false); }} className="text-left font-medium py-2">Drops</button>
              <button onClick={() => { setView('account'); setMobileMenuOpen(false); }} className="text-left font-medium py-2">Account</button>
              <button onClick={handleLogout} className="text-left font-medium py-2 text-red-600">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { handleLoginClick(); setMobileMenuOpen(false); }} className="text-left font-medium py-2">Log In</button>
              <button onClick={() => { handleJoinClick(); setMobileMenuOpen(false); }} className="w-full bg-zinc-900 text-white py-3 rounded-lg font-bold">Join Now</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const AuthPage = ({ setView, initialMode }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', '').replace('auth/', ''));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-zinc-50 pt-16">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-zinc-200 shadow-sm">
        <h2 className="font-serif text-2xl mb-6 text-center">{isLogin ? 'Member Login' : 'Create Account'}</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth variant="primary">
            {isLogin ? 'Sign In' : 'Continue'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-zinc-500 hover:text-zinc-900">
            {isLogin ? "Need an account? Join." : "Already a member? Sign in."}
          </button>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ handleJoinClick }) => (
  <div className="pt-24 pb-40">
    {/* 1. HERO */}
    <section className="px-6 max-w-4xl mx-auto text-center mt-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="font-serif text-5xl md:text-7xl text-zinc-900 leading-[1] mb-8 tracking-tight">
        Access luxury hotels for<br className="hidden md:block" /> just taxes and fees.
      </h1>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
        <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
          <CheckCircle size={16} className="text-zinc-900" /> Unsold Inventory
        </div>
        <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
          <CheckCircle size={16} className="text-zinc-900" /> Direct Booking Links
        </div>
        <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
          <CheckCircle size={16} className="text-zinc-900" /> No Markup
        </div>
      </div>
      <div className="inline-block bg-zinc-100 px-4 py-2 rounded-lg border border-zinc-200">
        <p className="text-xs text-zinc-500 font-medium">
          <span className="font-bold text-zinc-900">Note:</span> This is for flexible travelers (Sun–Thu / last-minute). Not for fixed wedding dates.
        </p>
      </div>
      <div className="flex justify-center mt-12">
        <ChevronDown className="text-zinc-300 animate-bounce" size={24} />
      </div>
    </section>

    {/* 2. THE MATH */}
    <section className="px-6 max-w-5xl mx-auto mb-32">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">How it works</h2>
        <p className="font-serif text-xl text-zinc-900">
          Hotels won’t discount publicly. They release inventory privately. <br />That’s what you’re buying access to.
        </p>
      </div>
      <div className="grid md:grid-cols-2 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
        <div className="p-12 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between opacity-50 grayscale">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">The Public Pays</div>
          <div>
            <div className="text-5xl font-serif text-zinc-900 line-through decoration-zinc-400 mb-2">$1,200</div>
            <div className="flex flex-col gap-1 text-sm text-zinc-500">
              <span>+ 4 Nights Vegas ($240/night)</span>
              <span>+ Hotel Profit Margin</span>
              <span>+ Marketing Spend</span>
              <span>+ Resort Fees ($240)</span>
            </div>
          </div>
        </div>
        <div className="p-12 flex flex-col justify-between bg-white relative">
          <div className="absolute top-6 right-6 text-[10px] font-bold border border-zinc-900 px-2 py-1 rounded text-zinc-900">57 CLUB</div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">You Pay</div>
          <div>
            <div className="text-6xl font-serif text-zinc-900 mb-2">$240</div>
            <div className="flex flex-col gap-1 text-sm text-zinc-500">
              <span className="text-zinc-300 line-through decoration-zinc-300">+ Room Rate ($0)</span>
              <span className="text-zinc-900 font-medium">+ Resort Fees ($240)</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-zinc-400 mt-6">*Example based on actual drop. Fees vary by property.</p>
    </section>

    {/* 3. EXAMPLES */}
    <section className="px-6 max-w-5xl mx-auto mb-32">
      <div className="border-t border-zinc-200 pt-8 mb-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Typical Member Stays</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { loc: "Las Vegas, NV", type: "4 Nights", public: "$1,200", member: "$240", note: "Resort fees only" },
          { loc: "Cancun, MX", type: "6 Nights", public: "$3,400", member: "$450", note: "Taxes & Service" },
          { loc: "Miami, FL", type: "3 Nights", public: "$1,500", member: "$210", note: "Taxes only" }
        ].map((trip, i) => (
          <div key={i} className="group p-6 rounded-xl border border-zinc-200 hover:border-zinc-400 transition-colors bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-xl text-zinc-900">{trip.loc}</h3>
                <span className="text-xs text-zinc-500 font-medium bg-zinc-100 px-2 py-1 rounded mt-2 inline-block">{trip.type}</span>
              </div>
              <Plane strokeWidth={1} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Public Estimate</span>
                <span className="text-zinc-400 line-through decoration-zinc-300">{trip.public}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-zinc-900 font-medium">Member Pays</span>
                <span className="text-xl font-serif text-zinc-900">{trip.member}</span>
              </div>
              <p className="text-[10px] text-zinc-400 text-right pt-2 border-t border-zinc-100">{trip.note}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-zinc-400 mt-6">Examples vary by property. Availability is first-come, first-served.</p>
    </section>

    {/* 4. PROOF */}
    <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-200">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden relative">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Live Inventory</span>
            </div>
            <BlurredListItem />
            <BlurredListItem />
            <BlurredListItem />
            <BlurredListItem />
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-200 shadow-lg flex items-center gap-3">
                <Lock size={14} className="text-zinc-900" />
                <span className="text-sm font-bold text-zinc-900">Members Only</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-zinc-900 mb-6">Verified Inventory.</h2>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              We don't sell "vouchers" or "credits". We provide direct access to the hotel's own booking engine with a rate code attached.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5"><Check size={14} className="text-zinc-900" /></div>
                <div>
                  <span className="block text-sm font-bold text-zinc-900">Verified Direct Links</span>
                  <span className="text-xs text-zinc-500">Book directly on the hotel's official site.</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5"><Check size={14} className="text-zinc-900" /></div>
                <div>
                  <span className="block text-sm font-bold text-zinc-900">Partner Rate Codes</span>
                  <span className="text-xs text-zinc-500">Codes are automatically applied at checkout.</span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5"><Check size={14} className="text-zinc-900" /></div>
                <div>
                  <span className="block text-sm font-bold text-zinc-900">Instant Confirmation</span>
                  <span className="text-xs text-zinc-500">No waiting. Your reservation is immediate.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* 5. CLOSE */}
    <section className="py-24 px-6 mb-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 text-center mb-16">
          <h3 className="font-serif text-2xl text-zinc-900 mb-3">The Logic Check</h3>
          <p className="text-zinc-600 text-lg">
            If you travel just <span className="font-bold text-zinc-900">once</span> this year, the membership usually pays for itself.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-center mb-16 border-b border-zinc-100 pb-16">
          <div>
            <AlertCircle size={24} className="mx-auto text-zinc-300 mb-3" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Not Unlimited</h4>
            <p className="text-xs text-zinc-500">Inventory drops weekly. First come, first served.</p>
          </div>
          <div>
            <DollarSign size={24} className="mx-auto text-zinc-300 mb-3" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">You Pay Taxes</h4>
            <p className="text-xs text-zinc-500">Bookings are not $0. You cover taxes/fees.</p>
          </div>
          <div>
            <Calendar size={24} className="mx-auto text-zinc-300 mb-3" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Dates Vary</h4>
            <p className="text-xs text-zinc-500">Best for flexible dates, not fixed events.</p>
          </div>
        </div>
        <div className="space-y-6 mb-16 max-w-lg mx-auto">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Is this free travel?</span>
            <span className="text-zinc-900 font-medium">No. You pay taxes & fees per booking.</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Can I cancel?</span>
            <span className="text-zinc-900 font-medium">Yes. Cancel anytime in 1-click.</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Can I book any date?</span>
            <span className="text-zinc-900 font-medium">No. We provide access to specific inventory.</span>
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 mb-6">Stop paying for the<br />hotel's marketing budget.</h2>
          <Button onClick={handleJoinClick} variant="primary" className="px-12 py-4 text-lg mb-6">
            Join 57 Club
          </Button>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
            Secure Stripe Checkout • Cancel Anytime
          </p>
        </div>
      </div>
    </section>
  </div>
);

const CheckoutPage = ({ setView, user, setUserData, userData, fitCheckAnswers, goToLogin }) => {
  const [step, setStep] = useState(user ? 'payment' : 'auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [agreements, setAgreements] = useState({ taxes: false, availability: false, access: false });

  useEffect(() => {
    if (user && step === 'auth') {
      setStep('payment');
    }
  }, [user, step]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleSubscribe = async () => {
    setStep('processing');

    setTimeout(async () => {
      try {
        if (!auth.currentUser) {
          setStep('auth');
          return;
        }

        const userRef = doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'profile', 'main');

        // Firestore-first idempotency check
        const profileSnap = await getDoc(userRef);
        if (profileSnap.exists()) {
          const existing = profileSnap.data();
          if (existing?.status === 'active' && existing?.foundingMemberNumber) {
            setUserData(existing);
            setStep('success');
            return;
          }
        }

        const counterRef = doc(db, 'artifacts', appId, 'public', 'counters');
        let newMemberNum = 0;

        await runTransaction(db, async (transaction) => {
          const counterSnap = await transaction.get(counterRef);

          if (!counterSnap.exists()) {
            transaction.set(counterRef, { foundingMembers: 142 });
            newMemberNum = 142;
          } else {
            const currentCount = counterSnap.data()?.foundingMembers || 142;
            const next = currentCount + 1;
            newMemberNum = next;
            transaction.update(counterRef, { foundingMembers: next });
          }
        });

        const patch = {
          status: 'active',
          email: auth.currentUser.email,
          foundingMemberNumber: newMemberNum,
          memberSince: new Date().toISOString(),
          stripeId: 'cus_simulated_123',
        };

        // Attach fitCheck answers if we have them (no UI change)
        if (fitCheckAnswers) {
          patch.fitCheck = {
            ...fitCheckAnswers,
            completedAt: new Date().toISOString(),
          };
        }

        // createdAt: set only if missing (avoid overwriting on merges)
        const existingCreatedAt = profileSnap.exists() ? profileSnap.data()?.createdAt : null;
        if (!existingCreatedAt) {
          patch.createdAt = serverTimestamp();
        }

        await setDoc(userRef, patch, { merge: true });

        setUserData({ ...(userData || {}), ...patch });
        setStep('success');
      } catch (e) {
        console.error("Subscribe failed:", e);
        setStep('payment');
      }
    }, 900);
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-6"></div>
        <h2 className="font-serif text-2xl text-zinc-900 mb-2">Setting up your membership...</h2>
        <p className="text-zinc-500 text-sm">Securing your founding spot.</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-zinc-100 text-zinc-800 rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>
        <h1 className="font-serif text-4xl text-zinc-900 mb-4">You're in.</h1>
        <p className="text-zinc-500 mb-8 max-w-md">
          Welcome to the club.
        </p>
        <Button onClick={() => setView('portal')} variant="primary" className="px-10">
          Enter Portal
        </Button>
      </div>
    );
  }

  const canSubmit = Object.values(agreements).every(Boolean);

  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
      <button onClick={() => setView('landing')} className="text-zinc-400 hover:text-zinc-900 mb-6 flex items-center gap-1 text-sm font-medium">
        <ChevronRight className="rotate-180" size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="font-serif text-3xl text-zinc-900 mb-2">Secure Checkout</h1>
          <div className="flex items-center gap-2 mb-8">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'auth' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'}`}>1</span>
            <span className={`text-sm ${step === 'auth' ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>Account</span>
            <div className="w-8 h-px bg-zinc-200"></div>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'}`}>2</span>
            <span className={`text-sm ${step === 'payment' ? 'font-bold text-zinc-900' : 'text-zinc-500'}`}>Payment</span>
          </div>

          {step === 'auth' && (
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm animate-in slide-in-from-left-4">
              <h3 className="font-bold text-zinc-900 mb-4">Create your login</h3>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-zinc-200 rounded-lg mt-1 outline-none focus:border-zinc-900"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border border-zinc-200 rounded-lg mt-1 outline-none focus:border-zinc-900"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                {authError && <p className="text-red-500 text-sm">{authError}</p>}
                <Button type="submit" fullWidth variant="primary">Continue to Payment</Button>
                <p className="text-xs text-center text-zinc-400 mt-2">
                  Already have an account?{" "}
                  <button type="button" onClick={goToLogin} className="underline text-zinc-600">Log in</button>
                </p>
              </form>
            </div>
          )}

          {step === 'payment' && (
            <div className="animate-in slide-in-from-right-4">
              <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  <AlertCircle size={14} /> Critical Terms
                </div>
                <div className="space-y-4">
                  <label className="flex gap-3 items-start cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      checked={agreements.taxes}
                      onChange={e => setAgreements({ ...agreements, taxes: e.target.checked })}
                    />
                    <span className="text-sm text-zinc-600"><strong>I pay taxes & fees.</strong> Bookings are not $0; I cover taxes/fees directly to the property.</span>
                  </label>
                  <label className="flex gap-3 items-start cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      checked={agreements.availability}
                      onChange={e => setAgreements({ ...agreements, availability: e.target.checked })}
                    />
                    <span className="text-sm text-zinc-600"><strong>Availability varies.</strong> Drops are first-come, first-served. Dates not guaranteed.</span>
                  </label>
                  <label className="flex gap-3 items-start cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      checked={agreements.access}
                      onChange={e => setAgreements({ ...agreements, access: e.target.checked })}
                    />
                    <span className="text-sm text-zinc-600"><strong>No refunds.</strong> This is an access membership billed monthly. Cancel anytime.</span>
                  </label>
                </div>
              </div>

              <div className="p-4 border border-zinc-200 rounded-lg flex items-center justify-between bg-white text-zinc-900 mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-zinc-400" />
                  <span className="text-sm font-medium">Card ending in 4242</span>
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase">Stripe Secure</span>
              </div>

              <Button onClick={handleSubscribe} fullWidth disabled={!canSubmit} variant="cta">
                Pay $57 & Join Club
              </Button>
              <div className="text-center mt-4 flex items-center justify-center gap-2 text-zinc-400 text-[10px] uppercase tracking-wide font-bold">
                <Lock size={10} /> 128-bit SSL Encrypted
              </div>
            </div>
          )}
        </div>

        {/* Summary Column */}
        <div className="hidden md:block">
          <div className="bg-zinc-900 rounded-xl p-8 text-white shadow-xl sticky top-24">
            <h3 className="font-serif text-xl mb-6">Founding Membership</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-zinc-400 shrink-0" />
                <div>
                  <span className="text-zinc-200 text-sm block font-medium">Price Locked for Life</span>
                  <span className="text-zinc-500 text-xs">$57/mo forever, even as prices rise.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-zinc-400 shrink-0" />
                <span className="text-zinc-200 text-sm">Immediate Portal Access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-zinc-400 shrink-0" />
                <span className="text-zinc-200 text-sm">Weekly Tuesday Drops</span>
              </li>
            </ul>
            <div className="pt-6 border-t border-zinc-800">
              <div className="flex justify-between items-end mb-1">
                <span className="text-zinc-400 text-sm">Due today</span>
                <span className="text-2xl font-serif">$57.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PortalPage = ({ drops, userData }) => {
  const [filter, setFilter] = useState('All');
  const [activeDrop, setActiveDrop] = useState(null);

  const filteredDrops = drops.filter(d => filter === 'All' || (d.type || '').includes(filter) || (d.location || '').includes(filter));

  return (
    <>
      <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-700">
        <div className="flex flex-col gap-6 mb-10 border-b border-zinc-100 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl text-zinc-900">This Week's Drops</h1>
              <div className="flex items-center gap-2 text-zinc-500 mt-1 text-sm">
                <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-xs">MEMBER #{userData?.foundingMemberNumber}</span>
                <span className="text-zinc-300">•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> Updated Tuesday 9am</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full self-start md:self-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Updates Active
            </div>
          </div>

          {/* Small Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Hotel', 'Getaway', 'Partner'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredDrops.map((drop) => (
            <DropCard key={drop.id} drop={drop} onClick={setActiveDrop} />
          ))}
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl text-zinc-900 mb-6">Always Available</h2>
          <div className="bg-zinc-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2">The Concierge Desk</h3>
              <p className="text-zinc-400 text-sm max-w-md">Need something specific? We have partnerships with 40+ hotel groups. Request a manual search for your dates.</p>
            </div>
            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 whitespace-nowrap">
              Request Search
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {activeDrop && <DropDetailModal drop={activeDrop} onClose={() => setActiveDrop(null)} />}
    </>
  );
};

const AccountPage = ({ userData }) => (
  <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
    <h1 className="font-serif text-3xl text-zinc-900 mb-8">Account</h1>
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-8">
      <div className="p-6 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
            <User />
          </div>
          <div>
            <div className="font-bold text-zinc-900">{userData?.email}</div>
            <div className="text-sm text-zinc-500">Founding Member #{userData?.foundingMemberNumber}</div>
          </div>
        </div>
      </div>
      <div className="p-6 bg-zinc-50/50 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500">Status</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Active</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500">Payment Method</span>
          <span className="flex items-center gap-2"><CreditCard size={14} /> •••• 4242</span>
        </div>
      </div>
      <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
        <Button variant="outline" className="text-sm bg-white" onClick={() => alert("Redirects to Stripe Customer Portal")}>
          Manage Subscription
        </Button>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [drops, setDrops] = useState([]);
  const [foundingCount, setFoundingCount] = useState(142);
  const [showFitCheck, setShowFitCheck] = useState(false);
  const [fitCheckAnswers, setFitCheckAnswers] = useState(null);

  // --- AUTH & ROUTING ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'main');
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setUser(currentUser);
        } else {
          setUserData(null);
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // --- ROUTE GUARDS ---
  useEffect(() => {
    if (loadingAuth) return;

    if (user && userData?.status === 'active') {
      if (['landing', 'login', 'checkout'].includes(view)) setView('portal');
    } else if (user && !userData?.status) {
      if (['portal', 'account'].includes(view)) setView('checkout');
    } else if (!user) {
      if (['portal', 'account'].includes(view)) setView('landing');
    }
  }, [user, userData, loadingAuth, view]);

  // --- DATA FETCHING (DROPS) ---
  useEffect(() => {
    if (!user || userData?.status !== 'active') return;

    const dropsRef = collection(db, 'artifacts', appId, 'public', 'data', 'drops');
    const q = query(dropsRef, orderBy('timestamp', 'desc'));

    const unsubscribeDrops = onSnapshot(q, (snapshot) => {
      const loadedDrops = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (loadedDrops.length === 0) seedData();
      else setDrops(loadedDrops);
    });

    return () => unsubscribeDrops();
  }, [user, userData]);

  // --- DATA FETCHING (COUNTER) ---
  useEffect(() => {
    const counterRef = doc(db, 'artifacts', appId, 'public', 'counters');
    const unsubCounter = onSnapshot(counterRef, (d) => {
      if (d.exists() && d.data().foundingMembers) {
        setFoundingCount(d.data().foundingMembers);
      }
    });
    return () => unsubCounter();
  }, []);

  const seedData = async () => {
    setDrops([
      { id: '1', title: "Tulum Beachfront", location: "Tulum, MX", type: "Hotel Stay", description: "5-night eco-resort opening. Plunge pool included.", isNew: true, link: "#", timestamp: serverTimestamp() },
      { id: '2', title: "Kyoto Machiya", location: "Kyoto, JP", type: "Getaway Drop", description: "Restored traditional townhouse. 3 weeks in April.", isNew: true, link: "#", timestamp: serverTimestamp() },
      { id: '3', title: "Napa Estate", location: "Calistoga, CA", type: "Partner Offer", description: "Vineyard suite. Taxes only.", isNew: false, link: "#", timestamp: serverTimestamp() }
    ]);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserData(null);
    setUser(null);
    setView('landing');
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setView('login');
  };

  const handleJoinClick = () => {
    if (user && userData?.status === 'active') {
      setView('portal');
    } else {
      setShowFitCheck(true);
    }
  };

  const handleQualificationSuccess = async (answers) => {
    setFitCheckAnswers(answers || null);
    setShowFitCheck(false);

    // If already logged in (inactive), store fitCheck on profile doc now (merge)
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'profile', 'main');
        await setDoc(userRef, { fitCheck: { ...answers, completedAt: new Date().toISOString() } }, { merge: true });
      }
    } catch (e) {
      console.warn("FitCheck save failed (non-blocking):", e);
    }

    if (!user) setAuthMode('signup');
    setView('checkout');
  };

  const goToLogin = () => {
    setAuthMode('login');
    setView('login');
  };

  if (loadingAuth) return <LoadingScreen />;

  return (
    <div className={`min-h-screen ${COLORS.bg} font-sans selection:bg-zinc-200`}>
      <Navbar
        view={view}
        setView={setView}
        userData={userData}
        handleLogout={handleLogout}
        handleJoinClick={handleJoinClick}
        handleLoginClick={handleLoginClick}
      />

      <main className="animate-in fade-in duration-500">
        {view === 'landing' && (
          <LandingPage handleJoinClick={handleJoinClick} />
        )}

        {view === 'login' && (
          <AuthPage setView={setView} initialMode={authMode} />
        )}

        {view === 'checkout' && (
          <CheckoutPage
            setView={setView}
            user={user}
            setUserData={setUserData}
            userData={userData}
            fitCheckAnswers={fitCheckAnswers}
            goToLogin={goToLogin}
          />
        )}

        {view === 'portal' && (
          <PortalPage drops={drops} userData={userData} />
        )}

        {view === 'account' && (
          <AccountPage userData={userData} />
        )}

        {/* Show Dock ONLY on Landing & Checkout */}
        {(view === 'landing' || view === 'checkout') && (
          <BottomDock foundingCount={foundingCount} onJoin={handleJoinClick} />
        )}
      </main>

      <FitCheckModal
        isOpen={showFitCheck}
        onClose={() => setShowFitCheck(false)}
        onQualified={handleQualificationSuccess}
      />
    </div>
  );
}
