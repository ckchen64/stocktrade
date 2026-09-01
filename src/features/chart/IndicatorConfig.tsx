// import React, { useState } from 'react';

// // 📋 1. DB 스냅샷 명세와 100% 일치하는 데이터 구조 타입 정의
// interface SmaParams { SMA_SHORT_WINDOW: number; SMA_MEDIUM_WINDOW: number; SMA_LONG_WINDOW: number; }
// interface MacdParams { MACD_FAST: number; MACD_SLOW: number; MACD_SIGNAL: number; }
// interface SigmaParams { SIGMA_PERIOD: number; SIGMA_MULTIPLIER: number; }
// interface AdxParams { ADX_PERIOD: number; }
// interface CciParams { CCI_PERIOD: number; CCI_SIGNAL: number; }

// interface IndicatorParams {
//   SMA: SmaParams;
//   RSI: { RSI_PERIOD: number };
//   MFI: { MFI_PERIOD: number };
//   MACD: MacdParams;
//   SIGMA: SigmaParams;
//   ADX: AdxParams;
//   CCI: CciParams;
// }

// const IndicatorConfig: React.FC = () => {
//   // 📊 2. stock_index_config 데이터베이스 기준 최초 초기값 세팅
//   const defaultParams: IndicatorParams = {
//     SMA: { SMA_SHORT_WINDOW: 5, SMA_MEDIUM_WINDOW: 20, SMA_LONG_WINDOW: 60 },
//     RSI: { RSI_PERIOD: 14 },
//     MFI: { MFI_PERIOD: 14 },
//     MACD: { MACD_FAST: 12, MACD_SLOW: 26, MACD_SIGNAL: 9 },
//     SIGMA: { SIGMA_PERIOD: 20, SIGMA_MULTIPLIER: 2.0 }, // double_value 타입 대응
//     ADX: { ADX_PERIOD: 14 },                            // 🎯 추가 완료
//     CCI: { CCI_PERIOD: 20, CCI_SIGNAL: 9 }              // 🎯 추가 완료
//   };

//   // 실시간 적용된 설정(서버 동기화용) 및 사용자가 현재 타이핑 중인 입력창 값 제어
//   const [currentParams, setCurrentParams] = useState<IndicatorParams>({ ...defaultParams });
//   const [inputParams, setInputParams] = useState<IndicatorParams>({ ...defaultParams });

//   // ✍️ 3. 유연하게 인풋박스 상태를 제어하는 통합 핸들러 (TypeScript Key 가드 적용)
//   const handleInputChange = <K extends keyof IndicatorParams>(
//     indicator: K,
//     configKey: keyof IndicatorParams[K],
//     value: string
//   ) => {
//     setInputParams(prev => ({
//       ...prev,
//       [indicator]: {
//         ...prev[indicator],
//         [configKey]: value === '' ? 0 : Number(value)
//       }
//     }));
//   };

//   // 파라미터 적용 핸들러
//   const handleApply = (indicator: keyof IndicatorParams) => {
//     setCurrentParams(prev => ({
//       ...prev,
//       [indicator]: { ...inputParams[indicator] }
//     }));
//     alert(`[${indicator}] 변경 파라미터가 실시간 주가 분석 엔진에 반영되었습니다.`);
//   };

//   // 🎨 스타일 사전 정의 공통셋
//   const cardStyle: React.CSSProperties = {
//     marginBottom: '16px',
//     padding: '16px',
//     backgroundColor: '#ffffff',
//     borderRadius: '10px',
//     border: '1px solid #e9ecef',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
//   };

//   const badgeStyle: React.CSSProperties = {
//     display: 'flex',
//     gap: '12px',
//     fontSize: '12px',
//     color: '#666',
//     backgroundColor: '#f8f9fa',
//     padding: '8px 12px',
//     borderRadius: '6px',
//     marginBottom: '12px'
//   };

