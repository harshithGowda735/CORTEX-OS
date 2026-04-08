import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Cloud, Droplets, Wind, Navigation, Activity, Leaf, Stethoscope, Search, RefreshCw, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Socket initialization
const SOCKET_URL = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('agriculture');
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [socket, setSocket] = useState(null);
  
  // Data States
  const [healthResult, setHealthResult] = useState('');
  const [agriResult, setAgriResult] = useState({ ph: '--', condition: '--', recommendation: '--' });
  const [trafficResult, setTrafficResult] = useState({ congestion: '--', bestRoute: '--' });
  const [summary, setSummary] = useState('');

  const logsEndRef = useRef(null);

  useEffect(() => {
    // Initialize Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('agent-activity', (data) => {
      setAgentLogs(prev => [...prev, data]);
      scrollToBottom();
    });

    return () => newSocket.disconnect();
  }, []);

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

    try {
      const response = await fetch(`${SOCKET_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userId: 'demo_user' })
      });
      const data = await response.json();
      
      setSummary(data.answer);
      
      // Extract data if agents ran
      const healthData = data.results?.find(r => r.domain === 'Healthcare');
      if (healthData) setHealthResult(`Assessment: ${healthData.assessment}\nRisk: ${healthData.riskLevel}\nNext Steps: ${healthData.nextSteps.join(', ')}`);

      const agriData = data.results?.find(r => r.domain === 'Agriculture');
      if (agriData && agriData.data) {
        setAgriResult({
          ph: agriData.data.ph || '--',
          condition: agriData.data.condition || agriData.data.status || agriData.data.suggestions?.join(', ') || '--',
          recommendation: agriData.recommendation || '--'
        });
      }

      const trafficData = data.results?.find(r => r.domain === 'Traffic');
      if (trafficData) {
        setTrafficResult({
          congestion: trafficData.congestion || '--',
          bestRoute: trafficData.bestRoute || '--'
        });
      }

    } catch (error) {
      console.error("Error:", error);
      setAgentLogs(prev => [...prev, { agent: 'System', message: 'Failed to connect to orchestrator core.', status: 'error' }]);
    }

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-700 to-emerald-700 text-white py-8 px-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <h1 className="text-3xl font-bold tracking-tight z-10 relative">AgriHealthTraffic Agent <span className="opacity-70 text-lg font-normal ml-2">MCP Core</span></h1>
        <p className="mt-2 text-emerald-50 max-w-2xl mx-auto z-10 relative">Multi-agent orchestration for predictive Agriculture, systemic Healthcare assessments, and intelligent Traffic routing.</p>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* Main Interface */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Global Orchestrator Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-emerald-600"/> Agent Orchestrator Input</h2>
            <form onSubmit={handleQuerySubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a cross-domain question (e.g. 'I have a fever, how is the traffic to the hospital?')" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
                  disabled={isProcessing}
                />
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-transform transform hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-emerald-600/20"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                {isProcessing ? 'Processing...' : 'Execute'}
              </button>
            </form>

            {summary && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-sm font-medium">
                <span className="block text-emerald-700 font-bold mb-1 text-xs uppercase tracking-wider">Unified System Response</span>
                {summary}
              </motion.div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/60 overflow-hidden">
            {[
              { id: 'agriculture', icon: Leaf, label: 'Agriculture' },
              { id: 'healthcare', icon: Stethoscope, label: 'Healthcare' },
              { id: 'traffic', icon: Navigation, label: 'Traffic' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/80'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'agriculture' && (
                <motion.div key="agri" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                     <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Leaf size={18} className="text-emerald-500"/> Soil & Crop Intelligence (MCP)</h3>
                     <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Measured pH</p>
                          <p className="text-xl font-bold text-slate-700">{agriResult.ph}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Conditions</p>
                          <p className="text-sm font-medium text-slate-700">{agriResult.condition}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 border-dashed">
                          <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Agent Recommendation</p>
                          <p className="text-sm text-emerald-900 font-medium">{agriResult.recommendation}</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[250px] bg-gradient-to-b from-white to-slate-50/50">
                    <Cloud className="text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500 text-sm text-center max-w-[200px]">Weather insights are integrated dynamically into orchestrator decisions.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'healthcare' && (
                <motion.div key="health" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Stethoscope size={18} className="text-blue-500"/> Healthcare Agent Analysis</h3>
                  <div className="min-h-[200px] p-5 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap font-mono text-sm text-slate-700">
                    {healthResult ? healthResult : "Waiting for health-related query execution from standard input..."}
                  </div>
                </motion.div>
              )}

              {activeTab === 'traffic' && (
                <motion.div key="traffic" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                     <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Navigation size={18} className="text-orange-500"/> Route Optimization</h3>
                     <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500 mb-4">
                        <p className="text-xs text-orange-700 uppercase font-bold tracking-wider mb-1">Congestion Level</p>
                        <p className="text-lg font-bold text-orange-900">{trafficResult.congestion}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Suggested Route</p>
                        <p className="text-sm font-medium text-slate-800">{trafficResult.bestRoute}</p>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar - Agent Activity Logs */}
        <div className="w-full md:w-80 border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col h-[600px] sticky top-6">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Agent Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">Live execution logs via Socket.io</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-xs">
            {agentLogs.length === 0 && (
              <div className="text-slate-400 italic text-center mt-10">
                Idling. Waiting for orchestrator commands.
              </div>
            )}
            {agentLogs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={`p-3 rounded-lg border ${log.status === 'error' ? 'bg-red-50 border-red-100 text-red-800' : log.agent === 'System' || log.agent === 'Planner Agent' || log.agent === 'Response Agent' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}
              >
                <div className="font-bold border-b border-black/5 pb-1 mb-1.5 flex justify-between">
                  <span>[{log.agent}]</span>
                  <span className="opacity-50">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                </div>
                <div className="flex items-start gap-2">
                  {log.status === 'thinking' && <RefreshCw className="animate-spin shrink-0 mt-0.5" size={12} />}
                  <span className={`${log.status === 'thinking' ? 'opacity-80 italic' : ''}`}>{log.message}</span>
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

export default App;
