import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  approvedTooltipDate: string | null;
  type: 'floor1' | 'floor2' | 'floor3' | 'floor4';
}

export const ChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  approvedTooltipDate,
  type,
}) => {
  if (!active || !payload || !payload.length) return null;
  const currentData = payload[0].payload;

  if (currentData.date !== approvedTooltipDate) return null;

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      pointerEvents: 'none'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textAlign: 'center' }}>
        {currentData.date}
      </div>

      {type === 'floor1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#333', fontSize: '11px' }}>
          <div style={{ color: '#cf1919', fontWeight: 'bold' }}>
            SMA 05 : {currentData.sma05 ? `${Math.round(currentData.sma05).toLocaleString()}원` : '계산 중...'}
          </div>
          <div style={{ color: '#ff9500', fontWeight: 'bold' }}>
            SMA 20 : {currentData.sma20 ? `${Math.round(currentData.sma20).toLocaleString()}원` : '계산 중...'}
          </div>
          <div style={{ color: '#192bcf', fontWeight: 'bold' }}>
            SMA 60 : {currentData.sma60 ? `${Math.round(currentData.sma60).toLocaleString()}원` : '축적 중...'}
          </div>
          <hr style={{ border: '0', borderTop: '1px solid #dee2e6', margin: '4px 0' }} />
          <div>시가 : {Math.round(currentData.open).toLocaleString()}원</div>
          <div>종가 : {Math.round(currentData.close).toLocaleString()}원</div>
          <div>고가 : {Math.round(currentData.high).toLocaleString()}원</div>
          <div>저가 : {Math.round(currentData.low).toLocaleString()}원</div>
        </div>
      )}

      {type !== 'floor1' && payload.map((entry: any, index: number) => {
        if (entry.dataKey === 'date') return null;
        const name = entry.name ? String(entry.name) : '';
        let val = entry.value;

        // 🎯 지표별 커스텀 수치 포맷팅
        if (name.includes('SIGMA') && typeof val === 'number') {
          val = val.toFixed(1);
        } else if (name.includes('OBV') && typeof val === 'number') {
          val = `${(val / 1000000).toFixed(0)}M`;
        } else if (name.includes('EOM') && typeof val === 'number') {
          // EOM 지표는 민감한 수치 단위를 가질 수 있으므로 소수점 2자리로 가독성 처리
          val = val.toFixed(2);
        } else if (typeof val === 'number') {
          val = Math.round(val).toLocaleString();
        }

        return (
          <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
            {name} : {val}
          </div>
        );
      })}
    </div>
  );
};









// 구코드
// import React from 'react';

// interface CustomTooltipProps {
//   active?: boolean;
//   payload?: any[];
//   approvedTooltipDate: string | null;
//   type: 'floor1' | 'floor2' | 'floor3' | 'floor4';
// }

// export const ChartTooltip: React.FC<CustomTooltipProps> = ({
//   active,
//   payload,
//   approvedTooltipDate,
//   type,
// }) => {
//   if (!active || !payload || !payload.length) return null;
//   const currentData = payload[0].payload;

//   if (currentData.date !== approvedTooltipDate) return null;

//   return (
//     <div style={{
//       backgroundColor: 'rgba(255, 255, 255, 0.95)',
//       padding: '12px',
//       border: '1px solid #dee2e6',
//       borderRadius: '6px',
//       boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//       pointerEvents: 'none'
//     }}>
//       <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '6px', textAlign: 'center' }}>
//         {currentData.date}
//       </div>

//       {type === 'floor1' && (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#333', fontSize: '11px' }}>
//           <div style={{ color: '#cf1919', fontWeight: 'bold' }}>
//             SMA 05 : {currentData.sma05 ? `${Math.round(currentData.sma05).toLocaleString()}원` : '계산 중...'}
//           </div>
//           <div style={{ color: '#ff9500', fontWeight: 'bold' }}>
//             SMA 20 : {currentData.sma20 ? `${Math.round(currentData.sma20).toLocaleString()}원` : '계산 중...'}
//           </div>
//           <div style={{ color: '#192bcf', fontWeight: 'bold' }}>
//             SMA 60 : {currentData.sma60 ? `${Math.round(currentData.sma60).toLocaleString()}원` : '축적 중...'}
//           </div>
//           <hr style={{ border: '0', borderTop: '1px solid #dee2e6', margin: '4px 0' }} />
//           <div>시가 : {Math.round(currentData.open).toLocaleString()}원</div>
//           <div>종가 : {Math.round(currentData.close).toLocaleString()}원</div>
//           <div>고가 : {Math.round(currentData.high).toLocaleString()}원</div>
//           <div>저가 : {Math.round(currentData.low).toLocaleString()}원</div>
//         </div>
//       )}

//       {type !== 'floor1' && payload.map((entry: any, index: number) => {
//         if (entry.dataKey === 'date') return null;
//         const name = entry.name ? String(entry.name) : '';
//         let val = entry.value;

//         if (name.includes('SIGMA') && typeof val === 'number') {
//           val = val.toFixed(1);
//         } else if (name.includes('OBV') && typeof val === 'number') {
//           val = `${(val / 1000000).toFixed(0)}M`;
//         } else if (typeof val === 'number') {
//           val = Math.round(val).toLocaleString();
//         }

//         return (
//           <div key={index} style={{ color: entry.color, fontSize: '11px', padding: '1px 0', marginTop: '3px' }}>
//             {name} : {val}
//           </div>
//         );
//       })}
//     </div>
//   );
// };