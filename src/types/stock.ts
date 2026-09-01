// 백엔드 daily_stock_price 엔티티 및 DTO 대응 타입
export interface DailyStockPrice {
  id?: number;
  stockCode: string;
  stockName: string;
  tradeDate: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;

  // 보조지표 연산 결과
  sma05?: number;
  sma20?: number;
  sma60?: number;
  rsi?: number;
  mfi?: number;
  obv?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  sigma?: number;
  adx?: number;
  diPlus?: number;
  diMinus?: number;
  cci?: number;
  cciSignal?: number;
  eom?: number;
}

// 시뮬레이션 응답 DTO (runNextDaySimulation 반환값)
export interface SimulationResponse {
  status: 'SUCCESS' | 'END';
  message?: string;
  reportText?: string;
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  [key: string]: any; // 동적 보조지표 필드 수용 (sma05, rsi, macd 등)
}

// 사용자 감시 종목 타입
export interface UserWatchlist {
  id?: number;
  userId: String;
  stockCode: string;
  stockName: string;
  isRealtimeActive: boolean;
}