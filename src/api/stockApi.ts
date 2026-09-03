import type { DailyStockPrice, SimulationResponse, UserWatchlist } from '../types/stock';

const BASE_URL = 'http://localhost:9100/api/v1';

const authHeader = 'Basic ' + btoa('admin:admin');

const commonHeaders = {
  'Content-Type': 'application/json',
  'Authorization': authHeader,
};

// 1. 시뮬레이션 다음 날짜 연산 요청 (GET + QueryParams 수정 완료)
export const fetchNextDaySimulation = async (
  stockCode: string,
  selectedIndicators: string[]
): Promise<SimulationResponse> => {
  const targetIndicatorsParam = selectedIndicators.join(',');
  const queryParams = new URLSearchParams({
    code: stockCode,
    selectedIndicators: targetIndicatorsParam
  });

  const response = await fetch(`${BASE_URL}/simulation?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
    },
  });

  if (!response.ok) throw new Error('시뮬레이션 데이터를 가져오는데 실패했습니다.');
  return response.json();
};

// 2. 실시간/REST 단일 캔들 수신 주입
export const sendRestCandle = async (candleData: Partial<DailyStockPrice>): Promise<DailyStockPrice> => {
  const response = await fetch(`${BASE_URL}/stock-data/candle`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify(candleData),
  });
  if (!response.ok) throw new Error('캔들 데이터 전송에 실패했습니다.');
  return response.json();
};

// 3. 사용자 감시 종목 목록 조회
export const fetchUserWatchlist = async (userId: string): Promise<UserWatchlist[]> => {
  const response = await fetch(`${BASE_URL}/watchlist/${userId}`, {
    headers: { 'Authorization': authHeader },
  });
  if (!response.ok) throw new Error('감시 종목 목록을 가져오는데 실패했습니다.');
  return response.json();
};

// 4. 감시 종목 추가
export const addWatchlistStock = async (watchlist: UserWatchlist): Promise<UserWatchlist> => {
  const response = await fetch(`${BASE_URL}/watchlist`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify(watchlist),
  });
  if (!response.ok) throw new Error('종목 추가에 실패했습니다.');
  return response.json();
};

// 5. 시뮬레이션 인덱스 초기화 요청 (추가)
export const resetSimulation = async (): Promise<void> => {
  const response = await fetch(`${BASE_URL}/simulation/reset`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
    },
  });
  if (!response.ok) throw new Error('시뮬레이션 초기화에 실패했습니다.');
};









// 구코드
// import type {DailyStockPrice, SimulationResponse, UserWatchlist } from '../types/stock';

// const BASE_URL = 'http://localhost:9100/api/v1';

// // 1. 시뮬레이션 다음 날짜 연산 요청
// export const fetchNextDaySimulation = async (
//   stockCode: string,
//   selectedIndicators: string[]
// ): Promise<SimulationResponse> => {
//   const response = await fetch(`${BASE_URL}/simulation/next`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ stockCode, selectedIndicators }),
//   });
//   if (!response.ok) throw new Error('시뮬레이션 데이터를 가져오는데 실패했습니다.');
//   return response.json();
// };

// // 2. 실시간/REST 단일 캔들 수신 주입
// export const sendRestCandle = async (candleData: Partial<DailyStockPrice>): Promise<DailyStockPrice> => {
//   const response = await fetch(`${BASE_URL}/stock-data/candle`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(candleData),
//   });
//   if (!response.ok) throw new Error('캔들 데이터 전송에 실패했습니다.');
//   return response.json();
// };

// // 3. 사용자 감시 종목 목록 조회
// export const fetchUserWatchlist = async (userId: string): Promise<UserWatchlist[]> => {
//   const response = await fetch(`${BASE_URL}/watchlist/${userId}`);
//   if (!response.ok) throw new Error('감시 종목 목록을 가져오는데 실패했습니다.');
//   return response.json();
// };

// // 4. 감시 종목 추가
// export const addWatchlistStock = async (watchlist: UserWatchlist): Promise<UserWatchlist> => {
//   const response = await fetch(`${BASE_URL}/watchlist`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(watchlist),
//   });
//   if (!response.ok) throw new Error('종목 추가에 실패했습니다.');
//   return response.json();
// };