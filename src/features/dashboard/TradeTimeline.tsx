import React from 'react';

//import { TradeHistoryItem } from './StockExchange'; 

interface TradeHistoryItem {
    id: number;
    tradeDate: string;
    tradeType: string;
    price: number;
    quantity: number;
    totalAmount: number;
    profitRate?: number; // 🎯 [필수 수정]: JSX에서 사용하는 profitRate 속성 추가
}

interface TradeTimelineProps {
    historyList: TradeHistoryItem[]; // 📦 부모로부터 실시간 영수증 택배 상자를 받아옴
}

export default function TradeTimeline({ historyList = [] }: TradeTimelineProps): React.JSX.Element {

    // 🎯 수익률에 따른 텍스트 색상 구별 (양수: 빨강, 음수: 파랑, 0: 기본 검정)
    const getProfitColor = (rate?: number): string => {
        if (rate == null || rate === 0) return '#333333';
        return rate > 0 ? '#dc3545' : '#007bff';
    };

    return (
        <div style={{ marginTop: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>📜 나의 매매 이력 조회 [C]</h4>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                    <thead style={{ backgroundColor: '#e9ecef', position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                            <th style={{ padding: '8px' }}>체결일(가상)</th>
                            <th style={{ padding: '8px' }}>유형</th>
                            <th style={{ padding: '8px' }}>단가</th>
                            <th style={{ padding: '8px' }}>수량</th>
                            <th style={{ padding: '8px' }}>총금액</th>
                            <th style={{ padding: '8px' }}>수익률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 🎯 매매 이력이 없을 경우 가드 노출 */}
                        {historyList.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '20px', color: '#6c757d' }}>
                                    매매 이력이 존재하지 않습니다.
                                </td>
                            </tr>
                        ) : (
                            historyList.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{item.tradeDate}</td>
                                    <td style={{ 
                                        padding: '8px', 
                                        color: item.tradeType === 'BUY' ? '#dc3545' : '#007bff', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {item.tradeType}
                                    </td>
                                    <td style={{ padding: '8px' }}>{item.price?.toLocaleString()}원</td>
                                    <td style={{ padding: '8px' }}>{item.quantity}주</td>
                                    <td style={{ padding: '8px' }}>{item.totalAmount?.toLocaleString()}원</td>
                                    
                                    {/* 🎯 안전한 수익률 출력 매핑 */}
                                    <td style={{ 
                                        padding: '8px', 
                                        fontWeight: 'bold', 
                                        color: getProfitColor(item.profitRate) 
                                    }}>
                                        {item.profitRate != null 
                                            ? `${item.profitRate > 0 ? '+' : ''}${item.profitRate.toFixed(2)}%` 
                                            : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}









//구코드
// import React from 'react';

// //import { TradeHistoryItem } from './StockExchange'; 
// //👈 부모의 규격서를 수입해옵니다! 위의 코드가 있으면 아래 interface 코드를 대체할 수 있다.

// interface TradeHistoryItem {
//     //역할: 부모가 배달해 준 데이터를 받아서 화면 표(Table)로 그려내는 소비자입니다.
//     //필요성: 부모로부터 배달박스(Props)를 받을 때, 그 안에 들어있는 내용물이 
//     //       주식 이력 리스트(TradeHistoryItem[])라는 것을 미리 알아야 
//     //       테이블 안에서 item.price나 item.quantity 같은 변수를 안전하게 꺼내 쓸 수 있습니다
//     id: number;
//     tradeDate: string;
//     tradeType: string;
//     price: number;
//     quantity: number;
//     totalAmount: number;
// }

// interface TradeTimelineProps {
//     historyList: TradeHistoryItem[]; // 📦 부모로부터 실시간 영수증 택배 상자를 받아옴
// }

// export default function TradeTimeline({ historyList }: TradeTimelineProps): React.JSX.Element {
//     //React.JSX.Element는 리액트(React)에서 "이 함수는 화면에 그려질 HTML 뼈대(JSX 요소)를 반환하는 컴포넌트다"라는 뜻

//     // {/* ======================================================= */ }
//     // {/* 구역 [C] : 📜 대망의 나의 과거 매매 이력 타임라인 리스트 표 (새로 추가) */ }
//     // {/* ======================================================= */ }
//     return (
//         <div style={{ marginTop: '5px' }}>
//             <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>📜 나의 매매 이력 조회 [C]</h4>
//             <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '6px' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
//                     <thead style={{ backgroundColor: '#e9ecef', position: 'sticky', top: 0 }}>
//                         <tr>
//                             <th style={{ padding: '8px' }}>체결일(가상)</th>
//                             <th style={{ padding: '8px' }}>유형</th>
//                             <th style={{ padding: '8px' }}>단가</th>
//                             <th style={{ padding: '8px' }}>수량</th>
//                             <th style={{ padding: '8px' }}>총금액</th>
//                             <th style={{ padding: '8px' }}>수익률</th> {/* 🛠️ 열 확장 */}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {historyList.map((item) => (
//                             <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
//                                 <td style={{ padding: '8px' }}>{item.tradeDate}</td>
//                                 <td style={{ padding: '8px', color: item.tradeType === 'BUY' ? '#dc3545' : '#007bff', fontWeight: 'bold' }}>{item.tradeType}</td>
//                                 <td style={{ padding: '8px' }}>{item.price.toLocaleString()}원</td>
//                                 <td style={{ padding: '8px' }}>{item.quantity}주</td>
//                                 <td style={{ padding: '8px' }}>{item.totalAmount.toLocaleString()}원</td>
//                                 {/* 🛠️ 데이터 출력 매핑 */}
//                                 <td style={{ padding: '8px', fontWeight: 'bold', color: item.profitRate && item.profitRate > 0 ? '#dc3545' : '#007bff' }}>
//                                     {item.profitRate != null ? `${item.profitRate > 0 ? '+' : ''}${item.profitRate.toFixed(2)}%` : '-'}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }