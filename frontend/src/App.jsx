import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Navigation, Activity, Stethoscope, Search, RefreshCw, Send, LogOut, User as UserIcon, Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import VerifyEmail from './components/Auth/VerifyEmail';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('healthcare');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  
  // Data States
  const [healthResult, setHealthResult] = useState('');
  const [trafficResult, setTrafficResult] = useState({ congestion: '--', bestRoute: '--' });
  const [summary, setSummary] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Initialize Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('agent-activity', (data) => {
      setAgentLogs(prev => [...prev, data]);
      scrollToBottom();
    });

    if (user) {
        fetchUserBookings();
    }

    return () => newSocket.disconnect();
  }, []);

  const fetchUserBookings = async () => {
      try {
          const response = await fetch(`${SOCKET_URL}/api/booking/user-bookings`, {
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}` // Note: Need to check if token is stored in localStorage
              }
          });
          const data = await response.json();
          if (data.success) {
              setBookings(data.data);
          }
      } catch (error) {
          console.error("Fetch bookings error:", error);
      }
  };

  const handleBook = async (dept) => {
    const loadingToast = toast.loading(`Booking ${dept}...`);
    try {
        const response = await fetch(`${SOCKET_URL}/api/booking/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                department: dept,
                appointmentDate: new Date().toISOString(),
                timeSlot: "2:30 PM", // Mock for demo
                reason: "General Checkup"
            })
        });
        const data = await response.json();
        
        if (data.success) {
            toast.success("Appointment Confirmed!", { id: loadingToast });
            fetchUserBookings();
        } else {
            toast.error(data.message || "Booking failed", { id: loadingToast });
        }
    } catch (error) {
        toast.error("Network error on booking", { id: loadingToast });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logged out from CORTEX-OS");
    navigate('/login');
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    setAgentLogs([]);
    setSummary('');

    try {
      const response = await fetch(`${SOCKET_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userId: user?._id || 'demo_user' })
      });
      const data = await response.json();
      
      setSummary(data.answer);
      
      const healthData = data.results?.find(r => r.domain === 'Healthcare');
      if (healthData) setHealthResult(`Assessment: ${healthData.assessment}\nRisk: ${healthData.riskLevel}\nNext Steps: ${healthData.nextSteps.join(', ')}`);

      const trafficData = data.results?.find(r => r.domain === 'Traffic');
      if (trafficData) {
        setTrafficResult({
          congestion: trafficData.congestion || '--',
          bestRoute: trafficData.bestRoute || '--'
        });
      }

    } catch (error) {
      console.error("Error:", error);
      setAgentLogs(prev => [...prev, { agent: 'System', message: 'Failed to connect to CORTEX core.', status: 'error' }]);
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 pb-12">
      {/* CORTEX-OS Header */}
      <header className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white py-6 px-6 shadow-xl relative overflow-hidden border-b border-emerald-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="max-w-6xl mx-auto flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                    <Activity size={24} className="text-white"/>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter">CORTEX<span className="text-emerald-500">-OS</span></h1>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold">Hospital Intelligence System</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <UserIcon size={14} className="text-emerald-400"/>
                    <span className="text-xs font-semibold">{user?.name}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 flex flex-col lg:flex-row gap-6">
        
        <div className="flex-1 flex flex-col gap-6">
          
          {/* AI Orchestrator Input */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Search size={16} /> Patient Support Assistant
            </h2>
            <form onSubmit={handleQuerySubmit} className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe symptoms or request hospital routing..." 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                  disabled={isProcessing}
                />
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="bg-[#0f172a] hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                {isProcessing ? 'Analyzing...' : 'Execute'}
              </button>
            </form>

            {summary && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 bg-emerald-50/50 text-emerald-900 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-tighter">Clinical Recommendation</span>
                </div>
                <p className="text-sm leading-relaxed">{summary}</p>
              </motion.div>
            )}
          </div>

          {/* Core Modules Nav */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'healthcare', icon: Stethoscope, label: 'Analysis' },
              { id: 'bookings', icon: Calendar, label: 'Bookings' },
              { id: 'traffic', icon: Navigation, label: 'Logistics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Calendar size={20} className="text-emerald-500"/> Real-time Booking</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed hover:border-emerald-300 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm"><Clock size={16} className="text-emerald-500"/></div>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase">Available</span>
                                </div>
                                <h4 className="font-bold text-slate-800">General Consultation</h4>
                                <p className="text-xs text-slate-500 mt-1">Next available: Today, 2:30 PM</p>
                                <button 
                                    onClick={() => handleBook('General Consultation')}
                                    className="mt-4 w-full py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    Book Now
                                </button>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed hover:border-blue-300 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-white p-2 rounded-xl shadow-sm"><Stethoscope size={16} className="text-blue-500"/></div>
                                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full uppercase">Specialist</span>
                                </div>
                                <h4 className="font-bold text-slate-800">Cardiology Dept.</h4>
                                <p className="text-xs text-slate-500 mt-1">Next available: Tomorrow, 9:00 AM</p>
                                <button 
                                    onClick={() => handleBook('Cardiology')}
                                    className="mt-4 w-full py-2 bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>

                        {/* Booking List */}
                        {bookings.length > 0 && (
                            <div className="mt-8 border-t border-slate-100 pt-8">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Your Recent Appointments</h4>
                                <div className="space-y-3">
                                    {bookings.slice(0, 3).map((b, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 font-bold">
                                                    {b.department[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{b.department}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(b.appointmentDate).toLocaleDateString()} @ {b.timeSlot}</p>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
              )}

              {activeTab === 'healthcare' && (
                <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Stethoscope size={20} className="text-blue-500"/> Clinical Analysis</h3>
                  <div className="min-h-[250px] p-6 bg-[#0f172a] text-emerald-400 rounded-2xl font-mono text-xs leading-relaxed overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                    {healthResult ? (
                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                             <div className="text-emerald-500 mb-4 opacity-50">// CORTEX-OS SYSTEM DIAGNOSTIC OUTPUT</div>
                             {healthResult}
                        </div>
                    ) : (
                        <div className="opacity-30 flex flex-col items-center justify-center h-full gap-4">
                            <Activity size={40} className="animate-pulse"/>
                            <span>Waiting for patient query injection...</span>
                        </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'traffic' && (
                <motion.div key="traffic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800"><Navigation size={20} className="text-orange-500"/> Emergency Logistics</h3>
                  <div className="space-y-4">
                      <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">Route Status</p>
                            <p className="text-xl font-black text-orange-950">{trafficResult.congestion}</p>
                        </div>
                        <MapPin size={32} className="text-orange-500 opacity-20" />
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Recommended Hospital Path</p>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{trafficResult.bestRoute}"</p>
                      </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CORTEX Sidebar */}
        <div className="w-full lg:w-80 border border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col h-[600px] sticky top-6">
          <div className="bg-[#0f172a] text-white p-6">
            <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Node Logs
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">CORTEX-OS v1.0.4 - Monitoring Thread</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 font-mono text-[10px]">
            {agentLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
                <RefreshCw size={24} className="mb-2 animate-spin-slow"/>
                <span>System Interlink Idle</span>
              </div>
            )}
            {agentLogs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={idx} 
                className={`p-3 rounded-xl border border-dashed transition-all ${log.status === 'error' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <div className="font-bold border-b border-black/5 pb-2 mb-2 flex justify-between uppercase text-[8px] opacity-60">
                  <span className={log.agent === 'Planner Agent' ? 'text-blue-600' : 'text-emerald-600'}>[{log.agent}]</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-start gap-2 leading-tight">
                  <span className={log.status === 'thinking' ? 'animate-pulse' : ''}>{log.message}</span>
                </div>
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
