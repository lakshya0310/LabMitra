import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import PatientSummaryCard from './components/PatientSummaryCard';
import BiomarkerCard from './components/BiomarkerCard';
import DoctorQuestionsCard from './components/DoctorQuestionsCard';
import AudioPlayerSticky from './components/AudioPlayerSticky';
import VoiceFollowUp from './components/VoiceFollowUp';
import { checkBackendHealth, analyzeReportFile, analyzeDirectReport } from './services/api';

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [backendStatus, setBackendStatus] = useState({ healthy: false, sleeping: true });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [reportAnalysis, setReportAnalysis] = useState(null);
  const [rawReportData, setRawReportData] = useState(null);

  // Health check on mount to wake sleeping Render instance
  useEffect(() => {
    checkBackendHealth().then((status) => {
      setBackendStatus(status);
    });
  }, []);

  // Handle uploaded file (photo or PDF)
  const handleFileSelected = async (file) => {
    setIsAnalyzing(true);
    setCurrentStage('Enhancing photo with OpenCV & extracting biomarkers...');
    try {
      const result = await analyzeReportFile(file, selectedLanguage);
      setReportAnalysis(result);
      setRawReportData({
        patient_name: result.patient_greeting,
        tests: result.extracted_tests || [],
      });
    } catch (err) {
      console.error(err);
      alert('Could not analyze report. Please check server connection.');
    } finally {
      setIsAnalyzing(false);
      setCurrentStage('');
    }
  };

  // Handle 1-click sample report preset
  const handleSampleSelected = async (sample) => {
    setIsAnalyzing(true);
    setCurrentStage(`Querying FastEmbed Knowledge Base for ${sample.patientName}...`);
    try {
      const payload = {
        patient_name: sample.patientName,
        age: sample.age,
        gender: sample.gender,
        target_language: selectedLanguage,
        tests: sample.tests,
      };
      const result = await analyzeDirectReport(payload);
      setReportAnalysis(result);
      setRawReportData(payload);
    } catch (err) {
      console.error(err);
      alert('Could not load sample report.');
    } finally {
      setIsAnalyzing(false);
      setCurrentStage('');
    }
  };

  const handleReset = () => {
    setReportAnalysis(null);
    setRawReportData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-28">
      {/* Top Header */}
      <Header
        backendStatus={backendStatus}
        selectedLanguage={selectedLanguage}
        onLanguageChange={(lang) => setSelectedLanguage(lang)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {!reportAnalysis ? (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 tracking-wide uppercase">
                Zero Panic • 100% Indian Kitchen Swaps
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Understand Your Blood Test Reports Calmly
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Empathetic explanations in your regional language with verified Indian dietary guidance and Sarvam AI voice.
              </p>
            </div>

            {/* Upload & Sample Selector */}
            <UploadSection
              onFileSelected={handleFileSelected}
              onSampleSelected={handleSampleSelected}
              isAnalyzing={isAnalyzing}
              currentStage={currentStage}
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Patient Reassurance Summary */}
            <PatientSummaryCard summaryData={reportAnalysis} onReset={handleReset} />

            {/* Biomarker Cards List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  विस्तृत बायोमार्कर विश्लेषण (Biomarker Insights)
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {reportAnalysis.biomarker_cards?.length || 0} Parameters Tested
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {reportAnalysis.biomarker_cards?.map((card, idx) => (
                  <BiomarkerCard key={idx} card={card} />
                ))}
              </div>
            </div>

            {/* Questions for the Doctor */}
            <DoctorQuestionsCard questions={reportAnalysis.doctor_questions} />

            {/* Voice Q&A Follow-up Section */}
            <VoiceFollowUp reportData={rawReportData} targetLanguage={selectedLanguage} />
          </div>
        )}
      </main>

      {/* Sticky Bottom Regional Audio Player */}
      {reportAnalysis && (
        <AudioPlayerSticky
          audioBase64={reportAnalysis.audio_base64}
          voiceScript={reportAnalysis.voice_script}
          languageCode={selectedLanguage}
        />
      )}
    </div>
  );
}
