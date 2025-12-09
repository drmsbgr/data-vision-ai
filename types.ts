export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  ANALYZER = 'ANALYZER'
}

export enum ChartType {
  LINE = 'Çizgi Grafiği',
  BAR = 'Sütun Grafiği',
  AREA = 'Alan Grafiği',
  SCATTER = 'Dağılım Grafiği',
  PIE = 'Pasta Grafiği',
  DONUT = 'Halka Grafiği',
  RADAR = 'Radar Grafiği',
  RADIAL_BAR = 'Radyal Çubuk',
  COMPOSED = 'Birleşik Grafik',
  FUNNEL = 'Huni Grafiği'
}

export interface DataPoint {
  [key: string]: string | number;
}

export interface AudioConfig {
  sampleRate: number;
  numChannels: number;
}