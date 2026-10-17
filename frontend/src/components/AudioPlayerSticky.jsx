import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export default function AudioPlayerSticky({ audioBase64, voiceScript, languageCode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showScript, setShowScript] = useState(false);

  const audioRef = useRef(null);

  // If audioBase64 changes, reset
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioBase64]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio playback error:', err);
        // Fallback: browser speech synthesis if Sarvam TTS audio was not available
        if (!audioBase64 && 'speechSynthesis' in window && voiceScript) {
          const utterance = new SpeechSynthesisUtterance(voiceScript);
          utterance.lang = languageCode || 'hi-IN';
          utterance.rate = playbackRate;
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
        }
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 0.9 : 1.0;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!voiceScript && !audioBase64) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 bg-transparent pointer-events-none pb-safe">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        {/* Expanded Native Voice Script Panel */}
        {showScript && voiceScript && (
          <div className="mb-2 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl max-h-56 overflow-y-auto space-y-2 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>डॉक्टर वॉइस स्क्रिप्ट (Sarvam Bulbul TTS)</span>
              </span>
              <button
                onClick={() => setShowScript(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
              {voiceScript}
            </p>
          </div>
        )}

        {/* Sticky Player Bar */}
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-800/80 flex flex-col space-y-2">
          {audioBase64 && (
            <audio
              ref={audioRef}
              src={`data:audio/mp3;base64,${audioBase64}`}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          <div className="flex items-center justify-between space-x-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-400 active:scale-95 shadow-md shadow-emerald-500/20 transition cursor-pointer shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Title & Timeline */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200 truncate flex items-center space-x-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>पारिवारिक वॉइस सारांश (Regional Voice Summary)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration || 45)}
                </span>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Right Controls: Speed + Script Toggle */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={toggleSpeed}
                title="Playback Speed"
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                {playbackRate}x
              </button>

              <button
                onClick={() => setShowScript(!showScript)}
                title="View Voice Script"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                {showScript ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

