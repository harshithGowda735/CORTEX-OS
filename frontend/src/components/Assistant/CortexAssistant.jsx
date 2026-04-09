import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Send, ShieldAlert, Phone, Users, 
  MapPin, Loader2, Zap, Clock, ChevronRight, UserPlus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CortexAssistant = ({ user, location }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'sos' | 'protectors'
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I'm your CORTEX-OS Nexus Assistant. I can analyze your health, plan routes, or trigger SOS protocols. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSOSTriggering, setIsSOSTriggering] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);
  
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input, 
          userId: user?._id || 'demo_user',
          location: location
        })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || "I've analyzed the data flow. Specialized agents are standing by.",
        data: data.data 
      }]);
    } catch (error) {
      toast.error("Nexus communication disrupted.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleTriggerSOS = async () => {
    if (contacts.length === 0) {
        toast.error("No Protectors registered! Add emergency contacts first.");
        setActiveTab('protectors');
        return;
    }

    setIsSOSTriggering(true);
    toast.loading("Dispatched Galactic Distress Signal...", { id: 'sos-trigger' });

    try {
      const response = await fetch(`${API_BASE}/api/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?._id,
          location: location
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success("Guardian Notification Finalized", { id: 'sos-trigger' });
        setIsDialing(true);
      } else {
        toast.error(data.message, { id: 'sos-trigger' });
      }
    } catch (err) {
      toast.error("SOS broadast failed.", { id: 'sos-trigger' });
    } finally {
      setIsSOSTriggering(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`${API_BASE}/api/emergency/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?._id, ...newContact })
        });
        const data = await response.json();
        if (data.success) {
            setContacts(data.contacts);
            setNewContact({ name: '', email: '', phone: '' });
            toast.success("Protector Registered in Nexus");
        }
    } catch (err) {
        toast.error("Node registration failed.");
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      
      {/* CHAT/SOS WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[400px] h-[600px] bg-[#0f172a] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20">
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">CORTEX<span className="text-emerald-500"> Companion</span></h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">MCP Core Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-4 pt-4 border-b border-slate-800/50">
                {[
                    { id: 'chat', icon: MessageSquare, label: 'Nexus Chat' },
                    { id: 'sos', icon: ShieldAlert, label: 'SOS Alert' },
                    { id: 'protectors', icon: Users, label: 'Protectors' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 transition-all border-b-2 ${
                            activeTab === tab.id ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <tab.icon size={16} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  {messages.map((ms, i) => (
                    <div key={i} className={`flex ${ms.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                        ms.role === 'user' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        {ms.content}
                        {ms.data && (
                           <div className="mt-3 pt-3 border-t border-white/10 space-y-1 opacity-80">
                              {ms.data.healthcare && <p>🩺 Analysis: {ms.data.healthcare.riskLevel} Risk</p>}
                              {ms.data.traffic && <p>🚑 EMS ETA: {ms.data.traffic.eta}</p>}
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 p-4 rounded-2xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {activeTab === 'sos' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                   <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"
                      />
                      <button 
                        onClick={handleTriggerSOS}
                        disabled={isSOSTriggering}
                        className="relative w-32 h-32 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl shadow-red-600/50 hover:bg-red-700 active:scale-95 transition-all"
                      >
                         <ShieldAlert size={48} className="mb-1" />
                         <span className="text-[10px] font-black tracking-widest uppercase">SOS</span>
                      </button>
                   </div>
                   <div className="space-y-2">
                       <h4 className="text-white font-black uppercase text-sm italic">Immediate Distress Signal</h4>
                       <p className="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">Triggers guardian alerts, hospital priority routing, and opens a direct crisis line.</p>
                   </div>
                </div>
              )}

              {activeTab === 'protectors' && (
                <div className="space-y-6">
                    <form onSubmit={handleAddContact} className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 space-y-3">
                        <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest mb-1">Add New Protector</p>
                        <input required type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="Name" className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-[10px] text-white focus:ring-1 focus:ring-emerald-500" />
                        <input required type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} placeholder="Email" className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-[10px] text-white focus:ring-1 focus:ring-emerald-500" />
                        <input required type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="Phone" className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-[10px] text-white focus:ring-1 focus:ring-emerald-500" />
                        <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <UserPlus size={14} /> Register Node
                        </button>
                    </form>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active Guardians</p>
                        {contacts.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-2xl border border-slate-800">
                                <div>
                                    <p className="text-[10px] font-bold text-white">{c.name}</p>
                                    <p className="text-[8px] text-slate-500">{c.email}</p>
                                </div>
                                <div className="p-2 text-slate-500 hover:text-red-400 cursor-pointer">
                                    <Trash2 size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>

            {/* Input Area (Only for Chat tab) */}
            {activeTab === 'chat' && (
              <form onSubmit={handleSendMessage} className="p-6 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask CORTEX..."
                  className="flex-1 bg-slate-800 border-none rounded-2xl px-5 py-3 text-xs text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <button 
                  type="submit"
                  className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BUBBLE */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-500 ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-emerald-600 text-white'}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <MessageSquare size={24} />
              <span className="text-[6px] font-black uppercase mt-1 tracking-widest">NEXUS</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* DIALER MODAL */}
      <AnimatePresence>
        {isDialing && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl text-white">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center gap-12"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                        <Phone size={48} className="text-white" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Emergency Hub</h2>
                        <p className="text-red-500 font-bold uppercase tracking-widest text-xs mt-2 animate-bounce">Distress Protocol Initialized</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 w-64">
                    <a href={`tel:911`} className="w-full py-5 bg-white text-black rounded-3xl font-black text-center uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
                        <Phone size={20} /> Dial Emergency
                    </a>
                    <button onClick={() => setIsDialing(false)} className="w-full py-5 bg-slate-900 border border-slate-800 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:text-white transition-all">
                        End Crisis Line
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CortexAssistant;
