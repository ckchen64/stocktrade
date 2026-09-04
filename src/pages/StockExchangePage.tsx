import React, { useState, useCallback } from 'react';
import CandleStickChart from '../features/chart/CandleStickChart';
import type { CandleData } from '../features/chart/types';
import { useWebSocket } from '../features/chart/useWebSocket'; // 🎯 1. 웹소켓 커스텀 훅 추가
import SimulationConsole from '../features/simulation/SimulationConsole';
import OrderPanel from '../features/simulation/OrderPanel';
import AssetDashboard from '../features/dashboard/AssetDashboard';
import TradeTimeline from '../features/dashboard/TradeTimeline';

export const StockExchangePage: React.FC = () => {
  const [selectedStock] = useState<string>('005930'); // 🎯 선택 종목 코드
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'SMA', 'MACD', 'OBV', 'RSI', 'MFI', 'SIGMA', 'ADX', 'CCI', 'EOM'
  ]);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  // 🎯 2. 실시간 캔들 수신 시 공통 처리 (EOM 안전 보정 로직 유지)
  const processAndAddCandle = useCallback((newCandleFromServer: CandleData & { status?: string }) => {
    if (newCandleFromServer.status === 'END') {
      alert('시뮬레이션 데이터가 소모되어 종료되었습니다.');
      return;
    }

    // EOM 수치 안전 보정 적용 후 배열에 추가
    const safeCandle = {
      ...newCandleFromServer,
      eom: typeof (newCandleFromServer as any).eom === 'number' && !isNaN((newCandleFromServer as any).eom) 
        ? (newCandleFromServer as any).eom 
        : 0
    };

    setChartData((prev) => [...prev, safeCandle]);
  }, []);

  // 🎯 3. 웹소켓 연결 훅 적용 (실시간 데이터 수신 시 processAndAddCandle 호출)
  const { isConnected } = useWebSocket({
    stockCode: selectedStock,
    onCandleReceived: processAndAddCandle,
  });

  // 콘솔 진행 버튼(HTTP/수동 진행) 클릭 핸들러
  const handleSimulationAdvance = (newCandleFromServer: CandleData & { status?: string }) => {
    processAndAddCandle(newCandleFromServer);
  };

  // 🔄 주문 성공 시 실행될 리프레시 로직
  const handleOrderSuccess = () => {
    console.log("주문 성공! 타임라인 및 자산 현황 갱신");
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 🎯 4. 상단 헤더에 실시간 웹소켓 연결 상태 전광판 추가 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>📈 주식 거래 및 지표 분석</h1>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          backgroundColor: isConnected ? '#e6f4ea' : '#fce8e6',
          color: isConnected ? '#137333' : '#c5221f'
        }}>
          {isConnected ? '🟢 실시간 웹소켓 연결됨' : '🔴 웹소켓 연결 끊김'}
        </span>
      </div>
      
      <AssetDashboard />

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '20px' }}>
        {/* selectedIndicators prop 연결 유지 */}
        <CandleStickChart 
          chartDataList={chartData} 
          selectedIndicators={selectedIndicators} 
        />
        
        <SimulationConsole 
          selectedIndicators={selectedIndicators}
          setSelectedIndicators={setSelectedIndicators}
          onSimulationAdvance={handleSimulationAdvance}
          onNextDay={() => {}} 
          reportText=""
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <OrderPanel onOrderSuccess={handleOrderSuccess} />
        <TradeTimeline historyList={tradeHistory} />
      </div>
    </div>
  );
};

export default StockExchangePage;









//구코드(WebSocket 미적용)
// import React, { useState } from 'react';
// import CandleStickChart from '../features/chart/CandleStickChart';
// import type { CandleData } from '../features/chart/types';
// import SimulationConsole from '../features/simulation/SimulationConsole';
// import OrderPanel from '../features/simulation/OrderPanel';
// import AssetDashboard from '../features/dashboard/AssetDashboard';
// import TradeTimeline from '../features/dashboard/TradeTimeline';

// export const StockExchangePage: React.FC = () => {
//   const [tradeHistory, setTradeHistory] = useState<any[]>([]);
//   const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
//     'SMA', 'MACD', 'OBV', 'RSI', 'MFI', 'SIGMA', 'ADX', 'CCI', 'EOM'
//   ]);
//   const [chartData, setChartData] = useState<CandleData[]>([]);

