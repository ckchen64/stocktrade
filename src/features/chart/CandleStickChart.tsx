import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend,
  Line, Bar, Cell, CartesianGrid, ReferenceLine, Brush
} from 'recharts';
import type { ChartProps } from './types';
import { useYAxisDomains } from './useYAxisDomains';
import { ChartTooltip } from './ChartTooltip';

// 🎯 Props 타입 정의에 selectedIndicators 옵셔널 속성 확장
interface ExtendedChartProps extends ChartProps {
  selectedIndicators?: string[];
}

export default function CandleStickChart({ 
  chartDataList,
  selectedIndicators = ["SMA", "MACD", "RSI", "MFI", "OBV", "SIGMA", "ADX", "CCI", "EOM"] // 🎯 기본값 안전 처리
}: ExtendedChartProps): React.JSX.Element {
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [approvedTooltipDate, setApprovedTooltipDate] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState({ startIndex: 0, endIndex: 29 });

  const handleChartMouseMove = (e: any) => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    if (approvedTooltipDate !== null) setApprovedTooltipDate(null);
    if (!e || !e.activeLabel) return;

    const hoveredDate = String(e.activeLabel);
    tooltipTimerRef.current = setTimeout(() => setApprovedTooltipDate(hoveredDate), 700);
  };

  const handleChartMouseLeave = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setApprovedTooltipDate(null);
  };

  const formattedData = useMemo(() => {
    if (!Array.isArray(chartDataList)) return [];
    
    return chartDataList.map((item) => {
      const isDoji = item.open === item.close;
      const sortedOpenClose = [item.open, item.close].sort((a, b) => a - b);
      if (isDoji) sortedOpenClose[1] += 1;

      const node: any = {
        ...item,
        isUp: item.close >= item.open,
        openClose: sortedOpenClose,
        highLow: [item.low, item.high],
        // 🎯 EOM 지표 안전 보정 (NaN, undefined, null 방지)
        eom: typeof item.eom === 'number' && !isNaN(item.eom) ? item.eom : 0
      };
      if (!node.sma60) delete node.sma60;
      return node;
    });
  }, [chartDataList]);

  useEffect(() => {
    if (!chartDataList || chartDataList.length === 0) return;
    setActiveIndex((prev) => {
      const isAtEnd = prev.endIndex >= chartDataList.length - 2;
      if ((prev.startIndex === 0 && prev.endIndex === 29) || isAtEnd) {
        return {
          startIndex: Math.max(0, chartDataList.length - 30),
          endIndex: chartDataList.length - 1
        };
      }
      return prev;
    });
  }, [chartDataList?.length]);

  const handleBrushChange = (e: any) => {
    if (!e || typeof e.startIndex !== 'number' || typeof e.endIndex !== 'number') return;
    const MIN_PINS = 30;
    if (e.endIndex - e.startIndex + 1 < MIN_PINS) return;
    setActiveIndex({ startIndex: e.startIndex, endIndex: e.endIndex });
  };

  // 🎯 커스텀 훅으로 Y축 동적 스케일 로직 추출
  const yAxisDomains = useYAxisDomains(chartDataList || [], formattedData, activeIndex);

  // safeIndicators 선언으로 미선언 에러 차단
  const safeIndicators = Array.isArray(selectedIndicators) ? selectedIndicators : [];

  return (
    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
        📊 Recharts 통합 트레이딩 멀티 대시보드
      </h4>

      {!chartDataList || chartDataList.length === 0 ? (
        <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>
          ⏳ 시뮬레이션을 가동하면 이곳에 통합 멀티 차트가 그려집니다.
        </div>
      ) : (
        <div>
          {/* 📈 1층: 메인 주가 봉차트 */}
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} barGap={-5} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#6c757d', fontSize: 9 }} />
              <YAxis yAxisId="stock-axis" width={50} domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="stock-axis-right" width={50} orientation="right" domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              
              <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor1" />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />

              <Bar name="고저 바늘선" dataKey="highLow" yAxisId="stock-axis-right" barSize={1.5} tooltipType="none" legendType="none">
                {formattedData.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.close >= entry.open ? '#dc3545' : '#007bff'} />
                ))}
              </Bar>
              <Bar name="주가 봉" dataKey="openClose" yAxisId="stock-axis-right" barSize={10}>
                {formattedData.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.close >= entry.open ? '#dc3545' : '#007bff'} />
                ))}
              </Bar>
              <Line yAxisId="stock-axis-right" name="SMA 05" type="monotone" dataKey="sma05" stroke="#cf1919" dot={false} strokeWidth={1.5} connectNulls />
              <Line yAxisId="stock-axis-right" name="SMA 20" type="monotone" dataKey="sma20" stroke="#ff9500" dot={false} strokeWidth={1.5} connectNulls />
              <Line yAxisId="stock-axis-right" name="SMA 60" type="monotone" dataKey="sma60" stroke="#192bcf" dot={false} strokeWidth={1.5} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

          {/* 🧬 2층: RSI, MFI, MACD 패널 */}
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis yAxisId="left-rsi" width={50} orientation="left" domain={[yAxisDomains.rsiMin, yAxisDomains.rsiMax]} />
              <YAxis yAxisId="right-macd" width={50} orientation="right" domain={[yAxisDomains.macdMin, yAxisDomains.macdMax]} />
              <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor2" />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="left-rsi" name="RSI (%)" type="monotone" dataKey="rsi" stroke="#2cc54d" dot={false} strokeWidth={1.5} />
              <Line yAxisId="left-rsi" name="MFI (자금흐름)" type="monotone" dataKey="mfi" stroke="#e83e8c" dot={false} strokeWidth={1.5} />
              <Line yAxisId="right-macd" name="r-MACD" type="monotone" dataKey="macd" stroke="#2c3bc5" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>

          <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

          {/* 🧬 3층: OBV, SIGMA 패널 */}
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis yAxisId="left-sigma" width={50} domain={[-3, 3]} />
              <YAxis yAxisId="right-obv" width={50} orientation="right" domain={[yAxisDomains.obvMin, yAxisDomains.obvMax]} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor3" />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line yAxisId="right-obv" name="OBV (거래량)" type="monotone" dataKey="obv" stroke="#9b59b6" dot={false} strokeWidth={1.5} />
              <Line yAxisId="left-sigma" name="SIGMA (변동성)" type="monotone" dataKey="sigma" stroke="#007bff" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>

          <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

          {/* 📊 4층: ADX/DMI 패널 + 🎯 EOM 지표 라인 추가 및 Brush */}
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={formattedData} syncId="stockTooltipSync" margin={{ top: 10, right: 1, left: 1, bottom: 5 }} onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={false} />
              <YAxis yAxisId="adx-axis-left" width={50} orientation="left" domain={[yAxisDomains.adxMin, yAxisDomains.adxMax]} />
              <YAxis yAxisId="adx-axis-right" width={50} orientation="right" domain={[yAxisDomains.dmiMin, yAxisDomains.dmiMax]} />
              
              {/* 🎯 EOM 전용 Y축 */}
              <YAxis yAxisId="eom-axis" hide domain={[yAxisDomains.eomMin || -1, yAxisDomains.eomMax || 1]} />
              
              <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor4" />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              
              <Line name="DI+" yAxisId="adx-axis-right" type="monotone" dataKey="diPlus" stroke="#e71d36" dot={false} strokeWidth={1.5} />
              <Line name="DI-" yAxisId="adx-axis-right" type="monotone" dataKey="diMinus" stroke="#2ec4b6" dot={false} strokeWidth={1.5} />
              <Line name="ADX" yAxisId="adx-axis-left" type="monotone" dataKey="adx" stroke="#011627" dot={false} strokeWidth={2} />
              
              {/* 🎯 safeIndicators 참조로 ReferenceError 해결 */}
              {safeIndicators.includes("EOM") && (
                <Line name="EOM" yAxisId="eom-axis" type="monotone" dataKey="eom" stroke="#d97706" dot={false} strokeWidth={1.8} connectNulls />
              )}
              
              <Brush dataKey="date" height={20} startIndex={activeIndex.startIndex} endIndex={activeIndex.endIndex} onChange={handleBrushChange} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}









//구 코드
// import React, { useMemo, useState, useEffect, useRef } from 'react';
// import {
//   ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend,
//   Line, Bar, Cell, CartesianGrid, ReferenceLine, Brush
// } from 'recharts';
// import type { ChartProps } from './types';
// import { useYAxisDomains } from './useYAxisDomains';
// import { ChartTooltip } from './ChartTooltip';

// export default function CandleStickChart({ chartDataList }: ChartProps): React.JSX.Element {
//   const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const [approvedTooltipDate, setApprovedTooltipDate] = useState<string | null>(null);
//   const [activeIndex, setActiveIndex] = useState({ startIndex: 0, endIndex: 29 });

//   const handleChartMouseMove = (e: any) => {
//     if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
//     if (approvedTooltipDate !== null) setApprovedTooltipDate(null);
//     if (!e || !e.activeLabel) return;

//     const hoveredDate = String(e.activeLabel);
//     tooltipTimerRef.current = setTimeout(() => setApprovedTooltipDate(hoveredDate), 700);
//   };

//   const handleChartMouseLeave = () => {
//     if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
//     setApprovedTooltipDate(null);
//   };

//   const formattedData = useMemo(() => {
//     return chartDataList.map((item) => {
//       const isDoji = item.open === item.close;
//       const sortedOpenClose = [item.open, item.close].sort((a, b) => a - b);
//       if (isDoji) sortedOpenClose[1] += 1;

