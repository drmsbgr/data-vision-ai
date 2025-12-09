import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedImage(null);
    try {
      const imgData = await generateImage(prompt, size);
      setGeneratedImage(imgData);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 h-full">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-gray-400">Image Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with flying cars in a neon noir style..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none h-24"
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 font-semibold">Resolution:</span>
              <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      size === s ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt || loading}
              className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95 ${
                !prompt || loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500 shadow-lg shadow-purple-500/20'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Generate Image
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center p-4 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-pink-400">
            <Loader2 className="animate-spin mb-2" size={48} />
            <p className="animate-pulse">Creating your masterpiece...</p>
          </div>
        )}
        
        {generatedImage ? (
          <div className="relative group max-h-full">
            <img 
              src={generatedImage} 
              alt="Generated Result" 
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" 
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={generatedImage} 
                download={`ai-gen-${Date.now()}.png`}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-md"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 flex flex-col items-center">
            <ImageIcon size={64} className="mb-4 opacity-30" />
            <p>Your generated image will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
