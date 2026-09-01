// import React, { useMemo, useState, useEffect, useRef } from 'react';
// import {
//     ResponsiveContainer,
//     ComposedChart,
//     XAxis,
//     YAxis,
//     Tooltip,
//     Legend,
//     Line,
//     Bar,
//     Cell,
//     CartesianGrid,
//     ReferenceLine,
//     Brush
// } from 'recharts';

// export interface CandleData {
//     date: string;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     volume: number;
//     sma05?: number;
//     sma20?: number;
//     sma60?: number;
//     macd?: number;
//     macdSignal?: number;
//     rsi?: number;
//     obv?: number;
//     mfi?: number; // 💡 [추가] MFI 수치 타입 개방
//     sigma?: number; // 🎯 [핵심 추가]: 시그마 변동성 데이터 타입 도킹!
//     adx?: number;     // ADX 추세 강도선
//     diPlus?: number;  // DI+ 매수 세력선
//     diMinus?: number; // DI- 매도 세력선
//     cci?: number;
//     cciSignal?: number;
// }

// interface ChartProps {
//     chartDataList: CandleData[];
// }

// // 🎨 [최종 안정화 버전] 에러 폭발을 완벽하게 방어한 주가봉 렌더러 컴포넌트
// const CandlestickShape = (props: any) => {
//     // Recharts가 넘겨주는 그래픽 좌표(x, y, 폭)와 실제 데이터 알맹이(payload)를 분해합니다.
//     const { x, width, payload } = props;
//     if (!payload) return null;

//     // ⭕ [핵심 수선]: 날것의 진짜 데이터 주머니에서 시가, 고가, 저가, 종가를 안전하게 꺼내옵니다.
//     const open = payload.open;
//     const close = payload.close;
//     const high = payload.high;
//     const low = payload.low;

//     if (open === undefined || close === undefined || high === undefined || low === undefined) {
//         return null; // 데이터가 아직 안 쌓인 초반 구간 방어 코드
//     }

//     // 📐 [Recharts 수치 지도 변환]: 진짜 가격 수치들을 Y축 그래픽 화면 좌표로 정밀 치환 연산합니다.
//     // 부모 차트가 이미 연산해둔 Y축 높이 변환 도구(props.yAxis)가 있다면 가져다 씁니다.
//     const yAxis = props.yAxis;
//     if (!yAxis || typeof yAxis.scale !== 'function') return null;

//     // 가격 숫자를 브라우저 화면의 픽셀(Pixel) 높이 좌표로 1:1 변환
//     const yOpen = yAxis.scale(open);
//     const yClose = yAxis.scale(close);
//     const yHigh = yAxis.scale(high);
//     const yLow = yAxis.scale(low);

//     // 🎨 캔들 몸통 막대의 시작점(Top)과 두께(Height)를 연산합니다.
//     const candleTop = Math.min(yOpen, yClose);
//     const candleHeight = Math.max(Math.abs(yOpen - yClose), 2); // 최소 두께 2px 보장하여 십자봉 방어
//     const candleX = x + (width - 12) / 2; // barSize=12 두께 중앙 정렬 매칭

//     // 🔴 주가가 오르면 빨간색 양봉! 🔵 떨어지면 파란색 음봉! (보내주신 전광판 검은색 테마와 맞춤 디자인)
//     const isUp = close >= open;
//     const candleColor = isUp ? '#dc3545' : '#007bff'; // 정열의 레드 / 시원한 블루

//     return (
//         // 💡 pointerEvents: 'none' 을 주어 캔들 막대가 차트 전체 격자의 마우스 이벤트를 가로채는 현상을 원천 방어합니다.
//         <g style={{ pointerEvents: 'none' }}>
//             {/* 1️⃣ 위아래 꼬리 뼈대 선 (High - Low 꼬리선 Wick 그리기) */}
//             <line
//                 x1={x + width / 2}
//                 y1={yHigh}
//                 x2={x + width / 2}
//                 y2={yLow}
//                 stroke={candleColor}
//                 strokeWidth={1.5}
//             />
//             {/* 2️⃣ 진짜 주가 봉 몸통 막대 (Open - Close 사각형 Box 그리기) */}
//             <rect
//                 x={candleX}
//                 y={candleTop}
//                 width={12} // barSize 고정 수치와 일치화
//                 height={candleHeight}
//                 fill={candleColor}
//                 stroke={candleColor}
//                 strokeWidth={1}

//             />
//         </g>
//     );
// };

// export default function CandleStickChart({ chartDataList }: ChartProps): React.JSX.Element {

//     // 🕵️‍♂️ [체크포인트 1]: 원본 데이터가 부모로부터 제대로 수급되는지 확인
//     console.log("1️⃣ 부모가 넘겨준 원본 리스트 (chartDataList):", chartDataList);

//     // 🎯 [신규 추가] 지표선이나 데이터 오브젝트에 마우스가 직접 닿았는지 여부
//     //const [isHoveredOnObject, setIsHoveredOnObject] = useState(false);
//     const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 타이머 Ref 추가
//     // 🎯 0.7초 버틴 후 승인된 인덱스를 저장할 상태
//     //const [lastApprovedIndex, setLastApprovedIndex] = useState<number | null>(null);
//     const [approvedTooltipDate, setApprovedTooltipDate] = useState<string | null>(null);

//     const handleChartMouseMove = (e: any) => {
//         // 1. 마우스가 이동할 때마다 기존 타이머를 즉시 파괴하여 0.7초가 새로 시작되게 합니다.
//         if (tooltipTimerRef.current) {
//             clearTimeout(tooltipTimerRef.current);
//         }

//         // 2. 마우스가 움직이는 궤적 중에는 툴팁 알맹이를 숨깁니다. (점선 가이드라인만 자연스럽게 이동)
//         if (approvedTooltipDate !== null) {
//             setApprovedTooltipDate(null);
//         }

//         // 3. Recharts 이벤트 가드: 마우스 좌표가 아예 없거나 X축 라벨(날짜)이 비어있다면 무시합니다.
//         if (!e || !e.activeLabel) {
//             return;
//         }

//         // 4. [핵심 수선]: activePayload에만 의존하지 않고, Recharts가 격자 전체를 기준으로 잡아준
//         // 정확한 X축 키값인 activeLabel(날짜 문자열)을 타겟으로 고정합니다.
//         const hoveredDate = String(e.activeLabel);

//         // 5. 🎯 마우스가 특정 날짜(봉) 위에서 0.7초(700ms) 동안 멈추었을 때만 관제탑 승인!
//         tooltipTimerRef.current = setTimeout(() => {
//             setApprovedTooltipDate(hoveredDate);
//         }, 700);
//     };

//     // 마우스가 차트 영역을 아예 완전히 벗어났을 때
//     const handleChartMouseLeave = () => {
//         // 차트를 벗어나면 작동 중인 타이머를 즉시 파괴하고 툴팁 스코프를 완전히 닫습니다.
//         if (tooltipTimerRef.current) {
//             clearTimeout(tooltipTimerRef.current);
//         }
//         setApprovedTooltipDate(null);
//     };

//     // 1. 캔들 데이터 가공 (시가, 종가 몸통 및 고가, 저가 꼬리 정의)

//     const formattedData = useMemo(() => {
//         return chartDataList.map((item) => {
//             // 🎯 1. 시가와 종가가 완전히 같은지 체크 (보합/십자봉 조건)
//             const isDoji = item.open === item.close;

//             // 🎯 2. 정렬된 배열을 만들되, 같을 경우 상단 값에 미세한 버퍼(+1)를 더해 Recharts 엔진을 깨웁니다.
//             const sortedOpenClose = [item.open, item.close].sort((a, b) => a - b);
//             if (isDoji) {
//                 sortedOpenClose[1] = sortedOpenClose[1] + 1; // [54000, 54001] 형태로 만들어 0을 방어!
//             }

//             const node = {
//                 ...item,
//                 isUp: item.close >= item.open,
//                 openClose: sortedOpenClose, // 💡 보정된 배열 주입
//                 highLow: [item.low, item.high]
//             };

//             // 🎯 백엔드에서 null이 넘어왔거나 0으로 오염된 경우 sma60 속성 자체를 제거합니다.
//             if (node.sma60 === null || node.sma60 === undefined || node.sma60 === 0) {
//                 delete node.sma60;
//             }

//             return node;
//         });
//     }, [chartDataList]);

//     // 🕵️‍♂️ [체크포인트 2]: 가공 배열에 openClose 등이 정상 탑재되었는지 확인
//     console.log("2️⃣ 차트에 주입될 가공 리스트 (formattedData):", formattedData);

//     // 🎯 [Brush 설정용 인덱스 계산] 전체 데이터 중 '최근 30개'만 초기 영역으로 잡습니다.
//     // 2️⃣ [안전한 상태 선언] 지연 초기화를 통해 totalCount가 잡힌 후 정확한 인덱스로 시작하게 만듭니다.
//     // 🎯 [교정]: 기존의 activeIndex 상태를 유지하되, 실시간 데이터 증가에 대응할 수 있도록 베이스를 다집니다.
//     const [activeIndex, setActiveIndex] = useState<{ startIndex: number; endIndex: number }>({
//         startIndex: 0,
//         endIndex: 29 // 최초 30개 기본 표시 영역 (데이터가 없을 때를 대비한 기본값)
//     });

//     // 🔄 데이터(chartDataList)가 백엔드로부터 실시간으로 추가될 때, 
//     // 유저가 스크롤바를 수동으로 만지지 않았다면 자동으로 스크롤바가 우측 끝(최신 봉)을 따라오게 만드는 로직
//     useEffect(() => {
//         if (chartDataList.length === 0) return;

//         setActiveIndex((prev) => {
//             // 유저가 이미 스크롤바를 조작해서 범위를 좁혀둔 상태라면 자동으로 움직이지 않고 유저의 선택을 존중합니다.
//             const currentRange = prev.endIndex - prev.startIndex + 1;

//             // 초기 상태이거나, 스크롤바가 끝에 닿아있는 상태에서 데이터가 늘어난 것이라면 우측 끝으로 밀어줍니다.
//             const isAtEnd = prev.endIndex >= chartDataList.length - 2;
//             if (prev.startIndex === 0 && prev.endIndex === 29 || isAtEnd) {
//                 const defaultStart = Math.max(0, chartDataList.length - 30);
//                 return {
//                     startIndex: defaultStart,
//                     endIndex: chartDataList.length - 1
//                 };
//             }
//             return prev;
//         });
//     }, [chartDataList.length]); // 💡 데이터 개수가 늘어날 때마다 자동 전진 유도

//     // 3️⃣ [브러쉬 변경 핸들러] 브러쉬를 움직일 때 작동할 액션 추가
//     // 🎯 최소 30개 미만 제한 가드 핸들러 (activeIndex 버전)
//     const handleBrushChange = (e: any) => {
//         if (!e || typeof e.startIndex !== 'number' || typeof e.endIndex !== 'number') return;

//         const currentRange = e.endIndex - e.startIndex + 1;
//         const MIN_PINS = 30; // 30개 이하로 줄어들지 않게 제한

//         if (currentRange < MIN_PINS) {
//             // [케이스 A]: 오른쪽 유저바를 왼쪽으로 밀 때
//             if (e.startIndex === activeIndex.startIndex) {
//                 const safeEnd = Math.min(formattedData.length - 1, e.startIndex + MIN_PINS - 1);
//                 setActiveIndex({ startIndex: e.startIndex, endIndex: safeEnd });
//             }
//             // [케이스 B]: 왼쪽 유저바를 오른쪽으로 밀 때
//             else if (e.endIndex === activeIndex.endIndex) {
//                 const safeStart = Math.max(0, e.endIndex - MIN_PINS + 1);
//                 setActiveIndex({ startIndex: safeStart, endIndex: e.endIndex });
//             }
//             else {
//                 return; // 범위 이탈 시 변경 무시
//             }
//         } else {
//             // 30개 이상일 때는 정상 반영
//             setActiveIndex({ startIndex: e.startIndex, endIndex: e.endIndex });
//         }
//     };