//       const node: any = {
//         ...item,
//         isUp: item.close >= item.open,
//         openClose: sortedOpenClose,
//         highLow: [item.low, item.high]
//       };
//       if (!node.sma60) delete node.sma60;
//       return node;
//     });
//   }, [chartDataList]);

//   useEffect(() => {
//     if (chartDataList.length === 0) return;
//     setActiveIndex((prev) => {
//       const isAtEnd = prev.endIndex >= chartDataList.length - 2;
//       if ((prev.startIndex === 0 && prev.endIndex === 29) || isAtEnd) {
//         return {
//           startIndex: Math.max(0, chartDataList.length - 30),
//           endIndex: chartDataList.length - 1
//         };
//       }
//       return prev;
//     });
//   }, [chartDataList.length]);

//   const handleBrushChange = (e: any) => {
//     if (!e || typeof e.startIndex !== 'number' || typeof e.endIndex !== 'number') return;
//     const MIN_PINS = 30;
//     if (e.endIndex - e.startIndex + 1 < MIN_PINS) return;
//     setActiveIndex({ startIndex: e.startIndex, endIndex: e.endIndex });
//   };

//   // 🎯 커스텀 훅으로 Y축 동적 스케일 로직 추출 완료
//   const yAxisDomains = useYAxisDomains(chartDataList, formattedData, activeIndex);

//   return (
//     <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #dee2e6', marginBottom: '20px' }}>
//       <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
//         📊 Recharts 통합 트레이딩 멀티 대시보드
//       </h4>

//       {chartDataList.length === 0 ? (
//         <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '13px' }}>
//           ⏳ 시뮬레이션을 가동하면 이곳에 통합 멀티 차트가 그려집니다.
//         </div>
//       ) : (
//         <div>
//           {/* 📈 1층: 메인 주가 봉차트 */}
//           <ResponsiveContainer width="100%" height={240}>
//             <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} barGap={-5} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
//               <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//               <XAxis dataKey="date" tick={{ fill: '#6c757d', fontSize: 9 }} />
//               <YAxis yAxisId="stock-axis" width={50} domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
//               <YAxis yAxisId="stock-axis-right" width={50} orientation="right" domain={[yAxisDomains.stockMin, yAxisDomains.stockMax]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              
//               {/* 🎯 모듈화된 Tooltip 적용 */}
//               <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor1" />} />
//               <Legend wrapperStyle={{ fontSize: '11px' }} />

//               <Bar name="고저 바늘선" dataKey="highLow" yAxisId="stock-axis-right" barSize={1.5} tooltipType="none" legendType="none">
//                 {formattedData.map((entry: any, index: number) => (
//                   <Cell key={index} fill={entry.close >= entry.open ? '#dc3545' : '#007bff'} />
//                 ))}
//               </Bar>
//               <Bar name="주가 봉" dataKey="openClose" yAxisId="stock-axis-right" barSize={10}>
//                 {formattedData.map((entry: any, index: number) => (
//                   <Cell key={index} fill={entry.close >= entry.open ? '#dc3545' : '#007bff'} />
//                 ))}
//               </Bar>
//               <Line yAxisId="stock-axis-right" name="SMA 05" type="monotone" dataKey="sma05" stroke="#cf1919" dot={false} strokeWidth={1.5} connectNulls />
//               <Line yAxisId="stock-axis-right" name="SMA 20" type="monotone" dataKey="sma20" stroke="#ff9500" dot={false} strokeWidth={1.5} connectNulls />
//               <Line yAxisId="stock-axis-right" name="SMA 60" type="monotone" dataKey="sma60" stroke="#192bcf" dot={false} strokeWidth={1.5} connectNulls={false} />
//             </ComposedChart>
//           </ResponsiveContainer>

