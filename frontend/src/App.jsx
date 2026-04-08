import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Navigation, Activity, Stethoscope, Search, RefreshCw, Send, LogOut, User as UserIcon, Calendar, Clock, MapPin, CreditCard, Users, HeartPulse, TrendingUp, ShieldAlert, BadgeCheck } from 'lucide-react';
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
  const logsEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  
  // Data States
  const [healthResult, setHealthResult] = useState('');
  const [trafficResult, setTrafficResult] = useState({ congestion: '--', bestRoute: '--' });
  const [vitalsData, setVitalsData] = useState({ heartRate: 72, bp: '120/80', spo2: 98, temp: 98.6 });
  const [billingData, setBillingData] = useState({ total: 0, breakdown: [], predicted: 0 });
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

    // Simulate real-time vitals
    const vitalsInterval = setInterval(() => {
        setVitalsData(prev => ({
            ...prev,
            heartRate: 70 + Math.floor(Math.random() * 15),
            spo2: 97 + Math.floor(Math.random() * 3)
        }));
    }, 5000);

    return () => {
        newSocket.disconnect();
        clearInterval(vitalsInterval);
    };
  }, []);

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
      if (trafficData) setTrafficResult({ congestion: trafficData.congestion || '--', bestRoute: trafficData.bestRoute || '--' });

      const billing = data.results?.find(r => r.domain === 'Billing');
      if (billing) setBillingData({ total: billing.totalEstimated, breakdown: billing.breakdown, predicted: billing.totalEstimated });

    } catch (error) {
      console.error("Error:", error);
      setAgentLogs(prev => [...prev, { agent: 'System', message: 'Failed to connect to CORTEX core.', status: 'error' }]);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 pb-12">
      <header className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white py-6 px-6 shadow-xl relative overflow-hidden border-b border-emerald-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="max-w-6xl mx-auto flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
                    <Activity size={24} className="text-white"/>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter">CORTEX<span className="text-emerald-500">-OS</span></h1>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-500/70 font-bold">Smart AI Hospital System</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <UserIcon size={14} className="text-emerald-400"/>
                    <span className="text-xs font-semibold">{user?.name || "Guest Patient"}</span>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          {/* AI Orchestrator Input */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Search size={16} /> MCP Multi-Agent Assistant
            </h2>
            <form onSubmit={handleQuerySubmit} className="flex gap-3">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about vitals, billing, or doctor availability..." 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
              <button type="submit" className="bg-[#0f172a] hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2">
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                Execute
              </button>
            </form>
            {summary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-6 bg-emerald-50/50 text-emerald-900 rounded-2xl border border-emerald-100 italic text-sm">
                "{summary}"
              </motion.div>
            )}
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'healthcare', icon: Stethoscope, label: 'Analysis' },
              { id: 'vitals', icon: HeartPulse, label: 'Vitals' },
              { id: 'payflow', icon: CreditCard, label: 'PayFlow' },
              { id: 'doctors', icon: Users, label: 'Staff' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'healthcare' && (
                <motion.div key="health" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Stethoscope className="text-blue-500"/> Clinical Decision Engine</h3>
                  <div className="bg-[#0f172a] p-6 rounded-2xl text-emerald-400 font-mono text-xs h-64 overflow-y-auto">
                    {healthResult || "// WAITING FOR PATIENT DATA INJECTION..."}
                  </div>
                </motion.div>
              )}

              {activeTab === 'vitals' && (
                <motion.div key="vitals" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><HeartPulse className="text-red-500"/> Biometric Monitor</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Heart Rate', value: vitalsData.heartRate, unit: 'BPM', color: 'text-red-500' },
                      { label: 'SpO2', value: vitalsData.spo2, unit: '%', color: 'text-blue-500' },
                      { label: 'Blood Pressure', value: vitalsData.bp, unit: 'mmHg', color: 'text-emerald-500' },
                      { label: 'Temperature', value: vitalsData.temp, unit: '°F', color: 'text-orange-500' }
                    ].map(v => (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{v.label}</p>
                        <p className={`text-2xl font-black ${v.color}`}>{v.value}<span className="text-[10px] ml-1">{v.unit}</span></p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'payflow' && (
                <motion.div key="payflow" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="text-emerald-500"/> PayFlow AI Billing</h3>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">AUTO-AUDITED</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-900 rounded-2xl text-white">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Estimated Total Bill</p>
                        <p className="text-4xl font-black text-emerald-400 mt-2">{billingData.total || '₹0'}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                            <TrendingUp size={12}/> Predicted Discharge Cost: {billingData.total || '₹0'}
                        </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Itemized Breakdown</p>
                        {billingData.breakdown.length > 0 ? billingData.breakdown.map(item => (
                            <div className="flex justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                                <span>{item.item}</span>
                                <span className="font-bold">{item.cost}</span>
                            </div>
                        )) : <p className="text-xs italic text-slate-500">No active charges detected.</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'doctors' && (
                <motion.div key="doctors" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Users className="text-indigo-500"/> Staff Operations</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Dr. Sarah Chen', spec: 'Cardiology', status: 'Available', color: 'bg-emerald-500' },
                      { name: 'Dr. Michael Ross', spec: 'General Medicine', status: 'In Surgery', color: 'bg-orange-500' }
                    ].map(dr => (
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-600">{dr.name[4]}</div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{dr.name}</p>
                                <p className="text-[10px] text-slate-500">{dr.spec}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${dr.color} animate-pulse`}></span>
                             <span className="text-[10px] font-bold text-slate-600">{dr.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full lg:w-80 border border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col h-[650px] sticky top-6">
          <div className="bg-[#0f172a] text-white p-6">
            <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MCP Node Logs
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 font-mono text-[9px]">
            {agentLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-emerald-600">[{log.agent}]</p>
                <p className="mt-1 text-slate-800">{log.message}</p>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