//     // 2. 현재 차트 데이터 범위 내 실시간 최적 Y축 스케일 계산 (0.95 / 1.05 공식)
//     const yAxisDomains = useMemo(() => {
//         if (chartDataList.length === 0) {
//             return {
//                 stockMin: 0, stockMax: 100000, rsiMin: 0, rsiMax: 100, macdMin: -100, macdMax: 100,
//                 obvMin: 0, obvMax: 100000000, sigmaMin: -6, sigmaMax: 6, adxMin: 0, adxMax: 100, dmiMin: 0, dmiMax: 100,
//                 cciMin: -200, cciMax: 200
//             };
//         }
//         // 🔥 [핵심 변경] 전체 데이터가 아니라, 현재 Brush가 선택한 범위의 데이터만 잘라냅니다.
//         const visibleData = chartDataList.slice(activeIndex.startIndex, activeIndex.endIndex + 1);
//         const visibleFormatted = formattedData.slice(activeIndex.startIndex, activeIndex.endIndex + 1);

//         // A. 1층 주가 및 이평선 수치 종합 (high, low, sma05, sma20, sma60)
//         const stockValues: number[] = [];
//         visibleData.forEach(item => {
//             stockValues.push(item.high, item.low, item.open, item.close);
//             // 🎯 [수정]: sma05,sma20,sma60이 존재하고 값이 0이 아닐 때만 Y축 계산 배열에 포함시킵니다.
//             if (item.sma05 && item.sma05 !== 0) stockValues.push(item.sma05);
//             if (item.sma20 && item.sma20 !== 0) stockValues.push(item.sma20);
//             if (item.sma60 && item.sma60 !== 0) stockValues.push(item.sma60);
//         });
//         const sMin = stockValues.length > 0 ? Math.min(...stockValues) : 0;
//         const sMax = stockValues.length > 0 ? Math.max(...stockValues) : 100000;

//         // B. 2층 RSI, MFI 수치 종합(chartDataList ➡️ visibleData로 변경)
//         const rsiValues = visibleData.map(item => item.rsi).filter((v): v is number => v !== undefined);
//         const mfiValues = visibleData.map(item => item.mfi).filter((v): v is number => v !== undefined);
//         // 💡 [수정] RSI와 MFI 수치 전체를 아울러서 최소/최고 계산
//         const combinedrsimfiValues = [...rsiValues, ...mfiValues];
//         const rMin = combinedrsimfiValues.length > 0 ? Math.min(...combinedrsimfiValues) : 30;
//         const rMax = combinedrsimfiValues.length > 0 ? Math.max(...combinedrsimfiValues) : 70;

//         // C. 2층 MACD 수치 종합(chartDataList ➡️ visibleData로 변경)
//         const macdValues = visibleData.map(item => item.macd).filter((v): v is number => v !== undefined);
//         const mMin = macdValues.length > 0 ? Math.min(...macdValues) : -10;
//         const mMax = macdValues.length > 0 ? Math.max(...macdValues) : 10;

//         // D. 3층 OBV 수치 종합(chartDataList ➡️ visibleData로 변경)
//         const obvValues = visibleData.map(d => d.obv).filter((v): v is number => v !== undefined);
//         const oMin = obvValues.length > 0 ? Math.min(...obvValues) : 0;
//         const oMax = obvValues.length > 0 ? Math.max(...obvValues) : 1000000;

//         // D. 3층 SIGMA 수치 종합(chartDataList/formattedData ➡️ visibleData/visibleFormatted로 변경)
//         const sigmaValues = visibleData.map(d => d.sigma).filter((v): v is number => v !== undefined);
//         const cciRaw = visibleFormatted.map(item => item.cci).filter((v): v is number => v !== undefined && v !== null);
//         const cciSigRaw = visibleFormatted.map(item => item.cciSignal).filter((v): v is number => v !== undefined && v !== null);
//         const combinesigmaccidValues = [...sigmaValues, ...cciRaw, ...cciSigRaw];
//         const gMin = combinesigmaccidValues.length > 0 ? Math.min(...combinesigmaccidValues) : -3;
//         const gMax = combinesigmaccidValues.length > 0 ? Math.max(...combinesigmaccidValues) : 3;

//         // 🎯 E. 4층 ADX, DI+, DI- 수치 종합 (formattedData ➡️ visibleFormatted로 변경)
//         const adxValues = visibleFormatted.map(item => item.adx).filter((v): v is number => v !== undefined && v !== null);
//         const aMin = adxValues.length > 0 ? Math.max(0, Math.min(...adxValues)) : 0;
//         const aMax = adxValues.length > 0 ? Math.min(100, Math.max(...adxValues)) : 100;

//         // 🎯 E. 4층 ADX, DI+, DI- 수치 종합 (formattedData ➡️ visibleFormatted로 변경)
//         const diPlusRaw = visibleFormatted.map(item => item.diPlus).filter((v): v is number => v !== undefined && v !== null);
//         const diMinusRaw = visibleFormatted.map(item => item.diMinus).filter((v): v is number => v !== undefined && v !== null);
//         const combineddipValues = [...diPlusRaw, ...diMinusRaw];
//         const dMin = combineddipValues.length > 0 ? Math.max(0, Math.min(...combineddipValues)) : 0;
//         const dMax = combineddipValues.length > 0 ? Math.min(100, Math.max(...combineddipValues)) : 100;

//         // // 🌀 [신규 동적연산] 4층 우측 배치될 CCI 및 CCI Signal 스케일 확보
//         // const cciRaw = visibleFormatted.map(item => item.cci).filter((v): v is number => v !== undefined && v !== null);
//         // const cciSigRaw = visibleFormatted.map(item => item.cciSignal).filter((v): v is number => v !== undefined && v !== null);
//         // const combinedCciValues = [...cciRaw, ...cciSigRaw];
//         // // 과매수/과매도 절대 경계선인 -100, 100이 차트에 늘 잡히도록 기초 가드라인 도킹
//         // const cMin = combinedCciValues.length > 0 ? Math.min(...combinedCciValues, -100) : -100;
//         // const cMax = combinedCciValues.length > 0 ? Math.max(...combinedCciValues, 100) : 100;

//         // 🎯 최소값 * 0.95 / 최대값 * 1.05 동적 비율 스케일 적용

//         return {
//             // 1층 주가 및 이평선 (0.95 / 1.05 공식 적용)
//             stockMin: Math.floor(sMin * 0.95),
//             stockMax: Math.ceil(sMax * 1.05),

//             // 2층 RSI & MFI 공용 패널 (25~75 기준 패딩 가드 적용)
//             // rsiMin: Math.max(0, Math.floor(Math.min(rMin, 25) * 0.95)),
//             // rsiMax: Math.min(100, Math.ceil(Math.max(rMax, 75) * 1.05)),
//             rsiMin: Math.max(0, Math.floor(rMin - (rMax - rMin) * 0.1)), // 하단 10% 여백
//             rsiMax: Math.min(100, Math.ceil(rMax + (rMax - rMin) * 0.1)), // 상단 10% 여백

//             // 2층 MACD 독립 패널 (양수/음수 방향성 고려)
//             // macdMin: mMin < 0 ? Math.floor(mMin * 1.05) : Math.floor(mMin * 0.95),
//             // macdMax: mMax > 0 ? Math.ceil(mMax * 1.05) : Math.ceil(mMax * 0.95),
//             macdMin: Math.floor(mMin - Math.abs(mMax - mMin) * 0.1),
//             macdMax: Math.ceil(mMax + Math.abs(mMax - mMin) * 0.1),

//             // 3층 OBV 패널 (절대값 패딩 반영)
//             // obvMin: Math.floor(oMin - Math.abs(oMin * 0.05)),
//             // obvMax: Math.ceil(oMax + Math.abs(oMax * 0.05)),
//             obvMin: Math.floor(oMin - Math.abs(oMax - oMin) * 0.05),
//             obvMax: Math.ceil(oMax + Math.abs(oMax - oMin) * 0.05),

//             // 기존에 MACD 변수인 mMin, mMax를 기준으로 삼던 오타를 시그마 기준 변수인 gMin, gMax로 완벽하게 교정했습니다.
//             // sigmaMin: gMin < 0 ? Math.floor(gMin * 1.05) : Math.floor(gMin * 0.95),
//             // sigmaMax: gMax > 0 ? Math.ceil(gMax * 1.05) : Math.ceil(gMax * 0.95),
//             sigmaMin: Math.floor(gMin - Math.abs(gMax - gMin) * 0.1),
//             sigmaMax: Math.ceil(gMax + Math.abs(gMax - gMin) * 0.1),

//             // 🎯 4층 ADX & DMI 패널 (RSI와 동일한 구조로 25~75 기본 가드 적용하여 형식 통일)
//             adxMin: Math.max(0, Math.floor(aMin - (aMax - aMin) * 0.1)), // 하단 10% 여백 (최소 0 제한)
//             adxMax: Math.min(100, Math.ceil(aMax + (aMax - aMin) * 0.1)), // 상단 10% 여백 (최대 100 제한)

//             // 🎯 4층 ADX & DMI 패널 (RSI와 동일한 구조로 25~75 기본 가드 적용하여 형식 통일)
//             dmiMin: Math.max(0, Math.floor(dMin - (dMax - dMin) * 0.1)), // 하단 10% 여백 (최소 0 제한)
//             dmiMax: Math.min(100, Math.ceil(dMax + (dMax - dMin) * 0.1)), // 상단 10% 여백 (최대 100 제한)

//             // // 🌀 CCI 패딩 마진 적용 완료
//             // cciMin: Math.floor(cMin - Math.abs(cMax - cMin) * 0.1), // 최솟값 아래로 10% 더 밀어냄
//             // cciMax: Math.ceil(cMax + Math.abs(cMax - cMin) * 0.1)   // 최댓값 위로 10% 더 밀어냄
//         };

//         // 🔥 [중요] useMemo 의존성 배열에 activeIndex를 반드시 추가해야 브러쉬 스크롤 시 실시간 재연산됩니다!
//     }, [formattedData, chartDataList, activeIndex]);

//     return (
//         <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
//             <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
//                 📊 Recharts 통합 트레이딩 멀티 대시보드
//             </h4>

//             {chartDataList.length === 0 ? (
//                 <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>
//                     ⏳ 시뮬레이션을 가동하면 이곳에 통합 멀티 차트가 그려집니다.
//                 </div>
//             ) : (
//                 <div>
//                     {/* ------------------------------------------------------------ */}
//                     {/* 📈 [1층] 메인 주가 영역 (컬러 캔들스틱 + 고저 바늘선 최종 완공)    */}
//                     {/* ------------------------------------------------------------ */}
//                     <ResponsiveContainer width="100%" height={240}>
//                         {/* 고저바늘선과 주가봉을 합체하자면 같은 <Bar>콤포넌트 이므로 barGap={-5} 인수가 들어가야 한다 */}
//                         <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} barGap={-5} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove}
//                             onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}>  // 🎯 [핵심 추가] 타입 에러 없이 마우스 이벤트 유실을 완벽히 막아줍니다!
//                             <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//                             <XAxis dataKey="date" type="category" tick={{ fill: '#6c757d', fontSize: 9 }} padding={{ left: 10, right: 10 }} />

//                             <YAxis yAxisId="stock-axis" width={50} type="number" domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]}
//                                 tick={{ fill: '#495057', fontSize: 10, fontWeight: 'bold' }}
//                                 tickFormatter={(value) => { if (value === 0) return '0'; return `${(value / 1000).toFixed(0)}K`; }}
//                             />

//                             {/* 👈 2. [우측 Y축]: 실제 주가 및 이평선 데이터가 매핑될 메인 축 */}
//                             <YAxis
//                                 yAxisId="stock-axis-right" // 💡 ID를 right로 명확히 구분
//                                 width={50}
//                                 type="number"
//                                 orientation="right"        // 💡 우측으로 이동
//                                 domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]}
//                                 // allowDataOverflow={false}
//                                 tick={{ fill: '#495057', fontSize: 10, fontWeight: 'bold' }}
//                                 tickFormatter={(value) => { if (value === 0) return '0'; return `${(value / 1000).toFixed(0)}K`; }}
//                                 stroke="#37474f"
//                             />

//                             <Tooltip
//                                 shared={true}
//                                 cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

//                                 // 🎯 1층 고유의 캔들스틱(주가 봉) 및 이평선 커스텀 포맷팅을 content 안에서 완벽히 처리합니다.
//                                 content={({ active, payload }) => {
//                                     if (!active || !payload || !payload.length) return null;

//                                     const currentData = payload[0].payload;

//                                     // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 켜고 은폐
//                                     if (currentData.date !== approvedTooltipDate) {
//                                         return null;
//                                     }

//                                     const { open, close, high, low, sma05, sma20, sma60 } = currentData;

//                                     // 🛠️ 이평선 수치 가드 및 포맷팅 분기 처리
//                                     const sma05Text = (sma05 && sma05 !== 0) ? `${Math.round(sma05).toLocaleString()}원` : "계산 중...";
//                                     const sma20Text = (sma20 && sma20 !== 0) ? `${Math.round(sma20).toLocaleString()}원` : "계산 중...";
//                                     const sma60Text = (sma60 && sma60 !== 0) ? `${Math.round(sma60).toLocaleString()}원` : "축적 중...";

//                                     return (
//                                         <div style={{
//                                             backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                             padding: '12px',
//                                             border: '1px solid #dee2e6',
//                                             borderRadius: '6px',
//                                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//                                             pointerEvents: 'none'
//                                         }}>
//                                             {/* 📅 상단 동기화 날짜 표시 */}
//                                             <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textAlign: 'center' }}>
//                                                 {currentData.date}
//                                             </div>

//                                             {/* 📊 주가 및 이평선 통합 레이아웃 */}
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#333', fontSize: '11px' }}>
//                                                 {/* 🎯 이평선 3형제 상단 배치 */}
//                                                 <div style={{ color: '#cf1919', fontWeight: 'bold' }}>SMA 05 : {sma05Text}</div>
//                                                 <div style={{ color: '#ff9500', fontWeight: 'bold' }}>SMA 20 : {sma20Text}</div>
//                                                 <div style={{ color: '#192bcf', fontWeight: 'bold' }}>SMA 60 : {sma60Text}</div>

//                                                 {/* 구분선 */}
//                                                 <hr style={{ border: '0', borderTop: '1px solid #dee2e6', margin: '4px 0' }} />

//                                                 {/* 주가 데이터 데이터 정보 하단 배치 (원화 포맷팅) */}
//                                                 {open !== undefined && (
//                                                     <>
//                                                         <div>시가 : {Math.round(open).toLocaleString()}원</div>
//                                                         <div>종가 : {Math.round(close).toLocaleString()}원</div>
//                                                         <div>고가 : {Math.round(high).toLocaleString()}원</div>
//                                                         <div>저가 : {Math.round(low).toLocaleString()}원</div>
//                                                     </>
//                                                 )}

//                                                 {/* 주가 봉 외에 호가나 다른 지표 데이터가 추가로 패이로드에 섞여 들어올 경우를 대비한 가드 */}
//                                                 {payload.map((entry: any, index: number) => {
//                                                     if (["주가 봉", "주가", "SMA 05", "SMA 20", "SMA 60"].includes(entry.name)) return null;
//                                                     return (
//                                                         <div key={index} style={{ color: entry.color, marginTop: '2px' }}>
//                                                             {entry.name} : {typeof entry.value === 'number' ? `${Math.round(entry.value).toLocaleString()}원` : entry.value}
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     );
//                                 }}
//                             />
//                             <Legend wrapperStyle={{ fontSize: '11px' }} />

//                             {/* 1️⃣ [고저 바늘핀 구현]: high와 low 사이를 수직선으로 이어주는 얇은 막대 */}
//                             <Bar
//                                 name="고저 바늘선"
//                                 dataKey="highLow" //{(entry) => [entry.low, entry.high]} 저가와 고가 사이의 범위를 지정 (배열 형태)
//                                 yAxisId="stock-axis-right" // 👈 우측 축 ID로 변경
//                                 barSize={1.5} // 선처럼 보여야 하므로 두께를 1px(또는 2px)로 아주 얇게 설정
//                                 //stackId="stock"       // 💡 중요: 몸통 Bar와 같은 ID를 주어 x축 중심점을 강제로 일치시킵니다
//                                 tooltipType="none" // 💡 툴팁에서 '고저 바늘선: NaN'이 출력되지 않도록 완전히 차단!
//                                 legendType="none"  // 💡 차트 범례 목록(Legend)에서 이 Bar를 완벽히 숨김!
//                             >
//                                 {formattedData.map((entry: any, index: number) => {
//                                     const isUp = entry.close >= entry.open;
//                                     return (
//                                         <Cell
//                                             key={`needle-${index}`}
//                                             // 주가 봉 색상과 맞춰주거나, 차분한 챠콜 그레이(#495057)로 통일할 수 있습니다.
//                                             fill={isUp ? '#dc3545' : '#007bff'}
//                                             stroke={isUp ? '#dc3545' : '#007bff'}
//                                         />
//                                     );
//                                 })}
//                             </Bar>

//                             {/* 2️⃣ [양봉/음봉 컬러 몸통 막대 그리기]: 종가(close) 기준으로 100% 깔끔하게 사각형 박스를 안착시킵니다. */}
//                             <Bar
//                                 name="주가 봉"
//                                 dataKey="openClose"
//                                 yAxisId="stock-axis-right" // 👈 우측 축 ID로 변경
//                                 //stackId="stock"       // 💡 중요: 바늘핀과 동일한 stackId를 부여합니다.
//                                 barSize={10}
//                             //shape={<CandlestickShape />} // 🎯 [핵심 추가]: 시가=종가 방어 로직이 들어간 커스텀 셰이프를 연결합니다!
//                             >
//                                 {formattedData.map((entry: any, index: number) => {
//                                     const isUp = entry.close >= entry.open; // 종가가 시가보다 높으면 양봉(레드), 낮으면 음봉(블루)
//                                     return (
//                                         <Cell
//                                             key={`cell-${index}`}
//                                             fill={isUp ? '#dc3545' : '#007bff'}
//                                             stroke={isUp ? '#dc3545' : '#007bff'}
//                                         />
//                                     );
//                                 })}
//                             </Bar>

//                             {/* 실시간 5일, 20일 이동평균선 파이프라인 */}
//                             <Line yAxisId="stock-axis-right" name="SMA 05" type="monotone" dataKey="sma05" stroke="#cf1919" dot={false} strokeWidth={1.5} connectNulls />
//                             <Line yAxisId="stock-axis-right" name="SMA 20" type="monotone" dataKey="sma20" stroke="#ff9500" dot={false} strokeWidth={1.5} connectNulls />
//                             <Line yAxisId="stock-axis-right" name="SMA 60" type="monotone" dataKey="sma60" connectNulls={false} stroke="#192bcf" dot={false} strokeWidth={1.5} />
//                         </ComposedChart>
//                     </ResponsiveContainer>

//                     <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

//                     {/* ------------------------------------------------------------ */}
//                     {/* 🧬 [2층] 보조 지표 영역 (좌: RSI, MFI % 기준선 | 우: MACD 볼륨 에너지)   */}
//                     {/* ------------------------------------------------------------ */}
//                     <h5 style={{ margin: '0 0 5px 5px', fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>🧬 보조지표 패널 A (좌: RSI,MFI선 | 우: MACD선)</h5>
//                     <ResponsiveContainer width="100%" height={150}>
//                         <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove}
//                             onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}> // 🎯 [1층 연동] 마우스 트래킹 유실 원천 차단
//                             <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//                             <XAxis dataKey="date" type="category" tick={{ fill: '#6c757d', fontSize: 9 }} padding={{ left: 10, right: 10 }} hide />

//                             {/* 좌측 Y축: RSI 전용 실시간 최적화 축 */}
//                             <YAxis
//                                 yAxisId="left-rsi"  // 0~100 범위를 MFI와 공유합니다.
//                                 width={50}
//                                 orientation="left"
//                                 domain={[yAxisDomains.rsiMin, yAxisDomains.rsiMax]}
//                                 tickCount={5}
//                                 tick={{ fill: '#2cc54d', fontSize: 9, fontWeight: 'bold' }}
//                             />

//                             {/* 우측 Y축: MACD 전용 실시간 최적화 축 */}
//                             <YAxis
//                                 yAxisId="right-macd"
//                                 width={50}
//                                 orientation="right"
//                                 domain={[yAxisDomains.macdMin, yAxisDomains.macdMax]}
//                                 tickCount={5}
//                                 tick={{ fill: '#748cab', fontSize: 9 }}
//                                 tickFormatter={(value) => { if (value === 0) return '0'; return `${(value / 1000).toFixed(0)}K`; }}
//                             />

//                             <Tooltip
//                                 shared={true}
//                                 cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

//                                 // 🎯 content 내부에서 0.7초 검문 및 2층 지표 반올림(Round) 포맷팅을 일괄 처리합니다.
//                                 content={({ active, payload }) => {
//                                     if (!active || !payload || !payload.length) return null;

//                                     const currentData = payload[0].payload;

//                                     // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 켜고 은폐
//                                     if (currentData.date !== approvedTooltipDate) {
//                                         return null;
//                                     }

//                                     return (
//                                         <div style={{
//                                             backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                             padding: '12px',
//                                             border: '1px solid #dee2e6',
//                                             borderRadius: '6px',
//                                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//                                             pointerEvents: 'none'
//                                         }}>
//                                             {/* 📅 상단 동기화 날짜 표시 */}
//                                             <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', textAlign: 'center' }}>
//                                                 {currentData.date}
//                                             </div>

//                                             {/* 📈 2층 보조지표 목록 렌더링 루프 (RSI, MFI, r-MACD) */}
//                                             {payload.map((entry: any, index: number) => {
//                                                 const indicatorName = entry.name ? String(entry.name) : "";
//                                                 let displayedValue = entry.value;

//                                                 // 🎯 [기존 formatter 로직 완벽 이식]: 
//                                                 // 숫자가 존재할 경우 정수로 반올림(Math.round)한 뒤 세 자릿수 콤마 처리
//                                                 if (typeof displayedValue === 'number') {
//                                                     displayedValue = Math.round(displayedValue).toLocaleString();
//                                                 }

//                                                 return (
//                                                     <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
//                                                         {indicatorName} : {displayedValue}
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     );
//                                 }}
//                             />
//                             <Legend wrapperStyle={{ fontSize: '11px' }} />

//                             {/* RSI(70,30),MFI(80,20) 투자 판단 가이드 점선 가동 */}
//                             <ReferenceLine yAxisId="left-rsi" y={80} stroke="#dc3545" strokeDasharray="3 3" label={{ value: '80 과열', fill: '#dc3545', fontSize: 8, position: 'insideRight' }} />
//                             <ReferenceLine yAxisId="left-rsi" y={20} stroke="#007bff" strokeDasharray="3 3" label={{ value: '20 침체', fill: '#007bff', fontSize: 8, position: 'insideRight' }} />
//                             {/* MACD  투자 판단 가이드 점선 가동 */}
//                             <ReferenceLine yAxisId="right-macd" y={0} stroke="#748cab" strokeDasharray="3 3" label={{ value: '0 macd', fill: '#748cab', fontSize: 8, position: 'insideRight' }} />

//                             {/* RSI 밴드 추세선 */}
//                             <Line yAxisId="left-rsi" name="RSI (%)" type="monotone" dataKey="rsi" stroke="#2cc54d" dot={false} strokeWidth={1.5} connectNulls={false} />

//                             {/* 💡 [추가] MFI 자금흐름 */}
//                             <Line yAxisId="left-rsi" name="MFI (자금흐름)" type="monotone" dataKey="mfi" stroke="#e83e8c" dot={false} strokeWidth={1.5} connectNulls={false} />

//                             {/* MACD 밴드 추세선 */}
//                             <Line yAxisId="right-macd" name="r-MACD" type="monotone" dataKey="macd" stroke="#2c3bc5" dot={false} strokeWidth={1.5} connectNulls={false} />
//                         </ComposedChart>
//                     </ResponsiveContainer>

//                     <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

//                     {/* ------------------------------------------------------------ */}
//                     {/* 🧬 [3층] 보조 지표 영역 (좌: SIGMA, CCI 변동성, 우: OBV 볼륨 에너지)   */}
//                     {/* ------------------------------------------------------------ */}
//                     <h5 style={{ margin: '0 0 5px 5px', fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>
//                         🧬 보조지표 패널 B (좌: SIGMA, CCI변동성 | 우: OBV 에너지)</h5>
//                     <ResponsiveContainer width="100%" height={150}>
//                         <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove}
//                             onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}> // 🎯 [1층 연동] 마우스 트래킹 유실 원천 차단
//                             <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//                             <XAxis dataKey="date" type="category" tick={{ fill: '#6c757d', fontSize: 9 }} padding={{ left: 10, right: 10 }} hide />

//                             {/* 우측: OBV 전용 우측 Y축 */}
//                             <YAxis
//                                 yAxisId="right-obv"
//                                 width={50}
//                                 orientation="right"
//                                 domain={[yAxisDomains.obvMin, yAxisDomains.obvMax]}
//                                 tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} // 소수점 한 자리까지 챙겨 가독성 확보
//                                 style={{ fontSize: 9, fill: '#9b59b6' }}
//                             />

//                             {/* 좌: SIGMA, CCI 변동성 실선) - 스위치 연동 */}
//                             <YAxis
//                                 yAxisId="left-sigma"
//                                 width={50}
//                                 domain={[-3, 3]} // 💡 표준편차 상하한선 범위 확정
//                                 ticks={[-1, 0, 1]} // 과열(+1), 기준선(0), 과매도(-1) 가이드라인
//                                 orientation="left"
//                                 style={{ fontSize: 9, fill: '#595bb6' }}
//                             />

//                             {/* 🛠️ [누락 버그 수선]: CCI 라인이 터지지 않도록 숨겨진 CCI 전용 가상 Y축 정의 */}
//                             {/* <YAxis
//                                 yAxisId="cci-axis"
//                                 domain={[-250, 250]}
//                                 hide // 레이아웃 스케일을 무너뜨리지 않도록 축 자체는 은폐합니다.
//                             /> */}

//                             <Tooltip
//                                 shared={true}
//                                 cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

//                                 // 🎯 content 내부에서 0.7초 검문 및 지표 포맷팅을 일괄 처리합니다. (formatter는 제거)
//                                 content={({ active, payload }) => {
//                                     if (!active || !payload || !payload.length) return null;

//                                     const currentData = payload[0].payload;

//                                     // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 보여주고 은폐
//                                     if (currentData.date !== approvedTooltipDate) {
//                                         return null;
//                                     }

//                                     return (
//                                         <div style={{
//                                             backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                             padding: '12px',
//                                             border: '1px solid #dee2e6',
//                                             borderRadius: '6px',
//                                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//                                             pointerEvents: 'none'
//                                         }}>
//                                             {/* 📅 상단 동기화 날짜 표시 */}
//                                             <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', textAlign: 'center' }}>
//                                                 {currentData.date}
//                                             </div>

//                                             {/* 📈 보조지표 목록 렌더링 루프 */}
//                                             {payload.map((entry: any, index: number) => {
//                                                 const indicatorName = entry.name ? String(entry.name) : "";
//                                                 let displayedValue = entry.value;

//                                                 // 🎯 [포맷팅 이식 1]: SIGMA 지표일 때 소수점 1자리 고정
//                                                 if (indicatorName.includes("SIGMA")) {
//                                                     displayedValue = Number(entry.value).toFixed(1);
//                                                 }

//                                                 // 🎯 [포맷팅 이식 2]: OBV 지표일 때 100만 단위(M) 축약 및 정수 반올림 표시
//                                                 else if (indicatorName.includes("OBV")) {
//                                                     const millionValue = Number(entry.value) / 1000000;
//                                                     displayedValue = `${millionValue.toLocaleString(undefined, {
//                                                         minimumFractionDigits: 0,
//                                                         maximumFractionDigits: 0
//                                                     })}M`;
//                                                 }

//                                                 // 🎯 그 외 기본 지표일 때 세 자릿수 콤마 포맷팅 기본 적용
//                                                 else if (typeof displayedValue === 'number') {
//                                                     displayedValue = displayedValue.toLocaleString();
//                                                 }

//                                                 return (
//                                                     <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
//                                                         {indicatorName} : {displayedValue}
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     );
//                                 }}
//                             />
//                             <Legend wrapperStyle={{ fontSize: '11px' }} />

//                             {/* SIGMA +1.0 위험 과열선 */}
//                             <ReferenceLine yAxisId="left-sigma" y={1} stroke="#dc3545" strokeDasharray="3 3" label={{ value: '+1σ 과열', fill: '#dc3545', fontSize: 9, position: 'insideRight' }} />
//                             {/* SIGMA -1.0 위험 과매도선 */}
//                             <ReferenceLine yAxisId="left-sigma" y={-1} stroke="#28a745" strokeDasharray="3 3" label={{ value: '-1σ 과매도', fill: '#28a745', fontSize: 9, position: 'insideRight' }} />

//                             {/* CCI 기준선 가동 */}
//                             <ReferenceLine yAxisId="cci-axis" y={100} stroke="#ff4d4f" strokeDasharray="3 3" strokeWidth={1.2} label={{ value: '+100 과열', position: 'insideLeft', fill: '#ff4d4f', fontSize: 8 }} />
//                             <ReferenceLine yAxisId="cci-axis" y={-100} stroke="#1890ff" strokeDasharray="3 3" strokeWidth={1.2} label={{ value: '-100 침체', position: 'insideLeft', fill: '#1890ff', fontSize: 8 }} />

//                             {/* OBV 실선 그래프 */}
//                             <Line yAxisId="right-obv" name="OBV (거래량)" type="monotone" dataKey="obv" stroke="#9b59b6" dot={false} strokeWidth={1.5} connectNulls={false} />

//                             {/* SIGMA 실선 렌더링 */}
//                             <Line yAxisId="left-sigma" name="SIGMA (변동성)" type="monotone" dataKey="sigma" stroke="#007bff" dot={false} strokeWidth={2} connectNulls={false} />

//                             {/* CCI 형제 그래프 연결선 */}
//                             <Line name="CCI" yAxisId="cci-axis" type="monotone" dataKey="cci" stroke="#ec1818" strokeWidth={1.8} dot={false} connectNulls />
//                             <Line name="CCI 시그널" yAxisId="cci-axis" type="monotone" dataKey="cciSignal" stroke="#c21388" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
//                         </ComposedChart>
//                     </ResponsiveContainer>

//                     <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

//                     {/* ------------------------------------------------------------ */}
//                     {/* 📊 [4층] 병렬 듀얼 패널 (좌측: CCI | 우측: ADX/DMI 시스템)    */}
//                     {/* ------------------------------------------------------------ */}
//                     <h5 style={{ margin: '10px 0 5px 0', fontSize: '12px', color: '#495057', fontWeight: 'bold' }}>
//                         🧬 보조지표 패널 C (좌:   | 우: ADX/DMI)
//                     </h5>
//                     <ResponsiveContainer width="100%" height={200}>
//                         <ComposedChart data={formattedData} syncId="stockTooltipSync" margin={{ top: 10, right: 1, left: 1, bottom: 5 }} onMouseMove={handleChartMouseMove}
//                             onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}> // 🎯 [전 층 동기화] 마지막 패널까지 미끄러짐 방지 주입
//                             <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//                             <XAxis dataKey="date" type="category" tick={false} tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />

//                             <YAxis
//                                 yAxisId="adx-axis-left"
//                                 width={50}
//                                 type="number"
//                                 orientation="left" // 오른쪽 배치 레이아웃에 맞춰 오른쪽에 수치 표기
//                                 domain={[yAxisDomains.adxMin, yAxisDomains.adxMax]}
//                                 tick={{ fill: '#fa8c16', fontSize: 9 }}
//                                 tickFormatter={(val) => Math.round(val).toString()}
//                             />

//                             <YAxis
//                                 yAxisId="adx-axis-right"
//                                 width={50}
//                                 type="number"
//                                 orientation="right" // 오른쪽 배치 레이아웃에 맞춰 오른쪽에 수치 표기
//                                 domain={[yAxisDomains.dmiMin, yAxisDomains.dmiMax]}
//                                 tick={{ fill: '#fa8c16', fontSize: 9 }}
//                                 tickFormatter={(val) => Math.round(val).toString()}
//                                 stroke="#37474f"
//                             />

//                             <Tooltip
//                                 shared={true}
//                                 cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

//                                 // 🎯 content 내부에서 0.7초 검문 및 4층 지표 소수점 1자리(toFixed) 포맷팅을 일괄 처리합니다.
//                                 content={({ active, payload }) => {
//                                     if (!active || !payload || !payload.length) return null;

//                                     const currentData = payload[0].payload;

//                                     // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 켜고 은폐
//                                     if (currentData.date !== approvedTooltipDate) {
//                                         return null;
//                                     }

//                                     return (
//                                         <div style={{
//                                             backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                             padding: '12px',
//                                             border: '1px solid #dee2e6',
//                                             borderRadius: '6px',
//                                             boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//                                             pointerEvents: 'none'
//                                         }}>
//                                             {/* 📅 상단 동기화 날짜 표시 */}
//                                             <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', textAlign: 'center' }}>
//                                                 {currentData.date}
//                                             </div>

//                                             {/* 📈 4층 보조지표 목록 렌더링 루프 (ADX, DI+, DI-) */}
//                                             {payload.map((entry: any, index: number) => {
//                                                 // Brush 데이터가 툴팁 타겟에 잡혀 들어오는 예외를 방어합니다.
//                                                 if (entry.dataKey === 'date') return null;

//                                                 const indicatorName = entry.name ? String(entry.name) : "";
//                                                 let displayedValue = entry.value;

//                                                 // 🎯 [기존 formatter 로직 완벽 이식]: 
//                                                 // 숫자가 존재할 경우 소수점 1자리 고정 및 세 자릿수 콤마(toLocaleString) 처리
//                                                 if (typeof displayedValue === 'number') {
//                                                     displayedValue = Math.round(displayedValue).toLocaleString();
//                                                 }

//                                                 return (
//                                                     <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
//                                                         {indicatorName} : {displayedValue}
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     );
//                                 }}
//                             />
//                             <Legend wrapperStyle={{ fontSize: '11px' }} />