//   const inputStyle: React.CSSProperties = {
//     width: '65px',
//     padding: '6px',
//     borderRadius: '4px',
//     border: '1px solid #ced4da',
//     textAlign: 'center',
//     fontSize: '13px',
//     outline: 'none'
//   };

//   const btnStyle = (color: string): React.CSSProperties => ({
//     padding: '6px 14px',
//     backgroundColor: color,
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '13px',
//     fontWeight: 'bold',
//     marginLeft: 'auto'
//   });

//   return (
//     <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
//       <h3 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>⚙️ 보조지표 파라미터 제어 센터</h3>
//       <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 18px 0', lineHeight: '1.4' }}>
//         `stock_index_config` 테이블의 변수를 제어하여 연산 주기를 즉시 갱신합니다.
//       </p>

//       {/* 1층. SMA 그룹 */}
//       <div style={cardStyle}>
//         <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>SMA (단/중/장기 이동평균선)</h4>
//         <div style={badgeStyle}>
//           <div>📌 최초: 5 / 20 / 60</div>
//           <div style={{ color: '#007bff', fontWeight: 'bold' }}>✨ 가동중: {currentParams.SMA.SMA_SHORT_WINDOW} / {currentParams.SMA.SMA_MEDIUM_WINDOW} / {currentParams.SMA.SMA_LONG_WINDOW}</div>
//         </div>
//         <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
//           <label style={{ fontSize: '13px', color: '#475569' }}>단기: <input type="number" style={inputStyle} value={inputParams.SMA.SMA_SHORT_WINDOW || ''} onChange={(e) => handleInputChange('SMA', 'SMA_SHORT_WINDOW', e.target.value)} /></label>
//           <label style={{ fontSize: '13px', color: '#475569' }}>중기: <input type="number" style={inputStyle} value={inputParams.SMA.SMA_MEDIUM_WINDOW || ''} onChange={(e) => handleInputChange('SMA', 'SMA_MEDIUM_WINDOW', e.target.value)} /></label>
//           <label style={{ fontSize: '13px', color: '#475569' }}>장기: <input type="number" style={inputStyle} value={inputParams.SMA.SMA_LONG_WINDOW || ''} onChange={(e) => handleInputChange('SMA', 'SMA_LONG_WINDOW', e.target.value)} /></label>
//           <button onClick={() => handleApply('SMA')} style={btnStyle('#007bff')}>적용</button>
//         </div>
//       </div>

//       {/* 2층. MACD 그룹 */}
//       <div style={cardStyle}>
//         <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>MACD (이동평균 수렴확산지수)</h4>
//         <div style={badgeStyle}>
//           <div>📌 최초: Fast(12) / Slow(26) / Signal(9)</div>
//           <div style={{ color: '#ef4444', fontWeight: 'bold' }}>✨ 가동중: {currentParams.MACD.MACD_FAST} / {currentParams.MACD.MACD_SLOW} / {currentParams.MACD.MACD_SIGNAL}</div>
//         </div>
//         <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
//           <label style={{ fontSize: '13px', color: '#475569' }}>Fast: <input type="number" style={inputStyle} value={inputParams.MACD.MACD_FAST || ''} onChange={(e) => handleInputChange('MACD', 'MACD_FAST', e.target.value)} /></label>
//           <label style={{ fontSize: '13px', color: '#475569' }}>Slow: <input type="number" style={inputStyle} value={inputParams.MACD.MACD_SLOW || ''} onChange={(e) => handleInputChange('MACD', 'MACD_SLOW', e.target.value)} /></label>
//           <label style={{ fontSize: '13px', color: '#475569' }}>Signal: <input type="number" style={inputStyle} value={inputParams.MACD.MACD_SIGNAL || ''} onChange={(e) => handleInputChange('MACD', 'MACD_SIGNAL', e.target.value)} /></label>
//           <button onClick={() => handleApply('MACD')} style={btnStyle('#ef4444')}>적용</button>
//         </div>
//       </div>

