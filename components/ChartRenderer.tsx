import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, ComposedChart, FunnelChart, Funnel,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ChartType, DataPoint } from '../types';

interface ChartRendererProps {
  data: DataPoint[];
  type: ChartType;
  xAxisKey: string;
  yAxisKey: string;
  zAxisKey?: string;
  onRef: (ref: HTMLDivElement | null) => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartRenderer: React.FC<ChartRendererProps> = ({ data, type, xAxisKey, yAxisKey, zAxisKey, onRef }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Yetersiz veri</div>;
  }

  // Common props for standard charts
  const commonAxisProps = {
    stroke: "#9ca3af",
    fontSize: 12,
    tickLine: false,
    axisLine: { stroke: '#4b5563' }
  };

  const renderChart = () => {
    switch (type) {
      case ChartType.LINE:
        return (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} 
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            {zAxisKey && <Line type="monotone" dataKey={zAxisKey} stroke="#82ca9d" strokeWidth={3} />}
          </LineChart>
        );
      case ChartType.BAR:
        return (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey={yAxisKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
            {zAxisKey && <Bar dataKey={zAxisKey} fill="#82ca9d" radius={[4, 4, 0, 0]} />}
          </BarChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area type="monotone" dataKey={yAxisKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            {zAxisKey && <Area type="monotone" dataKey={zAxisKey} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />}
          </AreaChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                return `${(percent * 100).toFixed(0)}%`;
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend />
          </PieChart>
        );
      case ChartType.DONUT:
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend />
          </PieChart>
        );
      case ChartType.SCATTER:
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="category" dataKey={xAxisKey} name={xAxisKey} {...commonAxisProps} />
            <YAxis type="number" dataKey={yAxisKey} name={yAxisKey} {...commonAxisProps} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Scatter name={yAxisKey} data={data} fill="#8884d8" />
          </ScatterChart>
        );
      case ChartType.RADAR:
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#9ca3af" />
            <Radar name={yAxisKey} dataKey={yAxisKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            {zAxisKey && <Radar name={zAxisKey} dataKey={zAxisKey} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />}
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </RadarChart>
        );
      case ChartType.RADIAL_BAR:
        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={20} data={data}>
            <RadialBar
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              dataKey={yAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </RadialBar>
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
          </RadialBarChart>
        );
      case ChartType.COMPOSED:
        return (
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area type="monotone" dataKey={yAxisKey} fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
            <Bar dataKey={yAxisKey} barSize={20} fill="#413ea0" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey={yAxisKey} stroke="#ff7300" strokeWidth={2} />
          </ComposedChart>
        );
      case ChartType.FUNNEL:
        return (
          <FunnelChart>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
            <Funnel
              dataKey={yAxisKey}
              data={data}
              isAnimationActive
            >
               {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Funnel>
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </FunnelChart>
        );
      default:
        return <div>Lütfen bir grafik türü seçin</div>;
    }
  };

  return (
    <div className="w-full h-full" ref={onRef}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;