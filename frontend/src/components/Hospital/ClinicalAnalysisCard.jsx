import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Activity, ShieldAlert } from 'lucide-react';

const ClinicalAnalysisCard = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 h-full flex flex-col"
    >
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Stethoscope className="text-blue-500" size={20} /> Clinical Decision Engine
      </h3>
      
      <div className="flex-1 bg-[#0f172a] p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div className="font-mono text-[11px] leading-relaxed relative z-10">
          <div className="text-emerald-500/50 mb-4 tracking-tighter uppercase font-black">
            // CORTEX-OS SYSTEM DIAGNOSTIC OUTPUT
          </div>
          {data ? (
            <div className="space-y-4 text-emerald-400">
                <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-black">ASSESSMENT:</span>
                    <span>{data.assessment}</span>
                </div>
                <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-black">RISK_LEVEL:</span>
                    <span className="text-red-400 font-black">{data.riskLevel} ({data.riskProbability || 'N/A'})</span>
                </div>
                <div className="space-y-1">
                    <p className="text-emerald-600 font-black">NEXT_STEPS:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1 opacity-80">
                        {data.nextSteps?.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                </div>
            </div>
          ) : (
            <div className="opacity-30 flex flex-col items-center justify-center h-48 gap-4">
                <Activity size={32} className="animate-pulse"/>
                <span className="text-[10px] tracking-widest uppercase">Waiting for patient data injection...</span>
            </div>
          )}
        </div>
      </div>

      {data?.riskLevel === 'High' && (
        <motion.div 
          animate={{ x: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="mt-6 p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-red-500/20"
        >
          <ShieldAlert size={24} />
          <div>
            <p className="font-black uppercase text-[10px] tracking-widest">CRITICAL ALERT</p>
            <p className="text-[11px] font-bold">Emergency protocols have been synchronized with the Operations Agent.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClinicalAnalysisCard;
