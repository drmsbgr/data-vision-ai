import React, { useState, useRef, useEffect } from 'react';
import { dsvFormat } from 'd3-dsv';
import { Download, Upload, BarChart2, Settings, FileSpreadsheet, Trash2, RefreshCw } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import { ChartType, DataPoint } from '../types';

const SAMPLE_DATA: DataPoint[] = [
  { Ay: 'Ocak', Satışlar: 4000, Kar: 2400 },
  { Ay: 'Şubat', Satışlar: 3000, Kar: 1398 },
  { Ay: 'Mart', Satışlar: 2000, Kar: 9800 },
  { Ay: 'Nisan', Satışlar: 2780, Kar: 3908 },
  { Ay: 'Mayıs', Satışlar: 1890, Kar: 4800 },
  { Ay: 'Haziran', Satışlar: 2390, Kar: 3800 },
];

const SAMPLE_HEADERS = ['Ay', 'Satışlar', 'Kar'];

const SEPARATORS = [
  { label: 'Virgül (,)', value: ',' },
  { label: 'Noktalı Virgül (;)', value: ';' },
  { label: 'Tab (\\t)', value: '\t' },
  { label: 'Dikey Çizgi (|)', value: '|' },
];

const CsvDashboard: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>(SAMPLE_DATA);
  const [headers, setHeaders] = useState<string[]>(SAMPLE_HEADERS);
  const [separator, setSeparator] = useState<string>(',');
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawFileContent, setRawFileContent] = useState<string | null>(null);
  
  // Chart Configuration
  const [selectedChart, setSelectedChart] = useState<ChartType>(ChartType.BAR);
  const [xAxisKey, setXAxisKey] = useState<string>(SAMPLE_HEADERS[0]);
  const [yAxisKey, setYAxisKey] = useState<string>(SAMPLE_HEADERS[1]);
  const [zAxisKey, setZAxisKey] = useState<string>(SAMPLE_HEADERS[2] || SAMPLE_HEADERS[1]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Helper function to process CSV text
  const processCsvData = (text: string, sep: string) => {
    try {
      const psv = dsvFormat(sep);
      const parsedData = psv.parse(text);
      
      if (parsedData.length > 0) {
        const columns = parsedData.columns;
        setHeaders(columns);
        
        // Convert numeric strings to numbers
        const cleanedData = parsedData.map(d => {
          const newObj: any = {};
          columns.forEach(col => {
             const val = d[col];
             // Try parsing as float, if NaN keep original string
             const num = parseFloat(val || '');
             newObj[col] = isNaN(num) ? val : num;
          });
          return newObj;
        });
        
        setData(cleanedData);

        // Default selections
        if (columns.length >= 2) {
          setXAxisKey(columns[0]);
          setYAxisKey(columns[1]);
          setZAxisKey(columns[2] || columns[1]);
        } else if (columns.length === 1) {
           setXAxisKey(columns[0]);
           setYAxisKey(columns[0]);
        }
        
        // Auto-select chart type
        if (columns.length > 2) {
          setSelectedChart(ChartType.BAR);
        } else {
          setSelectedChart(ChartType.PIE);
        }
      } else {
        alert("CSV dosyası boş veya okunamadı.");
      }
    } catch (error) {
      console.error("CSV işleme hatası", error);
    }
  };

  // Re-process data when separator changes if we have a file loaded
  useEffect(() => {
    if (rawFileContent) {
      processCsvData(rawFileContent, separator);
    }
  }, [separator]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setRawFileContent(text);
        processCsvData(text, separator);
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleClearFile = () => {
    setData(SAMPLE_DATA);
    setHeaders(SAMPLE_HEADERS);
    setFileName(null);
    setRawFileContent(null);
    setXAxisKey(SAMPLE_HEADERS[0]);
    setYAxisKey(SAMPLE_HEADERS[1]);
    setZAxisKey(SAMPLE_HEADERS[2]);
    setSelectedChart(ChartType.BAR);
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const originalSvg = chartRef.current.querySelector('svg');
      if (!originalSvg) {
        console.error("SVG element not found");
        return;
      }

      // 1. O anki kesin boyutları al (getBoundingClientRect piksel değeri döner)
      const rect = originalSvg.getBoundingClientRect();
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);

      // 2. SVG'yi Klonla
      const clonedSvg = originalSvg.cloneNode(true) as SVGElement;
      
      // 3. KRİTİK DÜZELTME: Boyutları piksel olarak sabitle
      // Recharts genelde width="100%" kullanır, bu canvas'a aktarılırken kaybolur.
      // Burada width="800" gibi net değerler veriyoruz.
      clonedSvg.setAttribute('width', width.toString());
      clonedSvg.setAttribute('height', height.toString());
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // CSS ile de garantiye al
      clonedSvg.style.width = `${width}px`;
      clonedSvg.style.height = `${height}px`;

      // Namespace ekle
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // 4. Stil İyileştirmeleri (Karanlık moddan dışa aktarım için)
      // Metinleri görünür yap
      clonedSvg.querySelectorAll('text').forEach((text) => {
        (text as SVGElement).style.fill = '#e5e7eb'; // Açık gri
        (text as SVGElement).style.fontFamily = 'sans-serif';
        (text as SVGElement).style.fontSize = '12px';
      });
      
      // Çizgileri görünür yap
      clonedSvg.querySelectorAll('path, line').forEach((el) => {
          const classStr = el.getAttribute('class') || '';
          if (classStr.includes('recharts-cartesian-grid')) {
              (el as SVGElement).style.stroke = '#374151'; 
              (el as SVGElement).style.fill = 'none';
          } else if (classStr.includes('recharts-cartesian-axis-line') || classStr.includes('recharts-reference-line')) {
              (el as SVGElement).style.stroke = '#9ca3af'; 
              (el as SVGElement).style.fill = 'none';
          }
      });

      // 5. Blob oluştur (Base64 yerine Blob URL daha güvenilirdir)
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          // Arka planı boya (Transparan yerine koyu gri)
          ctx.fillStyle = '#1f2937'; 
          ctx.fillRect(0, 0, width, height);
          
          // Resmi çiz
          ctx.drawImage(img, 0, 0, width, height);
          
          // İndir
          try {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `analiz-grafigi-${Date.now()}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          } catch (e) {
            console.error("Canvas export failed", e);
            alert("Resim oluşturulamadı. Lütfen tekrar deneyin.");
          }
          
          // Belleği temizle
          URL.revokeObjectURL(url);
        }
      };
      
      img.onerror = (e) => {
        console.error("Image load failed", e);
        alert("Grafik işlenirken hata oluştu.");
      };
      
      img.src = url;
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Settings & Controls Panel */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm space-y-4">
        
        {/* Top Row: Upload & Separator */}
        <div className="flex flex-wrap items-end gap-4 border-b border-gray-700 pb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">
              1. Veri Kaynağı
            </label>
            <div className="flex gap-2 items-center">
              {fileName ? (
                <div className="flex-1 flex items-center justify-between bg-gray-700 px-4 py-2.5 rounded-lg border border-gray-600">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileSpreadsheet className="text-green-400 flex-shrink-0" size={18} />
                    <span className="text-sm font-medium text-white truncate max-w-[150px]">{fileName}</span>
                  </div>
                  <button 
                    onClick={handleClearFile}
                    className="ml-2 p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-md transition-colors"
                    title="Dosyayı Kaldır"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm text-white">
                  <Upload size={16} />
                  <span>CSV Yükle</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="min-w-[150px]">
             <label className="block text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1">
               CSV Ayırıcı
               {fileName && (
                 <span title="Otomatik güncellenir">
                   <RefreshCw size={10} className="text-blue-400 animate-pulse ml-1" />
                 </span>
               )}
             </label>
             <select 
               value={separator}
               onChange={(e) => setSeparator(e.target.value)}
               className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
             >
               {SEPARATORS.map(sep => (
                 <option key={sep.value} value={sep.value}>{sep.label}</option>
               ))}
             </select>
          </div>
          
          <div className="ml-auto">
             {data.length > 0 && (
              <button 
                onClick={downloadChart}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm text-white"
              >
                <Download size={16} />
                <span>PNG İndir</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Chart Configuration */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Grafik Türü</label>
                <select 
                  value={selectedChart} 
                  onChange={(e) => setSelectedChart(e.target.value as ChartType)}
                  className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-lg border-none focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {Object.values(ChartType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
             </div>
             
             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">X Ekseni (Kategori)</label>
                <select 
                  value={xAxisKey} 
                  onChange={(e) => setXAxisKey(e.target.value)}
                  className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-lg border-none focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
             </div>

             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Y Ekseni (Değer)</label>
                <select 
                  value={yAxisKey} 
                  onChange={(e) => setYAxisKey(e.target.value)}
                  className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-lg border-none focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
             </div>

             <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">İkincil / Gruplama (Opsiyonel)</label>
                <select 
                  value={zAxisKey} 
                  onChange={(e) => setZAxisKey(e.target.value)}
                  className="w-full bg-gray-700 text-white text-sm p-2.5 rounded-lg border-none focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
             </div>
          </div>
        )}
      </div>

      {/* Visualization Area */}
      <div className="flex-1 min-h-0 bg-gray-900 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden relative p-2">
        {data.length > 0 ? (
          <ChartRenderer 
            data={data} 
            type={selectedChart} 
            xAxisKey={xAxisKey}
            yAxisKey={yAxisKey}
            zAxisKey={zAxisKey !== yAxisKey ? zAxisKey : undefined}
            onRef={(ref) => (chartRef.current = ref)}
          />
        ) : (
          <div className="text-center text-gray-500 flex flex-col items-center">
            <BarChart2 size={64} className="mb-4 opacity-20" />
            <p className="text-xl font-semibold mb-2">Veri Bulunamadı</p>
            <p className="text-sm max-w-xs">Başlamak için yukarıdaki panelden bir CSV dosyası yükleyin ve ayırıcıyı seçin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvDashboard;