import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Navigation, Activity, Stethoscope, Search, RefreshCw, Send, LogOut, User as UserIcon, Calendar, Clock, MapPin, CreditCard, Users, HeartPulse, TrendingUp, ShieldAlert, BadgeCheck, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import VerifyEmail from './components/Auth/VerifyEmail';
import HospitalManagement from './components/HospitalManagement';
import toast from 'react-hot-toast';

// New Hospital Components
import ClinicalAnalysisCard from './components/Hospital/ClinicalAnalysisCard';
import VitalsCard from './components/Hospital/VitalsCard';
import PayFlowCard from './components/Hospital/PayFlowCard';
import TrafficCard from './components/Hospital/TrafficCard';
import DoctorCard from './components/Hospital/DoctorCard';
import BookingInteractionCard from './components/Hospital/BookingInteractionCard';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('healthcare');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const logsEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  
  // Data States
  const [healthResult, setHealthResult] = useState(null);
  const [trafficResult, setTrafficResult] = useState(null);
  const [vitalsData, setVitalsData] = useState({ heartRate: 72, bp: '120/80', spo2: 98, temp: 98.6 });
  const [billingData, setBillingData] = useState({ total: 0, breakdown: [], predicted: 0 });
  const [autoBooking, setAutoBooking] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [summary, setSummary] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Role-Guard: If role is hospital, push to management
    if (user?.role === 'hospital') {
      navigate('/management', { replace: true });
      return;
    }

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('agent-activity', (data) => {
      setAgentLogs(prev => [...prev, { ...data, timestamp: new Date() }]);
      scrollToBottom();
    });

    newSocket.on('hospital-alert', (data) => {
      // Check if alert is meant for this user (or show all in demo mode)
      if (!user || data.userId === user._id || data.userId === 'demo') {
        toast((t) => (
          <span className="flex flex-col gap-1">
            <span className="font-black text-xs uppercase flex items-center gap-2 text-red-500">
              <ShieldAlert size={14} /> Hospital Emergency Response
            </span>
            <span className="text-sm font-medium">{data.message}</span>
          </span>
        ), { duration: 6000, position: 'top-center', icon: '🏥' });
      }
    });

    // Capture Location Hook
    requestLocation();

    return () => {
        newSocket.disconnect();
    };
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      toast.loading("Querying GPS constellations...", { id: 'geo', duration: 2000 });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          toast.success("Spatial Nexus Linked", { id: 'geo' });
        },
        (error) => {
          console.warn("⚠️ Location error:", error.message);
          toast.success("Regional Nexus Linked (Fallback)", { id: 'geo' });
          setUserLocation({ lat: 12.8914, lng: 77.5965 }); // Default Hackathon Coordinate
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    setAgentLogs([]);
    setSummary('');
    setAutoBooking(null);
    setSuggestion(null);
    setIsEmergency(false);

    try {
      const response = await fetch(`${SOCKET_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          userId: user?._id || 'demo_user',
          location: userLocation
        })
      });
      const data = await response.json();
      
      setSummary(data.answer || "Orchestration complete.");
      const results = data.data; // Unified output from Response Agent (Module 4)

      if (results) {
        if (results.healthcare) setHealthResult(results.healthcare);
        if (results.healthcare?.riskLevel === 'High') setIsEmergency(true);
        if (results.traffic) setTrafficResult(results.traffic);
        if (results.billing) setBillingData(results.billing);
        if (results.vitals) setVitalsData(results.vitals.current);
        if (results.autoBooking) setAutoBooking(results.autoBooking);
        if (results.suggestion) setSuggestion(results.suggestion);
      }

      // Auto-switch to healthcare analysis on result
      setActiveTab('healthcare');

    } catch (error) {
      console.error("Error:", error);
      setAgentLogs(prev => [...prev, { agent: 'System', message: 'Failed to connect to CORTEX core.', status: 'error', timestamp: new Date() }]);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800 pb-12">
      <header className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white py-6 px-6 shadow-2xl relative overflow-hidden border-b-2 border-emerald-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
        <div className="max-w-6xl mx-auto flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-4">
                <motion.div 
                    animate={{ rotate: isEmergency ? [0, 10, -10, 0] : 0 }} 
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className={`p-2.5 rounded-xl shadow-lg ${isEmergency ? 'bg-red-500 shadow-red-500/40' : 'bg-emerald-500 shadow-emerald-500/30'}`}
                >
                    <Activity size={28} className="text-white"/>
                </motion.div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase">CORTEX<span className={isEmergency ? 'text-red-500' : 'text-emerald-500'}>-OS</span></h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60 italic">Autonomous MCP-Agent Framework</p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Online</div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${user?.role === 'hospital' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div> 
                  {user?.name || "Guest Patient"} 
                  <span className="opacity-50 ml-1">({user?.role || 'Guest'})</span>
                </div>
                <div className="w-px h-4 bg-slate-700"></div>
                {user?.role === 'hospital' && (
                  <button onClick={() => navigate('/management')} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-all border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest">
                    🏥 Hospital Command
                  </button>
                )}
                <div id="google_translate_element" className="ml-4 overflow-hidden rounded-lg"></div>
                <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 flex items-center gap-1.5">
                  <LogOut size={12} /> Logout
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDE LOG PANEL (Module 8 & 9) */}
        <aside className="lg:col-span-3 border-2 border-slate-200/50 bg-white shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col h-[750px] sticky top-8">
          <div className="bg-[#0f172a] text-white p-6">
            <h3 className="font-extrabold flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              MCP Orchestrator Logs
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 font-mono">
            {agentLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 italic text-center gap-3">
                <Activity size={32} className="animate-spin-slow"/>
                <span className="text-[10px] font-black uppercase">Interlink Idle</span>
              </div>
            )}
            {agentLogs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={idx} 
                className={`p-4 rounded-2xl border-2 transition-all ${
                    log.status === 'active' || log.status === 'thinking' ? 'bg-blue-50/50 border-blue-100' : 
                    log.status === 'success' || log.status === 'done' ? 'bg-emerald-50/50 border-emerald-100' : 
                    log.status === 'error' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        log.status === 'active' || log.status === 'thinking' ? 'bg-blue-500 text-white' : 
                        log.status === 'success' || log.status === 'done' ? 'bg-emerald-500 text-white' : 
                        log.status === 'error' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                        {log.agent}
                    </span>
                    <span className="text-[7px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-700 leading-tight">
                    {log.status === 'thinking' ? '● ' : '↳ '}
                    {log.message}
                </p>
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </aside>

        {/* MAIN ORCHESTRATION HUB */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          
          {/* Autonomous Flow (Module 9 & 10) */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/50 p-6">
            <div className="flex items-center justify-around">
                {[
                    { label: 'Input', icon: Search, color: 'text-slate-400' },
                    { label: 'Planner', icon: RefreshCw, color: 'text-blue-500' },
                    { label: 'MCP Tools', icon: Stethoscope, color: 'text-indigo-500' },
                    { label: 'Response', icon: BadgeCheck, color: 'text-emerald-500' }
                ].map((step, i) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 ${isProcessing && i === 1 ? 'animate-pulse border-blue-500 ring-4 ring-blue-500/10' : ''}`}>
                                <step.icon size={20} className={step.color}/>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{step.label}</span>
                        </div>
                        {i < 3 && <div className={`flex-1 h-0.5 max-w-[40px] ${isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-100'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-white p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl"></div>
            
            <div className="relative z-10">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Execute Autonomous Core</h2>
                <form onSubmit={handleQuerySubmit} className="flex gap-4">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., 'I have sharp chest pain, check my bill and find a doctor'" 
                    className="flex-1 px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={requestLocation}
                    className={`p-4 rounded-2xl border transition-all ${userLocation ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'}`}
                    title="Capture Live Location"
                  >
                    <MapPin size={24} className={!userLocation ? "animate-pulse" : ""} />
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        <span>Orchestrating MCP...</span>
                      </div>
                    ) : (
                      <>
                        <Zap size={18} className="group-hover:scale-125 transition-all" />
                        <span>Execute Specialized MCP</span>
                      </>
                    )}
                  </button>
                </form>

                <AnimatePresence>
                    {isEmergency && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-10 p-8 bg-red-600 rounded-[2rem] text-white shadow-2xl relative overflow-hidden"
                      >
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <ShieldAlert size={56} className="animate-pulse opacity-80" />
                            <div className="flex-1 lg:border-l lg:border-white/20 lg:pl-8">
                                <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">⚠️ CRITICAL STATUS DETECTED</h3>
                                <p className="text-sm font-bold opacity-90 leading-relaxed mb-6">Autonomous systems have bypassed manual scheduling. EMS protocols finalized.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[7px] uppercase font-black opacity-60">Risk</p><p className="text-xs font-bold">{healthResult?.riskProbability}</p></div>
                                    <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[7px] uppercase font-black opacity-60">ETA</p><p className="text-xs font-bold">{trafficResult?.eta}</p></div>
                                    <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[7px] uppercase font-black opacity-60">Doctor</p><p className="text-xs font-bold">Assigned</p></div>
                                    <div className="bg-white/10 p-3 rounded-2xl"><p className="text-[7px] uppercase font-black opacity-60">Est. Bill</p><p className="text-xs font-bold">₹{(billingData.predicted || 0).toLocaleString()}</p></div>
                                </div>
                            </div>
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BookingInteractionCard autoBooking={autoBooking} suggestion={suggestion} />
            {summary && !isEmergency && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-emerald-50/50 text-emerald-950 rounded-[2rem] border border-emerald-100 text-sm font-bold italic leading-relaxed h-full flex items-center">
                "{summary}"
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'healthcare', icon: Stethoscope, label: 'Analysis' },
              { id: 'vitals', icon: HeartPulse, label: 'Biometrics' },
              { id: 'payflow', icon: CreditCard, label: 'Financials' },
              { id: 'doctors', icon: Users, label: 'Ops Core' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-xl border border-slate-200' : 'bg-slate-800/5 text-slate-500 hover:text-slate-800'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'healthcare' && !isEmergency && <ClinicalAnalysisCard key="health" data={healthResult} />}
              {activeTab === 'healthcare' && isEmergency && (
                  <div className="grid md:grid-cols-2 gap-8 h-full">
                      <ClinicalAnalysisCard data={healthResult} />
                      <TrafficCard data={trafficResult} />
                  </div>
              )}
              {activeTab === 'vitals' && <VitalsCard key="vitals" data={vitalsData} />}
              {activeTab === 'payflow' && <PayFlowCard key="payflow" data={billingData} />}
              {activeTab === 'doctors' && (
                <DoctorCard key="doctors" doctors={[
                  { name: 'Dr. Sarah Chen', spec: 'Cardiology', status: 'Available' },
                  { name: 'Dr. Michael Ross', spec: 'General Medicine', status: 'In Surgery' }
                ]} />
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/management" element={<ProtectedRoute><HospitalManagement /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
