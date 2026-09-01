import React from 'react';

interface DashboardProps {
    data: {
        cash?: number;
        returnRate?: number;
        balanceMoney: number;
        stockQuantity: number;
        averagePrice: number;
        currentPrice: number;
        totalAsset: number;
        evaluationProfit: number;
        evaluationRate: number;
    } | null;
}

export default function AssetDashboard({ data }: DashboardProps): React.JSX.Element {
    if (!data) return <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>자산 데이터 로드 중...</div>;

    const isPlus = data.evaluationProfit > 0;
    const color = data.evaluationProfit === 0 ? '#333' : (isPlus ? '#dc3545' : '#007bff');

    return (
        <div style={{ backgroundColor: '#212529', color: 'white', padding: '18px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: '13px', color: '#adb5bd', marginBottom: '4px' }}>💵 총 자산 평가액</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>{data.totalAsset.toLocaleString()}원</div>
            
            <div style={{ display: 'flex', marginTop: '12px', borderTop: '1px solid #495057', paddingTop: '12px', fontSize: '13.5px' }}>
                <div style={{ flex: 1 }}>
                    <span style={{ color: '#adb5bd' }}>실시간 평가손익: </span>
                    <strong style={{ color: color }}>{isPlus ? '+' : ''}{data.evaluationProfit.toLocaleString()}원</strong>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <span style={{ color: '#adb5bd' }}>수익률: </span>
                    <strong style={{ color: color }}>{isPlus ? '+' : ''}{data.evaluationRate.toFixed(2)}%</strong>
                </div>
            </div>
        </div>
    );
}
