import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, Thermometer, Wind } from 'lucide-react';

const VitalsCard = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <HeartPulse size={20} className="text-red-500" /> 💓 Biometric Monitor
        </h3>
        <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Live Streaming</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Heart Rate', value: data.heartRate, unit: 'BPM', color: 'text-red-500', icon: Activity, bg: 'bg-red-50' },
          { label: 'SpO2', value: data.spo2, unit: '%', color: 'text-blue-500', icon: Wind, bg: 'bg-blue-50' },
          { label: 'Blood Pressure', value: data.bp, unit: 'mmHg', color: 'text-emerald-500', icon: HeartPulse, bg: 'bg-emerald-50' },
          { label: 'Temperature', value: data.temp, unit: '°F', color: 'text-orange-500', icon: Thermometer, bg: 'bg-orange-50' }
        ].map((v, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05 }}
            className={`p-4 ${v.bg} rounded-2xl border border-white shadow-sm flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-2 opacity-60">
                <v.icon size={12} className={v.color} />
                <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">{v.label}</p>
            </div>
            <p className={`text-2xl font-black ${v.color}`}>{v.value}<span className="text-[10px] ml-0.5 opacity-50">{v.unit}</span></p>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
         <div className="text-emerald-500"><Activity size={18} /></div>
         <p className="text-[10px] font-medium text-slate-600 italic">Vitals are stable but elevated. Monitoring for distress patterns.</p>
      </div>
    </motion.div>
  );
};

export default VitalsCard;
