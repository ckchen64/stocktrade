export interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma05?: number;
  sma20?: number;
  sma60?: number;
  macd?: number;
  macdSignal?: number;
  rsi?: number;
  obv?: number;
  mfi?: number;
  sigma?: number;
  adx?: number;
  diPlus?: number;
  diMinus?: number;
  cci?: number;
  cciSignal?: number;
  eom?: number;
}

export interface ChartProps {
  chartDataList: CandleData[];
}