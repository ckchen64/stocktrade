// =============================================================
// 백엔드 DailyStockPrice 엔티티 대응 타입
// =============================================================
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

  // =========================================================
  // 이동평균
  // =========================================================
  sma05?: number;
  sma20?: number;
  sma60?: number;

  // =========================================================
  // RSI
  // =========================================================
  rsi?: number;

  // =========================================================
  // MFI
  // =========================================================
  mfi?: number;
  mfiSignal?: number;

  // =========================================================
  // OBV
  // =========================================================
  obv?: number;

  // =========================================================
  // MACD
  // =========================================================
  macd?: number;
  macdSignal?: number;
  macdHist?: number;

  // =========================================================
  // SIGMA
  // =========================================================
  sigma?: number;
  sigmaSignal?: number;

  // =========================================================
  // ADX / DMI
  // =========================================================
  adx?: number;
  diPlus?: number;
  diMinus?: number;

  // =========================================================
  // CCI
  // =========================================================
  cci?: number;
  cciSignal?: number;

  // =========================================================
  // EOM
  // =========================================================
  eom?: number;
}


// =============================================================
// 시뮬레이션 응답 DTO
// =============================================================
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

  sma05?: number;
  sma20?: number;
  sma60?: number;

  rsi?: number;

  mfi?: number;
  mfiSignal?: number;

  obv?: number;

  macd?: number;
  macdSignal?: number;
  macdHist?: number;

  sigma?: number;
  sigmaSignal?: number;

  adx?: number;
  diPlus?: number;
  diMinus?: number;

  cci?: number;
  cciSignal?: number;

  eom?: number;

  [key: string]: any;
}


// =============================================================
// 사용자 감시 종목
// =============================================================
export interface UserWatchlist {

  id?: number;

  userId: string;

  stockCode: string;
  stockName: string;

  isRealtimeActive: boolean;
}