//           <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

//           {/* 🧬 2층: RSI, MACD 패널 */}
//           <ResponsiveContainer width="100%" height={150}>
//             <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
//               <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//               <XAxis dataKey="date" hide />
//               <YAxis yAxisId="left-rsi" width={50} orientation="left" domain={[yAxisDomains.rsiMin, yAxisDomains.rsiMax]} />
//               <YAxis yAxisId="right-macd" width={50} orientation="right" domain={[yAxisDomains.macdMin, yAxisDomains.macdMax]} />
//               <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor2" />} />
//               <Legend wrapperStyle={{ fontSize: '11px' }} />
//               <Line yAxisId="left-rsi" name="RSI (%)" type="monotone" dataKey="rsi" stroke="#2cc54d" dot={false} strokeWidth={1.5} />
//               <Line yAxisId="left-rsi" name="MFI (자금흐름)" type="monotone" dataKey="mfi" stroke="#e83e8c" dot={false} strokeWidth={1.5} />
//               <Line yAxisId="right-macd" name="r-MACD" type="monotone" dataKey="macd" stroke="#2c3bc5" dot={false} strokeWidth={1.5} />
//             </ComposedChart>
//           </ResponsiveContainer>

//           <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

//           {/* 🧬 3층: OBV, SIGMA, CCI 패널 */}
//           <ResponsiveContainer width="100%" height={150}>
//             <ComposedChart data={formattedData} margin={{ top: 10, right: 1, left: 1, bottom: 5 }} syncId="stockTooltipSync" onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
//               <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//               <XAxis dataKey="date" hide />
//               <YAxis yAxisId="left-sigma" width={50} domain={[-3, 3]} />
//               <YAxis yAxisId="right-obv" width={50} orientation="right" domain={[yAxisDomains.obvMin, yAxisDomains.obvMax]} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
//               <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor3" />} />
//               <Legend wrapperStyle={{ fontSize: '11px' }} />
//               <Line yAxisId="right-obv" name="OBV (거래량)" type="monotone" dataKey="obv" stroke="#9b59b6" dot={false} strokeWidth={1.5} />
//               <Line yAxisId="left-sigma" name="SIGMA (변동성)" type="monotone" dataKey="sigma" stroke="#007bff" dot={false} strokeWidth={2} />
//             </ComposedChart>
//           </ResponsiveContainer>

//           <hr style={{ border: '0', borderTop: '1px dashed #dee2e6', margin: '15px 0' }} />

//           {/* 📊 4층: ADX/DMI 패널 및 Brush */}
//           <ResponsiveContainer width="100%" height={200}>
//             <ComposedChart data={formattedData} syncId="stockTooltipSync" margin={{ top: 10, right: 1, left: 1, bottom: 5 }} onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
//               <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
//               <XAxis dataKey="date" tick={false} />
//               <YAxis yAxisId="adx-axis-left" width={50} orientation="left" domain={[yAxisDomains.adxMin, yAxisDomains.adxMax]} />
//               <YAxis yAxisId="adx-axis-right" width={50} orientation="right" domain={[yAxisDomains.dmiMin, yAxisDomains.dmiMax]} />
//               <Tooltip content={<ChartTooltip approvedTooltipDate={approvedTooltipDate} type="floor4" />} />
//               <Legend wrapperStyle={{ fontSize: '11px' }} />
//               <Line name="DI+" yAxisId="adx-axis-right" type="monotone" dataKey="diPlus" stroke="#e71d36" dot={false} strokeWidth={1.5} />
//               <Line name="DI-" yAxisId="adx-axis-right" type="monotone" dataKey="diMinus" stroke="#2ec4b6" dot={false} strokeWidth={1.5} />
//               <Line name="ADX" yAxisId="adx-axis-left" type="monotone" dataKey="adx" stroke="#011627" dot={false} strokeWidth={2} />
//               <Brush dataKey="date" height={20} startIndex={activeIndex.startIndex} endIndex={activeIndex.endIndex} onChange={handleBrushChange} />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </div>
//       )}
//     </div>
//   );
// }