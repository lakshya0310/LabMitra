import React, { useState } from 'react';
import { HelpCircle, Copy, Check } from 'lucide-react';

export default function DoctorQuestionsCard({ questions }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!questions || questions.length === 0) return null;

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 sm:p-6 space-y-3.5 shadow-2xs">
      <div className="flex items-center space-x-2 text-indigo-950">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900">
            डॉक्टर साहब से पूछने योग्य सवाल (Questions for Doctor)
          </h3>
          <p className="text-xs text-slate-500">
            जब आप क्लीनिक जाएं, तो अपने डॉक्टर से यह सवाल बेझिझक पूछें:
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between p-3 rounded-xl bg-white border border-indigo-100/80 shadow-2xs text-xs sm:text-sm text-slate-800"
          >
            <div className="flex items-start space-x-2.5 pr-2">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="font-medium leading-relaxed">{q}</p>
            </div>

            <button
              onClick={() => handleCopy(q, idx)}
              title="Copy to clipboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer shrink-0"
            >
              {copiedIdx === idx ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

