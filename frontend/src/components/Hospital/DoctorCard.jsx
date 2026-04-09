import React from 'react';
import { motion } from 'framer-motion';
import { Users, BadgeCheck, Stethoscope, Clock } from 'lucide-react';

const DoctorCard = ({ doctors }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full"
    >
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Users className="text-indigo-500" size={20} /> Staff Operations
      </h3>
      <div className="space-y-4">
        {doctors.map((dr, i) => (
          <motion.div 
            key={i}
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl border border-slate-100 uppercase">
                        {dr.spec.includes('Cardiology') ? '❤️' : 
                         dr.spec.includes('Pediatrics') ? '👶' : 
                         dr.spec.includes('Orthopedics') ? '🦴' :
                         dr.spec.includes('Neurology') ? '🧠' :
                         dr.spec.includes('Surgery') ? '🏥' : '🩺'}
                    </div>
                    {dr.status === 'Available' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-50 flex items-center justify-center">
                            <BadgeCheck size={10} className="text-white" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm font-black text-slate-800 flex items-center gap-1">
                        {dr.name}
                        {dr.status === 'Available' && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">On Duty</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{dr.spec}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">Wait: {dr.status === 'Available' ? '0 min' : '45 min'}</span>
                </div>
                <p className={`text-[10px] font-black uppercase mt-1 ${dr.status === 'Available' ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {dr.status}
                </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 pt-8 border-t border-slate-100">
         <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-indigo-500"><Stethoscope size={16} /></div>
                <div>
                    <p className="text-[10px] font-black text-indigo-700 uppercase">Specialist Alert</p>
                    <p className="text-[11px] text-indigo-900">Cardiology bypass activated for emergency</p>
                </div>
            </div>
            <button className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800">Details</button>
         </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