//       {/* 3층. RSI & MFI (나란히 배치되는 미니 카드 구조) */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
//         <div style={{ ...cardStyle, marginBottom: 0 }}>
//           <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>RSI (상대강도)</h4>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
//             최초: 14 → <span style={{ color: '#10b981', fontWeight: 'bold' }}>현재: {currentParams.RSI.RSI_PERIOD}</span>
//           </div>
//           <div style={{ display: 'flex', gap: '8px' }}>
//             <input type="number" style={inputStyle} value={inputParams.RSI.RSI_PERIOD || ''} onChange={(e) => handleInputChange('RSI', 'RSI_PERIOD', e.target.value)} />
//             <button onClick={() => handleApply('RSI')} style={btnStyle('#10b981')}>변경</button>
//           </div>
//         </div>

//         <div style={{ ...cardStyle, marginBottom: 0 }}>
//           <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>MFI (자금흐름)</h4>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
//             최초: 14 → <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>현재: {currentParams.MFI.MFI_PERIOD}</span>
//           </div>
//           <div style={{ display: 'flex', gap: '8px' }}>
//             <input type="number" style={inputStyle} value={inputParams.MFI.MFI_PERIOD || ''} onChange={(e) => handleInputChange('MFI', 'MFI_PERIOD', e.target.value)} />
//             <button onClick={() => handleApply('MFI')} style={btnStyle('#8b5cf6')}>변경</button>
//           </div>
//         </div>
//       </div>

//       {/* 4층. SIGMA 그룹 */}
//       <div style={cardStyle}>
//         <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>SIGMA (변동성 이격 지표)</h4>
//         <div style={badgeStyle}>
//           <div>📌 최초: 기간({defaultParams.SIGMA.SIGMA_PERIOD}) / 승수({defaultParams.SIGMA.SIGMA_MULTIPLIER})</div>
//           <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>✨ 가동중: {currentParams.SIGMA.SIGMA_PERIOD}일 / 배수:{currentParams.SIGMA.SIGMA_MULTIPLIER}</div>
//         </div>
//         <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
//           <label style={{ fontSize: '13px', color: '#475569' }}>기준기간: <input type="number" style={inputStyle} value={inputParams.SIGMA.SIGMA_PERIOD || ''} onChange={(e) => handleInputChange('SIGMA', 'SIGMA_PERIOD', e.target.value)} /></label>
//           <label style={{ fontSize: '13px', color: '#475569' }}>가중승수: <input type="number" step="0.1" style={inputStyle} value={inputParams.SIGMA.SIGMA_MULTIPLIER || ''} onChange={(e) => handleInputChange('SIGMA', 'SIGMA_MULTIPLIER', e.target.value)} /></label>
//           <button onClick={() => handleApply('SIGMA')} style={btnStyle('#f59e0b')}>적용</button>
//         </div>
//       </div>

//       {/* 5층. ADX & CCI 그룹 (명세 누락 부품 완전 조립 완료) */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
//         {/* ADX 카드 */}
//         <div style={{ ...cardStyle, marginBottom: 0 }}>
//           <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>ADX (추세 강도 지수)</h4>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
//             최초: 14 → <span style={{ color: '#0284c7', fontWeight: 'bold' }}>현재: {currentParams.ADX.ADX_PERIOD}</span>
//           </div>
//           <div style={{ display: 'flex', gap: '8px' }}>
//             <input type="number" style={inputStyle} value={inputParams.ADX.ADX_PERIOD || ''} onChange={(e) => handleInputChange('ADX', 'ADX_PERIOD', e.target.value)} />
//             <button onClick={() => handleApply('ADX')} style={btnStyle('#0284c7')}>변경</button>
//           </div>
//         </div>

