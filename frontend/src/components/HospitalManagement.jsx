import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bed, Pill, Users, AlertTriangle, CheckCircle,
  Clock, TrendingUp, DollarSign, RefreshCw, ArrowLeft, 
  Heart, Thermometer, Stethoscope, ShieldAlert, Package,
  ChevronDown, ChevronUp, Edit3, Save, X, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${SOCKET_URL}/api/hospital`;

export default function HospitalManagement() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [socket, setSocket] = useState(null);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API}/dashboard`);
      const json = await res.json();
      if (json.success) {
        setHospital(json.data.hospital);
        setDoctors(json.data.doctors);
        setBookings(json.data.recentBookings);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Role-Guard: If role is patient, push to dashboard
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role === 'patient') {
      window.location.href = '/';
      return;
    }

    fetchDashboard();
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('hospital-update', (update) => {
      setRealtimeAlerts(prev => [
        { ...update, timestamp: new Date() },
        ...prev.slice(0, 9)
      ]);
      // Refresh data on any update
      fetchDashboard();
    });

    newSocket.on('agent-activity', (data) => {
      if (data.agent === 'Auto-Booking') {
        setRealtimeAlerts(prev => [
          { type: 'mcp-action', data: data, timestamp: new Date() },
          ...prev.slice(0, 9)
        ]);
      }
    });

    return () => newSocket.disconnect();
  }, []);

  // Update doctor status
  const handleDoctorStatus = async (doctorId, newStatus) => {
    try {
      await fetch(`${API}/doctor/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDashboard();
    } catch (err) {
      console.error('Doctor status update error:', err);
    }
  };

  const handleBedUpdate = async (bedType, increment) => {
    try {
      await fetch(`${API}/beds/manual`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedType, increment })
      });
      fetchDashboard();
    } catch (err) {
      console.error('Bed update error:', err);
    }
  };

  // Update medicine stock
  const handleMedicineUpdate = async (medicineId, update) => {
    try {
      await fetch(`${API}/medicine/${medicineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      fetchDashboard();
      toast.success("Pharmacy inventory updated");
    } catch (err) {
      console.error('Pharmacy update error:', err);
    }
  };

  // Update dynamic pricing
  const handlePricingUpdate = async (update) => {
    try {
      await fetch(`${API}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      fetchDashboard();
      toast.success("Pricing multipliers updated");
    } catch (err) {
      console.error('Pricing update error:', err);
    }
  };

  // Message Patient
  const handlePatientAlert = async (userId, message) => {
    try {
      await fetch(`${API}/patient/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message, type: 'emergency' })
      });
      toast.success("Alert sent to patient dashboard");
    } catch (err) {
      console.error('Patient alert error:', err);
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to remove this medical staff?")) return;
    try {
      await fetch(`${API}/doctor/${doctorId}`, { method: 'DELETE' });
      fetchDashboard();
      toast.success("Medical staff removed");
    } catch (err) {
      console.error('Doctor delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-emerald-600" size={48} />
          <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const beds = hospital?.beds || { total: 0, available: 0, icu: { total: 0, available: 0 }, general: { total: 0, available: 0 }, emergency: { total: 0, available: 0 } };
  const medicines = hospital?.medicines || [];
  const occupancyPercent = beds.total > 0 ? Math.round(((beds.total - beds.available) / beds.total) * 100) : 0;
  const lowStockMeds = medicines.filter(m => m.stock <= m.threshold);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'beds', label: 'Bed Management', icon: Bed },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'medicines', label: 'Pharmacy', icon: Pill },
    { id: 'bookings', label: 'Appointments', icon: Clock },
    { id: 'pricing', label: 'Revenue Hub', icon: DollarSign },
  ];

  const handleManualBedAction = (type, action) => {
    const increment = action === 'discharge' ? 1 : -1;
    handleBedUpdate(type, increment);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans">
      {/* HEADER */}
      <header className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white py-6 px-6 shadow-2xl border-b-2 border-emerald-500/20">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
              <ArrowLeft size={18} className="text-slate-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
                <ShieldAlert size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">CORTEX<span className="text-emerald-500">-OS</span> <span className="text-slate-400 font-normal text-sm">Hospital Command</span></h1>
                <p className="text-[9px] uppercase tracking-[0.25em] text-slate-400 font-bold">{hospital?.hospitalName || 'Loading...'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> MCP Live</div>
            <div className="flex items-center gap-2 text-cyan-300"><span className="w-2 h-2 rounded-full bg-cyan-300" /> {beds.available} Beds Free</div>
            <div className="flex items-center gap-2 text-amber-300"><span className="w-2 h-2 rounded-full bg-amber-300" /> {doctors.filter(d => d.status === 'Available').length} Docs Ready</div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex gap-0 min-h-[calc(100vh-72px)]">
        {/* SIDEBAR NAV */}
        <nav className="w-56 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 shadow-lg">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all ${
                activeSection === item.id
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}

          {/* Real-time Alerts */}
          <div className="mt-auto pt-4 border-t border-slate-200">
            <h4 className="text-[8px] uppercase tracking-widest text-emerald-600/60 font-black mb-3 px-2">Live MCP Feed</h4>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {realtimeAlerts.length === 0 && (
                <p className="text-[9px] text-slate-400 italic px-2">Waiting for activity...</p>
              )}
              {realtimeAlerts.slice(0, 5).map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-50 rounded-lg p-2.5 text-[9px] border border-slate-100"
                >
                  <span className={`font-black uppercase ${alert.type === 'auto-booking' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {alert.type === 'auto-booking' ? '🏥 Auto-Book' : alert.type === 'mcp-action' ? '🤖 MCP' : '📡 Update'}
                  </span>
                  <p className="text-slate-500 mt-1 leading-tight">
                    {alert.data?.message || alert.data?.assignedDoctor || JSON.stringify(alert.data).slice(0, 60)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* ===== OVERVIEW ===== */}
            {activeSection === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                  <Activity className="text-emerald-600" size={28} /> Hospital Overview
                </h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <StatCard label="Total Beds" value={beds.total} sub={`${beds.available} available`} color="cyan" icon={<Bed size={20} />} />
                  <StatCard label="Occupancy" value={`${occupancyPercent}%`} sub={occupancyPercent > 85 ? 'CRITICAL' : 'Normal'} color={occupancyPercent > 85 ? 'red' : 'emerald'} icon={<TrendingUp size={20} />} />
                  <StatCard label="Doctors" value={doctors.length} sub={`${doctors.filter(d => d.status === 'Available').length} available`} color="blue" icon={<Users size={20} />} />
                  <StatCard label="Low Stock Meds" value={lowStockMeds.length} sub={lowStockMeds.length > 0 ? 'Action needed' : 'All stocked'} color={lowStockMeds.length > 0 ? 'amber' : 'emerald'} icon={<AlertTriangle size={20} />} />
                </div>

                {/* Bed Breakdown & Live Triage */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 grid grid-cols-3 gap-6">
                    <BedTypeCard type="ICU" data={beds.icu} color="red" onAction={handleManualBedAction} />
                    <BedTypeCard type="General" data={beds.general} color="blue" onAction={handleManualBedAction} />
                    <BedTypeCard type="Emergency" data={beds.emergency} color="amber" onAction={handleManualBedAction} />
                  </div>
                  
                  {/* LIVE TRIAGE PANEL */}
                  <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-6 shadow-xl flex flex-col h-full">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                       <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                       Patient Crisis Monitor
                    </h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                      {realtimeAlerts.filter(a => a.type === 'mcp-action').length === 0 && (
                        <p className="text-xs text-slate-400 italic">No active emergencies detected...</p>
                      )}
                      {realtimeAlerts.filter(a => a.type === 'mcp-action').map((alert, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[10px] font-black uppercase text-red-500 mb-1">High Risk Detected</p>
                          <p className="text-sm font-bold text-slate-800">{alert.data?.vitals?.condition || "Emergency Alert"}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Resource Allocated: {alert.data?.assignedDoctor}</p>
                          <div className="flex gap-2 mt-3">
                            <button 
                              onClick={() => handlePatientAlert(alert.data.userId || 'demo', 'A doctor has been assigned and a bed is reserved for you. Please proceed to the emergency ward.')}
                              className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                            >
                              Confirm
                            </button>
                            <button 
                               onClick={() => handlePatientAlert(alert.data.userId || 'demo', 'Hospital is currently at high capacity. Emergency services are being redirected.')}
                               className="py-1.5 px-3 rounded-lg bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
                            >
                              Alert Wait
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-4">Recent Appointments</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((b, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div>
                          <p className="text-sm font-bold">{b.department}</p>
                          <p className="text-[10px] text-slate-500">{b.reason || 'No reason provided'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                            b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                            b.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>{b.status}</span>
                          <p className="text-[9px] text-slate-500 mt-1">{b.timeSlot}</p>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && <p className="text-slate-500 text-sm italic">No appointments yet</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== BED MANAGEMENT ===== */}
            {activeSection === 'beds' && (
              <motion.div key="beds" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                  <Bed className="text-emerald-600" size={28} /> Bed Management
                </h2>
                <div className="grid grid-cols-3 gap-8">
                  {[
                    { key: 'icu', label: 'ICU', data: beds.icu, color: 'red' },
                    { key: 'general', label: 'General Ward', data: beds.general, color: 'blue' },
                    { key: 'emergency', label: 'Emergency', data: beds.emergency, color: 'amber' },
                  ].map(bed => (
                    <div key={bed.key} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                      <h3 className={`text-lg font-black text-${bed.color}-400 mb-4`}>{bed.label}</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Total</span>
                          <span className="font-bold">{bed.data.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Available</span>
                          <span className="font-bold text-emerald-400">{bed.data.available}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Occupied</span>
                          <span className="font-bold text-red-400">{bed.data.total - bed.data.available}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full bg-${bed.color}-500 transition-all`}
                            style={{ width: `${bed.data.total > 0 ? ((bed.data.total - bed.data.available) / bed.data.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => handleBedUpdate(bed.key, -1)}
                          disabled={bed.data.available <= 0}
                          className="py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-red-500/20 transition-all disabled:opacity-30"
                        >
                          Manual Admit
                        </button>
                        <button 
                          onClick={() => handleBedUpdate(bed.key, 1)}
                          disabled={bed.data.available >= bed.data.total}
                          className="py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-emerald-500/20 transition-all disabled:opacity-30"
                        >
                          Discharge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== DOCTORS ===== */}
            {activeSection === 'doctors' && (
              <motion.div key="doctors" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                    <Users className="text-emerald-600" size={28} /> Doctor Roster
                  </h2>
                  <button 
                    onClick={() => toast.success("Specialist creation form enabled for demo.")}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    + Add Specialist
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {doctors.map(doc => (
                    <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start justify-between shadow-lg">
                      <div>
                        <h3 className="text-base font-bold">{doc.name}</h3>
                        <p className="text-xs text-slate-500">{doc.specialization} · {doc.experience} yrs exp</p>
                        <p className="text-[9px] text-slate-400 mt-1">Shift: {doc.shift?.start || '—'} → {doc.shift?.end || '—'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          doc.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' :
                          doc.status === 'On Duty' ? 'bg-blue-500/20 text-blue-400' :
                          doc.status === 'In Surgery' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>{doc.status}</span>
                        <div className="flex gap-2">
                           <select
                            value={doc.status}
                            onChange={(e) => handleDoctorStatus(doc._id, e.target.value)}
                            className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-800 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Available">Available</option>
                            <option value="On Duty">On Duty</option>
                            <option value="In Surgery">In Surgery</option>
                            <option value="Off Duty">Off Duty</option>
                          </select>
                          <button 
                            onClick={() => handleDeleteDoctor(doc._id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            title="Remove Doctor"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== PHARMACY / MEDICINES ===== */}
            {activeSection === 'medicines' && (
              <motion.div key="medicines" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                  <Pill className="text-emerald-600" size={28} /> Pharmacy Inventory
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-widest text-slate-500 bg-slate-50">
                        <th className="p-4">Medicine</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Unit</th>
                        <th className="p-4">₹/Unit</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-sm font-bold">{med.name}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-black px-2 py-1 rounded ${
                              med.category === 'Emergency' ? 'bg-red-500/20 text-red-400' :
                              med.category === 'Cardiac' ? 'bg-pink-500/20 text-pink-400' :
                              med.category === 'Antibiotic' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>{med.category}</span>
                          </td>
                          <td className="p-4 text-sm font-bold">{med.stock}</td>
                          <td className="p-4 text-xs text-slate-500">{med.unit}</td>
                          <td className="p-4 text-sm font-bold">₹{med.pricePerUnit}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleMedicineUpdate(med._id, { stock: med.stock + 50 })}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                title="Restock +50"
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button 
                                onClick={() => handleMedicineUpdate(med._id, { pricePerUnit: med.pricePerUnit + 5 })}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                title="Adjust Price +₹5"
                              >
                                <TrendingUp size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ===== BOOKINGS ===== */}
            {activeSection === 'bookings' && (
              <motion.div key="bookings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                  <Clock className="text-emerald-600" size={28} /> Appointment Log
                </h2>
                <div className="space-y-4">
                  {bookings.map((b, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          b.status === 'Confirmed' ? 'bg-emerald-500/20' :
                          b.status === 'Pending' ? 'bg-amber-500/20' :
                          'bg-slate-500/20'
                        }`}>
                          <Stethoscope size={20} className={
                            b.status === 'Confirmed' ? 'text-emerald-400' :
                            b.status === 'Pending' ? 'text-amber-400' :
                            'text-slate-400'
                          } />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{b.department}</p>
                          <p className="text-[10px] text-slate-500">{b.reason || 'Manual booking'}</p>
                          <p className="text-[9px] text-slate-600 mt-1">
                            {new Date(b.appointmentDate).toLocaleDateString()} at {b.timeSlot}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${
                        b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                        b.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                        b.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{b.status}</span>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <Clock size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-sm italic">No bookings yet. Try a query from the Patient Dashboard.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== PRICING / REVENUE HUB ===== */}
            {activeSection === 'pricing' && (
              <motion.div key="pricing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                  <DollarSign className="text-emerald-600" size={28} /> Financial Breakdown & Revenue
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard 
                    label="Total Generated" 
                    value={`₹${(bookings.length * 4500).toLocaleString()}`} 
                    sub="Severity Adjusted" 
                    color="emerald" 
                    icon={<TrendingUp size={24} />} 
                  />
                   <StatCard 
                    label="Avg. Case Value" 
                    value="₹5,200" 
                    sub="Autonomous Billing" 
                    color="blue" 
                    icon={<CreditCard size={24} />} 
                  />
                  <div className="lg:col-span-2 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Dynamic Multiplier Status</p>
                      <h3 className="text-2xl font-black mt-1">AI-Managed Pricing Active</h3>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                      <TrendingUp className="text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-8">
                  {hospital?.severityPricing && Object.entries(hospital.severityPricing).map(([key, val]) => (
                    <div key={key} className={`bg-white rounded-2xl border p-6 shadow-lg ${
                      key === 'high' ? 'border-red-500/30' :
                      key === 'moderate' ? 'border-amber-500/30' :
                      'border-emerald-500/30'
                    }`}>
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-black uppercase ${
                          key === 'high' ? 'text-red-400' :
                          key === 'moderate' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>{val.label}</h3>
                        <button 
                          onClick={() => handlePricingUpdate({ severityPricing: { ...hospital.severityPricing, [key]: { ...val, multiplier: val.multiplier + 0.1 } } })}
                          className="p-1 px-2 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-black"
                        >
                          +0.1x
                        </button>
                      </div>
                      <p className="text-4xl font-black mt-4">{val.multiplier.toFixed(1)}x</p>
                      <p className="text-xs text-slate-500 mt-2 capitalize">{key} severity multiplier</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-6">Base Cost Breakdown (Manual Adjust)</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {hospital?.basePricing && Object.entries(hospital.basePricing).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 rounded-xl p-4 border border-slate-100 group relative">
                        <p className="text-[10px] text-slate-500 uppercase font-black">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-xl font-black text-slate-800 mt-1">₹{val.toLocaleString()}</p>
                        <button 
                           onClick={() => handlePricingUpdate({ basePricing: { ...hospital.basePricing, [key]: val + 100 } })}
                           className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-emerald-500 text-white rounded transition-opacity"
                        >
                          <ChevronUp size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden shadow-lg`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-8 -mt-8`} />
      <div className="relative z-10">
        <div className={`text-${color}-400 mb-3`}>{icon}</div>
        <p className="text-3xl font-black">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">{label}</p>
        <p className={`text-[9px] mt-2 font-bold text-${color}-400`}>{sub}</p>
      </div>
    </div>
  );
}

function BedTypeCard({ type, data, color, onAction }) {
  const occupancy = data.total > 0 ? Math.round(((data.total - data.available) / data.total) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-black text-${color}-500 uppercase tracking-wider`}>{type}</h3>
        <span className="text-[10px] text-slate-500 font-bold">{occupancy}% FULL</span>
      </div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-black">{data.available}</p>
          <p className="text-[9px] text-slate-500 uppercase font-bold">Available</p>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onAction(type.toLowerCase(), 'admit')}
            className={`p-1 rounded bg-${color}-500/10 text-${color}-500 hover:bg-${color}-500/20`}
          >
            <ChevronDown size={14} />
          </button>
          <button 
            onClick={() => onAction(type.toLowerCase(), 'discharge')}
            className={`p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20`}
          >
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full bg-${color}-500 transition-all`} style={{ width: `${occupancy}%` }} />
      </div>
    </div>
  );
}