//                             {/* DI 20 침체선, DI 50 과열선 */}
//                             <ReferenceLine yAxisId="adx-axis-right" y={50} stroke="#ff4d4f" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '강세 50', position: 'insideRight', fill: '#ff4d4f', fontSize: 11 }} />
//                             <ReferenceLine yAxisId="adx-axis-right" y={20} stroke="#1890ff" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '약세 20', position: 'insideRight', fill: '#1890ff', fontSize: 11 }} />

//                             {/* 📉 DI+ (추세 상승 동력 - 녹색), 📈DI- (추세 하락 동력 - 분홍/적색), ⚡ ADX (진짜 추세 강도선 - 차분한 다크 네이비 혹은 딥 그레이) */}
//                             <Line name="DI+" yAxisId="adx-axis-right" type="monotone" dataKey="diPlus" stroke="#e71d36" dot={false} strokeWidth={1.5} connectNulls />
//                             <Line name="DI-" yAxisId="adx-axis-right" type="monotone" dataKey="diMinus" stroke="#2ec4b6" dot={false} strokeWidth={1.5} connectNulls />
//                             <Line name="ADX" yAxisId="adx-axis-left" type="monotone" dataKey="adx" stroke="#011627" dot={false} strokeWidth={2} connectNulls />

//                             <Brush
//                                 dataKey="date"
//                                 height={20}
//                                 stroke="#8884d8"
//                                 fill="#fff"
//                                 startIndex={activeIndex.startIndex} // 💡 고정된 default 변수가 아니라 상태값과 1:1 동기화
//                                 endIndex={activeIndex.endIndex}     // 💡 상태값과 1:1 동기화
//                                 onChange={handleBrushChange}        // 💡 움직임 감지 핸들러 연결
//                             />
//                         </ComposedChart>
//                     </ResponsiveContainer>
//                 </div>
//             )}
//         </div>
//     );
// }






import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    Bar,
    Cell,
    CartesianGrid,
    ReferenceLine,
    Brush
} from 'recharts';

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
    mfi?: number; // 💡 [추가] MFI 수치 타입 개방
    sigma?: number; // 🎯 [핵심 추가]: 시그마 변동성 데이터 타입 도킹!
    adx?: number;     // ADX 추세 강도선
    diPlus?: number;  // DI+ 매수 세력선
    diMinus?: number; // DI- 매도 세력선
    cci?: number;
    cciSignal?: number;
}

interface ChartProps {
    chartDataList: CandleData[];
}

// 🎨 [최종 안정화 버전] 에러 폭발을 완벽하게 방어한 주가봉 렌더러 컴포넌트
const CandlestickShape = (props: any) => {
    // Recharts가 넘겨주는 그래픽 좌표(x, y, 폭)와 실제 데이터 알맹이(payload)를 분해합니다.
    const { x, width, payload } = props;
    if (!payload) return null;

    // ⭕ [핵심 수선]: 날것의 진짜 데이터 주머니에서 시가, 고가, 저가, 종가를 안전하게 꺼내옵니다.
    const open = payload.open;
    const close = payload.close;
    const high = payload.high;
    const low = payload.low;

    if (open === undefined || close === undefined || high === undefined || low === undefined) {
        return null; // 데이터가 아직 안 쌓인 초반 구간 방어 코드
    }

    // 📐 [Recharts 수치 지도 변환]: 진짜 가격 수치들을 Y축 그래픽 화면 좌표로 정밀 치환 연산합니다.
    // 부모 차트가 이미 연산해둔 Y축 높이 변환 도구(props.yAxis)가 있다면 가져다 씁니다.
    const yAxis = props.yAxis;
    if (!yAxis || typeof yAxis.scale !== 'function') return null;

    // 가격 숫자를 브라우저 화면의 픽셀(Pixel) 높이 좌표로 1:1 변환
    const yOpen = yAxis.scale(open);
    const yClose = yAxis.scale(close);
    const yHigh = yAxis.scale(high);
    const yLow = yAxis.scale(low);

    // 🎨 캔들 몸통 막대의 시작점(Top)과 두께(Height)를 연산합니다.
    const candleTop = Math.min(yOpen, yClose);
    const candleHeight = Math.max(Math.abs(yOpen - yClose), 2); // 최소 두께 2px 보장하여 십자봉 방어
    const candleX = x + (width - 12) / 2; // barSize=12 두께 중앙 정렬 매칭

    // 🔴 주가가 오르면 빨간색 양봉! 🔵 떨어지면 파란색 음봉! (보내주신 전광판 검은색 테마와 맞춤 디자인)
    const isUp = close >= open;
    const candleColor = isUp ? '#dc3545' : '#007bff'; // 정열의 레드 / 시원한 블루

    return (
        // 💡 pointerEvents: 'none' 을 주어 캔들 막대가 차트 전체 격자의 마우스 이벤트를 가로채는 현상을 원천 방어합니다.
        <g style={{ pointerEvents: 'none' }}>
            {/* 1️⃣ 위아래 꼬리 뼈대 선 (High - Low 꼬리선 Wick 그리기) */}
            <line
                x1={x + width / 2}
                y1={yHigh}
                x2={x + width / 2}
                y2={yLow}
                stroke={candleColor}
                strokeWidth={1.5}
            />
            {/* 2️⃣ 진짜 주가 봉 몸통 막대 (Open - Close 사각형 Box 그리기) */}
            <rect
                x={candleX}
                y={candleTop}
                width={12} // barSize 고정 수치와 일치화
                height={candleHeight}
                fill={candleColor}
                stroke={candleColor}
                strokeWidth={1}

            />
        </g>
    );
};

