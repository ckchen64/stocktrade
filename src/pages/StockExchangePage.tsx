import React, { useCallback, useState } from 'react';
import ChartWorkspace from '../features/chart/ChartWorkspace';
import type { CandleData } from '../features/chart/types';
import { useWebSocket } from '../features/chart/useWebSocket';
import SimulationConsole from '../features/simulation/SimulationConsole';
import OrderPanel from '../features/simulation/OrderPanel';
import AssetDashboard from '../features/dashboard/AssetDashboard';
import TradeTimeline from '../features/dashboard/TradeTimeline';

const DEFAULT_CALCULATION_INDICATORS = [
  'SMA',
  'MACD',
  'OBV',
  'RSI',
  'MFI',
  'SIGMA',
  'ADX',
  'CCI',
  'EOM',
];

export const StockExchangePage: React.FC = () => {
  const [selectedStock] = useState<string>('005930');
  const [tradeHistory] = useState<any[]>([]);

  const [calculationIndicators, setCalculationIndicators] = useState<string[]>(
    DEFAULT_CALCULATION_INDICATORS
  );

  const [chartData, setChartData] = useState<CandleData[]>([]);

  const processAndAddCandle = useCallback(
    (newCandleFromServer: CandleData & { status?: string }) => {
      if (newCandleFromServer.status === 'END') {
        alert('시뮬레이션 데이터가 소모되어 종료되었습니다.');
        return;
      }

      const safeCandle: CandleData = {
        ...newCandleFromServer,
        eom:
          typeof newCandleFromServer.eom === 'number' &&
          Number.isFinite(newCandleFromServer.eom)
            ? newCandleFromServer.eom
            : 0,
      };

      setChartData((prev) => [...prev, safeCandle]);
    },
    []
  );

  const { isConnected } = useWebSocket({
    stockCode: selectedStock,
    onCandleReceived: processAndAddCandle,
  });

  const handleSimulationAdvance = (
    newCandleFromServer: CandleData & { status?: string }
  ) => {
    processAndAddCandle(newCandleFromServer);
  };

  const handleOrderSuccess = () => {
    console.log('주문 성공! 타임라인 및 자산 현황 갱신');
  };

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1>📈 주식 거래 및 지표 분석</h1>

        <span
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: isConnected ? '#e6f4ea' : '#fce8e6',
            color: isConnected ? '#137333' : '#c5221f',
          }}
        >
          {isConnected ? '🟢 실시간 웹소켓 연결됨' : '🔴 웹소켓 연결 끊김'}
        </span>
      </div>

      <AssetDashboard />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 1.5fr',
          gap: '20px',
        }}
      >
        <div>
          <ChartWorkspace
            chartDataList={chartData}
            visibleCount={29}
          />
        </div>

        <SimulationConsole
          selectedIndicators={calculationIndicators}
          setSelectedIndicators={setCalculationIndicators}
          onSimulationAdvance={handleSimulationAdvance}
          onNextDay={() => {}}
          reportText=""
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}
      >
        <OrderPanel onOrderSuccess={handleOrderSuccess} />
        <TradeTimeline historyList={tradeHistory} />
      </div>
    </div>
  );
};

export default StockExchangePage;










//구코드
// import React, { useCallback, useState } from 'react';
// import PriceChart from '../features/chart/PriceChart';
// import type { CandleData } from '../features/chart/types';
// import { useWebSocket } from '../features/chart/useWebSocket';
// import SimulationConsole from '../features/simulation/SimulationConsole';
// import OrderPanel from '../features/simulation/OrderPanel';
// import AssetDashboard from '../features/dashboard/AssetDashboard';
// import TradeTimeline from '../features/dashboard/TradeTimeline';

// const DEFAULT_CALCULATION_INDICATORS = [
//   'SMA',
//   'MACD',
//   'OBV',
//   'RSI',
//   'MFI',
//   'SIGMA',
//   'ADX',
//   'CCI',
//   'EOM',
// ];

// export const StockExchangePage: React.FC = () => {
//   const [selectedStock] = useState<string>('005930');
//   const [tradeHistory] = useState<any[]>([]);

//   // 백엔드 계산 대상으로 사용할 지표
//   const [calculationIndicators, setCalculationIndicators] = useState<string[]>(
//     DEFAULT_CALCULATION_INDICATORS
//   );

//   const [chartData, setChartData] = useState<CandleData[]>([]);

//   const processAndAddCandle = useCallback(
//     (newCandleFromServer: CandleData & { status?: string }) => {
//       if (newCandleFromServer.status === 'END') {
//         alert('시뮬레이션 데이터가 소모되어 종료되었습니다.');
//         return;
//       }

//       const safeCandle: CandleData = {
//         ...newCandleFromServer,
//         eom:
//           typeof newCandleFromServer.eom === 'number' &&
//           Number.isFinite(newCandleFromServer.eom)
//             ? newCandleFromServer.eom
//             : 0,
//       };

//       setChartData((prev) => [...prev, safeCandle]);
//     },
//     []
//   );

//   const { isConnected } = useWebSocket({
//     stockCode: selectedStock,
//     onCandleReceived: processAndAddCandle,
//   });

//   const handleSimulationAdvance = (
//     newCandleFromServer: CandleData & { status?: string }
//   ) => {
//     processAndAddCandle(newCandleFromServer);
//   };

//   const handleOrderSuccess = () => {
//     console.log('주문 성공! 타임라인 및 자산 현황 갱신');
//   };

//   return (
//     <div
//       style={{
//         padding: '20px',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '20px',
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//         }}
//       >
//         <h1>📈 주식 거래 및 지표 분석</h1>

//         <span
//           style={{
//             padding: '6px 12px',
//             borderRadius: '20px',
//             fontSize: '12px',
//             fontWeight: 'bold',
//             backgroundColor: isConnected ? '#e6f4ea' : '#fce8e6',
//             color: isConnected ? '#137333' : '#c5221f',
//           }}
//         >
//           {isConnected ? '🟢 실시간 웹소켓 연결됨' : '🔴 웹소켓 연결 끊김'}
//         </span>
//       </div>

//       <AssetDashboard />

//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '3fr 1.5fr',
//           gap: '20px',
//         }}
//       >
//         <div>
//           <PriceChart
//             chartDataList={chartData}
//             visibleCount={29}
//           />
//         </div>

//         <SimulationConsole
//           selectedIndicators={calculationIndicators}
//           setSelectedIndicators={setCalculationIndicators}
//           onSimulationAdvance={handleSimulationAdvance}
//           onNextDay={() => {}}
//           reportText=""
//         />
//       </div>

//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: '20px',
//         }}
//       >
//         <OrderPanel onOrderSuccess={handleOrderSuccess} />
//         <TradeTimeline historyList={tradeHistory} />
//       </div>
//     </div>
//   );
// };

// export default StockExchangePage;