//   const handleSimulationAdvance = (newCandleFromServer: CandleData & { status?: string }) => {
//     if (newCandleFromServer.status === 'END') {
//       alert('시뮬레이션 데이터가 소모되어 종료되었습니다.');
//       return;
//     }

//     // 🎯 EOM 수치 안전 보정 적용 후 배열에 추가
//     const safeCandle = {
//       ...newCandleFromServer,
//       eom: typeof (newCandleFromServer as any).eom === 'number' && !isNaN((newCandleFromServer as any).eom) 
//         ? (newCandleFromServer as any).eom 
//         : 0
//     };

//     setChartData((prev) => [...prev, safeCandle]);
//   };

//   // 🔄 주문 성공 시 실행될 리프레시 로직
//   const handleOrderSuccess = () => {
//     console.log("주문 성공! 타임라인 및 자산 현황 갱신");
//   };

//   return (
//     <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//       <h1>📈 주식 거래 및 지표 분석 시뮬레이터</h1>
      
//       <AssetDashboard />

//       <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '20px' }}>
//         {/* 🎯 selectedIndicators prop 연결 완료 */}
//         <CandleStickChart 
//           chartDataList={chartData} 
//           selectedIndicators={selectedIndicators} 
//         />
        
//         <SimulationConsole 
//           selectedIndicators={selectedIndicators}
//           setSelectedIndicators={setSelectedIndicators}
//           onSimulationAdvance={handleSimulationAdvance}
//           onNextDay={() => {}} 
//           reportText=""
//         />
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//         <OrderPanel onOrderSuccess={handleOrderSuccess} />
//         <TradeTimeline historyList={tradeHistory} />
//       </div>
//     </div>
//   );
// };

// export default StockExchangePage;








//구 코드
// import React, { useState } from 'react';
// import CandleStickChart from '../features/chart/CandleStickChart';
// import IndicatorConfig from '../features/chart/IndicatorConfig';
// import SimulationConsole from '../features/simulation/SimulationConsole';
// import OrderPanel from '../features/simulation/OrderPanel';
// import AssetDashboard from '../features/dashboard/AssetDashboard';
// import TradeTimeline from '../features/dashboard/TradeTimeline';
// import { fetchNextDaySimulation } from '../api/stockApi';
// import type { SimulationResponse } from '../types/stock';

// export const StockExchangePage: React.FC = () => {
//   const [selectedStock, setSelectedStock] = useState<string>('005930');
//   const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
//     'SMA', 'MACD', 'RSI', 'MFI', 'OBV', 'SIGMA', 'ADX', 'CCI','EOM'
//   ]);
//   const [chartData, setChartData] = useState<SimulationResponse[]>([]);
//   const [reportText, setReportText] = useState<string>('');

//   // 시뮬레이션 '다음 날' 버튼 클릭 이벤트 핸들러
//   const handleNextDay = async () => {
//     try {
//       const data = await fetchNextDaySimulation(selectedStock, selectedIndicators);
//       if (data.status === 'SUCCESS') {
//         setChartData((prev) => [...prev, data]);
//         if (data.reportText) setReportText(data.reportText);
//       } else {
//         alert(data.message || '시뮬레이션이 종료되었습니다.');
//       }
//     } catch (error) {
//       console.error('시뮬레이션 데이터 수신 에러:', error);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
//       <h1>📈 주식 거래 및 지표 분석 시뮬레이터</h1>
      
//       {/* 상단: 자산 현황 & 시뮬레이션 콘솔 */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//         <AssetDashboard />
//         <SimulationConsole onNextDay={handleNextDay} reportText={reportText} />
//       </div>

//       {/* 중단: 차트 & 지표 설정 */}
//       <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
//         <CandleStickChart data={chartData} />
//         <IndicatorConfig 
//           selectedIndicators={selectedIndicators} 
//           setSelectedIndicators={setSelectedIndicators} 
//         />
//       </div>

//       {/* 하단: 주문 패널 & 거래 내역 */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//         <OrderPanel stockCode={selectedStock} />
//         <TradeTimeline />
//       </div>
//     </div>
//   );
// };

// export default StockExchangePage;