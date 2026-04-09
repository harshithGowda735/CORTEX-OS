import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingInteractionCard = ({ autoBooking, suggestion }) => {
  const [isManualBooking, setIsManualBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const handleManualBook = () => {
    setIsManualBooking(true);
    setTimeout(() => {
      setIsManualBooking(false);
      setIsBooked(true);
      toast.success("Appointment request sent successfully!");
    }, 1500);
  };

  // Scenario 1: Autonomous Booking (High Severity)
  if (autoBooking) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500 text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Autonomous Admission Secured</h3>
          </div>
          <p className="text-sm font-bold opacity-90 mb-6 leading-relaxed">
            Due to the clinical severity, CORTEX-OS has autonomously secured your placement at {autoBooking.hospital}.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-black opacity-60 mb-1">Status</p>
              <p className="text-sm font-bold">Confirmed</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-black opacity-60 mb-1">Priority</p>
              <p className="text-sm font-bold">Emergency</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Scenario 2: Suggestive Booking (Normal Severity)
  if (suggestion?.canBookManual && !isBooked) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-slate-200 rounded-[2rem] p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
            <Info size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recommendation</h3>
        </div>
        <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
          {suggestion.message}
        </p>
        
        <button 
          onClick={handleManualBook}
          disabled={isManualBooking}
          className="w-full py-5 bg-[#0f172a] hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl"
        >
          {isManualBooking ? (
             <>
               <ArrowRight className="animate-pulse" size={16} /> Negotiating with Ops Core...
             </>
          ) : (
             <>
               <Calendar size={16} /> Book Appointment Now
             </>
          )}
        </button>
      </motion.div>
    );
  }

  // Scenario 3: Manual Booking Success
  if (isBooked) {
    return (
       <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-50 border-2 border-emerald-500/30 rounded-[2rem] p-8 text-center"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-800">Booking Requested</h3>
        <p className="text-xs font-bold text-slate-500 mt-2">The hospital has been notified of your request.</p>
      </motion.div>
    )
  }

  return null;
};

export default BookingInteractionCard;
