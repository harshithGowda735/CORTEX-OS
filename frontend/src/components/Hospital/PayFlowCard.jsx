import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, TrendingUp, BadgeCheck, ShieldAlert } from 'lucide-react';

const CountUp = ({ to, duration = 1 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(to);
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = totalMiliseconds / end;

    let timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [to]);

  return <span>₹{count.toLocaleString()}</span>;
};

const PayFlowCard = ({ data }) => {
  if (!data) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <CreditCard size={20} className="text-emerald-500" /> 💰 Current Bill
        </h3>
        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
          <BadgeCheck size={12} /> AUTO-AUDITED
        </span>
      </div>

      <div className="space-y-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest relative z-10">Total Real-time Bill</p>
            <div className="text-4xl font-black text-emerald-400 mt-2 relative z-10">
              <CountUp to={data.total || 5500} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 relative z-10">
                <TrendingUp size={12} className="text-emerald-500"/> 
                Predicted Final Bill: <span className="text-white font-bold">₹{(data.predicted || 15000).toLocaleString()}</span>
            </div>
        </motion.div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itemized Breakdown</p>
            <div className="space-y-2">
                <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-600">Consultation Fee</span>
                    <span className="font-bold text-slate-800 text-sm">₹{(data.consultation || 500).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-600">Laboratory Tests</span>
                    <span className="font-bold text-slate-800 text-sm">₹{(data.tests || 2000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                    <span className="text-slate-600">Room/Bed Charges</span>
                    <span className="font-bold text-slate-800 text-sm">₹{(data.room || 3000).toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
             <div className="bg-white p-2 rounded-lg shadow-sm font-bold text-emerald-600">
                <ShieldAlert size={16} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Insurance Optimization</p>
                <p className="text-[10px] text-emerald-900 leading-tight">Switching to preferred provider could save <span className="font-bold">20%</span></p>
             </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PayFlowCard;
