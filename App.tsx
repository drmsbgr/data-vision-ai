import React, { useState } from 'react';
import { LayoutDashboard, FileText, Mic } from 'lucide-react';
import CsvDashboard from './components/CsvDashboard';
import ImageAnalyzer from './components/ImageAnalyzer';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VeriVizyon AI
            </h1>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
            Gemini Pro 3 & Flash 2.5 ile güçlendirilmiştir
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-gray-800 rounded-xl border border-gray-700 p-2 flex flex-row md:flex-col gap-1 sticky top-24">
            <button
              onClick={() => setActiveTab(AppTab.DASHBOARD)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === AppTab.DASHBOARD 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FileText size={18} />
              Veri Paneli
            </button>
            
            <button
              onClick={() => setActiveTab(AppTab.ANALYZER)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === AppTab.ANALYZER 
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Mic size={18} />
              Grafik Yorumlayıcı
            </button>
          </nav>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 text-xs text-gray-500 hidden md:block">
            <p className="mb-2 font-semibold text-gray-400">Özellikler:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>10+ Grafik Türü</li>
              <li>PNG İndirme</li>
              <li>Görsel Analiz</li>
              <li>Sesli Geri Bildirim</li>
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 h-[calc(100vh-140px)] min-h-[600px]">
          {activeTab === AppTab.DASHBOARD && <CsvDashboard />}
          {activeTab === AppTab.ANALYZER && <ImageAnalyzer />}
        </div>

      </main>
    </div>
  );
};

export default App;