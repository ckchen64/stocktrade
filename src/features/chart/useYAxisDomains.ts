import { useMemo } from 'react';
import type { CandleData } from './types';

export const useYAxisDomains = (
  chartDataList: CandleData[],
  formattedData: any[],
  activeIndex: { startIndex: number; endIndex: number }
) => {
  return useMemo(() => {
    if (chartDataList.length === 0) {
      return {
        stockMin: 0, stockMax: 100000, rsiMin: 0, rsiMax: 100, macdMin: -100, macdMax: 100,
        obvMin: 0, obvMax: 100000000, sigmaMin: -6, sigmaMax: 6, adxMin: 0, adxMax: 100, dmiMin: 0, dmiMax: 100,
        eomMin: -1, eomMax: 1
      };
    }

    const visibleData = chartDataList.slice(activeIndex.startIndex, activeIndex.endIndex + 1);
    const visibleFormatted = formattedData.slice(activeIndex.startIndex, activeIndex.endIndex + 1);

    // A. 1층 주가 및 이평선
    const stockValues: number[] = [];
    visibleData.forEach(item => {
      stockValues.push(item.high, item.low, item.open, item.close);
      if (item.sma05) stockValues.push(item.sma05);
      if (item.sma20) stockValues.push(item.sma20);
      if (item.sma60) stockValues.push(item.sma60);
    });
    const sMin = stockValues.length ? Math.min(...stockValues) : 0;
    const sMax = stockValues.length ? Math.max(...stockValues) : 100000;

    // B. 2층 RSI, MFI, MACD
    const combinedRsiMfi = visibleData.flatMap(i => [i.rsi, i.mfi]).filter((v): v is number => v !== undefined);
    const rMin = combinedRsiMfi.length ? Math.min(...combinedRsiMfi) : 30;
    const rMax = combinedRsiMfi.length ? Math.max(...combinedRsiMfi) : 70;

    const macdValues = visibleData.map(i => i.macd).filter((v): v is number => v !== undefined);
    const mMin = macdValues.length ? Math.min(...macdValues) : -10;
    const mMax = macdValues.length ? Math.max(...macdValues) : 10;

    // C. 3층 OBV, SIGMA, CCI
    const obvValues = visibleData.map(d => d.obv).filter((v): v is number => v !== undefined);
    const oMin = obvValues.length ? Math.min(...obvValues) : 0;
    const oMax = obvValues.length ? Math.max(...obvValues) : 1000000;

    const sigmaValues = visibleData.map(d => d.sigma).filter((v): v is number => v !== undefined);
    const cciRaw = visibleFormatted.flatMap(i => [i.cci, i.cciSignal]).filter((v): v is number => v !== undefined && v !== null);
    const combinedSigmaCci = [...sigmaValues, ...cciRaw];
    const gMin = combinedSigmaCci.length ? Math.min(...combinedSigmaCci) : -3;
    const gMax = combinedSigmaCci.length ? Math.max(...combinedSigmaCci) : 3;

    // D. 4층 ADX & DMI & EOM
    const adxValues = visibleFormatted.map(i => i.adx).filter((v): v is number => v !== undefined && v !== null);
    const aMin = adxValues.length ? Math.max(0, Math.min(...adxValues)) : 0;
    const aMax = adxValues.length ? Math.min(100, Math.max(...adxValues)) : 100;

    const dmiValues = visibleFormatted.flatMap(i => [i.diPlus, i.diMinus]).filter((v): v is number => v !== undefined && v !== null);
    const dMin = dmiValues.length ? Math.max(0, Math.min(...dmiValues)) : 0;
    const dMax = dmiValues.length ? Math.min(100, Math.max(...dmiValues)) : 100;

    // 🎯 EOM 독립 스케일 계산
    const eomValues = visibleFormatted.map(i => i.eom).filter((v): v is number => v !== undefined && v !== null);
    const eMin = eomValues.length ? Math.min(...eomValues) : -1;
    const eMax = eomValues.length ? Math.max(...eomValues) : 1;

    return {
      stockMin: Math.floor(sMin * 0.95),
      stockMax: Math.ceil(sMax * 1.05),
      rsiMin: Math.max(0, Math.floor(rMin - (rMax - rMin) * 0.1)),
      rsiMax: Math.min(100, Math.ceil(rMax + (rMax - rMin) * 0.1)),
      macdMin: Math.floor(mMin - Math.abs(mMax - mMin) * 0.1),
      macdMax: Math.ceil(mMax + Math.abs(mMax - mMin) * 0.1),
      obvMin: Math.floor(oMin - Math.abs(oMax - oMin) * 0.05),
      obvMax: Math.ceil(oMax + Math.abs(oMax - oMin) * 0.05),
      sigmaMin: Math.floor(gMin - Math.abs(gMax - gMin) * 0.1),
      sigmaMax: Math.ceil(gMax + Math.abs(gMax - gMin) * 0.1),
      adxMin: Math.max(0, Math.floor(aMin - (aMax - aMin) * 0.1)),
      adxMax: Math.min(100, Math.ceil(aMax + (aMax - aMin) * 0.1)),
      dmiMin: Math.max(0, Math.floor(dMin - (dMax - dMin) * 0.1)),
      dmiMax: Math.min(100, Math.ceil(dMax + (dMax - dMin) * 0.1)),
      
      // 🎯 EOM 여유 범위 바인딩
      eomMin: eMin < 0 ? eMin * 1.2 : eMin * 0.8,
      eomMax: eMax > 0 ? eMax * 1.2 : eMax * 0.8,
    };
  }, [formattedData, chartDataList, activeIndex]);
};









