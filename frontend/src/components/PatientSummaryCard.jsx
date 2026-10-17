import React from 'react';
import { HeartHandshake, ShieldAlert, Sparkles, User, AlertTriangle } from 'lucide-react';

export default function PatientSummaryCard({ summaryData, onReset }) {
  if (!summaryData) return null;

  const {
    patient_greeting,
    overall_reassurance,
    quota_exceeded,
    source,
  } = summaryData;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 p-5 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none"></div>

      <div className="relative space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold tracking-wide">
            <HeartHandshake className="w-4 h-4 text-emerald-700" />
            <span>LabMitra Senior Physician Assessment</span>
          </div>

          <button
            onClick={onReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer"
          >
            Upload Another Report
          </button>
        </div>

        {/* Patient Greeting */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {patient_greeting || 'नमस्ते जी'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {overall_reassurance}
          </p>
        </div>

        {/* Notice Badge if Sarvam Account was low on credits */}
        {quota_exceeded && (
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notice: </span>
              Sarvam AI account reported insufficient credits (402). LabMitra seamlessly rendered this analysis using our verified local Indian clinical knowledge base and ONNX embedding model!
            </div>
          </div>
        )}

        {/* Clinical Disclaimer footer */}
        <div className="pt-2 border-t border-emerald-100/70 flex items-center justify-between text-[11px] text-slate-500">
          <span>100% Indian Dietary Guidelines • Zero Alarmist Language</span>
          <span className="font-semibold text-emerald-800">
            Powered by {source === 'sarvam-105b' ? 'Sarvam-105B' : 'FastEmbed ONNX'}
          </span>
        </div>
      </div>
    </div>
  );
}
