import React, { useState } from 'react';
import CandleStickChart from '../features/chart/CandleStickChart';
import type { CandleData } from '../features/chart/types';
import SimulationConsole from '../features/simulation/SimulationConsole';
import OrderPanel from '../features/simulation/OrderPanel';
import AssetDashboard from '../features/dashboard/AssetDashboard';
import TradeTimeline from '../features/dashboard/TradeTimeline';

export const StockExchangePage: React.FC = () => {
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'SMA', 'MACD', 'OBV', 'RSI', 'MFI', 'SIGMA', 'ADX', 'CCI', 'EOM'
  ]);
  const [chartData, setChartData] = useState<CandleData[]>([]);

  const handleSimulationAdvance = (newCandleFromServer: CandleData & { status?: string }) => {
    if (newCandleFromServer.status === 'END') {
      alert('시뮬레이션 데이터가 소모되어 종료되었습니다.');
      return;
    }

    // 🎯 EOM 수치 안전 보정 적용 후 배열에 추가
    const safeCandle = {
      ...newCandleFromServer,
      eom: typeof (newCandleFromServer as any).eom === 'number' && !isNaN((newCandleFromServer as any).eom) 
        ? (newCandleFromServer as any).eom 
        : 0
    };

    setChartData((prev) => [...prev, safeCandle]);
  };

  // 🔄 주문 성공 시 실행될 리프레시 로직
  const handleOrderSuccess = () => {
    console.log("주문 성공! 타임라인 및 자산 현황 갱신");
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1>📈 주식 거래 및 지표 분석 시뮬레이터</h1>
      
      <AssetDashboard />

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr', gap: '20px' }}>
        {/* 🎯 selectedIndicators prop 연결 완료 */}
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








//구코드
// import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // 백엔드 서버 통신용 도구 [INDEX]

// // 📦 분리 쪼개기 완료한 자식 부품(화면)들을 소환합니다.
// import SimulationConsole from '../features/simulation/SimulationConsole';
// import OrderPanel from '../features/simulation/OrderPanel';
// import TradeTimeline from '../features/dashboard/TradeTimeline';
// import AssetDashboard from '../features/dashboard/AssetDashboard'; // 👈 이 코드를 꼭 넣어주세요!
// import CandleStickChart, { type CandleData } from '../features/chart/CandleStickChart'; // 차트 부품 소환
// import IndicatorConfig from '../features/chart/IndicatorConfig'; // 🎯 [추가]: 보조지표 설정 컴포넌트 소환!


// interface TradeHistoryItem {
//     // 역할: 백엔드 서버(API)에서 매매 이력 전체 데이터를 통째로 받아오는 주체입니다.
//     // 필요성: 서버에서 온 데이터(response.data)가 어떤 형태(id가 있는지, price가 숫자인지 등)인지 
//     // 컴퓨터에게 명확히 알려주어야 오류 없이 변수에 저장할 수 있습니다
//     // export interface TradeHistoryItem { // 👈 앞에 export를 붙이면 TradeTimeline.tsx에서 import하여 사용 가능
//     id: number;
//     tradeDate: string;
//     tradeType: string;
//     price: number;
//     quantity: number;
//     totalAmount: number;
// }

// export default function StockExchange(): React.JSX.Element {
//     // React.JSX.Element는 리액트(React)에서 "이 함수는 화면에 그려질 HTML 뼈대(JSX 요소)를 반환하는 컴포넌트다"라는 뜻
//     // (GUI-SPLIT-M1-1) 부모 관제탑에서 영수증 목록 상자를 대장주로 관리합니다. 

//     // 1. 상태 변수 주머니들
//     const [simReport, setSimReport] = useState<string>("");
//     //const [resultMessage, setResultMessage] = useState<string>("");

//     // 2.서버에서 받아온 누적 매매 내역 리스트를 보관할 상자.
//     const [historyList, setHistoryList] = useState<any[]>([]);
//     const [dashboardData, setDashboardData] = useState<any>(null);

//     // 3.컴포넌트 내부 State 구역에 누적 차트 상자 개설
//     const [chartDataList, setChartDataList] = useState<CandleData[]>([]);

//     // 4. StockExchange.tsx 상단 선언부에 추가
//     const [selectedIndicators, setSelectedIndicators] = useState<string[]>(["RSI", "MFI"]); // 기본값으로 켜놓을 지표 설정

//     // 5 [추가]: 설정 패널의 열림/닫힘 상태를 관리하는 토글 스위치
//     const [showConfig, setShowConfig] = useState<boolean>(false);

//     // ① 실시간 자산 전광판 데이터 수집
//     const fetchDashboard = (): void => {
//         axios.get('http://localhost:9100/api/dashboard')
//             .then((response) => { setDashboardData(response.data); })
//             .catch((error) => { console.error("자산 대시보드 로드 실패:", error); });
//     }; // 👈 fetchDashboard 함수의 마감 중괄호!

//     // 📋 ② 매매 이력 타임라인 리프레시
//     const fetchHistoryTimeline = (): void => {
//         axios.get<TradeHistoryItem[]>('http://localhost:9100/api/history')
//             .then((response) => { setHistoryList(response.data); })
//             .catch((error) => { console.error("이력 로드 실패:", error); });
//     };

//     // 🚀 ③ 화면이 처음 켜질 때 기초 데이터 세팅
//     useEffect(() => {
//         fetchDashboard();
//         fetchHistoryTimeline();
//     }, []);

//     const handleSimulationAdvance = (newCandleFromServer: any) => {
//         if (!newCandleFromServer || Object.keys(newCandleFromServer).length === 0) {
//             console.error("❌ 백엔드 데이터가 유실되었습니다.");
//             return;
//         }

//         // 🎯 [핵심 추가]: 백엔드 DB 소진(END) 신호 감지 시 차트 업데이트를 '즉시 중단'
//         // 자식 콘솔(SimulationConsole)이 보낸 END 신호를 여기서 낚아채어 화면을 그 자리에 얼려버립니다.
//         if (newCandleFromServer.status === "END") {
//             console.log("🏁 [부모 관제탑] 모든 시뮬레이션이 종료되었습니다. 차트 상태를 정지합니다.");
//             return;
//         }
//         // 2️⃣ 정상 데이터일 때만 기존 배열에 축적 (기존 로직 유지)
//         if (newCandleFromServer.status === "SUCCESS") {
//             setChartDataList((prevList) => {
//                 // 기존에 작성되어 있던 캔들 데이터 누적 및 가공 로직
//                 return [...prevList, newCandleFromServer];
//             });
//         }



//         console.log("📊 [지휘소] 백엔드 생동형 데이터 수신 완료:", newCandleFromServer);

//         const currentClose = newCandleFromServer.close !== undefined ? Number(newCandleFromServer.close) : 0;
//         const currentOpen = newCandleFromServer.open !== undefined ? Number(newCandleFromServer.open) : currentClose;
//         const currentHigh = newCandleFromServer.high !== undefined ? Number(newCandleFromServer.high) : currentClose;
//         const currentLow = newCandleFromServer.low !== undefined ? Number(newCandleFromServer.low) : currentClose;
//         const currentVolume = newCandleFromServer.volume !== undefined ? Number(newCandleFromServer.volume) : 0;

//         // 🛠️ [버그 박멸]: 백엔드가 '0'을 주었을 때 종가로 오염되지 않도록 삼항연산자로 확실하게 필터링합니다.
//         const safeSma05 = newCandleFromServer.sma05 !== undefined ? Number(newCandleFromServer.sma05) : currentClose;
//         const safeSma20 = newCandleFromServer.sma20 !== undefined ? Number(newCandleFromServer.sma20) : currentClose;
//         const safeSma60 = newCandleFromServer.sma60 !== undefined ? Number(newCandleFromServer.sma60) : currentClose;
//         const safeObv = newCandleFromServer.obv !== undefined ? Number(newCandleFromServer.obv) : 0;
//         const safeRsi = newCandleFromServer.rsi !== undefined ? Number(newCandleFromServer.rsi) : 50;
//         const safeMacd = newCandleFromServer.macd !== undefined ? Number(newCandleFromServer.macd) : 0;
//         const safeMacdSignal = newCandleFromServer.macdSignal !== undefined ? Number(newCandleFromServer.macdSignal) : safeMacd;

//         // 🎯 [MFI 필터링 추가]: 데이터가 쌓이기 전인 시뮬레이션 초기 단계(14일 이전)에는 중간값 50으로 안전하게 방어합니다.
//         const safeMfi = newCandleFromServer.mfi !== undefined ? Number(newCandleFromServer.mfi) : 50;
//         const safeSigma = newCandleFromServer.sigma !== undefined ? Number(newCandleFromServer.sigma) : 0;

//         // 🎯 [신규 추가]: 4층 ADX/DMI 패널 필터링 가드 구축
//         // 백엔드에서 데이터 축적 부족 시 0.0을 쏘더라도 안전하게 50 혹은 25 등의 기본값으로 방어하거나
//         const safeAdx = newCandleFromServer.adx !== undefined ? Number(newCandleFromServer.adx) : 25;
//         const safeDiPlus = newCandleFromServer.diPlus !== undefined ? Number(newCandleFromServer.diPlus) : 25;
//         const safeDiMinus = newCandleFromServer.diMinus !== undefined ? Number(newCandleFromServer.diMinus) : 25;

//         // 🎯 [신규 추가]: CCI 패널 데이터 실시간 언팩 및 초기 방어선 구축 (중앙값 0)
//         const safeCci = newCandleFromServer.cci !== undefined ? Number(newCandleFromServer.cci) : 0;
//         const safeCciSignal = newCandleFromServer.cciSignal !== undefined ? Number(newCandleFromServer.cciSignal) : 0;

//         // 날짜 정제
//         const rawDate = newCandleFromServer.date ? String(newCandleFromServer.date).trim() : new Date().toISOString().split('T')[0];

//         // 🎯 차트 컴포넌트에 최종 바인딩될 가공 봉투 (전 패널 수치 합류 완료)
//         const indicatorCandle: CandleData = {
//             date: rawDate,
//             open: currentOpen,
//             high: currentHigh,
//             low: currentLow,
//             close: currentClose,
//             volume: currentVolume,
//             sma05: safeSma05,
//             sma20: safeSma20,
//             sma60: safeSma60,
//             macd: safeMacd,
//             macdSignal: safeMacdSignal,
//             rsi: safeRsi,
//             obv: safeObv,
//             mfi: safeMfi, // 🎯 [핵심 추가]: 정제된 MFI 알맹이를 최종 바인딩 봉투에 주입!
//             sigma: safeSigma,
//             adx: safeAdx,
//             diPlus: safeDiPlus,
//             diMinus: safeDiMinus,
//             cci: safeCci,    // 🎯 CCI 알맹이 장착 완료!
//             cciSignal: safeCciSignal
//         };

//         setChartDataList(prevList => {   // 2차 차트렌더링 방식
//             const safePrev = Array.isArray(prevList) ? prevList : [];
//             const isDuplicate = safePrev.some(item => String(item.date).trim() === rawDate);

//             if (isDuplicate) {
//                 console.log(`⚠️ [알림] ${rawDate} 데이터가 이미 존재하여 '실시간 업데이트' 모드로 전환합니다.`);
//                 return safePrev.map(item => String(item.date).trim() === rawDate ? indicatorCandle : item);
//             }

//             // 🎯 [변경]: 데이터를 자르지 않고 배열 뒤에 온전하게 계속 이어 붙입니다.
//             return [...safePrev, indicatorCandle];
//         });
//     };

//     return (
//         // 🎯 [구조 개편]: 좌우 배치를 위해 전체를 감싸는 바깥 컨테이너를 flex 구조로 감쌉니다.
//         <div style={{ display: 'flex', gap: '25px', maxWidth: showConfig ? '1200px' : '600px', margin: '30px auto', alignItems: 'flex-start', transition: 'all 0.3s ease' }}>
//             {/* 📱 왼쪽: 기존 주식 시뮬레이터 본체 폼 */}
//             <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '12px', fontFamily: 'sans-serif', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>

//                 {/* 우측 상단 구석에 설정 열기 버튼 배치 */}
//                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-15px' }}>
//                     <button
//                         onClick={() => setShowConfig(!showConfig)}
//                         style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//                     >
//                         {showConfig ? '⚙️ 설정 닫기' : '⚙️ 지표 변수 세팅'}
//                     </button>
//                 </div>

//                 <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>📈 주식 가이드 시뮬레이터</h2>

//                 {/* 대망의 실전 캔들스틱 차트에 실시간 바구니 데이터 주입 */}
//                 <CandleStickChart chartDataList={chartDataList} />
//                 <hr style={{ border: '0', height: '1px', backgroundColor: '#e9ecef', marginBottom: '20px' }} />

//                 {/* 자산 현황판 */}
//                 <AssetDashboard data={dashboardData} />
//                 <hr style={{ border: '0', height: '1px', backgroundColor: '#e9ecef', marginBottom: '20px', marginTop: '20px' }} />

//                 {/* 자식 방에게 무선 끈(onSimulationAdvance)을 정확히 인계합니다. */}
//                 <SimulationConsole
//                     onSimulationAdvance={handleSimulationAdvance}
//                     // 🎯 [추가]: 에러 폭발을 막기 위한 무선 조종 끈 연결!
//                     selectedIndicators={selectedIndicators}
//                     setSelectedIndicators={setSelectedIndicators}
//                 />

//                 <hr style={{ border: '0', height: '1px', backgroundColor: '#e9ecef', marginBottom: '20px' }} />

//                 {/* 🧱 4. 구역 [B] 주문 처리 패널 */}
//                 {/* 아래 중괄호 안처럼 매매 성공 즉시 타임라인 표(fetchHistoryTimeline)와 자산 전광판(fetchDashboard)을 동시에 연타하라고 명령을 결합합니다! */}
//                 <OrderPanel onOrderSuccess={() => {
//                     fetchHistoryTimeline(); // 하단 매매 이력 표 새로고침
//                     fetchDashboard();      // 상단 자산 평가액 전광판 새로고침 (실시간 금액 반영 완료!)
//                 }} />

//                 <hr style={{ border: '0', height: '1px', backgroundColor: '#e9ecef', marginBottom: '20px' }} />

//                 {/* 🧱 5. 구역 [C] 매매 이력 타임라인 표 */}
//                 <TradeTimeline historyList={historyList} />
//             </div>
//             {/* 🎯 오른쪽: 토글 상태가 true일 때 우측에 나란히 명세표 등장 */}
//             {showConfig && (
//                 <div style={{ flex: 1, minWidth: '400px', animation: 'fadeIn 0.3s ease' }}>
//                     <IndicatorConfig />
//                 </div>
//             )}

//         </div>
//     );
// }