// 구코드
// import { useMemo } from 'react';
// import type { CandleData } from './types';

// export const useYAxisDomains = (
//   chartDataList: CandleData[],
//   formattedData: any[],
//   activeIndex: { startIndex: number; endIndex: number }
// ) => {
//   return useMemo(() => {
//     if (chartDataList.length === 0) {
//       return {
//         stockMin: 0, stockMax: 100000, rsiMin: 0, rsiMax: 100, macdMin: -100, macdMax: 100,
//         obvMin: 0, obvMax: 100000000, sigmaMin: -6, sigmaMax: 6, adxMin: 0, adxMax: 100, dmiMin: 0, dmiMax: 100,
//       };
//     }

//     const visibleData = chartDataList.slice(activeIndex.startIndex, activeIndex.endIndex + 1);
//     const visibleFormatted = formattedData.slice(activeIndex.startIndex, activeIndex.endIndex + 1);

//     // A. 1층 주가 및 이평선
//     const stockValues: number[] = [];
//     visibleData.forEach(item => {
//       stockValues.push(item.high, item.low, item.open, item.close);
//       if (item.sma05) stockValues.push(item.sma05);
//       if (item.sma20) stockValues.push(item.sma20);
//       if (item.sma60) stockValues.push(item.sma60);
//     });
//     const sMin = stockValues.length ? Math.min(...stockValues) : 0;
//     const sMax = stockValues.length ? Math.max(...stockValues) : 100000;

//     // B. 2층 RSI, MFI, MACD
//     const combinedRsiMfi = visibleData.flatMap(i => [i.rsi, i.mfi]).filter((v): v is number => v !== undefined);
//     const rMin = combinedRsiMfi.length ? Math.min(...combinedRsiMfi) : 30;
//     const rMax = combinedRsiMfi.length ? Math.max(...combinedRsiMfi) : 70;

//     const macdValues = visibleData.map(i => i.macd).filter((v): v is number => v !== undefined);
//     const mMin = macdValues.length ? Math.min(...macdValues) : -10;
//     const mMax = macdValues.length ? Math.max(...macdValues) : 10;

//     // C. 3층 OBV, SIGMA, CCI
//     const obvValues = visibleData.map(d => d.obv).filter((v): v is number => v !== undefined);
//     const oMin = obvValues.length ? Math.min(...obvValues) : 0;
//     const oMax = obvValues.length ? Math.max(...obvValues) : 1000000;

//     const sigmaValues = visibleData.map(d => d.sigma).filter((v): v is number => v !== undefined);
//     const cciRaw = visibleFormatted.flatMap(i => [i.cci, i.cciSignal]).filter((v): v is number => v !== undefined && v !== null);
//     const combinedSigmaCci = [...sigmaValues, ...cciRaw];
//     const gMin = combinedSigmaCci.length ? Math.min(...combinedSigmaCci) : -3;
//     const gMax = combinedSigmaCci.length ? Math.max(...combinedSigmaCci) : 3;

//     // D. 4층 ADX & DMI
//     const adxValues = visibleFormatted.map(i => i.adx).filter((v): v is number => v !== undefined && v !== null);
//     const aMin = adxValues.length ? Math.max(0, Math.min(...adxValues)) : 0;
//     const aMax = adxValues.length ? Math.min(100, Math.max(...adxValues)) : 100;

//     const dmiValues = visibleFormatted.flatMap(i => [i.diPlus, i.diMinus]).filter((v): v is number => v !== undefined && v !== null);
//     const dMin = dmiValues.length ? Math.max(0, Math.min(...dmiValues)) : 0;
//     const dMax = dmiValues.length ? Math.min(100, Math.max(...dmiValues)) : 100;

//     return {
//       stockMin: Math.floor(sMin * 0.95),
//       stockMax: Math.ceil(sMax * 1.05),
//       rsiMin: Math.max(0, Math.floor(rMin - (rMax - rMin) * 0.1)),
//       rsiMax: Math.min(100, Math.ceil(rMax + (rMax - rMin) * 0.1)),
//       macdMin: Math.floor(mMin - Math.abs(mMax - mMin) * 0.1),
//       macdMax: Math.ceil(mMax + Math.abs(mMax - mMin) * 0.1),
//       obvMin: Math.floor(oMin - Math.abs(oMax - oMin) * 0.05),
//       obvMax: Math.ceil(oMax + Math.abs(oMax - oMin) * 0.05),
//       sigmaMin: Math.floor(gMin - Math.abs(gMax - gMin) * 0.1),
//       sigmaMax: Math.ceil(gMax + Math.abs(gMax - gMin) * 0.1),
//       adxMin: Math.max(0, Math.floor(aMin - (aMax - aMin) * 0.1)),
//       adxMax: Math.min(100, Math.ceil(aMax + (aMax - aMin) * 0.1)),
//       dmiMin: Math.max(0, Math.floor(dMin - (dMax - dMin) * 0.1)),
//       dmiMax: Math.min(100, Math.ceil(dMax + (dMax - dMin) * 0.1)),
//     };
//   }, [formattedData, chartDataList, activeIndex]);
// };