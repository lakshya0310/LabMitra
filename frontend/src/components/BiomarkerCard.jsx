import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Utensils, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BiomarkerCard({ card }) {
  const [expanded, setExpanded] = useState(true);

  const {
    test_name,
    value_with_unit,
    reference_range,
    status,
    simple_meaning,
    indian_food_swaps = [],
  } = card;

  // Status Styling Configuration
  const getStatusBadge = () => {
    switch (status) {
      case 'HIGH_PRIORITY':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500',
          label: 'डॉक्टर से परामर्श लें (Review)',
        };
      case 'BORDERLINE':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          dot: 'bg-amber-500',
          label: 'हल्का बॉर्डरलाइन (Borderline)',
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          label: 'सामान्य सीमा में (Normal)',
        };
    }
  };

  const badgeConfig = getStatusBadge();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-sm transition-all overflow-hidden">
      {/* Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 sm:p-5 flex items-start justify-between cursor-pointer select-none bg-white"
      >
        <div className="space-y-1 pr-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {test_name}
            </h3>
            <span
              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeConfig.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot}`}></span>
              <span>{badgeConfig.label}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-500">
            <span>
              Result: <strong className="text-slate-900 font-bold">{value_with_unit}</strong>
            </span>
            <span>•</span>
            <span>Ref: {reference_range}</span>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Content: Plain Meaning & Indian Food Swaps */}
      {expanded && (
        <div className="px-4 pb-5 sm:px-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3.5">
          {/* Simple Regional Meaning */}
          <div className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200/70">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{simple_meaning}</p>
          </div>

          {/* 100% Indian Kitchen Swaps */}
          {indian_food_swaps && indian_food_swaps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>घरेलू भारतीय आहार व आसान उपाय (Kitchen Swaps)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {indian_food_swaps.map((swap, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-slate-800 font-medium leading-relaxed"
                  >
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span>{swap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

