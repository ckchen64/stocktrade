import React, { useRef, useState } from 'react';
import PriceChart from './PriceChart';
import type { CandleData } from './types';

interface ChartWorkspaceProps {
  chartDataList: CandleData[];
  visibleCount?: number;
}

interface IndicatorPanel {
  id: number;
}

const MAX_CHART_COUNT = 4;

export default function ChartWorkspace({
  chartDataList,
  visibleCount = 29,
}: ChartWorkspaceProps): React.JSX.Element {
  const [indicatorPanels, setIndicatorPanels] = useState<IndicatorPanel[]>([]);
  const nextPanelId = useRef(1);

  const totalChartCount = 1 + indicatorPanels.length;
  const canAddChart = totalChartCount < MAX_CHART_COUNT;

  const handleAddChart = () => {
    if (!canAddChart) {
      return;
    }

    const newPanel: IndicatorPanel = {
      id: nextPanelId.current,
    };

    nextPanelId.current += 1;

    setIndicatorPanels((prev) => [...prev, newPanel]);
  };

  const handleDeleteChart = (panelId: number) => {
    setIndicatorPanels((prev) =>
      prev.filter((panel) => panel.id !== panelId)
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
          <div
      style={{
        backgroundColor: 'yellow',
        color: 'red',
        fontWeight: 'bold',
        padding: '10px',
        border: '2px solid red',
      }}
    >
      ★★★ ChartWorkspace 실행 확인 ★★★
    </div>
    
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: '#6c757d',
          }}
        >
          ★★ 테스트 - 총 {totalChartCount}개 / 최대 {MAX_CHART_COUNT}개 ★★
          {/* 총 {totalChartCount}개 / 최대 {MAX_CHART_COUNT}개 */}
        </div>

        <button
          type="button"
          onClick={handleAddChart}
          disabled={!canAddChart}
          style={{
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            cursor: canAddChart ? 'pointer' : 'not-allowed',
            backgroundColor: canAddChart ? '#0d6efd' : '#adb5bd',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          + 차트 추가
        </button>
      </div>

      {/* 차트 1은 가격 전용이며 항상 존재하고 삭제할 수 없습니다. */}
      <PriceChart
        chartDataList={chartDataList}
        visibleCount={visibleCount}
      />

      {/* 2단계에서는 차트 2~4의 추가/삭제 뼈대만 만듭니다.
          다음 단계에서 각 차트별 보조지표 선택 기능을 넣습니다. */}
      {indicatorPanels.map((panel, index) => {
        const displayChartNumber = index + 2;

        return (
          <div
            key={panel.id}
            style={{
              minHeight: '180px',
              padding: '16px',
              border: '1px solid #dee2e6',
              borderRadius: '12px',
              backgroundColor: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '16px',
                }}
              >
                차트 {displayChartNumber} : 보조지표
              </h3>

              <button
                type="button"
                onClick={() => handleDeleteChart(panel.id)}
                style={{
                  border: '1px solid #dc3545',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  backgroundColor: '#fff',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                삭제
              </button>
            </div>

            <div
              style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #ced4da',
                borderRadius: '8px',
                color: '#868e96',
                fontSize: '13px',
              }}
            >
              다음 단계에서 이 차트에 표시할 보조지표를 선택합니다.
            </div>
          </div>
        );
      })}
    </div>
  );
}
