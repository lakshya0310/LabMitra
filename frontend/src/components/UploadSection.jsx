import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_REPORTS } from '../data/sampleReports';

export default function UploadSection({ onFileSelected, onSampleSelected, isAnalyzing, currentStage }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Upload Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all bg-white shadow-xs ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />

        {isAnalyzing ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-slate-800 text-base">
                {currentStage || 'Analyzing Lab Report...'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Running in-memory OpenCV contrast correction, FastEmbed ONNX semantic search, and Sarvam AI synthesis.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-inner">
              <Upload className="w-7 h-7 stroke-[2]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Upload Indian Diagnostic Report
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                PDF or smartphone photo from Dr. Lal PathLabs, Thyrocare, Apollo, SRL, Metropolis, etc.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Choose PDF / Image</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 active:scale-95 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Indian Lab Report Samples for 1-Click Instant Demo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Or try an instant sample report
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">1-Click Demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_REPORTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isAnalyzing}
              onClick={() => onSampleSelected(sample)}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition shadow-2xs group cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  {sample.labName}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {sample.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
              <div className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center space-x-1">
                <span>View {sample.patientName} ({sample.tests.length} tests)</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

