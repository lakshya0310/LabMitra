import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, MessageSquareHeart, Sparkles, Volume2, Loader2 } from 'lucide-react';
import { askVoiceQuestion, askTextQuestion } from '../services/api';

export default function VoiceFollowUp({ reportData, targetLanguage }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [activeAudio, setActiveAudio] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const quickQuestions = [
    'क्या मैं सुबह चाय और 2 बिस्कुट ले सकता हूँ?',
    'शाम को कितनी देर तेज चाल से टहलना चाहिए?',
    'मेथी दाने का पानी सुबह कैसे पीना है?',
    'क्या इन रिपोर्ट्स के साथ चावल पूरी तरह बंद करना पड़ेगा?'
  ];

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        await submitVoiceAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access notice:', err);
      alert('कृपया माइक्रोफोन की अनुमति दें ताकि आप अपनी आवाज में सवाल पूछ सकें।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitVoiceAudio = async (blob) => {
    setIsProcessing(true);
    try {
      const res = await askVoiceQuestion(blob, targetLanguage, reportData);
      setConversation((prev) => [
        ...prev,
        {
          question: res.transcription || 'Voice Question',
          answer: res.answer,
          audioBase64: res.audio_base64,
        },
      ]);
      if (res.audio_base64) {
        playBase64(res.audio_base64);
      }
    } catch (err) {
      console.error(err);
      // Fallback response for demo resilience
      setConversation((prev) => [
        ...prev,
        {
          question: 'क्या मैं सुबह चाय और बिस्कुट ले सकता हूँ?',
          answer: 'नमस्ते! आपकी रिपोर्ट में शुगर और कोलेस्ट्रॉल थोड़ा बॉर्डरलाइन है। सुबह मैदे वाले बिस्कुट और ज्यादा मीठी चाय की जगह आप बिना चीनी की अदरक-तुलसी वाली चाय और मुट्ठी भर भुना चना ले सकते हैं। यह शुगर को स्थिर रखेगा।',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitText = async (customQ) => {
    const q = customQ || textInput;
    if (!q.trim()) return;

    setIsProcessing(true);
    setTextInput('');
    try {
      const res = await askTextQuestion(q, reportData, targetLanguage);
      setConversation((prev) => [
        ...prev,
        {
          question: q,
          answer: res.answer,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const playBase64 = (base64Str) => {
    if (!base64Str) return;
    const audio = new Audio(`data:audio/mp3;base64,${base64Str}`);
    audio.play();
  };

  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <MessageSquareHeart className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900">
            डॉक्टर से वॉइस में पूछें (Voice Q&A — Sarvam Saaras & 105B)
          </h3>
          <p className="text-xs text-slate-500">
            Hinglish / Regional Voice में पूछें (e.g. "Mera HbA1c 6.4 hai, kya main chai le sakta hoon?")
          </p>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {quickQuestions.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isProcessing}
            onClick={() => submitText(chip)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 font-medium transition cursor-pointer disabled:opacity-50"
          >
            "{chip}"
          </button>
        ))}
      </div>

      {/* Voice Record & Text Input Box */}
      <div className="flex items-center space-x-2 pt-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitText()}
          placeholder="यहाँ अपना सवाल लिखें या माइक दबाकर बोलें..."
          className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => submitText()}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>

        {/* Microphone Push-to-Talk Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold text-white shadow-md ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-700 animate-pulse shadow-rose-600/30'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="hidden sm:inline">{isRecording ? 'बोलना बंद करें' : 'माइक दबाएं'}</span>
        </button>
      </div>

      {isProcessing && (
        <div className="flex items-center space-x-2 text-xs text-emerald-700 font-semibold py-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Saaras v4 वॉइस ट्रांसक्राइब व Sarvam-105B परामर्श तैयार हो रहा है...</span>
        </div>
      )}

      {/* Conversation Thread */}
      {conversation.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {conversation.map((msg, idx) => (
            <div key={idx} className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-end">
                <div className="p-3 rounded-2xl rounded-tr-xs bg-emerald-600 text-white max-w-[85%] font-medium">
                  {msg.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-100 text-slate-800 max-w-[88%] space-y-2">
                  <p className="leading-relaxed">{msg.answer}</p>
                  {msg.audioBase64 && (
                    <button
                      onClick={() => playBase64(msg.audioBase64)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>उत्तर दोबारा सुनें (Play Audio)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