//         {/* CCI 카드 */}
//         <div style={{ ...cardStyle, marginBottom: 0 }}>
//           <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>CCI (상품 채널 지수)</h4>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
//             최초: 20 (시그널: 9) → <span style={{ color: '#0d9488', fontWeight: 'bold' }}>{currentParams.CCI.CCI_PERIOD} / {currentParams.CCI.CCI_SIGNAL}</span>
//           </div>
//           <div style={{ display: 'flex', gap: '6px' }}>
//             <input type="number" placeholder="기간" style={{ ...inputStyle, width: '45px' }} value={inputParams.CCI.CCI_PERIOD || ''} onChange={(e) => handleInputChange('CCI', 'CCI_PERIOD', e.target.value)} />
//             <input type="number" placeholder="시그널" style={{ ...inputStyle, width: '45px' }} value={inputParams.CCI.CCI_SIGNAL || ''} onChange={(e) => handleInputChange('CCI', 'CCI_SIGNAL', e.target.value)} />
//             <button onClick={() => handleApply('CCI')} style={{ ...btnStyle('#0d9488'), padding: '6px 10px' }}>변경</button>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default IndicatorConfig;




import React, { useState } from 'react';

// 📋 1. DB 스냅샷 명세와 100% 일치하는 데이터 구조 타입 정의
interface SmaParams { SMA_SHORT_WINDOW: number; SMA_MEDIUM_WINDOW: number; SMA_LONG_WINDOW: number; }
interface MacdParams { MACD_FAST: number; MACD_SLOW: number; MACD_SIGNAL: number; }
interface SigmaParams { SIGMA_PERIOD: number; SIGMA_MULTIPLIER: number; }
interface AdxParams { ADX_PERIOD: number; }
interface CciParams { CCI_PERIOD: number; CCI_SIGNAL: number; }

interface IndicatorParams {
  SMA: SmaParams;
  RSI: { RSI_PERIOD: number };
  MFI: { MFI_PERIOD: number };
  MACD: MacdParams;
  SIGMA: SigmaParams;
  ADX: AdxParams;
  CCI: CciParams;
}

