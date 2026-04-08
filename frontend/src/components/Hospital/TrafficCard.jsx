import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, AlertTriangle, Navigation } from 'lucide-react';

const TrafficCard = ({ data }) => {
  const isHeavy = data.traffic === 'Heavy';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <Navigation size={20} className="text-orange-500" /> 🚑 Emergency Route
        </h3>
        {isHeavy && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase"
          >
            <AlertTriangle size={12} /> Heavy Traffic
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Destination</p>
            <p className="text-sm font-black text-slate-800">{data.hospital || "City Care Hospital"}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">ETA</p>
            <p className="text-sm font-black text-orange-600">{data.eta || "12 mins"}</p>
          </div>
        </div>

        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>

        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 border-dashed">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPin size={16} className="text-orange-500" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-orange-700 uppercase">Alternate Route</p>
                <p className="text-xs font-bold text-orange-950">Emergency Skyway Available</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficCard;
