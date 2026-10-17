import React from 'react';
import { Activity, ShieldCheck, Server, AlertCircle } from 'lucide-react';

export default function Header({ backendStatus, selectedLanguage, onLanguageChange }) {
  const languages = [
    { code: 'hi-IN', label: 'हिंदी (Hindi)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'mr-IN', label: 'मराठी (Marathi)' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'bn-IN', label: 'বাংলা (Bengali)' },
    { code: 'en-IN', label: 'English' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">LabMitra</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                लैबमित्र
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Empathetic Family Report Explainer</p>
          </div>
        </div>

        {/* Right actions: Server status + Language */}
        <div className="flex items-center space-x-2">
          {/* Backend Health Pill */}
          <div className="hidden sm:flex items-center text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
            {backendStatus.healthy ? (
              <span className="flex items-center text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                FastEmbed 160MB Ready
              </span>
            ) : (
              <span className="flex items-center text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1.5"></span>
                Waking Render...
              </span>
            )}
          </div>

          {/* Language selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