const IndicatorConfig: React.FC = () => {
  // 📊 2. stock_index_config 데이터베이스 기준 최초 초기값 세팅
  const defaultParams: IndicatorParams = {
    SMA: { SMA_SHORT_WINDOW: 5, SMA_MEDIUM_WINDOW: 20, SMA_LONG_WINDOW: 60 },
    RSI: { RSI_PERIOD: 14 },
    MFI: { MFI_PERIOD: 14 },
    MACD: { MACD_FAST: 12, MACD_SLOW: 26, MACD_SIGNAL: 9 },
    SIGMA: { SIGMA_PERIOD: 20, SIGMA_MULTIPLIER: 2.0 }, // double_value 타입 대응
    ADX: { ADX_PERIOD: 14 },                            // 🎯 추가 완료
    CCI: { CCI_PERIOD: 20, CCI_SIGNAL: 9 }              // 🎯 추가 완료
  };

  // 실시간 적용된 설정(서버 동기화용) 및 사용자가 현재 타이핑 중인 입력창 값 제어
  const [currentParams, setCurrentParams] = useState<IndicatorParams>({ ...defaultParams });
  const [inputParams, setInputParams] = useState<IndicatorParams>({ ...defaultParams });

  // ✍️ 3. 유연하게 인풋박스 상태를 제어하는 통합 핸들러 (TypeScript Key 가드 적용)
  const handleInputChange = <K extends keyof IndicatorParams>(
    indicator: K,
    configKey: keyof IndicatorParams[K],
    value: string
  ) => {
    setInputParams(prev => ({
      ...prev,
      [indicator]: {
        ...prev[indicator],
        [configKey]: value === '' ? 0 : Number(value)
      }
    }));
  };

  // 파라미터 적용 핸들러
  const handleApply = (indicator: keyof IndicatorParams) => {
    setCurrentParams(prev => ({
      ...prev,
      [indicator]: { ...inputParams[indicator] }
    }));
    alert(`[${indicator}] 변경 파라미터가 실시간 주가 분석 엔진에 반영되었습니다.`);
  };

  // 🎨 스타일 사전 정의 공통셋
  const cardStyle: React.CSSProperties = {
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
  };

  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '6px',
    marginBottom: '12px'
  };

  const inputStyle: React.CSSProperties = {
    width: '65px',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    textAlign: 'center',
    fontSize: '13px',
    outline: 'none'
  };

  const btnStyle = (color: string): React.CSSProperties => ({
    padding: '6px 14px',
    backgroundColor: color,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    marginLeft: 'auto'
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>⚙️ 보조지표 파라미터 제어 센터</h3>
      <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 18px 0', lineHeight: '1.4' }}>
        `stock_index_config` 테이블의 변수를 제어하여 연산 주기를 즉시 갱신합니다.
      </p>

      {/* 1층. SMA 그룹 */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>SMA (단/중/장기 이동평균선)</h4>
        <div style={badgeStyle}>
          <div>📌 최초: 5 / 20 / 60</div>
          <div style={{ color: '#007bff', fontWeight: 'bold' }}>✨ 가동중: {currentParams.SMA.SMA_SHORT_WINDOW} / {currentParams.SMA.SMA_MEDIUM_WINDOW} / {currentParams.SMA.SMA_LONG_WINDOW}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', color: '#475569' }}>단기: <input type="number" style={inputStyle} value={inputParams.SMA.SMA_SHORT_WINDOW || ''} onChange={(e) => handleInputChange('SMA', 'SMA_SHORT_WINDOW', e.target.value)} /></label>
          <label style={{ fontSize: '13px', color: '#475569' }}>중기: <input type="number" style={inputStyle} value={inputParams.SMA.SMA_MEDIUM_WINDOW || ''} onChange={(e) => handleInputChange('SMA', 'SMA_MEDIUM_WINDOW', e.target.value)} /></label>
          <label style={{ fontSize: '13px', color: '#475569' }}>장기: <input type="number" style={inputStyle} value={inputParams.SMA.SMA_LONG_WINDOW || ''} onChange={(e) => handleInputChange('SMA', 'SMA_LONG_WINDOW', e.target.value)} /></label>
          <button onClick={() => handleApply('SMA')} style={btnStyle('#007bff')}>적용</button>
        </div>
      </div>

      {/* 2층. MACD 그룹 */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 8px 0', color: '#62fcf4' }}>MACD (이동평균 수렴확산지수)</h4>  #'#2962e7'
        <div style={badgeStyle}>
          <div>📌 최초: Fast(12) / Slow(26) / Signal(9)</div>
          <div style={{ color: '#ef4444', fontWeight: 'bold' }}>✨ 가동중: {currentParams.MACD.MACD_FAST} / {currentParams.MACD.MACD_SLOW} / {currentParams.MACD.MACD_SIGNAL}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', color: '#475569' }}>Fast: <input type="number" style={inputStyle} value={inputParams.MACD.MACD_FAST || ''} onChange={(e) => handleInputChange('MACD', 'MACD_FAST', e.target.value)} /></label>
          <label style={{ fontSize: '13px', color: '#475569' }}>Slow: <input type="number" style={inputStyle} value={inputParams.MACD.MACD_SLOW || ''} onChange={(e) => handleInputChange('MACD', 'MACD_SLOW', e.target.value)} /></label>
          <label style={{ fontSize: '13px', color: '#475569' }}>Signal: <input type="number" style={inputStyle} value={inputParams.MACD.MACD_SIGNAL || ''} onChange={(e) => handleInputChange('MACD', 'MACD_SIGNAL', e.target.value)} /></label>
          <button onClick={() => handleApply('MACD')} style={btnStyle('#ef4444')}>적용</button>
        </div>
      </div>

      {/* 3층. RSI & MFI (나란히 배치되는 미니 카드 구조) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>RSI (상대강도)</h4>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            최초: 14 → <span style={{ color: '#10b981', fontWeight: 'bold' }}>현재: {currentParams.RSI.RSI_PERIOD}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" style={inputStyle} value={inputParams.RSI.RSI_PERIOD || ''} onChange={(e) => handleInputChange('RSI', 'RSI_PERIOD', e.target.value)} />
            <button onClick={() => handleApply('RSI')} style={btnStyle('#10b981')}>변경</button>
          </div>
        </div>

        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>MFI (자금흐름)</h4>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            최초: 14 → <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>현재: {currentParams.MFI.MFI_PERIOD}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" style={inputStyle} value={inputParams.MFI.MFI_PERIOD || ''} onChange={(e) => handleInputChange('MFI', 'MFI_PERIOD', e.target.value)} />
            <button onClick={() => handleApply('MFI')} style={btnStyle('#8b5cf6')}>변경</button>
          </div>
        </div>
      </div>

      {/* 4층. SIGMA 그룹 */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>SIGMA (변동성 이격 지표)</h4>
        <div style={badgeStyle}>
          <div>📌 최초: 기간({defaultParams.SIGMA.SIGMA_PERIOD}) / 승수({defaultParams.SIGMA.SIGMA_MULTIPLIER})</div>
          <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>✨ 가동중: {currentParams.SIGMA.SIGMA_PERIOD}일 / 배수:{currentParams.SIGMA.SIGMA_MULTIPLIER}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', color: '#475569' }}>기준기간: <input type="number" style={inputStyle} value={inputParams.SIGMA.SIGMA_PERIOD || ''} onChange={(e) => handleInputChange('SIGMA', 'SIGMA_PERIOD', e.target.value)} /></label>
          <label style={{ fontSize: '13px', color: '#475569' }}>가중승수: <input type="number" step="0.1" style={inputStyle} value={inputParams.SIGMA.SIGMA_MULTIPLIER || ''} onChange={(e) => handleInputChange('SIGMA', 'SIGMA_MULTIPLIER', e.target.value)} /></label>
          <button onClick={() => handleApply('SIGMA')} style={btnStyle('#f59e0b')}>적용</button>
        </div>
      </div>

      {/* 5층. ADX & CCI 그룹 (명세 누락 부품 완전 조립 완료) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* ADX 카드 */}
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>ADX (추세 강도 지수)</h4>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            최초: 14 → <span style={{ color: '#0284c7', fontWeight: 'bold' }}>현재: {currentParams.ADX.ADX_PERIOD}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" style={inputStyle} value={inputParams.ADX.ADX_PERIOD || ''} onChange={(e) => handleInputChange('ADX', 'ADX_PERIOD', e.target.value)} />
            <button onClick={() => handleApply('ADX')} style={btnStyle('#0284c7')}>변경</button>
          </div>
        </div>

        {/* CCI 카드 */}
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '14px' }}>CCI (상품 채널 지수)</h4>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            최초: 20 (시그널: 9) → <span style={{ color: '#0d9488', fontWeight: 'bold' }}>{currentParams.CCI.CCI_PERIOD} / {currentParams.CCI.CCI_SIGNAL}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input type="number" placeholder="기간" style={{ ...inputStyle, width: '45px' }} value={inputParams.CCI.CCI_PERIOD || ''} onChange={(e) => handleInputChange('CCI', 'CCI_PERIOD', e.target.value)} />
            <input type="number" placeholder="시그널" style={{ ...inputStyle, width: '45px' }} value={inputParams.CCI.CCI_SIGNAL || ''} onChange={(e) => handleInputChange('CCI', 'CCI_SIGNAL', e.target.value)} />
            <button onClick={() => handleApply('CCI')} style={{ ...btnStyle('#0d9488'), padding: '6px 10px' }}>변경</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IndicatorConfig;