export default function CandleStickChart({ chartDataList }: ChartProps): React.JSX.Element {

    // 🕵️‍♂️ [체크포인트 1]: 원본 데이터가 부모로부터 제대로 수급되는지 확인
    console.log("1️⃣ 부모가 넘겨준 원본 리스트 (chartDataList):", chartDataList);

    // 🎯 [신규 추가] 지표선이나 데이터 오브젝트에 마우스가 직접 닿았는지 여부
    //const [isHoveredOnObject, setIsHoveredOnObject] = useState(false);
    const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 타이머 Ref 추가
    // 🎯 0.7초 버틴 후 승인된 인덱스를 저장할 상태
    //const [lastApprovedIndex, setLastApprovedIndex] = useState<number | null>(null);
    const [approvedTooltipDate, setApprovedTooltipDate] = useState<string | null>(null);

    const handleChartMouseMove = (e: any) => {
        // 1. 마우스가 이동할 때마다 기존 타이머를 즉시 파괴하여 0.7초가 새로 시작되게 합니다.
        if (tooltipTimerRef.current) {
            clearTimeout(tooltipTimerRef.current);
        }

        // 2. 마우스가 움직이는 궤적 중에는 툴팁 알맹이를 숨깁니다. (점선 가이드라인만 자연스럽게 이동)
        if (approvedTooltipDate !== null) {
            setApprovedTooltipDate(null);
        }

        // 3. Recharts 이벤트 가드: 마우스 좌표가 아예 없거나 X축 라벨(날짜)이 비어있다면 무시합니다.
        if (!e || !e.activeLabel) {
            return;
        }

        // 4. [핵심 수선]: activePayload에만 의존하지 않고, Recharts가 격자 전체를 기준으로 잡아준
        // 정확한 X축 키값인 activeLabel(날짜 문자열)을 타겟으로 고정합니다.
        const hoveredDate = String(e.activeLabel);

        // 5. 🎯 마우스가 특정 날짜(봉) 위에서 0.7초(700ms) 동안 멈추었을 때만 관제탑 승인!
        tooltipTimerRef.current = setTimeout(() => {
            setApprovedTooltipDate(hoveredDate);
        }, 700);
    };

    // 마우스가 차트 영역을 아예 완전히 벗어났을 때
    const handleChartMouseLeave = () => {
        // 차트를 벗어나면 작동 중인 타이머를 즉시 파괴하고 툴팁 스코프를 완전히 닫습니다.
        if (tooltipTimerRef.current) {
            clearTimeout(tooltipTimerRef.current);
        }
        setApprovedTooltipDate(null);
    };

    // 1. 캔들 데이터 가공 (시가, 종가 몸통 및 고가, 저가 꼬리 정의)

    const formattedData = useMemo(() => {
        return chartDataList.map((item) => {
            // 🎯 1. 시가와 종가가 완전히 같은지 체크 (보합/십자봉 조건)
            const isDoji = item.open === item.close;

            // 🎯 2. 정렬된 배열을 만들되, 같을 경우 상단 값에 미세한 버퍼(+1)를 더해 Recharts 엔진을 깨웁니다.
            const sortedOpenClose = [item.open, item.close].sort((a, b) => a - b);
            if (isDoji) {
                sortedOpenClose[1] = sortedOpenClose[1] + 1; // [54000, 54001] 형태로 만들어 0을 방어!
            }

            const node = {
                ...item,
                isUp: item.close >= item.open,
                openClose: sortedOpenClose, // 💡 보정된 배열 주입
                highLow: [item.low, item.high]
            };

            // 🎯 백엔드에서 null이 넘어왔거나 0으로 오염된 경우 sma60 속성 자체를 제거합니다.
            if (node.sma60 === null || node.sma60 === undefined || node.sma60 === 0) {
                delete node.sma60;
            }

            return node;
        });
    }, [chartDataList]);

    // 🕵️‍♂️ [체크포인트 2]: 가공 배열에 openClose 등이 정상 탑재되었는지 확인
    console.log("2️⃣ 차트에 주입될 가공 리스트 (formattedData):", formattedData);

    // 🎯 [Brush 설정용 인덱스 계산] 전체 데이터 중 '최근 30개'만 초기 영역으로 잡습니다.
    // 2️⃣ [안전한 상태 선언] 지연 초기화를 통해 totalCount가 잡힌 후 정확한 인덱스로 시작하게 만듭니다.
    // 🎯 [교정]: 기존의 activeIndex 상태를 유지하되, 실시간 데이터 증가에 대응할 수 있도록 베이스를 다집니다.
    const [activeIndex, setActiveIndex] = useState<{ startIndex: number; endIndex: number }>({
        startIndex: 0,
        endIndex: 29 // 최초 30개 기본 표시 영역 (데이터가 없을 때를 대비한 기본값)
    });

    // 🔄 데이터(chartDataList)가 백엔드로부터 실시간으로 추가될 때, 
    // 유저가 스크롤바를 수동으로 만지지 않았다면 자동으로 스크롤바가 우측 끝(최신 봉)을 따라오게 만드는 로직
    useEffect(() => {
        if (chartDataList.length === 0) return;

        setActiveIndex((prev) => {
            // 유저가 이미 스크롤바를 조작해서 범위를 좁혀둔 상태라면 자동으로 움직이지 않고 유저의 선택을 존중합니다.
            const currentRange = prev.endIndex - prev.startIndex + 1;

            // 초기 상태이거나, 스크롤바가 끝에 닿아있는 상태에서 데이터가 늘어난 것이라면 우측 끝으로 밀어줍니다.
            const isAtEnd = prev.endIndex >= chartDataList.length - 2;
            if (prev.startIndex === 0 && prev.endIndex === 29 || isAtEnd) {
                const defaultStart = Math.max(0, chartDataList.length - 30);
                return {
                    startIndex: defaultStart,
                    endIndex: chartDataList.length - 1
                };
            }
            return prev;
        });
    }, [chartDataList.length]); // 💡 데이터 개수가 늘어날 때마다 자동 전진 유도

    // 3️⃣ [브러쉬 변경 핸들러] 브러쉬를 움직일 때 작동할 액션 추가
    // 🎯 최소 30개 미만 제한 가드 핸들러 (activeIndex 버전)
    const handleBrushChange = (e: any) => {
        if (!e || typeof e.startIndex !== 'number' || typeof e.endIndex !== 'number') return;

        const currentRange = e.endIndex - e.startIndex + 1;
        const MIN_PINS = 30; // 30개 이하로 줄어들지 않게 제한==============================================================

        if (currentRange < MIN_PINS) {
            // [케이스 A]: 오른쪽 유저바를 왼쪽으로 밀 때
            if (e.startIndex === activeIndex.startIndex) {
                const safeEnd = Math.min(formattedData.length - 1, e.startIndex + MIN_PINS - 1);
                setActiveIndex({ startIndex: e.startIndex, endIndex: safeEnd });
            }
            // [케이스 B]: 왼쪽 유저바를 오른쪽으로 밀 때
            else if (e.endIndex === activeIndex.endIndex) {
                const safeStart = Math.max(0, e.endIndex - MIN_PINS + 1);
                setActiveIndex({ startIndex: safeStart, endIndex: e.endIndex });
            }
            else {
                return; // 범위 이탈 시 변경 무시
            }
        } else {
            // 30개 이상일 때는 정상 반영
            setActiveIndex({ startIndex: e.startIndex, endIndex: e.endIndex });
        }
    };

    // 2. 현재 차트 데이터 범위 내 실시간 최적 Y축 스케일 계산 (0.95 / 1.05 공식)
    const yAxisDomains = useMemo(() => {
        if (chartDataList.length === 0) {
            return {
                stockMin: 0, stockMax: 100000, rsiMin: 0, rsiMax: 100, macdMin: -100, macdMax: 100,
                obvMin: 0, obvMax: 100000000, sigmaMin: -6, sigmaMax: 6, adxMin: 0, adxMax: 100, dmiMin: 0, dmiMax: 100,
                cciMin: -200, cciMax: 200
            };
        }
        // 🔥 [핵심 변경] 전체 데이터가 아니라, 현재 Brush가 선택한 범위의 데이터만 잘라냅니다.
        const visibleData = chartDataList.slice(activeIndex.startIndex, activeIndex.endIndex + 1);
        const visibleFormatted = formattedData.slice(activeIndex.startIndex, activeIndex.endIndex + 1);

        // A. 1층 주가 및 이평선 수치 종합 (high, low, sma05, sma20, sma60)
        const stockValues: number[] = [];
        visibleData.forEach(item => {
            stockValues.push(item.high, item.low, item.open, item.close);
            // 🎯 [수정]: sma05,sma20,sma60이 존재하고 값이 0이 아닐 때만 Y축 계산 배열에 포함시킵니다.
            if (item.sma05 && item.sma05 !== 0) stockValues.push(item.sma05);
            if (item.sma20 && item.sma20 !== 0) stockValues.push(item.sma20);
            if (item.sma60 && item.sma60 !== 0) stockValues.push(item.sma60);
        });
        const sMin = stockValues.length > 0 ? Math.min(...stockValues) : 0;
        const sMax = stockValues.length > 0 ? Math.max(...stockValues) : 100000;

        // B. 2층 RSI, MFI 수치 종합(chartDataList ➡️ visibleData로 변경)
        const rsiValues = visibleData.map(item => item.rsi).filter((v): v is number => v !== undefined);
        const mfiValues = visibleData.map(item => item.mfi).filter((v): v is number => v !== undefined);
        // 💡 [수정] RSI와 MFI 수치 전체를 아울러서 최소/최고 계산
        const combinedrsimfiValues = [...rsiValues, ...mfiValues];
        const rMin = combinedrsimfiValues.length > 0 ? Math.min(...combinedrsimfiValues) : 30;
        const rMax = combinedrsimfiValues.length > 0 ? Math.max(...combinedrsimfiValues) : 70;

        // C. 2층 MACD 수치 종합(chartDataList ➡️ visibleData로 변경)
        const macdValues = visibleData.map(item => item.macd).filter((v): v is number => v !== undefined);
        const mMin = macdValues.length > 0 ? Math.min(...macdValues) : -10;
        const mMax = macdValues.length > 0 ? Math.max(...macdValues) : 10;

        // D. 3층 OBV 수치 종합(chartDataList ➡️ visibleData로 변경)
        const obvValues = visibleData.map(d => d.obv).filter((v): v is number => v !== undefined);
        const oMin = obvValues.length > 0 ? Math.min(...obvValues) : 0;
        const oMax = obvValues.length > 0 ? Math.max(...obvValues) : 1000000;

        // D. 3층 SIGMA 수치 종합(chartDataList/formattedData ➡️ visibleData/visibleFormatted로 변경)
        const sigmaValues = visibleData.map(d => d.sigma).filter((v): v is number => v !== undefined);
        const cciRaw = visibleFormatted.map(item => item.cci).filter((v): v is number => v !== undefined && v !== null);
        const cciSigRaw = visibleFormatted.map(item => item.cciSignal).filter((v): v is number => v !== undefined && v !== null);
        const combinesigmaccidValues = [...sigmaValues, ...cciRaw, ...cciSigRaw];
        const gMin = combinesigmaccidValues.length > 0 ? Math.min(...combinesigmaccidValues) : -3;
        const gMax = combinesigmaccidValues.length > 0 ? Math.max(...combinesigmaccidValues) : 3;

        // 🎯 E. 4층 ADX, DI+, DI- 수치 종합 (formattedData ➡️ visibleFormatted로 변경)
        const adxValues = visibleFormatted.map(item => item.adx).filter((v): v is number => v !== undefined && v !== null);
        const aMin = adxValues.length > 0 ? Math.max(0, Math.min(...adxValues)) : 0;
        const aMax = adxValues.length > 0 ? Math.min(100, Math.max(...adxValues)) : 100;

        // 🎯 E. 4층 ADX, DI+, DI- 수치 종합 (formattedData ➡️ visibleFormatted로 변경)
        const diPlusRaw = visibleFormatted.map(item => item.diPlus).filter((v): v is number => v !== undefined && v !== null);
        const diMinusRaw = visibleFormatted.map(item => item.diMinus).filter((v): v is number => v !== undefined && v !== null);
        const combineddipValues = [...diPlusRaw, ...diMinusRaw];
        const dMin = combineddipValues.length > 0 ? Math.max(0, Math.min(...combineddipValues)) : 0;
        const dMax = combineddipValues.length > 0 ? Math.min(100, Math.max(...combineddipValues)) : 100;

        // // 🌀 [신규 동적연산] 4층 우측 배치될 CCI 및 CCI Signal 스케일 확보
        // const cciRaw = visibleFormatted.map(item => item.cci).filter((v): v is number => v !== undefined && v !== null);
        // const cciSigRaw = visibleFormatted.map(item => item.cciSignal).filter((v): v is number => v !== undefined && v !== null);
        // const combinedCciValues = [...cciRaw, ...cciSigRaw];
        // // 과매수/과매도 절대 경계선인 -100, 100이 차트에 늘 잡히도록 기초 가드라인 도킹
        // const cMin = combinedCciValues.length > 0 ? Math.min(...combinedCciValues, -100) : -100;
        // const cMax = combinedCciValues.length > 0 ? Math.max(...combinedCciValues, 100) : 100;

        // 🎯 최소값 * 0.95 / 최대값 * 1.05 동적 비율 스케일 적용

        return {
            // 1층 주가 및 이평선 (0.95 / 1.05 공식 적용)
            stockMin: Math.floor(sMin * 0.95),
            stockMax: Math.ceil(sMax * 1.05),

            // 2층 RSI & MFI 공용 패널 (25~75 기준 패딩 가드 적용)
            // rsiMin: Math.max(0, Math.floor(Math.min(rMin, 25) * 0.95)),
            // rsiMax: Math.min(100, Math.ceil(Math.max(rMax, 75) * 1.05)),
            rsiMin: Math.max(0, Math.floor(rMin - (rMax - rMin) * 0.1)), // 하단 10% 여백
            rsiMax: Math.min(100, Math.ceil(rMax + (rMax - rMin) * 0.1)), // 상단 10% 여백

            // 2층 MACD 독립 패널 (양수/음수 방향성 고려)
            // macdMin: mMin < 0 ? Math.floor(mMin * 1.05) : Math.floor(mMin * 0.95),
            // macdMax: mMax > 0 ? Math.ceil(mMax * 1.05) : Math.ceil(mMax * 0.95),
            macdMin: Math.floor(mMin - Math.abs(mMax - mMin) * 0.1),
            macdMax: Math.ceil(mMax + Math.abs(mMax - mMin) * 0.1),

            // 3층 OBV 패널 (절대값 패딩 반영)
            // obvMin: Math.floor(oMin - Math.abs(oMin * 0.05)),
            // obvMax: Math.ceil(oMax + Math.abs(oMax * 0.05)),
            obvMin: Math.floor(oMin - Math.abs(oMax - oMin) * 0.05),
            obvMax: Math.ceil(oMax + Math.abs(oMax - oMin) * 0.05),

            // 기존에 MACD 변수인 mMin, mMax를 기준으로 삼던 오타를 시그마 기준 변수인 gMin, gMax로 완벽하게 교정했습니다.
            // sigmaMin: gMin < 0 ? Math.floor(gMin * 1.05) : Math.floor(gMin * 0.95),
            // sigmaMax: gMax > 0 ? Math.ceil(gMax * 1.05) : Math.ceil(gMax * 0.95),
            sigmaMin: Math.floor(gMin - Math.abs(gMax - gMin) * 0.1),
            sigmaMax: Math.ceil(gMax + Math.abs(gMax - gMin) * 0.1),

            // 🎯 4층 ADX & DMI 패널 (RSI와 동일한 구조로 25~75 기본 가드 적용하여 형식 통일)
            adxMin: Math.max(0, Math.floor(aMin - (aMax - aMin) * 0.1)), // 하단 10% 여백 (최소 0 제한)
            adxMax: Math.min(100, Math.ceil(aMax + (aMax - aMin) * 0.1)), // 상단 10% 여백 (최대 100 제한)

            // 🎯 4층 ADX & DMI 패널 (RSI와 동일한 구조로 25~75 기본 가드 적용하여 형식 통일)
            dmiMin: Math.max(0, Math.floor(dMin - (dMax - dMin) * 0.1)), // 하단 10% 여백 (최소 0 제한)
            dmiMax: Math.min(100, Math.ceil(dMax + (dMax - dMin) * 0.1)), // 상단 10% 여백 (최대 100 제한)

            // // 🌀 CCI 패딩 마진 적용 완료
            // cciMin: Math.floor(cMin - Math.abs(cMax - cMin) * 0.1), // 최솟값 아래로 10% 더 밀어냄
            // cciMax: Math.ceil(cMax + Math.abs(cMax - cMin) * 0.1)   // 최댓값 위로 10% 더 밀어냄
        };

        // 🔥 [중요] useMemo 의존성 배열에 activeIndex를 반드시 추가해야 브러쉬 스크롤 시 실시간 재연산됩니다!
    }, [formattedData, chartDataList, activeIndex]);

    return (
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
                📊 Recharts 통합 트레이딩 멀티 대시보드
            </h4>

            {chartDataList.length === 0 ? (
                <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>
                    ⏳ 시뮬레이션을 가동하면 이곳에 통합 멀티 차트가 그려집니다.
                </div>
            ) : (
                <div>
                    {/* ------------------------------------------------------------ */}
                    {/* 📈 [1층] 메인 주가 영역 (컬러 캔들스틱 + 고저 바늘선 최종 완공)    */}
                    {/* ------------------------------------------------------------ */}
                    <ResponsiveContainer width="100%" height={240}>
                        {/* 고저바늘선과 주가봉을 합체하자면 같은 <Bar>콤포넌트 이므로 barGap={-5} 인수가 들어가야 한다 */}
                        <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} barGap={-5} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove}
                            onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}>  // 🎯 [핵심 추가] 타입 에러 없이 마우스 이벤트 유실을 완벽히 막아줍니다!
                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                            <XAxis dataKey="date" type="category" tick={{ fill: '#6c757d', fontSize: 9 }} padding={{ left: 10, right: 10 }} />

                            <YAxis yAxisId="stock-axis" width={50} type="number" domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]}
                                tick={{ fill: '#495057', fontSize: 10, fontWeight: 'bold' }}
                                tickFormatter={(value) => { if (value === 0) return '0'; return `${(value / 1000).toFixed(0)}K`; }}
                            />

                            {/* 👈 2. [우측 Y축]: 실제 주가 및 이평선 데이터가 매핑될 메인 축 */}
                            <YAxis
                                yAxisId="stock-axis-right" // 💡 ID를 right로 명확히 구분
                                width={50}
                                type="number"
                                orientation="right"        // 💡 우측으로 이동
                                domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]}
                                // allowDataOverflow={false}
                                tick={{ fill: '#495057', fontSize: 10, fontWeight: 'bold' }}
                                tickFormatter={(value) => { if (value === 0) return '0'; return `${(value / 1000).toFixed(0)}K`; }}
                                stroke="#37474f"
                            />

                            <Tooltip
                                shared={true}
                                cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

                                // 🎯 1층 고유의 캔들스틱(주가 봉) 및 이평선 커스텀 포맷팅을 content 안에서 완벽히 처리합니다.
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;

                                    const currentData = payload[0].payload;

                                    // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 켜고 은폐
                                    if (currentData.date !== approvedTooltipDate) {
                                        return null;
                                    }

                                    const { open, close, high, low, sma05, sma20, sma60 } = currentData;

                                    // 🛠️ 이평선 수치 가드 및 포맷팅 분기 처리
                                    const sma05Text = (sma05 && sma05 !== 0) ? `${Math.round(sma05).toLocaleString()}원` : "계산 중...";
                                    const sma20Text = (sma20 && sma20 !== 0) ? `${Math.round(sma20).toLocaleString()}원` : "계산 중...";
                                    const sma60Text = (sma60 && sma60 !== 0) ? `${Math.round(sma60).toLocaleString()}원` : "축적 중...";

                                    return (
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            padding: '12px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            pointerEvents: 'none'
                                        }}>
                                            {/* 📅 상단 동기화 날짜 표시 */}
                                            <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textAlign: 'center' }}>
                                                {currentData.date}
                                            </div>

                                            {/* 📊 주가 및 이평선 통합 레이아웃 */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#333', fontSize: '11px' }}>
                                                {/* 🎯 이평선 3형제 상단 배치 */}
                                                <div style={{ color: '#cf1919', fontWeight: 'bold' }}>SMA 05 : {sma05Text}</div>
                                                <div style={{ color: '#ff9500', fontWeight: 'bold' }}>SMA 20 : {sma20Text}</div>
                                                <div style={{ color: '#192bcf', fontWeight: 'bold' }}>SMA 60 : {sma60Text}</div>

                                                {/* 구분선 */}
                                                <hr style={{ border: '0', borderTop: '1px solid #dee2e6', margin: '4px 0' }} />

                                                {/* 주가 데이터 데이터 정보 하단 배치 (원화 포맷팅) */}
                                                {open !== undefined && (
                                                    <>
                                                        <div>시가 : {Math.round(open).toLocaleString()}원</div>
                                                        <div>종가 : {Math.round(close).toLocaleString()}원</div>
                                                        <div>고가 : {Math.round(high).toLocaleString()}원</div>
                                                        <div>저가 : {Math.round(low).toLocaleString()}원</div>
                                                    </>
                                                )}

                                                {/* 주가 봉 외에 호가나 다른 지표 데이터가 추가로 패이로드에 섞여 들어올 경우를 대비한 가드 */}
                                                {payload.map((entry: any, index: number) => {
                                                    if (["주가 봉", "주가", "SMA 05", "SMA 20", "SMA 60"].includes(entry.name)) return null;
                                                    return (
                                                        <div key={index} style={{ color: entry.color, marginTop: '2px' }}>
                                                            {entry.name} : {typeof entry.value === 'number' ? `${Math.round(entry.value).toLocaleString()}원` : entry.value}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />

                            {/* 1️⃣ [고저 바늘핀 구현]: high와 low 사이를 수직선으로 이어주는 얇은 막대 */}
                            <Bar
                                name="고저 바늘선"
                                dataKey="highLow" //{(entry) => [entry.low, entry.high]} 저가와 고가 사이의 범위를 지정 (배열 형태)
                                yAxisId="stock-axis-right" // 👈 우측 축 ID로 변경
                                barSize={1.5} // 선처럼 보여야 하므로 두께를 1px(또는 2px)로 아주 얇게 설정
                                //stackId="stock"       // 💡 중요: 몸통 Bar와 같은 ID를 주어 x축 중심점을 강제로 일치시킵니다
                                tooltipType="none" // 💡 툴팁에서 '고저 바늘선: NaN'이 출력되지 않도록 완전히 차단!
                                legendType="none"  // 💡 차트 범례 목록(Legend)에서 이 Bar를 완벽히 숨김!
                            >
                                {formattedData.map((entry: any, index: number) => {
                                    const isUp = entry.close >= entry.open;
                                    return (
                                        <Cell
                                            key={`needle-${index}`}
                                            // 주가 봉 색상과 맞춰주거나, 차분한 챠콜 그레이(#495057)로 통일할 수 있습니다.
                                            fill={isUp ? '#dc3545' : '#007bff'}
                                            stroke={isUp ? '#dc3545' : '#007bff'}
                                        />
                                    );
                                })}
                            </Bar>

                            {/* 2️⃣ [양봉/음봉 컬러 몸통 막대 그리기]: 종가(close) 기준으로 100% 깔끔하게 사각형 박스를 안착시킵니다. */}
                            <Bar
                                name="주가 봉"
                                dataKey="openClose"
                                yAxisId="stock-axis-right" // 👈 우측 축 ID로 변경
                                //stackId="stock"       // 💡 중요: 바늘핀과 동일한 stackId를 부여합니다.
                                barSize={10}
                            //shape={<CandlestickShape />} // 🎯 [핵심 추가]: 시가=종가 방어 로직이 들어간 커스텀 셰이프를 연결합니다!
                            >
                                {formattedData.map((entry: any, index: number) => {
                                    const isUp = entry.close >= entry.open; // 종가가 시가보다 높으면 양봉(레드), 낮으면 음봉(블루)
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={isUp ? '#dc3545' : '#007bff'}
                                            stroke={isUp ? '#dc3545' : '#007bff'}
                                        />
                                    );
                                })}
                            </Bar>

                            {/* 실시간 5일, 20일 이동평균선 파이프라인 */}
                            <Line yAxisId="stock-axis-right" name="SMA 05" type="monotone" dataKey="sma05" stroke="#cf1919" dot={false} strokeWidth={1.5} connectNulls />
                            <Line yAxisId="stock-axis-right" name="SMA 20" type="monotone" dataKey="sma20" stroke="#ff9500" dot={false} strokeWidth={1.5} connectNulls />
                            <Line yAxisId="stock-axis-right" name="SMA 60" type="monotone" dataKey="sma60" connectNulls={false} stroke="#192bcf" dot={false} strokeWidth={1.5} />
                        </ComposedChart>
                    </ResponsiveContainer>

                    <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

                    {/* ------------------------------------------------------------ */}
                    {/* 🧬 [2층] 보조 지표 영역 (좌: RSI, MFI % 기준선 | 우: MACD 볼륨 에너지)   */}
                    {/* ------------------------------------------------------------ */}
                    <h5 style={{ margin: '0 0 5px 5px', fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>🧬 보조지표 패널 A (좌: RSI,MFI선 | 우: MACD선)</h5>
                    <ResponsiveContainer width="100%" height={150}>
                        <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove}
                            onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}> // 🎯 [1층 연동] 마우스 트래킹 유실 원천 차단
                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                            <XAxis dataKey="date" type="category" tick={{ fill: '#6c757d', fontSize: 9 }} padding={{ left: 10, right: 10 }} hide />

                            {/* 좌측 Y축: RSI 전용 실시간 최적화 축 */}
                            <YAxis
                                yAxisId="left-rsi"  // 0~100 범위를 MFI와 공유합니다.
                                width={50}
                                orientation="left"
                                domain={[yAxisDomains.rsiMin, yAxisDomains.rsiMax]}
                                tickCount={5}
                                tick={{ fill: '#2cc54d', fontSize: 9, fontWeight: 'bold' }}
                            />

                            {/* 우측 Y축: MACD 전용 실시간 최적화 축 */}
                            <YAxis
                                yAxisId="right-macd"
                                width={50}
                                orientation="right"
                                domain={[yAxisDomains.macdMin, yAxisDomains.macdMax]}
                                tickCount={5}
                                tick={{ fill: '#748cab', fontSize: 9 }}
                                tickFormatter={(value) => { if (value === 0) return '0'; return `${(value / 1000).toFixed(0)}K`; }}
                            />

                            <Tooltip
                                shared={true}
                                cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

                                // 🎯 content 내부에서 0.7초 검문 및 2층 지표 반올림(Round) 포맷팅을 일괄 처리합니다.
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;

                                    const currentData = payload[0].payload;

                                    // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 켜고 은폐
                                    if (currentData.date !== approvedTooltipDate) {
                                        return null;
                                    }

                                    return (
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            padding: '12px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            pointerEvents: 'none'
                                        }}>
                                            {/* 📅 상단 동기화 날짜 표시 */}
                                            <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', textAlign: 'center' }}>
                                                {currentData.date}
                                            </div>

                                            {/* 📈 2층 보조지표 목록 렌더링 루프 (RSI, MFI, r-MACD) */}
                                            {payload.map((entry: any, index: number) => {
                                                const indicatorName = entry.name ? String(entry.name) : "";
                                                let displayedValue = entry.value;

                                                // 🎯 [기존 formatter 로직 완벽 이식]: 
                                                // 숫자가 존재할 경우 정수로 반올림(Math.round)한 뒤 세 자릿수 콤마 처리
                                                if (typeof displayedValue === 'number') {
                                                    displayedValue = Math.round(displayedValue).toLocaleString();
                                                }

                                                return (
                                                    <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
                                                        {indicatorName} : {displayedValue}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />

                            {/* RSI(70,30),MFI(80,20) 투자 판단 가이드 점선 가동 */}
                            <ReferenceLine yAxisId="left-rsi" y={80} stroke="#dc3545" strokeDasharray="3 3" label={{ value: '80 과열', fill: '#dc3545', fontSize: 8, position: 'insideRight' }} />
                            <ReferenceLine yAxisId="left-rsi" y={20} stroke="#007bff" strokeDasharray="3 3" label={{ value: '20 침체', fill: '#007bff', fontSize: 8, position: 'insideRight' }} />
                            {/* MACD  투자 판단 가이드 점선 가동 */}
                            <ReferenceLine yAxisId="right-macd" y={0} stroke="#748cab" strokeDasharray="3 3" label={{ value: '0 macd', fill: '#748cab', fontSize: 8, position: 'insideRight' }} />

                            {/* RSI 밴드 추세선 */}
                            <Line yAxisId="left-rsi" name="RSI (%)" type="monotone" dataKey="rsi" stroke="#2cc54d" dot={false} strokeWidth={1.5} connectNulls={false} />

                            {/* 💡 [추가] MFI 자금흐름 */}
                            <Line yAxisId="left-rsi" name="MFI (자금흐름)" type="monotone" dataKey="mfi" stroke="#e83e8c" dot={false} strokeWidth={1.5} connectNulls={false} />

                            {/* MACD 밴드 추세선 */}
                            <Line yAxisId="right-macd" name="r-MACD" type="monotone" dataKey="macd" stroke="#2c3bc5" dot={false} strokeWidth={1.5} connectNulls={false} />
                        </ComposedChart>
                    </ResponsiveContainer>

                    <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

                    {/* ------------------------------------------------------------ */}
                    {/* 🧬 [3층] 보조 지표 영역 (좌: SIGMA, CCI 변동성, 우: OBV 볼륨 에너지)   */}
                    {/* ------------------------------------------------------------ */}
                    <h5 style={{ margin: '0 0 5px 5px', fontSize: '11px', color: '#6c757d', fontWeight: 'bold' }}>
                        🧬 보조지표 패널 B (좌: SIGMA, CCI변동성 | 우: OBV 에너지)</h5>
                    <ResponsiveContainer width="100%" height={150}>
                        <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove}
                            onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}> // 🎯 [1층 연동] 마우스 트래킹 유실 원천 차단
                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                            <XAxis dataKey="date" type="category" tick={{ fill: '#6c757d', fontSize: 9 }} padding={{ left: 10, right: 10 }} hide />

                            {/* 우측: OBV 전용 우측 Y축 */}
                            <YAxis
                                yAxisId="right-obv"
                                width={50}
                                orientation="right"
                                domain={[yAxisDomains.obvMin, yAxisDomains.obvMax]}
                                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} // 소수점 한 자리까지 챙겨 가독성 확보
                                style={{ fontSize: 9, fill: '#9b59b6' }}
                            />

                            {/* 좌: SIGMA, CCI 변동성 실선) - 스위치 연동 */}
                            <YAxis
                                yAxisId="left-sigma"
                                width={50}
                                domain={[-3, 3]} // 💡 표준편차 상하한선 범위 확정
                                ticks={[-1, 0, 1]} // 과열(+1), 기준선(0), 과매도(-1) 가이드라인
                                orientation="left"
                                style={{ fontSize: 9, fill: '#595bb6' }}
                            />

                            {/* 🛠️ [누락 버그 수선]: CCI 라인이 터지지 않도록 숨겨진 CCI 전용 가상 Y축 정의 */}
                            {/* <YAxis
                                yAxisId="cci-axis"
                                domain={[-250, 250]}
                                hide // 레이아웃 스케일을 무너뜨리지 않도록 축 자체는 은폐합니다.
                            /> */}

                            <Tooltip
                                shared={true}
                                cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

                                // 🎯 content 내부에서 0.7초 검문 및 지표 포맷팅을 일괄 처리합니다. (formatter는 제거)
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;

                                    const currentData = payload[0].payload;

                                    // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 보여주고 은폐
                                    if (currentData.date !== approvedTooltipDate) {
                                        return null;
                                    }

                                    return (
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            padding: '12px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            pointerEvents: 'none'
                                        }}>
                                            {/* 📅 상단 동기화 날짜 표시 */}
                                            <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', textAlign: 'center' }}>
                                                {currentData.date}
                                            </div>

                                            {/* 📈 보조지표 목록 렌더링 루프 */}
                                            {payload.map((entry: any, index: number) => {
                                                const indicatorName = entry.name ? String(entry.name) : "";
                                                let displayedValue = entry.value;

                                                // 🎯 [포맷팅 이식 1]: SIGMA 지표일 때 소수점 1자리 고정
                                                if (indicatorName.includes("SIGMA")) {
                                                    displayedValue = Number(entry.value).toFixed(1);
                                                }

                                                // 🎯 [포맷팅 이식 2]: OBV 지표일 때 100만 단위(M) 축약 및 정수 반올림 표시
                                                else if (indicatorName.includes("OBV")) {
                                                    const millionValue = Number(entry.value) / 1000000;
                                                    displayedValue = `${millionValue.toLocaleString(undefined, {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0
                                                    })}M`;
                                                }

                                                // 🎯 그 외 기본 지표일 때 세 자릿수 콤마 포맷팅 기본 적용
                                                else if (typeof displayedValue === 'number') {
                                                    displayedValue = displayedValue.toLocaleString();
                                                }

                                                return (
                                                    <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
                                                        {indicatorName} : {displayedValue}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />

                            {/* SIGMA +1.0 위험 과열선 */}
                            <ReferenceLine yAxisId="left-sigma" y={1} stroke="#dc3545" strokeDasharray="3 3" label={{ value: '+1σ 과열', fill: '#dc3545', fontSize: 9, position: 'insideRight' }} />
                            {/* SIGMA -1.0 위험 과매도선 */}
                            <ReferenceLine yAxisId="left-sigma" y={-1} stroke="#28a745" strokeDasharray="3 3" label={{ value: '-1σ 과매도', fill: '#28a745', fontSize: 9, position: 'insideRight' }} />

                            {/* CCI 기준선 가동 */}
                            <ReferenceLine yAxisId="cci-axis" y={100} stroke="#ff4d4f" strokeDasharray="3 3" strokeWidth={1.2} label={{ value: '+100 과열', position: 'insideLeft', fill: '#ff4d4f', fontSize: 8 }} />
                            <ReferenceLine yAxisId="cci-axis" y={-100} stroke="#1890ff" strokeDasharray="3 3" strokeWidth={1.2} label={{ value: '-100 침체', position: 'insideLeft', fill: '#1890ff', fontSize: 8 }} />

                            {/* OBV 실선 그래프 */}
                            <Line yAxisId="right-obv" name="OBV (거래량)" type="monotone" dataKey="obv" stroke="#9b59b6" dot={false} strokeWidth={1.5} connectNulls={false} />

                            {/* SIGMA 실선 렌더링 */}
                            <Line yAxisId="left-sigma" name="SIGMA (변동성)" type="monotone" dataKey="sigma" stroke="#007bff" dot={false} strokeWidth={2} connectNulls={false} />

                            {/* CCI 형제 그래프 연결선 */}
                            <Line name="CCI" yAxisId="cci-axis" type="monotone" dataKey="cci" stroke="#ec1818" strokeWidth={1.8} dot={false} connectNulls />
                            <Line name="CCI 시그널" yAxisId="cci-axis" type="monotone" dataKey="cciSignal" stroke="#c21388" strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls />
                        </ComposedChart>
                    </ResponsiveContainer>

                    <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

                    {/* ------------------------------------------------------------ */}
                    {/* 📊 [4층] 병렬 듀얼 패널 (좌측: CCI | 우측: ADX/DMI 시스템)    */}
                    {/* ------------------------------------------------------------ */}
                    <h5 style={{ margin: '10px 0 5px 0', fontSize: '12px', color: '#495057', fontWeight: 'bold' }}>
                        🧬 보조지표 패널 C (좌:   | 우: ADX/DMI)
                    </h5>
                    <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={formattedData} syncId="stockTooltipSync" margin={{ top: 10, right: 1, left: 1, bottom: 5 }} onMouseMove={handleChartMouseMove}
                            onMouseLeave={handleChartMouseLeave} accessibilityLayer={true}> // 🎯 [전 층 동기화] 마지막 패널까지 미끄러짐 방지 주입
                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                            <XAxis dataKey="date" type="category" tick={false} tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />

                            <YAxis
                                yAxisId="adx-axis-left"
                                width={50}
                                type="number"
                                orientation="left" // 오른쪽 배치 레이아웃에 맞춰 오른쪽에 수치 표기
                                domain={[yAxisDomains.adxMin, yAxisDomains.adxMax]}
                                tick={{ fill: '#fa8c16', fontSize: 9 }}
                                tickFormatter={(val) => Math.round(val).toString()}
                            />

                            <YAxis
                                yAxisId="adx-axis-right"
                                width={50}
                                type="number"
                                orientation="right" // 오른쪽 배치 레이아웃에 맞춰 오른쪽에 수치 표기
                                domain={[yAxisDomains.dmiMin, yAxisDomains.dmiMax]}
                                tick={{ fill: '#fa8c16', fontSize: 9 }}
                                tickFormatter={(val) => Math.round(val).toString()}
                                stroke="#37474f"
                            />

                            <Tooltip
                                shared={true}
                                cursor={{ stroke: '#adb5bd', strokeWidth: 1, strokeDasharray: '3 3' }}

                                // 🎯 content 내부에서 0.7초 검문 및 4층 지표 소수점 1자리(toFixed) 포맷팅을 일괄 처리합니다.
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;

                                    const currentData = payload[0].payload;

                                    // 🎯 [0.7초 검문소]: 관제탑 타이머를 통과한 날짜가 아니면 수직 점선만 켜고 은폐
                                    if (currentData.date !== approvedTooltipDate) {
                                        return null;
                                    }

                                    return (
                                        <div style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            padding: '12px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            pointerEvents: 'none'
                                        }}>
                                            {/* 📅 상단 동기화 날짜 표시 */}
                                            <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px', textAlign: 'center' }}>
                                                {currentData.date}
                                            </div>

                                            {/* 📈 4층 보조지표 목록 렌더링 루프 (ADX, DI+, DI-) */}
                                            {payload.map((entry: any, index: number) => {
                                                // Brush 데이터가 툴팁 타겟에 잡혀 들어오는 예외를 방어합니다.
                                                if (entry.dataKey === 'date') return null;

                                                const indicatorName = entry.name ? String(entry.name) : "";
                                                let displayedValue = entry.value;

                                                // 🎯 [기존 formatter 로직 완벽 이식]: 
                                                // 숫자가 존재할 경우 소수점 1자리 고정 및 세 자릿수 콤마(toLocaleString) 처리
                                                if (typeof displayedValue === 'number') {
                                                    displayedValue = Math.round(displayedValue).toLocaleString();
                                                }

                                                return (
                                                    <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
                                                        {indicatorName} : {displayedValue}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />

                            {/* DI 20 침체선, DI 50 과열선 */}
                            <ReferenceLine yAxisId="adx-axis-right" y={50} stroke="#ff4d4f" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '강세 50', position: 'insideRight', fill: '#ff4d4f', fontSize: 11 }} />
                            <ReferenceLine yAxisId="adx-axis-right" y={20} stroke="#1890ff" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '약세 20', position: 'insideRight', fill: '#1890ff', fontSize: 11 }} />

                            {/* 📉 DI+ (추세 상승 동력 - 녹색), 📈DI- (추세 하락 동력 - 분홍/적색), ⚡ ADX (진짜 추세 강도선 - 차분한 다크 네이비 혹은 딥 그레이) */}
                            <Line name="DI+" yAxisId="adx-axis-right" type="monotone" dataKey="diPlus" stroke="#e71d36" dot={false} strokeWidth={1.5} connectNulls />
                            <Line name="DI-" yAxisId="adx-axis-right" type="monotone" dataKey="diMinus" stroke="#2ec4b6" dot={false} strokeWidth={1.5} connectNulls />
                            <Line name="ADX" yAxisId="adx-axis-left" type="monotone" dataKey="adx" stroke="#011627" dot={false} strokeWidth={2} connectNulls />

                            <Brush
                                dataKey="date"
                                height={20}
                                stroke="#8884d8"
                                fill="#fff"
                                startIndex={activeIndex.startIndex} // 💡 고정된 default 변수가 아니라 상태값과 1:1 동기화
                                endIndex={activeIndex.endIndex}     // 💡 상태값과 1:1 동기화
                                onChange={handleBrushChange}        // 💡 움직임 감지 핸들러 연결
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}