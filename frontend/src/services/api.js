/**
 * LabMitra API Client
 * Dynamically resolves Render Web Service in production or Localhost during development.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return { healthy: false, sleeping: true };
    const data = await response.json();
    return { healthy: true, sleeping: false, data };
  } catch (err) {
    return { healthy: false, sleeping: true, error: err.message };
  }
}

export async function analyzeReportFile(file, targetLanguage = 'hi-IN', patientName = '') {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('target_language', targetLanguage);
  if (patientName) {
    formData.append('patient_name', patientName);
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze-report`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Report analysis failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function analyzeDirectReport(payload) {
  const response = await fetch(`${API_BASE_URL}/api/analyze-direct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Direct analysis failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function requestTTS(text, languageCode = 'hi-IN', model = 'bulbul:v3') {
  const response = await fetch(`${API_BASE_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language_code: languageCode, model }),
  });

  if (!response.ok) {
    throw new Error('TTS conversion request failed');
  }

  return response.json();
}

export async function askVoiceQuestion(audioBlob, targetLanguage = 'hi-IN', reportData = {}) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'patient_question.wav');
  formData.append('target_language', targetLanguage);
  formData.append('report_json', JSON.stringify(reportData));

  const response = await fetch(`${API_BASE_URL}/api/ask-voice`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Voice question failed: ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function askTextQuestion(question, reportSummary, targetLanguage = 'hi-IN') {
  const response = await fetch(`${API_BASE_URL}/api/chat-followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      report_summary: reportSummary,
      target_language: targetLanguage,
    }),
  });

  if (!response.ok) {
    throw new Error('Followup question failed');
  }

  return response.json();
}

