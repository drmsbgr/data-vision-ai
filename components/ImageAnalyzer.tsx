import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Play, Square, Pause, Loader2, Image as ImageIcon, Volume2 } from 'lucide-react';
import { analyzeChartImage, generateSpeech } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../utils/audio';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [audioState, setAudioState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  // Initialize Audio Context lazily
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    return audioCtxRef.current;
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore error if already stopped
      }
      sourceNodeRef.current = null;
    }
    setAudioState('stopped');
    pausedAtRef.current = 0;
  };

  const playAudio = () => {
    const ctx = getAudioContext();
    const buffer = audioBufferRef.current;

    if (!buffer) return;

    if (audioState === 'playing') return;

    // Create a new source node (nodes are one-time use)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    sourceNodeRef.current = source;

    // Handle end of playback
    source.onended = () => {
      setAudioState((prev) => (prev === 'playing' ? 'stopped' : prev));
    };

    // Start playback
    // If paused, resume from pausedAt. Else start from 0.
    const offset = pausedAtRef.current;
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;

    // Resume context if suspended (needed for some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    setAudioState('playing');
  };

  const pauseAudio = () => {
    const ctx = getAudioContext();
    if (audioState === 'playing' && sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      // Calculate where we paused
      pausedAtRef.current = ctx.currentTime - startTimeRef.current;
      setAudioState('paused');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setAnalysis("");
        stopAudio();
        audioBufferRef.current = null;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    stopAudio();
    audioBufferRef.current = null;

    setAnalysis("Resim Gemini 3 Pro ile analiz ediliyor...");
    try {
      const base64Data = image.split(',')[1];
      const text = await analyzeChartImage(base64Data);
      setAnalysis(text);
      
      setAnalysis(prev => prev + "\n\n(Ses oluşturuluyor...)");
      const audioBase64 = await generateSpeech(text);
      
      // Decode audio immediately and store buffer
      const ctx = getAudioContext();
      const arrayBuffer = decodeBase64(audioBase64);
      const decodedBuffer = await decodeAudioData(arrayBuffer, ctx);
      audioBufferRef.current = decodedBuffer;
      
      setAnalysis(text); // Remove "Generating voice" text
      playAudio(); // Auto play

    } catch (err) {
      console.error(err);
      setAnalysis("Resim analizi veya ses oluşturma hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Input Section */}
      <div className="md:w-1/2 flex flex-col gap-4">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex-1 flex flex-col items-center justify-center min-h-[300px] shadow-lg relative overflow-hidden group">
          {image ? (
            <img src={image} alt="Yüklenen Grafik" className="max-h-80 object-contain rounded-md shadow-2xl z-10 relative" />
          ) : (
            <div className="text-center text-gray-500 z-10 relative">
              <div className="bg-gray-700/50 p-4 rounded-full inline-block mb-4">
                 <ImageIcon size={48} className="opacity-70 text-gray-400" />
              </div>
              <p className="text-lg font-medium">Başlamak için bir grafik resmi yükleyin</p>
              <p className="text-sm mt-2 opacity-60">JPG, PNG formatları desteklenir</p>
            </div>
          )}
          
          {/* Decorative background element */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-800 via-gray-800 to-gray-700 opacity-50 z-0"></div>
        </div>
        
        <div className="flex gap-4">
           <label className="flex-1 cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-600 text-center py-3 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group">
             <Upload size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
             <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
             Resim Seç
           </label>
           
           <button 
             onClick={handleAnalyze} 
             disabled={!image || loading}
             className={`flex-1 py-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2 
               ${!image || loading 
                 ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed' 
                 : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20'}`}
           >
             {loading ? <Loader2 className="animate-spin" /> : <Mic size={18} />}
             Analiz Et
           </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="md:w-1/2 bg-gray-800 rounded-xl border border-gray-700 flex flex-col shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
           <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
            <SparklesIcon />
            Yapay Zeka Analizi 
           </h3>
           
           {/* Audio Controls */}
           <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-gray-700">
             <button 
               onClick={playAudio} 
               disabled={!audioBufferRef.current || audioState === 'playing'}
               className={`p-2 rounded-md transition-colors ${audioState === 'playing' ? 'text-green-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
               title="Oynat"
             >
               <Play size={18} fill={audioState === 'playing' ? "currentColor" : "none"} />
             </button>
             
             <button 
               onClick={pauseAudio}
               disabled={audioState !== 'playing'} 
               className={`p-2 rounded-md transition-colors ${audioState === 'paused' ? 'text-yellow-500 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
               title="Duraklat"
             >
               <Pause size={18} fill={audioState === 'paused' ? "currentColor" : "none"} />
             </button>

             <button 
               onClick={stopAudio}
               disabled={audioState === 'stopped'}
               className="p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
               title="Durdur"
             >
               <Square size={18} fill="currentColor" />
             </button>
           </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
           {analysis ? (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-base">
                {analysis}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
               <Volume2 size={48} className="mb-4" />
               <p className="italic">Analiz sonuçları ve seslendirme burada görünecek...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default ImageAnalyzer;